import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.config import settings
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.services.email_sender import send_password_reset_email


def issue_password_reset_for_user(db: Session, user: User) -> None:
    """Create a single-use reset token and send email. Caller must commit. Does not commit."""
    db.execute(
        delete(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used.is_(False),
        )
    )
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.password_reset_token_ttl_minutes)
    row = PasswordResetToken(user_id=user.id, token=token, expires_at=expires, used=False)
    db.add(row)
    db.flush()
    base = settings.frontend_base_url.rstrip("/")
    link = f"{base}/reset-password?token={token}"
    send_password_reset_email(user.email, link)
