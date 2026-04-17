from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# .env next to backend folder (parent of app/)
_env_path = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_env_path),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    app_name: str = "Azota-like Exam API"
    env: str = "development"
    debug: bool = False

    # Database - use DATABASE_URL or individual vars
    database_url: str | None = None
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "postgres"
    postgres_password: str = ""
    postgres_db: str = "azota_exam"

    # JWT
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    # Refresh JWT lifetime when “remember this device” is on vs off (SPA stores refresh beside access).
    refresh_token_expire_days_remember: int = 30
    refresh_token_expire_days_session: int = 1

    # Password reset (public links point to SPA)
    frontend_base_url: str = "http://localhost:5173"
    password_reset_token_ttl_minutes: int = 30
    email_smtp_host: str | None = None

    # AI explanations / Teacher AI (Gemini)
    ai_explanation_enabled: bool = False
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"

    # Anti-cheat: server-side enforcement (auto-submit when weighted score exceeds threshold)
    anti_cheat_max_violations: float = 10.0
    anti_cheat_enforce: bool = False
    anti_cheat_event_rate_window_seconds: int = 60
    anti_cheat_event_rate_max: int = 120

    def get_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


settings = Settings()
