"""
outreach/db/database.py
PostgreSQL CRUD操作・テーブル定義

接続: DATABASE_URL 環境変数（Railway が自動的に注入する）
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import psycopg2
import psycopg2.extras
from config import DB_PATH  # SQLiteフォールバック用（未使用だが互換性のため残す）

_raw_url = os.environ.get("DATABASE_URL", "")
# psycopg2 は "postgresql://" を要求する（"postgres://" は非対応）
DATABASE_URL = _raw_url.replace("postgres://", "postgresql://", 1) if _raw_url.startswith("postgres://") else _raw_url


def get_conn():
    """PostgreSQL コネクションを取得する。"""
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL が設定されていません。"
            "Railway の Variables で Postgres サービスをリンクしてください。"
        )
    # Railway の Postgres は SSL 必須
    conn = psycopg2.connect(DATABASE_URL, sslmode="require")
    return conn


def init_db() -> None:
    """テーブルを初期化する（存在しない場合のみ作成）。"""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS targets (
                    id                 SERIAL PRIMARY KEY,
                    place_id           TEXT UNIQUE,
                    name               TEXT NOT NULL,
                    address            TEXT,
                    phone              TEXT,
                    website            TEXT,
                    industry           TEXT,
                    area               TEXT,
                    site_status        TEXT DEFAULT 'unchecked',
                    email              TEXT,
                    created_at         TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Tokyo'),
                    checked_at         TIMESTAMP,
                    sent_at            TIMESTAMP,
                    send_status        TEXT DEFAULT 'pending',
                    has_line           INTEGER DEFAULT NULL,
                    has_online_booking INTEGER DEFAULT NULL,
                    phone_only         INTEGER DEFAULT NULL,
                    has_ssl            INTEGER DEFAULT NULL,
                    has_contact_form   INTEGER DEFAULT NULL
                );

                CREATE TABLE IF NOT EXISTS settings (
                    key   TEXT PRIMARY KEY,
                    value TEXT
                );

                CREATE TABLE IF NOT EXISTS run_logs (
                    id         SERIAL PRIMARY KEY,
                    level      TEXT NOT NULL,
                    category   TEXT NOT NULL,
                    message    TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Tokyo')
                );

                CREATE TABLE IF NOT EXISTS send_queue (
                    id           SERIAL PRIMARY KEY,
                    target_id    INTEGER NOT NULL REFERENCES targets(id),
                    template     TEXT NOT NULL,
                    priority     INTEGER DEFAULT 0,
                    status       TEXT DEFAULT 'waiting',
                    scheduled_at TIMESTAMP,
                    created_at   TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Tokyo')
                );

                CREATE TABLE IF NOT EXISTS outreach_log (
                    id        SERIAL PRIMARY KEY,
                    target_id INTEGER NOT NULL REFERENCES targets(id),
                    to_email  TEXT NOT NULL,
                    template  TEXT NOT NULL,
                    subject   TEXT,
                    status    TEXT NOT NULL,
                    error_msg TEXT,
                    sent_at   TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Tokyo')
                );

                CREATE TABLE IF NOT EXISTS unsubscribes (
                    id         SERIAL PRIMARY KEY,
                    email      TEXT UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Tokyo')
                );
            """)
        conn.commit()


def write_log(level: str, category: str, message: str) -> None:
    """実行ログをDBに書き込む。level: INFO / WARN / ERROR"""
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO run_logs (level, category, message) VALUES (%s, %s, %s)",
                    (level.upper(), category, message)
                )
            conn.commit()
    except Exception:
        pass  # ログ失敗はサイレントに無視


def upsert_target(data: dict) -> bool:
    """
    ターゲットをDBに挿入する。place_idが重複する場合はスキップ。
    Returns: True=新規挿入 / False=重複スキップ
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO targets (place_id, name, address, phone, website, industry, area)
                VALUES (%(place_id)s, %(name)s, %(address)s, %(phone)s, %(website)s, %(industry)s, %(area)s)
                ON CONFLICT (place_id) DO NOTHING
            """, data)
            inserted = cur.rowcount
        conn.commit()
    return inserted > 0


