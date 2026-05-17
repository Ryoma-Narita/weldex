"""reservation/routers/admin.py — 管理画面API（認証・予約管理・統計）"""
import os
import sys
import secrets
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Header
from models.schemas import AdminLogin, ClosedDateAdd, ReservationStatusUpdate
from db.database import (
    validate_session, create_session, delete_session,
    get_dashboard_stats, get_reservations_by_date,
    get_reservation_by_id, update_reservation_status,
    create_reservation, find_or_create_customer,
    get_closed_dates, add_closed_date, remove_closed_date,
    get_menus,
)
from services.reminder import run_reminder
from config import ADMIN_PASSWORD, SESSION_EXPIRE_HOURS

router = APIRouter(prefix="/admin", tags=["admin"])


def _auth(token: str | None):
    """セッショントークンを検証する。"""
    if not token or not validate_session(token):
        raise HTTPException(status_code=401, detail="認証が必要です")


# ── 認証 ────────────────────────────────────────

@router.post("/login")
def login(body: AdminLogin):
    """パスワード認証してセッショントークンを返す。"""
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="パスワードが正しくありません")
    token = secrets.token_urlsafe(32)
    expires_at = (datetime.now() + timedelta(hours=SESSION_EXPIRE_HOURS)).strftime("%Y-%m-%d %H:%M:%S")
    create_session(token, expires_at)
    return {"token": token, "expires_at": expires_at}


@router.post("/logout")
def logout(x_token: str | None = Header(default=None)):
    """セッションを削除する。"""
    if x_token:
        delete_session(x_token)
    return {"message": "ログアウトしました"}


@router.get("/me")
def me(x_token: str | None = Header(default=None)):
    """トークンの有効性を確認する。"""
    _auth(x_token)
    return {"authenticated": True}


# ── ダッシュボード ────────────────────────────────────────

@router.get("/stats")
def stats(x_token: str | None = Header(default=None)):
    """ダッシュボード統計を返す。"""
    _auth(x_token)
    return get_dashboard_stats()


# ── 予約管理 ────────────────────────────────────────

@router.get("/reservations")
def list_reservations(date: str = "", x_token: str | None = Header(default=None)):
    """指定日（省略時は今日）の予約一覧を返す。"""
    _auth(x_token)
    from datetime import date as dt
    target = date or dt.today().isoformat()
    return {"date": target, "reservations": get_reservations_by_date(target)}


@router.get("/reservations/{reservation_id}")
def get_reservation(reservation_id: int, x_token: str | None = Header(default=None)):
    """予約詳細を返す。"""
    _auth(x_token)
    r = get_reservation_by_id(reservation_id)
    if not r:
        raise HTTPException(status_code=404, detail="予約が見つかりません")
    return r


@router.patch("/reservations/{reservation_id}/status")
def change_status(
    reservation_id: int,
    body: ReservationStatusUpdate,
    x_token: str | None = Header(default=None),
):
    """予約ステータスを変更する。"""
    _auth(x_token)
    allowed = {"confirmed", "cancelled", "done", "no_show"}
    if body.status not in allowed:
        raise HTTPException(status_code=400, detail=f"statusは {allowed} のいずれかを指定してください")
    if not get_reservation_by_id(reservation_id):
        raise HTTPException(status_code=404, detail="予約が見つかりません")
    update_reservation_status(reservation_id, body.status)
    return {"message": "更新しました"}


@router.post("/reservations")
def manual_reservation(body: dict, x_token: str | None = Header(default=None)):
    """手動で予約を追加する。"""
    _auth(x_token)
    cid = find_or_create_customer(
        body.get("name", ""), body.get("phone", ""), body.get("email", ""), source="manual"
    )
    data = {
        "customer_id": cid,
        "name": body.get("name", ""),
        "phone": body.get("phone", ""),
        "email": body.get("email", ""),
        "date": body.get("date", ""),
        "time": body.get("time", ""),
        "menu_id": body.get("menu_id", ""),
        "menu_name": body.get("menu_name", ""),
        "duration_min": body.get("duration_min", 30),
        "channel": "manual",
        "notes": body.get("notes", ""),
    }
    rid = create_reservation(data)
    return {"id": rid, "message": "予約を追加しました"}


# ── 休業日 ────────────────────────────────────────

@router.get("/closed-dates")
def list_closed_dates(x_token: str | None = Header(default=None)):
    """休業日一覧を返す。"""
    _auth(x_token)
    return {"dates": get_closed_dates()}


@router.post("/closed-dates")
def add_closed(body: ClosedDateAdd, x_token: str | None = Header(default=None)):
    """休業日を追加する。"""
    _auth(x_token)
    add_closed_date(body.date, body.reason)
    return {"message": "休業日を追加しました"}


@router.delete("/closed-dates/{date}")
def remove_closed(date: str, x_token: str | None = Header(default=None)):
    """休業日を削除する。"""
    _auth(x_token)
    remove_closed_date(date)
    return {"message": "休業日を削除しました"}


# ── リマインド ────────────────────────────────────────

@router.post("/reminder/run")
def run_reminder_manual(x_token: str | None = Header(default=None)):
    """リマインドを手動実行する。"""
    _auth(x_token)
    result = run_reminder()
    return result


# ── メニュー ────────────────────────────────────────

@router.get("/menus")
def list_menus(x_token: str | None = Header(default=None)):
    """メニュー一覧を返す。"""
    _auth(x_token)
    return get_menus()
