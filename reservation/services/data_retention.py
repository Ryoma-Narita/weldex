"""
reservation/services/data_retention.py
個人情報保持期間管理・自動削除スケジューラー

実行タイミング：APSchedulerで毎月1日0:00に自動実行
設定：
  DATA_RETENTION_COMPLETED_DAYS=365（完了予約の匿名化・デフォルト1年）
  DATA_RETENTION_CANCELLED_DAYS=90 （キャンセル予約の削除・デフォルト3ヶ月）
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import date, timedelta
from db.database import get_conn


DATA_RETENTION_COMPLETED_DAYS = int(os.environ.get("DATA_RETENTION_COMPLETED_DAYS", 365))
DATA_RETENTION_CANCELLED_DAYS = int(os.environ.get("DATA_RETENTION_CANCELLED_DAYS", 90))


def anonymize_old_reservations() -> int:
    """
    完了予約（status='done'）の個人情報をDATA_RETENTION_COMPLETED_DAYS後に匿名化する。

    匿名化対象：name（「（削除済み）」に変換）・phone・email・notes
    統計のために残す：reservation_date・time・menu_name・channel

    Returns:
        匿名化した件数
    """
    cutoff = (date.today() - timedelta(days=DATA_RETENTION_COMPLETED_DAYS)).isoformat()
    conn = get_conn()
    try:
        cur = conn.execute(
            """
            UPDATE reservations
               SET name  = '（削除済み）',
                   phone = NULL,
                   email = NULL,
                   notes = NULL
             WHERE status = 'done'
               AND reservation_date <= ?
               AND name != '（削除済み）'
            """,
            (cutoff,),
        )
        conn.commit()
        count = cur.rowcount
        if count > 0:
            print(f"[data_retention] 完了予約の個人情報を匿名化: {count}件（{cutoff}以前）")
        return count
    finally:
        conn.close()


def delete_old_cancellations() -> int:
    """
    キャンセル予約（status='cancelled'）をDATA_RETENTION_CANCELLED_DAYS後に削除する。

    Returns:
        削除した件数
    """
    cutoff = (date.today() - timedelta(days=DATA_RETENTION_CANCELLED_DAYS)).isoformat()
    conn = get_conn()
    try:
        cur = conn.execute(
            """
            DELETE FROM reservations
             WHERE status = 'cancelled'
               AND reservation_date <= ?
            """,
            (cutoff,),
        )
        conn.commit()
        count = cur.rowcount
        if count > 0:
            print(f"[data_retention] キャンセル予約を削除: {count}件（{cutoff}以前）")
        return count
    finally:
        conn.close()


def run_data_retention() -> None:
    """
    個人情報保持期間管理をまとめて実行する。
    APSchedulerから毎月1日0:00に呼び出す。
    """
    anonymize_old_reservations()
    delete_old_cancellations()
