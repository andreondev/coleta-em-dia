from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    DS_LOGIN: str = Field(..., description="Login do administrador")
    DS_SENHA: str = Field(..., description="Senha do administrador")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
