"""
outreach/collectors/google_places.py
Google Places APIでターゲット企業を収集してDBに保存する
"""
import time
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import requests
from config import GOOGLE_PLACES_API_KEY, COLLECT_INTERVAL_SEC
from collectors.area_config import get_search_queries
from db.database import upsert_target, write_log

PLACES_TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
PLACES_DETAILS_URL     = "https://maps.googleapis.com/maps/api/place/details/json"


def _fetch_places(query: str, page_token: str = None) -> dict:
    """
    Places Text Search APIを呼び出す。

    Args:
        query:      検索クエリ（例：「歯科医院 東京都渋谷区」）
        page_token: 次ページトークン

    Returns:
        APIレスポンスのdict
    """
    params = {
        "query":    query,
        "language": "ja",
        "key":      GOOGLE_PLACES_API_KEY,
    }
    if page_token:
        params["pagetoken"] = page_token

    try:
        res = requests.get(PLACES_TEXT_SEARCH_URL, params=params, timeout=10)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        write_log("ERROR", "collect", f"Places API呼び出し失敗: {e}")
        return {}


def _fetch_details(place_id: str) -> dict:
    """
    Places Details APIで電話番号・URLを取得する。

    Args:
        place_id: Google Place ID

    Returns:
        detailsのdict（なければ空dict）
    """
    params = {
        "place_id": place_id,
        "fields":   "name,formatted_phone_number,website",
        "language": "ja",
        "key":      GOOGLE_PLACES_API_KEY,
    }
    try:
        res = requests.get(PLACES_DETAILS_URL, params=params, timeout=10)
        res.raise_for_status()
        data = res.json()
        return data.get("result", {})
    except Exception as e:
        write_log("WARN", "collect", f"Details API失敗 ({place_id}): {e}")
        return {}


def collect_targets(industry: str, area: str, limit: int = 20) -> int:
    """
    業種とエリアを指定してターゲットを収集しDBに保存する。

    Args:
        industry: 業種名（例：「歯科医院」）
        area:     エリア名（例：「東京都渋谷区」）
        limit:    収集上限件数

    Returns:
        新規保存件数
    """
    queries  = get_search_queries(industry, area)
    saved    = 0

    for query in queries:
        if saved >= limit:
            break

        write_log("INFO", "collect", f"収集開始: {query}")
        page_token = None

        while saved < limit:
            data = _fetch_places(query, page_token)

            if data.get("status") not in ("OK", "ZERO_RESULTS"):
                write_log("ERROR", "collect", f"APIエラー: {data.get('status')} / {query}")
                break

            results = data.get("results", [])
            if not results:
                break

            for place in results:
                if saved >= limit:
                    break

                place_id = place.get("place_id", "")
                name     = place.get("name", "")
                address  = place.get("formatted_address", "")

                # Details APIで電話・URLを取得
                time.sleep(COLLECT_INTERVAL_SEC)
                details  = _fetch_details(place_id)
                phone    = details.get("formatted_phone_number", "")
                website  = details.get("website", "")

                target = {
                    "place_id": place_id,
                    "name":     name,
                    "address":  address,
                    "phone":    phone,
                    "website":  website,
                    "industry": industry,
                    "area":     area,
                }

                is_new = upsert_target(target)
                if is_new:
                    saved += 1
                    write_log("INFO", "collect", f"保存: {name} ({address})")
                else:
                    write_log("INFO", "collect", f"重複スキップ: {name}")

            # 次ページ
            page_token = data.get("next_page_token")
            if not page_token:
                break

            # next_page_token は2秒待たないと有効にならない
            time.sleep(2)

    write_log("INFO", "collect", f"収集完了: {saved}件保存 ({industry} / {area})")
    return saved
