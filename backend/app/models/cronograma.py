from datetime import time
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


def _upper(s: str) -> str:
    return s.upper()


class CronogramaCriar(BaseModel):
    DS_DIA_SEMANA: str = Field(
        ...,
        max_length=20,
        description="Dia da semana (ex: segunda-feira)",
    )
    HR_COLETA: time = Field(..., description="Horário da coleta (HH:MM:SS)")
    ID_BAIRRO: int = Field(..., description="ID do bairro associado")


class CronogramaAtualizar(BaseModel):
    DS_DIA_SEMANA: Optional[str] = Field(None, max_length=20)
    HR_COLETA: Optional[time] = None
    ID_BAIRRO: Optional[int] = None


class Cronograma(BaseModel):
    ID_CRONOGRAMA: int
    DS_DIA_SEMANA: str
    HR_COLETA: time
    ID_BAIRRO: int

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=_upper,
        populate_by_name=True,
    )
