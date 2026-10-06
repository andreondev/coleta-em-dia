from datetime import date, time
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

TIPOS_EXCECAO = ["cancelamento", "reagendamento"]


def _upper(s: str) -> str:
    return s.upper()


class ExcecaoCriar(BaseModel):
    DT_EXCECAO: date = Field(..., description="Data da exceção (YYYY-MM-DD)")
    TP_EXCECAO: str = Field(
        ...,
        max_length=20,
        description="Tipo: 'cancelamento' ou 'reagendamento'",
    )
    HR_NOVO: Optional[time] = Field(
        None,
        description="Novo horário (obrigatório se TP_EXCECAO = 'reagendamento')",
    )
    ID_CRONOGRAMA: int = Field(..., description="ID do cronograma afetado")


class ExcecaoAtualizar(BaseModel):
    DT_EXCECAO: Optional[date] = None
    TP_EXCECAO: Optional[str] = Field(None, max_length=20)
    HR_NOVO: Optional[time] = None
    ID_CRONOGRAMA: Optional[int] = None


class Excecao(BaseModel):
    ID_EXCECAO_COLETA: int
    DT_EXCECAO: date
    TP_EXCECAO: str
    HR_NOVO: Optional[time]
    ID_CRONOGRAMA: int

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=_upper,
        populate_by_name=True,
    )
