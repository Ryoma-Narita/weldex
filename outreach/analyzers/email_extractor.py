"""
outreach/analyzers/email_extractor.py
HTMLからメールアドレス・問い合わせフォームURLを抽出する。

改善点:
- 固定パスの当て推量をやめ、トップページから「実在する問い合わせリンク」を辿る
- トップ＋問い合わせページの取得を1回に統合（メール抽出とフォーム判定を同時実行）
- 難読化メール（全角＠・(at)表記・HTMLエンティティ）と JSON-LD(schema.org) の email を拾う
- 巡回前に robots.txt をパス単位で尊重する
- メールが無くてもフォームURLを第2のアプローチ経路として返す
"""
import re
import json
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import requests
import chardet
from urllib.parse import urlparse, urljoin
from config import REQUEST_TIMEOUT_SEC
from analyzers import robots

# 除外する拡張子・プレフィックス
EXCLUDED_EXTENSIONS = {'.png', '.jpg', '.gif', '.svg', '.css', '.js', '.woff', '.pdf'}
EXCLUDED_PREFIXES   = {'noreply', 'no-reply', 'webmaster', 'postmaster', 'bounce', 'mailer-daemon', 'support'}

EMAIL_PATTERN = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'
)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; WeldexBot/1.0; +https://weldex.jp)'
}

# 問い合わせリンク検出：href に含まれがちな語
CONTACT_HREF_HINTS = [
    'contact', 'inquiry', 'enquiry', 'toiawase', 'otoiawase',
    'form', 'mail', 'access', 'support', 'soudan',
]
# 問い合わせリンク検出：リンク文字列に含まれがちな語
CONTACT_TEXT_HINTS = [
    '問い合わせ', '問合せ', '問合わせ', 'お問', 'コンタクト',
    'メールフォーム', 'ご相談', '相談', 'アクセス', 'contact', 'inquiry',
]

# フォーム判定：ホスト型フォームサービス（これがあれば即フォームあり）
HOSTED_FORM_SIGNALS = [
    'formspree', 'docs.google.com/forms', 'forms.gle', 'typeform',
    'ssl.form-mailer', 'form-mailer.jp', 'secure.shanon', 'satori.marketing',
    'hubspot', 'formrun.com', 'tayori.com',
]
# フォーム判定：問い合わせ文脈ヒント（<form> と併用で誤検知＝検索窓 を抑制）
FORM_CONTEXT_HINTS = [
    'お問い合わせ', 'お問合せ', '問い合わせ', 'お問合わせ',
    'contact', 'inquiry', 'メールフォーム', 'ご相談',
]


def _is_valid_email(email: str) -> bool:
    """メールアドレスが有効か検証する。True=有効 / False=除外。"""
    local, _, domain = email.partition('@')

    for ext in EXCLUDED_EXTENSIONS:
        if email.lower().endswith(ext):
            return False
    if local.lower() in EXCLUDED_PREFIXES:
        return False
    if re.fullmatch(r'[\d.]+', domain):
        return False
    if len(local) < 2:
        return False
    # 画像スプライト等のダミー（example.com 等）は通す（実在判定はSMTP不可のため最小限）
    return True


def _decode(content: bytes) -> str:
    """文字コードを自動判定してデコードする（Shift-JIS対応）。"""
    detected = chardet.detect(content)
    encoding = detected.get('encoding') or 'utf-8'
    try:
        return content.decode(encoding, errors='replace')
    except (LookupError, UnicodeDecodeError):
        return content.decode('utf-8', errors='replace')


def _normalize_obfuscated(s: str) -> str:
    """
    難読化されたメール表記を正規化する。

    - 全角 ＠ ． を半角化
    - HTMLエンティティ &#64; &#46; を復元
    - (at) [at] → @ ／ (dot) [dot] → .（角括弧/丸括弧で囲まれた形のみ。誤爆防止）
    """
    s = s.replace('＠', '@').replace('．', '.')
    s = s.replace('&#64;', '@').replace('&#046;', '.').replace('&#46;', '.')
    s = re.sub(r'\s*[\(\[]\s*at\s*[\)\]]\s*', '@', s, flags=re.IGNORECASE)
    s = re.sub(r'\s*[\(\[]\s*dot\s*[\)\]]\s*', '.', s, flags=re.IGNORECASE)
    return s


def _collect_jsonld_emails(obj, out: list) -> None:
    """JSON-LD オブジェクトを再帰的に走査し email 値を集める。"""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k.lower() == 'email' and isinstance(v, str):
                out.append(v.replace('mailto:', '').strip())
            else:
                _collect_jsonld_emails(v, out)
    elif isinstance(obj, list):
        for item in obj:
            _collect_jsonld_emails(item, out)


