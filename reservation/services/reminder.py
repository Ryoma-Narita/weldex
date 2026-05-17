"""
reservation/services/reminder.py
APSchedulerによる前日リマインド自動送信
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import date, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from db.database import get_remind_targets, mark_remind_sent
from services.mail import send_reminder
from services.data_retention import run_data_retention
from config import REMIND_HOUR


def _send_line_reminder(reservation: dict) -> bool:
    """
    LINE push メッセージでリマインドを送信する（Phase4実装後に有効化）。

    Args:
        reservation: 予約情報（line_user_id が必要）

    Returns:
        送信成功なら True
    """
    line_user_id = reservation.get("line_user_id", "")
    if not line_user_id:
        return False
    # Phase4実装後にline_bot.handlers.reminder.push_remind()を呼ぶ
    # 現時点ではフォールバックとして False を返す
    return False


def run_remind() -> None:
    """
    翌日予約のリマインドを送信する（channelに応じてメール/LINEを切り替え）。
    毎日 REMIND_HOUR 時に実行される。
    """
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    targets  = get_remind_targets(tomorrow)

    for reservation in targets:
        try:
            channel = reservation.get("channel", "web")

            if channel == "line":
                sent = _send_line_reminder(reservation)
            else:
                sent = send_reminder(reservation)

            if sent:
                mark_remind_sent(reservation["id"])
                print(f"[INFO] リマインド送信: id={reservation['id']} channel={channel}")
            else:
                print(f"[WARN] リマインド送信スキップ: id={reservation['id']} channel={channel}")
        except Exception as e:
            print(f"[ERROR] リマインドエラー: {e}")


def start_scheduler() -> BackgroundScheduler:
    """
    バックグラウンドスケジューラーを起動して返す。

    Returns:
        起動済みの BackgroundScheduler
    """
    scheduler = BackgroundScheduler(timezone="Asia/Tokyo")
    scheduler.add_job(
        run_remind,
        trigger="cron",
        hour=REMIND_HOUR,
        minute=0,
        id="daily_remind",
        replace_existing=True,
    )
    # 個人情報保持期間管理：毎月1日0:00に実行
    scheduler.add_job(
        run_data_retention,
        trigger="cron",
        day=1,
        hour=0,
        minute=0,
        id="monthly_data_retention",
        replace_existing=True,
    )
    scheduler.start()
    print(f"[INFO] スケジューラー起動: 毎日{REMIND_HOUR}時にリマインド / 毎月1日0:00に個人情報整理")
    return scheduler
