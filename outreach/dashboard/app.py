"""
outreach/dashboard/app.py
FastAPIダッシュボード

起動: uvicorn dashboard.app:app --reload --port 8000
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import FastAPI, Query, Body, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, StreamingResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import asyncio
import json
import re
import secrets
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from db.database import init_db, get_stats, get_send_stats, get_conn, write_log, add_unsubscribe, get_send_mode, set_send_mode
from config import DASHBOARD_PASSWORD

app = FastAPI(title="Weldex Outreach Dashboard")
security = HTTPBasic()

def require_auth(credentials: HTTPBasicCredentials = Depends(security)):
    """DASHBOARD_PASSWORDが設定されている場合はBasic認証を要求する。"""
    if not DASHBOARD_PASSWORD:
        return  # 未設定なら認証スキップ（ローカル開発用）
    ok = (
        secrets.compare_digest(credentials.username.encode(), b"weldex") and
        secrets.compare_digest(credentials.password.encode(), DASHBOARD_PASSWORD.encode())
    )
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証に失敗しました",
            headers={"WWW-Authenticate": "Basic"},
        )

# 起動時にDBを初期化
@app.on_event("startup")
def on_startup():
    """アプリ起動時にDBを初期化し、接続情報をログ出力する。"""
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("weldex")

    init_db()

    # ── 起動診断ログ（Railway Logs で確認可能）──
    try:
        from db.database import DATABASE_URL
        import psycopg2
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM targets")
                count = cur.fetchone()[0]
        # DATABASE_URL からホスト部分だけ表示（パスワードは隠す）
        db_host = DATABASE_URL.split("@")[-1].split("/")[0] if "@" in DATABASE_URL else "unknown"
        logger.info(f"[STARTUP] PostgreSQL接続先: {db_host}")
        logger.info(f"[STARTUP] targets テーブル: {count} 件")
    except Exception as e:
        logger.error(f"[STARTUP] DB確認エラー: {e}")


@app.get("/", response_class=HTMLResponse)
def index(auth=Depends(require_auth)):
    """ダッシュボードHTMLを返す。"""
    html_path = os.path.join(os.path.dirname(__file__), "templates", "index.html")
    try:
        with open(html_path, encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return HTMLResponse("<h1>index.html が見つかりません</h1>", status_code=404)


@app.get("/version")
def version():
    """デプロイバージョン確認用（認証不要）。"""
    import hashlib
    html_path = os.path.join(os.path.dirname(__file__), "templates", "index.html")
    try:
        with open(html_path, encoding="utf-8") as f:
            content = f.read()
        h = hashlib.md5(content.encode()).hexdigest()[:8]
        has_rediagnose = "btn-rediagnose" in content
        return {
            "html_hash":       h,
            "has_rediagnose":  has_rediagnose,
            "git_commit":      os.environ.get("RAILWAY_GIT_COMMIT_SHA", "unknown")[:8],
            "deploy_id":       os.environ.get("RAILWAY_DEPLOYMENT_ID", "unknown"),
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/stats")
def api_stats(auth=Depends(require_auth)):
    """収集・診断・送信の統計情報をまとめて返す。"""
    return {**get_stats(), **get_send_stats()}


@app.get("/api/targets")
def api_targets(
    auth=Depends(require_auth),
    page:     int = Query(1, ge=1),
    per_page: int = Query(15, ge=1, le=100),
    status:   str = Query(None),
    industry: str = Query(None),
    keyword:  str = Query(None),
):
    """ターゲット一覧をページネーション付きで返す。"""
    import psycopg2.extras
    conditions = []
    params: list = []

    if status:
        conditions.append("site_status = %s")
        params.append(status)
    if industry:
        conditions.append("industry = %s")
        params.append(industry)
    if keyword:
        conditions.append("(name ILIKE %s OR address ILIKE %s)")
        params.extend([f"%{keyword}%", f"%{keyword}%"])

    where  = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    offset = (page - 1) * per_page

    with get_conn() as conn:
        # COUNT は通常カーソル（RealDictCursor は [0] インデックスが使えないため分離）
        with conn.cursor() as cnt_cur:
            cnt_cur.execute(f"SELECT COUNT(*) FROM targets {where}", params)
            total = cnt_cur.fetchone()[0]
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                f"SELECT * FROM targets {where} ORDER BY created_at DESC LIMIT %s OFFSET %s",
                params + [per_page, offset]
            )
            rows = cur.fetchall()

    return {
        "total":    total,
        "page":     page,
        "per_page": per_page,
        "items":    [dict(r) for r in rows],
    }


@app.post("/api/targets")
def api_targets_create(
    auth=Depends(require_auth),
    body: dict = Body(...),
):
    """ターゲットを手動で新規作成する（ダミーデータ投入・手動追加用）。"""
    name = (body.get("name") or "").strip()
    if not name:
        return {"ok": False, "error": "店舗名は必須です"}

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO targets
                    (name, address, phone, website, email, industry, area,
                     site_status, send_status)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'pending')
                RETURNING id
                """,
                (
                    name,
                    body.get("address"),
                    body.get("phone"),
                    body.get("website"),
                    body.get("email"),
                    body.get("industry"),
                    body.get("area"),
                    body.get("site_status", "unchecked"),
                ),
            )
            new_id = cur.fetchone()[0]
        conn.commit()

    write_log("INFO", "system", f"手動ターゲット追加: {name} (id={new_id})")
    return {"ok": True, "id": new_id}


