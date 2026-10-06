from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


def _upper(s: str) -> str:
    return s.upper()


class BairroCriar(BaseModel):
    NM_BAIRRO: str = Field(..., max_length=100, description="Nome do bairro")


class BairroAtualizar(BaseModel):
    NM_BAIRRO: Optional[str] = Field(None, max_length=100)


class Bairro(BaseModel):
    ID_BAIRRO: int
    NM_BAIRRO: str

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=_upper,
        populate_by_name=True,
    )
