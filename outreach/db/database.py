"""
outreach/db/database.py
SQLite CRUD操作・テーブル定義
"""
import sqlite3
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import DB_PATH


def get_conn() -> sqlite3.Connection:
    """DBコネクションを取得する。"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """テーブルを初期化する（存在しない場合のみ作成）。"""
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS targets (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                place_id      TEXT UNIQUE,
                name          TEXT NOT NULL,
                address       TEXT,
                phone         TEXT,
                website       TEXT,
                industry      TEXT,
                area          TEXT,
                site_status   TEXT DEFAULT 'unchecked',
                email         TEXT,
                created_at    TEXT DEFAULT (datetime('now', 'localtime')),
                checked_at    TEXT,
                sent_at       TEXT,
                send_status   TEXT DEFAULT 'pending'
            );

            CREATE TABLE IF NOT EXISTS settings (
                key    TEXT PRIMARY KEY,
                value  TEXT
            );

            CREATE TABLE IF NOT EXISTS run_logs (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                level      TEXT NOT NULL,
                category   TEXT NOT NULL,
                message    TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now', 'localtime'))
            );
        """)


def write_log(level: str, category: str, message: str) -> None:
    """実行ログをDBに書き込む。level: INFO / WARN / ERROR"""
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO run_logs (level, category, message) VALUES (?, ?, ?)",
            (level.upper(), category, message)
        )


def upsert_target(data: dict) -> bool:
    """
    ターゲットをDBに挿入する。place_idが重複する場合はスキップ。
    Returns: True=新規挿入 / False=重複スキップ
    """
    with get_conn() as conn:
        try:
            conn.execute("""
                INSERT INTO targets (place_id, name, address, phone, website, industry, area)
                VALUES (:place_id, :name, :address, :phone, :website, :industry, :area)
            """, data)
            return True
        except sqlite3.IntegrityError:
            return False


def get_unchecked_targets(limit: int = 50) -> list:
    """site_status が unchecked のターゲットを取得する。"""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM targets WHERE site_status = 'unchecked' LIMIT ?",
            (limit,)
        ).fetchall()
    return [dict(r) for r in rows]


def update_site_status(target_id: int, status: str, email: str = None) -> None:
    """サイト診断結果をターゲットに反映する。"""
    with get_conn() as conn:
        conn.execute("""
            UPDATE targets
            SET site_status = ?, email = ?, checked_at = datetime('now', 'localtime')
            WHERE id = ?
        """, (status, email, target_id))


def get_stats() -> dict:
    """ダッシュボード用の統計情報を返す。"""
    with get_conn() as conn:
        total     = conn.execute("SELECT COUNT(*) FROM targets").fetchone()[0]
        unchecked = conn.execute("SELECT COUNT(*) FROM targets WHERE site_status='unchecked'").fetchone()[0]
        none_     = conn.execute("SELECT COUNT(*) FROM targets WHERE site_status='none'").fetchone()[0]
        old       = conn.execute("SELECT COUNT(*) FROM targets WHERE site_status='old'").fetchone()[0]
        no_mobile = conn.execute("SELECT COUNT(*) FROM targets WHERE site_status='no_mobile'").fetchone()[0]
        phone_only= conn.execute("SELECT COUNT(*) FROM targets WHERE site_status='phone_only'").fetchone()[0]
        ok        = conn.execute("SELECT COUNT(*) FROM targets WHERE site_status='ok'").fetchone()[0]
        with_email= conn.execute("SELECT COUNT(*) FROM targets WHERE email IS NOT NULL AND email != ''").fetchone()[0]
    return {
        "total": total, "unchecked": unchecked,
        "none": none_, "old": old,
        "no_mobile": no_mobile, "phone_only": phone_only,
        "ok": ok, "with_email": with_email,
    }
