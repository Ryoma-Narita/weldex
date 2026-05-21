"""
outreach/analyzers/site_checker.py
サイト診断：モバイル対応・Copyright年・予約システム・LINE・フォーム有無などを判定する

返却フィールド:
    status          : "none" / "old" / "no_mobile" / "phone_only" / "ok" / "error"
    email           : 抽出したメールアドレス（なければNone）
    detail          : 診断詳細メッセージ
    has_line        : LINE公式連携あり（bool | None）
    has_online_booking: オンライン予約あり（bool | None）
    phone_only      : 電話のみ（bool）
    has_ssl         : HTTPS対応（bool）
    has_contact_form: お問い合わせフォームあり（bool | None）
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
    'hotpepper', 'airリザーブ', 'coubic', 'mindbody', 'reserva',
    'じゃらん', '楽天ビューティー', 'ビューティーナビ',
]

LINE_KEYWORDS = [
    'line.me/ti/p/', 'line.me/r/', 'lin.ee/',
    'line-scdn.net', 'line_url', 'line公式',
    'line@', 'lineで予約',
]

FORM_KEYWORDS = [
    '<form', 'お問い合わせフォーム', 'contact form',
    'formspree', 'googleフォーム', 'typeform',
    'お問い合わせはこちら', '問い合わせフォーム',
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


def _detect_line(html_lower: str) -> bool:
    """LINE公式アカウントへのリンクがあるか確認する。"""
    return any(kw in html_lower for kw in LINE_KEYWORDS)


def _detect_online_booking(html_lower: str) -> bool:
    """オンライン予約システムへの言及があるか確認する。"""
    return any(kw in html_lower for kw in BOOKING_KEYWORDS)


def _detect_contact_form(html: str, url: str) -> bool:
    """
    お問い合わせフォームがあるか確認する。
    トップページになければ /contact 等を巡回する。
    """
    html_lower = html.lower()
    if any(kw.lower() in html_lower for kw in FORM_KEYWORDS):
        return True

    # contactページも確認
    if not url:
        return False
    base = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
    for path in ['/contact', '/inquiry', '/form', '/contact.html', '/inquiry.html']:
        try:
            res = requests.get(
                urljoin(base, path), timeout=5,
                headers=HEADERS, allow_redirects=True
            )
            if res.status_code == 200:
                contact_html = _decode_html(res.content).lower()
                if '<form' in contact_html or 'formspree' in contact_html:
                    return True
        except Exception:
            continue
    return False


def check_site(url: str) -> dict:
    """
    URLのサイトを診断し、結果dictを返す。

    Returns dict:
        status          : "none" / "old" / "no_mobile" / "phone_only" / "ok" / "error"
        email           : 抽出したメールアドレス（なければNone）
        detail          : 診断詳細メッセージ
        has_line        : LINE公式連携あり（bool | None）
        has_online_booking: オンライン予約あり（bool | None）
        phone_only      : 電話のみ（bool）
        has_ssl         : HTTPS対応（bool）
        has_contact_form: お問い合わせフォームあり（bool | None）
    """
    result: dict = {
        "status": "none",
        "email": None,
        "detail": "",
        "has_line": None,
        "has_online_booking": None,
        "phone_only": False,
        "has_ssl": False,
        "has_contact_form": None,
    }

    if not url or not url.strip():
        result["detail"] = "URLなし"
        return result

    # SSL確認（URLがhttpsかどうか）
    result["has_ssl"] = url.startswith("https://")

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

    html      = _decode_html(res.content)
    html_lower = html.lower()

    # SSL証明書エラーの確認（verify=Falseで取得成功 = 証明書エラー）
    had_ssl_error = result["has_ssl"] and (getattr(res, 'url', url).startswith('http://'))
    if had_ssl_error:
        result["has_ssl"] = False

    # ── 詳細診断フラグ ────────────────────────────────────
    result["has_line"]           = _detect_line(html_lower)
    result["has_online_booking"] = _detect_online_booking(html_lower)
    result["has_contact_form"]   = _detect_contact_form(html, url)
    result["phone_only"]         = (
        not result["has_online_booking"] and not result["has_contact_form"]
    )

    # メールアドレス抽出（contactページも巡回）
    result["email"] = extract_email_with_contact_page(html, url)

    # スマホ対応確認
    has_viewport    = bool(re.search(r'<meta[^>]+name=["\']viewport["\']', html, re.IGNORECASE))
    has_media_query = '@media' in html

    # Copyright年確認
    copyright_year   = _detect_copyright_year(html)
    is_old_copyright = (copyright_year is not None and copyright_year < OLD_YEAR_THRESHOLD)

    # ── ステータス判定（優先度順）────────────────────────
    if not result["has_ssl"]:
        result["status"] = "old"
        result["detail"] = "SSL未対応（HTTP）" if not url.startswith("https://") else "SSL証明書エラー"
    elif is_old_copyright:
        result["status"] = "old"
        result["detail"] = f"Copyright {copyright_year}年（{datetime.now().year - copyright_year}年前）"
    elif not has_viewport and not has_media_query:
        result["status"] = "no_mobile"
        result["detail"] = "スマホ非対応（viewport/media queryなし）"
    elif result["phone_only"]:
        result["status"] = "phone_only"
        result["detail"] = "ネット予約・フォームなし（電話のみと推定）"
    else:
        result["status"] = "ok"
        result["detail"] = "問題なし"

    return result
