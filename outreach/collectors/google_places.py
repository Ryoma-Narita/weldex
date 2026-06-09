"""
outreach/collectors/google_places.py
Google Places APIでターゲット企業を収集してDBに保存する

改善点:
- Details APIで types を取得し、業種を補正（dentist→歯科医院 等）
- 大手チェーン・フランチャイズを除外（ターゲット外）
- 収集ログの詳細化
"""
import time
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import requests
from config import GOOGLE_PLACES_API_KEY, COLLECT_INTERVAL_SEC
from collectors.area_config import get_search_queries
from db.database import upsert_target, write_log, target_exists

PLACES_TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
PLACES_DETAILS_URL     = "https://maps.googleapis.com/maps/api/place/details/json"

# ── Google Place types → 業種名マッピング ─────────────────────────────────────
# Google が返す types フィールドから、Weldex の業種分類に補正する
_TYPES_TO_INDUSTRY: dict[str, str] = {
    "dentist":              "歯科医院",
    "doctor":               "クリニック",
    "hospital":             "クリニック",
    "physiotherapist":      "整骨院",
    "health":               "クリニック",
    "beauty_salon":         "美容室",
    "hair_care":            "美容室",
    "lawyer":               "司法書士",
    "accounting":           "税理士",
    "general_contractor":   "建設会社",
    "roofing_contractor":   "建設会社",
    "painter":              "リフォーム",
    "spa":                  "美容外科",
}

# ── 大手チェーン・フランチャイズ除外キーワード ────────────────────────────────
# 個人・中小企業を狙うため、大手チェーンはスキップ
_CHAIN_KEYWORDS = [
    # 小売・薬局チェーン
    "イオン", "アピタ", "ピアゴ", "ツルハ", "マツキヨ", "マツモトキヨシ",
    "サンドラッグ", "ウエルシア", "カワチ", "スギ薬局", "コスモス薬品",
    # 大手歯科チェーン
    "デンタルクリニック東京", "医療法人社団", "医療法人財団",
    # 大手美容チェーン
    "ホットペッパービューティー", "アース", "アクシス", "アルテ",
    # 大手建設
    "大和ハウス", "積水ハウス", "ダイワハウス", "ミサワホーム",
    "パナホーム", "へーベルハウス",
    # フランチャイズ店（店舗数が多いため個別営業効果低）
    "接骨院ひだまり", "ほねごり",
]


def _is_chain_store(name: str) -> bool:
    """
    大手チェーン・フランチャイズかどうかを名前で判定する。

    Args:
        name: 店舗・会社名

    Returns:
        True: 除外すべきチェーン店 / False: 対象として収集する
    """
    return any(kw in name for kw in _CHAIN_KEYWORDS)


def _refine_industry(original: str, types: list[str]) -> str:
    """
    Google Places の types フィールドをもとに業種名を補正する。
    元の業種がある程度正確な場合はそのまま返す。

    Args:
        original: 収集時に指定した業種名
        types:    Google Places Details API の types フィールド

    Returns:
        補正後の業種名
    """
    for place_type in types:
        if place_type in _TYPES_TO_INDUSTRY:
            return _TYPES_TO_INDUSTRY[place_type]
    return original


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
    Places Details APIで電話番号・URL・typesを取得する。

    Args:
        place_id: Google Place ID

    Returns:
        detailsのdict（なければ空dict）
    """
    params = {
        "place_id": place_id,
        "fields":   "name,formatted_phone_number,website,types",
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
    queries     = get_search_queries(industry, area)
    saved       = 0
    skipped     = 0   # 大手チェーン除外
    dup_skipped = 0   # 既存place_id（Details課金を節約）

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

                # 大手チェーン除外
                if _is_chain_store(name):
                    skipped += 1
                    write_log("INFO", "collect", f"チェーン店除外: {name}")
                    continue

                # 既存place_idはDetailsを叩く前にスキップ（API課金の無駄打ち防止）
                if target_exists(place_id):
                    dup_skipped += 1
                    write_log("INFO", "collect", f"既存スキップ（Details節約）: {name}")
                    continue

                # Details APIで電話・URL・typesを取得
                time.sleep(COLLECT_INTERVAL_SEC)
                details  = _fetch_details(place_id)
                phone    = details.get("formatted_phone_number", "")
                website  = details.get("website", "")
                types    = details.get("types", [])

                # typesをもとに業種名を補正
                refined_industry = _refine_industry(industry, types)

                target = {
                    "place_id": place_id,
                    "name":     name,
                    "address":  address,
                    "phone":    phone,
                    "website":  website,
                    "industry": refined_industry,
                    "area":     area,
                }

                is_new = upsert_target(target)
                if is_new:
                    saved += 1
                    industry_note = f" [{refined_industry}]" if refined_industry != industry else ""
                    write_log("INFO", "collect", f"保存: {name} ({address}){industry_note}")
                else:
                    write_log("INFO", "collect", f"重複スキップ: {name}")

            # 次ページ
            page_token = data.get("next_page_token")
            if not page_token:
                break

            # next_page_token は2秒待たないと有効にならない
            time.sleep(2)

    write_log(
        "INFO", "collect",
        f"収集完了: {saved}件保存 / {skipped}件チェーン除外 / "
        f"{dup_skipped}件既存スキップ（Details節約）({industry} / {area})"
    )
    return saved
