"""
outreach/mailers/sender.py
SendGrid経由でメールを送信する
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from config import SENDGRID_API_KEY, FROM_EMAIL, FROM_NAME
from db.database import write_log


def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    SendGrid経由でテキストメールを1件送信する。

    Args:
        to_email: 送信先メールアドレス
        subject:  件名
        body:     本文（テキスト）

    Returns:
        True=送信成功 / False=失敗
    """
    if not SENDGRID_API_KEY:
        write_log("ERROR", "send", "SENDGRID_API_KEYが設定されていません")
        return False

    message = Mail(
        from_email=(FROM_EMAIL, FROM_NAME),
        to_emails=to_email,
        subject=subject,
        plain_text_content=body,
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        if response.status_code in (200, 202):
            write_log("INFO", "send", f"送信成功: {to_email} / {subject}")
            return True
        else:
            write_log("WARN", "send", f"送信異常: status={response.status_code} / {to_email}")
            return False
    except Exception as e:
        write_log("ERROR", "send", f"送信エラー: {to_email} / {e}")
        return False
