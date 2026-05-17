"""
line_bot/handlers/webhook.py
LINE Webhook受信・署名検証・イベント振り分け
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi import APIRouter, Request, HTTPException
from linebot.v3.webhook import WebhookParser
from linebot.v3.exceptions import InvalidSignatureError
from linebot.v3.webhooks import MessageEvent, TextMessageContent, FollowEvent
from linebot.v3.messaging import (
    Configuration, ApiClient, MessagingApi, ReplyMessageRequest,
)
from config import LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN, APP_NAME
from handlers.reservation import handle_message
from handlers.messages import welcome_msg

router = APIRouter()

# 起動時に1回だけ構築（SECRET未設定なら起動は通すがリクエストで400）
_parser = WebhookParser(LINE_CHANNEL_SECRET) if LINE_CHANNEL_SECRET else None
_config = Configuration(access_token=LINE_CHANNEL_ACCESS_TOKEN)


@router.post("/webhook")
async def webhook(request: Request):
    """
    LINE Platform からの Webhook を受信する。
    署名検証 → テキストメッセージイベントのみ処理 → 返信。

    Returns:
        {"status": "ok"}
    """
    if _parser is None:
        raise HTTPException(status_code=500, detail="LINE_CHANNEL_SECRET が未設定です")

    signature  = request.headers.get("X-Line-Signature", "")
    body_bytes = await request.body()
    body_str   = body_bytes.decode("utf-8")

    print(f"[WEBHOOK] received body={body_str[:120]}")

    try:
        events = _parser.parse(body_str, signature)
    except InvalidSignatureError as e:
        print(f"[WEBHOOK] 署名検証失敗: {e}")
        raise HTTPException(status_code=400, detail="署名が不正です")

    print(f"[WEBHOOK] events={len(events)}件")

    for event in events:
        print(f"[WEBHOOK] event type={event.type}")

        # ③ 友だち追加イベント → ウェルカムメッセージ
        if isinstance(event, FollowEvent):
            print(f"[WEBHOOK] FollowEvent: user={event.source.user_id[:12]}...")
            try:
                with ApiClient(_config) as api_client:
                    MessagingApi(api_client).reply_message(
                        ReplyMessageRequest(
                            reply_token=event.reply_token,
                            messages=[welcome_msg(APP_NAME)],
                        )
                    )
                print(f"[WEBHOOK] ウェルカムメッセージ送信成功")
            except Exception as e:
                print(f"[WEBHOOK] ウェルカムメッセージ送信失敗: {e}")
            continue

        if not isinstance(event, MessageEvent):
            continue
        if not isinstance(event.message, TextMessageContent):
            print(f"[WEBHOOK] 非テキストメッセージ: {event.message.type}")
            continue

        line_user_id = event.source.user_id
        text         = event.message.text
        reply_token  = event.reply_token
        print(f"[WEBHOOK] user={line_user_id[:12]}... text='{text}' replyToken={reply_token[:8]}...")

        # プロフィール取得（失敗しても続行）
        display_name = ""
        try:
            with ApiClient(_config) as api_client:
                profile      = MessagingApi(api_client).get_profile(line_user_id)
                display_name = profile.display_name
            print(f"[WEBHOOK] profile={display_name}")
        except Exception as e:
            print(f"[WEBHOOK] プロフィール取得失敗（続行）: {e}")

        # 状態遷移処理
        try:
            messages = handle_message(line_user_id, text, display_name)
            print(f"[WEBHOOK] 返信メッセージ={len(messages)}件")
        except Exception as e:
            print(f"[WEBHOOK] handle_message失敗: {e}")
            import traceback; traceback.print_exc()
            continue

        # 返信
        if messages:
            try:
                with ApiClient(_config) as api_client:
                    resp = MessagingApi(api_client).reply_message(
                        ReplyMessageRequest(
                            reply_token=reply_token,
                            messages=messages[:5],
                        )
                    )
                print(f"[WEBHOOK] 返信成功: {resp}")
            except Exception as e:
                print(f"[WEBHOOK] 返信失敗: {type(e).__name__}: {e}")
                import traceback; traceback.print_exc()

    return {"status": "ok"}
