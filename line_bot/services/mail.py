"""
line_bot/services/mail.py
管理者通知メール送信（SendGrid）— LINE予約専用

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【同期注意】このファイルは reservation/services/mail.py のコピーです。
  メールテンプレートや _send() を変更した場合は、必ず両ファイルを同期してください。
  採用理由：LINE bot と予約システムは別プロセスのため、
  サーバー間HTTP通信より単純なコピー運用の方が障害リスクが低い（案A採用）。
  詳細：reservation/services/mail.py の設計判断メモ参照。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import APP_NAME, APP_URL

import sendgrid
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
FROM_EMAIL       = os.environ.get("FROM_EMAIL", "info@weldex.jp")
FROM_NAME        = os.environ.get("FROM_NAME", APP_NAME)


def _send(to_email: str, subject: str, body: str) -> bool:
    """
    SendGridでメールを送信する。

    Args:
        to_email: 送信先メールアドレス
        subject:  件名
        body:     本文（テキスト）

    Returns:
        送信成功なら True
    """
    if not SENDGRID_API_KEY:
        return False
    try:
        message = Mail(
            from_email=(FROM_EMAIL, FROM_NAME),
            to_emails=to_email,
            subject=subject,
            plain_text_content=body,
        )
        sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code in (200, 202)
    except Exception:
        return False


def send_admin_notification(reservation: dict, admin_email: str) -> bool:
    """
    管理者への新規予約通知メールを送信する（LINE予約経由）。

    Args:
        reservation: 予約情報（name, phone, date, time, menu_name）
        admin_email: 管理者メールアドレス

    Returns:
        送信成功なら True
    """
    if not admin_email:
        return False

    subject = f"【{APP_NAME}】新規予約が入りました（LINE）"
    body = f"""\
LINEから新しいご予約が入りました。

患者名：{reservation['name']}
電話番号：{reservation.get('phone') or '未登録'}
日時：{reservation['date']} {reservation['time']}
メニュー：{reservation.get('menu_name') or '通常診療'}

管理画面: {APP_URL}/admin/
"""
    return _send(admin_email, subject, body)
