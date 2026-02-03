/**
 * Header Component
 * Header premium del panel con info del usuario
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/authStore'
import {
  Menu,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
  MapPin,
  User,
  Shield,
  Sparkles
} from 'lucide-react'

const Header = ({ onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  // Cerrar menu al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getRolLabel = (rol) => {
    const roles = {
      'SUPER_ADMIN': 'Super Administrador',
      'ADMINISTRADOR': 'Administrador',
      'PUNTO_VENTA': 'Punto de Venta',
      'ALMACEN': 'Almacen'
    }
    return roles[rol] || rol
  }

  const getRolColor = (rol) => {
    const colors = {
      'SUPER_ADMIN': 'bg-gradient-to-br from-primary-500 to-primary-700',
      'ADMINISTRADOR': 'bg-gradient-to-br from-primary-400 to-primary-600',
      'PUNTO_VENTA': 'bg-gradient-to-br from-primary-500 to-primary-700',
      'ALMACEN': 'bg-gradient-to-br from-secondary-400 to-secondary-600'
    }
    return colors[rol] || 'bg-gradient-to-br from-gray-500 to-gray-700'
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Menu button for mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Punto info */}
          {user?.punto && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <MapPin className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-700">{user.punto.nombre}</span>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95 group">
            <Bell className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
            {/* Notification dot */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-error-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-gray-200 mx-2" />

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`
                flex items-center gap-3 p-2 rounded-xl transition-all duration-200
                ${showUserMenu ? 'bg-gray-100' : 'hover:bg-gray-50'}
              `}
            >
              {/* Avatar */}
              <div className={`
                relative w-9 h-9 rounded-xl ${getRolColor(user?.rol)}
                flex items-center justify-center shadow-lg
              `}>
                <span className="text-white text-sm font-semibold">
                  {getInitials(user?.nombres)}
                </span>
                {user?.rol === 'SUPER_ADMIN' && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-secondary-500 rounded-full flex items-center justify-center ring-2 ring-white">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>

              {/* User info - Desktop */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                  {user?.nombres || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {getRolLabel(user?.rol)}
                </p>
              </div>

              <ChevronDown className={`
                w-4 h-4 text-gray-400 transition-transform duration-200
                ${showUserMenu ? 'rotate-180' : ''}
              `} />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="
                absolute right-0 mt-2 w-64
                bg-white rounded-2xl shadow-xl border border-gray-100
                py-2 z-50
                animate-fade-in-down
              ">
                {/* User info card */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-12 h-12 rounded-xl ${getRolColor(user?.rol)}
                      flex items-center justify-center shadow-lg
                    `}>
                      <span className="text-white text-lg font-semibold">
                        {getInitials(user?.nombres)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user?.nombres}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.correo}</p>
                    </div>
                  </div>
                  <div className="mt-3 px-2 py-1.5 bg-primary-50 rounded-lg">
                    <p className="text-xs font-medium text-primary-700 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      {getRolLabel(user?.rol)}
                    </p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      navigate('/configuracion')
                    }}
                    className="
                      flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700
                      hover:bg-gray-50 transition-colors
                    "
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-gray-500" />
                    </div>
                    <span>Configuracion</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="
                      flex items-center gap-3 w-full px-4 py-2.5 text-sm text-error-600
                      hover:bg-error-50 transition-colors
                    "
                  >
                    <div className="w-8 h-8 rounded-lg bg-error-100 flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-error-600" />
                    </div>
                    <span className="font-medium">Cerrar Sesion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
