"""
outreach/analyzers/site_checker.py
サイト診断：モバイル対応・技術年齢・予約システム・LINE・フォーム有無などを判定する

返却フィールド:
    status          : "none" / "old" / "no_mobile" / "phone_only" / "ok" / "error"
    email           : 抽出したメールアドレス（なければNone）
    detail          : 診断詳細メッセージ（人間が読む形式）
    has_line        : LINE公式連携あり（bool | None）
    has_online_booking: オンライン予約あり（bool | None）
    phone_only      : 電話のみ（bool）
    has_ssl         : HTTPS対応（bool）
    has_contact_form: お問い合わせフォームあり（bool | None）
    is_medical      : 医療系業種（bool）— テンプレートD選択に使用
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
from analyzers import robots
from analyzers.email_extractor import find_contacts

# ── 閾値 ─────────────────────────────────────────────────────────────────────
# 10年以上更新されていないサイトを「古い」と判定
OLD_YEAR_THRESHOLD = datetime.now().year - 10

# ── 医療系業種キーワード（テンプレートD選択・「患者様」呼称） ──────────────────
MEDICAL_INDUSTRIES = {
    "歯科", "歯医者", "デンタル", "クリニック", "病院", "医院", "診療",
    "整骨院", "接骨院", "整体", "動物病院", "整形外科", "内科", "外科",
    "皮膚科", "眼科", "耳鼻科", "産婦人科", "美容クリニック", "美容外科",
}

# ── 予約システム検出キーワード ────────────────────────────────────────────────
BOOKING_KEYWORDS = [
    '予約', 'ご予約', 'web予約', 'ネット予約', 'オンライン予約',
    'online booking', 'reserve', 'appointment',
    'hotpepper', 'airリザーブ', 'coubic', 'mindbody', 'reserva',
    'じゃらん', '楽天ビューティー', 'ビューティーナビ',
    'eparkクリニック・病院', 'epark', 'ドクターキューブ',
    'メディカル革命', 'clinicaltrial', 'medicalforce',
]

# ── LINE検出キーワード ────────────────────────────────────────────────────────
LINE_KEYWORDS = [
    'line.me/ti/p/', 'line.me/r/', 'lin.ee/',
    'line-scdn.net', 'line_url', 'line公式',
    'line@', 'lineで予約', 'lineから予約',
]

# ── 古い技術シグナル ──────────────────────────────────────────────────────────
# Flash
FLASH_PATTERNS = ['.swf', 'shockwave-flash', 'application/x-shockwave-flash']

# 非推奨HTML要素（2つ以上あれば古いと判定）
DEPRECATED_TAGS = ['<font ', '<center>', '<marquee', '<blink>', '<s >', '<strike>']

# 固定幅レイアウト検出（960px以上の固定幅 = スマホ時代以前の設計）
_FIXED_WIDTH_RE = re.compile(
    r'(?:width)\s*[=:]\s*["\']?\s*(?:9[6-9]\d|[1-9]\d{3})\s*(?:px)?["\']?',
    re.IGNORECASE,
)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; WeldexBot/1.0; +https://weldex.jp)'
}


# ── ユーティリティ ────────────────────────────────────────────────────────────

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


# ── 診断サブ関数 ──────────────────────────────────────────────────────────────

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


def _detect_old_tech(html: str, html_lower: str) -> tuple[bool, str]:
    """
    古い技術を使っているか検出する。

    Returns:
        (is_old_tech: bool, reason: str)
        reason は営業メールの reason フィールドに使われる
    """
    # フレームセット（1990年代〜2000年代の技術）
    if '<frameset' in html_lower or ('<frame ' in html_lower and 'framework' not in html_lower):
        return True, "フレームセット使用（非常に古い技術）"

    # Flash（2020年12月にサポート終了）
    if any(p in html_lower for p in FLASH_PATTERNS):
        return True, "Flashコンテンツ使用（2020年にサポート終了）"

    # 非推奨HTMLタグが複数（<font> <center> <marquee> 等）
    deprecated_count = sum(1 for tag in DEPRECATED_TAGS if tag in html_lower)
    if deprecated_count >= 2:
        return True, f"古いHTML構造（<font>/<center>等の非推奨タグを{deprecated_count}種確認）"

    # 固定幅レイアウト（960px以上の固定幅がbody/wrapperにある）
    # ただしtailwindやbootstrap等のモダンCSSがある場合は除外
    if _FIXED_WIDTH_RE.search(html):
        if 'tailwind' not in html_lower and 'bootstrap' not in html_lower and '@media' not in html:
            return True, "固定幅レイアウト（スマホで表示崩れが発生している可能性）"

    return False, ""


def is_medical_industry(industry: str) -> bool:
    """業種名が医療系かどうか判定する。"""
    if not industry:
        return False
    return any(kw in industry for kw in MEDICAL_INDUSTRIES)


# ── メイン診断関数 ────────────────────────────────────────────────────────────

def check_site(url: str, industry: str = "") -> dict:
    """
    URLのサイトを診断し、結果dictを返す。

    Args:
        url:      診断対象のURL
        industry: 業種名（医療系判定・テンプレート選択に使用）

    Returns dict:
        status          : "none" / "old" / "no_mobile" / "phone_only" / "ok" / "error"
        email           : 抽出したメールアドレス（なければNone）
        detail          : 診断詳細メッセージ
        has_line        : LINE公式連携あり（bool | None）
        has_online_booking: オンライン予約あり（bool | None）
        phone_only      : 電話のみ（bool）
        has_ssl         : HTTPS対応（bool）
        has_contact_form: お問い合わせフォームあり（bool | None）
        is_medical      : 医療系業種（bool）
    """
    medical = is_medical_industry(industry)

    result: dict = {
        "status": "none",
        "email": None,
        "detail": "",
        "has_line": None,
        "has_online_booking": None,
        "phone_only": False,
        "has_ssl": False,
        "has_contact_form": None,
        "contact_form_url": None,
        "is_medical": medical,
        "response_sec": None,
    }

    if not url or not url.strip():
        result["detail"] = "URLなし"
        return result

    # SSL確認
    result["has_ssl"] = url.startswith("https://")

    # robots.txtチェック（パス単位で尊重）
    if not robots.is_allowed(url):
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

    # サーバー応答時間（営業メールで具体数値として使う）
    try:
        result["response_sec"] = round(res.elapsed.total_seconds(), 1)
    except Exception:
        result["response_sec"] = None

    html       = _decode_html(res.content)
    html_lower = html.lower()

    # SSL証明書エラーの確認
    had_ssl_error = result["has_ssl"] and (getattr(res, 'url', url).startswith('http://'))
    if had_ssl_error:
        result["has_ssl"] = False

    # ── 詳細診断フラグ ────────────────────────────────────────────────────────
    result["has_line"]            = _detect_line(html_lower)
    result["has_online_booking"]  = _detect_online_booking(html_lower)

    # メール＋問い合わせフォームを1回の巡回でまとめて取得（robots尊重）
    contacts = find_contacts(html, url)
    result["email"]            = contacts["email"]
    result["contact_form_url"] = contacts["contact_form_url"]
    result["has_contact_form"] = contacts["contact_form_url"] is not None

    result["phone_only"]          = (
        not result["has_online_booking"] and not result["has_contact_form"]
    )

    # スマホ対応確認
    has_viewport    = bool(re.search(r'<meta[^>]+name=["\']viewport["\']', html, re.IGNORECASE))
    has_media_query = '@media' in html

    # Copyright年確認
    copyright_year   = _detect_copyright_year(html)
    is_old_copyright = (copyright_year is not None and copyright_year < OLD_YEAR_THRESHOLD)

    # 古い技術確認
    old_tech, old_tech_reason = _detect_old_tech(html, html_lower)

    # ── ステータス判定（優先度順）─────────────────────────────────────────────
    #
    # 優先度:
    #  1. SSL未対応                        → old
    #  2. 古い技術（フレーム/Flash/非推奨タグ）→ old
    #  3. Copyright 10年以上前              → old
    #  4. スマホ非対応                      → no_mobile
    #  5. 医療系 + 予約なし                  → phone_only（LINE訴求）
    #  6. 一般 + 電話のみ                   → phone_only
    #  7. 問題なし                          → ok

    if not result["has_ssl"]:
        result["status"] = "old"
        result["detail"] = "SSL未対応（HTTP）" if not url.startswith("https://") else "SSL証明書エラー"

    elif old_tech:
        result["status"] = "old"
        result["detail"] = old_tech_reason

    elif is_old_copyright:
        years_ago = datetime.now().year - copyright_year
        result["status"] = "old"
        result["detail"] = f"Copyright {copyright_year}年（{years_ago}年以上更新されていない可能性）"

    elif not has_viewport and not has_media_query:
        result["status"] = "no_mobile"
        result["detail"] = "スマホ非対応（viewport/メディアクエリなし）"

    elif result["phone_only"]:
        result["status"] = "phone_only"
        if medical:
            booking_hint = "LINE・WEB予約なし（電話のみ）"
            result["detail"] = f"{booking_hint} — 診察時間外の予約機会損失"
        else:
            result["detail"] = "ネット予約・フォームなし（電話のみと推定）"

    else:
        result["status"] = "ok"
        result["detail"] = "問題なし"

    # 応答が遅い場合は具体数値を detail に追記（メール生成時の訴求材料）
    sec = result.get("response_sec")
    if sec is not None and sec >= 1.5:
        result["detail"] += f"／サーバー応答 {sec}秒（推奨は1秒以内）"

    return result
