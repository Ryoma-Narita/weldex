"""
reservation/services/csv_handler.py
顧客CSV/Excelインポート・エクスポート
日本語ヘッダー・Shift-JIS・Excel対応
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import csv
import io
import chardet
from typing import Optional

# 日本語→英語カラムマッピング
COLUMN_MAP: dict[str, str] = {
    "氏名": "name", "名前": "name", "患者名": "name", "お名前": "name",
    "氏名（カナ）": "name_kana", "氏名(カナ)": "name_kana",
    "フリガナ": "name_kana", "カナ": "name_kana",
    "電話番号": "phone", "電話": "phone", "TEL": "phone", "Tel": "phone",
    "メールアドレス": "email", "メール": "email", "Email": "email",
    "生年月日": "birthdate", "誕生日": "birthdate",
    "性別": "gender",
    "住所": "address",
    "備考": "notes", "メモ": "notes", "Note": "notes",
}

# 文字コード自動判定順
ENCODINGS = ["utf-8-sig", "utf-8", "shift-jis", "cp932", "euc-jp"]

# エクスポート用日本語ヘッダー
EXPORT_HEADERS = [
    ("id",         "ID"),
    ("name",       "氏名"),
    ("name_kana",  "フリガナ"),
    ("phone",      "電話番号"),
    ("email",      "メールアドレス"),
    ("birthdate",  "生年月日"),
    ("gender",     "性別"),
    ("address",    "住所"),
    ("notes",      "備考"),
    ("source",     "登録元"),
    ("created_at", "登録日時"),
]


def detect_encoding(raw: bytes) -> str:
    """
    バイト列の文字コードを自動判定する。

    Args:
        raw: バイト列

    Returns:
        文字コード名（例：'utf-8'）
    """
    detected = chardet.detect(raw)
    enc = (detected.get("encoding") or "utf-8").lower()
    # cp932/sjisの別名を統一
    if enc in ("shift_jis", "shift-jis", "sjis"):
        enc = "cp932"
    return enc


def parse_csv_customers(raw: bytes) -> tuple[list[dict], list[str]]:
    """
    CSVバイト列を解析して顧客データのリストを返す。

    Args:
        raw: CSVファイルのバイト列

    Returns:
        (顧客データリスト, エラーメッセージリスト)
    """
    errors: list[str] = []
    customers: list[dict] = []

    # 文字コード検出
    enc = detect_encoding(raw)
    try:
        text = raw.decode(enc, errors="replace")
    except Exception:
        text = raw.decode("utf-8", errors="replace")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        return [], ["CSVヘッダーが見つかりません"]

    # ヘッダーマッピング
    col_map: dict[str, str] = {}
    for header in reader.fieldnames:
        h = header.strip()
        if h in COLUMN_MAP:
            col_map[header] = COLUMN_MAP[h]
        # 英語ヘッダーもそのまま受け入れ
        elif h in ("name", "name_kana", "phone", "email", "birthdate", "gender", "address", "notes"):
            col_map[header] = h

    if "name" not in col_map.values():
        errors.append("「氏名」列が見つかりません")
        return [], errors

    for i, row in enumerate(reader, start=2):
        try:
            record: dict = {}
            for src, dst in col_map.items():
                val = row.get(src, "").strip()
                record[dst] = val

            name = record.get("name", "")
            if not name:
                errors.append(f"{i}行目：氏名が空のためスキップ")
                continue

            customers.append(record)

        except Exception as e:
            errors.append(f"{i}行目：{e}")

    return customers, errors


def parse_excel_customers(raw: bytes) -> tuple[list[dict], list[str]]:
    """
    Excelバイト列（.xlsx）を解析して顧客データのリストを返す。

    Args:
        raw: Excelファイルのバイト列

    Returns:
        (顧客データリスト, エラーメッセージリスト)
    """
    try:
        import openpyxl
    except ImportError:
        return [], ["openpyxl がインストールされていません"]

    errors: list[str] = []
    customers: list[dict] = []

    try:
        wb = openpyxl.load_workbook(io.BytesIO(raw), read_only=True, data_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
    except Exception as e:
        return [], [f"Excelファイルの読み込みに失敗: {e}"]

    if not rows:
        return [], ["シートが空です"]

    # ヘッダー行
    headers = [str(h).strip() if h is not None else "" for h in rows[0]]
    col_map: dict[int, str] = {}
    for i, header in enumerate(headers):
        if header in COLUMN_MAP:
            col_map[i] = COLUMN_MAP[header]
        elif header in ("name", "name_kana", "phone", "email", "birthdate", "gender", "address", "notes"):
            col_map[i] = header

    if "name" not in col_map.values():
        return [], ["「氏名」列が見つかりません"]

    for row_num, row in enumerate(rows[1:], start=2):
        try:
            record: dict = {}
            for col_idx, field in col_map.items():
                val = row[col_idx] if col_idx < len(row) else None
                record[field] = str(val).strip() if val is not None else ""

            name = record.get("name", "")
            if not name:
                errors.append(f"{row_num}行目：氏名が空のためスキップ")
                continue

            customers.append(record)

        except Exception as e:
            errors.append(f"{row_num}行目：{e}")

    return customers, errors


def export_customers_csv(customers: list[dict]) -> bytes:
    """
    顧客リストをBOM付きUTF-8のCSVバイト列に変換する。

    Args:
        customers: 顧客データのリスト

    Returns:
        CSVのバイト列（BOM付きUTF-8）
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # 日本語ヘッダー
    writer.writerow([jp for _, jp in EXPORT_HEADERS])

    for c in customers:
        writer.writerow([c.get(key, "") for key, _ in EXPORT_HEADERS])

    # BOM付きUTF-8で返す（Excelで文字化けしない）
    return "﻿".encode("utf-8") + output.getvalue().encode("utf-8")
