"""reservation/handlers/reservation.py — LINE予約ステートマシン"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import date, timedelta
from linebot.v3.messaging import (
    TextMessage, QuickReply, QuickReplyItem,
    MessageAction, DatetimePickerAction, FlexMessage, FlexContainer,
)
from db.database import (
    get_user_session, upsert_user_session,
    get_menus, get_closed_dates, get_reserved_times,
    create_reservation, find_or_create_customer,
    get_reservation_by_id, update_reservation_status,
)
from config import SLOT_START, SLOT_END, SLOT_INTERVAL_MIN, ADVANCE_DAYS, APP_NAME
from services.mail import send_confirmation, send_admin_notification


def _gen_slots(date_str: str) -> list[str]:
    """指定日の予約可能スロット（未予約）を返す。"""
    reserved = get_reserved_times(date_str)
    closed = get_closed_dates()
    if date_str in closed:
        return []
    start_h, start_m = map(int, SLOT_START.split(":"))
    end_h, end_m = map(int, SLOT_END.split(":"))
    start_min = start_h * 60 + start_m
    end_min = end_h * 60 + end_m
    slots = []
    t = start_min
    while t < end_min:
        hh = t // 60
        mm = t % 60
        label = f"{hh:02d}:{mm:02d}"
        if label not in reserved:
            slots.append(label)
        t += SLOT_INTERVAL_MIN
    return slots


def _available_dates() -> list[str]:
    """予約可能な日付リスト（今日+1〜ADVANCE_DAYS日後）を返す。"""
    closed = set(get_closed_dates())
    today = date.today()
    result = []
    for i in range(1, ADVANCE_DAYS + 1):
        d = (today + timedelta(days=i)).isoformat()
        if d not in closed:
            result.append(d)
    return result


def _menu_qr(menus: list) -> QuickReply:
    """メニュー選択クイックリプライを生成する。"""
    items = [
        QuickReplyItem(action=MessageAction(label=m["name"][:20], text=f"menu:{m['id']}:{m['name']}:{m['duration_min']}"))
        for m in menus
    ]
    return QuickReply(items=items)


def _time_qr(slots: list[str]) -> QuickReply:
    """時間選択クイックリプライを生成する（最大13件）。"""
    items = [
        QuickReplyItem(action=MessageAction(label=s, text=f"time:{s}"))
        for s in slots[:13]
    ]
    return QuickReply(items=items)


def handle_message(line_user_id: str, text: str) -> list:
    """LINEメッセージを処理してレスポンスメッセージリストを返す。"""
    sess = get_user_session(line_user_id)
    step = sess.get("step", "idle")

    # キャンセルワード（どのステップでも受け付ける）
    if text in ("キャンセル", "やめる", "cancel", "戻る"):
        upsert_user_session(line_user_id, step="idle")
        return [TextMessage(text="予約入力をキャンセルしました。\n「予約」と送ると再開できます。")]

    # 予約開始
    if step == "idle":
        if text in ("予約", "よやく", "reserve", "booking"):
            menus = get_menus()
            if not menus:
                return [TextMessage(text="現在メニューが登録されていません。お電話でお問い合わせください。")]
            upsert_user_session(line_user_id, step="select_menu")
            return [TextMessage(
                text=f"【{APP_NAME}】\nご予約を承ります。\nメニューを選択してください。",
                quick_reply=_menu_qr(menus)
            )]
        return [TextMessage(text="「予約」と送ると予約を開始できます。\n「キャンセル」と送ると入力を中断します。")]

    # メニュー選択
    if step == "select_menu":
        if text.startswith("menu:"):
            parts = text.split(":", 3)
            if len(parts) >= 4:
                _, menu_id, menu_name, duration = parts
                upsert_user_session(
                    line_user_id, step="select_date",
                    temp_menu_id=menu_id, temp_menu=menu_name
                )
                dates = _available_dates()
                if not dates:
                    upsert_user_session(line_user_id, step="idle")
                    return [TextMessage(text="現在予約可能な日程がありません。お電話でお問い合わせください。")]
                # 日付選択クイックリプライ（最大7件表示）
                items = [
                    QuickReplyItem(action=MessageAction(label=d[5:], text=f"date:{d}"))
                    for d in dates[:7]
                ]
                return [TextMessage(
                    text=f"メニュー：{menu_name}\n\n日付を選択してください（キャンセルは「キャンセル」）。",
                    quick_reply=QuickReply(items=items)
                )]
        menus = get_menus()
        return [TextMessage(text="メニューをボタンから選択してください。", quick_reply=_menu_qr(menus))]

    # 日付選択
    if step == "select_date":
        if text.startswith("date:"):
            date_str = text[5:]
            slots = _gen_slots(date_str)
            if not slots:
                dates = _available_dates()
                items = [
                    QuickReplyItem(action=MessageAction(label=d[5:], text=f"date:{d}"))
                    for d in dates[:7]
                ]
                return [TextMessage(
                    text=f"{date_str} は満席または休業日です。別の日程を選択してください。",
                    quick_reply=QuickReply(items=items)
                )]
            upsert_user_session(line_user_id, step="select_time", temp_date=date_str)
            return [TextMessage(
                text=f"日付：{date_str}\n\n時間を選択してください。",
                quick_reply=_time_qr(slots)
            )]
        # 再提示
        dates = _available_dates()
        items = [
            QuickReplyItem(action=MessageAction(label=d[5:], text=f"date:{d}"))
            for d in dates[:7]
        ]
        return [TextMessage(text="日付をボタンから選択してください。", quick_reply=QuickReply(items=items))]

    # 時間選択
    if step == "select_time":
        if text.startswith("time:"):
            time_str = text[5:]
            upsert_user_session(line_user_id, step="input_name", temp_time=time_str)
            return [TextMessage(text=f"時間：{time_str}\n\nお名前をフルネームで入力してください。\n（例：山田 太郎）")]
        slots = _gen_slots(sess.get("temp_date", ""))
        return [TextMessage(text="時間をボタンから選択してください。", quick_reply=_time_qr(slots))]

    # 名前入力
    if step == "input_name":
        if len(text.strip()) < 1:
            return [TextMessage(text="お名前を入力してください。")]
        upsert_user_session(line_user_id, step="input_phone", temp_name=text.strip())
        return [TextMessage(text=f"お名前：{text.strip()}\n\nお電話番号を入力してください。\n（例：090-1234-5678）")]

    # 電話番号入力
    if step == "input_phone":
        phone = text.strip().replace("-", "").replace(" ", "")
        if len(phone) < 10 or not phone.isdigit():
            return [TextMessage(text="正しい電話番号を入力してください。\n（例：090-1234-5678）")]
        upsert_user_session(line_user_id, step="confirm", temp_phone=text.strip())
        # 確認メッセージ（DBから最新セッションを取得）
        s = get_user_session(line_user_id)
        confirm_text = (
            f"以下の内容で予約しますか？\n\n"
            f"メニュー：{s['temp_menu']}\n"
            f"日時：{s['temp_date']} {s['temp_time']}\n"
            f"お名前：{s['temp_name']}\n"
            f"電話番号：{text.strip()}\n\n"
            f"「確定」または「キャンセル」で返信してください。"
        )
        items = [
            QuickReplyItem(action=MessageAction(label="確定", text="確定")),
            QuickReplyItem(action=MessageAction(label="キャンセル", text="キャンセル")),
        ]
        return [TextMessage(text=confirm_text, quick_reply=QuickReply(items=items))]

    # 確認
    if step == "confirm":
        if text == "確定":
            s = get_user_session(line_user_id)
            phone = s.get("temp_phone", "")
            cid = find_or_create_customer(s["temp_name"], phone, "", source="line")
            data = {
                "customer_id": cid,
                "name": s["temp_name"],
                "phone": phone,
                "email": "",
                "date": s["temp_date"],
                "time": s["temp_time"],
                "menu_id": s.get("temp_menu_id", ""),
                "menu_name": s.get("temp_menu", ""),
                "duration_min": 30,
                "channel": "line",
                "notes": "",
            }
            rid = create_reservation(data)
            upsert_user_session(line_user_id, step="idle",
                                temp_date="", temp_time="", temp_menu_id="",
                                temp_menu="", temp_name="", temp_phone="")
            try:
                send_admin_notification(data, rid)
            except Exception:
                pass
            return [TextMessage(
                text=(
                    f"ご予約を承りました！\n\n"
                    f"予約番号：{rid}\n"
                    f"メニュー：{s['temp_menu']}\n"
                    f"日時：{s['temp_date']} {s['temp_time']}\n"
                    f"お名前：{s['temp_name']}\n\n"
                    f"ご来院をお待ちしております。\n"
                    f"変更・キャンセルはお電話にてお願いします。"
                )
            )]
        # 確定以外の返信
        items = [
            QuickReplyItem(action=MessageAction(label="確定", text="確定")),
            QuickReplyItem(action=MessageAction(label="キャンセル", text="キャンセル")),
        ]
        return [TextMessage(
            text="「確定」または「キャンセル」で返信してください。",
            quick_reply=QuickReply(items=items)
        )]

    upsert_user_session(line_user_id, step="idle")
    return [TextMessage(text="「予約」と送ると予約を開始できます。")]
