"""
outreach/analyzers/site_checker.py
サイト診断：モバイル対応・Copyright年・予約システム有無などを判定する
"""
import re
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import requests
import chardet
from urllib.parse import urljoin, urlparse
from datetime import datetime
from config import REQUEST_TIMEOUT_SEC
from analyzers.email_extractor import extract_email

# Copyright年判定：5年以上前を "old" とする
OLD_YEAR_THRESHOLD = datetime.now().year - 5

# 予約システムの検出キーワード
BOOKING_KEYWORDS = [
    '予約', 'ご予約', '受付', 'online', 'web予約', 'ネット予約',
    'booking', 'reserve', 'appointment', 'calendar',
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; WeldexBot/1.0; +https://weldex.jp)'
}


def _check_robots(base_url: str) -> bool:
    """
    robots.txtでクロールが許可されているか確認する。

    Returns:
        True=クロール許可 / False=禁止
    """
    try:
        robots_url = urljoin(base_url, '/robots.txt')
        res = requests.get(robots_url, timeout=5, headers=HEADERS)
        if res.status_code != 200:
            return True  # robots.txtなし → 許可扱い
        # Disallow: / の全拒否チェック
        for line in res.text.splitlines():
            line = line.strip().lower()
            if line.startswith('disallow:') and line.split(':', 1)[1].strip() == '/':
                return False
        return True
    except Exception:
        return True  # 取得失敗 → 許可扱い


def _decode_html(content: bytes) -> str:
    """文字コードを自動判定してHTMLをデコードする（Shift-JIS対応）。"""
    detected = chardet.detect(content)
    encoding = detected.get('encoding') or 'utf-8'
    try:
        return content.decode(encoding, errors='replace')
    except (LookupError, UnicodeDecodeError):
        return content.decode('utf-8', errors='replace')


def _detect_copyright_year(html: str) -> int | None:
    """HTMLからCopyrightの最新年を抽出する。"""
    pattern = re.compile(r'(?:copyright|©|&copy;)[\s\S]{0,30}(20\d{2})', re.IGNORECASE)
    years = [int(m.group(1)) for m in pattern.finditer(html)]
    return max(years) if years else None


def check_site(url: str) -> dict:
    """
    URLのサイトを診断し、結果dictを返す。

    Returns dict:
        status: "none" / "old" / "no_mobile" / "phone_only" / "ok" / "error"
        email:  抽出したメールアドレス（なければNone）
        detail: 診断詳細メッセージ
    """
    result = {"status": "none", "email": None, "detail": ""}

    # URLなし
    if not url or not url.strip():
        result["detail"] = "URLなし"
        return result

    # robots.txtチェック
    if not _check_robots(url):
        result["status"] = "error"
        result["detail"] = "robots.txtにより収集禁止"
        return result

    # サイト取得
    try:
        res = requests.get(
            url, timeout=REQUEST_TIMEOUT_SEC,
            headers=HEADERS, allow_redirects=True
        )
    except requests.exceptions.SSLError:
        result["detail"] = "SSL証明書エラー"
        return result
    except requests.exceptions.Timeout:
        result["detail"] = "タイムアウト"
        return result
    except requests.exceptions.ConnectionError:
        result["detail"] = "接続不可"
        return result
    except Exception as e:
        result["status"] = "error"
        result["detail"] = f"取得エラー: {e}"
        return result

    if res.status_code == 404:
        result["detail"] = "404 Not Found"
        return result
    if res.status_code >= 400:
        result["detail"] = f"HTTPエラー: {res.status_code}"
        return result

    html = _decode_html(res.content)

    # メールアドレス抽出
    result["email"] = extract_email(html, url)

    # SSL確認
    is_https = url.startswith("https://")

    # スマホ対応確認
    has_viewport = bool(re.search(r'<meta[^>]+name=["\']viewport["\']', html, re.IGNORECASE))
    has_media_query = '@media' in html

    # 予約システム確認
    html_lower = html.lower()
    has_booking = any(kw in html_lower for kw in BOOKING_KEYWORDS)

    # Copyright年確認
    copyright_year = _detect_copyright_year(html)
    is_old_copyright = (copyright_year is not None and copyright_year < OLD_YEAR_THRESHOLD)

    # ステータス判定（優先度順）
    if not is_https or is_old_copyright:
        reason = "SSL未対応" if not is_https else f"Copyright {copyright_year}年（古い）"
        result["status"] = "old"
        result["detail"] = reason
    elif not has_viewport and not has_media_query:
        result["status"] = "no_mobile"
        result["detail"] = "スマホ非対応（viewport/media queryなし）"
    elif not has_booking:
        result["status"] = "phone_only"
        result["detail"] = "ネット予約なし（電話のみと推定）"
    else:
        result["status"] = "ok"
        result["detail"] = "問題なし"

    return result
