from pathlib import Path
from typing import Literal
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
    env: Literal["development", "production", "staging"] = "development"
    
    @property
    def debug(self) -> bool:
        return self.env == "development"

    # Database - use DATABASE_URL or individual vars
    database_url: str | None = None
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "postgres"
    postgres_password: str = ""
    postgres_db: str = "azota_eexam"

    # JWT
    secret_key: str = "dev-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # AI explanations
    ai_explanation_enabled: bool = False

    def get_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


settings = Settings()
