"""
outreach/dashboard/app.py
FastAPIダッシュボード

起動: uvicorn dashboard.app:app --reload --port 8000
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import FastAPI, Query
from fastapi.responses import HTMLResponse, StreamingResponse, Response
from fastapi.staticfiles import StaticFiles
import asyncio
import json
import re
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from db.database import init_db, get_stats, get_send_stats, get_conn, write_log, add_unsubscribe

app = FastAPI(title="Weldex Outreach Dashboard")

# 起動時にDBを初期化
@app.on_event("startup")
def on_startup():
    """アプリ起動時にDBを初期化する。"""
    init_db()


@app.get("/", response_class=HTMLResponse)
def index():
    """ダッシュボードHTMLを返す。"""
    html_path = os.path.join(os.path.dirname(__file__), "templates", "index.html")
    try:
        with open(html_path, encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return HTMLResponse("<h1>index.html が見つかりません</h1>", status_code=404)


@app.get("/api/stats")
def api_stats():
    """収集・診断・送信の統計情報をまとめて返す。"""
    return {**get_stats(), **get_send_stats()}


@app.get("/api/targets")
def api_targets(
    page:     int = Query(1, ge=1),
    per_page: int = Query(15, ge=1, le=100),
    status:   str = Query(None),
    industry: str = Query(None),
    keyword:  str = Query(None),
):
    """
    ターゲット一覧をページネーション付きで返す。

    Args:
        page:     ページ番号（1始まり）
        per_page: 1ページあたりの件数
        status:   サイトステータスでフィルター
        industry: 業種でフィルター
        keyword:  店舗名・住所でキーワード検索
    """
    conditions = []
    params: list = []

    if status:
        conditions.append("site_status = ?")
        params.append(status)
    if industry:
        conditions.append("industry = ?")
        params.append(industry)
    if keyword:
        conditions.append("(name LIKE ? OR address LIKE ?)")
        params.extend([f"%{keyword}%", f"%{keyword}%"])

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    offset = (page - 1) * per_page

    with get_conn() as conn:
        total = conn.execute(
            f"SELECT COUNT(*) FROM targets {where}", params
        ).fetchone()[0]
        rows = conn.execute(
            f"SELECT * FROM targets {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
            params + [per_page, offset]
        ).fetchall()

    return {
        "total":    total,
        "page":     page,
        "per_page": per_page,
        "items":    [dict(r) for r in rows],
    }


@app.get("/api/logs")
def api_logs(
    page:     int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    level:    str = Query(None),
    category: str = Query(None),
):
    """実行ログを返す。"""
    conditions = []
    params: list = []

    if level:
        conditions.append("level = ?")
        params.append(level.upper())
    if category:
        conditions.append("category = ?")
        params.append(category)

    where  = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    offset = (page - 1) * per_page

    with get_conn() as conn:
        total = conn.execute(f"SELECT COUNT(*) FROM run_logs {where}", params).fetchone()[0]
        rows  = conn.execute(
            f"SELECT * FROM run_logs {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
            params + [per_page, offset]
        ).fetchall()

    return {
        "total": total,
        "page":  page,
        "items": [dict(r) for r in rows],
    }


@app.get("/api/logs/stream")
async def api_logs_stream():
    """SSEでログをリアルタイム配信する。"""
    async def event_generator():
        last_id = 0
        while True:
            with get_conn() as conn:
                rows = conn.execute(
                    "SELECT * FROM run_logs WHERE id > ? ORDER BY id ASC LIMIT 20",
                    (last_id,)
                ).fetchall()
            for row in rows:
                last_id = row["id"]
                data = json.dumps(dict(row), ensure_ascii=False)
                yield f"data: {data}\n\n"
            await asyncio.sleep(2)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/proxy")
async def proxy_site(url: str = Query(...)):
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
