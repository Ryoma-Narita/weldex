"""
outreach/analyzers/robots.py
robots.txt をホスト単位でキャッシュし、パス単位でクロール可否を判定する。

標準ライブラリ urllib.robotparser を使用するため、ルート全面禁止だけでなく
`Disallow: /contact` のような部分Disallowも正しく尊重できる。
（旧 site_checker._check_robots は "Disallow: /" 完全一致しか見ておらず穴があった）
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import requests
from urllib.parse import urlparse
from urllib import robotparser

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; WeldexBot/1.0; +https://weldex.jp)'
}
USER_AGENT = 'WeldexBot'

# ホスト（scheme://netloc）単位の robots キャッシュ（プロセス内で再取得を防ぐ）
_cache: dict[str, robotparser.RobotFileParser] = {}


def _load(host: str) -> robotparser.RobotFileParser:
    """
    host の robots.txt を取得してパーサを返す。
    取得できない/存在しない場合は全許可（保守的に通す）。

    Args:
        host: スキーム付きホスト（例: https://example.com）

    Returns:
        設定済み RobotFileParser
    """
    rp = robotparser.RobotFileParser()
    try:
        res = requests.get(host + '/robots.txt', timeout=4, headers=HEADERS)
        if res.status_code == 200 and res.text.strip():
            rp.parse(res.text.splitlines())
        else:
            rp.allow_all = True
    except Exception:
        rp.allow_all = True
    return rp


def is_allowed(url: str) -> bool:
    """
    指定URLが robots.txt 上クロール許可されているか判定する。

    Args:
        url: 判定対象のフルURL

    Returns:
        True=クロール可 / False=禁止
    """
    if not url:
        return False
    try:
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return False
        host = f"{parsed.scheme}://{parsed.netloc}"
        rp = _cache.get(host)
        if rp is None:
            rp = _load(host)
            _cache[host] = rp
        return rp.can_fetch(USER_AGENT, url)
    except Exception:
        # 判定不能時は通す（従来挙動を踏襲）
        return True