@app.get("/api/logs")
def api_logs(
    auth=Depends(require_auth),
    page:     int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    level:    str = Query(None),
    category: str = Query(None),
):
    """実行ログを返す。"""
    import psycopg2.extras
    conditions = []
    params: list = []

    if level:
        conditions.append("level = %s")
        params.append(level.upper())
    if category:
        conditions.append("category = %s")
        params.append(category)

    where  = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    offset = (page - 1) * per_page

    with get_conn() as conn:
        # COUNT は通常カーソル（RealDictCursor は [0] インデックスが使えないため分離）
        with conn.cursor() as cnt_cur:
            cnt_cur.execute(f"SELECT COUNT(*) FROM run_logs {where}", params)
            total = cnt_cur.fetchone()[0]
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                f"SELECT * FROM run_logs {where} ORDER BY created_at DESC LIMIT %s OFFSET %s",
                params + [per_page, offset]
            )
            rows = cur.fetchall()

    return {
        "total": total,
        "page":  page,
        "items": [dict(r) for r in rows],
    }


@app.get("/api/logs/stream")
async def api_logs_stream(auth=Depends(require_auth)):
    """SSEでログをリアルタイム配信する。"""
    import psycopg2.extras
    async def event_generator():
        last_id = 0
        while True:
            with get_conn() as conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                    cur.execute(
                        "SELECT * FROM run_logs WHERE id > %s ORDER BY id ASC LIMIT 20",
                        (last_id,)
                    )
                    rows = cur.fetchall()
            for row in rows:
                last_id = row["id"]
                data = json.dumps(dict(row), ensure_ascii=False, default=str)
                yield f"data: {data}\n\n"
            await asyncio.sleep(2)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/proxy")
