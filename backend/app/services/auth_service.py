from fastapi import HTTPException, status
from app.core.security import criar_access_token, verificar_senha
from app.db.session import supabase
from app.models.auth import LoginRequest, TokenResponse

def login(dados: LoginRequest) -> TokenResponse:
    resultado = (
        supabase.table("TB_ADMIN")
        .select("DS_LOGIN, DS_SENHA")
        .eq("DS_LOGIN", dados.DS_LOGIN)
        .single()
        .execute()
    )

    admin = resultado.data if resultado else None

    erro_credenciais = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not admin:
        raise erro_credenciais

    if not verificar_senha(dados.DS_SENHA, admin["DS_SENHA"]):
        raise erro_credenciais

    token = criar_access_token(login=admin["DS_LOGIN"])
    return TokenResponse(access_token=token)
