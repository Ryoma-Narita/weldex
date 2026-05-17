"""reservation/routers/customers.py — 顧客管理API（管理者認証必須）"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import APIRouter, HTTPException, Header
from models.schemas import CustomerCreate, CustomerUpdate
from db.database import (
    get_customers, get_customer_by_id, find_or_create_customer,
    update_customer, delete_customer, get_customer_reservations,
    validate_session,
)

router = APIRouter(prefix="/admin/customers", tags=["customers"])


def _auth(token: str | None):
    """セッショントークンを検証する。"""
    if not token or not validate_session(token):
        raise HTTPException(status_code=401, detail="認証が必要です")


@router.get("")
def list_customers(
    keyword: str = "",
    page: int = 1,
    per_page: int = 20,
    x_token: str | None = Header(default=None),
):
    """顧客一覧をページネーション付きで返す。"""
    _auth(x_token)
    return get_customers(keyword=keyword, page=page, per_page=per_page)


@router.get("/{customer_id}")
def get_customer(customer_id: int, x_token: str | None = Header(default=None)):
    """顧客詳細と予約履歴を返す。"""
    _auth(x_token)
    c = get_customer_by_id(customer_id)
    if not c:
        raise HTTPException(status_code=404, detail="顧客が見つかりません")
    c["reservations"] = get_customer_reservations(customer_id)
    return c


@router.post("")
def create_customer(body: CustomerCreate, x_token: str | None = Header(default=None)):
    """顧客を手動登録する。"""
    _auth(x_token)
    cid = find_or_create_customer(body.name, body.phone, body.email, source="manual")
    extras = body.model_dump(exclude={"name", "phone", "email"})
    if any(extras.values()):
        update_customer(cid, extras)
    return {"id": cid, "message": "登録しました"}


@router.put("/{customer_id}")
def edit_customer(
    customer_id: int,
    body: CustomerUpdate,
    x_token: str | None = Header(default=None),
):
    """顧客情報を更新する。"""
    _auth(x_token)
    if not get_customer_by_id(customer_id):
        raise HTTPException(status_code=404, detail="顧客が見つかりません")
    update_customer(customer_id, body.model_dump())
    return {"message": "更新しました"}


@router.delete("/{customer_id}")
def remove_customer(customer_id: int, x_token: str | None = Header(default=None)):
    """顧客を削除する。"""
    _auth(x_token)
    if not get_customer_by_id(customer_id):
        raise HTTPException(status_code=404, detail="顧客が見つかりません")
    delete_customer(customer_id)
    return {"message": "削除しました"}
