"""
Seed 1 admin, 1 teacher, 1 student. Run from backend: python seed_users.py
"""
import sys
sys.path.insert(0, ".")

from app.database import SessionLocal
from app.models.user import Role, User
from app.core.security import hash_password

SEED = [
    {"email": "admin@azota.local", "password": "admin123", "full_name": "Admin", "role": Role.admin},
    {"email": "teacher@azota.local", "password": "teacher123", "full_name": "Teacher One", "role": Role.teacher},
    {"email": "student@azota.local", "password": "student123", "full_name": "Student One", "role": Role.student},
]

def main():
    db = SessionLocal()
    try:
        for row in SEED:
            if db.query(User).filter(User.email == row["email"]).first():
                print(f"Skip (exists): {row['email']}")
                continue
            user = User(
                email=row["email"],
                password_hash=hash_password(row["password"]),
                full_name=row["full_name"],
                role=row["role"],
                is_active=True,
            )
            db.add(user)
            print(f"Created: {row['email']} ({row['role'].value})")
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    main()
