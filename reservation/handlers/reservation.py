"""reservation/handlers/reservation.py — LINE予約ステートマシン"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import date, timedelta, datetime
from linebot.v3.messaging import (
    TextMessage, QuickReply, QuickReplyItem,
    MessageAction, PostbackAction,
)
from db.database import (
    get_user_session, upsert_user_session,
    get_menus, get_closed_dates, get_reserved_times,
    create_reservation, find_or_create_customer,
    get_reservation_by_id, update_reservation_status,
    get_reservations_by_date,
)
from config import SLOT_START, SLOT_END, SLOT_INTERVAL_MIN, ADVANCE_DAYS, APP_NAME
from services.mail import send_confirmation, send_admin_notification


def _fmt_date(date_str: str) -> str:
    """2026-05-18 → 5月18日"""
    d = datetime.strptime(date_str, "%Y-%m-%d")
    return f"{d.month}月{d.day}日"


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
        QuickReplyItem(action=PostbackAction(
            label=m["name"][:20],
            data=f"menu:{m['id']}:{m['name']}:{m['duration_min']}",
            display_text=m["name"]
        ))
        for m in menus
    ]
    return QuickReply(items=items)


def _time_qr(slots: list[str]) -> QuickReply:
    """時間選択クイックリプライを生成する（最大13件）。"""
    items = [
        QuickReplyItem(action=PostbackAction(
            label=s,
            data=f"time:{s}",
            display_text=s
        ))
        for s in slots[:13]
    ]
    return QuickReply(items=items)


def _date_qr(dates: list[str]) -> QuickReply:
    """日付選択クイックリプライを生成する（最大7件）。"""
    items = [
        QuickReplyItem(action=PostbackAction(
            label=_fmt_date(d),
            data=f"date:{d}",
            display_text=_fmt_date(d)
        ))
        for d in dates[:7]
    ]
    return QuickReply(items=items)


def _find_reservation_by_phone(phone: str) -> dict | None:
    """電話番号で直近の予約を1件取得する。"""
    import psycopg2
    import psycopg2.extras
    from config import DATABASE_URL
    normalized = phone.replace("-", "").replace(" ", "")
    with psycopg2.connect(DATABASE_URL) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT r.* FROM reservations r
                WHERE REPLACE(REPLACE(r.phone,'-',''),' ','') = %s
                  AND r.status = 'confirmed'
                  AND r.date >= %s
                ORDER BY r.date ASC, r.time ASC
                LIMIT 1
            """, (normalized, date.today().isoformat()))
            row = cur.fetchone()
    return dict(row) if row else None


