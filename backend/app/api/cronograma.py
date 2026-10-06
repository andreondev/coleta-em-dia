from typing import Annotated
from fastapi import APIRouter, Depends, status

from app.core.security import obter_admin_atual
from app.models.cronograma import Cronograma, CronogramaAtualizar, CronogramaCriar
from app.services import cronograma_service

router = APIRouter(prefix="/cronogramas", tags=["Cronograma"])


@router.get(
    "/",
    response_model=list[Cronograma],
    summary="Listar todos os cronogramas",
)
def listar_cronogramas() -> list[Cronograma]:
    return cronograma_service.listar_cronogramas()


@router.get(
    "/bairro/{id_bairro}",
    response_model=list[Cronograma],
    summary="Listar cronogramas de um bairro específico",
)
def listar_cronogramas_por_bairro(id_bairro: int) -> list[Cronograma]:
    return cronograma_service.listar_cronogramas_por_bairro(id_bairro)


@router.get(
    "/{id_cronograma}",
    response_model=Cronograma,
    summary="Buscar cronograma por ID",
)
def buscar_cronograma(id_cronograma: int) -> Cronograma:
    return cronograma_service.buscar_cronograma(id_cronograma)


@router.post(
    "/",
    response_model=Cronograma,
    status_code=status.HTTP_201_CREATED,
    summary="Criar cronograma (admin)",
)
def criar_cronograma(
    dados: CronogramaCriar,
    _admin: Annotated[str, Depends(obter_admin_atual)],
) -> Cronograma:
    return cronograma_service.criar_cronograma(dados)


@router.put(
    "/{id_cronograma}",
    response_model=Cronograma,
    summary="Atualizar cronograma (admin)",
)
def atualizar_cronograma(
    id_cronograma: int,
    dados: CronogramaAtualizar,
    _admin: Annotated[str, Depends(obter_admin_atual)],
) -> Cronograma:
    return cronograma_service.atualizar_cronograma(id_cronograma, dados)


@router.delete(
    "/{id_cronograma}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remover cronograma (admin)",
)
def remover_cronograma(
    id_cronograma: int,
    _admin: Annotated[str, Depends(obter_admin_atual)],
) -> None:
    return cronograma_service.remover_cronograma(id_cronograma)
