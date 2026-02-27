/**
 * MobileMenu - Menu hamburguesa overlay slide-in desde la derecha
 * Props: isOpen (boolean), onClose (function), config (objeto config landing)
 */

import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  X, Home, Briefcase, MapPin, Package,
  HelpCircle, Info, Phone, Mail, Search
} from 'lucide-react'

const NAV_LINKS = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/nosotros', label: 'Nosotros', icon: Info },
  { to: '/destinos', label: 'Destinos', icon: MapPin },
  { to: '/encomiendas-info', label: 'Encomiendas', icon: Package },
  { to: '/buscar-pasajes', label: 'Buscar Pasajes', icon: Search },
  { to: '/preguntas-frecuentes', label: 'Preguntas Frecuentes', icon: HelpCircle },
  { to: '/info-viaje', label: 'Info para tu Viaje', icon: Briefcase },
  { to: '/contacto', label: 'Contacto', icon: Mail },
  { to: '/tracking', label: 'Rastrear Envio', icon: Package },
]

const MobileMenu = ({ isOpen, onClose, config = {} }) => {
  const location = useLocation()

  // Bloquear scroll del body cuando el menu esta abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header del panel */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-primary-800 rounded-lg px-2 py-1">
              <img
                src="/logo.png"
                alt={config.nombreEmpresa || 'Transportes Cruz Selvatico'}
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Cerrar menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Links de navegacion */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to
              const Icon = link.icon
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Pie del panel: contacto y redes */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          {config.telefono && (
            <a
              href={`tel:${config.telefono}`}
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Phone className="w-4 h-4" />
              {config.telefono}
            </a>
          )}
          {config.emailContacto && (
            <a
              href={`mailto:${config.emailContacto}`}
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {config.emailContacto}
            </a>
          )}

          {/* Redes sociales */}
          {(config.facebookUrl || config.instagramUrl) && (
            <div className="flex items-center gap-3 pt-2">
              {config.facebookUrl && (
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-primary-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
              )}
              {config.instagramUrl && (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-primary-700" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="18" cy="6" r="1.5"/>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MobileMenu
