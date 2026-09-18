/**
 * Login.tsx — Tela de login administrativo.
 * Desenvolvido em React + TypeScript + Tailwind CSS.
 */

import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { LoginRequest } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const { login, loading, error } = useAuth()

  const [form, setForm] = useState<LoginRequest>({ DS_LOGIN: '', DS_SENHA: '' })
  const [showSenha, setShowSenha] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const result = await login(form)
    if (result.success) {
      navigate('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
        {/* Cabeçalho do Card */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚛</div>
          <h1 className="text-2xl font-bold text-slate-800">Coleta Urbana</h1>
          <p className="text-sm text-slate-500 mt-1">Acesso Administrativo</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="DS_LOGIN"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Usuário / Login
            </label>
            <input
              id="DS_LOGIN"
              name="DS_LOGIN"
              type="text"
              required
              autoComplete="username"
              placeholder="Digite seu login"
              value={form.DS_LOGIN}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <label
              htmlFor="DS_SENHA"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Senha
            </label>
            <div className="relative">
              <input
                id="DS_SENHA"
                name="DS_SENHA"
                type={showSenha ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Digite sua senha"
                value={form.DS_SENHA}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSenha((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-sm"
              >
                {showSenha ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block animate-pulse">Entrando...</span>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-emerald-600 transition"
          >
            ← Voltar para a visualização pública
          </Link>
        </div>
      </div>
    </div>
  )
}
