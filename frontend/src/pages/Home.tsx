/**
 * Home.tsx — Tela pública do cronograma de coleta de lixo.
 * Desenvolvido em React + TypeScript + Tailwind CSS.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bairroService, cronogramaService } from '../services/api'
import type { Bairro, Cronograma } from '../services/api'

const DIAS_ORDEM = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
]

export default function Home() {
  const [busca, setBusca] = useState('')
  const [bairros, setBairros] = useState<Bairro[]>([])
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resBairros, resCronogramas] = await Promise.all([
          bairroService.listar(),
          cronogramaService.listar(),
        ])
        setBairros(resBairros.data)
        setCronogramas(resCronogramas.data)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setCarregando(false)
      }
    }
    carregarDados()
  }, [])

  // Agrupamento de cronogramas por dia
  const cronogramaPorDia = DIAS_ORDEM.reduce<Record<string, Cronograma[]>>((acc, dia) => {
    const entradas = cronogramas.filter((c) => c.DS_DIA_SEMANA === dia)
    if (entradas.length > 0) acc[dia] = entradas
    return acc
  }, {})

  // Filtro pelo nome do bairro
  const bairrosFiltrados = bairros.filter((b) =>
    b.NM_BAIRRO.toLowerCase().includes(busca.toLowerCase())
  )

  const diasComResultado = busca
    ? Object.entries(cronogramaPorDia).filter(([, entradas]) =>
        entradas.some((e) => bairrosFiltrados.some((b) => b.ID_BAIRRO === e.ID_BAIRRO))
      )
    : Object.entries(cronogramaPorDia)

  const getNomeBairro = (id: number): string =>
    bairros.find((b) => b.ID_BAIRRO === id)?.NM_BAIRRO || '—'

  // Identificação do dia da semana atual em português
  const hoje = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date())
  const hojeFormatado = hoje.charAt(0).toUpperCase() + hoje.slice(1)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-emerald-600 text-white shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚛</span>
            <div>
              <h1 className="font-bold text-lg leading-tight">Coleta Urbana</h1>
              <p className="text-xs text-emerald-100">Cronograma de Coleta de Lixo</p>
            </div>
          </div>
          <Link
            to="/admin/login"
            className="text-sm font-medium border border-emerald-400 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Área Administrativa
          </Link>
        </div>
      </header>

      {/* Hero / Busca */}
      <section className="bg-emerald-700 text-white py-12 px-4 shadow-inner">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Consulte os horários da coleta em seu bairro
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base mb-6">
            Mantenha a cidade limpa descartando seus resíduos no momento correto.
          </p>

          <div className="relative max-w-lg mx-auto">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              🔍
            </span>
            <input
              type="text"
              className="w-full bg-white text-slate-900 pl-10 pr-10 py-3 rounded-xl shadow-md border-0 focus:ring-2 focus:ring-emerald-400 outline-none text-sm placeholder:text-slate-400"
              placeholder="Digite o nome do seu bairro..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grade de Dias e Horários */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {carregando ? (
          <div className="text-center py-16 text-slate-500">
            <div className="animate-spin text-4xl inline-block mb-4">⏳</div>
            <p className="text-base font-medium">Carregando horários...</p>
          </div>
        ) : diasComResultado.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <span className="text-4xl block mb-2">📭</span>
            <p className="text-base font-medium">
              Nenhum resultado encontrado para "<strong>{busca}</strong>".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diasComResultado.map(([dia, entradas]) => {
              const isHoje = hojeFormatado.toLowerCase() === dia.toLowerCase()
              const itensExibidos = busca
                ? entradas.filter((e) =>
                    bairrosFiltrados.some((b) => b.ID_BAIRRO === e.ID_BAIRRO)
                  )
                : entradas

              return (
                <div
                  key={dia}
                  className={`bg-white rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
                    isHoje
                      ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 mb-3 border-slate-100">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <span>🗓️</span>
                      <span>{dia}</span>
                    </div>
                    {isHoje && (
                      <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Hoje
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {itensExibidos.map((item) => (
                      <div
                        key={item.ID_CRONOGRAMA}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-sm"
                      >
                        <span className="font-medium text-slate-700">
                          📍 {getNomeBairro(item.ID_BAIRRO)}
                        </span>
                        <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-xs">
                          {item.HR_COLETA}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        © {new Date().getFullYear()} Coleta Urbana — Sistema de Cronogramas de Coleta
      </footer>
    </div>
  )
}
