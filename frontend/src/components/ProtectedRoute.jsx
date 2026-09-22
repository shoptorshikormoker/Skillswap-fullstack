import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'

function ProtectedRoute({ children }) {
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

  return children
}

export default ProtectedRoute
