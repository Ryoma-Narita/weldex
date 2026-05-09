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

            -- 送信キュー
            CREATE TABLE IF NOT EXISTS send_queue (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                target_id   INTEGER NOT NULL REFERENCES targets(id),
                template    TEXT NOT NULL,       -- A / B / C
                priority    INTEGER DEFAULT 0,   -- 高いほど優先
                status      TEXT DEFAULT 'waiting', -- waiting / sent / failed / skip
                scheduled_at TEXT,
                created_at  TEXT DEFAULT (datetime('now', 'localtime'))
            );

            -- 送信ログ
            CREATE TABLE IF NOT EXISTS outreach_log (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                target_id   INTEGER NOT NULL REFERENCES targets(id),
                to_email    TEXT NOT NULL,
                template    TEXT NOT NULL,
                subject     TEXT,
                status      TEXT NOT NULL,       -- sent / failed
                error_msg   TEXT,
                sent_at     TEXT DEFAULT (datetime('now', 'localtime'))
            );

            -- 配信停止リスト（特定電子メール法）
            CREATE TABLE IF NOT EXISTS unsubscribes (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                email      TEXT UNIQUE NOT NULL,
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


def is_unsubscribed(email: str) -> bool:
    """配信停止リストに登録されているか確認する。"""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT 1 FROM unsubscribes WHERE email = ?", (email.lower(),)
        ).fetchone()
    return row is not None


def add_unsubscribe(email: str) -> None:
    """配信停止リストに追加する。"""
    with get_conn() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO unsubscribes (email) VALUES (?)", (email.lower(),)
        )


def build_send_queue() -> int:
    """
    送信キューを構築する。
    メールあり・未送信・配信停止でないターゲットをキューに追加する。
    Returns: 追加件数
    """
    PRIORITY = {"phone_only": 3, "none": 2, "no_mobile": 1, "old": 0}
    TEMPLATE  = {"phone_only": "C", "none": "A", "no_mobile": "B", "old": "B"}

    with get_conn() as conn:
        targets = conn.execute("""
            SELECT t.id, t.email, t.site_status
            FROM targets t
            WHERE t.email IS NOT NULL AND t.email != ''
              AND t.send_status = 'pending'
              AND t.site_status IN ('none','old','no_mobile','phone_only')
              AND t.id NOT IN (SELECT target_id FROM send_queue)
        """).fetchall()

        added = 0
        for t in targets:
            if is_unsubscribed(t["email"]):
                continue
            conn.execute("""
                INSERT INTO send_queue (target_id, template, priority)
                VALUES (?, ?, ?)
            """, (t["id"], TEMPLATE[t["site_status"]], PRIORITY[t["site_status"]]))
            added += 1

    return added


def get_queue_items(limit: int = 50) -> list:
    """優先度順に送信キューを取得する。"""
    with get_conn() as conn:
        rows = conn.execute("""
            SELECT q.id as queue_id, q.template, q.priority,
                   t.id as target_id, t.name, t.email, t.site_status, t.address
            FROM send_queue q
            JOIN targets t ON q.target_id = t.id
            WHERE q.status = 'waiting'
            ORDER BY q.priority DESC, q.id ASC
            LIMIT ?
        """, (limit,)).fetchall()
    return [dict(r) for r in rows]


def mark_queue_sent(queue_id: int, target_id: int, email: str, template: str, subject: str) -> None:
    """送信成功をDBに記録する。"""
    with get_conn() as conn:
        conn.execute("UPDATE send_queue SET status='sent' WHERE id=?", (queue_id,))
        conn.execute("UPDATE targets SET send_status='sent', sent_at=datetime('now','localtime') WHERE id=?", (target_id,))
        conn.execute("""
            INSERT INTO outreach_log (target_id, to_email, template, subject, status)
            VALUES (?, ?, ?, ?, 'sent')
        """, (target_id, email, template, subject))


def mark_queue_failed(queue_id: int, target_id: int, email: str, template: str, error: str) -> None:
    """送信失敗をDBに記録する。"""
    with get_conn() as conn:
        conn.execute("UPDATE send_queue SET status='failed' WHERE id=?", (queue_id,))
        conn.execute("UPDATE targets SET send_status='failed' WHERE id=?", (target_id,))
        conn.execute("""
            INSERT INTO outreach_log (target_id, to_email, template, subject, status, error_msg)
            VALUES (?, ?, ?, '', 'failed', ?)
        """, (target_id, email, template, error))


def get_send_stats() -> dict:
    """送信KPIを返す。"""
    with get_conn() as conn:
        queued   = conn.execute("SELECT COUNT(*) FROM send_queue WHERE status='waiting'").fetchone()[0]
        sent     = conn.execute("SELECT COUNT(*) FROM outreach_log WHERE status='sent'").fetchone()[0]
        failed   = conn.execute("SELECT COUNT(*) FROM outreach_log WHERE status='failed'").fetchone()[0]
        today    = conn.execute("SELECT COUNT(*) FROM outreach_log WHERE status='sent' AND DATE(sent_at)=DATE('now','localtime')").fetchone()[0]
        unsub    = conn.execute("SELECT COUNT(*) FROM unsubscribes").fetchone()[0]
    return {"queued": queued, "sent": sent, "failed": failed, "today": today, "unsubscribes": unsub}


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
