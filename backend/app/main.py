from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import logging
import threading
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import get_db, SessionLocal
from app.api.v1 import (
    auth,
    users,
    classes,
    exams,
    assignments,
    anti_cheat,
    anti_cheat_analytics,
    question_bank,
    teacher_ai,
    account_requests,
    admin_account_requests,
)
from app.services.assignment_timeout_worker import finalize_expired_submissions

logger = logging.getLogger(__name__)
_timeout_worker_stop = threading.Event()
_timeout_worker_thread: threading.Thread | None = None

app = FastAPI(title=settings.app_name)
app.include_router(account_requests.router, prefix="/api/v1")
app.include_router(admin_account_requests.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(classes.router, prefix="/api/v1")
app.include_router(exams.router, prefix="/api/v1")
app.include_router(assignments.router, prefix="/api/v1")
app.include_router(anti_cheat.router, prefix="/api/v1")
app.include_router(anti_cheat_analytics.router, prefix="/api/v1")
app.include_router(question_bank.router, prefix="/api/v1")
app.include_router(teacher_ai.router, prefix="/api/v1")

# Static files (avatars uploads)
_static_dir = Path(__file__).resolve().parent / "static"
_static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(_static_dir)), name="static")


def _run_timeout_finalizer_loop() -> None:
    interval = max(5, int(settings.exam_timeout_finalizer_interval_seconds))
    while not _timeout_worker_stop.is_set():
        db = SessionLocal()
        try:
            finalize_expired_submissions(db)
        except Exception:
            db.rollback()
            logger.exception("Built-in timeout finalizer loop failed")
        finally:
            db.close()
        _timeout_worker_stop.wait(interval)


@app.on_event("startup")
def _start_timeout_finalizer_loop() -> None:
    global _timeout_worker_thread
    if not settings.exam_timeout_finalizer_enabled:
        return
    if _timeout_worker_thread and _timeout_worker_thread.is_alive():
        return
    _timeout_worker_stop.clear()
    _timeout_worker_thread = threading.Thread(
        target=_run_timeout_finalizer_loop,
        name="timeout-finalizer-loop",
        daemon=True,
    )
    _timeout_worker_thread.start()


@app.on_event("shutdown")
def _stop_timeout_finalizer_loop() -> None:
    _timeout_worker_stop.set()
    if _timeout_worker_thread and _timeout_worker_thread.is_alive():
        _timeout_worker_thread.join(timeout=2)


@app.get("/routes")
def list_routes():
    out = []
    for r in app.routes:
        if hasattr(r, "path") and hasattr(r, "methods"):
            out.append({"path": r.path, "methods": list(r.methods)})
    return {"routes": out}


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "disconnected"
    db_error: str | None = None
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_error = str(e)
    return {
        "status": "ok",
        "env": settings.env,
        "database": db_status,
        "classes_loaded": True,
        **({"database_error": db_error} if db_error else {}),
    }


@app.get("/health/debug")
def health_debug():
    from pathlib import Path

    url = settings.get_database_url()
    if ":" in url.split("//")[-1]:
        parts = url.split("@", 1)
        if len(parts) == 2:
            url_masked = parts[0].rsplit(":", 1)[0] + ":****@" + parts[1]
        else:
            url_masked = url
    else:
        url_masked = url
    _env_path = Path(__file__).resolve().parent.parent / ".env"
    db_error = None
    try:
        from app.database import engine

        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_error = str(e)
    return {
        "env_file": str(_env_path),
        "env_file_exists": _env_path.exists(),
        "database_url_masked": url_masked,
        "database": "connected" if db_error is None else "disconnected",
        "database_error": db_error,
    }