def get_unchecked_targets(limit: int = 50) -> list:
    """site_status が unchecked のターゲットを取得する。"""
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM targets WHERE site_status = 'unchecked' LIMIT %s",
                (limit,)
            )
            rows = cur.fetchall()
    return [dict(r) for r in rows]


def update_site_status(
    target_id: int,
    status: str,
    email: str = None,
    has_line=None,
    has_online_booking=None,
    phone_only=None,
    has_ssl=None,
    has_contact_form=None,
) -> None:
    """サイト診断結果をターゲットに反映する。"""
    def to_int(v):
        return None if v is None else int(v)

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE targets
                SET site_status        = %s,
                    email              = %s,
                    checked_at         = NOW() AT TIME ZONE 'Asia/Tokyo',
                    has_line           = %s,
                    has_online_booking = %s,
                    phone_only         = %s,
                    has_ssl            = %s,
                    has_contact_form   = %s
                WHERE id = %s
            """, (
                status, email,
                to_int(has_line), to_int(has_online_booking),
                to_int(phone_only), to_int(has_ssl), to_int(has_contact_form),
                target_id,
            ))
        conn.commit()


def is_unsubscribed(email: str) -> bool:
    """配信停止リストに登録されているか確認する。"""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM unsubscribes WHERE email = %s", (email.lower(),)
            )
            row = cur.fetchone()
    return row is not None


def add_unsubscribe(email: str) -> None:
    """配信停止リストに追加する。"""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO unsubscribes (email) VALUES (%s) ON CONFLICT DO NOTHING",
                (email.lower(),)
            )
        conn.commit()


def build_send_queue() -> int:
    """送信キューを構築する。"""
    PRIORITY = {"phone_only": 3, "none": 2, "no_mobile": 1, "old": 0}
    TEMPLATE  = {"phone_only": "C", "none": "A", "no_mobile": "B", "old": "B"}

    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT t.id, t.email, t.site_status
                FROM targets t
                WHERE t.email IS NOT NULL AND t.email != ''
                  AND t.send_status = 'pending'
                  AND t.site_status IN ('none','old','no_mobile','phone_only')
                  AND t.id NOT IN (SELECT target_id FROM send_queue)
            """)
            targets = cur.fetchall()

        added = 0
        with conn.cursor() as cur:
            for t in targets:
                if is_unsubscribed(t["email"]):
                    continue
                cur.execute("""
                    INSERT INTO send_queue (target_id, template, priority)
                    VALUES (%s, %s, %s)
                """, (t["id"], TEMPLATE[t["site_status"]], PRIORITY[t["site_status"]]))
                added += 1
        conn.commit()

    return added


