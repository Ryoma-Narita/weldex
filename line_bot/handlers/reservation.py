"""
line_bot/handlers/reservation.py
LINE予約フロー — 状態遷移ロジック

state: idle → select_date → select_time → select_menu → input_name → confirm → idle
       idle → cancel_select（キャンセルフロー）
"""
import re
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from datetime import date, timedelta
from linebot.v3.messaging import TextMessage

from config import SLOT_START, SLOT_END, SLOT_INTERVAL_MIN, ADVANCE_DAYS
from db.database import (
    get_session, save_session, reset_session, is_timed_out,
    get_reserved_times, create_line_reservation,
    get_user_reservations, cancel_reservation,
    get_menus, get_closed_dates,
    get_active_reservation_count,
    get_setting,
)
from handlers.messages import (
    text_msg, date_select_msg, time_select_msg, menu_select_msg,
    name_input_msg, confirm_msg, complete_msg,
    reservation_list_msg, cancel_select_msg, cancel_confirm_msg,
    cancel_complete_msg, idle_guide_msg,
)

# 「最初から」として扱うキーワード
_RESET_WORDS = frozenset(["最初から", "メニューに戻る", "戻る", "やり直す", "cancel", "リセット"])


def _available_dates() -> list[str]:
    """
    予約可能日を最大7件返す（休業日除外・今日の翌日から）。

    Returns:
        YYYY-MM-DD 形式の日付リスト
    """
    closed = set(get_closed_dates())
    today  = date.today()
    result = []
    for i in range(1, ADVANCE_DAYS + 1):
        d = (today + timedelta(days=i)).isoformat()
        if d not in closed:
            result.append(d)
        if len(result) >= 7:
            break
    return result


def _available_times(target_date: str) -> tuple[list[str], bool]:
    """
    指定日の予約可能スロットを返す。

    Args:
        target_date: YYYY-MM-DD

    Returns:
        (times, truncated): 最大12件のスロットと、超過して切り捨てたかどうか
    """
    h_start, m_start = map(int, SLOT_START.split(":"))
    h_end,   m_end   = map(int, SLOT_END.split(":"))
    start_min = h_start * 60 + m_start
    end_min   = h_end   * 60 + m_end

    all_slots: list[str] = []
    cur = start_min
    while cur < end_min:
        h, m = divmod(cur, 60)
        all_slots.append(f"{h:02d}:{m:02d}")
        cur += SLOT_INTERVAL_MIN

    reserved  = set(get_reserved_times(target_date))
    available = [s for s in all_slots if s not in reserved]
    truncated = len(available) > 12
    return available[:12], truncated


# ─── メインディスパッチャ ─────────────────────────────

def handle_message(
    line_user_id: str,
    text: str,
    display_name: str = "",
) -> list[TextMessage]:
    """
    受信テキストを処理して返信メッセージリストを返す。

    Args:
        line_user_id:  LINE ユーザーID
        text:          受信テキスト
        display_name:  LINE表示名（名前入力のヒントとして使用）

    Returns:
        返信メッセージのリスト（最大5件）
    """
    text = text.strip()

    # タイムアウト → idleにリセット
    if is_timed_out(line_user_id):
        reset_session(line_user_id)

    session = get_session(line_user_id)
    step    = session.get("step", "idle")

    # どのステップからでも「最初から」を受け付ける
    if text in _RESET_WORDS:
        reset_session(line_user_id)
        return [idle_guide_msg()]

    handlers = {
        "idle":          _idle,
        "select_date":   _select_date,
        "select_time":   _select_time,
        "select_menu":   _select_menu,
        "input_name":    _input_name,
        "confirm":       _confirm,
        "cancel_select": _cancel_select,
    }
    return handlers.get(step, _idle)(line_user_id, text, session, display_name)


# ─── ステップ別ハンドラ ──────────────────────────────

def _idle(
    line_user_id: str, text: str, session: dict, display_name: str
) -> list[TextMessage]:
    """idle状態：予約開始・確認・キャンセルを振り分ける。"""
    if "予約する" in text:
        # ④ 確定済み予約が1件以上ある場合は新規予約を弾く
        if get_active_reservation_count(line_user_id) >= 1:
            reservations = get_user_reservations(line_user_id)
            return [
                text_msg(
                    "すでにご予約が入っています。\n"
                    "変更の場合は現在の予約をキャンセルしてから再度ご予約ください。"
                ),
                reservation_list_msg(reservations),
            ]
        dates = _available_dates()
        if not dates:
            return [text_msg("現在予約可能な日がありません。\nお電話にてお問い合わせください。")]
        save_session(line_user_id, step="select_date")
        return [date_select_msg(dates)]

    if "予約確認" in text:
        reservations = get_user_reservations(line_user_id)
        return [reservation_list_msg(reservations)]

    if "キャンセル" in text:
        reservations = get_user_reservations(line_user_id)
        if not reservations:
            return [text_msg("現在キャンセルできる予約はありません。")]
        save_session(line_user_id, step="cancel_select")
        if len(reservations) == 1:
            return [cancel_confirm_msg(reservations[0])]
        return [cancel_select_msg(reservations)]

    return [idle_guide_msg()]


