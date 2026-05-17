"""reservation/routers/booking.py — 患者向け予約受付API"""
import os
import sys
from datetime import date, datetime, timedelta
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import APIRouter, HTTPException
from models.schemas import BookingCreate, BookingCancel
from db.database import (
    get_closed_dates, get_reserved_times, get_menus,
    create_reservation, find_or_create_customer,
    get_reservation_by_id, update_reservation_status,
)
from services.mail import send_confirmation, send_admin_notification
from config import SLOT_START, SLOT_END, SLOT_INTERVAL_MIN, ADVANCE_DAYS

router = APIRouter(prefix="/api/booking", tags=["booking"])


def _generate_slots(start: str, end: str, interval: int) -> list[str]:
    """開始〜終了時間のスロット一覧を生成する。"""
    slots = []
    h, m = map(int, start.split(":"))
    eh, em = map(int, end.split(":"))
    current = h * 60 + m
    end_min = eh * 60 + em
    while current < end_min:
        slots.append(f"{current // 60:02d}:{current % 60:02d}")
        current += interval
    return slots


@router.get("/menus")
def list_menus():
    """有効なメニュー一覧を返す。"""
    return get_menus()


@router.get("/available-dates")
def available_dates():
    """今日から ADVANCE_DAYS 日後までの予約可能日一覧を返す。"""
    closed = set(get_closed_dates())
    today = date.today()
    result = []
    for i in range(1, ADVANCE_DAYS + 1):
        d = (today + timedelta(days=i)).isoformat()
        if d not in closed:
            result.append(d)
    return {"dates": result}


@router.get("/available-times/{target_date}")
def available_times(target_date: str):
    """指定日の空き時間スロットを返す。"""
    all_slots = _generate_slots(SLOT_START, SLOT_END, SLOT_INTERVAL_MIN)
    reserved = set(get_reserved_times(target_date))
    slots = [{"time": s, "available": s not in reserved} for s in all_slots]
    return {"date": target_date, "slots": slots}


@router.post("/create")
def create_booking(body: BookingCreate):
    """予約を作成して確認メールを送信する。"""
    reserved = get_reserved_times(body.date)
    if body.time in reserved:
        raise HTTPException(status_code=409, detail="この時間はすでに予約済みです")

    closed = get_closed_dates()
    if body.date in closed:
        raise HTTPException(status_code=400, detail="この日は休業日です")

    customer_id = find_or_create_customer(body.name, body.phone, body.email)

    data = {
        "customer_id": customer_id,
        "name": body.name,
        "phone": body.phone,
        "email": body.email,
        "date": body.date,
        "time": body.time,
        "menu_id": body.menu_id,
        "menu_name": body.menu_name,
        "duration_min": body.duration_min,
        "channel": "web",
        "notes": body.notes,
    }
    rid = create_reservation(data)
    reservation = get_reservation_by_id(rid)

    send_confirmation(reservation)
    send_admin_notification(reservation)

    return {"id": rid, "message": "予約が完了しました"}


@router.delete("/cancel/{reservation_id}")
def cancel_booking(reservation_id: int, body: BookingCancel):
    """電話番号で本人確認してキャンセルする。"""
    r = get_reservation_by_id(reservation_id)
    if not r:
        raise HTTPException(status_code=404, detail="予約が見つかりません")
    if r["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="すでにキャンセル済みです")

    phone_input = body.phone.replace("-", "").replace(" ", "")
    phone_stored = r["phone"].replace("-", "").replace(" ", "")
    if phone_input != phone_stored:
        raise HTTPException(status_code=403, detail="電話番号が一致しません")

    update_reservation_status(reservation_id, "cancelled")
    return {"message": "キャンセルが完了しました"}