def _extract_jsonld_emails(html: str) -> list:
    """<script type="application/ld+json"> から email を抽出する。"""
    emails: list = []
    for m in re.finditer(
        r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>',
        html, re.IGNORECASE | re.DOTALL,
    ):
        block = m.group(1).strip()
        try:
            data = json.loads(block)
        except Exception:
            continue
        _collect_jsonld_emails(data, emails)
    return emails


def extract_email(html: str, url: str = "") -> str | None:
    """
    HTMLからメールアドレスを1件抽出する。
    優先順位：mailto: → JSON-LD(schema.org) → 本文（難読化正規化後）。

    Args:
        html: HTMLテキスト
        url:  ページのURL（未使用だが互換のため残す）

    Returns:
        抽出したメールアドレス（見つからない場合はNone）
    """
    text = _normalize_obfuscated(html)

    # 1. mailto: リンク
    for match in re.finditer(r'mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})', text):
        email = match.group(1)
        if _is_valid_email(email):
            return email

    # 2. JSON-LD（構造化データ）
    for email in _extract_jsonld_emails(html):
        if _is_valid_email(email):
            return email

    # 3. 本文テキスト
    for match in EMAIL_PATTERN.finditer(text):
        email = match.group(0)
        if _is_valid_email(email):
            return email

    return None


def _has_contact_form(html: str) -> bool:
    """
    お問い合わせフォームがあるか判定する。
    ホスト型フォームサービス、または <form> ＋（textarea or 問い合わせ文脈）で判定。
    検索窓のみの <form> を誤検知しないよう文脈ヒントを併用する。
    """
    low = html.lower()
    if any(sig in low for sig in HOSTED_FORM_SIGNALS):
        return True
    if '<form' in low:
        if '<textarea' in low or any(h in low for h in FORM_CONTEXT_HINTS):
            return True
    return False


def _find_contact_links(html: str, base_url: str) -> list:
    """
    トップページのHTMLから「実在する問い合わせページ」リンクを抽出する。
    href/リンク文字のヒントでスコアリングし、同一ドメインの上位3件を返す。
    """
    if not base_url:
        return []
    base_netloc = urlparse(base_url).netloc
    scored: list = []

    for m in re.finditer(
        r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
        html, re.IGNORECASE | re.DOTALL,
    ):
        href = m.group(1).strip()
        text = re.sub(r'<[^>]+>', '', m.group(2))
        hl = href.lower()
        if hl.startswith(('mailto:', 'tel:', 'javascript:', '#')):
            continue

        score = 0
        if any(h in hl for h in CONTACT_HREF_HINTS):
            score += 2
        if any(t in text for t in CONTACT_TEXT_HINTS):
            score += 2
        if score == 0:
            continue

        full = urljoin(base_url, href)
        if urlparse(full).netloc != base_netloc:
            continue
        scored.append((full, score))

    # スコア降順・重複排除・最大3件
    scored.sort(key=lambda x: -x[1])
    urls: list = []
    for full, _ in scored:
        if full not in urls:
            urls.append(full)
        if len(urls) >= 3:
            break
    return urls


def find_contacts(homepage_html: str, url: str) -> dict:
    """
    トップページのHTMLとURLから、メールアドレスと問い合わせフォームURLを探す。
    トップで揃わなければ、実在する問い合わせリンクを最大3件まで1回ずつ巡回する。
    各巡回前に robots.txt をパス単位で尊重する。

    Args:
        homepage_html: トップページのHTML
        url:           トップページのURL

    Returns dict:
        email            : 抽出メール（なければNone）
        contact_form_url : フォームのあるページURL（なければNone）
    """
    result = {"email": None, "contact_form_url": None}

    # 1. トップページ
    result["email"] = extract_email(homepage_html, url)
    if _has_contact_form(homepage_html):
        result["contact_form_url"] = url

    if result["email"] and result["contact_form_url"]:
        return result
    if not url:
        return result

    # 2. 実在の問い合わせリンクを巡回（最大3件・robots尊重・取得は各1回）
    for link in _find_contact_links(homepage_html, url):
        if not robots.is_allowed(link):
            continue
        try:
            res = requests.get(
                link, timeout=REQUEST_TIMEOUT_SEC,
                headers=HEADERS, allow_redirects=True,
            )
            if res.status_code != 200:
                continue
            page = _decode(res.content)
        except Exception:
            continue

        if not result["email"]:
            result["email"] = extract_email(page, link)
        if not result["contact_form_url"] and _has_contact_form(page):
            result["contact_form_url"] = link
        if result["email"] and result["contact_form_url"]:
            break

    return result


def extract_email_with_contact_page(html: str, url: str) -> str | None:
    """後方互換：メールアドレスのみ返す薄いラッパー。"""
    return find_contacts(html, url)["email"]
