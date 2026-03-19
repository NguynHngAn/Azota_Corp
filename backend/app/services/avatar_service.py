from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile, HTTPException, status


ALLOWED_CONTENT_TYPES = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp"}
MAX_AVATAR_BYTES = 2 * 1024 * 1024  # 2MB


def save_avatar_file(static_dir: Path, file: UploadFile, user_id: int) -> str:
    """
    Save avatar under app/static/avatars and return public URL path.
    """
    if not file.content_type or file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed: png, jpg, webp",
        )

    data = file.file.read(MAX_AVATAR_BYTES + 1)
    if len(data) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")
    if len(data) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large (max 2MB)")

    ext = ALLOWED_CONTENT_TYPES[file.content_type]
    avatars_dir = static_dir / "avatars"
    avatars_dir.mkdir(parents=True, exist_ok=True)

    name = f"user_{user_id}_{uuid4().hex}{ext}"
    out_path = avatars_dir / name
    out_path.write_bytes(data)
    return f"/static/avatars/{name}"

