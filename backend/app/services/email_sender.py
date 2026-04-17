import logging

from app.config import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(email: str, reset_link: str) -> None:
    """
    Deliver password-reset instructions. Replace the body with SMTP/SendGrid/etc. in production.
    For local development, we log the link (do not enable verbose logging in production with real users).
    """
    if settings.email_smtp_host:
        # Placeholder for future SMTP integration
        logger.info(
            "password_reset_email (smtp not implemented) to=%s link=%s",
            email,
            reset_link,
        )
        return
    logger.info("password_reset_email to=%s link=%s", email, reset_link)
