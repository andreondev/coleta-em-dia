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
        supabase.table("tb_excecao_coleta")
        .select("*")
        .order("dt_excecao")
        .execute()
    )
    return resultado.data or []

def buscar_excecao(id_excecao: int) -> Excecao:
    resultado = (
        supabase.table("tb_excecao_coleta")
        .select("*")
        .eq("id_excecao_coleta", id_excecao)
        .maybe_single()
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

    resultado = supabase.table("tb_excecao_coleta").insert(payload).execute()
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
            supabase.table("tb_excecao_coleta")
            .select("tp_excecao, hr_novo")
            .eq("id_excecao_coleta", id_excecao)
            .maybe_single()
            .execute()
        )
        if not atual.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exceção {id_excecao} não encontrada.",
            )
        tp = campos.get("tp_excecao", atual.data["tp_excecao"])
        hr = campos.get("hr_novo", atual.data["hr_novo"])
        _validar_tipo_excecao(tp, hr)

    if "DT_EXCECAO" in campos:
        campos["DT_EXCECAO"] = str(campos["DT_EXCECAO"])
    if "HR_NOVO" in campos:
        campos["HR_NOVO"] = str(campos["HR_NOVO"])

    resultado = (
        supabase.table("tb_excecao_coleta")
        .update(campos)
        .eq("id_excecao_coleta", id_excecao)
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
        supabase.table("tb_excecao_coleta")
        .delete()
        .eq("id_excecao_coleta", id_excecao)
        .execute()
    )
    if not resultado.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exceção {id_excecao} não encontrada.",
        )
