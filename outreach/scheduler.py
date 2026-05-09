"""
outreach/scheduler.py
営業メール送信スケジューラー

使い方:
  python scheduler.py build    # 送信キューを構築
  python scheduler.py run      # 送信実行（1日50件上限）※手動のみ
  python scheduler.py auto     # 毎朝6時に収集→診断→キュー構築まで自動（送信はしない）
  python scheduler.py reply    # 返信チェック
  python scheduler.py collect  # 指定業種・エリアを収集して診断まで自動実行
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


def cmd_collect_and_prepare(industry: str = "歯科医院", area: str = "東京都渋谷区", limit: int = 20) -> None:
    """
    収集 → 診断 → キュー構築 までを一括実行する。
    送信はしない（手動で python scheduler.py run を実行する）。
    """
    from collectors.google_places import collect_targets
    from analyzers.site_checker import check_site
    from db.database import get_unchecked_targets, update_site_status

    write_log("INFO", "system", f"自動準備開始: {industry} / {area}")

    # 収集
    n_collected = collect_targets(industry, area, limit=limit)
    print(f"[収集] {n_collected}件新規保存")

    # 診断
    targets = get_unchecked_targets(limit=100)
    print(f"[診断] {len(targets)}件を診断...")
    for t in targets:
        result = check_site(t.get("website", ""))
        update_site_status(t["id"], result["status"], result.get("email"))

    # キュー構築
    n_queued = build_send_queue()
    stats    = get_send_stats()
    print(f"[キュー構築] {n_queued}件追加 / 送信待ち合計: {stats['queued']}件")
    write_log("INFO", "system", f"自動準備完了: 収集{n_collected}件 キュー{n_queued}件追加")
    print("\n✅ 準備完了。送信するには: python scheduler.py run")


def cmd_auto() -> None:
    """
    APSchedulerで毎朝6:00に収集→診断→キュー構築を自動実行するデーモン。
    ※送信はしない。毎朝ダッシュボードを確認して手動で python scheduler.py run を実行する。
    """
    from apscheduler.schedulers.blocking import BlockingScheduler
    from collectors.area_config import INDUSTRY_KEYWORDS, AREA_CONFIG

    scheduler = BlockingScheduler(timezone="Asia/Tokyo")

    # 毎朝6:00 収集→診断→キュー構築（送信はしない）
    @scheduler.scheduled_job("cron", hour=6, minute=0)
    def daily_prepare():
        """毎朝6時に収集・診断・キュー構築を自動実行する（送信は手動）。"""
        write_log("INFO", "system", "定期自動準備開始")
        # 業種・エリアをローテーション
        import random
        industry = random.choice(list(INDUSTRY_KEYWORDS.keys()))
        prefs    = list(AREA_CONFIG.keys())
        pref     = random.choice(prefs)
        cities   = AREA_CONFIG[pref]
        area     = pref + random.choice(cities)
        print(f"[定期実行] {industry} / {area}")
        cmd_collect_and_prepare(industry, area, limit=20)

    # 毎日12:00・18:00 返信チェック
    @scheduler.scheduled_job("cron", hour="12,18", minute=0)
    def reply_job():
        """返信チェックを自動実行する。"""
        cmd_reply()

    print("[スケジューラー起動]")
    print("  毎朝 6:00 → 収集・診断・キュー構築（送信なし）")
    print("  12:00/18:00 → 返信チェック")
    print("  送信は毎朝ダッシュボードを確認して手動で: python scheduler.py run")
    write_log("INFO", "system", "スケジューラー起動（収集自動・送信手動モード）")
    scheduler.start()


def main() -> None:
    """CLIエントリーポイント。"""
    parser = argparse.ArgumentParser(
        prog="scheduler.py",
        description="Weldex 営業メール送信スケジューラー"
    )
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("build",  help="送信キューを構築（送信しない）")
    sub.add_parser("run",    help="送信実行（手動・1日50件上限）")
    sub.add_parser("reply",  help="返信チェック")
    sub.add_parser("auto",   help="毎朝6時に収集→診断→キュー構築を自動実行（送信は手動）")

    p_col = sub.add_parser("collect", help="収集→診断→キュー構築を今すぐ実行")
    p_col.add_argument("--industry", default="歯科医院")
    p_col.add_argument("--area",     default="東京都渋谷区")
    p_col.add_argument("--limit",    type=int, default=20)

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
    elif args.command == "collect":
        cmd_collect_and_prepare(args.industry, args.area, args.limit)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
