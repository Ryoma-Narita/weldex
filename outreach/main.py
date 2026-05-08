"""
outreach/main.py
営業自動化システムのエントリーポイント

使い方:
  python main.py --collect --industry 歯科医院 --area 東京都渋谷区 --limit 20
  python main.py --diagnose --limit 50
"""
import argparse
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from db.database import init_db, get_unchecked_targets, update_site_status, write_log, get_stats
from collectors.google_places import collect_targets
from analyzers.site_checker import check_site


def cmd_collect(args: argparse.Namespace) -> None:
    """ターゲット企業を収集してDBに保存する。"""
    write_log("INFO", "collect", f"収集開始: industry={args.industry}, area={args.area}, limit={args.limit}")
    n = collect_targets(args.industry, args.area, limit=args.limit)
    print(f"[収集完了] {n}件を新規保存しました")
    stats = get_stats()
    print(f"[DB状況] 合計: {stats['total']}件 / 未診断: {stats['unchecked']}件")


def cmd_diagnose(args: argparse.Namespace) -> None:
    """未診断ターゲットのサイトを診断してDBを更新する。"""
    targets = get_unchecked_targets(limit=args.limit)
    total   = len(targets)
    print(f"[診断開始] {total}件を診断します...")
    write_log("INFO", "diagnose", f"診断開始: {total}件")

    for i, target in enumerate(targets, 1):
        name    = target["name"]
        website = target.get("website", "")
        result  = check_site(website)

        update_site_status(target["id"], result["status"], result.get("email"))
        print(f"  [{i}/{total}] {name} → {result['status']} ({result['detail']})"
              + (f" / {result['email']}" if result.get("email") else ""))
        write_log("INFO", "diagnose", f"{name}: {result['status']} / {result['detail']}")

    stats = get_stats()
    print(f"\n[診断完了]")
    print(f"  none: {stats['none']} / old: {stats['old']} / no_mobile: {stats['no_mobile']}"
          f" / phone_only: {stats['phone_only']} / ok: {stats['ok']}")
    print(f"  メールあり: {stats['with_email']}件")


def main() -> None:
    """CLIエントリーポイント。"""
    parser = argparse.ArgumentParser(
        prog="main.py",
        description="Weldex 営業自動化システム"
    )
    sub = parser.add_subparsers(dest="command")

    # --collect
    p_collect = sub.add_parser("collect", help="ターゲット収集")
    p_collect.add_argument("--industry", required=True, help="業種（例：歯科医院）")
    p_collect.add_argument("--area",     required=True, help="エリア（例：東京都渋谷区）")
    p_collect.add_argument("--limit",    type=int, default=20, help="収集上限件数（デフォルト20）")

    # --diagnose
    p_diagnose = sub.add_parser("diagnose", help="サイト診断")
    p_diagnose.add_argument("--limit", type=int, default=50, help="診断件数上限（デフォルト50）")

    args = parser.parse_args()

    init_db()

    if args.command == "collect":
        cmd_collect(args)
    elif args.command == "diagnose":
        cmd_diagnose(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
