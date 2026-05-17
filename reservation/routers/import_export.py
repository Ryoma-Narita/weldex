"""reservation/routers/import_export.py — CSVインポート・エクスポートAPI"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import APIRouter, HTTPException, Header, UploadFile, File
from fastapi.responses import Response
from db.database import get_customers, validate_session
from services.csv_handler import import_customers, export_customers_csv

router = APIRouter(prefix="/admin/import-export", tags=["import-export"])


def _auth(token: str | None):
    if not token or not validate_session(token):
        raise HTTPException(status_code=401, detail="認証が必要です")


@router.post("/customers/import")
async def import_csv(
    file: UploadFile = File(...),
    x_token: str | None = Header(default=None),
):
    """CSVファイルから顧客をインポートする。"""
    _auth(x_token)
    if not file.filename:
        raise HTTPException(status_code=400, detail="ファイルが選択されていません")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ("csv", "xlsx", "xls"):
        raise HTTPException(status_code=400, detail="CSV または Excel ファイルを選択してください")

    raw = await file.read()

    if ext in ("xlsx", "xls"):
        raw = _excel_to_csv_bytes(raw)

    result = import_customers(raw)
    return result


def _excel_to_csv_bytes(raw: bytes) -> bytes:
    """ExcelファイルをCSVバイト列に変換する。"""
    import io
    try:
        import openpyxl
        wb = openpyxl.load_workbook(io.BytesIO(raw), data_only=True)
        ws = wb.active
        import csv
        output = io.StringIO()
        writer = csv.writer(output)
        for row in ws.iter_rows(values_only=True):
            writer.writerow([str(c) if c is not None else "" for c in row])
        return output.getvalue().encode("utf-8-sig")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Excelファイルの読み込みに失敗しました: {e}")


@router.get("/customers/export")
def export_csv(x_token: str | None = Header(default=None)):
    """全顧客をBOM付きUTF-8 CSVでエクスポートする。"""
    _auth(x_token)
    result = get_customers(per_page=100000)
    customers = result["items"]
    csv_bytes = export_customers_csv(customers)
    return Response(
        content=csv_bytes,
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": "attachment; filename=customers.csv"},
    )
