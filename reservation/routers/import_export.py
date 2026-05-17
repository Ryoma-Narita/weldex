"""
reservation/routers/import_export.py
CSVインポート・エクスポートAPI（管理者認証必須）
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import APIRouter, HTTPException, UploadFile, File, Cookie
from fastapi.responses import Response
from db.database import get_customers, get_conn, find_or_create_customer, update_customer
from services.csv_handler import parse_csv_customers, parse_excel_customers, export_customers_csv
from routers.admin import _require_auth

router = APIRouter(prefix="/admin/import-export", tags=["import_export"])


@router.post("/customers/import")
async def import_customers(
    file: UploadFile = File(...),
    admin_session: str | None = Cookie(None),
):
    """
    顧客データをCSV/Excelからインポートする。

    Args:
        file: CSVまたはExcelファイル（.csv/.xlsx）

    Returns:
        {"imported": 件数, "skipped": 件数, "errors": [...]}
    """
    _require_auth(admin_session)

    filename = file.filename or ""
    raw      = await file.read()

    if filename.endswith(".xlsx"):
        customers, errors = parse_excel_customers(raw)
    elif filename.endswith(".csv") or filename.endswith(".txt"):
        customers, errors = parse_csv_customers(raw)
    else:
        raise HTTPException(status_code=400, detail=".csv または .xlsx ファイルをアップロードしてください")

    if not customers and errors:
        raise HTTPException(status_code=400, detail="; ".join(errors))

    imported = 0
    skipped  = 0

    for c in customers:
        try:
            name  = c.get("name", "")
            phone = c.get("phone", "")
            email = c.get("email", "")
            if not name:
                skipped += 1
                continue

            customer_id = find_or_create_customer(name, phone, email, source="csv")
            # 追加フィールド更新
            extra = {k: v for k, v in c.items() if k not in ("name", "phone", "email") and v}
            if extra:
                update_customer(customer_id, extra)
            imported += 1

        except Exception as e:
            errors.append(f"インポートエラー: {e}")
            skipped += 1

    return {"imported": imported, "skipped": skipped, "errors": errors}


@router.get("/customers/export")
def export_customers(admin_session: str | None = Cookie(None)):
    """
    顧客データをCSV（BOM付きUTF-8）としてエクスポートする。

    Returns:
        CSVファイル（ダウンロード）
    """
    _require_auth(admin_session)

    result    = get_customers(per_page=10000)
    customers = result["items"]
    csv_bytes = export_customers_csv(customers)

    return Response(
        content=csv_bytes,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=customers.csv"},
    )
