"""
outreach/mailers/templates.py
営業メール文面 A/B/C/D パターン

選択ロジック:
  A: サイトなし（site_status='none'）            → 集客機会損失を訴求
  B: 古い・スマホ非対応（'old'/'no_mobile'）      → 具体的な問題点を提示しサイト改善を訴求
  C: 電話のみ（'phone_only'・一般業種）           → 24時間WEB予約を訴求
  D: 電話のみ（'phone_only'・医療系）             → LINE予約・無断キャンセル削減・新患獲得を訴求

法的要件（特定電子メール法）:
  - 配信停止リンク必須
  - 送信者氏名・住所・メールアドレス必須
"""
import os

UNSUBSCRIBE_URL = "https://weldex.jp/unsubscribe"
SENDER_ADDRESS  = os.environ.get("SENDER_ADDRESS", "※住所はお問い合わせにてご案内いたします")

# 医療系業種キーワード（「患者様」と呼ぶ業種 / テンプレートD選択条件）
_MEDICAL_KEYWORDS = {
    "歯科", "歯医者", "デンタル", "クリニック", "病院", "医院", "診療",
    "整骨院", "接骨院", "整体", "動物病院", "整形外科", "内科", "外科",
    "皮膚科", "眼科", "耳鼻科", "産婦人科", "美容クリニック", "美容外科",
}


def _customer_term(industry: str) -> str:
    """業種に応じた顧客呼称を返す。医療系は「患者様」、それ以外は「お客様」。"""
    for kw in _MEDICAL_KEYWORDS:
        if kw in industry:
            return "患者様"
    return "お客様"


def is_medical(industry: str) -> bool:
    """業種が医療系かどうかを返す。テンプレートC/D選択に使用。"""
    return any(kw in industry for kw in _MEDICAL_KEYWORDS)


def _footer(to_email: str) -> str:
    """
    メール共通フッター（特定電子メール法第3条・必須記載事項）。

    必須: 送信者氏名・住所・送信者アドレス・配信停止手段
    """
    return f"""
──────────────────────────────
このメールは {to_email} 宛にお送りしています。
配信停止をご希望の方はこちら：{UNSUBSCRIBE_URL}?email={to_email}

Weldex（ウェルデックス）
担当：成田 涼真
住所：{SENDER_ADDRESS}
メール：info@weldex.jp
サイト：https://weldex.jp
──────────────────────────────
"""


def get_template_a(
    name: str,
    to_email: str,
    industry: str = "事業者",
    **kwargs,
) -> dict:
    """
    パターンA：サイトなし → WEB集客の機会損失を訴求。

    Args:
        name:     店舗・会社名
        to_email: 送信先メールアドレス
        industry: 業種名（例：歯科医院、整骨院、不動産会社）
    """
    customer = _customer_term(industry)
    subject  = f"【{name}様へ】WEBサイトでの集客強化のご提案"
    body = f"""{name} ご担当者様

突然のご連絡失礼いたします。
WEBサイト制作・予約システムを提供するWeldexの成田と申します。

{industry}をお探しの{customer}の多くは、まずインターネットで検索されます。
現在、{name}様のWEBサイトが確認できない状況のため、
その段階で競合他社へ{customer}が流れてしまっている可能性があります。

弊社ではAIを活用することで、大手制作会社の3分の1以下のコストで
WEBサイト制作・WEB予約システムを一社でご提供しています。

まずは無料で診断レポートをお送りすることも可能です。
ご興味があれば、このメールにご返信ください。

お忙しいところ恐れ入りますが、ご検討いただけますと幸いです。
{_footer(to_email)}"""
    return {"subject": subject, "body": body}


def get_template_b(
    name: str,
    to_email: str,
    industry: str = "事業者",
    reason: str   = "サイトの改善が必要な状態",
    **kwargs,
) -> dict:
    """
    パターンB：古い・スマホ非対応 → 具体的な問題点を提示しサイト改善・SEO低下リスクを訴求。

    Args:
        name:     店舗・会社名
        to_email: 送信先メールアドレス
        industry: 業種名
        reason:   診断結果から生成した具体的な問題文言（詳細説明に使用）
    """
    customer = _customer_term(industry)
    subject  = f"【{name}様へ】サイト改善で集客力アップのご提案"
    body = f"""{name} ご担当者様

突然のご連絡失礼いたします。
WEBサイト制作・予約システムを提供するWeldexの成田と申します。

{name}様のWEBサイトを拝見したところ、
「{reason}」という状態を確認しました。

現在、{industry}を探している{customer}のアクセスの大半はスマートフォンからです。
スマホ非対応・更新が古いサイトはGoogleの検索順位が下がりやすく、
新規の{customer}が競合へ流れやすい状況になっています。

弊社ではAIを活用し、大手の3分の1以下のコストで
サイトリニューアル・スマホ対応・WEB予約システム導入を一括でご提供しています。

費用・導入事例について、資料をお送りすることも可能です。
ご興味があれば、このメールにご返信ください。

お忙しいところ恐れ入りますが、ご検討いただけますと幸いです。
{_footer(to_email)}"""
    return {"subject": subject, "body": body}