def handle_message(line_user_id: str, text: str) -> list:
    """LINEメッセージを処理してレスポンスメッセージリストを返す。"""
    sess = get_user_session(line_user_id)
    step = sess.get("step", "idle")

    # キャンセルワード（どのステップでも受け付ける）
    if text in ("キャンセル", "やめる", "cancel", "戻る", "confirm:no"):
        upsert_user_session(line_user_id, step="idle")
        return [TextMessage(text="了解です！またいつでもお声がけください😊\n「予約」と送ると予約を開始できます。")]

    # ── 予約確認・変更・キャンセル ──────────────────────
    if text in ("予約確認", "変更", "予約変更", "予約キャンセル", "my_reservation"):
        upsert_user_session(line_user_id, step="my_res_phone")
        return [TextMessage(text="📋 ご予約の確認・変更をします。\n\nご登録の電話番号を入力してください。\n（例：090-1234-5678）")]

    if step == "my_res_phone":
        phone = text.strip().replace("-", "").replace(" ", "")
        if len(phone) < 10 or not phone.isdigit():
            return [TextMessage(text="正しい電話番号を入力してください📱\n（例：090-1234-5678）")]
        res = _find_reservation_by_phone(text.strip())
        if not res:
            upsert_user_session(line_user_id, step="idle")
            return [TextMessage(text="ご予約が見つかりませんでした😔\n\nご不明な点はお電話でお問い合わせください。")]
        upsert_user_session(line_user_id, step="my_res_action",
                            temp_date=str(res["id"]))  # IDをtemp_dateに仮保存
        items = [
            QuickReplyItem(action=PostbackAction(label="日程を変更する", data="res:change_date", display_text="日程を変更する")),
            QuickReplyItem(action=PostbackAction(label="キャンセルする", data="res:cancel", display_text="キャンセルする")),
            QuickReplyItem(action=PostbackAction(label="戻る", data="キャンセル", display_text="戻る")),
        ]
        return [TextMessage(
            text=(
                f"📅 ご予約内容\n\n"
                f"メニュー：{res['menu_name']}\n"
                f"日時：{_fmt_date(res['date'])} {res['time']}\n"
                f"お名前：{res['name']}\n\n"
                f"どうされますか？"
            ),
            quick_reply=QuickReply(items=items)
        )]

    if step == "my_res_action":
        res_id = int(sess.get("temp_date", "0"))
        if text == "res:cancel":
            update_reservation_status(res_id, "cancelled")
            upsert_user_session(line_user_id, step="idle", temp_date="")
            return [TextMessage(text="ご予約をキャンセルしました。\nまのご来院をお待ちしております🌸\n\n「予約」でいつでも再予約できます。")]
        if text == "res:change_date":
            upsert_user_session(line_user_id, step="my_res_change_date")
            dates = _available_dates()
            return [TextMessage(
                text="新しい日付を選択してください📅",
                quick_reply=_date_qr(dates)
            )]
        return [TextMessage(text="ボタンから選択してください。")]

    if step == "my_res_change_date":
        if text.startswith("date:"):
            new_date = text[5:]
            slots = _gen_slots(new_date)
            if not slots:
                dates = _available_dates()
                return [TextMessage(
                    text=f"{_fmt_date(new_date)} は満席または休業日です😔\n別の日付を選択してください。",
                    quick_reply=_date_qr(dates)
                )]
            upsert_user_session(line_user_id, step="my_res_change_time", temp_time=new_date)
            return [TextMessage(
                text=f"{_fmt_date(new_date)} の空き時間を選択してください⏰",
                quick_reply=_time_qr(slots)
            )]
        return [TextMessage(text="日付をボタンから選択してください。", quick_reply=_date_qr(_available_dates()))]

    if step == "my_res_change_time":
        if text.startswith("time:"):
            new_time = text[5:]
            new_date = sess.get("temp_time", "")
            res_id = int(sess.get("temp_date", "0"))
            res = get_reservation_by_id(res_id)
            if res:
                import psycopg2
                from config import DATABASE_URL
                with psycopg2.connect(DATABASE_URL) as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            "UPDATE reservations SET date=%s, time=%s WHERE id=%s",
                            (new_date, new_time, res_id)
                        )
                    conn.commit()
            upsert_user_session(line_user_id, step="idle", temp_date="", temp_time="")
            return [TextMessage(
                text=(
                    f"✅ ご予約を変更しました！\n\n"
                    f"新しい日時：{_fmt_date(new_date)} {new_time}\n\n"
                    f"ご来院をお待ちしております🌸"
                )
            )]
        slots = _gen_slots(sess.get("temp_time", ""))
        return [TextMessage(text="時間をボタンから選択してください。", quick_reply=_time_qr(slots))]

    # ── 新規予約フロー ──────────────────────────────────
    if step == "idle":
        if text in ("予約", "よやく", "reserve", "booking", "予約する"):
            menus = get_menus()
            if not menus:
                return [TextMessage(text="現在メニューが登録されていません。\nお電話でお問い合わせください🙏")]
            upsert_user_session(line_user_id, step="select_menu")
            return [TextMessage(
                text=f"✨ ご予約を承ります！\nメニューを選択してください👇",
                quick_reply=_menu_qr(menus)
            )]
        return [TextMessage(
            text="「予約」と送ると予約を開始できます😊\n「予約確認」で予約の確認・変更ができます。"
        )]

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
                    return [TextMessage(text="現在予約可能な日程がありません😔\nお電話でお問い合わせください。")]
                return [TextMessage(
                    text=f"メニュー：{menu_name} ✅\n\n日付を選択してください📅",
                    quick_reply=_date_qr(dates)
                )]
        menus = get_menus()
        return [TextMessage(text="メニューをボタンから選択してください👇", quick_reply=_menu_qr(menus))]

    # 日付選択
    if step == "select_date":
        if text.startswith("date:"):
            date_str = text[5:]
            slots = _gen_slots(date_str)
            if not slots:
                dates = _available_dates()
                return [TextMessage(
                    text=f"{_fmt_date(date_str)} は満席または休業日です😔\n別の日付を選択してください。",
                    quick_reply=_date_qr(dates)
                )]
            upsert_user_session(line_user_id, step="select_time", temp_date=date_str)
            return [TextMessage(
                text=f"日付：{_fmt_date(date_str)} ✅\n\n時間を選択してください⏰",
                quick_reply=_time_qr(slots)
            )]
        return [TextMessage(text="日付をボタンから選択してください📅", quick_reply=_date_qr(_available_dates()))]

    # 時間選択
    if step == "select_time":
        if text.startswith("time:"):
            time_str = text[5:]
            upsert_user_session(line_user_id, step="input_name", temp_time=time_str)
            return [TextMessage(text=f"時間：{time_str} ✅\n\nお名前をフルネームで入力してください😊\n（例：山田太郎）")]
        slots = _gen_slots(sess.get("temp_date", ""))
        return [TextMessage(text="時間をボタンから選択してください⏰", quick_reply=_time_qr(slots))]

    # 名前入力
    if step == "input_name":
        if len(text.strip()) < 1:
            return [TextMessage(text="お名前を入力してください😊")]
        upsert_user_session(line_user_id, step="input_phone", temp_name=text.strip())
        return [TextMessage(text=f"お名前：{text.strip()} ✅\n\nお電話番号を入力してください📱\n（例：090-1234-5678）")]

    # 電話番号入力
    if step == "input_phone":
        phone = text.strip().replace("-", "").replace(" ", "")
        if len(phone) < 10 or not phone.isdigit():
            return [TextMessage(text="正しい電話番号を入力してください📱\n（例：090-1234-5678）")]
        upsert_user_session(line_user_id, step="confirm", temp_phone=text.strip())
        s = get_user_session(line_user_id)
        confirm_text = (
            f"📋 予約内容の確認\n"
            f"─────────────\n"
            f"メニュー：{s['temp_menu']}\n"
            f"日時：{_fmt_date(s['temp_date'])} {s['temp_time']}\n"
            f"お名前：{s['temp_name']}\n"
            f"電話番号：{text.strip()}\n"
            f"─────────────\n"
            f"この内容でよろしいですか？"
        )
        items = [
            QuickReplyItem(action=PostbackAction(label="✅ 確定する", data="confirm:yes", display_text="確定する")),
            QuickReplyItem(action=PostbackAction(label="❌ キャンセル", data="confirm:no", display_text="キャンセル")),
        ]
        return [TextMessage(text=confirm_text, quick_reply=QuickReply(items=items))]

    # 確認・確定
    if step == "confirm":
        if text in ("確定", "confirm:yes"):
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
                    f"🎉 ご予約が完了しました！\n\n"
                    f"予約番号：{rid}\n"
                    f"メニュー：{s['temp_menu']}\n"
                    f"日時：{_fmt_date(s['temp_date'])} {s['temp_time']}\n"
                    f"お名前：{s['temp_name']}\n\n"
                    f"ご来院をお待ちしております🌸\n"
                    f"変更・キャンセルは「予約確認」から、またはお電話にてご連絡ください。"
                )
            )]
        items = [
            QuickReplyItem(action=PostbackAction(label="✅ 確定する", data="confirm:yes", display_text="確定する")),
            QuickReplyItem(action=PostbackAction(label="❌ キャンセル", data="confirm:no", display_text="キャンセル")),
        ]
        return [TextMessage(text="ボタンから選択してください😊", quick_reply=QuickReply(items=items))]

    upsert_user_session(line_user_id, step="idle")
    return [TextMessage(text="「予約」と送ると予約を開始できます😊\n「予約確認」で予約の確認・変更ができます。")]
