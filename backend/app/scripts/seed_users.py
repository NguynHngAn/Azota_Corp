from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy.orm import Session


# Allow running as a script, e.g. `python backend/app/scripts/seed_users.py`
BACKEND_DIR = Path(__file__).resolve().parents[2]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.security import hash_password  # noqa: E402
from app.database import SessionLocal  # noqa: E402
from app.models.user import Role, User  # noqa: E402


@dataclass(frozen=True)
class SeedUser:
    email: str
    password: str
    full_name: str
    role: Role
    is_active: bool = True


SEED_USERS: list[SeedUser] = [
    SeedUser(email="admin1@test.com", password="admin123", full_name="Admin One", role=Role.admin),
    SeedUser(email="admin2@test.com", password="admin123", full_name="Admin Two", role=Role.admin),
    SeedUser(email="teacher1@test.com", password="teacher123", full_name="Teacher One", role=Role.teacher),
    SeedUser(email="teacher2@test.com", password="teacher123", full_name="Teacher Two", role=Role.teacher),
    SeedUser(email="student1@test.com", password="student123", full_name="Student One", role=Role.student),
    SeedUser(email="student2@test.com", password="student123", full_name="Student Two", role=Role.student),
]


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def create_user_if_missing(db: Session, seed: SeedUser) -> tuple[User, bool]:
    existing = get_user_by_email(db, seed.email)
    if existing:
        return existing, False

    user = User(
        email=seed.email,
        password_hash=hash_password(seed.password),
        full_name=seed.full_name,
        role=seed.role,
        is_active=seed.is_active,
    )
    db.add(user)
    return user, True


def seed_users() -> dict[str, list[str]]:
    created: list[str] = []
    skipped: list[str] = []

    db = SessionLocal()
    try:
        for seed in SEED_USERS:
            user, was_created = create_user_if_missing(db, seed)
            if was_created:
                created.append(f"{user.email} ({user.role.value})")
            else:
                skipped.append(f"{user.email} ({user.role.value})")

        db.commit()
        return {"created": created, "skipped": skipped}
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main() -> None:
    result = seed_users()

    if result["created"]:
        print("Created users:")
        for item in result["created"]:
            print(f"- {item}")
    else:
        print("Created users: (none)")

    if result["skipped"]:
        print("\nSkipped existing users:")
        for item in result["skipped"]:
            print(f"- {item}")


if __name__ == "__main__":
    main()

