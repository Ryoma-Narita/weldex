"""
outreach/replies/checker.py
Gmail APIで営業メールへの返信を検知してDBに記録する
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from config import GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
from db.database import write_log, get_conn


# 自動返信と判定するパターン
_AUTO_REPLY_SUBJECT_PATTERNS = [
    "自動返信", "auto-reply", "auto reply", "out of office",
    "不在", "automatic reply", "vacation", "自動応答",
]


def is_auto_reply(subject: str, headers: dict) -> bool:
    """
    自動返信メールかどうかを判定する。

    Args:
        subject: メール件名
        headers: メールヘッダー辞書

    Returns:
        自動返信なら True
    """
    subject_lower = subject.lower()
    if any(p in subject_lower for p in _AUTO_REPLY_SUBJECT_PATTERNS):
        return True
    # X-Auto-Response-Suppress ヘッダーあり
    if headers.get("X-Auto-Response-Suppress"):
        return True
    # Return-Path が noreply 系
    return_path = headers.get("Return-Path", "").lower()
    if "noreply" in return_path or "no-reply" in return_path:
        return True
    return False


def _get_gmail_service():
    """Gmail APIサービスオブジェクトを取得する。"""
    if not all([GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN]):
        raise ValueError("Gmail API認証情報が設定されていません（.envを確認）")

    creds = Credentials(
        token=None,
        refresh_token=GMAIL_REFRESH_TOKEN,
        client_id=GMAIL_CLIENT_ID,
        client_secret=GMAIL_CLIENT_SECRET,
        token_uri="https://oauth2.googleapis.com/token",
    )
    return build("gmail", "v1", credentials=creds)


def check_replies() -> int:
    """
    受信トレイを検索し、営業メール宛の返信を検知してDBに記録する。

    Returns:
        新規検知件数
    """
    try:
        service = _get_gmail_service()
    except ValueError as e:
        write_log("WARN", "reply", str(e))
        return 0

    try:
        # 送信済みメールへの返信を検索
        result = service.users().messages().list(
            userId="me",
            q="in:inbox is:unread",
            maxResults=50,
        ).execute()

        messages = result.get("messages", [])
        detected = 0

        with get_conn() as conn:
            sent_emails = {
                row["to_email"]: row
                for row in conn.execute(
                    "SELECT target_id, to_email FROM outreach_log WHERE status='sent'"
                ).fetchall()
            }

        for msg in messages:
            detail = service.users().messages().get(
                userId="me", id=msg["id"], format="metadata",
                metadataHeaders=["From", "Subject", "Return-Path", "X-Auto-Response-Suppress"]
            ).execute()

            headers = {h["name"]: h["value"] for h in detail["payload"]["headers"]}
            from_addr = headers.get("From", "")
            subject   = headers.get("Subject", "（件名なし）")

            # 自動返信は除外
            if is_auto_reply(subject, headers):
                write_log("INFO", "reply", f"自動返信をスキップ: {from_addr} / {subject}")
                continue

            # 送信先リストに含まれるアドレスからの返信か確認
            matched_email = next(
                (e for e in sent_emails if e.lower() in from_addr.lower()), None
            )
            if not matched_email:
                continue

            target_id = sent_emails[matched_email]["target_id"]

            with get_conn() as conn:
                # 重複記録を防ぐ
                exists = conn.execute(
                    "SELECT 1 FROM outreach_log WHERE target_id=? AND status='replied'",
                    (target_id,)
                ).fetchone()
                if exists:
                    continue

                conn.execute("""
                    INSERT INTO outreach_log (target_id, to_email, template, subject, status)
                    VALUES (?, ?, 'REPLY', ?, 'replied')
                """, (target_id, matched_email, subject))
                conn.execute(
                    "UPDATE targets SET send_status='replied' WHERE id=?", (target_id,)
                )

            write_log("INFO", "reply", f"返信検知: {matched_email} / {subject}")
            detected += 1

        return detected

    except Exception as e:
        write_log("ERROR", "reply", f"返信チェックエラー: {e}")
        # 返信検知が止まる＝商談機会を逃す。認証切れ(invalid_grant)等は重要 → LINE通知
        try:
            from notify import push as notify_push
            notify_push(
                f"📭 Gmail返信チェック失敗\n"
                f"{type(e).__name__}: {str(e)[:160]}\n"
                f"認証切れ(refresh_token失効)の可能性。返信検知が止まっています。"
            )
        except Exception:
            pass
        return 0
