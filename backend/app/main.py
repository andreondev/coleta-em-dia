"""
main.py — Ponto de entrada da aplicação FastAPI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import auth, bairro, cronograma, excecao

app = FastAPI(
    title="API — Sistema de Coleta de Lixo",
    description="Backend do sistema de coleta de lixo.",
    version="1.0.0",
)

cors_origins: list[str] = [
    origin.strip()
    for origin in settings.cors_origins.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(bairro.router)
app.include_router(cronograma.router)
app.include_router(excecao.router)

@app.get("/", tags=["Healthcheck"], summary="Status da API")
def root() -> dict[str, str]:
    return {"status": "online"}