def get_template_c(
    name: str,
    to_email: str,
    industry: str = "事業者",
    **kwargs,
) -> dict:
    """
    パターンC：電話のみ（一般業種）→ 時間外の機会損失・24時間受付を訴求。

    Args:
        name:     店舗・会社名
        to_email: 送信先メールアドレス
        industry: 業種名
    """
    customer = _customer_term(industry)
    subject  = f"【{name}様へ】24時間WEB予約・問い合わせ導入のご提案"
    body = f"""{name} ご担当者様

突然のご連絡失礼いたします。
WEBサイト制作・予約システムを提供するWeldexの成田と申します。

{name}様では現在、お電話での予約・お問い合わせ受付をされているかと存じます。

営業時間外や昼休み中に連絡しようとされた{customer}が
電話につながらず、他社へ流れてしまう——
そのような機会損失は、想像以上に多く発生しています。

弊社の24時間対応WEB予約・問い合わせシステムを導入いただくと、

・時間を問わずWEBから予約・問い合わせを受け付け
・自動リマインドでキャンセルを削減
・既存サイトへの追加も対応可能

AIを活用することで、大手の3分の1以下のコストで導入いただいています。

まずは資料をお送りすることも可能ですので、
ご興味があれば、このメールにご返信ください。

お忙しいところ恐れ入りますが、ご検討いただけますと幸いです。
{_footer(to_email)}"""
    return {"subject": subject, "body": body}


def get_template_d(
    name: str,
    to_email: str,
    industry: str = "歯科医院",
    **kwargs,
) -> dict:
    """
    パターンD：医療系・予約システムなし → LINE予約・無断キャンセル削減・新患獲得を訴求。

    歯科・クリニック・整骨院など「電話予約のみ」の医療系に特化したテンプレート。
    LINEの普及率とオンライン予約の利便性を軸に訴求する。

    Args:
        name:     店舗・会社名
        to_email: 送信先メールアドレス
        industry: 業種名（例：歯科医院、内科クリニック）
    """
    subject = f"【{name}様へ】LINE・WEB予約システム導入のご提案"
    body = f"""{name} ご担当者様

突然のご連絡失礼いたします。
WEBサイト制作・予約システムを提供するWeldexの成田と申します。

{name}様では現在、お電話での予約受付をされているかと存じます。

診察時間外や昼休み中に「今すぐ予約したい」と思った患者様が
電話がつながらず、近くの別の{industry}を選んでしまう——
このような機会損失は、実際に多くの医院で発生しています。

弊社のLINE・WEB予約システムを導入いただくと：

・LINE公式アカウントから24時間いつでも予約受付
・自動リマインドで無断キャンセルを大幅削減
・診察券番号なしでも予約可能（新患獲得のハードルが下がる）
・受付スタッフの電話対応時間を削減し、診療に集中できる環境に

AIを活用することで、大手の3分の1以下のコストで導入いただいています。
実際にご利用いただいている{industry}では、
導入後3ヶ月でWEB経由の予約が全体の40%を超えた事例もございます。

まずは資料をお送りすることも可能ですので、
ご興味があれば、このメールにご返信ください。

お忙しいところ恐れ入りますが、ご検討いただけますと幸いです。
{_footer(to_email)}"""
    return {"subject": subject, "body": body}


# ── 診断結果 → テンプレートの reason 文言マップ ─────────────────────────────
# site_checkerの detail をそのまま使うが、フォールバック用に定義
REASON_MAP: dict[str, str] = {
    "old":       "サイトの情報が古い、もしくは古い技術が使われている可能性",
    "no_mobile": "スマートフォン非対応（閲覧時にレイアウトが崩れる可能性）",
}

# テンプレート選択マップ
TEMPLATE_MAP = {
    "A": get_template_a,
    "B": get_template_b,
    "C": get_template_c,
    "D": get_template_d,
}


def get_template(
    template_key: str,
    name: str,
    to_email: str,
    industry: str    = "事業者",
    site_status: str = "",
    detail: str      = "",
    **kwargs,
) -> dict:
    """
    テンプレートキー（A/B/C/D）と診断情報からメール内容を返す。

    Args:
        template_key: "A" / "B" / "C" / "D"
        name:         店舗・会社名
        to_email:     送信先メールアドレス
        industry:     業種名（例：歯科医院）
        site_status:  診断ステータス（reason生成に使用）
        detail:       site_checkerのdetailフィールド（Bテンプレートのreasonに優先使用）
    """
    fn = TEMPLATE_MAP.get(template_key.upper())
    if not fn:
        raise ValueError(f"不明なテンプレートキー: {template_key}")

    # reasonは site_checker の detail を優先し、なければ REASON_MAP のフォールバックを使用
    reason = detail if detail else REASON_MAP.get(site_status, "改善の余地がある状態")
    return fn(name, to_email, industry=industry, reason=reason, **kwargs)


def select_template_key(site_status: str, industry: str) -> str:
    """
    診断ステータスと業種からテンプレートキーを自動選択する。

    選択ルール:
      - none         → A（サイトなし）
      - old          → B（古い・問題あり）
      - no_mobile    → B（スマホ非対応）
      - phone_only + 医療系 → D（LINE予約訴求）
      - phone_only + 一般  → C（24時間WEB予約訴求）
      - ok           → B（改善余地あり）

    Args:
        site_status: "none" / "old" / "no_mobile" / "phone_only" / "ok"
        industry:    業種名

    Returns:
        テンプレートキー "A" / "B" / "C" / "D"
    """
    if site_status == "none":
        return "A"
    if site_status in ("old", "no_mobile"):
        return "B"
    if site_status == "phone_only":
        return "D" if is_medical(industry) else "C"
    # ok / error / その他 → 改善余地ありとしてB
    return "B"
