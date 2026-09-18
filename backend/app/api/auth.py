from fastapi import APIRouter
from app.models.auth import LoginRequest, TokenResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login do administrador",
    description="Autentica o admin e retorna um token JWT válido por 8 horas.",
)
def login(dados: LoginRequest) -> TokenResponse:
    return auth_service.login(dados)