async def proxy_site(url: str = Query(...), auth=Depends(require_auth)):
    """
    外部サイトをiframe表示するためのプロキシ。
    X-Frame-Options / Content-Security-Policy ヘッダーを除去して返す。

    Args:
        url: 取得する外部URL
    """
    import requests as req

    if not url.startswith(("http://", "https://")):
        return Response(content="Invalid URL", status_code=400)

    def _fetch():
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,*/*;q=0.9",
            "Accept-Language": "ja,en;q=0.9",
        }
        return req.get(url, headers=headers, timeout=10, verify=False, allow_redirects=True)

    try:
        resp = await asyncio.to_thread(_fetch)

        content_type = resp.headers.get("content-type", "text/html; charset=utf-8")
        content = resp.content

        # HTMLの場合は<base href>を挿入して相対パスを解決
        if "text/html" in content_type:
            try:
                html = resp.text
                base_tag = f'<base href="{url}" target="_self">'
                html = re.sub(
                    r'(<head[^>]*>)', r'\1' + base_tag, html, count=1, flags=re.IGNORECASE
                )
                encoding = resp.encoding or "utf-8"
                content = html.encode(encoding, errors="replace")
            except Exception:
                pass

        return Response(
            content=content,
            headers={"Content-Type": content_type, "Access-Control-Allow-Origin": "*"},
        )

    except Exception as e:
        error_html = (
            "<html><body style='font-family:sans-serif;padding:2rem;color:#64748b'>"
            f"<p>サイトの読み込みに失敗しました</p><p style='font-size:0.75rem'>{str(e)[:120]}</p>"
            "</body></html>"
        )
        return Response(content=error_html, media_type="text/html", status_code=200)


@app.get("/api/preview-queue")
def api_preview_queue(limit: int = Query(50), auth=Depends(require_auth)):
    """
    送信候補ターゲットの予想メールプレビューを返す。
    実際の送信はしない。scheduler.py run を実行するまで送信されない。

    Returns:
        total・items（id/name/email/industry/site_status/template/subject/body）
    """
    from mailers.templates import get_template

    TEMPLATE_BY_STATUS = {
        "none":      "A",
        "old":       "B",
        "no_mobile": "B",
        "phone_only":"C",
    }

    with get_conn() as conn:
        # init_db() でマイグレーション済みのカラムのみ使用
        init_db()
        rows = conn.execute("""
            SELECT id, name, email, industry, site_status
            FROM targets
            WHERE email IS NOT NULL AND email != ''
              AND send_status = 'pending'
              AND site_status IN ('none','old','no_mobile','phone_only')
            ORDER BY
              CASE site_status
                WHEN 'phone_only' THEN 1
                WHEN 'none'       THEN 2
                WHEN 'no_mobile'  THEN 3
                WHEN 'old'        THEN 4
                ELSE 5
              END, id ASC
            LIMIT ?
        """, (limit,)).fetchall()

    items = []
    for row in rows:
        t    = dict(row)
        tmpl = TEMPLATE_BY_STATUS.get(t["site_status"], "A")
        try:
            mail = get_template(
                tmpl, t["name"], t["email"],
                industry    = t.get("industry") or "事業者",
                site_status = t.get("site_status", ""),
            )
            items.append({
                "id":          t["id"],
                "name":        t["name"],
                "email":       t["email"],
                "industry":    t["industry"],
                "site_status": t["site_status"],
                "template":    tmpl,
                "subject":     mail["subject"],
                "body":        mail["body"],
            })
        except Exception:
            continue

    return {"total": len(items), "items": items}


@app.get("/unsubscribe", response_class=HTMLResponse)
def unsubscribe(email: str = Query(None)):
    """
    配信停止エンドポイント（特定電子メール法対応）。
    メール文面のリンクからアクセスされる。
    """
    if not email:
        return HTMLResponse("<h2>メールアドレスが指定されていません</h2>", status_code=400)

    add_unsubscribe(email)
    write_log("INFO", "system", f"配信停止登録: {email}")

    return HTMLResponse(f"""<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<title>配信停止完了 | Weldex</title>
<style>
  body {{ font-family: sans-serif; display: flex; align-items: center; justify-content: center;
         min-height: 100vh; background: #f8f9fc; margin: 0; }}
  .box {{ background: white; padding: 2.5rem 3rem; text-align: center; border: 1px solid #e2e8f0; max-width: 480px; }}
  h1 {{ font-size: 1.2rem; color: #0c1a35; margin-bottom: 1rem; }}
  p  {{ font-size: 0.88rem; color: #64748b; line-height: 1.7; }}
</style>
</head><body>
<div class="box">
  <h1>配信停止が完了しました</h1>
  <p>{email} への送信を停止しました。<br>今後このメールアドレスへのご連絡はいたしません。</p>
  <p style="margin-top:1.5rem;font-size:0.78rem;color:#94a3b8;">Weldex（info@weldex.jp）</p>
</div>
</body></html>""")


# ─── 収集・診断 APIエンドポイント ──────────────────────────────────────────────

from collectors.area_config import INDUSTRY_KEYWORDS, AREA_CONFIG, get_all_areas


@app.get("/api/debug")
def api_debug(auth=Depends(require_auth)):
    """DB接続・レコード数を返す診断エンドポイント。"""
    from db.database import DATABASE_URL
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM targets")
                total = cur.fetchone()[0]
                cur.execute("SELECT COUNT(*) FROM targets WHERE site_status='unchecked'")
                unchecked = cur.fetchone()[0]
                cur.execute("""
                    SELECT COUNT(*) FROM targets
                    WHERE created_at::date = (NOW() AT TIME ZONE 'Asia/Tokyo')::date
                """)
                today = cur.fetchone()[0]
        db_host = DATABASE_URL.split("@")[-1].split("/")[0] if "@" in DATABASE_URL else "not set"
        return {
            "db_engine":  "postgresql",
            "db_host":    db_host,
            "total":      total,
            "unchecked":  unchecked,
            "today":      today,
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/options")
def api_options(auth=Depends(require_auth)):
    """業種・エリアの選択肢を返す（都道府県グループ付き）。"""
    return {
        "industries":    list(INDUSTRY_KEYWORDS.keys()),
        "areas_grouped": {pref: cities for pref, cities in AREA_CONFIG.items()},
        "areas":         get_all_areas(),  # 後方互換
    }


@app.get("/api/daily-quota")
def api_daily_quota(auth=Depends(require_auth)):
    """本日の収集件数と上限を返す。"""
    from config import DEFAULT_LIMIT
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT COUNT(*) FROM targets
                WHERE created_at::date = (NOW() AT TIME ZONE 'Asia/Tokyo')::date
            """)
            today_count = cur.fetchone()[0]
    return {
        "today":     today_count,
        "limit":     DEFAULT_LIMIT,
        "remaining": max(0, DEFAULT_LIMIT - today_count),
        "locked":    today_count >= DEFAULT_LIMIT,
    }


@app.post("/api/collect")
async def api_collect(
    auth=Depends(require_auth),
    industries: list[str] = Body(..., embed=True),
    areas:      list[str] = Body(..., embed=True),
):
    """
    ダッシュボードから複数業種×複数エリアでリスト収集を実行する。
    1日の上限（DEFAULT_LIMIT）を超えている場合はエラーを返す。
    選択された業種×エリアの全組み合わせを順に収集し、残り枠を使い切ったら停止する。
    """
    from collectors.google_places import collect_targets
    from config import DEFAULT_LIMIT

    if not industries or not areas:
        return {"ok": False, "error": "業種とエリアを1つ以上選択してください。"}

    # 本日の収集件数チェック
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT COUNT(*) FROM targets
                WHERE created_at::date = (NOW() AT TIME ZONE 'Asia/Tokyo')::date
            """)
            today_count = cur.fetchone()[0]

    if today_count >= DEFAULT_LIMIT:
        return {
            "ok":     False,
            "locked": True,
            "today":  today_count,
            "limit":  DEFAULT_LIMIT,
            "error":  f"本日の収集上限（{DEFAULT_LIMIT}件）に達しています。明日またお試しください。",
        }

    remaining    = DEFAULT_LIMIT - today_count
    total_added  = 0
    combinations = len(industries) * len(areas)

    write_log("INFO", "collect",
              f"[dashboard] 収集開始: {len(industries)}業種×{len(areas)}エリア"
              f"={combinations}組み合わせ / 残り枠{remaining}件")

    try:
        for industry in industries:
            for area in areas:
                if total_added >= remaining:
                    break
                left = remaining - total_added
                # 1組み合わせあたりの上限は残り枠か DEFAULT_LIMIT の小さい方
                n = await asyncio.to_thread(collect_targets, industry, area, min(left, DEFAULT_LIMIT))
                total_added += n
                if n > 0:
                    write_log("INFO", "collect", f"[dashboard] {industry}/{area}: {n}件追加")
            if total_added >= remaining:
                break

        from db.database import get_stats
        stats     = get_stats()
        new_today = today_count + total_added
        write_log("INFO", "collect",
                  f"[dashboard] 収集完了: {total_added}件追加 / 本日計{new_today}件")
        return {
            "ok":     True,
            "added":  total_added,
            "total":  stats["total"],
            "today":  new_today,
            "limit":  DEFAULT_LIMIT,
            "locked": new_today >= DEFAULT_LIMIT,
        }
    except Exception as e:
        write_log("ERROR", "collect", f"[dashboard] 収集エラー: {e}")
        return {"ok": False, "error": str(e)}


@app.post("/api/diagnose")
async def api_diagnose(
    auth=Depends(require_auth),
    limit: int = Body(50, embed=True)):
    """
    ダッシュボードからサイト診断を実行する。
    未診断ターゲットを limit 件処理してステータスを更新する。
    """
    from analyzers.site_checker import check_site
    from db.database import get_unchecked_targets, update_site_status, get_stats

    try:
        targets = get_unchecked_targets(limit=limit)
        if not targets:
            return {"ok": True, "diagnosed": 0, "message": "未診断のターゲットはありません"}

        write_log("INFO", "diagnose", f"[dashboard] 診断開始: {len(targets)}件")

        results = {"none": 0, "old": 0, "no_mobile": 0, "phone_only": 0, "ok": 0, "error": 0}
        email_found = 0   # このバッチで新たにメールが取れた件数
        form_found  = 0   # このバッチでフォームURLが取れた件数

        for t in targets:
            r = await asyncio.to_thread(check_site, t["website"] or "", t.get("industry") or "")
            update_site_status(
                t["id"],
                r.get("status", "error"),
                email              = r.get("email"),
                has_line           = r.get("has_line"),
                has_online_booking = r.get("has_online_booking"),
                phone_only         = r.get("phone_only"),
                has_ssl            = r.get("has_ssl"),
                has_contact_form   = r.get("has_contact_form"),
                contact_form_url   = r.get("contact_form_url"),
            )
            st = r.get("status", "error")
            results[st] = results.get(st, 0) + 1
            if r.get("email"):            email_found += 1
            if r.get("contact_form_url"): form_found  += 1

        stats = get_stats()
        write_log(
            "INFO", "diagnose",
            f"[dashboard] 診断完了: {len(targets)}件 / メール{email_found}件 / フォーム{form_found}件"
        )
        return {
            "ok": True, "diagnosed": len(targets), "results": results,
            "email_found": email_found, "form_found": form_found, "stats": stats,
        }
    except Exception as e:
        write_log("ERROR", "diagnose", f"[dashboard] 診断エラー: {e}")
        return {"ok": False, "error": str(e)}


# ─── 顧客リスト API ────────────────────────────────────────────────────────────

@app.get("/api/customers")
def api_customers(
    auth=Depends(require_auth),
    page:     int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status:   str = Query(None),
    keyword:  str = Query(None),
):
    """顧客リストをページネーション付きで返す。ターゲット情報も結合して返す。"""
    import psycopg2.extras
    conditions = []
    params: list = []

    if status:
        conditions.append("c.status = %s")
        params.append(status)
    if keyword:
        conditions.append("(c.company ILIKE %s OR c.contact_name ILIKE %s OR c.email ILIKE %s)")
        params.extend([f"%{keyword}%", f"%{keyword}%", f"%{keyword}%"])

    where  = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    offset = (page - 1) * per_page

    with get_conn() as conn:
        with conn.cursor() as cnt_cur:
            cnt_cur.execute(f"SELECT COUNT(*) FROM outreach_customers c {where}", params)
            total = cnt_cur.fetchone()[0]
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                f"""
                SELECT c.*,
                       t.site_status  AS target_site_status,
                       t.address      AS target_address,
                       t.area         AS target_area
                FROM outreach_customers c
                LEFT JOIN targets t ON c.target_id = t.id
                {where}
                ORDER BY c.created_at DESC
                LIMIT %s OFFSET %s
                """,
                params + [per_page, offset],
            )
            rows = cur.fetchall()

    return {
        "total":    total,
        "page":     page,
        "per_page": per_page,
        "items":    [dict(r) for r in rows],
    }


@app.get("/api/customers/{customer_id}")
def api_customers_get(
    customer_id: int,
    auth=Depends(require_auth),
):
    """顧客の詳細情報をターゲット情報も含めて返す。"""
    import psycopg2.extras
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT c.*,
                       t.name        AS target_name,
                       t.address     AS target_address,
                       t.area        AS target_area,
                       t.website     AS target_website,
                       t.site_status AS target_site_status,
                       t.has_line,
                       t.has_ssl,
                       t.has_online_booking,
                       t.has_contact_form,
                       t.phone_only
                FROM outreach_customers c
                LEFT JOIN targets t ON c.target_id = t.id
                WHERE c.id = %s
                """,
                (customer_id,),
            )
            row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="顧客が見つかりません")
    return dict(row)


@app.post("/api/customers")
def api_customers_create(
    auth=Depends(require_auth),
    body: dict = Body(...),
):
    """顧客を新規作成する。target_id を渡すとターゲットから情報を引き継ぐ。"""
    target_id = body.get("target_id")

    # target_id がある場合はターゲット情報を補完
    if target_id:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT name, phone, email, industry FROM targets WHERE id = %s",
                    (target_id,)
                )
                row = cur.fetchone()
                if row:
                    body.setdefault("company",      row[0])
                    body.setdefault("phone",         row[1])
                    body.setdefault("email",         row[2])
                    body.setdefault("industry",      row[3])
                # ターゲットに顧客化フラグを立てる
                cur.execute(
                    "UPDATE targets SET send_status = '顧客化' WHERE id = %s",
                    (target_id,)
                )
            conn.commit()

    company = body.get("company", "").strip()
    if not company:
        return {"ok": False, "error": "会社名は必須です"}

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO outreach_customers
                    (target_id, company, contact_name, phone, email, industry,
                     source, status, contract_amount, services, memo)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                RETURNING id
                """,
                (
                    target_id,
                    company,
                    body.get("contact_name"),
                    body.get("phone"),
                    body.get("email"),
                    body.get("industry"),
                    body.get("source", "営業リスト"),
                    body.get("status", "商談中"),
                    body.get("contract_amount"),
                    body.get("services", ""),
                    body.get("memo", ""),
                ),
            )
            new_id = cur.fetchone()[0]
        conn.commit()

    write_log("INFO", "customer", f"顧客化: {company} (id={new_id}, target_id={target_id})")
    return {"ok": True, "id": new_id}


@app.delete("/api/customers/{customer_id}")
def api_customers_delete(
    customer_id: int,
    auth=Depends(require_auth),
):
    """顧客化を解除する。顧客レコードを削除し、元ターゲットの send_status を pending に戻す。"""
    with get_conn() as conn:
        with conn.cursor() as cur:
            # 紐づいている target_id を取得
            cur.execute("SELECT target_id, company FROM outreach_customers WHERE id = %s", (customer_id,))
            row = cur.fetchone()
            if not row:
                return {"ok": False, "error": "顧客が見つかりません"}
            target_id, company = row

            # 顧客レコードを削除
            cur.execute("DELETE FROM outreach_customers WHERE id = %s", (customer_id,))

            # 元ターゲットのステータスを pending に戻す
            if target_id:
                cur.execute(
                    "UPDATE targets SET send_status = 'pending' WHERE id = %s",
                    (target_id,)
                )
        conn.commit()

    write_log("INFO", "customer", f"顧客化解除: {company} (id={customer_id}, target_id={target_id})")
    return {"ok": True}


@app.patch("/api/customers/{customer_id}")
def api_customers_update(
    customer_id: int,
    auth=Depends(require_auth),
    body: dict = Body(...),
):
    """顧客情報（ステータス・メモ・契約金額など）を更新する。"""
    allowed = {"status", "memo", "contract_amount", "services",
               "contact_name", "phone", "email", "contracted_at",
               "president_name", "direct_phone", "next_action", "last_contact_at"}
    sets   = []
    values = []
    for key in allowed:
        if key in body:
            sets.append(f"{key} = %s")
            values.append(body[key])

    if not sets:
        return {"ok": False, "error": "更新項目なし"}

    values.append(customer_id)
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE outreach_customers SET {', '.join(sets)} WHERE id = %s",
                values,
            )
        conn.commit()
    return {"ok": True}


# ─── Claude AI 営業メール自動生成 ────────────────────────────────────────────

# ステータス → 日本語ラベル
_STATUS_LABEL: dict[str, str] = {
    "none":       "WEBサイトなし",
    "old":        "サイトが古い・古い技術を使用",
    "no_mobile":  "スマホ非対応",
    "phone_only": "電話のみ（WEB予約・フォームなし）",
    "ok":         "サイトあり（改善余地あり）",
    "error":      "サイト取得エラー",
    "unchecked":  "未診断",
}

_GENERATE_EMAIL_SYSTEM_PROMPT = """\
あなたはWeldex（ウェルデックス）の営業担当・成田涼真です。

【Weldexのサービス】
- WEBサイト制作（AIを活用し大手比1/3以下のコスト）
- LINE予約システム・WEB予約システム
- 業務システム開発
- 保守・運用サポート
- 特徴：医療・歯科・士業・建設など、社内エンジニアのいない中小企業に特化

【メール作成ルール】
1. 日本語ビジネスメール形式（丁寧かつ簡潔）
2. 構成：「問題提起 → 解決策の提示 → 相談の誘い」の3段構成
3. 件名は30文字以内
4. 本文は250〜380字程度（読みやすく・押しつけがましくなく）
5. 「診断詳細」に書かれた具体的な問題点を1〜2行で言及する
6. フッター（特定電子メール法対応）は出力しない（後で自動付与される）
7. 必ず以下のJSON形式のみを返すこと：
   {"subject": "件名", "body": "本文"}
8. JSON以外のテキストを一切含めない
"""


@app.post("/api/generate-email")
async def api_generate_email(
    auth=Depends(require_auth),
    body: dict = Body(...),
):
    """
    Claude AI（Haiku）を使って対象企業へのパーソナライズ営業メールを生成する。

    Request body:
        target_id (int, optional): ターゲットID（DBから追加情報を補完）
        name      (str): 会社名・店舗名
        industry  (str): 業種
        area      (str): エリア
        site_status (str): 診断ステータス
        detail    (str): 診断詳細テキスト
        has_line  (bool|None)
        has_online_booking (bool|None)
        is_medical (bool)

    Returns:
        ok      (bool)
        subject (str): 生成された件名
        body    (str): 生成された本文（フッターなし）
        model   (str): 使用したモデル名
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"ok": False, "error": "ANTHROPIC_API_KEY が設定されていません。Railway の環境変数を確認してください。"}

    # ── ターゲット情報を整理 ────────────────────────────────────────────────
    name        = (body.get("name") or "").strip()
    industry    = (body.get("industry") or "事業者").strip()
    area        = (body.get("area") or "").strip()
    site_status = (body.get("site_status") or "unchecked").strip()
    detail      = (body.get("detail") or "").strip()
    has_line    = body.get("has_line")
    has_booking = body.get("has_online_booking")
    is_medical  = body.get("is_medical", False)

    # target_id があればDBから最新情報を補完
    target_id = body.get("target_id")
    if target_id:
        try:
            import psycopg2.extras
            with get_conn() as conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                    cur.execute(
                        "SELECT name,industry,area,site_status,has_line,has_online_booking FROM targets WHERE id=%s",
                        (target_id,),
                    )
                    row = cur.fetchone()
                    if row:
                        row = dict(row)
                        name        = name        or row.get("name", name)
                        industry    = industry    or row.get("industry", industry)
                        area        = area        or row.get("area", area)
                        site_status = site_status or row.get("site_status", site_status)
                        if has_line    is None: has_line    = row.get("has_line")
                        if has_booking is None: has_booking = row.get("has_online_booking")
        except Exception:
            pass  # DB補完失敗はサイレント（渡されたパラメータで続行）

    if not name:
        return {"ok": False, "error": "会社名が指定されていません"}

    # ── プロンプトのユーザー部分を構築 ─────────────────────────────────────
    from mailers.templates import select_template_key, is_medical as check_medical
    is_medical = is_medical or check_medical(industry)
    tmpl_key   = select_template_key(site_status, industry)

    tmpl_label = {
        "A": "サイトなし → WEB集客機会損失の訴求",
        "B": "古い/スマホ非対応 → サイト改善・SEO低下リスクの訴求",
        "C": "電話のみ（一般）→ 24時間WEB予約導入の訴求",
        "D": "電話のみ（医療系）→ LINE予約・無断キャンセル削減・新患獲得の訴求",
    }

    line_str    = "あり" if has_line    is True else ("なし" if has_line    is False else "不明")
    booking_str = "あり" if has_booking is True else ("なし" if has_booking is False else "不明")

    user_message = f"""\
【営業先情報】
会社名・店舗名: {name}
業種: {industry}
エリア: {area or "不明"}
医療系: {"はい" if is_medical else "いいえ"}

【サイト診断結果】
ステータス: {_STATUS_LABEL.get(site_status, site_status)}
診断詳細: {detail or "詳細なし"}
LINE連携: {line_str}
オンライン予約: {booking_str}

【推奨アプローチ】
{tmpl_label.get(tmpl_key, tmpl_key)}

上記の情報をもとに、{name}への営業メールを生成してください。
診断詳細に書かれた具体的な問題点を本文で自然に言及し、
Weldexのサービスで解決できることを簡潔に伝えてください。
"""

    # ── Claude API 呼び出し ────────────────────────────────────────────────
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)

        message = await asyncio.to_thread(
            lambda: client.messages.create(
                model="claude-3-5-haiku-20241022",
                max_tokens=1024,
                system=_GENERATE_EMAIL_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_message}],
            )
        )

        raw_text = message.content[0].text.strip()

        # ── JSON パース ────────────────────────────────────────────────────
        # Claude が ```json ... ``` で囲む場合もあるので除去
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text, flags=re.DOTALL).strip()

        try:
            result = json.loads(cleaned)
            subject = result.get("subject", "")
            mail_body = result.get("body", "")
        except json.JSONDecodeError:
            # JSON失敗時は subject/body を正規表現で抽出
            subject_match = re.search(r'"subject"\s*:\s*"([^"]+)"', cleaned)
            body_match    = re.search(r'"body"\s*:\s*"([\s\S]+?)"\s*}', cleaned)
            subject   = subject_match.group(1) if subject_match else "件名の生成に失敗しました"
            mail_body = body_match.group(1).replace("\\n", "\n") if body_match else cleaned

        if not subject or not mail_body:
            return {"ok": False, "error": "生成結果のパースに失敗しました", "raw": raw_text[:300]}

        write_log("INFO", "ai", f"メール生成完了: {name} / テンプレ:{tmpl_key} / 件名:{subject}")

        return {
            "ok":      True,
            "subject": subject,
            "body":    mail_body,
            "model":   "claude-3-5-haiku-20241022",
            "template_key": tmpl_key,
        }

    except Exception as e:
        write_log("ERROR", "ai", f"メール生成エラー: {name} / {e}")
        return {"ok": False, "error": f"API呼び出しエラー: {str(e)}"}


# ─── 送信モード管理 ───────────────────────────────────────────────────────────

@app.get("/api/send-mode")
def api_get_send_mode(auth=Depends(require_auth)):
    """
    現在の送信モードを返す。
    manual = 確認して送信（デフォルト）
    auto   = 自動送信
    """
    mode = get_send_mode()
    return {
        "mode":        mode,
        "label":       "確認して送信" if mode == "manual" else "自動送信",
        "description": "メールは承認後に送信されます" if mode == "manual" else "スケジューラーが自動送信します（1日50件上限）",
    }


@app.post("/api/send-mode")
def api_set_send_mode(auth=Depends(require_auth), body: dict = Body(...)):
    """
    送信モードを切り替える。
    body: { "mode": "manual" | "auto" }
    """
    mode = body.get("mode", "manual")
    if mode not in ("manual", "auto"):
        raise HTTPException(status_code=400, detail="mode は 'manual' または 'auto' を指定してください")
    set_send_mode(mode)
    write_log("INFO", "system", f"送信モード変更: {mode}")
    return {"ok": True, "mode": mode}


# ─── 送信キュー（承認待ち一覧・承認・却下） ────────────────────────────────────

@app.get("/api/send-queue")
def api_send_queue(
    auth=Depends(require_auth),
    page:     int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    approval: str = Query(None),  # pending / approved / rejected / all
):
    """
    送信キューの一覧を返す。メールのプレビュー（件名・本文）も含む。

    approval フィルタ:
        pending  = 承認待ち（デフォルト）
        approved = 承認済み
        rejected = 却下済み
        all      = 全件
    """
    import psycopg2.extras
    from mailers.templates import get_template, select_template_key

    approval_filter = approval or "pending"

    conditions = []
    params: list = []
    if approval_filter != "all":
        conditions.append("q.approval_status = %s")
        params.append(approval_filter)

    where  = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    offset = (page - 1) * per_page

    with get_conn() as conn:
        with conn.cursor() as cnt_cur:
            cnt_cur.execute(
                f"SELECT COUNT(*) FROM send_queue q {where}", params
            )
            total = cnt_cur.fetchone()[0]

        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                f"""
                SELECT q.*,
                       t.name         AS target_name,
                       t.email        AS target_email,
                       t.industry     AS target_industry,
                       t.area         AS target_area,
                       t.site_status  AS target_site_status,
                       t.has_line,
                       t.has_online_booking,
                       t.phone_only,
                       t.phone        AS target_phone
                FROM send_queue q
                JOIN targets t ON q.target_id = t.id
                {where}
                ORDER BY q.priority DESC, q.id ASC
                LIMIT %s OFFSET %s
                """,
                params + [per_page, offset],
            )
            rows = cur.fetchall()

    items = []
    for r in rows:
        row = dict(r)
        # メールプレビューを生成（override があればそれを使う）
        subject = row.get("subject_override") or ""
        body    = row.get("body_override")    or ""
        if not subject or not body:
            try:
                tmpl_key = select_template_key(
                    row.get("target_site_status", ""),
                    row.get("target_industry", ""),
                )
                mail = get_template(
                    row.get("template") or tmpl_key,
                    row["target_name"],
                    row["target_email"] or "",
                    industry    = row.get("target_industry") or "事業者",
                    site_status = row.get("target_site_status") or "",
                )
                subject = subject or mail["subject"]
                body    = body    or mail["body"]
            except Exception:
                subject = subject or "(件名生成失敗)"
                body    = body    or ""

        row["preview_subject"] = subject
        row["preview_body"]    = body
        items.append(row)

    return {
        "total":    total,
        "page":     page,
        "per_page": per_page,
        "mode":     get_send_mode(),
        "items":    items,
    }


@app.post("/api/send-queue/{queue_id}/approve")
def api_approve_queue(
    queue_id: int,
    auth=Depends(require_auth),
    body: dict = Body(default={}),
):
    """
    キューアイテムを承認する。
    確認して送信モードでは承認後に即送信（SendGrid API を呼び出す）。
    body: { subject_override?: str, body_override?: str }
    """
    from mailers.sender import send_email
    from mailers.templates import get_template, select_template_key
    import psycopg2.extras

    subject_override = body.get("subject_override")
    body_override    = body.get("body_override")

    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT q.*,
                       t.name     AS target_name,
                       t.email    AS target_email,
                       t.industry AS target_industry,
                       t.site_status
                FROM send_queue q
                JOIN targets t ON q.target_id = t.id
                WHERE q.id = %s AND q.status = 'waiting'
                """,
                (queue_id,),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="キューアイテムが見つかりません（すでに処理済みの可能性）")

    row = dict(row)
    name     = row["target_name"]
    email    = row["target_email"]
    industry = row.get("target_industry") or "事業者"

    if not email:
        raise HTTPException(status_code=400, detail=f"{name} のメールアドレスが登録されていません")

    # 件名・本文を確定（override → テンプレート生成の順）
    if subject_override and body_override:
        subject = subject_override
        mail_body = body_override
    else:
        tmpl_key = select_template_key(row.get("site_status", ""), industry)
        mail = get_template(
            row.get("template") or tmpl_key,
            name, email,
            industry    = industry,
            site_status = row.get("site_status") or "",
        )
        subject   = subject_override or mail["subject"]
        mail_body = body_override    or mail["body"]

    # 送信実行
    try:
        send_result = send_email(
            to_email = email,
            subject  = subject,
            body     = mail_body,
        )
        if not send_result.get("ok"):
            raise Exception(send_result.get("error", "送信失敗"))
    except Exception as e:
        write_log("ERROR", "send", f"承認送信失敗: {name} / {e}")
        raise HTTPException(status_code=500, detail=f"送信失敗: {str(e)}")

    # DB更新
    from db.database import mark_queue_sent
    mark_queue_sent(queue_id, row["target_id"], email, row.get("template", "B"), subject)

    # 承認済みフラグを立てる
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE send_queue
                SET approval_status  = 'approved',
                    approved_at      = NOW() AT TIME ZONE 'Asia/Tokyo',
                    subject_override = %s,
                    body_override    = %s
                WHERE id = %s
                """,
                (subject, mail_body, queue_id),
            )
        conn.commit()

    write_log("INFO", "send", f"承認送信完了: {name} ({email}) / 件名: {subject}")
    return {"ok": True, "sent_to": email, "subject": subject}


@app.post("/api/send-queue/{queue_id}/reject")
def api_reject_queue(
    queue_id: int,
    auth=Depends(require_auth),
    body: dict = Body(default={}),
):
    """
    キューアイテムを却下する。送信せずにキューから外す。
    body: { reason?: str }
    """
    reason = (body.get("reason") or "手動却下").strip()

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE send_queue
                SET approval_status = 'rejected',
                    rejected_at     = NOW() AT TIME ZONE 'Asia/Tokyo',
                    reject_reason   = %s,
                    status          = 'rejected'
                WHERE id = %s
                RETURNING target_id
                """,
                (reason, queue_id),
            )
            row = cur.fetchone()
            if row:
                # ターゲットの send_status を pending に戻す（再送可能にする）
                cur.execute(
                    "UPDATE targets SET send_status = 'pending' WHERE id = %s AND send_status = 'queued'",
                    (row[0],),
                )
        conn.commit()

    if not row:
        raise HTTPException(status_code=404, detail="キューアイテムが見つかりません")

    write_log("INFO", "send", f"却下: queue_id={queue_id} / 理由: {reason}")
    return {"ok": True}
