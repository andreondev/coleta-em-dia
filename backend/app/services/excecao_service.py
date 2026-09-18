from fastapi import HTTPException, status
from app.db.session import supabase
from app.models.excecao import Excecao, ExcecaoAtualizar, ExcecaoCriar, TIPOS_EXCECAO

def _validar_tipo_excecao(tp_excecao: str, hr_novo) -> None:
    if tp_excecao not in TIPOS_EXCECAO:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"TP_EXCECAO deve ser um de: {TIPOS_EXCECAO}.",
        )
    if tp_excecao == "reagendamento" and hr_novo is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="HR_NOVO é obrigatório quando TP_EXCECAO = 'reagendamento'.",
        )

def listar_excecoes() -> list[Excecao]:
    resultado = (
        supabase.table("TB_EXCECAO_COLETA")
        .select("*")
        .order("DT_EXCECAO")
        .execute()
    )
    return resultado.data or []

def buscar_excecao(id_excecao: int) -> Excecao:
    resultado = (
        supabase.table("TB_EXCECAO_COLETA")
        .select("*")
        .eq("ID_EXCECAO_COLETA", id_excecao)
        .single()
        .execute()
    )
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exceção {id_excecao} não encontrada.",
        )
    return resultado.data

def criar_excecao(dados: ExcecaoCriar) -> Excecao:
    _validar_tipo_excecao(dados.TP_EXCECAO, dados.HR_NOVO)

    payload = dados.model_dump()
    payload["DT_EXCECAO"] = str(payload["DT_EXCECAO"])
    if payload["HR_NOVO"] is not None:
        payload["HR_NOVO"] = str(payload["HR_NOVO"])

    resultado = supabase.table("TB_EXCECAO_COLETA").insert(payload).execute()
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao criar a exceção.",
        )
    return resultado.data[0]

def atualizar_excecao(id_excecao: int, dados: ExcecaoAtualizar) -> Excecao:
    campos = {k: v for k, v in dados.model_dump().items() if v is not None}
    if not campos:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Nenhum campo fornecido para atualização.",
        )

    if "TP_EXCECAO" in campos or "HR_NOVO" in campos:
        atual = (
            supabase.table("TB_EXCECAO_COLETA")
            .select("TP_EXCECAO, HR_NOVO")
            .eq("ID_EXCECAO_COLETA", id_excecao)
            .single()
            .execute()
        )
        if not atual.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exceção {id_excecao} não encontrada.",
            )
        tp = campos.get("TP_EXCECAO", atual.data["TP_EXCECAO"])
        hr = campos.get("HR_NOVO", atual.data["HR_NOVO"])
        _validar_tipo_excecao(tp, hr)

    if "DT_EXCECAO" in campos:
        campos["DT_EXCECAO"] = str(campos["DT_EXCECAO"])
    if "HR_NOVO" in campos:
        campos["HR_NOVO"] = str(campos["HR_NOVO"])

    resultado = (
        supabase.table("TB_EXCECAO_COLETA")
        .update(campos)
        .eq("ID_EXCECAO_COLETA", id_excecao)
        .execute()
    )
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exceção {id_excecao} não encontrada.",
        )
    return resultado.data[0]

def remover_excecao(id_excecao: int) -> None:
    resultado = (
        supabase.table("TB_EXCECAO_COLETA")
        .delete()
        .eq("ID_EXCECAO_COLETA", id_excecao)
        .execute()
    )
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exceção {id_excecao} não encontrada.",
        )
