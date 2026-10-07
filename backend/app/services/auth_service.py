from fastapi import HTTPException, status
from app.core.security import criar_access_token, verificar_senha
from app.db.session import supabase
from app.models.auth import LoginRequest, TokenResponse

def login(dados: LoginRequest) -> TokenResponse:
    resultado = (
        supabase.table("tb_admin")
        .select("ds_login, ds_senha")
        .eq("ds_login", dados.DS_LOGIN)
        .maybe_single()
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

    if not verificar_senha(dados.DS_SENHA, admin["ds_senha"]):
        raise erro_credenciais

    token = criar_access_token(login=admin["ds_login"])
    return TokenResponse(access_token=token)
