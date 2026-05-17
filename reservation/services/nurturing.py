"""
reservation/services/nurturing.py
問い合わせナーチャリングフロー

フロー：
  1. 問い合わせ受信 → SendGrid で自動返信メール
  2. 問い合わせ受信 → Weldex運用LINEボットでRyomaに即時通知
  3. 3日後 → 未返信の場合のみフォローアップメール送信
     （Gmail API で返信有無を確認）

使い方：
  問い合わせを受け取ったエンドポイントから
  await handle_new_inquiry(...) を呼ぶ
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime, timedelta
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
FROM_EMAIL       = os.environ.get("FROM_EMAIL", "info@weldex.jp")
FROM_NAME        = os.environ.get("FROM_NAME", "Weldex")
WELDEX_LINE_TOKEN = os.environ.get("WELDEX_LINE_CHANNEL_ACCESS_TOKEN", "")
ADMIN_LINE_USER  = os.environ.get("ADMIN_LINE_USER_ID", "")

LINE_PUSH_URL    = "https://api.line.me/v2/bot/message/push"
LINE_FRIENDS_URL = "https://lin.ee/XXXXXXX"  # 本番の友だち追加URLに変更


# ─── 自動返信メール ───────────────────────────────────

def _auto_reply_body(name: str, demo_url: str = "https://weldex.jp/works") -> str:
    """自動返信メール本文を生成する。"""
    return f"""{name} 様

お問い合わせいただきありがとうございます。
Weldex（ウェルデックス）の成田です。

内容を確認のうえ、通常24時間以内にご返信いたします。

─────────────────────
■ Weldexのデモをご覧ください
WEB予約・LINE予約・管理画面のデモを公開しています。
{demo_url}

■ LINEでも受け付けています
お急ぎの場合はLINEからどうぞ。
{LINE_FRIENDS_URL}
─────────────────────

引き続きどうぞよろしくお願いいたします。

──────────────────────────────
Weldex（ウェルデックス）
担当：成田 涼馬
メール：info@weldex.jp
サイト：https://weldex.jp
──────────────────────────────
"""


def _followup_body(name: str) -> str:
    """3日後フォローアップメール本文を生成する。"""
    return f"""{name} 様

先日はお問い合わせいただきありがとうございました。
Weldex（ウェルデックス）の成田です。

ご返信が届いていないようでご連絡いたしました。
ご都合はいかがでしょうか？

お気軽にご連絡ください。

──────────────────────────────
Weldex（ウェルデックス）
担当：成田 涼馬
メール：info@weldex.jp
サイト：https://weldex.jp
──────────────────────────────
"""


def send_auto_reply(name: str, to_email: str) -> bool:
    """
    問い合わせ受信時の自動返信メールを送信する。

    Args:
        name:     問い合わせ者の名前
        to_email: 送信先メールアドレス

    Returns:
        送信成功なら True
    """
    if not SENDGRID_API_KEY or not to_email:
        return False
    try:
        message = Mail(
            from_email=(FROM_EMAIL, FROM_NAME),
            to_emails=to_email,
            subject="【Weldex】お問い合わせを受け付けました",
            plain_text_content=_auto_reply_body(name),
        )
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        sg.send(message)
        return True
    except Exception as e:
        print(f"[nurturing] 自動返信メール送信エラー: {e}")
        return False


def send_followup(name: str, to_email: str) -> bool:
    """
    3日後フォローアップメールを送信する。

    Args:
        name:     問い合わせ者の名前
        to_email: 送信先メールアドレス

    Returns:
        送信成功なら True
    """
    if not SENDGRID_API_KEY or not to_email:
        return False
    try:
        message = Mail(
            from_email=(FROM_EMAIL, FROM_NAME),
            to_emails=to_email,
            subject="【Weldex】先日のお問い合わせについて",
            plain_text_content=_followup_body(name),
        )
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        sg.send(message)
        return True
    except Exception as e:
        print(f"[nurturing] フォローアップメール送信エラー: {e}")
        return False


# ─── RyomaへLINE通知 ──────────────────────────────────

def notify_ryoma(name: str, company: str, message_text: str) -> bool:
    """
    Weldex運用LINEボットでRyomaに新規問い合わせを通知する。

    Args:
        name:         問い合わせ者の名前
        company:      会社名・屋号
        message_text: 問い合わせ内容（先頭50文字）

    Returns:
        送信成功なら True
    """
    if not WELDEX_LINE_TOKEN or not ADMIN_LINE_USER:
        print("[nurturing] LINE通知設定なし（WELDEX_LINE_CHANNEL_ACCESS_TOKEN / ADMIN_LINE_USER_IDを確認）")
        return False

    import urllib.request
    import json

    preview = message_text[:50] + ("…" if len(message_text) > 50 else "")
    text = f"🔔 新規問い合わせ\n{company} / {name}\n{preview}"
    payload = json.dumps({
        "to": ADMIN_LINE_USER,
        "messages": [{"type": "text", "text": text}],
    }).encode("utf-8")

    req = urllib.request.Request(
        LINE_PUSH_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {WELDEX_LINE_TOKEN}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status == 200
    except Exception as e:
        print(f"[nurturing] LINE通知エラー: {e}")
        return False


# ─── まとめて実行 ─────────────────────────────────────

def handle_new_inquiry(name: str, company: str, email: str, message_text: str) -> None:
    """
    問い合わせ受信時の処理をまとめて実行する。

    1. 自動返信メール送信
    2. RyomaへLINE通知

    （3日後フォローアップはAPSchedulerで別途実行）

    Args:
        name:         問い合わせ者の名前
        company:      会社名・屋号
        email:        メールアドレス
        message_text: 問い合わせ内容
    """
    send_auto_reply(name, email)
    notify_ryoma(name, company, message_text)
