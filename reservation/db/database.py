"""
reservation/db/database.py
予約システム SQLite CRUD
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
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    """テーブルを初期化する（存在しない場合のみ作成）。"""
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS customers (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT NOT NULL,
                name_kana   TEXT DEFAULT '',
                phone       TEXT DEFAULT '',
                email       TEXT DEFAULT '',
                birthdate   TEXT DEFAULT '',
                gender      TEXT DEFAULT '',
                address     TEXT DEFAULT '',
                notes       TEXT DEFAULT '',
                source      TEXT DEFAULT 'web',
                created_at  TEXT DEFAULT (datetime('now', 'localtime')),
                updated_at  TEXT DEFAULT (datetime('now', 'localtime'))
            );

            CREATE TABLE IF NOT EXISTS reservations (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id  INTEGER,
                name         TEXT NOT NULL,
                phone        TEXT DEFAULT '',
                email        TEXT DEFAULT '',
                date         TEXT NOT NULL,
                time         TEXT NOT NULL,
                menu_id      TEXT DEFAULT '',
                menu_name    TEXT DEFAULT '',
                duration_min INTEGER DEFAULT 30,
                status       TEXT DEFAULT 'confirmed',
                channel      TEXT DEFAULT 'web',
                notes        TEXT DEFAULT '',
                remind_sent  INTEGER DEFAULT 0,
                cancelled_at TEXT DEFAULT '',
                created_at   TEXT DEFAULT (datetime('now', 'localtime')),
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            );

            CREATE TABLE IF NOT EXISTS closed_dates (
                id     INTEGER PRIMARY KEY AUTOINCREMENT,
                date   TEXT UNIQUE NOT NULL,
                reason TEXT DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS admin_sessions (
                token      TEXT PRIMARY KEY,
                created_at TEXT DEFAULT (datetime('now', 'localtime')),
                expires_at TEXT
            );

            CREATE TABLE IF NOT EXISTS menus (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                name         TEXT NOT NULL,
                duration_min INTEGER DEFAULT 30,
                price        INTEGER DEFAULT 0,
                active       INTEGER DEFAULT 1
            );
        """)
        # デフォルトメューがなければ追加
        count = conn.execute("SELECT COUNT(*) FROM menus").fetchone()[0]
        if count == 0:
            conn.executemany(
                "INSERT INTO menus (name, duration_min, price) VALUES (?,?,?)",
                [("初診", 60, 0), ("再診", 30, 0), ("クリーニング", 45, 0)]
            )


# ── 予約 ────────────────────────────────────────

def get_reservations_by_date(date: str) -> list:
    """指定日の予約一覧を返す。"""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM reservations WHERE date=? AND status != 'cancelled' ORDER BY time",
            (date,)
        ).fetchall()
    return [dict(r) for r in rows]


def get_reserved_times(date: str) -> list[str]:
    """指定日の予約済み時間リストを返す。"""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT time FROM reservations WHERE date=? AND status != 'cancelled'",
            (date,)
        ).fetchall()
    return [r["time"] for r in rows]


def create_reservation(data: dict) -> int:
    """予約を作成して新規IDを返す。"""
    with get_conn() as conn:
        cur = conn.execute("""
            INSERT INTO reservations
              (customer_id, name, phone, email, date, time, menu_id, menu_name, duration_min, channel, notes)
            VALUES
              (:customer_id, :name, :phone, :email, :date, :time, :menu_id, :menu_name, :duration_min, :channel, :notes)
        """, data)
        return cur.lastrowid


def update_reservation_status(reservation_id: int, status: str) -> None:
    """予約ステータスを更新する。"""
    extra = ", cancelled_at = datetime('now','localtime')" if status == 'cancelled' else ""
    with get_conn() as conn:
        conn.execute(
            f"UPDATE reservations SET status=? {extra} WHERE id=?",
            (status, reservation_id)
        )


def get_reservation_by_id(reservation_id: int) -> dict | None:
    """IDで予約を1件取得する。"""
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM reservations WHERE id=?", (reservation_id,)).fetchone()
    return dict(row) if row else None


def get_remind_targets(date: str) -> list:
    """翌日予約でリマインド未送信・メールありの予約を取得する。"""
    with get_conn() as conn:
        rows = conn.execute("""
            SELECT * FROM reservations
            WHERE date=? AND status='confirmed'
              AND remind_sent=0 AND email != ''
        """, (date,)).fetchall()
    return [dict(r) for r in rows]


def mark_remind_sent(reservation_id: int) -> None:
    """リマインド送信済みフラグを立てる。"""
    with get_conn() as conn:
        conn.execute("UPDATE reservations SET remind_sent=1 WHERE id=?", (reservation_id,))


# ── 顧客 ────────────────────────────────────────

def find_or_create_customer(name: str, phone: str, email: str, source: str = "web") -> int:
    """
    電話番号で既存顧客を検索し、なければ新規作成してIDを返す。
    """
    normalized_phone = phone.replace("-", "").replace(" ", "")
    with get_conn() as conn:
        if normalized_phone:
            row = conn.execute(
                "SELECT id FROM customers WHERE REPLACE(REPLACE(phone,'-',''),' ','') = ?",
                (normalized_phone,)
            ).fetchone()
            if row:
                return row["id"]
        cur = conn.execute(
            "INSERT INTO customers (name, phone, email, source) VALUES (?,?,?,?)",
            (name, phone, email, source)
        )
        return cur.lastrowid


