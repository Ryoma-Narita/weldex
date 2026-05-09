"""
outreach/scheduler.py
営業メール送信スケジューラー

使い方:
  python scheduler.py build   # 送信キューを構築
  python scheduler.py run     # 送信実行（1日50件上限）
  python scheduler.py auto    # 毎日9時に自動実行（デーモン）
  python scheduler.py reply   # 返信チェック
"""
import sys
import os
import time
import argparse
sys.path.insert(0, os.path.dirname(__file__))

from db.database import (
    init_db, build_send_queue, get_queue_items,
    mark_queue_sent, mark_queue_failed,
    get_send_stats, write_log, is_unsubscribed
)
from mailers.templates import get_template
from mailers.sender import send_email
from replies.checker import check_replies
from config import DAILY_SEND_LIMIT

# 送信間隔（秒）：スパム判定回避
SEND_INTERVAL_SEC = 10


def cmd_build() -> None:
    """送信キューを構築する。"""
    n = build_send_queue()
    stats = get_send_stats()
    print(f"[キュー構築] {n}件追加 / 合計待機: {stats['queued']}件")
    write_log("INFO", "system", f"キュー構築: {n}件追加")


def cmd_run() -> None:
    """
    送信キューからメールを送信する。
    1日50件上限を厳守する（特定電子メール法）。
    """
    stats = get_send_stats()
    remaining = DAILY_SEND_LIMIT - stats["today"]

    if remaining <= 0:
        print(f"[送信スキップ] 本日の送信上限（{DAILY_SEND_LIMIT}件）に達しています")
        write_log("WARN", "send", f"本日の送信上限に達しました（{stats['today']}件送信済み）")
        return

    items = get_queue_items(limit=remaining)
    total = len(items)

    if total == 0:
        print("[送信スキップ] 送信キューが空です")
        return

    print(f"[送信開始] {total}件 / 本日残り枠: {remaining}件")
    write_log("INFO", "send", f"送信開始: {total}件")

    sent = failed = 0

    for i, item in enumerate(items, 1):
        email    = item["email"]
        name     = item["name"]
        template = item["template"]
        queue_id = item["queue_id"]
        target_id= item["target_id"]

        # 配信停止チェック（直前に再確認）
        if is_unsubscribed(email):
            mark_queue_failed(queue_id, target_id, email, template, "配信停止リスト登録済み")
            print(f"  [{i}/{total}] {name} → スキップ（配信停止）")
            continue

        # テンプレート生成
        try:
            mail = get_template(template, name, email)
        except Exception as e:
            mark_queue_failed(queue_id, target_id, email, template, f"テンプレートエラー: {e}")
            failed += 1
            continue

        # 送信
        success = send_email(email, mail["subject"], mail["body"])

        if success:
            mark_queue_sent(queue_id, target_id, email, template, mail["subject"])
            sent += 1
            print(f"  [{i}/{total}] {name} <{email}> → 送信完了（テンプレート{template}）")
        else:
            mark_queue_failed(queue_id, target_id, email, template, "SendGrid送信失敗")
            failed += 1
            print(f"  [{i}/{total}] {name} <{email}> → 送信失敗")

        # 送信間隔を空ける
        if i < total:
            time.sleep(SEND_INTERVAL_SEC)

    print(f"\n[送信完了] 成功: {sent}件 / 失敗: {failed}件")
    write_log("INFO", "send", f"送信完了: 成功{sent}件 失敗{failed}件")


def cmd_reply() -> None:
    """返信チェックを実行する。"""
    print("[返信チェック] 開始...")
    n = check_replies()
    print(f"[返信チェック] {n}件の返信を検知")


def cmd_auto() -> None:
    """APSchedulerで毎日9:00に自動実行するデーモン。"""
    from apscheduler.schedulers.blocking import BlockingScheduler

    scheduler = BlockingScheduler(timezone="Asia/Tokyo")

    # 毎日9:00 収集 → 診断 → 送信
    @scheduler.scheduled_job("cron", hour=9, minute=0)
    def daily_job():
        """毎日9時に収集・診断・送信を自動実行する。"""
        write_log("INFO", "system", "自動実行開始")
        print("[自動実行] キュー構築 → 送信")
        cmd_build()
        cmd_run()

    # 毎日12:00・18:00 返信チェック
    @scheduler.scheduled_job("cron", hour="12,18", minute=0)
    def reply_job():
        """返信チェックを自動実行する。"""
        cmd_reply()

    print("[スケジューラー起動] 毎日9:00に送信・12:00/18:00に返信チェック")
    write_log("INFO", "system", "スケジューラー起動")
    scheduler.start()


def main() -> None:
    """CLIエントリーポイント。"""
    parser = argparse.ArgumentParser(
        prog="scheduler.py",
        description="Weldex 営業メール送信スケジューラー"
    )
    parser.add_argument(
        "command",
        choices=["build", "run", "reply", "auto"],
        help="build=キュー構築 / run=送信 / reply=返信チェック / auto=自動実行デーモン"
    )
    args = parser.parse_args()

    init_db()

    if args.command == "build":
        cmd_build()
    elif args.command == "run":
        cmd_run()
    elif args.command == "reply":
        cmd_reply()
    elif args.command == "auto":
        cmd_auto()


if __name__ == "__main__":
    main()
