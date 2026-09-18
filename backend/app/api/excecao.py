from typing import Annotated
from fastapi import APIRouter, Depends, status

from app.core.security import obter_admin_atual
from app.models.excecao import Excecao, ExcecaoAtualizar, ExcecaoCriar
from app.services import excecao_service

router = APIRouter(prefix="/excecoes", tags=["Exceções de Coleta"])


@router.get(
    "/",
    response_model=list[Excecao],
    summary="Listar todas as exceções de coleta",
)
def listar_excecoes() -> list[Excecao]:
    return excecao_service.listar_excecoes()


@router.get(
    "/{id_excecao}",
    response_model=Excecao,
    summary="Buscar exceção por ID",
)
def buscar_excecao(id_excecao: int) -> Excecao:
    return excecao_service.buscar_excecao(id_excecao)


@router.post(
    "/",
    response_model=Excecao,
    status_code=status.HTTP_201_CREATED,
    summary="Criar exceção de coleta (admin)",
)
def criar_excecao(
    dados: ExcecaoCriar,
    _admin: Annotated[str, Depends(obter_admin_atual)],
) -> Excecao:
    return excecao_service.criar_excecao(dados)


@router.put(
    "/{id_excecao}",
    response_model=Excecao,
    summary="Atualizar exceção de coleta (admin)",
)
def atualizar_excecao(
    id_excecao: int,
    dados: ExcecaoAtualizar,
    _admin: Annotated[str, Depends(obter_admin_atual)],
) -> Excecao:
    return excecao_service.atualizar_excecao(id_excecao, dados)


@router.delete(
    "/{id_excecao}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remover exceção de coleta (admin)",
)
def remover_excecao(
    id_excecao: int,
    _admin: Annotated[str, Depends(obter_admin_atual)],
) -> None:
    return excecao_service.remover_excecao(id_excecao)
