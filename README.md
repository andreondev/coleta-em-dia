# Coleta de Lixo - Monorepo

Este é o sistema de cronograma de coleta de lixo, desenvolvido com um backend em Python (FastAPI) e um frontend moderno (React + TypeScript + Tailwind v4).

## Estrutura do Monorepo

```
coleta-app/
├── backend/     # API desenvolvida em FastAPI conectada ao Supabase
└── frontend/    # SPA em React + TypeScript + Vite + Tailwind CSS v4
```

## Dependências

### Backend
- Python 3.10+
- FastAPI
- Supabase Python Client
- Pydantic Settings
- Uvicorn

### Frontend
- Node.js 18+
- React 18
- Vite
- Tailwind CSS v4
- React Router Dom
- Axios

## Como Executar

### 1. Backend

O backend utiliza o Supabase como banco de dados principal. 

1. Entre no diretório do backend:
   ```bash
   cd backend
   ```
2. Crie e ative um ambiente virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # ou venv\Scripts\activate no Windows
   ```
3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
4. Copie o arquivo `.env.example` para `.env` e preencha as variáveis.
5. Inicie o servidor:
   ```bash
   fastapi dev app/main.py
   ```
   *A API estará rodando em http://localhost:8000*

### 2. Frontend

O frontend é uma SPA responsável por exibir os cronogramas (área pública) e o painel de administração.

1. Entre no diretório do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Copie o arquivo `.env.example` para `.env.local` e preencha a URL da API (ex: `VITE_API_URL=http://localhost:8000`).
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   *A aplicação estará rodando em http://localhost:5173*
