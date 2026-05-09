"""
outreach/dashboard/app.py
FastAPIダッシュボード

起動: uvicorn dashboard.app:app --reload --port 8000
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import FastAPI, Query
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
import asyncio
import json

from db.database import init_db, get_stats, get_send_stats, get_conn, write_log

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
