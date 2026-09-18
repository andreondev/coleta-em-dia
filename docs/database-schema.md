# Esquema de Banco de Dados

O banco de dados relacional (PostgreSQL / Supabase) do sistema de coleta possui as seguintes tabelas principais:

## `TB_ADMIN`
Tabela para armazenamento das credenciais dos administradores do sistema.
- `ID_ADMIN` (int, PK)
- `DS_LOGIN` (varchar, Unique)
- `DS_SENHA` (varchar, Hash Bcrypt)

## `TB_BAIRRO`
Catálogo de bairros da cidade.
- `ID_BAIRRO` (int, PK)
- `NM_BAIRRO` (varchar)

## `TB_CRONOGRAMA`
A programação regular da coleta de lixo.
- `ID_CRONOGRAMA` (int, PK)
- `ID_BAIRRO` (int, FK -> TB_BAIRRO)
- `DS_DIA_SEMANA` (varchar) - Ex: 'segunda-feira', 'terça-feira'
- `HR_COLETA` (time) - Horário padrão

## `TB_EXCECAO_COLETA`
Registros de eventos que desviam do cronograma normal (cancelamentos por feriados, reagendamentos).
- `ID_EXCECAO_COLETA` (int, PK)
- `ID_CRONOGRAMA` (int, FK -> TB_CRONOGRAMA)
- `DT_EXCECAO` (date) - A data específica do evento
- `TP_EXCECAO` (varchar) - 'cancelamento' ou 'reagendamento'
- `HR_NOVO` (time, nullable) - Preenchido caso o tipo seja 'reagendamento'

## Relacionamentos

- Um **Bairro** (`TB_BAIRRO`) pode ter vários **Cronogramas** (`TB_CRONOGRAMA`).
- Um **Cronograma** (`TB_CRONOGRAMA`) pode ter várias **Exceções** (`TB_EXCECAO_COLETA`), mas que normalmente se aplicam apenas em datas (`DT_EXCECAO`) específicas.
