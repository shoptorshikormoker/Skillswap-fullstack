import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthProvider'
import DashboardPage from './pages/DashboardPage'
import CreateSessionPage from './pages/CreateSessionPage'
import EditProfilePage from './pages/EditProfilePage'
import ExchangeRequestsPage from './pages/ExchangeRequestsPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MySkillsPage from './pages/MySkillsPage'
import PublicProfilePage from './pages/PublicProfilePage'
import RegisterPage from './pages/RegisterPage'
import SearchPage from './pages/SearchPage'
import SessionDetailsPage from './pages/SessionDetailsPage'
import SessionsPage from './pages/SessionsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profiles/:userId" element={<PublicProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exchanges"
            element={
              <ProtectedRoute>
                <ExchangeRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <SessionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/new"
            element={
              <ProtectedRoute>
                <CreateSessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/:sessionId"
            element={
              <ProtectedRoute>
                <SessionDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skills"
            element={
              <ProtectedRoute>
                <MySkillsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
