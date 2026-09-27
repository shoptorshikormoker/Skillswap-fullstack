import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="page-loading" aria-label="Loading">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
