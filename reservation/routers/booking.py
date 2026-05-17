"""
reservation/routers/booking.py
患者向け予約API（認証不要）
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import date, timedelta
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
from models.schemas import BookingCreate, BookingCancel
from db.database import (
    get_reserved_times, get_closed_dates,
    create_reservation, get_reservation_by_id,
    update_reservation_status, find_or_create_customer,
    get_menus,
)
from services.mail import send_confirmation, send_admin_notification
from db.database import get_setting
from config import (
    SLOT_START, SLOT_END, SLOT_INTERVAL_MIN, ADVANCE_DAYS, ADMIN_EMAIL
)

router = APIRouter(prefix="/api/booking", tags=["booking"])


def _generate_slots() -> list[str]:
    """
    設定に従って時間スロットを生成する。

    Returns:
        HH:MM形式の時間リスト
    """
    slots = []
    h_start, m_start = map(int, SLOT_START.split(":"))
    h_end,   m_end   = map(int, SLOT_END.split(":"))
    start_min = h_start * 60 + m_start
    end_min   = h_end   * 60 + m_end

    cur = start_min
    while cur < end_min:
        h, m = divmod(cur, 60)
        slots.append(f"{h:02d}:{m:02d}")
        cur += SLOT_INTERVAL_MIN
    return slots


@router.get("/menus")
def list_menus():
    """予約可能なメニュー一覧を返す。"""
    return get_menus()


@router.get("/available-dates")
def available_dates():
    """
    予約可能日の一覧を返す（今日から ADVANCE_DAYS 日分）。
    休業日は除外する。

    Returns:
        {"dates": ["YYYY-MM-DD", ...]}
    """
    closed = set(get_closed_dates())
    result = []
    today  = date.today()

    for i in range(1, ADVANCE_DAYS + 1):
        d = (today + timedelta(days=i)).isoformat()
        if d not in closed:
            result.append(d)

    return {"dates": result}


@router.get("/available-times/{target_date}")
@limiter.limit("30/minute")
def available_times(request: Request, target_date: str):
    """
    指定日の予約可能な時間スロットを返す。

    Args:
        target_date: YYYY-MM-DD

    Returns:
        {"times": ["HH:MM", ...]}
    """
    all_slots  = _generate_slots()
    reserved   = set(get_reserved_times(target_date))
    closed     = get_closed_dates()

    if target_date in closed:
        return {"times": [], "closed": True}

    available = [s for s in all_slots if s not in reserved]
    return {"times": available, "closed": False}


@router.post("/create")
@limiter.limit("5/minute")
def create_booking(request: Request, body: BookingCreate):
    """
    予約を作成する。
    重複チェック・顧客紐付け・確認メール送信を行う。

    Args:
        body: 予約作成リクエスト

    Returns:
        {"id": 予約ID, "message": "予約を承りました"}
    """
    # ハニーポット：ボットが埋めた場合は静かに無視（エラーを返さない）
    if body.website:
        return {"id": 0, "message": "予約を承りました"}

    # 重複チェック
    reserved = get_reserved_times(body.date)
    if body.time in reserved:
        raise HTTPException(status_code=409, detail="この時間はすでに予約済みです")

    # メニュー情報を付加
    menu_name    = ""
    duration_min = 30
    if body.menu_id:
        menus = {str(m["id"]): m for m in get_menus()}
        m = menus.get(str(body.menu_id))
        if m:
            menu_name    = m["name"]
            duration_min = m["duration_min"]

    # 顧客を探すか新規作成
    customer_id = find_or_create_customer(body.name, body.phone, body.email, source="web")

    reservation_data = {
        "customer_id":  customer_id,
        "name":         body.name,
        "phone":        body.phone,
        "email":        body.email,
        "date":         body.date,
        "time":         body.time,
        "menu_id":      body.menu_id,
        "menu_name":    menu_name,
        "duration_min": duration_min,
        "channel":      "web",
        "notes":        body.notes,
    }

    reservation_id = create_reservation(reservation_data)
    reservation_data["id"] = reservation_id

    # 確認メール・管理者通知（失敗してもエラーにしない）
    try:
        send_confirmation(reservation_data)
        admin_email = get_setting("admin_email") or ADMIN_EMAIL
        if admin_email and get_setting("notify_on_booking") == "1":
            send_admin_notification(reservation_data, admin_email)
    except Exception:
        pass

    return {"id": reservation_id, "message": "予約を承りました"}


@router.delete("/cancel/{reservation_id}")
def cancel_booking(reservation_id: int, body: BookingCancel):
    """
    予約をキャンセルする（電話番号で本人確認）。

    Args:
        reservation_id: 予約ID
        body: キャンセルリクエスト（電話番号）
    """
    res = get_reservation_by_id(reservation_id)
    if not res:
        raise HTTPException(status_code=404, detail="予約が見つかりません")
    if res["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="すでにキャンセル済みです")

    # 電話番号で本人確認
    stored_phone  = res.get("phone", "").replace("-", "").replace(" ", "")
    request_phone = body.phone.replace("-", "").replace(" ", "")
    if stored_phone and stored_phone != request_phone:
        raise HTTPException(status_code=403, detail="電話番号が一致しません")

    update_reservation_status(reservation_id, "cancelled")

    # 管理者へキャンセル通知（患者自身のキャンセルのみ・管理者操作は除く）
    try:
        admin_email = get_setting("admin_email") or ADMIN_EMAIL
        if admin_email and get_setting("notify_on_cancel") == "1":
            from services.mail import send_cancel_notification
            send_cancel_notification(res, admin_email)
    except Exception:
        pass

    return {"message": "キャンセルしました"}
