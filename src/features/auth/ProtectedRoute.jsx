/**
 * ProtectedRoute Component
 * Componente para proteger rutas que requieren autenticacion
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './authStore'

const ProtectedRoute = ({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  redirectTo = '/login',
  unauthorizedRedirect = '/dashboard'
}) => {
  const location = useLocation()
  const { isAuthenticated, hasPermission, hasAnyPermission } = useAuthStore()

  // Verificar autenticacion
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Verificar permiso unico
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={unauthorizedRedirect} replace />
  }

  // Verificar multiples permisos
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (requireAll) {
      // Requiere todos los permisos
      const hasAll = requiredPermissions.every((p) => hasPermission(p))
      if (!hasAll) {
        return <Navigate to={unauthorizedRedirect} replace />
      }
    } else {
      // Requiere al menos uno
      if (!hasAnyPermission(requiredPermissions)) {
        return <Navigate to={unauthorizedRedirect} replace />
      }
    }
  }

  return children
}

export default ProtectedRoute
