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
                metadataHeaders=["From", "Subject"]
            ).execute()

            headers = {h["name"]: h["value"] for h in detail["payload"]["headers"]}
            from_addr = headers.get("From", "")

            # 送信先リストに含まれるアドレスからの返信か確認
            matched_email = next(
                (e for e in sent_emails if e.lower() in from_addr.lower()), None
            )
            if not matched_email:
                continue

            target_id = sent_emails[matched_email]["target_id"]
            subject   = headers.get("Subject", "（件名なし）")

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
        return 0
