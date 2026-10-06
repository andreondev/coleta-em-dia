/**
 * Dashboard.tsx — Painel de Controle e Cadastros (Admin).
 * Desenvolvido em React + TypeScript + Tailwind CSS.
 */

import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  bairroService,
  cronogramaService,
  excecaoService,
  type Bairro,
  type BairroCriar,
  type Cronograma,
  type CronogramaCriar,
  type Excecao,
} from '../services/api'

const DIAS_SEMANA = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
]

type AbaTipo = 'bairros' | 'cronogramas' | 'excecoes'

export default function Dashboard() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [abaAtiva, setAbaAtiva] = useState<AbaTipo>('bairros')

  // Estados locais dos dados
  const [bairros, setBairros] = useState<Bairro[]>([])
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([])
  const [excecoes, setExcecoes] = useState<Excecao[]>([])
  const [carregando, setCarregando] = useState(false)

  // Formulários
  const [bairroForm, setBairroForm] = useState<BairroCriar>({ NM_BAIRRO: '' })
  const [cronogramaForm, setCronogramaForm] = useState<CronogramaCriar>({
    DS_DIA_SEMANA: '',
    HR_COLETA: '',
    ID_BAIRRO: 0,
  })
  const [excecaoForm, setExcecaoForm] = useState<{
    DT_EXCECAO: string
    TP_EXCECAO: 'cancelamento' | 'reagendamento'
    HR_NOVO: string
    ID_CRONOGRAMA: number
  }>({
    DT_EXCECAO: '',
    TP_EXCECAO: 'cancelamento',
    HR_NOVO: '',
    ID_CRONOGRAMA: 0,
  })

  // Mensagens de feedback
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const dispararSucesso = (msg: string) => {
    setMensagemSucesso(msg)
    setTimeout(() => setMensagemSucesso(null), 3000)
  }

  const dispararErro = (msg: string) => {
    setErro(msg)
    setTimeout(() => setErro(null), 5000)
  }

  const carregarDados = async () => {
    setCarregando(true)
    try {
      const [resBairros, resCronogramas, resExcecoes] = await Promise.all([
        bairroService.listar(),
        cronogramaService.listar(),
        excecaoService.listar(),
      ])
      setBairros(resBairros.data)
      setCronogramas(resCronogramas.data)
      setExcecoes(resExcecoes.data)
    } catch (err) {
      console.error(err)
      dispararErro('Erro ao carregar dados do servidor.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  // Submit Bairro
  const handleBairroSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!bairroForm.NM_BAIRRO.trim()) return

    try {
      const res = await bairroService.criar({ NM_BAIRRO: bairroForm.NM_BAIRRO.trim() })
      setBairros((prev) => [...prev, res.data])
      setBairroForm({ NM_BAIRRO: '' })
      dispararSucesso('Bairro cadastrado com sucesso!')
    } catch (err) {
      console.error(err)
      dispararErro('Erro ao cadastrar bairro.')
    }
  }

  // Delete Bairro
  const handleBairroDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este bairro?')) return
    try {
      await bairroService.deletar(id)
      setBairros((prev) => prev.filter((b) => b.ID_BAIRRO !== id))
      setCronogramas((prev) => prev.filter((c) => c.ID_BAIRRO !== id))
      dispararSucesso('Bairro excluído.')
    } catch (err) {
      console.error(err)
      dispararErro('Erro ao excluir bairro.')
    }
  }

  // Submit Cronograma
  const handleCronogramaSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!cronogramaForm.DS_DIA_SEMANA || !cronogramaForm.HR_COLETA || !cronogramaForm.ID_BAIRRO) {
      return
    }

    try {
      const payload: CronogramaCriar = {
        DS_DIA_SEMANA: cronogramaForm.DS_DIA_SEMANA,
        HR_COLETA: cronogramaForm.HR_COLETA,
        ID_BAIRRO: Number(cronogramaForm.ID_BAIRRO),
      }
      const res = await cronogramaService.criar(payload)
      setCronogramas((prev) => [...prev, res.data])
      setCronogramaForm({ DS_DIA_SEMANA: '', HR_COLETA: '', ID_BAIRRO: 0 })
      dispararSucesso('Cronograma cadastrado com sucesso!')
    } catch (err) {
      console.error(err)
      dispararErro('Erro ao cadastrar cronograma.')
    }
  }

  // Delete Cronograma
  const handleCronogramaDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este cronograma?')) return
    try {
      await cronogramaService.deletar(id)
      setCronogramas((prev) => prev.filter((c) => c.ID_CRONOGRAMA !== id))
      dispararSucesso('Cronograma excluído.')
    } catch (err) {
      console.error(err)
      dispararErro('Erro ao excluir cronograma.')
    }
  }

  // Submit Exceção
  const handleExcecaoSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!excecaoForm.DT_EXCECAO || !excecaoForm.ID_CRONOGRAMA) return
    if (excecaoForm.TP_EXCECAO === 'reagendamento' && !excecaoForm.HR_NOVO) return

    try {
      const payload = {
        DT_EXCECAO: excecaoForm.DT_EXCECAO,
        TP_EXCECAO: excecaoForm.TP_EXCECAO,
        HR_NOVO: excecaoForm.TP_EXCECAO === 'reagendamento' ? excecaoForm.HR_NOVO : null,
        ID_CRONOGRAMA: Number(excecaoForm.ID_CRONOGRAMA),
      }
      const res = await excecaoService.criar(payload)
      setExcecoes((prev) => [...prev, res.data])
      setExcecaoForm({
        DT_EXCECAO: '',
        TP_EXCECAO: 'cancelamento',
        HR_NOVO: '',
        ID_CRONOGRAMA: 0,
      })
      dispararSucesso('Exceção cadastrada com sucesso!')
    } catch (err) {
      console.error(err)
      dispararErro('Erro ao cadastrar exceção.')
    }
  }

  // Delete Exceção
  const handleExcecaoDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta exceção?')) return
    try {
      await excecaoService.deletar(id)
      setExcecoes((prev) => prev.filter((ex) => ex.ID_EXCECAO_COLETA !== id))
      dispararSucesso('Exceção excluída.')
    } catch (err) {
      console.error(err)
      dispararErro('Erro ao excluir exceção.')
    }
  }

  const getNomeBairroPorId = (idBairro: number) => {
    return bairros.find((b) => b.ID_BAIRRO === idBairro)?.NM_BAIRRO || 'Desconhecido'
  }

  const getBairroInfoPorCronograma = (idCronograma: number) => {
    const cron = cronogramas.find((c) => c.ID_CRONOGRAMA === idCronograma)
    if (!cron) return 'Cronograma não localizado'
    const bairro = getNomeBairroPorId(cron.ID_BAIRRO)
    return `${bairro} (${cron.DS_DIA_SEMANA} às ${cron.HR_COLETA})`
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-md">
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <span className="text-2xl">🚛</span>
            <div>
              <h2 className="font-bold text-base leading-tight">Coleta Urbana</h2>
              <span className="text-xs text-slate-400">Painel de Gestão</span>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            <button
              onClick={() => setAbaAtiva('bairros')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left cursor-pointer ${
                abaAtiva === 'bairros'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>🏘️</span> Bairros
            </button>

            <button
              onClick={() => setAbaAtiva('cronogramas')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left cursor-pointer ${
                abaAtiva === 'cronogramas'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>📅</span> Cronogramas
            </button>

            <button
              onClick={() => setAbaAtiva('excecoes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left cursor-pointer ${
                abaAtiva === 'excecoes'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>⚠️</span> Exceções
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="text-xs text-slate-400">
            Logado como: <strong className="text-slate-200">{admin?.login || 'Admin'}</strong>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Link
              to="/"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition"
            >
              Ver site público →
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs bg-rose-950/80 hover:bg-rose-900 text-rose-300 px-2.5 py-1 rounded border border-rose-800 cursor-pointer transition"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {abaAtiva === 'bairros' && 'Gerenciamento de Bairros'}
              {abaAtiva === 'cronogramas' && 'Gerenciamento de Cronogramas'}
              {abaAtiva === 'excecoes' && 'Gerenciamento de Exceções de Coleta'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Cadastre e gerencie as informações que serão exibidas para os cidadãos.
            </p>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {mensagemSucesso && (
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-3.5 py-2 rounded-lg text-sm flex items-center gap-2 animate-fade-in shadow-sm">
                <span>✅</span> {mensagemSucesso}
              </div>
            )}
            {erro && (
              <div className="bg-rose-100 border border-rose-300 text-rose-800 px-3.5 py-2 rounded-lg text-sm flex items-center gap-2 animate-fade-in shadow-sm">
                <span>❌</span> {erro}
              </div>
            )}
          </div>
        </header>

        {carregando && (
          <div className="flex justify-center p-8 text-slate-500">
            Carregando dados...
          </div>
        )}

        {!carregando && (
          <>
            {/* ABA: BAIRROS */}
        {abaAtiva === 'bairros' && (
          <div className="space-y-6">
            {/* Card de Cadastro */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                Cadastrar Novo Bairro
              </h2>
              <form onSubmit={handleBairroSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nome do bairro (ex: Centro, Vila Nova...)"
                  value={bairroForm.NM_BAIRRO}
                  onChange={(e) => setBairroForm({ NM_BAIRRO: e.target.value })}
                  className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition shadow-sm cursor-pointer"
                >
                  Salvar Bairro
                </button>
              </form>
            </div>

            {/* Listagem */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800 text-sm">
                Bairros Cadastrados ({bairros.length})
              </div>
              {bairros.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">Nenhum bairro cadastrado.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Nome</th>
                      <th className="px-6 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bairros.map((b) => (
                      <tr key={b.ID_BAIRRO} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-3 text-slate-400">#{b.ID_BAIRRO}</td>
                        <td className="px-6 py-3 font-medium text-slate-800">{b.NM_BAIRRO}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleBairroDelete(b.ID_BAIRRO)}
                            className="text-xs text-rose-600 hover:text-rose-800 border border-rose-200 hover:bg-rose-50 px-2.5 py-1 rounded transition cursor-pointer"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ABA: CRONOGRAMAS */}
        {abaAtiva === 'cronogramas' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                Cadastrar Novo Horário de Coleta
              </h2>
              <form onSubmit={handleCronogramaSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Dia da Semana
                  </label>
                  <select
                    required
                    value={cronogramaForm.DS_DIA_SEMANA}
                    onChange={(e) =>
                      setCronogramaForm((prev) => ({ ...prev, DS_DIA_SEMANA: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="">Selecione o dia...</option>
                    {DIAS_SEMANA.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Horário da Coleta
                  </label>
                  <input
                    type="time"
                    required
                    value={cronogramaForm.HR_COLETA}
                    onChange={(e) =>
                      setCronogramaForm((prev) => ({ ...prev, HR_COLETA: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Bairro Atendido
                  </label>
                  <select
                    required
                    value={cronogramaForm.ID_BAIRRO || ''}
                    onChange={(e) =>
                      setCronogramaForm((prev) => ({
                        ...prev,
                        ID_BAIRRO: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="">Selecione o bairro...</option>
                    {bairros.map((b) => (
                      <option key={b.ID_BAIRRO} value={b.ID_BAIRRO}>
                        {b.NM_BAIRRO}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition shadow-sm cursor-pointer"
                  >
                    Salvar Cronograma
                  </button>
                </div>
              </form>
            </div>

            {/* Tabela de Cronogramas */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800 text-sm">
                Cronogramas Ativos ({cronogramas.length})
              </div>
              {cronogramas.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">Nenhum cronograma cadastrado.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">Dia</th>
                      <th className="px-6 py-3">Horário</th>
                      <th className="px-6 py-3">Bairro</th>
                      <th className="px-6 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cronogramas.map((c) => (
                      <tr key={c.ID_CRONOGRAMA} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-3 font-medium text-slate-800">{c.DS_DIA_SEMANA}</td>
                        <td className="px-6 py-3 text-emerald-700 font-semibold">{c.HR_COLETA}</td>
                        <td className="px-6 py-3 text-slate-600">
                          📍 {getNomeBairroPorId(c.ID_BAIRRO)}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleCronogramaDelete(c.ID_CRONOGRAMA)}
                            className="text-xs text-rose-600 hover:text-rose-800 border border-rose-200 hover:bg-rose-50 px-2.5 py-1 rounded transition cursor-pointer"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ABA: EXCEÇÕES */}
        {abaAtiva === 'excecoes' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                Cadastrar Exceção (Cancelamento ou Reagendamento)
              </h2>
              <form onSubmit={handleExcecaoSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Data da Ocorrência
                  </label>
                  <input
                    type="date"
                    required
                    value={excecaoForm.DT_EXCECAO}
                    onChange={(e) =>
                      setExcecaoForm((prev) => ({ ...prev, DT_EXCECAO: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tipo de Exceção
                  </label>
                  <select
                    required
                    value={excecaoForm.TP_EXCECAO}
                    onChange={(e) =>
                      setExcecaoForm((prev) => ({
                        ...prev,
                        TP_EXCECAO: e.target.value as 'cancelamento' | 'reagendamento',
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="cancelamento">Cancelamento</option>
                    <option value="reagendamento">Reagendamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Cronograma Afetado
                  </label>
                  <select
                    required
                    value={excecaoForm.ID_CRONOGRAMA || ''}
                    onChange={(e) =>
                      setExcecaoForm((prev) => ({
                        ...prev,
                        ID_CRONOGRAMA: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="">Selecione o cronograma...</option>
                    {cronogramas.map((c) => (
                      <option key={c.ID_CRONOGRAMA} value={c.ID_CRONOGRAMA}>
                        {getNomeBairroPorId(c.ID_BAIRRO)} — {c.DS_DIA_SEMANA} às {c.HR_COLETA}
                      </option>
                    ))}
                  </select>
                </div>

                {excecaoForm.TP_EXCECAO === 'reagendamento' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Novo Horário Previsto
                    </label>
                    <input
                      type="time"
                      required
                      value={excecaoForm.HR_NOVO}
                      onChange={(e) =>
                        setExcecaoForm((prev) => ({ ...prev, HR_NOVO: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}

                <div className="sm:col-span-3 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition shadow-sm cursor-pointer"
                  >
                    Salvar Exceção
                  </button>
                </div>
              </form>
            </div>

            {/* Tabela de Exceções */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800 text-sm">
                Exceções Registradas ({excecoes.length})
              </div>
              {excecoes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">Nenhuma exceção registrada.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">Data</th>
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Cronograma / Bairro</th>
                      <th className="px-6 py-3">Novo Horário</th>
                      <th className="px-6 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {excecoes.map((ex) => (
                      <tr key={ex.ID_EXCECAO_COLETA} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-3 font-medium text-slate-800">{ex.DT_EXCECAO}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              ex.TP_EXCECAO === 'cancelamento'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {ex.TP_EXCECAO}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                          {getBairroInfoPorCronograma(ex.ID_CRONOGRAMA)}
                        </td>
                        <td className="px-6 py-3 text-slate-700 font-medium">
                          {ex.HR_NOVO || '—'}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleExcecaoDelete(ex.ID_EXCECAO_COLETA)}
                            className="text-xs text-rose-600 hover:text-rose-800 border border-rose-200 hover:bg-rose-50 px-2.5 py-1 rounded transition cursor-pointer"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </main>
    </div>
  )
}
