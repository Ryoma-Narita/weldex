"""reservation/services/line_notify.py — Weldex運用LINE Push通知

使い方:
    from services.line_notify import push
    push("📅 新規予約\n田中様 / 2026-06-10 10:00")

環境変数:
    WELDEX_LINE_CHANNEL_ACCESS_TOKEN  Weldex運用ボットのトークン
    ADMIN_LINE_USER_ID                RyomaのLINE User ID
"""
import os
import json
import urllib.request
import urllib.error

_TOKEN = os.environ.get("WELDEX_LINE_CHANNEL_ACCESS_TOKEN", "")
_TO    = os.environ.get("ADMIN_LINE_USER_ID", "")


def push(message: str) -> bool:
    """Ryoma の LINE にメッセージを送信する。

    Args:
        message: 送信するテキスト（最大2000文字）

    Returns:
        送信成功なら True。失敗しても例外は上げない。
    """
    if not _TOKEN or not _TO:
        return False
    try:
        payload = json.dumps({
            "to": _TO,
            "messages": [{"type": "text", "text": message[:2000]}],
        }).encode("utf-8")
        req = urllib.request.Request(
            "https://api.line.me/v2/bot/message/push",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {_TOKEN}",
            },
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except Exception:
        return False
