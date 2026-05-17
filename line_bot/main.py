"""
line_bot/main.py
LINE予約システム FastAPIアプリ

起動: uvicorn main:app --host 0.0.0.0 --port 8002
ローカルテスト: ngrok http 8002  →  発行URLをLINE Developer ConsoleのWebhook URLに設定
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from apscheduler.schedulers.background import BackgroundScheduler

from handlers.webhook  import router as webhook_router
from handlers.reminder import run_line_remind
from config import REMIND_HOUR

app = FastAPI(title="Weldex LINE Bot", version="1.0.0")
app.include_router(webhook_router)


@app.on_event("startup")
def on_startup() -> None:
    """アプリ起動時にAPSchedulerを起動する。"""
    scheduler = BackgroundScheduler(timezone="Asia/Tokyo")
    scheduler.add_job(
        run_line_remind,
        trigger="cron",
        hour=REMIND_HOUR,
        minute=0,
        id="line_remind",
        replace_existing=True,
    )
    scheduler.start()
    print(f"[INFO] LINE bot起動: 毎日{REMIND_HOUR}時にリマインド送信")


@app.get("/health")
def health() -> dict:
    """ヘルスチェックエンドポイント（Railway/Renderのping用）。"""
    return {"status": "ok", "service": "line-bot"}
