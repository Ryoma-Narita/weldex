"""
reservation/models/schemas.py
Pydanticスキーマ定義
"""
from pydantic import BaseModel, field_validator
from typing import Optional
import re


class BookingCreate(BaseModel):
    """予約作成リクエスト（患者向けフォーム）。"""
    name:     str
    phone:    str = ""
    email:    str = ""
    date:     str          # YYYY-MM-DD
    time:     str          # HH:MM
    menu_id:  str = ""
    notes:    str = ""
    website:  str = ""     # ハニーポット（人間は送信しない・ボット検知用）

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        """名前が空でないことを検証する。"""
        if not v.strip():
            raise ValueError("名前は必須です")
        return v.strip()

    @field_validator("date")
    @classmethod
    def date_format(cls, v: str) -> str:
        """YYYY-MM-DD形式を検証する。"""
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", v):
            raise ValueError("日付はYYYY-MM-DD形式で入力してください")
        return v

    @field_validator("time")
    @classmethod
    def time_format(cls, v: str) -> str:
        """HH:MM形式を検証する。"""
        if not re.match(r"^\d{2}:\d{2}$", v):
            raise ValueError("時間はHH:MM形式で入力してください")
        return v


class BookingCancel(BaseModel):
    """予約キャンセルリクエスト。"""
    phone: str


class CustomerCreate(BaseModel):
    """顧客手動登録リクエスト。"""
    name:      str
    name_kana: str = ""
    phone:     str = ""
    email:     str = ""
    birthdate: str = ""
    gender:    str = ""
    address:   str = ""
    notes:     str = ""

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        """名前が空でないことを検証する。"""
        if not v.strip():
            raise ValueError("名前は必須です")
        return v.strip()


class CustomerUpdate(BaseModel):
    """顧客情報更新リクエスト。"""
    name:      Optional[str] = None
    name_kana: Optional[str] = None
    phone:     Optional[str] = None
    email:     Optional[str] = None
    birthdate: Optional[str] = None
    gender:    Optional[str] = None
    address:   Optional[str] = None
    notes:     Optional[str] = None


class AdminLogin(BaseModel):
    """管理者ログインリクエスト。"""
    password: str


class ManualReservation(BaseModel):
    """管理者が手動で予約を追加するリクエスト。"""
    customer_id:  Optional[int] = None
    name:         str
    phone:        str = ""
    email:        str = ""
    date:         str
    time:         str
    menu_id:      str = ""
    duration_min: int = 30
    notes:        str = ""

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        """名前が空でないことを検証する。"""
        if not v.strip():
            raise ValueError("名前は必須です")
        return v.strip()


class ClosedDateCreate(BaseModel):
    """休業日登録リクエスト。"""
    date:   str
    reason: str = ""


class StatusUpdate(BaseModel):
    """予約ステータス更新リクエスト。"""
    status: str
