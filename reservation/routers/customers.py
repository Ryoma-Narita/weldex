"""
reservation/routers/customers.py
顧客管理API（管理者認証必須）
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import APIRouter, HTTPException, Cookie
from models.schemas import CustomerCreate, CustomerUpdate
from db.database import (
    get_customers, get_customer_by_id, update_customer,
    delete_customer, get_customer_reservations,
    find_or_create_customer,
)
from routers.admin import _require_auth

router = APIRouter(prefix="/admin/customers", tags=["customers"])


@router.get("")
def list_customers(
    keyword:  str = "",
    page:     int = 1,
    per_page: int = 20,
    admin_session: str | None = Cookie(None),
):
    """
    顧客一覧をページネーション付きで返す。

    Args:
        keyword:  名前・カナ・電話・メールで検索
        page:     ページ番号
        per_page: 1ページあたりの件数
    """
    _require_auth(admin_session)
    return get_customers(keyword=keyword, page=page, per_page=per_page)


@router.get("/{customer_id}")
def get_customer(customer_id: int, admin_session: str | None = Cookie(None)):
    """顧客を1件取得する（予約履歴付き）。"""
    _require_auth(admin_session)
    c = get_customer_by_id(customer_id)
    if not c:
        raise HTTPException(status_code=404, detail="顧客が見つかりません")
    c["reservations"] = get_customer_reservations(customer_id)
    return c


@router.post("")
def create_customer(body: CustomerCreate, admin_session: str | None = Cookie(None)):
    """
    顧客を手動登録する。電話番号が既存と重複する場合はそのIDを返す。

    Args:
        body: 顧客情報
    """
    _require_auth(admin_session)
    customer_id = find_or_create_customer(
        name=body.name, phone=body.phone, email=body.email, source="manual"
    )
    # 追加フィールドを更新
    update_data = body.model_dump(exclude={"name", "phone", "email"})
    update_customer(customer_id, update_data)
    return {"id": customer_id, "message": "顧客を登録しました"}


@router.patch("/{customer_id}")
def edit_customer(
    customer_id: int,
    body: CustomerUpdate,
    admin_session: str | None = Cookie(None),
):
    """
    顧客情報を更新する。

    Args:
        customer_id: 顧客ID
        body: 更新フィールド（省略可）
    """
    _require_auth(admin_session)
    if not get_customer_by_id(customer_id):
        raise HTTPException(status_code=404, detail="顧客が見つかりません")
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    update_customer(customer_id, data)
    return {"message": "顧客情報を更新しました"}


@router.delete("/{customer_id}")
def remove_customer(customer_id: int, admin_session: str | None = Cookie(None)):
    """
    顧客を削除する（予約履歴は残す）。

    Args:
        customer_id: 顧客ID
    """
    _require_auth(admin_session)
    if not get_customer_by_id(customer_id):
        raise HTTPException(status_code=404, detail="顧客が見つかりません")
    delete_customer(customer_id)
    return {"message": "顧客を削除しました"}
