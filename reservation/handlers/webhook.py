"""reservation/handlers/webhook.py — LINE Webhookイベントルーティング"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from linebot.v3 import WebhookHandler
from linebot.v3.exceptions import InvalidSignatureError
from linebot.v3.messaging import (
    ApiClient, Configuration, MessagingApi, ReplyMessageRequest, TextMessage,
)
from linebot.v3.webhooks import MessageEvent, TextMessageContent, FollowEvent, PostbackEvent

from handlers.reservation import handle_message
from config import LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN, APP_NAME, APP_URL

handler = WebhookHandler(LINE_CHANNEL_SECRET)
_cfg = Configuration(access_token=LINE_CHANNEL_ACCESS_TOKEN)

BOOKING_URL = f"{APP_URL}/booking/"


def process_webhook(signature: str, body: str) -> None:
    """署名検証してイベントを処理する。"""
    handler.handle(body, signature)


@handler.add(MessageEvent, message=TextMessageContent)
def _on_text(event: MessageEvent) -> None:
    """テキストメッセージを処理して返信する。"""
    line_user_id = event.source.user_id
    text = event.message.text.strip()
    messages = handle_message(line_user_id, text)
    with ApiClient(_cfg) as api_client:
        MessagingApi(api_client).reply_message(
            ReplyMessageRequest(reply_token=event.reply_token, messages=messages)
        )


@handler.add(PostbackEvent)
def _on_postback(event: PostbackEvent) -> None:
    """ポストバック（リッチメニューボタン等）を処理する。"""
    line_user_id = event.source.user_id
    data = event.postback.data
    messages = handle_message(line_user_id, data)
    with ApiClient(_cfg) as api_client:
        MessagingApi(api_client).reply_message(
            ReplyMessageRequest(reply_token=event.reply_token, messages=messages)
        )


@handler.add(FollowEvent)
def _on_follow(event: FollowEvent) -> None:
    """友だち追加時のウェルカムメッセージ。"""
    with ApiClient(_cfg) as api_client:
        MessagingApi(api_client).reply_message(
            ReplyMessageRequest(
                reply_token=event.reply_token,
                messages=[TextMessage(
                    text=(
                        f"🌸 {APP_NAME} の公式LINEへようこそ！\n\n"
                        f"こちらから簡単にご予約いただけます😊\n\n"
                        f"📅 ご予約はこちら\n{BOOKING_URL}\n\n"
                        f"「予約」と送ってもご案内します✨\n"
                        f"お気軽にご利用ください！"
                    )
                )]
            )
        )
