"""reservation/models/schemas.py — Pydanticスキーマ定義"""
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re


class BookingCreate(BaseModel):
    name: str
    phone: str
    email: str = ""
    date: str
    time: str
    menu_id: str = ""
    menu_name: str = ""
    duration_min: int = 30
    notes: str = ""

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        digits = re.sub(r"[\-\s]", "", v)
        if not re.match(r"^0\d{9,10}$", digits):
            raise ValueError("電話番号の形式が正しくありません")
        return v

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", v):
            raise ValueError("日付はYYYY-MM-DD形式で入力してください")
        return v

    @field_validator("time")
    @classmethod
    def validate_time(cls, v: str) -> str:
        if not re.match(r"^\d{2}:\d{2}$", v):
            raise ValueError("時刻はHH:MM形式で入力してください")
        return v


class BookingCancel(BaseModel):
    phone: str


class CustomerCreate(BaseModel):
    name: str
    name_kana: str = ""
    phone: str = ""
    email: str = ""
    birthdate: str = ""
    gender: str = ""
    address: str = ""
    notes: str = ""


class CustomerUpdate(CustomerCreate):
    pass


class AdminLogin(BaseModel):
    password: str


class ClosedDateAdd(BaseModel):
    date: str
    reason: str = ""


class ReservationStatusUpdate(BaseModel):
    status: str
