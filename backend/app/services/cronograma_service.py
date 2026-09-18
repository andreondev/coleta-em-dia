from fastapi import HTTPException, status
from app.db.session import supabase
from app.models.cronograma import Cronograma, CronogramaAtualizar, CronogramaCriar

def listar_cronogramas() -> list[Cronograma]:
    resultado = (
        supabase.table("TB_CRONOGRAMA")
        .select("*")
        .order("ID_BAIRRO")
        .order("DS_DIA_SEMANA")
        .execute()
    )
    return resultado.data or []

def listar_cronogramas_por_bairro(id_bairro: int) -> list[Cronograma]:
    resultado = (
        supabase.table("TB_CRONOGRAMA")
        .select("*")
        .eq("ID_BAIRRO", id_bairro)
        .order("DS_DIA_SEMANA")
        .execute()
    )
    return resultado.data or []

def buscar_cronograma(id_cronograma: int) -> Cronograma:
    resultado = (
        supabase.table("TB_CRONOGRAMA")
        .select("*")
        .eq("ID_CRONOGRAMA", id_cronograma)
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
    payload = dados.model_dump()
    payload["HR_COLETA"] = str(payload["HR_COLETA"])

    resultado = supabase.table("TB_CRONOGRAMA").insert(payload).execute()
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao criar o cronograma.",
        )
    return resultado.data[0]

def atualizar_cronograma(id_cronograma: int, dados: CronogramaAtualizar) -> Cronograma:
    campos = {k: v for k, v in dados.model_dump().items() if v is not None}
    if not campos:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Nenhum campo fornecido para atualização.",
        )

    if "HR_COLETA" in campos:
        campos["HR_COLETA"] = str(campos["HR_COLETA"])

    resultado = (
        supabase.table("TB_CRONOGRAMA")
        .update(campos)
        .eq("ID_CRONOGRAMA", id_cronograma)
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
        supabase.table("TB_CRONOGRAMA")
        .delete()
        .eq("ID_CRONOGRAMA", id_cronograma)
        .execute()
    )
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cronograma {id_cronograma} não encontrado.",
        )
