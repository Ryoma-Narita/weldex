"""
line_bot/db/database.py
LINE予約システム DB操作
reservation/data/reservation.db を共有DBとして使用する
"""
import os
import sys
import sqlite3

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from config import DB_PATH


def get_conn() -> sqlite3.Connection:
    """DBコネクションを取得する。"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


# ── 設定 ──────────────────────────────────────────────────────

def get_setting(key: str, default: str = "") -> str:
    """
    settingsテーブルから設定値を取得する。

    Args:
        key:     設定キー（例: 'admin_email', 'notify_on_booking'）
        default: キーが存在しない場合のデフォルト値

    Returns:
        設定値
    """
    with get_conn() as conn:
        row = conn.execute("SELECT value FROM settings WHERE key=?", (key,)).fetchone()
    return row["value"] if row else default


# ── user_sessions ──────────────────────────────────────────────

def get_session(line_user_id: str) -> dict:
    """
    セッションを取得する。レコードがない場合はデフォルト値を返す（DBには書かない）。

    Args:
        line_user_id: LINE ユーザーID

    Returns:
        セッション辞書（step, temp_date, temp_time, temp_menu_id, temp_name）
    """
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM user_sessions WHERE line_user_id = ?", (line_user_id,)
        ).fetchone()
    if row:
        return dict(row)
    return {
        "line_user_id": line_user_id,
        "step": "idle",
        "temp_date": "", "temp_time": "", "temp_menu_id": "", "temp_name": "",
    }


def save_session(line_user_id: str, **fields) -> None:
    """
    セッションをupsertする。

    Args:
        line_user_id: LINE ユーザーID
        **fields:     更新するフィールド（step, temp_date, temp_time, temp_menu_id, temp_name）
    """
    current = get_session(line_user_id)
    data = {
        "line_user_id": line_user_id,
        "step":         fields.get("step",         current["step"]),
        "temp_date":    fields.get("temp_date",    current["temp_date"]),
        "temp_time":    fields.get("temp_time",    current["temp_time"]),
        "temp_menu_id": fields.get("temp_menu_id", current["temp_menu_id"]),
        "temp_name":    fields.get("temp_name",    current["temp_name"]),
    }
    with get_conn() as conn:
        conn.execute("""
            INSERT INTO user_sessions
              (line_user_id, step, temp_date, temp_time, temp_menu_id, temp_name, updated_at)
            VALUES
              (:line_user_id, :step, :temp_date, :temp_time, :temp_menu_id, :temp_name, datetime('now','localtime'))
            ON CONFLICT(line_user_id) DO UPDATE SET
              step         = excluded.step,
              temp_date    = excluded.temp_date,
              temp_time    = excluded.temp_time,
              temp_menu_id = excluded.temp_menu_id,
              temp_name    = excluded.temp_name,
              updated_at   = excluded.updated_at
        """, data)


def reset_session(line_user_id: str) -> None:
    """セッションをidleにリセットする。"""
    save_session(line_user_id, step="idle",
                 temp_date="", temp_time="", temp_menu_id="", temp_name="")


def is_timed_out(line_user_id: str, minutes: int = 30) -> bool:
    """
    セッションが指定時間更新されていない場合 True を返す。

    Args:
        line_user_id: LINE ユーザーID
        minutes:      タイムアウト判定分数（デフォルト30分）

    Returns:
        タイムアウトしていれば True
    """
    with get_conn() as conn:
        row = conn.execute(
            """SELECT 1 FROM user_sessions
               WHERE line_user_id = ? AND step != 'idle'
                 AND updated_at < datetime('now', 'localtime', ? || ' minutes')""",
            (line_user_id, f"-{minutes}"),
        ).fetchone()
    return row is not None


# ── 予約 ──────────────────────────────────────────────

def get_reserved_times(date: str) -> list[str]:
    """
    指定日の予約済み時間リストを返す。

    Args:
        date: YYYY-MM-DD

    Returns:
        予約済み時間のリスト（HH:MM形式）
    """
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT time FROM reservations WHERE date = ? AND status != 'cancelled'",
            (date,),
        ).fetchall()
    return [r["time"] for r in rows]


def create_line_reservation(
    line_user_id: str,
    name: str,
    date: str,
    time: str,
    menu_id: str,
) -> int:
    """
    LINE予約を作成してIDを返す。

    Args:
        line_user_id: LINE ユーザーID
        name:         予約者名
        date:         予約日（YYYY-MM-DD）
        time:         予約時間（HH:MM）
        menu_id:      メニューID

    Returns:
        作成した予約のID
    """
    with get_conn() as conn:
        menu = (
            conn.execute("SELECT * FROM menus WHERE id = ?", (menu_id,)).fetchone()
            if menu_id else None
        )
        menu_name    = menu["name"]         if menu else ""
        duration_min = menu["duration_min"] if menu else 30

        cur = conn.execute(
            """INSERT INTO reservations
               (name, date, time, menu_id, menu_name, duration_min, channel, line_user_id, status)
               VALUES (?, ?, ?, ?, ?, ?, 'line', ?, 'confirmed')""",
            (name, date, time, menu_id or "", menu_name, duration_min, line_user_id),
        )
        return cur.lastrowid


def get_active_reservation_count(line_user_id: str) -> int:
    """
    ユーザーの確定済み・今日以降の予約件数を返す（予約上限チェック用）。

    Args:
        line_user_id: LINE ユーザーID

    Returns:
        確定済み予約件数
    """
    with get_conn() as conn:
        row = conn.execute(
            """SELECT COUNT(*) FROM reservations
               WHERE line_user_id = ? AND status = 'confirmed'
                 AND date >= date('now', 'localtime')""",
            (line_user_id,),
        ).fetchone()
    return row[0] if row else 0


def get_user_reservations(line_user_id: str) -> list[dict]:
    """
    ユーザーの確定済み予約を日付昇順で返す。

    Args:
        line_user_id: LINE ユーザーID

    Returns:
        予約辞書のリスト
    """
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT * FROM reservations
               WHERE line_user_id = ? AND status = 'confirmed'
               ORDER BY date ASC, time ASC""",
            (line_user_id,),
        ).fetchall()
    return [dict(r) for r in rows]


