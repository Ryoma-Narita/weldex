"""
reservation/config.py
予約システムの設定・環境変数管理
"""
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# アプリ設定
APP_NAME     = os.environ.get("APP_NAME", "クリニック予約")
APP_URL      = os.environ.get("APP_URL", "http://localhost:8001")
ADMIN_EMAIL  = os.environ.get("ADMIN_EMAIL", "")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin1234")
SECRET_KEY   = os.environ.get("SECRET_KEY", "changeme-secret-key-32chars-long!!")

# SendGrid
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
FROM_EMAIL       = os.environ.get("FROM_EMAIL", "info@weldex.jp")
FROM_NAME        = os.environ.get("FROM_NAME", APP_NAME)

# DB (PostgreSQL)
DATABASE_URL = os.environ.get("DATABASE_URL", "")

# LINE
LINE_CHANNEL_SECRET       = os.environ.get("LINE_CHANNEL_SECRET", "")
LINE_CHANNEL_ACCESS_TOKEN = os.environ.get("LINE_CHANNEL_ACCESS_TOKEN", "")

# 予約設定
SLOT_INTERVAL_MIN = 30          # 予約スロット間隔（分）
SLOT_START        = "09:00"     # 受付開始時間
SLOT_END          = "18:00"     # 受付終了時間
ADVANCE_DAYS      = 365         # 何日先まで予約可能か
REMIND_HOUR       = 18          # リマインド送信時刻（前日）

# セッション有効期限（時間）
SESSION_EXPIRE_HOURS = 8
