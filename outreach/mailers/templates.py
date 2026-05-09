"""
outreach/mailers/templates.py
営業メール文面 A/B/C パターン
共通：資料請求ベースのCTA・配信停止リンク必須（特定電子メール法）
"""

UNSUBSCRIBE_URL = "https://weldex.jp/unsubscribe"  # Phase3で実装予定


def _footer(to_email: str) -> str:
    """メール共通フッター（特定電子メール法必須事項）。"""
    return f"""
──────────────────────────────
このメールは {to_email} 宛にお送りしています。
配信停止をご希望の方はこちら：{UNSUBSCRIBE_URL}?email={to_email}

Weldex（ウェルデックス）
担当：成田 涼馬
メール：info@weldex.jp
サイト：https://weldex.jp
──────────────────────────────
"""


def get_template_a(name: str, to_email: str) -> dict:
    """
    パターンA：サイトなし → WEB集客の機会損失を訴求。

    Args:
        name:     店舗名
        to_email: 送信先メールアドレス

    Returns:
        subject・body を含むdict
    """
    subject = f"【{name}様へ】WEBサイト無料診断のご案内"
    body = f"""{name} ご担当者様

はじめてご連絡いたします。
WEBサイト制作・LINE予約システムを専門とするWeldexの成田と申します。

現在、{name}様のWEBサイトが確認できていない状況です。

WEBサイトがない場合、下記のような機会損失が発生しています。

・Googleで検索した新規患者様が競合に流れている
・24時間の問い合わせ・予約受付ができていない
・口コミサイトのみに頼った集客になっている

弊社では医療・歯科専門のWEBサイト制作を、
大手制作会社の3分の1以下のコストで提供しています。

まずは無料診断レポートをお送りすることも可能です。
ご興味がございましたら、このメールにご返信ください。

お忙しいところ恐れ入りますが、ご検討いただけますと幸いです。
{_footer(to_email)}"""
    return {"subject": subject, "body": body}


def get_template_b(name: str, to_email: str, reason: str = "スマホ非対応") -> dict:
    """
    パターンB：古い・スマホ非対応 → スマホ流入7割・SEO低下を訴求。

    Args:
        name:     店舗名
        to_email: 送信先メールアドレス
        reason:   具体的な問題点（"スマホ非対応" or "サイトの更新が必要"）

    Returns:
        subject・body を含むdict
    """
    subject = f"【{name}様へ】サイト改善で集患力アップのご提案"
    body = f"""{name} ご担当者様

はじめてご連絡いたします。
WEBサイト制作・LINE予約システムを専門とするWeldexの成田と申します。

{name}様のWEBサイトを拝見したところ、
「{reason}」の状態であることを確認しました。

現在、歯科・クリニックへのアクセスの約70%はスマートフォンからです。
スマホ非対応のサイトはGoogleの検索順位が下がり、
新規患者様が競合クリニックに流れてしまう可能性があります。

弊社では既存サイトのリニューアルも対応しており、
スマホ対応・SEO改善・予約システム導入を一括でご提供しています。

費用・事例について、まず資料をお送りすることも可能です。
よろしければこのメールにご返信ください。

お忙しいところ恐れ入りますが、ご検討いただけますと幸いです。
{_footer(to_email)}"""
    return {"subject": subject, "body": body}


def get_template_c(name: str, to_email: str) -> dict:
    """
    パターンC：電話予約のみ → 時間外の取りこぼしを訴求。

    Args:
        name:     店舗名
        to_email: 送信先メールアドレス

    Returns:
        subject・body を含むdict
    """
    subject = f"【{name}様へ】LINE予約導入で時間外の予約取りこぼしを防ぐご提案"
    body = f"""{name} ご担当者様

はじめてご連絡いたします。
WEBサイト制作・LINE予約システムを専門とするWeldexの成田と申します。

{name}様では現在、お電話での予約受付をされているかと思います。

診察時間外・昼休み中に予約しようとした患者様が、
電話がつながらず他のクリニックに行ってしまう——
そのような取りこぼしは、意外と多く発生しています。

弊社のLINE予約システムを導入いただくと、

・24時間いつでもLINEから予約受付
・自動リマインドで無断キャンセルを削減
・既存のLINE公式アカウントにそのまま追加可能

初期費用80,000円〜、月額費用なしで導入いただけます。

まず資料をお送りすることも可能ですので、
ご興味がございましたら返信いただけますと幸いです。

{_footer(to_email)}"""
    return {"subject": subject, "body": body}


# テンプレート選択マップ
TEMPLATE_MAP = {
    "A": get_template_a,
    "B": get_template_b,
    "C": get_template_c,
}


def get_template(template_key: str, name: str, to_email: str, **kwargs) -> dict:
    """
    テンプレートキー（A/B/C）に対応するメール内容を返す。

    Args:
        template_key: "A" / "B" / "C"
        name:         店舗名
        to_email:     送信先メールアドレス

    Returns:
        subject・body を含むdict
    """
    fn = TEMPLATE_MAP.get(template_key.upper())
    if not fn:
        raise ValueError(f"不明なテンプレートキー: {template_key}")
    return fn(name, to_email, **kwargs)
