"""
reservation/routers/admin.py
管理者向けAPI（セッション認証必須）
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Cookie, Response, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# ログイン試行制限
LOGIN_MAX_ATTEMPTS = 5
LOGIN_LOCK_MINUTES = 10
from models.schemas import AdminLogin, ManualReservation, StatusUpdate, ClosedDateCreate
from db.database import (
    validate_session, create_session, delete_session,
    get_reservations_by_date, create_reservation,
    update_reservation_status, get_reservation_by_id,
    get_closed_dates, add_closed_date, remove_closed_date,
    get_dashboard_stats, get_menus, get_all_menus,
    create_menu, update_menu, toggle_menu_active,
    find_or_create_customer,
    get_setting, set_setting,
    get_conn,
)
from config import SESSION_EXPIRE_HOURS, SHOW_MENU_PRICE

router = APIRouter(prefix="/admin", tags=["admin"])

SESSION_COOKIE = "admin_session"


def _require_auth(session_token: str | None) -> None:
    """
    セッショントークンを検証する。無効な場合は 401 を返す。

    Args:
        session_token: クッキーのセッショントークン
    """
    if not session_token or not validate_session(session_token):
        raise HTTPException(status_code=401, detail="認証が必要です")


# ─── 認証 ───────────────────────────────────────

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, body: AdminLogin, response: Response):
    """
    管理者ログイン。セッションクッキーを発行する。
    5回失敗で10分間ソフトロック。

    Args:
        body: パスワード
    """
    # ロック確認
    locked_until = get_setting("login_locked_until")
    if locked_until:
        lock_dt = datetime.fromisoformat(locked_until)
        if datetime.now() < lock_dt:
            remaining = int((lock_dt - datetime.now()).total_seconds() / 60) + 1
            raise HTTPException(status_code=429, detail=f"ログインがロックされています。{remaining}分後に再試行してください")
        else:
            set_setting("login_locked_until", "")
            set_setting("login_failed_count", "0")

    # パスワードはsettingsテーブルから取得（.envは初期値のみ・管理画面で変更可能）
    if body.password != get_setting("admin_password"):
        # 失敗カウント更新
        failed = int(get_setting("login_failed_count") or "0") + 1
        set_setting("login_failed_count", str(failed))
        if failed >= LOGIN_MAX_ATTEMPTS:
            lock_until = (datetime.now() + timedelta(minutes=LOGIN_LOCK_MINUTES)).isoformat()
            set_setting("login_locked_until", lock_until)
            set_setting("login_failed_count", "0")
            raise HTTPException(status_code=429, detail=f"ログイン試行が{LOGIN_MAX_ATTEMPTS}回失敗しました。{LOGIN_LOCK_MINUTES}分間ロックします")
        raise HTTPException(status_code=401, detail=f"パスワードが違います（残り{LOGIN_MAX_ATTEMPTS - failed}回）")

    # ログイン成功：失敗カウントリセット
    set_setting("login_failed_count", "0")
    set_setting("login_locked_until", "")

    token      = secrets.token_hex(32)
    expires_at = (datetime.now() + timedelta(hours=SESSION_EXPIRE_HOURS)).strftime("%Y-%m-%d %H:%M:%S")
    create_session(token, expires_at)

    response.set_cookie(
        key=SESSION_COOKIE, value=token,
        httponly=True, samesite="lax",
        max_age=SESSION_EXPIRE_HOURS * 3600,
    )
    return {"message": "ログインしました"}


@router.post("/logout")
def logout(response: Response, admin_session: str | None = Cookie(None)):
    """管理者ログアウト。セッションを削除する。"""
    if admin_session:
        delete_session(admin_session)
    response.delete_cookie(SESSION_COOKIE)
    return {"message": "ログアウトしました"}


@router.get("/me")
def me(admin_session: str | None = Cookie(None)):
    """セッション有効確認。"""
    _require_auth(admin_session)
    return {"authenticated": True}


# ─── ダッシュボード ───────────────────────────────

@router.get("/stats")
def stats(admin_session: str | None = Cookie(None)):
    """ダッシュボード統計情報を返す。"""
    _require_auth(admin_session)
    return get_dashboard_stats()


# ─── 予約管理 ──────────────────────────────────

@router.get("/reservations")
def list_reservations(
    date:      str | None = None,
    date_from: str | None = None,
    date_to:   str | None = None,
    status:    str | None = None,
    page:      int = 1,
    per_page:  int = 20,
    admin_session: str | None = Cookie(None),
):
    """
    予約一覧を返す（日付・ステータスでフィルター）。

    Args:
        date:      日付フィルター（YYYY-MM-DD・完全一致）
        date_from: 開始日フィルター（YYYY-MM-DD・以上）
        date_to:   終了日フィルター（YYYY-MM-DD・以下）
        status:    ステータスフィルター
        page:      ページ番号
        per_page:  1ページあたりの件数
    """
    _require_auth(admin_session)

    conditions: list[str] = []
    params: list = []

    if date:
        conditions.append("date = ?")
        params.append(date)
    elif date_from and date_to:
        conditions.append("date BETWEEN ? AND ?")
        params.extend([date_from, date_to])
    elif date_from:
        conditions.append("date >= ?")
        params.append(date_from)
    elif date_to:
        conditions.append("date <= ?")
        params.append(date_to)
    if status:
        conditions.append("status = ?")
        params.append(status)

    where  = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    offset = (page - 1) * per_page

    with get_conn() as conn:
        total = conn.execute(f"SELECT COUNT(*) FROM reservations {where}", params).fetchone()[0]
        rows  = conn.execute(
            f"SELECT * FROM reservations {where} ORDER BY date DESC, time DESC LIMIT ? OFFSET ?",
            params + [per_page, offset],
        ).fetchall()

    return {"total": total, "page": page, "items": [dict(r) for r in rows]}


@router.get("/reservations/{reservation_id}")
def get_reservation(reservation_id: int, admin_session: str | None = Cookie(None)):
    """予約を1件取得する。"""
    _require_auth(admin_session)
    res = get_reservation_by_id(reservation_id)
    if not res:
        raise HTTPException(status_code=404, detail="予約が見つかりません")
    return res


@router.post("/reservations")
def add_reservation(body: ManualReservation, admin_session: str | None = Cookie(None)):
    """
    管理者が手動で予約を追加する。

    Args:
        body: 予約情報
    """
    _require_auth(admin_session)

    # メニュー情報（menu_idがあればDBから取得、なければ空文字）
    menu_name    = ""
    duration_min = body.duration_min
    if body.menu_id:
        menus = {str(m["id"]): m for m in get_menus()}
        m = menus.get(str(body.menu_id))
        if m:
            menu_name    = m["name"]
            duration_min = m["duration_min"]

    customer_id = body.customer_id
    if not customer_id:
        customer_id = find_or_create_customer(body.name, body.phone, body.email, source="manual")

    data = {
        "customer_id":  customer_id,
        "name":         body.name,
        "phone":        body.phone,
        "email":        body.email,
        "date":         body.date,
        "time":         body.time,
        "menu_id":      body.menu_id,
        "menu_name":    menu_name,
        "duration_min": duration_min,
        "channel":      "manual",
        "notes":        body.notes,
    }
    reservation_id = create_reservation(data)
    return {"id": reservation_id, "message": "予約を追加しました"}


@router.post("/reservations/{reservation_id}/remind")
def send_remind(reservation_id: int, admin_session: str | None = Cookie(None)):
    """
    管理者が手動でリマインドメールを送信する。

    Args:
        reservation_id: 予約ID

    Returns:
        送信結果メッセージ
    """
    _require_auth(admin_session)
    res = get_reservation_by_id(reservation_id)
    if not res:
        raise HTTPException(status_code=404, detail="予約が見つかりません")
    if not res.get("email"):
        raise HTTPException(status_code=422, detail="メールアドレスが登録されていないため送信できません")

    from services.mail import send_reminder
    ok = send_reminder(res)
    if not ok:
        raise HTTPException(status_code=500, detail="メール送信に失敗しました（SendGrid設定を確認してください）")

    with get_conn() as conn:
        conn.execute("UPDATE reservations SET remind_sent=1 WHERE id=?", (reservation_id,))
    return {"message": "リマインドメールを送信しました"}


@router.patch("/reservations/{reservation_id}/status")
def change_status(
    reservation_id: int,
    body: StatusUpdate,
    admin_session: str | None = Cookie(None),
):
    """
    予約ステータスを更新する。

    Args:
        reservation_id: 予約ID
        body: 新しいステータス（confirmed/cancelled/done/no_show）
    """
    _require_auth(admin_session)
    valid_statuses = {"confirmed", "cancelled", "done", "no_show"}
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"ステータスは {valid_statuses} のいずれかで指定してください")
    if not get_reservation_by_id(reservation_id):
        raise HTTPException(status_code=404, detail="予約が見つかりません")
    update_reservation_status(reservation_id, body.status)
    return {"message": "ステータスを更新しました"}


# ─── 休業日 ──────────────────────────────────

@router.get("/closed-dates")
def list_closed_dates(admin_session: str | None = Cookie(None)):
    """休業日一覧を返す。"""
    _require_auth(admin_session)
    return {"dates": get_closed_dates()}


@router.post("/closed-dates")
def add_closed(body: ClosedDateCreate, admin_session: str | None = Cookie(None)):
    """休業日を登録する。"""
    _require_auth(admin_session)
    add_closed_date(body.date, body.reason)
    return {"message": "休業日を登録しました"}


@router.delete("/closed-dates/{target_date}")
def remove_closed(target_date: str, admin_session: str | None = Cookie(None)):
    """休業日を削除する。"""
    _require_auth(admin_session)
    remove_closed_date(target_date)
    return {"message": "休業日を削除しました"}


# ─── メニュー管理 ──────────────────────────────

@router.get("/menus")
def list_menus(admin_session: str | None = Cookie(None)):
    """
    メニュー一覧を返す（管理画面用・非表示含む）。
    show_price フラグも一緒に返す。
    """
    _require_auth(admin_session)
    return {"menus": get_all_menus(), "show_price": SHOW_MENU_PRICE}


@router.post("/menus")
def add_menu(body: dict, admin_session: str | None = Cookie(None)):
    """
    メニューを追加する。

    Args:
        body: {name, duration_min, price（省略可）, sort_order（省略可）}
    """
    _require_auth(admin_session)
    name         = (body.get("name") or "").strip()
    duration_min = int(body.get("duration_min") or 30)
    price        = body.get("price")  # None = 要相談
    if price is not None:
        price = int(price)
    sort_order = int(body.get("sort_order") or 0)

    if not name:
        raise HTTPException(status_code=422, detail="メニュー名を入力してください")
    if duration_min < 1:
        raise HTTPException(status_code=422, detail="所要時間は1分以上で入力してください")

    menu_id = create_menu(name, duration_min, price, sort_order)
    return {"id": menu_id, "message": "メニューを追加しました"}


@router.put("/menus/{menu_id}")
def edit_menu(menu_id: int, body: dict, admin_session: str | None = Cookie(None)):
    """
    メニューを更新する。

    Args:
        menu_id: メニューID
        body:    {name, duration_min, price, sort_order}
    """
    _require_auth(admin_session)
    name         = (body.get("name") or "").strip()
    duration_min = int(body.get("duration_min") or 30)
    price        = body.get("price")
    if price is not None:
        price = int(price)
    sort_order = int(body.get("sort_order") or 0)

    if not name:
        raise HTTPException(status_code=422, detail="メニュー名を入力してください")

    update_menu(menu_id, name, duration_min, price, sort_order)
    return {"message": "メニューを更新しました"}


@router.patch("/menus/{menu_id}/active")
def toggle_menu(menu_id: int, admin_session: str | None = Cookie(None)):
    """
    メニューの表示/非表示を切り替える（論理削除）。

    Returns:
        {"active": 0 or 1}
    """
    _require_auth(admin_session)
    new_active = toggle_menu_active(menu_id)
    label = "表示" if new_active else "非表示"
    return {"active": new_active, "message": f"メニューを{label}にしました"}


# ─── 設定 ──────────────────────────────────────

@router.get("/settings")
def get_settings(admin_session: str | None = Cookie(None)):
    """
    設定値を返す。パスワードは伏字にして返す。
    """
    _require_auth(admin_session)
    return {
        "admin_email":       get_setting("admin_email"),
        "admin_password":    "********",  # 画面には表示しない
        "notify_on_booking": get_setting("notify_on_booking", "1"),
        "notify_on_cancel":  get_setting("notify_on_cancel",  "1"),
    }


@router.put("/settings/notify")
def update_notify(body: dict, admin_session: str | None = Cookie(None)):
    """
    メール通知ON/OFFを更新する。

    Args:
        body: {"notify_on_booking": "1"/"0", "notify_on_cancel": "1"/"0"}
    """
    _require_auth(admin_session)
    set_setting("notify_on_booking", "1" if body.get("notify_on_booking") else "0")
    set_setting("notify_on_cancel",  "1" if body.get("notify_on_cancel")  else "0")
    return {"message": "通知設定を更新しました"}


@router.put("/settings/email")
def update_email(body: dict, admin_session: str | None = Cookie(None)):
    """
    管理者通知メールを変更する。

    Args:
        body: {"email": "new@example.com"}
    """
    _require_auth(admin_session)
    email = (body.get("email") or "").strip()
    if not email or "@" not in email:
        raise HTTPException(status_code=422, detail="有効なメールアドレスを入力してください")
    set_setting("admin_email", email)
    return {"message": "通知先メールを更新しました", "admin_email": email}


@router.put("/settings/password")
def update_password(body: dict, admin_session: str | None = Cookie(None)):
    """
    管理者パスワードを変更する。

    Args:
        body: {"password": "newpassword"}
    """
    _require_auth(admin_session)
    password = (body.get("password") or "").strip()
    if len(password) < 6:
        raise HTTPException(status_code=422, detail="パスワードは6文字以上で入力してください")
    set_setting("admin_password", password)
    return {"message": "パスワードを更新しました"}


@router.post("/settings/test-line")
def test_line_connection(admin_session: str | None = Cookie(None)):
    """
    Weldex運用LINEボットへの疎通テストメッセージを送信する。
    # TODO: 本番安定後に削除

    Returns:
        送信結果
    """
    _require_auth(admin_session)
    # Weldex運用ボットのトークンと送信先が設定されていない場合はスキップ
    import os
    token   = os.environ.get("WELDEX_LINE_CHANNEL_ACCESS_TOKEN", "")
    user_id = os.environ.get("ADMIN_LINE_USER_ID", "")
    if not token or not user_id:
        raise HTTPException(
            status_code=503,
            detail="WELDEX_LINE_CHANNEL_ACCESS_TOKEN または ADMIN_LINE_USER_ID が未設定です"
        )
    try:
        from linebot.v3.messaging import (
            Configuration, ApiClient, MessagingApi,
            PushMessageRequest, TextMessage,
        )
        config = Configuration(access_token=token)
        with ApiClient(config) as api_client:
            MessagingApi(api_client).push_message(
                PushMessageRequest(
                    to=user_id,
                    messages=[TextMessage(text="[Weldex] LINE疎通テスト送信です。正常に受信できています。")],
                )
            )
        return {"message": "テストメッセージを送信しました"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"送信失敗: {e}")
