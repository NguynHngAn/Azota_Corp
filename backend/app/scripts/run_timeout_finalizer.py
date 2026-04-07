# backend/app/scripts/run_timeout_finalizer.py
from app.database import SessionLocal
from app.services.assignment_timeout_worker import finalize_expired_submissions

def main() -> None:
    db = SessionLocal()
    try:
        count = finalize_expired_submissions(db, batch_size=500)
        print(f"finalized={count}")
    finally:
        db.close()

if __name__ == "__main__":
    main()