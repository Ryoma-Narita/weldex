"""
reservation/main.py
予約・顧客管理システム FastAPIアプリ

起動: uvicorn main:app --reload --port 8001
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, RedirectResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from db.database import init_db
from routers.booking       import router as booking_router
from routers.admin         import router as admin_router
from routers.customers     import router as customers_router
from routers.import_export import router as import_export_router
from services.reminder     import start_scheduler

# レートリミッター（IPアドレスベース）
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Weldex 予約システム", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 静的ファイル配信
_static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=_static_dir), name="static")

# ルーター登録
app.include_router(booking_router)
app.include_router(admin_router)
app.include_router(customers_router)
app.include_router(import_export_router)


@app.on_event("startup")
def on_startup():
    """アプリ起動時にDB初期化・スケジューラー起動。"""
    init_db()
    start_scheduler()


# ─── フロントエンドページ ──────────────────────

@app.get("/", response_class=HTMLResponse)
def root():
    """予約フォームにリダイレクト。"""
    return RedirectResponse(url="/booking/")


@app.get("/booking/", response_class=HTMLResponse)
def booking_page():
    """患者向け予約フォームを返す。"""
    path = os.path.join(_static_dir, "booking", "index.html")
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return HTMLResponse("<h1>予約フォームが見つかりません</h1>", status_code=404)


@app.get("/admin/", response_class=HTMLResponse)
def admin_page():
    """管理画面を返す。"""
    path = os.path.join(_static_dir, "admin", "index.html")
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return HTMLResponse("<h1>管理画面が見つかりません</h1>", status_code=404)
