"""
session.py — Cliente Supabase com service_role key.

A service_role key ignora o RLS, permitindo que o backend realize
operações de escrita (INSERT, UPDATE, DELETE) em qualquer tabela.
"""

from supabase import Client, create_client

from app.core.config import settings

# Cliente singleton reutilizado pelos services
supabase: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)
