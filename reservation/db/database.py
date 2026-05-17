"""
reservation/db/database.py
予約システム SQLite CRUD
"""
import sqlite3
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import DB_PATH, ADMIN_EMAIL, ADMIN_PASSWORD


def get_conn() -> sqlite3.Connection:
    """DBコネクションを取得する。"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _migrate_add_column(conn: sqlite3.Connection, table: str, column: str, definition: str) -> None:
    """
    テーブルにカラムが存在しない場合のみ追加する（後方互換マイグレーション）。

    Args:
        conn:       DBコネクション
        table:      テーブル名
        column:     追加するカラム名
        definition: カラム定義（例: "TEXT DEFAULT ''"）
    """
    existing = {row[1] for row in conn.execute(f"PRAGMA table_info({table})")}
    if column not in existing:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


def init_db() -> None:
    """テーブルを初期化する（存在しない場合のみ作成）。"""
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS settings (
                key        TEXT PRIMARY KEY,
                value      TEXT NOT NULL DEFAULT '',
                updated_at TEXT DEFAULT (datetime('now', 'localtime'))
            );

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

            -- LINE予約ユーザーのセッション管理（Phase4で使用）
            CREATE TABLE IF NOT EXISTS user_sessions (
                line_user_id TEXT PRIMARY KEY,
                step         TEXT DEFAULT 'idle',
                temp_date    TEXT DEFAULT '',
                temp_time    TEXT DEFAULT '',
                temp_menu_id TEXT DEFAULT '',
                temp_name    TEXT DEFAULT '',
                updated_at   TEXT DEFAULT (datetime('now', 'localtime'))
            );
        """)

        # 後方互換マイグレーション
        _migrate_add_column(conn, "reservations", "line_user_id", "TEXT DEFAULT ''")
        _migrate_add_column(conn, "menus", "sort_order", "INTEGER DEFAULT 0")

        # settingsテーブルを.envの値で初期化（INSERT OR IGNOREで初回のみ設定）
        conn.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_email', ?)",
            (ADMIN_EMAIL,)
        )
        conn.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', ?)",
            (ADMIN_PASSWORD,)
        )
        # 管理者通知フラグ（1=ON / 0=OFF）
        conn.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('notify_on_booking', '1')")
        conn.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('notify_on_cancel',  '1')")

        # デフォルトメューがなければ追加
        count = conn.execute("SELECT COUNT(*) FROM menus").fetchone()[0]
        if count == 0:
            conn.executemany(
                "INSERT INTO menus (name, duration_min, price) VALUES (?,?,?)",
                [("初診", 60, 0), ("再診", 30, 0), ("クリーニング", 45, 0)]
            )


# ── 設定 ────────────────────────────────────────

def get_setting(key: str, default: str = "") -> str:
    """
    設定値を取得する。キーが存在しない場合は default を返す。

    Args:
        key:     設定キー（例: 'admin_email'）
        default: キーが存在しない場合のデフォルト値

    Returns:
        設定値
    """
    with get_conn() as conn:
        row = conn.execute("SELECT value FROM settings WHERE key=?", (key,)).fetchone()
    return row["value"] if row else default


def set_setting(key: str, value: str) -> None:
    """
    設定値を更新する（存在しない場合は作成）。

    Args:
        key:   設定キー
        value: 設定値
    """
    with get_conn() as conn:
        conn.execute("""
            INSERT INTO settings (key, value, updated_at)
            VALUES (?, ?, datetime('now','localtime'))
            ON CONFLICT(key) DO UPDATE SET
                value      = excluded.value,
                updated_at = excluded.updated_at
        """, (key, value))


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
    """有効なメニュー一覧を返す（予約フロー・LINE bot 用）。"""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM menus WHERE active=1 ORDER BY sort_order, id"
        ).fetchall()
    return [dict(r) for r in rows]


