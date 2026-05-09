"""
outreach/analyzers/email_extractor.py
HTMLからメールアドレスを抽出・検証する。
トップページで見つからない場合はcontactページも巡回する。
"""
import re
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import requests
import chardet
from urllib.parse import urlparse, urljoin
from config import REQUEST_TIMEOUT_SEC

# 除外する拡張子・プレフィックス
EXCLUDED_EXTENSIONS = {'.png', '.jpg', '.gif', '.svg', '.css', '.js', '.woff', '.pdf'}
EXCLUDED_PREFIXES   = {'noreply', 'no-reply', 'webmaster', 'postmaster', 'bounce', 'mailer-daemon', 'support'}

EMAIL_PATTERN = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'
)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; WeldexBot/1.0; +https://weldex.jp)'
}

# contactページの候補パス（優先順）
CONTACT_PATHS = [
    '/contact', '/contact.html', '/contact.php',
    '/inquiry', '/inquiry.html',
    '/form', '/form.html',
    '/access', '/about',
]


def _is_valid_email(email: str) -> bool:
    """
    メールアドレスが有効かどうかを検証する。

    Returns:
        True=有効 / False=除外
    """
    local, _, domain = email.partition('@')

    # 拡張子チェック
    for ext in EXCLUDED_EXTENSIONS:
        if email.lower().endswith(ext):
            return False

    # プレフィックスチェック
    if local.lower() in EXCLUDED_PREFIXES:
        return False

    # ドメイン部に数字のみは除外
    if re.fullmatch(r'[\d.]+', domain):
        return False

    # ローカル部が短すぎる
    if len(local) < 2:
        return False

    return True


def _decode(content: bytes) -> str:
    """文字コードを自動判定してデコードする（Shift-JIS対応）。"""
    detected = chardet.detect(content)
    encoding = detected.get('encoding') or 'utf-8'
    try:
        return content.decode(encoding, errors='replace')
    except (LookupError, UnicodeDecodeError):
        return content.decode('utf-8', errors='replace')


def extract_email(html: str, url: str = "") -> str | None:
    """
    HTMLからメールアドレスを1件抽出する。
    mailto: リンク優先、なければ本文から抽出。

    Args:
        html: HTMLテキスト
        url:  ページのURL

    Returns:
        抽出したメールアドレス（見つからない場合はNone）
    """
    # 1. mailto: リンクを優先的に探す
    for match in re.finditer(r'mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})', html):
        email = match.group(1)
        if _is_valid_email(email):
            return email

    # 2. テキスト内のメールアドレスを探す
    for match in EMAIL_PATTERN.finditer(html):
        email = match.group(0)
        if _is_valid_email(email):
            return email

    return None


def extract_email_with_contact_page(html: str, url: str) -> str | None:
    """
    トップページのHTMLでメールが見つからない場合、
    contactページも巡回してメールアドレスを抽出する。

    Args:
        html: トップページのHTML
        url:  トップページのURL

    Returns:
        抽出したメールアドレス（見つからない場合はNone）
    """
    # まずトップページから試みる
    email = extract_email(html, url)
    if email:
        return email

    if not url:
        return None

    base = f"{urlparse(url).scheme}://{urlparse(url).netloc}"

    # contactページ候補を順番に試みる
    for path in CONTACT_PATHS:
        contact_url = urljoin(base, path)
        try:
            res = requests.get(
                contact_url, timeout=REQUEST_TIMEOUT_SEC,
                headers=HEADERS, allow_redirects=True
            )
            if res.status_code != 200:
                continue
            contact_html = _decode(res.content)
            email = extract_email(contact_html, contact_url)
            if email:
                return email
        except Exception:
            continue

    return None
