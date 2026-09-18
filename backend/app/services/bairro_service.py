from fastapi import HTTPException, status
from app.db.session import supabase
from app.models.bairro import Bairro, BairroAtualizar, BairroCriar

def listar_bairros() -> list[Bairro]:
    resultado = supabase.table("TB_BAIRRO").select("*").order("NM_BAIRRO").execute()
    return resultado.data or []

def buscar_bairro(id_bairro: int) -> Bairro:
    resultado = (
        supabase.table("TB_BAIRRO")
        .select("*")
        .eq("ID_BAIRRO", id_bairro)
        .single()
        .execute()
    )
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bairro {id_bairro} não encontrado.",
        )
    return resultado.data

def criar_bairro(dados: BairroCriar) -> Bairro:
    resultado = supabase.table("TB_BAIRRO").insert(dados.model_dump()).execute()
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao criar o bairro.",
        )
    return resultado.data[0]

def atualizar_bairro(id_bairro: int, dados: BairroAtualizar) -> Bairro:
    campos = {k: v for k, v in dados.model_dump().items() if v is not None}
    if not campos:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Nenhum campo fornecido para atualização.",
        )

    resultado = (
        supabase.table("TB_BAIRRO")
        .update(campos)
        .eq("ID_BAIRRO", id_bairro)
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
        supabase.table("TB_BAIRRO")
        .delete()
        .eq("ID_BAIRRO", id_bairro)
        .execute()
    )
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bairro {id_bairro} não encontrado.",
        )
