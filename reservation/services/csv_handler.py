"""reservation/services/csv_handler.py — CSV/Excelインポート・エクスポート"""
import csv
import io
import os
import sys
import chardet
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

COLUMN_MAP = {
    "氏名": "name", "名前": "name", "患者名": "name", "お名前": "name",
    "氏名（カナ）": "name_kana", "フリガナ": "name_kana", "カナ": "name_kana", "ふりがな": "name_kana",
    "電話番号": "phone", "電話": "phone", "TEL": "phone", "tel": "phone",
    "メールアドレス": "email", "メール": "email", "mail": "email", "Mail": "email",
    "生年月日": "birthdate", "誕生日": "birthdate",
    "性別": "gender",
    "住所": "address",
    "備考": "notes", "メモ": "notes", "コメント": "notes",
}

ENCODINGS = ["utf-8-sig", "utf-8", "shift-jis", "cp932", "euc-jp"]

EXPORT_HEADERS = ["id", "name", "name_kana", "phone", "email", "birthdate", "gender", "address", "notes", "source", "created_at"]
EXPORT_JP = ["ID", "氏名", "フリガナ", "電話番号", "メールアドレス", "生年月日", "性別", "住所", "備考", "登録元", "登録日時"]


def detect_encoding(raw: bytes) -> str:
    """バイト列の文字コードを自動判定する。"""
    result = chardet.detect(raw)
    detected = result.get("encoding") or "utf-8"
    for enc in ENCODINGS:
        if enc.lower().replace("-", "") == detected.lower().replace("-", ""):
            return enc
    return detected


def parse_csv_bytes(raw: bytes) -> list[dict]:
    """
    CSVバイト列を解析して顧客データリストを返す。
    日本語ヘッダー・文字コード自動判定に対応。
    """
    enc = detect_encoding(raw)
    try:
        text = raw.decode(enc, errors="replace")
    except Exception:
        text = raw.decode("utf-8", errors="replace")

    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames is None:
        return []

    col_map = {}
    for header in reader.fieldnames:
        stripped = (header or "").strip()
        if stripped in COLUMN_MAP:
            col_map[header] = COLUMN_MAP[stripped]

    records = []
    for row in reader:
        record: dict = {}
        for csv_col, db_col in col_map.items():
            val = (row.get(csv_col) or "").strip()
            record[db_col] = val
        if record.get("name"):
            records.append(record)
    return records


def import_customers(raw: bytes) -> dict:
    """
    CSVバイト列から顧客をインポートし、結果サマリを返す。
    電話番号重複はスキップ。
    """
    from db.database import find_or_create_customer, get_conn

    records = parse_csv_bytes(raw)
    imported, skipped, errors = 0, 0, 0

    for rec in records:
        try:
            name = rec.get("name", "")
            phone = rec.get("phone", "")
            email = rec.get("email", "")
            if not name:
                skipped += 1
                continue

            normalized = phone.replace("-", "").replace(" ", "")
            existing_id = None
            if normalized:
                with get_conn() as conn:
                    row = conn.execute(
                        "SELECT id FROM customers WHERE REPLACE(REPLACE(phone,'-',''),' ','') = ?",
                        (normalized,)
                    ).fetchone()
                    if row:
                        existing_id = row["id"]

            if existing_id:
                skipped += 1
                continue

            cid = find_or_create_customer(name, phone, email, source="csv")
            fields = ["name_kana", "birthdate", "gender", "address", "notes"]
            updates = {f: rec[f] for f in fields if rec.get(f)}
            if updates:
                from db.database import update_customer
                update_customer(cid, updates)
            imported += 1
        except Exception:
            errors += 1

    return {"imported": imported, "skipped": skipped, "errors": errors, "total": len(records)}


def export_customers_csv(customers: list[dict]) -> bytes:
    """顧客リストをBOM付きUTF-8 CSVバイト列として返す。"""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(EXPORT_JP)
    for c in customers:
        writer.writerow([c.get(f, "") for f in EXPORT_HEADERS])
    return output.getvalue().encode("utf-8-sig")
