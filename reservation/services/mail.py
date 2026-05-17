"""
reservation/services/mail.py
確認・リマインドメール送信（SendGrid）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【設計判断メモ】 #018 管理者通知 2026-05-10

■ なぜ mail.py を line_bot/ にコピーするのか（案A採用理由）
  LINE予約bot（port 8002）と予約システム（port 8001）は別プロセス。
  サーバー間HTTP通信（案B）はネットワーク障害・認証設計が必要になり
  障害ポイントが増える。mail.py は変更頻度が低いテンプレート中心のファイルのため、
  コピー運用のコストは低い。修正時は両ファイルを必ず同期すること。
  → 同期対象: line_bot/services/mail.py

■ なぜ通知ON/OFFを設定画面に持たせるのか
  クリニックによっては「業務時間中に管理画面だけ確認する」運用もある。
  常にメール通知が来ることがかえって邪魔になるケースがあるため、
  settingsテーブルの notify_on_booking / notify_on_cancel で制御する。

■ 管理者が自分でキャンセルした場合は通知しない
  自分でやった操作のため通知は不要（ノイズになる）。
  患者がWEB経由でキャンセルした場合のみ通知する。

■ テスト用メールアドレス
  開発時は Gmail + エイリアス（例：naripippipi+weldex@gmail.com）を使用。
  Gmailは「+」以降を無視して同じ受信トレイに届く仕組みを利用している。
  SendGridは + を含むアドレスでも正常に送信できることを確認済み。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import (
    SENDGRID_API_KEY, FROM_EMAIL, FROM_NAME,
    APP_NAME, APP_URL,
)

import sendgrid
from sendgrid.helpers.mail import Mail


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
        print("[WARN] SENDGRID_API_KEY が未設定のため送信をスキップしました")
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
    except Exception as e:
        print(f"[ERROR] メール送信失敗: {e}")
        return False


def send_confirmation(reservation: dict) -> bool:
    """
    予約確認メールを送信する。

    Args:
        reservation: 予約情報（name, email, date, time, menu_name, notes）

    Returns:
        送信成功なら True
    """
    to_email = reservation.get("email", "")
    if not to_email:
        return False

    subject = f"【{APP_NAME}】ご予約の確認"
    body = f"""\
{reservation['name']} 様

ご予約を承りました。

━━━━━━━━━━━━━━━━━━━━━━
■ご予約内容
━━━━━━━━━━━━━━━━━━━━━━
日時：{reservation['date']} {reservation['time']}
メニュー：{reservation.get('menu_name') or '通常診療'}
備考：{reservation.get('notes') or 'なし'}
━━━━━━━━━━━━━━━━━━━━━━

ご不明な点がございましたら、お電話にてお問い合わせください。
キャンセルの際もお早めにご連絡をお願いします。

{APP_NAME}
{APP_URL}
"""
    return _send(to_email, subject, body)


def send_reminder(reservation: dict) -> bool:
    """
    前日リマインドメールを送信する。

    Args:
        reservation: 予約情報

    Returns:
        送信成功なら True
    """
    to_email = reservation.get("email", "")
    if not to_email:
        return False

    subject = f"【{APP_NAME}】明日のご予約のリマインド"
    body = f"""\
{reservation['name']} 様

明日のご予約をお知らせします。

━━━━━━━━━━━━━━━━━━━━━━
■ご予約内容
━━━━━━━━━━━━━━━━━━━━━━
日時：{reservation['date']} {reservation['time']}
メニュー：{reservation.get('menu_name') or '通常診療'}
━━━━━━━━━━━━━━━━━━━━━━

ご都合が悪くなった場合は、お早めにご連絡ください。

{APP_NAME}
{APP_URL}
"""
    return _send(to_email, subject, body)


def send_admin_notification(reservation: dict, admin_email: str) -> bool:
    """
    管理者への新規予約通知メールを送信する。

    Args:
        reservation: 予約情報
        admin_email: 管理者メールアドレス

    Returns:
        送信成功なら True
    """
    if not admin_email:
        return False

    subject = f"【{APP_NAME}】新規予約が入りました"
    body = f"""\
新しいご予約が入りました。

患者名：{reservation['name']}
電話番号：{reservation.get('phone') or '未登録'}
日時：{reservation['date']} {reservation['time']}
メニュー：{reservation.get('menu_name') or '通常診療'}
備考：{reservation.get('notes') or 'なし'}

管理画面: {APP_URL}/admin/
"""
    return _send(admin_email, subject, body)


def send_cancel_notification(reservation: dict, admin_email: str) -> bool:
    """
    管理者へのキャンセル通知メールを送信する。
    ※ 患者自身がWEB経由でキャンセルした場合のみ呼び出す。
       管理者が自分でキャンセルした場合は呼び出さない。

    Args:
        reservation: キャンセルされた予約情報
        admin_email: 管理者メールアドレス

    Returns:
        送信成功なら True
    """
    if not admin_email:
        return False

    subject = f"【{APP_NAME}】予約がキャンセルされました"
    body = f"""\
予約がキャンセルされました。

患者名：{reservation['name']}
電話番号：{reservation.get('phone') or '未登録'}
日時：{reservation['date']} {reservation['time']}
メニュー：{reservation.get('menu_name') or '通常診療'}

管理画面: {APP_URL}/admin/
"""
    return _send(admin_email, subject, body)
