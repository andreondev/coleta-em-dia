-- ============================================================
-- Script SQL — Sistema de Coleta de Lixo
-- Execute no SQL Editor do Supabase na ordem abaixo.
-- ============================================================

-- ─── 1. Criação das tabelas ──────────────────────────────────

CREATE TABLE TB_BAIRRO (
    ID_BAIRRO  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    NM_BAIRRO  VARCHAR(100) NOT NULL
);

CREATE TABLE TB_CRONOGRAMA (
    ID_CRONOGRAMA  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    DS_DIA_SEMANA  VARCHAR(20) NOT NULL,
    HR_COLETA      TIME(6)     NOT NULL,
    ID_BAIRRO      INT         NOT NULL
        REFERENCES TB_BAIRRO(ID_BAIRRO) ON DELETE CASCADE
);

CREATE TABLE TB_EXCECAO_COLETA (
    ID_EXCECAO_COLETA  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    DT_EXCECAO         DATE        NOT NULL,
    TP_EXCECAO         VARCHAR(20) NOT NULL
        CHECK (TP_EXCECAO IN ('cancelamento', 'reagendamento')),
    HR_NOVO            TIME(6)     NULL,
    ID_CRONOGRAMA      INT         NOT NULL
        REFERENCES TB_CRONOGRAMA(ID_CRONOGRAMA) ON DELETE CASCADE
);

CREATE TABLE TB_ADMIN (
    ID_ADMIN  INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    NM_ADMIN  VARCHAR(100) NOT NULL,
    DS_LOGIN  VARCHAR(50)  NOT NULL UNIQUE,
    DS_SENHA  VARCHAR(255) NOT NULL   -- hash bcrypt, NUNCA texto puro
);

-- ─── 2. Row Level Security ───────────────────────────────────

ALTER TABLE TB_BAIRRO          ENABLE ROW LEVEL SECURITY;
ALTER TABLE TB_CRONOGRAMA      ENABLE ROW LEVEL SECURITY;
ALTER TABLE TB_EXCECAO_COLETA  ENABLE ROW LEVEL SECURITY;
ALTER TABLE TB_ADMIN           ENABLE ROW LEVEL SECURITY;

-- ─── 3. Policies de leitura pública ──────────────────────────
-- Apenas SELECT com USING (true) — escrita só via service_role key no backend.
-- TB_ADMIN NÃO tem nenhuma policy → inacessível via anon/authenticated key.

CREATE POLICY "leitura_publica_bairro"
    ON TB_BAIRRO FOR SELECT USING (true);

CREATE POLICY "leitura_publica_cronograma"
    ON TB_CRONOGRAMA FOR SELECT USING (true);

CREATE POLICY "leitura_publica_excecao"
    ON TB_EXCECAO_COLETA FOR SELECT USING (true);

-- ─── 4. Primeiro admin ────────────────────────────────────────
-- 1. Gere o hash da senha localmente: python gerar_hash_senha.py
-- 2. Substitua 'HASH_GERADO_AQUI' pelo hash retornado e execute:

-- INSERT INTO TB_ADMIN (NM_ADMIN, DS_LOGIN, DS_SENHA)
-- VALUES ('Nome do Admin', 'login_escolhido', 'HASH_GERADO_AQUI');
