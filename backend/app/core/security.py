"""
security.py — Utilitários de segurança e autenticação do painel admin.
"""

from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

ALGORITHM: str = "HS256"
TOKEN_EXPIRE_HOURS: int = 8

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()

# ─── Hash de senha ────────────────────────────────────────────────────────────


def hash_senha(senha: str) -> str:
    """Retorna o hash bcrypt da senha fornecida."""
    return pwd_context.hash(senha)


def verificar_senha(senha_plain: str, senha_hash: str) -> bool:
    """Verifica se a senha em texto puro confere com o hash armazenado."""
    return pwd_context.verify(senha_plain, senha_hash)


# ─── JWT ──────────────────────────────────────────────────────────────────────


def criar_access_token(login: str) -> str:
    """
    Cria um JWT contendo o login do admin como `sub`.
    O token expira em TOKEN_EXPIRE_HOURS horas.
    """
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {"sub": login, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=ALGORITHM)


def _decodificar_token(token: str) -> str:
    """
    Decodifica e valida o JWT.
    Retorna o login (sub) se válido, levanta HTTPException 401 caso contrário.
    """
    credenciais_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
        login: str | None = payload.get("sub")
        if login is None:
            raise credenciais_exception
        return login
    except JWTError:
        raise credenciais_exception


# ─── Dependency FastAPI ───────────────────────────────────────────────────────


def obter_admin_atual(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
) -> str:
    """
    Dependency injetada nas rotas protegidas.
    Valida o token Bearer e retorna o login do admin autenticado.
    """
    return _decodificar_token(credentials.credentials)