def _select_date(
    line_user_id: str, text: str, session: dict, display_name: str
) -> list[TextMessage]:
    """日付選択ステップ：YYYY-MM-DD 形式のテキストを受け付ける。"""
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", text):
        return [text_msg("日付をボタンで選んでください。"), date_select_msg(_available_dates())]

    if text in set(get_closed_dates()):
        return [text_msg("その日は休業日です。"), date_select_msg(_available_dates())]

    times, truncated = _available_times(text)
    if not times:
        return [text_msg("その日は満席です。別の日を選んでください。"),
                date_select_msg(_available_dates())]

    save_session(line_user_id, step="select_time", temp_date=text)
    return [time_select_msg(times, truncated)]


def _select_time(
    line_user_id: str, text: str, session: dict, display_name: str
) -> list[TextMessage]:
    """時間選択ステップ：HH:MM 形式のテキストを受け付ける。"""
    if not re.match(r"^\d{2}:\d{2}$", text):
        times, truncated = _available_times(session["temp_date"])
        return [text_msg("時間をボタンで選んでください。"), time_select_msg(times, truncated)]

    # 直前に他ユーザーが取った可能性を再確認
    if text in set(get_reserved_times(session["temp_date"])):
        times, truncated = _available_times(session["temp_date"])
        return [text_msg("申し訳ありません。その時間は直前に予約が入りました。\n別の時間を選んでください。"),
                time_select_msg(times, truncated)]

    save_session(line_user_id, step="select_menu",
                 temp_date=session["temp_date"], temp_time=text)
    return [menu_select_msg(get_menus())]


def _select_menu(
    line_user_id: str, text: str, session: dict, display_name: str
) -> list[TextMessage]:
    """メニュー選択ステップ：メニュー名のテキストを受け付ける。"""
    all_menus   = get_menus()
    menus_by_name = {m["name"]: m for m in all_menus}

    if text not in menus_by_name:
        return [text_msg("メニューをボタンで選んでください。"),
                menu_select_msg(all_menus)]

    menu = menus_by_name[text]
    save_session(line_user_id, step="input_name",
                 temp_date=session["temp_date"],
                 temp_time=session["temp_time"],
                 temp_menu_id=str(menu["id"]))   # DBにはIDで保存
    return [name_input_msg(display_name)]


def _input_name(
    line_user_id: str, text: str, session: dict, display_name: str
) -> list[TextMessage]:
    """名前入力ステップ：任意テキストを名前として受け付ける。"""
    if not (1 <= len(text) <= 50):
        return [text_msg("お名前を50文字以内で入力してください。")]

    menus     = {str(m["id"]): m for m in get_menus()}
    menu_name = menus.get(session["temp_menu_id"], {}).get("name", "")

    save_session(line_user_id, step="confirm",
                 temp_date=session["temp_date"],
                 temp_time=session["temp_time"],
                 temp_menu_id=session["temp_menu_id"],
                 temp_name=text)
    return [confirm_msg(session["temp_date"], session["temp_time"], menu_name, text)]


def _confirm(
    line_user_id: str, text: str, session: dict, display_name: str
) -> list[TextMessage]:
    """確認ステップ：「確定する」で予約を作成する。"""
    menus     = {str(m["id"]): m for m in get_menus()}
    menu_name = menus.get(session["temp_menu_id"], {}).get("name", "")

    if text != "確定する":
        return [confirm_msg(
            session["temp_date"], session["temp_time"],
            menu_name, session["temp_name"],
        )]

    # 最終空き確認（レースコンディション対策）
    if session["temp_time"] in set(get_reserved_times(session["temp_date"])):
        reset_session(line_user_id)
        return [text_msg(
            "申し訳ありません。確定直前に別の方が予約されました。\n"
            "「予約する」から再度お試しください。"
        )]

    reservation_id = create_line_reservation(
        line_user_id=line_user_id,
        name=session["temp_name"],
        date=session["temp_date"],
        time=session["temp_time"],
        menu_id=session["temp_menu_id"],
    )
    reset_session(line_user_id)

    # 管理者通知（失敗してもフローを止めない）
    try:
        admin_email = get_setting("admin_email")
        if admin_email and get_setting("notify_on_booking") == "1":
            from services.mail import send_admin_notification
            menus_map = {str(m["id"]): m for m in get_menus()}
            m = menus_map.get(str(session["temp_menu_id"]))
            send_admin_notification({
                "name":      session["temp_name"],
                "phone":     "",
                "date":      session["temp_date"],
                "time":      session["temp_time"],
                "menu_name": m["name"] if m else "",
            }, admin_email)
    except Exception:
        pass

    return [complete_msg(session["temp_date"], session["temp_time"], menu_name)]


def _cancel_select(
    line_user_id: str, text: str, session: dict, display_name: str
) -> list[TextMessage]:
    """キャンセル選択ステップ。"""
    # 「do_cancel_<id>」: 確定実行
    m = re.fullmatch(r"do_cancel_(\d+)", text)
    if m:
        reservation_id = int(m.group(1))
        cancel_reservation(reservation_id)
        reset_session(line_user_id)
        return [cancel_complete_msg()]  # ② キャンセル完了→再予約促進

    # 「cancel_<id>」: 確認画面を表示
    m = re.fullmatch(r"cancel_(\d+)", text)
    if m:
        reservation_id = int(m.group(1))
        # 自分の予約か確認
        user_res = {r["id"]: r for r in get_user_reservations(line_user_id)}
        if reservation_id in user_res:
            return [cancel_confirm_msg(user_res[reservation_id])]

    # 不明な入力 → 再表示
    reservations = get_user_reservations(line_user_id)
    if not reservations:
        reset_session(line_user_id)
        return [text_msg("キャンセルできる予約はありません。")]
    return [cancel_select_msg(reservations)]
