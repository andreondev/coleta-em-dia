from typing import Annotated
from fastapi import APIRouter, Depends, status

from app.core.security import obter_admin_atual
from app.models.bairro import Bairro, BairroAtualizar, BairroCriar
from app.services import bairro_service

router = APIRouter(prefix="/bairros", tags=["Bairros"])


@router.get(
    "/",
    response_model=list[Bairro],
    summary="Listar todos os bairros",
)
def listar_bairros() -> list[Bairro]:
    return bairro_service.listar_bairros()


@router.get(
    "/{id_bairro}",
    response_model=Bairro,
    summary="Buscar bairro por ID",
)
def buscar_bairro(id_bairro: int) -> Bairro:
    return bairro_service.buscar_bairro(id_bairro)


@router.post(
    "/",
    response_model=Bairro,
    status_code=status.HTTP_201_CREATED,
    summary="Criar bairro (admin)",
)
def criar_bairro(
    dados: BairroCriar,
    _admin: Annotated[str, Depends(obter_admin_atual)],
) -> Bairro:
    return bairro_service.criar_bairro(dados)


@router.put(
    "/{id_bairro}",
    response_model=Bairro,
    summary="Atualizar bairro (admin)",
)
def atualizar_bairro(
    id_bairro: int,
    dados: BairroAtualizar,
    _admin: Annotated[str, Depends(obter_admin_atual)],
) -> Bairro:
    return bairro_service.atualizar_bairro(id_bairro, dados)


@router.delete(
    "/{id_bairro}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remover bairro (admin)",
)
def remover_bairro(
    id_bairro: int,
    _admin: Annotated[str, Depends(obter_admin_atual)],
) -> None:
    return bairro_service.remover_bairro(id_bairro)
