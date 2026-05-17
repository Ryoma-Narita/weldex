"""reservation/db/database.py — PostgreSQL CRUD"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import psycopg2
import psycopg2.extras
from config import DATABASE_URL


def get_conn():
    """DBコネクションを取得する。"""
    conn = psycopg2.connect(DATABASE_URL)
    return conn


def _cursor(conn):
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def init_db() -> None:
    """テーブルを初期化する（存在しない場合のみ作成）。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS customers (
                    id          SERIAL PRIMARY KEY,
                    name        TEXT NOT NULL,
                    name_kana   TEXT DEFAULT '',
                    phone       TEXT DEFAULT '',
                    email       TEXT DEFAULT '',
                    birthdate   TEXT DEFAULT '',
                    gender      TEXT DEFAULT '',
                    address     TEXT DEFAULT '',
                    notes       TEXT DEFAULT '',
                    source      TEXT DEFAULT 'web',
                    created_at  TIMESTAMP DEFAULT NOW(),
                    updated_at  TIMESTAMP DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS reservations (
                    id           SERIAL PRIMARY KEY,
                    customer_id  INTEGER REFERENCES customers(id),
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
                    created_at   TIMESTAMP DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS closed_dates (
                    id     SERIAL PRIMARY KEY,
                    date   TEXT UNIQUE NOT NULL,
                    reason TEXT DEFAULT ''
                );

                CREATE TABLE IF NOT EXISTS admin_sessions (
                    token      TEXT PRIMARY KEY,
                    created_at TIMESTAMP DEFAULT NOW(),
                    expires_at TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS menus (
                    id           SERIAL PRIMARY KEY,
                    name         TEXT NOT NULL,
                    duration_min INTEGER DEFAULT 30,
                    price        INTEGER DEFAULT 0,
                    active       INTEGER DEFAULT 1
                );

                CREATE TABLE IF NOT EXISTS user_sessions (
                    line_user_id TEXT PRIMARY KEY,
                    step         TEXT DEFAULT 'idle',
                    temp_date    TEXT DEFAULT '',
                    temp_time    TEXT DEFAULT '',
                    temp_menu_id TEXT DEFAULT '',
                    temp_menu    TEXT DEFAULT '',
                    temp_name    TEXT DEFAULT '',
                    temp_phone   TEXT DEFAULT '',
                    updated_at   TIMESTAMP DEFAULT NOW()
                );
            """)
            # デフォルトメニューがなければ追加
            cur.execute("SELECT COUNT(*) as cnt FROM menus")
            if cur.fetchone()["cnt"] == 0:
                cur.executemany(
                    "INSERT INTO menus (name, duration_min, price) VALUES (%s, %s, %s)",
                    [("初診", 60, 0), ("再診", 30, 0), ("クリーニング", 45, 0)]
                )
        conn.commit()


# ── 予約 ────────────────────────────────────────

def get_reservations_by_date(date: str) -> list:
    """指定日の予約一覧を返す。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute(
                "SELECT * FROM reservations WHERE date=%s AND status != 'cancelled' ORDER BY time",
                (date,)
            )
            return [dict(r) for r in cur.fetchall()]


def get_reserved_times(date: str) -> list[str]:
    """指定日の予約済み時間リストを返す。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute(
                "SELECT time FROM reservations WHERE date=%s AND status != 'cancelled'",
                (date,)
            )
            return [r["time"] for r in cur.fetchall()]


def create_reservation(data: dict) -> int:
    """予約を作成して新規IDを返す。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("""
                INSERT INTO reservations
                  (customer_id, name, phone, email, date, time, menu_id, menu_name, duration_min, channel, notes)
                VALUES
                  (%(customer_id)s, %(name)s, %(phone)s, %(email)s, %(date)s, %(time)s,
                   %(menu_id)s, %(menu_name)s, %(duration_min)s, %(channel)s, %(notes)s)
                RETURNING id
            """, data)
            rid = cur.fetchone()["id"]
        conn.commit()
    return rid


def update_reservation_status(reservation_id: int, status: str) -> None:
    """予約ステータスを更新する。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            if status == 'cancelled':
                cur.execute(
                    "UPDATE reservations SET status=%s, cancelled_at=NOW()::text WHERE id=%s",
                    (status, reservation_id)
                )
            else:
                cur.execute(
                    "UPDATE reservations SET status=%s WHERE id=%s",
                    (status, reservation_id)
                )
        conn.commit()


def get_reservation_by_id(reservation_id: int) -> dict | None:
    """IDで予約を1件取得する。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("SELECT * FROM reservations WHERE id=%s", (reservation_id,))
            row = cur.fetchone()
    return dict(row) if row else None


def get_remind_targets(date: str) -> list:
    """翌日予約でリマインド未送信・メールありの予約を取得する。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("""
                SELECT * FROM reservations
                WHERE date=%s AND status='confirmed'
                  AND remind_sent=0 AND email != ''
            """, (date,))
            return [dict(r) for r in cur.fetchall()]


def mark_remind_sent(reservation_id: int) -> None:
    """リマインド送信済みフラグを立てる。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("UPDATE reservations SET remind_sent=1 WHERE id=%s", (reservation_id,))
        conn.commit()


# ── 顧客 ────────────────────────────────────────

def find_or_create_customer(name: str, phone: str, email: str, source: str = "web") -> int:
    """電話番号で既存顧客を検索し、なければ新規作成してIDを返す。"""
    normalized = phone.replace("-", "").replace(" ", "")
    with get_conn() as conn:
        with _cursor(conn) as cur:
            if normalized:
                cur.execute(
                    "SELECT id FROM customers WHERE REPLACE(REPLACE(phone,'-',''),' ','') = %s",
                    (normalized,)
                )
                row = cur.fetchone()
                if row:
                    return row["id"]
            cur.execute(
                "INSERT INTO customers (name, phone, email, source) VALUES (%s, %s, %s, %s) RETURNING id",
                (name, phone, email, source)
            )
            cid = cur.fetchone()["id"]
        conn.commit()
    return cid


def get_customers(keyword: str = "", page: int = 1, per_page: int = 20) -> dict:
    """顧客一覧をページネーション付きで返す。"""
    conditions, params = [], []
    if keyword:
        conditions.append("(name ILIKE %s OR name_kana ILIKE %s OR phone ILIKE %s OR email ILIKE %s)")
        params.extend([f"%{keyword}%"] * 4)
    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    offset = (page - 1) * per_page
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute(f"SELECT COUNT(*) as cnt FROM customers {where}", params)
            total = cur.fetchone()["cnt"]
            cur.execute(
                f"SELECT * FROM customers {where} ORDER BY created_at DESC LIMIT %s OFFSET %s",
                params + [per_page, offset]
            )
            items = [dict(r) for r in cur.fetchall()]
    return {"total": total, "page": page, "items": items}


def get_customer_by_id(customer_id: int) -> dict | None:
    """顧客を1件取得する。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("SELECT * FROM customers WHERE id=%s", (customer_id,))
            row = cur.fetchone()
    return dict(row) if row else None


def update_customer(customer_id: int, data: dict) -> None:
    """顧客情報を更新する。"""
    fields = ["name", "name_kana", "phone", "email", "birthdate", "gender", "address", "notes"]
    sets = ", ".join(f"{f}=%s" for f in fields if f in data)
    vals = [data[f] for f in fields if f in data] + [customer_id]
    if not sets:
        return
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute(f"UPDATE customers SET {sets}, updated_at=NOW() WHERE id=%s", vals)
        conn.commit()


def delete_customer(customer_id: int) -> None:
    """顧客を削除する（予約は残す）。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("DELETE FROM customers WHERE id=%s", (customer_id,))
        conn.commit()


def get_customer_reservations(customer_id: int) -> list:
    """顧客の予約履歴を返す。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute(
                "SELECT * FROM reservations WHERE customer_id=%s ORDER BY date DESC, time DESC",
                (customer_id,)
            )
            return [dict(r) for r in cur.fetchall()]


# ── 休業日 ────────────────────────────────────────

def get_closed_dates() -> list[str]:
    """休業日リストを返す。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("SELECT date FROM closed_dates ORDER BY date")
            return [r["date"] for r in cur.fetchall()]


def add_closed_date(date: str, reason: str = "") -> None:
    """休業日を登録する。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute(
                "INSERT INTO closed_dates (date, reason) VALUES (%s, %s) ON CONFLICT (date) DO NOTHING",
                (date, reason)
            )
        conn.commit()


def remove_closed_date(date: str) -> None:
    """休業日を削除する。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("DELETE FROM closed_dates WHERE date=%s", (date,))
        conn.commit()


# ── メニュー ────────────────────────────────────────

def get_menus() -> list:
    """有効なメニュー一覧を返す。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("SELECT * FROM menus WHERE active=1 ORDER BY id")
            return [dict(r) for r in cur.fetchall()]


# ── 管理セッション ────────────────────────────────────────

def create_session(token: str, expires_at: str) -> None:
    """管理セッションを作成する。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("""
                INSERT INTO admin_sessions (token, expires_at)
                VALUES (%s, %s)
                ON CONFLICT (token) DO UPDATE SET expires_at=EXCLUDED.expires_at
            """, (token, expires_at))
        conn.commit()


def validate_session(token: str) -> bool:
    """セッショントークンの有効性を確認する。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute(
                "SELECT 1 FROM admin_sessions WHERE token=%s AND expires_at > NOW()",
                (token,)
            )
            return cur.fetchone() is not None


def delete_session(token: str) -> None:
    """セッションを削除する。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("DELETE FROM admin_sessions WHERE token=%s", (token,))
        conn.commit()


# ── LINEセッション ────────────────────────────────────────

def get_user_session(line_user_id: str) -> dict:
    """LINEユーザーのセッションを取得する。なければidle状態を返す。"""
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("SELECT * FROM user_sessions WHERE line_user_id=%s", (line_user_id,))
            row = cur.fetchone()
    return dict(row) if row else {"line_user_id": line_user_id, "step": "idle",
                                   "temp_date": "", "temp_time": "", "temp_menu_id": "",
                                   "temp_menu": "", "temp_name": "", "temp_phone": ""}


def upsert_user_session(line_user_id: str, **kwargs) -> None:
    """LINEユーザーセッションを更新または作成する。"""
    fields = ["step", "temp_date", "temp_time", "temp_menu_id", "temp_menu", "temp_name", "temp_phone"]
    sets = ", ".join(f"{f}=%s" for f in fields if f in kwargs)
    vals = [kwargs[f] for f in fields if f in kwargs]
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("""
                INSERT INTO user_sessions (line_user_id, updated_at)
                VALUES (%s, NOW())
                ON CONFLICT (line_user_id) DO UPDATE SET updated_at=NOW()
            """, (line_user_id,))
            if sets:
                cur.execute(
                    f"UPDATE user_sessions SET {sets}, updated_at=NOW() WHERE line_user_id=%s",
                    vals + [line_user_id]
                )
        conn.commit()


# ── 統計 ────────────────────────────────────────

def get_dashboard_stats() -> dict:
    """ダッシュボード用統計を返す。"""
    from datetime import date
    today = date.today().isoformat()
    month = today[:7]
    with get_conn() as conn:
        with _cursor(conn) as cur:
            cur.execute("SELECT COUNT(*) as cnt FROM reservations WHERE date=%s AND status='confirmed'", (today,))
            today_count = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM reservations WHERE date LIKE %s AND status!='cancelled'", (f"{month}%",))
            month_count = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM reservations WHERE date LIKE %s AND status='cancelled'", (f"{month}%",))
            cancel_count = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM customers")
            total_cust = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM reservations WHERE status!='cancelled'")
            total_res = cur.fetchone()["cnt"]
    total = month_count + cancel_count
    cancel_rate = round(cancel_count / total * 100, 1) if total > 0 else 0
    return {
        "today": today_count, "month": month_count,
        "cancel_rate": cancel_rate, "total_customers": total_cust, "total_reservations": total_res,
    }
