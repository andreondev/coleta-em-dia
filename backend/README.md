# Backend — Sistema de Coleta de Lixo

API REST em **FastAPI** para gerenciar o sistema de coleta de lixo.  
Banco de dados: **Supabase (Postgres)** com RLS. Deploy: **Render**.

---

## Estrutura de pastas

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS e registro dos routers
│   ├── database.py          # Cliente Supabase (service_role key)
│   ├── auth.py              # Hash de senha, criação/validação de JWT
│   ├── schemas.py           # Modelos Pydantic
│   └── routers/
│       ├── __init__.py
│       ├── auth_router.py   # POST /auth/login
│       ├── bairro.py        # CRUD /bairros/
│       ├── cronograma.py    # CRUD /cronograma/
│       └── excecao.py       # CRUD /excecoes/
├── gerar_hash_senha.py      # Script auxiliar — gera hash bcrypt
├── requirements.txt
├── .env.example
└── README.md
```

---

## Configuração local

### 1. Crie e ative um ambiente virtual

```bash
python -m venv venv
source venv/bin/activate        # Linux/macOS
# venv\Scripts\activate         # Windows
```

### 2. Instale as dependências

```bash
pip install -r requirements.txt
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com seus valores reais
```

| Variável | Descrição |
|---|---|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role (ignora RLS) |
| `JWT_SECRET_KEY` | String aleatória para assinar JWTs |
| `CORS_ORIGINS` | Domínios liberados pelo CORS (vírgula) |

Gere uma `JWT_SECRET_KEY` segura com:
```bash
openssl rand -hex 32
```

### 4. Rode o servidor localmente

```bash
uvicorn app.main:app --reload
```

Acesse a documentação interativa em: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Banco de dados (Supabase)

Execute os scripts SQL abaixo no **SQL Editor** do Supabase, nesta ordem:

### Criação das tabelas

```sql
-- 1. TB_BAIRRO
CREATE TABLE TB_BAIRRO (
    ID_BAIRRO INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    NM_BAIRRO VARCHAR(100) NOT NULL
);

-- 2. TB_CRONOGRAMA
CREATE TABLE TB_CRONOGRAMA (
    ID_CRONOGRAMA INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    DS_DIA_SEMANA VARCHAR(20) NOT NULL,
    HR_COLETA TIME(6) NOT NULL,
    ID_BAIRRO INT NOT NULL REFERENCES TB_BAIRRO(ID_BAIRRO)
);

-- 3. TB_EXCECAO_COLETA
CREATE TABLE TB_EXCECAO_COLETA (
    ID_EXCECAO_COLETA INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    DT_EXCECAO DATE NOT NULL,
    TP_EXCECAO VARCHAR(20) NOT NULL,
    HR_NOVO TIME(6) NULL,
    ID_CRONOGRAMA INT NOT NULL REFERENCES TB_CRONOGRAMA(ID_CRONOGRAMA)
);

-- 4. TB_ADMIN
CREATE TABLE TB_ADMIN (
    ID_ADMIN INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    NM_ADMIN VARCHAR(100) NOT NULL,
    DS_LOGIN VARCHAR(50) NOT NULL UNIQUE,
    DS_SENHA VARCHAR(255) NOT NULL
);
```

### RLS e policies

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE TB_BAIRRO ENABLE ROW LEVEL SECURITY;
ALTER TABLE TB_CRONOGRAMA ENABLE ROW LEVEL SECURITY;
ALTER TABLE TB_EXCECAO_COLETA ENABLE ROW LEVEL SECURITY;
ALTER TABLE TB_ADMIN ENABLE ROW LEVEL SECURITY;

-- Leitura pública para as 3 tabelas (TB_ADMIN não tem policy alguma)
CREATE POLICY "leitura_publica_bairro"
    ON TB_BAIRRO FOR SELECT USING (true);

CREATE POLICY "leitura_publica_cronograma"
    ON TB_CRONOGRAMA FOR SELECT USING (true);

CREATE POLICY "leitura_publica_excecao"
    ON TB_EXCECAO_COLETA FOR SELECT USING (true);
```

### Primeiro admin

1. Gere o hash da senha:
   ```bash
   python gerar_hash_senha.py
   ```
2. Cole no SQL Editor:
   ```sql
   INSERT INTO TB_ADMIN (NM_ADMIN, DS_LOGIN, DS_SENHA)
   VALUES ('Nome do Admin', 'login_escolhido', 'HASH_GERADO_AQUI');
   ```

---

## Endpoints da API

### Autenticação

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/login` | ❌ | Login do admin — retorna JWT |

### Bairros

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/bairros/` | ❌ | Lista todos os bairros |
| POST | `/bairros/` | ✅ | Cria um bairro |
| PUT | `/bairros/{id}` | ✅ | Atualiza um bairro |
| DELETE | `/bairros/{id}` | ✅ | Remove um bairro |

### Cronograma

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/cronograma/` | ❌ | Lista todos os cronogramas |
| GET | `/cronograma/bairro/{id_bairro}` | ❌ | Cronograma de um bairro |
| POST | `/cronograma/` | ✅ | Cria um cronograma |
| PUT | `/cronograma/{id}` | ✅ | Atualiza um cronograma |
| DELETE | `/cronograma/{id}` | ✅ | Remove um cronograma |

### Exceções

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/excecoes/` | ❌ | Lista todas as exceções |
| POST | `/excecoes/` | ✅ | Cria uma exceção |
| PUT | `/excecoes/{id}` | ✅ | Atualiza uma exceção |
| DELETE | `/excecoes/{id}` | ✅ | Remove uma exceção |

> **Auth ✅** = requer header `Authorization: Bearer <token>`

---

## Deploy no Render

1. Suba o código para um repositório no GitHub.
2. Render → **New → Web Service** → conecte o repositório.
3. Configurações:
   - **Runtime**: Python 3
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Adicione as variáveis de ambiente na aba **Environment**.
5. Acesse `https://<nome>.onrender.com/docs` para testar.

> ⚠️ No plano gratuito o serviço "dorme" após inatividade. Considere um plano pago ou keep-alive se isso impactar a experiência do painel admin.
