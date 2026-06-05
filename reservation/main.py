"""reservation/main.py — FastAPIアプリエントリーポイント"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

from fastapi import FastAPI, Request, Header, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from linebot.v3.exceptions import InvalidSignatureError

from db.database import init_db
from routers import booking, admin, customers, import_export
from handlers.webhook import process_webhook
from services.reminder import run_reminder
from config import REMIND_HOUR, APP_NAME

_sentry_dsn = os.environ.get("SENTRY_DSN")
if _sentry_dsn:
    sentry_sdk.init(
        dsn=_sentry_dsn,
        integrations=[StarletteIntegration(), FastApiIntegration()],
        traces_sample_rate=0.1,
        environment=os.environ.get("ENVIRONMENT", "production"),
    )

app = FastAPI(title=f"{APP_NAME} 予約システム", docs_url="/api/docs")

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
