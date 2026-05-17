"""reservation/handlers/reservation.py — LINEメッセージ応答（URL誘導型）"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from linebot.v3.messaging import TextMessage
from config import APP_URL, APP_NAME

BOOKING_URL = f"{APP_URL}/booking/"

_BOOKING_KEYWORDS = {"予約", "よやく", "reserve", "booking", "予約する", "予約したい"}
_CHECK_KEYWORDS = {"予約確認", "変更", "予約変更", "キャンセル", "予約キャンセル", "確認"}


def handle_message(line_user_id: str, text: str) -> list:
    """LINEメッセージを処理してレスポンスメッセージリストを返す。"""
    t = text.strip()

    if t in _BOOKING_KEYWORDS:
        return [TextMessage(
            text=(
                f"✨ ご予約はこちらから！\n\n"
                f"📅 {BOOKING_URL}\n\n"
                f"24時間いつでもご予約いただけます😊"
            )
        )]

    if t in _CHECK_KEYWORDS:
        return [TextMessage(
            text=(
                f"📋 ご予約の確認・変更・キャンセルはこちらから！\n\n"
                f"📅 {BOOKING_URL}\n\n"
                f"ご不明な点はお電話でもお気軽にどうぞ😊"
            )
        )]

    return [TextMessage(
        text=(
            f"メッセージありがとうございます😊\n\n"
            f"「予約」と送るとご予約ページへご案内します。\n"
            f"「予約確認」で確認・変更・キャンセルもできます✨"
        )
    )]
