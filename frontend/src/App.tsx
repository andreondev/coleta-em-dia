/**
 * App.tsx — Roteamento e Provedor de Autenticação da Aplicação.
 * Desenvolvido em React + TypeScript + Tailwind CSS.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública do cronograma */}
          <Route path="/" element={<Home />} />

          {/* Rota de login do administrador */}
          <Route path="/admin/login" element={<Login />} />

          {/* Rota protegida do painel de controle */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Rota padrão para redirecionar caminhos inexistentes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
