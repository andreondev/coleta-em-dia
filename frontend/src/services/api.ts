/**
 * api.ts — Camada de comunicação com o backend FastAPI.
 *
 * Todas as chamadas passam por este módulo centralizado.
 * Para ativar a integração real, basta definir VITE_API_URL no .env.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Interceptor: injeta token JWT ────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Interceptor: redireciona em 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  },
)

// ─── Tipos espelhando os schemas do backend ───────────────────────────────────

export interface LoginRequest {
  DS_LOGIN: string
  DS_SENHA: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface Bairro {
  ID_BAIRRO: number
  NM_BAIRRO: string
}

export interface BairroCriar {
  NM_BAIRRO: string
}

export interface Cronograma {
  ID_CRONOGRAMA: number
  DS_DIA_SEMANA: string
  HR_COLETA: string
  ID_BAIRRO: number
}

export interface CronogramaCriar {
  DS_DIA_SEMANA: string
  HR_COLETA: string
  ID_BAIRRO: number
}

export interface Excecao {
  ID_EXCECAO_COLETA: number
  DT_EXCECAO: string
  TP_EXCECAO: 'cancelamento' | 'reagendamento'
  HR_NOVO: string | null
  ID_CRONOGRAMA: number
}

export interface ExcecaoCriar {
  DT_EXCECAO: string
  TP_EXCECAO: 'cancelamento' | 'reagendamento'
  HR_NOVO?: string | null
  ID_CRONOGRAMA: number
}

// ─── Serviços ─────────────────────────────────────────────────────────────────

export const authService = {
  login: (credentials: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', credentials),
  logout: () => localStorage.removeItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token'),
}

export const bairroService = {
  listar: () => api.get<Bairro[]>('/bairros'),
  criar: (data: BairroCriar) => api.post<Bairro>('/bairros', data),
  atualizar: (id: number, data: Partial<BairroCriar>) =>
    api.put<Bairro>(`/bairros/${id}`, data),
  deletar: (id: number) => api.delete(`/bairros/${id}`),
}

export const cronogramaService = {
  listar: () => api.get<Cronograma[]>('/cronogramas'),
  criar: (data: CronogramaCriar) => api.post<Cronograma>('/cronogramas', data),
  atualizar: (id: number, data: Partial<CronogramaCriar>) =>
    api.put<Cronograma>(`/cronogramas/${id}`, data),
  deletar: (id: number) => api.delete(`/cronogramas/${id}`),
}

export const excecaoService = {
  listar: () => api.get<Excecao[]>('/excecoes'),
  criar: (data: ExcecaoCriar) => api.post<Excecao>('/excecoes', data),
  atualizar: (id: number, data: Partial<ExcecaoCriar>) =>
    api.put<Excecao>(`/excecoes/${id}`, data),
  deletar: (id: number) => api.delete(`/excecoes/${id}`),
}

export default api
