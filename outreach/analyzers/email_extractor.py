"""
outreach/analyzers/email_extractor.py
HTMLからメールアドレスを抽出・検証する
"""
import re
from urllib.parse import urlparse

# 除外する拡張子・プレフィックス（誤抽出防止）
EXCLUDED_EXTENSIONS = {'.png', '.jpg', '.gif', '.svg', '.css', '.js', '.woff'}
EXCLUDED_PREFIXES   = {'noreply', 'no-reply', 'webmaster', 'postmaster', 'bounce', 'mailer-daemon'}

EMAIL_PATTERN = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'
)


def _is_valid_email(email: str, site_domain: str = "") -> bool:
    """
    メールアドレスが有効かどうかを検証する。

    Args:
        email:       検証するメールアドレス
        site_domain: サイトのドメイン（自社ドメイン優先判定に使用）

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

    # ドメイン部に数字のみは除外（例: 12345.com）
    if re.fullmatch(r'[\d.]+', domain):
        return False

    return True


def extract_email(html: str, url: str = "") -> str | None:
    """
    HTMLからメールアドレスを1件抽出する。
    mailto: リンク優先、なければ本文から抽出。

    Args:
        html: HTMLテキスト
        url:  ページのURL（ドメイン判定に使用）

    Returns:
        抽出したメールアドレス（見つからない場合はNone）
    """
    site_domain = urlparse(url).netloc if url else ""

    # 1. mailto: リンクを優先的に探す
    mailto_pattern = re.compile(r'mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})')
    for match in mailto_pattern.finditer(html):
        email = match.group(1)
        if _is_valid_email(email, site_domain):
            return email

    # 2. テキスト内のメールアドレスを探す
    for match in EMAIL_PATTERN.finditer(html):
        email = match.group(0)
        if _is_valid_email(email, site_domain):
            return email

    return None
