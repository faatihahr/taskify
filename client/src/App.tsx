import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BoardPage from './pages/BoardPage'
import AllBoardsPage from './pages/AllBoardsPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './index.css'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/boards"
        element={
          <ProtectedRoute>
            <AllBoardsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/boards/create"
        element={
          <ProtectedRoute>
            <AllBoardsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/:boardId"
        element={
          <ProtectedRoute>
            <BoardPage />
          </ProtectedRoute>
        }
      />
      {/* Redirect untuk route yang tidak dikenal ke halaman utama */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
