"""reservation/main.py — FastAPIアプリエントリーポイント"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, Request, Header, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from linebot.v3.exceptions import InvalidSignatureError

from db.database import init_db
from routers import booking, admin, customers, import_export
from handlers.webhook import process_webhook
from services.reminder import run_reminder
from services.line_notify import push
from config import REMIND_HOUR, APP_NAME

app = FastAPI(title=f"{APP_NAME} 予約システム", docs_url="/api/docs")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """未処理の例外をキャッチしてLINEで通知する。"""
    push(
        f"⚠️ {APP_NAME} エラー\n"
        f"{request.method} {request.url.path}\n"
        f"{type(exc).__name__}: {str(exc)[:200]}"
    )
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(booking.router)
app.include_router(admin.router)
app.include_router(customers.router)
app.include_router(import_export.router)

static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/booking", StaticFiles(directory=os.path.join(static_dir, "booking"), html=True), name="booking")
app.mount("/admin-ui", StaticFiles(directory=os.path.join(static_dir, "admin"), html=True), name="admin-ui")


@app.on_event("startup")
def on_startup():
    init_db()
    scheduler = BackgroundScheduler(timezone="Asia/Tokyo")
    scheduler.add_job(run_reminder, "cron", hour=REMIND_HOUR, minute=0)
    scheduler.start()


@app.post("/line/webhook")
async def line_webhook(
    request: Request,
    x_line_signature: str = Header(...),
):
    """LINE Webhook受信エンドポイント。"""
    body = await request.body()
    try:
        process_webhook(x_line_signature, body.decode("utf-8"))
    except InvalidSignatureError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    return {"status": "ok"}


@app.get("/")
def root():
    return {"service": APP_NAME, "booking": "/booking/", "admin": "/admin-ui/", "docs": "/api/docs", "line_webhook": "/line/webhook"}
