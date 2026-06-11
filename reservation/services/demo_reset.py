"""reservation/services/demo_reset.py — デモ環境の予約・顧客を毎日0時にリセットする。

DEMO_MODE=true の環境変数が設定されている場合のみ main.py から呼ばれる。
本番クライアント環境では絶対に実行されない設計になっている。
"""
from db.database import get_conn


def run_demo_reset() -> None:
    """予約・顧客データを全削除してデモ環境を初期状態に戻す。"""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM reservations")
            cur.execute("DELETE FROM customers")
        conn.commit()
