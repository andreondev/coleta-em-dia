#!/usr/bin/env python3
"""
Script auxiliar para gerar hash bcrypt de uma senha.

Uso:
    python gerar_hash_senha.py

Copie o hash gerado e use-o no INSERT manual do primeiro admin:
    INSERT INTO TB_ADMIN (NM_ADMIN, DS_LOGIN, DS_SENHA)
    VALUES ('Nome do Admin', 'login_escolhido', 'HASH_GERADO_AQUI');

NUNCA armazene senhas em texto puro no banco de dados.
"""

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def main() -> None:
    print("=== Gerador de Hash Bcrypt ===\n")
    senha = input("Digite a senha que deseja transformar em hash: ").strip()

    if not senha:
        print("Senha não pode ser vazia.")
        return

    hash_gerado = pwd_context.hash(senha)
    print("\n✅ Hash gerado com sucesso:\n")
    print(hash_gerado)
    print("\nCopie o hash acima e cole no INSERT do banco de dados.")


if __name__ == "__main__":
    main()
