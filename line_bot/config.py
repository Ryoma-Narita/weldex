"""
line_bot/config.py
LINE botの設定・環境変数
reservation/config.py のスロット設定を共有する
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# macOS Python.org版のSSL証明書問題を解決（certifiを強制使用）
try:
    import certifi
    os.environ.setdefault("SSL_CERT_FILE",      certifi.where())
    os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())
except ImportError:
    pass

# LINE Messaging API
LINE_CHANNEL_SECRET       = os.environ.get("LINE_CHANNEL_SECRET", "")
LINE_CHANNEL_ACCESS_TOKEN = os.environ.get("LINE_CHANNEL_ACCESS_TOKEN", "")

# クライアント名・URL（ウェルカムメッセージ・管理者通知メールに使用）
APP_NAME = os.environ.get("APP_NAME", "クリニック")
APP_URL  = os.environ.get("APP_URL",  "")

# 共有DBパス（reservation/と同一ファイル）
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'reservation', 'data', 'reservation.db')

# スロット設定は reservation/config.py から共有（importlib で絶対パス読み込み）
import importlib.util as _ilu
_res_config_path = os.path.join(os.path.dirname(__file__), '..', 'reservation', 'config.py')
_spec = _ilu.spec_from_file_location("reservation_config", _res_config_path)
_res_cfg = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(_res_cfg)

SLOT_START        = _res_cfg.SLOT_START
SLOT_END          = _res_cfg.SLOT_END
SLOT_INTERVAL_MIN = _res_cfg.SLOT_INTERVAL_MIN
ADVANCE_DAYS      = _res_cfg.ADVANCE_DAYS
REMIND_HOUR       = _res_cfg.REMIND_HOUR
