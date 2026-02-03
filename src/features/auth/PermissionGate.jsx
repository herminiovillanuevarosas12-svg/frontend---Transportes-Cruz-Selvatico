/**
 * PermissionGate Component
 * Componente para renderizar condicionalmente segun permisos
 */

import { useAuthStore } from './authStore'

const PermissionGate = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null
}) => {
  const { hasPermission, hasAnyPermission } = useAuthStore()

  // Verificar permiso unico
  if (permission) {
    if (!hasPermission(permission)) {
      return fallback
    }
    return children
  }

  // Verificar multiples permisos
  if (permissions && permissions.length > 0) {
    if (requireAll) {
      // Requiere todos los permisos
      const hasAll = permissions.every((p) => hasPermission(p))
      if (!hasAll) {
        return fallback
      }
    } else {
      // Requiere al menos uno
      if (!hasAnyPermission(permissions)) {
        return fallback
      }
    }
  }

  return children
}

export default PermissionGate
