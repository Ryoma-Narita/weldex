"""
outreach/get_gmail_token.py
Gmail API の refresh_token を取得するスクリプト

使い方:
  1. .envに GMAIL_CLIENT_ID と GMAIL_CLIENT_SECRET を設定する
  2. python get_gmail_token.py を実行
  3. 表示されたURLをブラウザで開き、Googleアカウントで認証する
  4. リダイレクト後のURLから code= 以降をコピーして貼り付ける
  5. 表示された refresh_token を .env の GMAIL_REFRESH_TOKEN に設定する

注意：
  - refresh_tokenをAIチャットに絶対に貼らないこと
  - .envはGitignoreに含まれていることを確認してから実行する
"""
import os
import sys
import urllib.parse
import urllib.request
import json
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID     = os.environ.get("GMAIL_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("GMAIL_CLIENT_SECRET", "")
REDIRECT_URI  = "urn:ietf:wg:oauth:2.0:oob"
SCOPE         = "https://www.googleapis.com/auth/gmail.readonly"
AUTH_URL      = "https://accounts.google.com/o/oauth2/auth"
TOKEN_URL     = "https://oauth2.googleapis.com/token"


def main() -> None:
    """OAuth認証フローを実行してrefresh_tokenを取得する。"""
    if not CLIENT_ID or not CLIENT_SECRET:
        print("[ERROR] .envに GMAIL_CLIENT_ID と GMAIL_CLIENT_SECRET を設定してください")
        sys.exit(1)

    # 認証URLを生成
    params = {
        "client_id":     CLIENT_ID,
        "redirect_uri":  REDIRECT_URI,
        "response_type": "code",
        "scope":         SCOPE,
        "access_type":   "offline",
        "prompt":        "consent",
    }
    auth_url = f"{AUTH_URL}?{urllib.parse.urlencode(params)}"

    print("\n─────────────────────────────────────────")
    print("【STEP1】以下のURLをブラウザで開いてください")
    print("─────────────────────────────────────────")
    print(auth_url)
    print()

    auth_code = input("【STEP2】認証後に表示されたコードを貼り付けてください: ").strip()
    if not auth_code:
        print("[ERROR] コードが入力されませんでした")
        sys.exit(1)

    # トークンを取得
    data = urllib.parse.urlencode({
        "code":          auth_code,
        "client_id":     CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri":  REDIRECT_URI,
        "grant_type":    "authorization_code",
    }).encode()

    req = urllib.request.Request(TOKEN_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(req) as resp:
            token_data = json.loads(resp.read())
    except Exception as e:
        print(f"[ERROR] トークン取得に失敗: {e}")
        sys.exit(1)

    refresh_token = token_data.get("refresh_token", "")
    if not refresh_token:
        print("[ERROR] refresh_tokenが取得できませんでした（再認証が必要な場合があります）")
        sys.exit(1)

    print("\n─────────────────────────────────────────")
    print("【STEP3】以下の値を .env の GMAIL_REFRESH_TOKEN に設定してください")
    print("─────────────────────────────────────────")
    print(f"GMAIL_REFRESH_TOKEN={refresh_token}")
    print()
    print("⚠️  この値をAIチャットに貼らないでください")
    print("─────────────────────────────────────────")


if __name__ == "__main__":
    main()
