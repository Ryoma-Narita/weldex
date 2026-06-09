"""outreach/notify.py — Weldex運用LINEへの「重要エラー」通知

方針:
- 重要エラー（収集停止・認証切れ・送信全滅など）だけを送る。
- 個別レコードの失敗（1サイトの診断失敗等）のノイズは送らない（DBログのみ）。
- 同一メッセージは一定時間まとめて抑制（同じ障害でのLINEスパム・無料枠圧迫を防ぐ）。
- これは Weldex 自身（営業自動化）の障害通知。クライアント予約システムとは別ラベル。

環境変数（outreach サービスにも設定が必要）:
    WELDEX_LINE_CHANNEL_ACCESS_TOKEN  Weldex運用ボットのトークン
    ADMIN_LINE_USER_ID                RyomaのLINE User ID
"""
import os
import json
import time
import urllib.request

_TOKEN  = os.environ.get("WELDEX_LINE_CHANNEL_ACCESS_TOKEN", "")
_TO     = os.environ.get("ADMIN_LINE_USER_ID", "")
_PREFIX = "⚙️ [Weldex営業]"

# 同一メッセージの再送抑制ウィンドウ（秒）。プロセス内メモリで保持。
_DEDUP_WINDOW_SEC = 1800  # 30分
_last_sent: dict[str, float] = {}


def push(message: str) -> bool:
    """重要エラーを Ryoma の LINE に送信する。

    失敗しても例外は上げない（本業処理に影響させない）。
    同一メッセージは30分に1回までに抑制する。

    Args:
        message: 送信本文

    Returns:
        実際に送信したら True / 未設定・抑制・失敗なら False
    """
    if not _TOKEN or not _TO:
        return False

    now = time.time()
    key = message[:120]
    if now - _last_sent.get(key, 0.0) < _DEDUP_WINDOW_SEC:
        return False  # 重複抑制
    _last_sent[key] = now

    text = f"{_PREFIX}\n{message}"
    try:
        payload = json.dumps({
            "to": _TO,
            "messages": [{"type": "text", "text": text[:2000]}],
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
