import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const DASHBOARD_MAP = {
  warga: '/warga/dashboard',
  aparatur_desa: '/desa/dashboard',
  polsek: '/polsek/dashboard',
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={DASHBOARD_MAP[user.role] || '/'} replace />
  }

  return children
}
