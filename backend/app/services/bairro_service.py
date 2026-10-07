from fastapi import HTTPException, status
from app.db.session import supabase
from app.models.bairro import Bairro, BairroAtualizar, BairroCriar


def _lower_keys(d: dict) -> dict:
    """Converte todas as chaves do dict para lowercase (padrão do Postgres)."""
    return {k.lower(): v for k, v in d.items()}


def listar_bairros() -> list[Bairro]:
    resultado = supabase.table("tb_bairro").select("*").order("nm_bairro").execute()
    return resultado.data or []


def buscar_bairro(id_bairro: int) -> Bairro:
    resultado = (
        supabase.table("tb_bairro")
        .select("*")
        .eq("id_bairro", id_bairro)
        .maybe_single()
        .execute()
    )
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bairro {id_bairro} não encontrado.",
        )
    return resultado.data


def criar_bairro(dados: BairroCriar) -> Bairro:
    resultado = supabase.table("tb_bairro").insert(_lower_keys(dados.model_dump())).execute()
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao criar o bairro.",
        )
    return resultado.data[0]


def atualizar_bairro(id_bairro: int, dados: BairroAtualizar) -> Bairro:
    campos = _lower_keys({k: v for k, v in dados.model_dump().items() if v is not None})
    if not campos:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Nenhum campo fornecido para atualização.",
        )

    resultado = (
        supabase.table("tb_bairro")
        .update(campos)
        .eq("id_bairro", id_bairro)
        .execute()
    )
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bairro {id_bairro} não encontrado.",
        )
    return resultado.data[0]


def remover_bairro(id_bairro: int) -> None:
    resultado = (
        supabase.table("tb_bairro")
        .delete()
        .eq("id_bairro", id_bairro)
        .execute()
    )
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bairro {id_bairro} não encontrado.",
        )
