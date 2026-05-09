"""
outreach/analyzers/site_checker.py
サイト診断：モバイル対応・Copyright年・予約システム有無などを判定する

改善点：
- リトライ（最大2回）でタイムアウトによる取りこぼしを削減
- contactページ巡回でメール抽出率を改善
- SSL証明書エラーを "old" として営業対象に含める
- Copyright年未検出の場合はスキップ（判定しない）
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
from analyzers.email_extractor import extract_email_with_contact_page

OLD_YEAR_THRESHOLD = datetime.now().year - 5

BOOKING_KEYWORDS = [
    '予約', 'ご予約', 'web予約', 'ネット予約', 'オンライン予約',
    'online', 'booking', 'reserve', 'appointment',
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; WeldexBot/1.0; +https://weldex.jp)'
}


def _check_robots(base_url: str) -> bool:
    """robots.txtでクロールが許可されているか確認する。"""
    try:
        res = requests.get(
            urljoin(base_url, '/robots.txt'),
            timeout=4, headers=HEADERS
        )
        if res.status_code != 200:
            return True
        for line in res.text.splitlines():
            line = line.strip().lower()
            if line.startswith('disallow:') and line.split(':', 1)[1].strip() == '/':
                return False
        return True
    except Exception:
        return True


def _decode_html(content: bytes) -> str:
    """文字コードを自動判定してHTMLをデコードする（Shift-JIS対応）。"""
    detected = chardet.detect(content)
    encoding = detected.get('encoding') or 'utf-8'
    try:
        return content.decode(encoding, errors='replace')
    except (LookupError, UnicodeDecodeError):
        return content.decode('utf-8', errors='replace')


def _fetch_with_retry(url: str, retries: int = 2) -> requests.Response | None:
    """
    URLを取得する。タイムアウト時は短い待機後にリトライする。

    Args:
        url:     取得するURL
        retries: リトライ回数

    Returns:
        Responseオブジェクト（失敗時はNone）
    """
    import time
    for attempt in range(retries):
        try:
            return requests.get(
                url, timeout=REQUEST_TIMEOUT_SEC,
                headers=HEADERS, allow_redirects=True,
                verify=True
            )
        except requests.exceptions.SSLError:
            # SSL証明書エラーは verify=False で再試行
            try:
                return requests.get(
                    url, timeout=REQUEST_TIMEOUT_SEC,
                    headers=HEADERS, allow_redirects=True,
                    verify=False
                )
            except Exception:
                return None
        except requests.exceptions.Timeout:
            if attempt < retries - 1:
                time.sleep(1)
            continue
        except requests.exceptions.ConnectionError:
            return None
        except Exception:
            return None
    return None


def _detect_copyright_year(html: str) -> int | None:
    """HTMLからCopyrightの最新年を抽出する。"""
    pattern = re.compile(
        r'(?:copyright|©|&copy;|コピーライト)[\s\S]{0,40}?(20\d{2})',
        re.IGNORECASE
    )
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

    if not url or not url.strip():
        result["detail"] = "URLなし"
        return result

    # robots.txtチェック
    if not _check_robots(url):
        result["status"] = "error"
        result["detail"] = "robots.txtにより収集禁止"
        return result

    # サイト取得（リトライあり）
    res = _fetch_with_retry(url)

    if res is None:
        result["detail"] = "接続失敗（タイムアウトまたは接続不可）"
        return result

    if res.status_code == 404:
        result["detail"] = "404 Not Found"
        return result
    if res.status_code >= 400:
        result["detail"] = f"HTTPエラー: {res.status_code}"
        return result

    html = _decode_html(res.content)

    # SSL確認（verify=Falseで取得できた = SSL証明書エラー）
    is_https = url.startswith("https://")
    had_ssl_error = is_https and not getattr(res, '_verified', True)

    # メールアドレス抽出（contactページも巡回）
    result["email"] = extract_email_with_contact_page(html, url)

    # スマホ対応確認
    has_viewport    = bool(re.search(r'<meta[^>]+name=["\']viewport["\']', html, re.IGNORECASE))
    has_media_query = '@media' in html

    # 予約システム確認
    html_lower = html.lower()
    has_booking = any(kw in html_lower for kw in BOOKING_KEYWORDS)

    # Copyright年確認
    copyright_year  = _detect_copyright_year(html)
    is_old_copyright = (copyright_year is not None and copyright_year < OLD_YEAR_THRESHOLD)

    # ステータス判定（優先度順）
    if not is_https or had_ssl_error:
        result["status"] = "old"
        result["detail"] = "SSL未対応（HTTP）" if not is_https else "SSL証明書エラー"
    elif is_old_copyright:
        result["status"] = "old"
        result["detail"] = f"Copyright {copyright_year}年（{datetime.now().year - copyright_year}年前）"
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
