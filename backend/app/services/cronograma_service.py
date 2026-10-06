from fastapi import HTTPException, status
from app.db.session import supabase
from app.models.cronograma import Cronograma, CronogramaAtualizar, CronogramaCriar


def _lower_keys(d: dict) -> dict:
    """Converte todas as chaves do dict para lowercase (padrão do Postgres)."""
    return {k.lower(): v for k, v in d.items()}


def listar_cronogramas() -> list[Cronograma]:
    resultado = (
        supabase.table("tb_cronograma")
        .select("*")
        .order("id_bairro")
        .order("ds_dia_semana")
        .execute()
    )
    return resultado.data or []


def listar_cronogramas_por_bairro(id_bairro: int) -> list[Cronograma]:
    resultado = (
        supabase.table("tb_cronograma")
        .select("*")
        .eq("id_bairro", id_bairro)
        .order("ds_dia_semana")
        .execute()
    )
    return resultado.data or []


def buscar_cronograma(id_cronograma: int) -> Cronograma:
    resultado = (
        supabase.table("tb_cronograma")
        .select("*")
        .eq("id_cronograma", id_cronograma)
        .single()
        .execute()
    )
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cronograma {id_cronograma} não encontrado.",
        )
    return resultado.data


def criar_cronograma(dados: CronogramaCriar) -> Cronograma:
    payload = _lower_keys(dados.model_dump())
    payload["hr_coleta"] = str(payload["hr_coleta"])

    resultado = supabase.table("tb_cronograma").insert(payload).execute()
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao criar o cronograma.",
        )
    return resultado.data[0]


def atualizar_cronograma(id_cronograma: int, dados: CronogramaAtualizar) -> Cronograma:
    campos = _lower_keys({k: v for k, v in dados.model_dump().items() if v is not None})
    if not campos:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Nenhum campo fornecido para atualização.",
        )

    if "hr_coleta" in campos:
        campos["hr_coleta"] = str(campos["hr_coleta"])

    resultado = (
        supabase.table("tb_cronograma")
        .update(campos)
        .eq("id_cronograma", id_cronograma)
        .execute()
    )
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cronograma {id_cronograma} não encontrado.",
        )
    return resultado.data[0]


def remover_cronograma(id_cronograma: int) -> None:
    resultado = (
        supabase.table("tb_cronograma")
        .delete()
        .eq("id_cronograma", id_cronograma)
        .execute()
    )
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cronograma {id_cronograma} não encontrado.",
        )
