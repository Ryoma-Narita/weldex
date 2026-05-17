"""
line_bot/handlers/reminder.py
LINE Push Message によるリマインド送信
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import datetime  # run_line_remind での date 計算に使用
from linebot.v3.messaging import (
    Configuration, ApiClient, MessagingApi,
    PushMessageRequest,
)
from db.database import get_remind_targets_line, mark_remind_sent
from handlers.messages import reminder_msg
from config import LINE_CHANNEL_ACCESS_TOKEN


def push_remind(reservation: dict) -> bool:
    """
    1件の予約に対してLINE Push Messageでリマインドを送信する。
    キャンセルクイックリプライ付きのメッセージを使用する。

    Args:
        reservation: 予約情報（line_user_id が必要）

    Returns:
        送信成功なら True
    """
    line_user_id = reservation.get("line_user_id", "")
    if not line_user_id or not LINE_CHANNEL_ACCESS_TOKEN:
        return False

    msg = reminder_msg(
        date=reservation["date"],
        time=reservation["time"],
        menu_name=reservation.get("menu_name", ""),
    )
    try:
        config = Configuration(access_token=LINE_CHANNEL_ACCESS_TOKEN)
        with ApiClient(config) as api_client:
            MessagingApi(api_client).push_message(
                PushMessageRequest(to=line_user_id, messages=[msg])
            )
        return True
    except Exception as e:
        print(f"[ERROR] LINE push失敗: {e}")
        return False


def run_line_remind() -> None:
    """
    翌日のLINE予約に対してリマインドを送信する。
    APScheduler から毎日 REMIND_HOUR 時に呼ばれる。
    """
    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
    targets  = get_remind_targets_line(tomorrow)

    for reservation in targets:
        try:
            sent = push_remind(reservation)
            if sent:
                mark_remind_sent(reservation["id"])
                print(f"[INFO] LINE remind送信: id={reservation['id']}")
            else:
                print(f"[WARN] LINE remind送信スキップ: id={reservation['id']}")
        except Exception as e:
            print(f"[ERROR] LINE remindエラー: {e}")
