"""reservation/services/reminder.py — 前日リマインド APSchedulerジョブ"""
import os
import sys
from datetime import date, timedelta
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from db.database import get_remind_targets, mark_remind_sent
from services.mail import send_reminder
from services.line_notify import push
from config import APP_NAME


def run_reminder() -> dict:
    """
    翌日の予約を取得してリマインドメールを送信する。
    毎日 REMIND_HOUR 時に APScheduler から呼ばれる。
    失敗した場合は LINE で Ryoma に通知する。
    """
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    targets = get_remind_targets(tomorrow)
    sent, failed = 0, 0
    failed_names = []

    for r in targets:
        ok = send_reminder(r)
        if ok:
            mark_remind_sent(r["id"])
            sent += 1
        else:
            failed += 1
            failed_names.append(f"{r['name']} 様（{r['time']}）")

    if failed > 0:
        names = "\n".join(failed_names[:5])
        push(
            f"⚠️ リマインド失敗 / {APP_NAME}\n"
            f"{tomorrow}\n"
            f"失敗: {failed}件\n{names}"
        )

    return {"date": tomorrow, "sent": sent, "failed": failed, "total": len(targets)}
