"""
outreach/main.py
営業自動化システムのエントリーポイント

使い方:
  python main.py collect --industry 歯科医院 --area 東京都渋谷区 --limit 20
  python main.py diagnose --limit 50
  python main.py batch-collect --limit-per-industry 10
  python main.py filter --no-line --phone-only --limit 30
"""
import argparse
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from db.database import (
    init_db, get_unchecked_targets, update_site_status, write_log,
    get_stats, get_filtered_targets,
)
from collectors.google_places import collect_targets
from collectors.area_config import INDUSTRY_KEYWORDS, get_all_areas
from analyzers.site_checker import check_site


def cmd_collect(args: argparse.Namespace) -> None:
    """ターゲット企業を収集してDBに保存する。"""
    write_log("INFO", "collect", f"収集開始: industry={args.industry}, area={args.area}, limit={args.limit}")
    n = collect_targets(args.industry, args.area, limit=args.limit)
    print(f"[収集完了] {n}件を新規保存しました")
    stats = get_stats()
    print(f"[DB状況] 合計: {stats['total']}件 / 未診断: {stats['unchecked']}件")


def cmd_batch_collect(args: argparse.Namespace) -> None:
    """
    全業種 × 全エリアを順番に収集する。業種ごとに limit-per-industry 件ずつ収集。

    例：10業種 × 30エリア = 最大 300 × limit-per-industry 件
    """
    industries = list(INDUSTRY_KEYWORDS.keys())
    areas      = get_all_areas()
    limit      = args.limit_per_industry
    total_new  = 0

    print(f"[バッチ収集] {len(industries)}業種 × {len(areas)}エリア（各{limit}件上限）")
    write_log("INFO", "batch_collect", f"バッチ開始: {len(industries)}業種 × {len(areas)}エリア / 上限{limit}件")

    for industry in industries:
        for area in areas:
            n = collect_targets(industry, area, limit=limit)
            total_new += n
            if n > 0:
                print(f"  [{industry} / {area}] {n}件追加")

    stats = get_stats()
    print(f"\n[バッチ収集完了] 新規: {total_new}件 / DB合計: {stats['total']}件")
    write_log("INFO", "batch_collect", f"バッチ完了: 新規{total_new}件")


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

        update_site_status(
            target["id"],
            result["status"],
            result.get("email"),
            has_line           = result.get("has_line"),
            has_online_booking = result.get("has_online_booking"),
            phone_only         = result.get("phone_only"),
            has_ssl            = result.get("has_ssl"),
            has_contact_form   = result.get("has_contact_form"),
        )

        flags = []
        if result.get("has_line") is False:        flags.append("LINE×")
        if result.get("has_online_booking") is False: flags.append("予約×")
        if result.get("phone_only"):               flags.append("電話のみ")
        if result.get("has_ssl") is False:         flags.append("SSL×")
        if result.get("has_contact_form") is False:flags.append("フォーム×")

        flag_str = f" [{', '.join(flags)}]" if flags else ""
        email_str = f" / {result['email']}" if result.get("email") else ""

        print(f"  [{i}/{total}] {name} → {result['status']}{flag_str} ({result['detail']}){email_str}")
        write_log("INFO", "diagnose", f"{name}: {result['status']} / {result['detail']}{flag_str}")

    stats = get_stats()
    print(f"\n[診断完了]")
    print(f"  none: {stats['none']} / old: {stats['old']} / no_mobile: {stats['no_mobile']}"
          f" / phone_only: {stats['phone_only']} / ok: {stats['ok']}")
    print(f"  メールあり: {stats['with_email']}件")
    print(f"\n[詳細フラグ集計]")
    print(f"  LINE連携なし: {stats['no_line']}件 / 予約なし: {stats['no_booking']}件"
          f" / 電話のみ: {stats['phone_only_flag']}件")
    print(f"  SSL非対応: {stats['no_ssl']}件 / フォームなし: {stats['no_form']}件")


def cmd_filter(args: argparse.Namespace) -> None:
    """詳細条件でターゲットを絞り込み表示する。"""
    hp_levels = []
    if args.hp:
        hp_levels = [s.strip() for s in args.hp.split(',')]

    targets = get_filtered_targets(
        hp_levels        = hp_levels or None,
        no_line          = args.no_line,
        phone_only       = args.phone_only,
        no_online_booking= args.no_booking,
        no_ssl           = args.no_ssl,
        no_contact_form  = args.no_form,
        industry         = args.industry or None,
        area             = args.area or None,
        limit            = args.limit,
    )

    print(f"[フィルター結果] {len(targets)}件")
    for t in targets:
        flags = []
        if t.get("has_line") == 0:           flags.append("LINE×")
        if t.get("has_online_booking") == 0: flags.append("予約×")
        if t.get("phone_only") == 1:         flags.append("電話のみ")
        if t.get("has_ssl") == 0:            flags.append("SSL×")
        if t.get("has_contact_form") == 0:   flags.append("フォーム×")
        print(f"  {t['name']} [{t['industry']} / {t['area']}] {t['site_status']}"
              f" [{', '.join(flags)}] {t.get('email') or '—'}")


def main() -> None:
    """CLIエントリーポイント。"""
    parser = argparse.ArgumentParser(
        prog="main.py",
        description="Weldex 営業自動化システム"
    )
    sub = parser.add_subparsers(dest="command")

    # collect
    p_collect = sub.add_parser("collect", help="ターゲット収集（業種・エリア指定）")
    p_collect.add_argument("--industry", required=True, help="業種（例：歯科医院）")
    p_collect.add_argument("--area",     required=True, help="エリア（例：東京都渋谷区）")
    p_collect.add_argument("--limit",    type=int, default=20, help="収集上限件数（デフォルト20）")

    # batch-collect
    p_batch = sub.add_parser("batch-collect", help="全業種×全エリアを一括収集")
    p_batch.add_argument("--limit-per-industry", type=int, default=10, dest="limit_per_industry",
                         help="業種×エリアごとの収集上限（デフォルト10）")

    # diagnose
    p_diagnose = sub.add_parser("diagnose", help="サイト診断（未診断ターゲットを処理）")
    p_diagnose.add_argument("--limit", type=int, default=50, help="診断件数上限（デフォルト50）")

    # filter
    p_filter = sub.add_parser("filter", help="詳細条件でターゲットを絞り込み表示")
    p_filter.add_argument("--hp",         default="",    help="HP状況カンマ区切り（例: none,old）")
    p_filter.add_argument("--no-line",    action="store_true", help="LINE連携なしのみ")
    p_filter.add_argument("--phone-only", action="store_true", help="電話のみのみ")
    p_filter.add_argument("--no-booking", action="store_true", help="オンライン予約なしのみ")
    p_filter.add_argument("--no-ssl",     action="store_true", help="HTTPS非対応のみ")
    p_filter.add_argument("--no-form",    action="store_true", help="フォームなしのみ")
    p_filter.add_argument("--industry",   default="",    help="業種で絞り込み")
    p_filter.add_argument("--area",       default="",    help="エリアで絞り込み")
    p_filter.add_argument("--limit",      type=int, default=100, help="表示件数上限")

    args = parser.parse_args()
    init_db()

    if args.command == "collect":
        cmd_collect(args)
    elif args.command == "batch-collect":
        cmd_batch_collect(args)
    elif args.command == "diagnose":
        cmd_diagnose(args)
    elif args.command == "filter":
        cmd_filter(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