def cancel_reservation(reservation_id: int) -> None:
    """
    予約をキャンセルする。

    Args:
        reservation_id: 予約ID
    """
    with get_conn() as conn:
        conn.execute(
            """UPDATE reservations
               SET status = 'cancelled', cancelled_at = datetime('now','localtime')
               WHERE id = ?""",
            (reservation_id,),
        )


def get_menus() -> list[dict]:
    """有効なメニュー一覧を返す。"""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM menus WHERE active = 1 ORDER BY id"
        ).fetchall()
    return [dict(r) for r in rows]


def get_closed_dates() -> list[str]:
    """休業日リストを返す。"""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT date FROM closed_dates ORDER BY date"
        ).fetchall()
    return [r["date"] for r in rows]


def get_remind_targets_line(date: str) -> list[dict]:
    """
    翌日のLINE予約でリマインド未送信のものを返す。

    Args:
        date: 対象日（YYYY-MM-DD）

    Returns:
        予約辞書のリスト
    """
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT * FROM reservations
               WHERE date = ? AND status = 'confirmed'
                 AND channel = 'line' AND remind_sent = 0
                 AND line_user_id != ''""",
            (date,),
        ).fetchall()
    return [dict(r) for r in rows]


def mark_remind_sent(reservation_id: int) -> None:
    """リマインド送信済みフラグを立てる。"""
    with get_conn() as conn:
        conn.execute(
            "UPDATE reservations SET remind_sent = 1 WHERE id = ?",
            (reservation_id,),
        )
