from pydantic import BaseModel, Field, field_validator


class LoginRequest(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=1)
    remember_me: bool = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1)


class RequestPasswordResetRequest(BaseModel):
    email: str = Field(..., max_length=255)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=8, max_length=256)
    new_password: str = Field(..., min_length=6, max_length=128)


class PasswordResetRequestedResponse(BaseModel):
    message: str = Field(
        default="If this email is registered, a password reset link has been sent.",
    )


class PasswordResetCompletedResponse(BaseModel):
    ok: bool = True