def get_queue_items(limit: int = 50) -> list:
    """優先度順に送信キューを取得する。"""
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT q.id as queue_id, q.template, q.priority,
                       t.id as target_id, t.name, t.email,
                       t.site_status, t.industry, t.address,
                       t.phone_only, t.has_line, t.has_online_booking
                FROM send_queue q
                JOIN targets t ON q.target_id = t.id
                WHERE q.status = 'waiting'
                ORDER BY q.priority DESC, q.id ASC
                LIMIT %s
            """, (limit,))
            rows = cur.fetchall()
    return [dict(r) for r in rows]


def mark_queue_sent(queue_id: int, target_id: int, email: str, template: str, subject: str) -> None:
    """送信成功をDBに記録する。"""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE send_queue SET status='sent' WHERE id=%s", (queue_id,))
            cur.execute(
                "UPDATE targets SET send_status='sent', sent_at=NOW() AT TIME ZONE 'Asia/Tokyo' WHERE id=%s",
                (target_id,)
            )
            cur.execute("""
                INSERT INTO outreach_log (target_id, to_email, template, subject, status)
                VALUES (%s, %s, %s, %s, 'sent')
            """, (target_id, email, template, subject))
        conn.commit()


def mark_queue_failed(queue_id: int, target_id: int, email: str, template: str, error: str) -> None:
    """送信失敗をDBに記録する。"""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE send_queue SET status='failed' WHERE id=%s", (queue_id,))
            cur.execute("UPDATE targets SET send_status='failed' WHERE id=%s", (target_id,))
            cur.execute("""
                INSERT INTO outreach_log (target_id, to_email, template, subject, status, error_msg)
                VALUES (%s, %s, %s, '', 'failed', %s)
            """, (target_id, email, template, error))
        conn.commit()


def get_send_stats() -> dict:
    """送信KPIを返す。"""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM send_queue WHERE status='waiting'")
            queued = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM outreach_log WHERE status='sent'")
            sent = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM outreach_log WHERE status='failed'")
            failed = cur.fetchone()[0]
            cur.execute("""
                SELECT COUNT(*) FROM outreach_log
                WHERE status='sent'
                  AND sent_at::date = (NOW() AT TIME ZONE 'Asia/Tokyo')::date
            """)
            today = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM unsubscribes")
            unsub = cur.fetchone()[0]
    return {"queued": queued, "sent": sent, "failed": failed, "today": today, "unsubscribes": unsub}


def get_stats() -> dict:
    """ダッシュボード用の統計情報を返す。"""
    with get_conn() as conn:
        with conn.cursor() as cur:
            def count(q, *p):
                cur.execute(q, p)
                return cur.fetchone()[0]

            total         = count("SELECT COUNT(*) FROM targets")
            unchecked     = count("SELECT COUNT(*) FROM targets WHERE site_status='unchecked'")
            none_         = count("SELECT COUNT(*) FROM targets WHERE site_status='none'")
            old           = count("SELECT COUNT(*) FROM targets WHERE site_status='old'")
            no_mobile     = count("SELECT COUNT(*) FROM targets WHERE site_status='no_mobile'")
            phone_only_st = count("SELECT COUNT(*) FROM targets WHERE site_status='phone_only'")
            ok            = count("SELECT COUNT(*) FROM targets WHERE site_status='ok'")
            with_email    = count("SELECT COUNT(*) FROM targets WHERE email IS NOT NULL AND email != ''")
            no_line       = count("SELECT COUNT(*) FROM targets WHERE has_line=0")
            no_booking    = count("SELECT COUNT(*) FROM targets WHERE has_online_booking=0")
            phone_only_fl = count("SELECT COUNT(*) FROM targets WHERE phone_only=1")
            no_ssl        = count("SELECT COUNT(*) FROM targets WHERE has_ssl=0")
            no_form       = count("SELECT COUNT(*) FROM targets WHERE has_contact_form=0")

    return {
        "total": total, "unchecked": unchecked,
        "none": none_, "old": old,
        "no_mobile": no_mobile, "phone_only": phone_only_st,
        "ok": ok, "with_email": with_email,
        "no_line": no_line, "no_booking": no_booking,
        "phone_only_flag": phone_only_fl,
        "no_ssl": no_ssl, "no_form": no_form,
    }


def get_filtered_targets(
    hp_levels: list = None,
    no_line: bool = False,
    phone_only: bool = False,
    no_online_booking: bool = False,
    no_ssl: bool = False,
    no_contact_form: bool = False,
    industry: str = None,
    area: str = None,
    limit: int = 100,
) -> list:
    """詳細条件でターゲットをフィルタリングして返す。"""
    conditions = ["send_status='pending'", "email IS NOT NULL AND email != ''"]
    params: list = []

    if hp_levels:
        placeholders = ",".join("%s" for _ in hp_levels)
        conditions.append(f"site_status IN ({placeholders})")
        params.extend(hp_levels)
    if no_line:           conditions.append("has_line=0")
    if phone_only:        conditions.append("phone_only=1")
    if no_online_booking: conditions.append("has_online_booking=0")
    if no_ssl:            conditions.append("has_ssl=0")
    if no_contact_form:   conditions.append("has_contact_form=0")
    if industry:
        conditions.append("industry=%s")
        params.append(industry)
    if area:
        conditions.append("area LIKE %s")
        params.append(f"%{area}%")

    where = " AND ".join(conditions)
    params.append(limit)

    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                f"SELECT * FROM targets WHERE {where} ORDER BY id ASC LIMIT %s",
                params,
            )
            rows = cur.fetchall()
    return [dict(r) for r in rows]