def get_customers(keyword: str = "", page: int = 1, per_page: int = 20) -> dict:
    """顧客一覧をページネーション付きで返す。"""
    conditions, params = [], []
    if keyword:
        conditions.append("(name LIKE ? OR name_kana LIKE ? OR phone LIKE ? OR email LIKE ?)")
        params.extend([f"%{keyword}%"] * 4)
    where  = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    offset = (page - 1) * per_page
    with get_conn() as conn:
        total = conn.execute(f"SELECT COUNT(*) FROM customers {where}", params).fetchone()[0]
        rows  = conn.execute(
            f"SELECT * FROM customers {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
            params + [per_page, offset]
        ).fetchall()
    return {"total": total, "page": page, "items": [dict(r) for r in rows]}


def get_customer_by_id(customer_id: int) -> dict | None:
    """顧客を1件取得する。"""
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM customers WHERE id=?", (customer_id,)).fetchone()
    return dict(row) if row else None


def update_customer(customer_id: int, data: dict) -> None:
    """顧客情報を更新する。"""
    fields = ["name","name_kana","phone","email","birthdate","gender","address","notes"]
    sets   = ", ".join(f"{f}=?" for f in fields if f in data)
    vals   = [data[f] for f in fields if f in data] + [customer_id]
    if not sets:
        return
    with get_conn() as conn:
        conn.execute(
            f"UPDATE customers SET {sets}, updated_at=datetime('now','localtime') WHERE id=?", vals
        )


def delete_customer(customer_id: int) -> None:
    """顧客を削除する（予約は残す）。"""
    with get_conn() as conn:
        conn.execute("DELETE FROM customers WHERE id=?", (customer_id,))


def get_customer_reservations(customer_id: int) -> list:
    """顧客の予約履歴を返す。"""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM reservations WHERE customer_id=? ORDER BY date DESC, time DESC",
            (customer_id,)
        ).fetchall()
    return [dict(r) for r in rows]


# ── 休業日 ────────────────────────────────────────

def get_closed_dates() -> list[str]:
    """休業日リストを返す。"""
    with get_conn() as conn:
        rows = conn.execute("SELECT date FROM closed_dates ORDER BY date").fetchall()
    return [r["date"] for r in rows]


def add_closed_date(date: str, reason: str = "") -> None:
    """休業日を登録する。"""
    with get_conn() as conn:
        conn.execute("INSERT OR IGNORE INTO closed_dates (date, reason) VALUES (?,?)", (date, reason))


def remove_closed_date(date: str) -> None:
    """休業日を削除する。"""
    with get_conn() as conn:
        conn.execute("DELETE FROM closed_dates WHERE date=?", (date,))


# ── メニュー ────────────────────────────────────────

def get_menus() -> list:
    """有効なメニュー一覧を返す。"""
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM menus WHERE active=1 ORDER BY id").fetchall()
    return [dict(r) for r in rows]


# ── 管理セッション ────────────────────────────────────────

def create_session(token: str, expires_at: str) -> None:
    """管理セッションを作成する。"""
    with get_conn() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO admin_sessions (token, expires_at) VALUES (?,?)",
            (token, expires_at)
        )


def validate_session(token: str) -> bool:
    """セッショントークンの有効性を確認する。"""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT 1 FROM admin_sessions WHERE token=? AND expires_at > datetime('now','localtime')",
            (token,)
        ).fetchone()
    return row is not None


def delete_session(token: str) -> None:
    """セッションを削除する。"""
    with get_conn() as conn:
        conn.execute("DELETE FROM admin_sessions WHERE token=?", (token,))


# ── 統計 ────────────────────────────────────────

def get_dashboard_stats() -> dict:
    """ダッシュボード用統計を返す。"""
    from datetime import date, datetime
    today = date.today().isoformat()
    month = today[:7]
    with get_conn() as conn:
        today_count  = conn.execute("SELECT COUNT(*) FROM reservations WHERE date=? AND status='confirmed'", (today,)).fetchone()[0]
        month_count  = conn.execute("SELECT COUNT(*) FROM reservations WHERE date LIKE ? AND status!='cancelled'", (f"{month}%",)).fetchone()[0]
        cancel_count = conn.execute("SELECT COUNT(*) FROM reservations WHERE date LIKE ? AND status='cancelled'", (f"{month}%",)).fetchone()[0]
        total_cust   = conn.execute("SELECT COUNT(*) FROM customers").fetchone()[0]
        total_res    = conn.execute("SELECT COUNT(*) FROM reservations WHERE status!='cancelled'").fetchone()[0]
    cancel_rate = round(cancel_count / (month_count + cancel_count) * 100, 1) if (month_count + cancel_count) > 0 else 0
    return {
        "today": today_count, "month": month_count,
        "cancel_rate": cancel_rate, "total_customers": total_cust, "total_reservations": total_res,
    }
