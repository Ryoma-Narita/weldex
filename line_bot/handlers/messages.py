"""
line_bot/handlers/messages.py
LINEメッセージ・クイックリプライ構築ヘルパー
"""
import datetime
from linebot.v3.messaging import (
    TextMessage, QuickReply, QuickReplyItem, MessageAction,
)

# LINEクイックリプライ最大13件。「最初から」用に1枠確保して実質12件
_MAX_ITEMS = 12
_WEEKDAYS  = ["月", "火", "水", "木", "金", "土", "日"]


def _date_label(iso: str) -> str:
    """YYYY-MM-DD を M/D(曜) 形式に変換する。"""
    dt = datetime.date.fromisoformat(iso)
    return f"{dt.month}/{dt.day}({_WEEKDAYS[dt.weekday()]})"


def _qr(text: str, items: list[tuple[str, str]]) -> TextMessage:
    """
    クイックリプライ付きテキストメッセージを作成する。

    Args:
        text:  本文
        items: [(ラベル, 送信テキスト), ...] ※最大13件

    Returns:
        TextMessage
    """
    return TextMessage(
        text=text,
        quick_reply=QuickReply(
            items=[
                QuickReplyItem(action=MessageAction(label=label[:20], text=value))
                for label, value in items[:13]
            ]
        ),
    )


def text_msg(text: str) -> TextMessage:
    """シンプルなテキストメッセージを作成する。"""
    return TextMessage(text=text)


# ─── 各ステップのメッセージ ──────────────────────────────

def date_select_msg(dates: list[str]) -> TextMessage:
    """日付選択クイックリプライを作成する（最大12日 + 「最初から」）。"""
    items = [(_date_label(d), d) for d in dates[:_MAX_ITEMS]]
    items.append(("最初から", "最初から"))
    return _qr("ご希望の日付を選んでください。", items)


def time_select_msg(times: list[str], truncated: bool = False) -> TextMessage:
    """時間選択クイックリプライを作成する（最大12件 + 「最初から」）。"""
    items = [(t, t) for t in times[:_MAX_ITEMS]]
    items.append(("最初から", "最初から"))
    suffix = "\n（満席の時間は表示していません。他の時間はお電話でもご予約いただけます）" if truncated else ""
    return _qr(f"ご希望の時間を選んでください。{suffix}", items)


def menu_select_msg(menus: list[dict]) -> TextMessage:
    """
    メニュー選択クイックリプライを作成する。
    送信テキストはメニュー名（ユーザーに見えても自然な文字列）。
    """
    items = [(f"{m['name']}({m['duration_min']}分)", m["name"]) for m in menus[:_MAX_ITEMS]]
    items.append(("最初から", "最初から"))
    return _qr("メニューを選んでください。", items)


def name_input_msg(display_name: str = "") -> TextMessage:
    """名前入力プロンプトを作成する。"""
    hint = f"\n（例：{display_name}）" if display_name else ""
    return text_msg(f"お名前を入力してください。{hint}")


def confirm_msg(date: str, time: str, menu_name: str, name: str) -> TextMessage:
    """予約確認メッセージを作成する。"""
    text = (
        f"━━━━━━━━━━━━━━\n"
        f"ご予約内容の確認\n"
        f"━━━━━━━━━━━━━━\n"
        f"日時：{_date_label(date)} {time}\n"
        f"メニュー：{menu_name}\n"
        f"お名前：{name}\n\n"
        f"この内容でよろしいですか？"
    )
    return _qr(text, [("確定する", "確定する"), ("最初から", "最初から")])


def complete_msg(date: str, time: str, menu_name: str) -> TextMessage:
    """予約完了メッセージを作成する。"""
    return text_msg(
        f"ご予約ありがとうございます！\n\n"
        f"{_date_label(date)} {time}（{menu_name}）の\n"
        f"ご予約を承りました。\n"
        f"当日お気をつけてお越しください。\n\n"
        f"※前日にリマインドをお送りします"
    )


def reservation_list_msg(reservations: list[dict]) -> TextMessage:
    """予約一覧テキストを作成する。"""
    if not reservations:
        return text_msg("現在ご予約はありません。")
    lines = ["現在のご予約：\n"]
    for r in reservations:
        lines.append(f"・{_date_label(r['date'])} {r['time']}　{r.get('menu_name', '')}")
    return text_msg("\n".join(lines))


def cancel_select_msg(reservations: list[dict]) -> TextMessage:
    """キャンセルする予約を選ぶクイックリプライを作成する。"""
    items = [
        (f"{_date_label(r['date'])} {r['time']}", f"cancel_{r['id']}")
        for r in reservations[:_MAX_ITEMS]
    ]
    items.append(("最初から", "最初から"))
    return _qr("キャンセルする予約を選んでください。", items)


def cancel_confirm_msg(reservation: dict) -> TextMessage:
    """キャンセル確認メッセージを作成する。"""
    rid = reservation["id"]
    text = (
        f"以下の予約をキャンセルしますか？\n\n"
        f"日時：{_date_label(reservation['date'])} {reservation['time']}\n"
        f"メニュー：{reservation.get('menu_name', '')}"
    )
    return _qr(text, [
        ("キャンセルする", f"do_cancel_{rid}"),
        ("最初から", "最初から"),
    ])


def idle_guide_msg() -> TextMessage:
    """使い方ガイドメッセージ。"""
    return text_msg(
        "ご利用ありがとうございます。\n\n"
        "📅 予約する →「予約する」と入力\n"
        "📋 予約確認 → 「予約確認」と入力\n"
        "❌ キャンセル → 「キャンセル」と入力\n\n"
        "下のメニューからも操作できます。"
    )


def welcome_msg(app_name: str) -> TextMessage:
    """友だち追加時のウェルカムメッセージを作成する。"""
    return text_msg(
        f"【{app_name}】のLINE予約へようこそ！\n\n"
        f"以下のメニューからご利用いただけます。\n"
        f"画面下のリッチメニューをタップするか、\n"
        f"メッセージでも操作できます。\n\n"
        f"📅 予約する\n"
        f"📋 予約確認\n"
        f"❌ キャンセル"
    )


def cancel_complete_msg() -> TextMessage:
    """キャンセル完了後、再予約を促すクイックリプライを作成する。"""
    return _qr(
        "予約をキャンセルしました。\n新しいご予約をされますか？",
        [("予約する", "予約する"), ("いいえ", "最初から")],
    )


def reminder_msg(date: str, time: str, menu_name: str) -> TextMessage:
    """
    前日リマインドメッセージを作成する（キャンセルQR付き）。

    Args:
        date:      予約日（YYYY-MM-DD）
        time:      予約時間（HH:MM）
        menu_name: メニュー名

    Returns:
        TextMessage（キャンセルクイックリプライ付き）
    """
    return _qr(
        f"明日のご予約をお知らせします。\n\n"
        f"日時：{_date_label(date)} {time}\n"
        f"メニュー：{menu_name}\n\n"
        f"ご都合が悪くなった場合は「キャンセル」をタップしてください。",
        [("キャンセル", "キャンセル")],
    )
