"""
Run from backend folder:  python check_db.py
Shows if .env is loaded and DB connects. Use same when debugging uvicorn.
"""
import os
print("Current directory:", os.getcwd())
print("DATABASE_URL in os.environ:", "Yes" if os.environ.get("DATABASE_URL") else "No")
if os.environ.get("DATABASE_URL"):
    u = os.environ["DATABASE_URL"]
    print("  value (masked):", u.split("@")[0].rsplit(":", 1)[0] + ":****@" + u.split("@", 1)[1] if "@" in u else u)

from app.config import settings
url = settings.get_database_url()
print("settings.get_database_url() (masked):", url.split("@")[0].rsplit(":", 1)[0] + ":****@" + url.split("@", 1)[1] if "@" in url else url)

try:
    from app.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("DB connection: OK")
except Exception as e:
    print("DB connection error:", e)
