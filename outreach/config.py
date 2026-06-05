"""
outreach/config.py
営業自動化システムの設定・環境変数管理
"""
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Google Places API
GOOGLE_PLACES_API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "")

# SendGrid
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
FROM_EMAIL       = os.environ.get("FROM_EMAIL", "info@weldex.jp")
FROM_NAME        = os.environ.get("FROM_NAME", "Weldex")

# Gmail API
GMAIL_CLIENT_ID      = os.environ.get("GMAIL_CLIENT_ID", "")
GMAIL_CLIENT_SECRET  = os.environ.get("GMAIL_CLIENT_SECRET", "")
GMAIL_REFRESH_TOKEN  = os.environ.get("GMAIL_REFRESH_TOKEN", "")

# 収集設定
DEFAULT_LIMIT        = 100     # 1回の収集件数上限
COLLECT_INTERVAL_SEC = 1.5     # API呼び出し間隔（秒）
REQUEST_TIMEOUT_SEC  = 8       # サイト診断タイムアウト（秒）

# メール送信設定
# ウォームアップ推奨：1〜2週目=10件 → 3〜4週目=20件 → 1ヶ月後=30〜50件
# SendGridレピュテーション安定後に引き上げること
DAILY_SEND_LIMIT     = 20      # 初期ウォームアップ値（法的上限は50件）

# DB（Railway volumeは DB_PATH=/data/outreach.db を環境変数でセット）
DB_PATH = os.environ.get(
    "DB_PATH",
    os.path.join(os.path.dirname(__file__), 'data', 'outreach.db')
)

# ダッシュボード認証（外部公開時は必ずセットすること）
DASHBOARD_PASSWORD = os.environ.get("DASHBOARD_PASSWORD", "")

# Anthropic API（Claude AIによる営業メール自動生成）
# Railway > weldex > Variables に ANTHROPIC_API_KEY を設定すること
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
