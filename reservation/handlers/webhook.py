"""reservation/handlers/webhook.py — LINE Webhookイベントルーティング"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from linebot.v3 import WebhookHandler
from linebot.v3.exceptions import InvalidSignatureError
from linebot.v3.messaging import (
    ApiClient, Configuration, MessagingApi, ReplyMessageRequest,
)
from linebot.v3.webhooks import MessageEvent, TextMessageContent, FollowEvent, PostbackEvent

from handlers.reservation import handle_message
from config import LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN

handler = WebhookHandler(LINE_CHANNEL_SECRET)
_cfg = Configuration(access_token=LINE_CHANNEL_ACCESS_TOKEN)


def process_webhook(signature: str, body: str) -> None:
    """署名検証してイベントを処理する。InvalidSignatureErrorを上に投げる。"""
    handler.handle(body, signature)


@handler.add(MessageEvent, message=TextMessageContent)
def _on_text(event: MessageEvent) -> None:
    """テキストメッセージを予約ステートマシンに渡して返信する。"""
    line_user_id = event.source.user_id
    text = event.message.text.strip()
    messages = handle_message(line_user_id, text)
    with ApiClient(_cfg) as api_client:
        MessagingApi(api_client).reply_message(
            ReplyMessageRequest(reply_token=event.reply_token, messages=messages)
        )


@handler.add(PostbackEvent)
def _on_postback(event: PostbackEvent) -> None:
    """ポストバック（クイックリプライボタン）を処理する。"""
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
    from linebot.v3.messaging import TextMessage
    from config import APP_NAME
    with ApiClient(_cfg) as api_client:
        MessagingApi(api_client).reply_message(
            ReplyMessageRequest(
                reply_token=event.reply_token,
                messages=[TextMessage(
                    text=f"【{APP_NAME}】\nご登録ありがとうございます！\n「予約」と送ると予約を開始できます。"
                )]
            )
        )