def get_all_menus() -> list:
    """全メニューを返す（管理画面用・非表示含む）。"""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM menus ORDER BY sort_order, id"
        ).fetchall()
    return [dict(r) for r in rows]


def create_menu(name: str, duration_min: int, price: int | None, sort_order: int) -> int:
    """
    メニューを作成してIDを返す。

    Args:
        name:         メニュー名
        duration_min: 所要時間（分）
        price:        料金（None=要相談）
        sort_order:   表示順

    Returns:
        作成したメニューのID
    """
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO menus (name, duration_min, price, active, sort_order) VALUES (?,?,?,1,?)",
            (name, duration_min, price, sort_order),
        )
        return cur.lastrowid


def update_menu(menu_id: int, name: str, duration_min: int, price: int | None, sort_order: int) -> None:
    """
    メニューを更新する。

    Args:
        menu_id:      メニューID
        name:         メニュー名
        duration_min: 所要時間（分）
        price:        料金（None=要相談）
        sort_order:   表示順
    """
    with get_conn() as conn:
        conn.execute(
            "UPDATE menus SET name=?, duration_min=?, price=?, sort_order=? WHERE id=?",
            (name, duration_min, price, sort_order, menu_id),
        )


def toggle_menu_active(menu_id: int) -> int:
    """
    メニューの表示/非表示を切り替えて、新しい状態を返す。

    Args:
        menu_id: メニューID

    Returns:
        更新後の active 値（0 or 1）
    """
    with get_conn() as conn:
        row = conn.execute("SELECT active FROM menus WHERE id=?", (menu_id,)).fetchone()
        if not row:
            return 0
        new_active = 0 if row["active"] else 1
        conn.execute("UPDATE menus SET active=? WHERE id=?", (new_active, menu_id))
    return new_active


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
    """
    ダッシュボード用統計を返す。

    Returns:
        today:           本日の確定予約数
        month:           今月のキャンセル以外の予約数
        cancel_count:    今月のキャンセル件数
        cancel_rate:     今月のキャンセル率（%）
        week:            今週（月曜起算・7日間）の予約数
        total_customers: 総顧客数
        total_reservations: 総予約数（キャンセル除く）
    """
    from datetime import date, timedelta
    today     = date.today()
    today_str = today.isoformat()
    month     = today_str[:7]
    # 今週月曜日を起算点にする（月=0 … 日=6）
    week_start = (today - timedelta(days=today.weekday())).isoformat()
    week_end   = (today + timedelta(days=6 - today.weekday())).isoformat()

    with get_conn() as conn:
        today_count  = conn.execute(
            "SELECT COUNT(*) FROM reservations WHERE date=? AND status='confirmed'",
            (today_str,)
        ).fetchone()[0]
        month_count  = conn.execute(
            "SELECT COUNT(*) FROM reservations WHERE date LIKE ? AND status!='cancelled'",
            (f"{month}%",)
        ).fetchone()[0]
        cancel_count = conn.execute(
            "SELECT COUNT(*) FROM reservations WHERE date LIKE ? AND status='cancelled'",
            (f"{month}%",)
        ).fetchone()[0]
        week_count   = conn.execute(
            "SELECT COUNT(*) FROM reservations WHERE date BETWEEN ? AND ? AND status!='cancelled'",
            (week_start, week_end)
        ).fetchone()[0]
        total_cust   = conn.execute("SELECT COUNT(*) FROM customers").fetchone()[0]
        total_res    = conn.execute(
            "SELECT COUNT(*) FROM reservations WHERE status!='cancelled'"
        ).fetchone()[0]

    cancel_rate = round(cancel_count / (month_count + cancel_count) * 100, 1) if (month_count + cancel_count) > 0 else 0
    return {
        "today":               today_count,
        "month":               month_count,
        "cancel_count":        cancel_count,
        "cancel_rate":         cancel_rate,
        "week":                week_count,
        "total_customers":     total_cust,
        "total_reservations":  total_res,
    }
