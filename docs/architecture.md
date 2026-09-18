# Arquitetura do Sistema

O sistema **coleta-app** adota uma arquitetura Cliente-Servidor clássica com um backend servindo como ponte de segurança para um banco de dados hospedado no Supabase.

## Componentes Principais

### 1. Frontend (React + TypeScript)
- **Área Pública**: Os cidadãos acessam o site para visualizar os cronogramas e as exceções de coleta em seus bairros. O frontend consome a API do backend de forma anônima.
- **Painel Administrativo**: Acesso restrito via login. Utiliza Context API para gerenciar o estado da sessão (token JWT). Todas as requisições para criar, editar ou deletar registros são interceptadas pelo Axios, que adiciona o token Bearer nos cabeçalhos.

### 2. Backend (FastAPI)
- Atua como uma camada de abstração e segurança entre o frontend e o banco de dados.
- **Divisão de Responsabilidades (Domain-Driven Design simplificado)**:
  - `api/`: Define os "routers" da API (endpoints REST). Onde ocorre injeção de dependências (como validação de token do admin).
  - `core/`: Configurações globais e segurança (hash de senha e JWT).
  - `models/`: Contratos de entrada e saída (Schemas do Pydantic).
  - `services/`: Regras de negócio centrais e chamadas diretas ao banco de dados.
  - `db/`: Conexão singleton do cliente Supabase.

### 3. Banco de Dados (Supabase/PostgreSQL)
- O backend se comunica com o Supabase utilizando a **Service Role Key**, o que permite ignorar o RLS (Row Level Security) nativo do Supabase. Essa decisão arquitetural concentra toda a lógica de autorização na camada do FastAPI (backend), que é o único responsável por permitir ou bloquear requisições de escrita.

## Fluxo de Autenticação e Autorização

1. O administrador insere as credenciais no Frontend.
2. Frontend chama `POST /auth/login`.
3. Backend verifica a senha armazenada (bcrypt hash) na tabela `TB_ADMIN`.
4. Backend assina e devolve um **JWT (JSON Web Token)**.
5. Frontend armazena o token e o utiliza nas rotas protegidas.
6. Backend valida o token via dependência `obter_admin_atual()` antes de autorizar qualquer rota de escrita (POST, PUT, DELETE).
