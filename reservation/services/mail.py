"""reservation/services/mail.py — 確認・リマインド・管理者通知メール"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
    _HAS_SENDGRID = True
except ImportError:
    _HAS_SENDGRID = False

from config import (
    SENDGRID_API_KEY, FROM_EMAIL, FROM_NAME,
    APP_NAME, APP_URL, ADMIN_EMAIL,
)
from services.line_notify import push


def _send(to_email: str, subject: str, body: str) -> bool:
    """SendGridでメールを送信する。失敗時はFalseを返す。"""
    if not _HAS_SENDGRID or not SENDGRID_API_KEY:
        return False
    try:
        msg = Mail(
            from_email=(FROM_EMAIL, FROM_NAME),
            to_emails=to_email,
            subject=subject,
            plain_text_content=body,
        )
        client = SendGridAPIClient(SENDGRID_API_KEY)
        res = client.send(msg)
        return res.status_code in (200, 202)
    except Exception:
        return False


def send_confirmation(reservation: dict) -> bool:
    """予約確認メールを顧客に送信する。"""
    email = reservation.get("email", "")
    if not email:
        return False
    subject = f"【予約確認】{reservation['date']} {reservation['time']} — {APP_NAME}"
    body = f"""{reservation['name']} 様

ご予約を承りました。

━━━━━━━━━━━━━━━━━━━━━━━━
■ ご予約内容
━━━━━━━━━━━━━━━━━━━━━━━━
日時　：{reservation['date']}（{reservation['time']}）
メニュー：{reservation.get('menu_name', '')}
お名前　：{reservation['name']}
電話番号：{reservation.get('phone', '')}
━━━━━━━━━━━━━━━━━━━━━━━━

キャンセル・変更はお電話にてご連絡ください。

{APP_NAME}
"""
    ok = _send(email, subject, body)
    # SendGrid設定済みなのに失敗＝患者に確認が届かない。重要 → LINE通知
    # （SendGrid未設定の運用ではスパムにならないよう APIキー有無でガード）
    if not ok and SENDGRID_API_KEY:
        push(
            f"⚠️ {APP_NAME}\n確認メール送信失敗\n"
            f"{reservation['name']} 様 / {reservation['date']} {reservation['time']}"
        )
    return ok


def send_reminder(reservation: dict) -> bool:
    """前日リマインドメールを顧客に送信する。"""
    email = reservation.get("email", "")
    if not email:
        return False
    subject = f"【明日のご予約リマインド】{reservation['date']} {reservation['time']} — {APP_NAME}"
    body = f"""{reservation['name']} 様

明日のご予約のリマインドです。

━━━━━━━━━━━━━━━━━━━━━━━━
日時　：{reservation['date']}（{reservation['time']}）
メニュー：{reservation.get('menu_name', '')}
━━━━━━━━━━━━━━━━━━━━━━━━

キャンセルの場合はお電話ください。

{APP_NAME}
"""
    return _send(email, subject, body)


def send_admin_notification(reservation: dict) -> bool:
    """新規予約を管理者にメール＋LINEで通知する。"""
    # LINE通知（Ryomaへ）
    push(
        f"📅 新規予約 / {APP_NAME}\n"
        f"{reservation['name']} 様\n"
        f"{reservation['date']} {reservation['time']}\n"
        f"メニュー: {reservation.get('menu_name', '')}"
    )
    # メール通知（クライアント管理者へ）
    if not ADMIN_EMAIL:
        return False
    subject = f"【新規予約】{reservation['date']} {reservation['time']} {reservation['name']} 様"
    body = f"""新しい予約が入りました。

日時　：{reservation['date']}（{reservation['time']}）
メニュー：{reservation.get('menu_name', '')}
お名前　：{reservation['name']}
電話番号：{reservation.get('phone', '')}
メール　：{reservation.get('email', '')}
備考　　：{reservation.get('notes', '')}

管理画面：{APP_URL}/admin/
"""
    ok = _send(ADMIN_EMAIL, subject, body)
    if not ok and SENDGRID_API_KEY:
        push(f"⚠️ {APP_NAME}\n管理者メール送信失敗（新規予約）\n{reservation['name']} 様")
    return ok


def send_cancel_notification(reservation: dict) -> bool:
    """キャンセル通知を管理者にメール＋LINEで送信する。"""
    # LINE通知（Ryomaへ）
    push(
        f"❌ キャンセル / {APP_NAME}\n"
        f"{reservation['name']} 様\n"
        f"{reservation['date']} {reservation['time']}"
    )
    # メール通知（クライアント管理者へ）
    if not ADMIN_EMAIL:
        return False
    subject = f"【キャンセル】{reservation['date']} {reservation['time']} {reservation['name']} 様"
    body = f"""予約がキャンセルされました。

日時　：{reservation['date']}（{reservation['time']}）
お名前　：{reservation['name']}
電話番号：{reservation.get('phone', '')}
"""
    ok = _send(ADMIN_EMAIL, subject, body)
    if not ok and SENDGRID_API_KEY:
        push(f"⚠️ {APP_NAME}\n管理者メール送信失敗（キャンセル）\n{reservation['name']} 様")
    return ok
