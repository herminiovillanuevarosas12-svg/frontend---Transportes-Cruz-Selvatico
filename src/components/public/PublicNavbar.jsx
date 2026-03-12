/**
 * PublicNavbar - Navbar publica con top-bar de redes sociales y efectos de scroll
 * Top-bar verde oscuro (redes + WS + telefono) + navbar principal (logo + links + hamburguesa)
 * Al hacer scroll: top-bar se oculta, navbar se compacta con efecto glass
 */

import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Phone, Menu, MapPin } from 'lucide-react'

const navLinks = [
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/destinos', label: 'Destinos' },
  { to: '/encomiendas-info', label: 'Encomiendas' },
  { to: '/festividades', label: 'Festividades' },
  { to: '/tracking', label: 'Rastrea tu envio' },
]

const SocialIcon = ({ type }) => {
  const icons = {
    facebook: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
      </svg>
    ),
    instagram: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="18" cy="6" r="1.5"/>
      </svg>
    ),
    youtube: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
      </svg>
    ),
    tiktok: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.19 8.19 0 004.77 1.53V6.79a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ),
    whatsapp: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 32 32">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.908 15.908 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.316 22.594c-.39 1.1-1.932 2.014-3.168 2.28-.846.18-1.95.324-5.668-1.218-4.762-1.972-7.826-6.802-8.064-7.114-.23-.312-1.932-2.572-1.932-4.904s1.222-3.478 1.656-3.956c.434-.478.948-.598 1.264-.598.316 0 .632.002.908.016.292.016.684-.11 1.07.816.39.94 1.326 3.234 1.442 3.468.116.234.194.506.038.818-.156.312-.234.506-.468.78-.234.274-.49.612-.702.822-.234.234-.478.488-.206.958.274.468 1.218 2.008 2.614 3.254 1.794 1.6 3.306 2.096 3.774 2.33.468.234.742.194 1.014-.118.274-.312 1.17-1.364 1.482-1.834.312-.468.624-.39 1.054-.234.434.156 2.726 1.286 3.194 1.52.468.234.78.35.896.546.116.194.116 1.132-.274 2.232z"/>
      </svg>
    ),
  }
  return icons[type] || null
}

const PublicNavbar = ({ config = {}, onMenuOpen }) => {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const topBarRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const whatsappNumber = config.whatsapp?.replace(/[^0-9]/g, '') || ''

  const socials = [
    { type: 'facebook', url: config.facebookUrl },
    { type: 'instagram', url: config.instagramUrl },
    { type: 'youtube', url: config.youtubeUrl },
    { type: 'tiktok', url: config.tiktokUrl },
  ].filter(s => s.url)

  const hasTopBar = socials.length > 0 || config.telefono || whatsappNumber

  return (
    <div className="sticky top-0 z-50">
      {/* ===== TOP BAR - Redes sociales, telefono, WS ===== */}
      {hasTopBar && (
        <div
          ref={topBarRef}
          className={`bg-primary-900 text-white overflow-hidden transition-all duration-300 ease-in-out ${
            scrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="hidden md:flex items-center justify-between h-9 text-xs">
              {/* Izquierda: Redes sociales */}
              <div className="flex items-center gap-1">
                {socials.map(({ type, url }) => (
                  <a
                    key={type}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-primary-300 hover:text-white hover:bg-primary-700 transition-all duration-200 hover:scale-110"
                  >
                    <SocialIcon type={type} />
                  </a>
                ))}
                {socials.length > 0 && (config.telefono || whatsappNumber) && (
                  <div className="w-px h-4 bg-primary-700 mx-2" />
                )}
              </div>

              {/* Derecha: Direccion + Telefono + WhatsApp */}
              <div className="flex items-center gap-4">
                {config.direccion && (
                  <span className="hidden lg:flex items-center gap-1.5 text-primary-300">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{config.direccion}</span>
                  </span>
                )}

                {config.direccion && config.telefono && (
                  <div className="hidden lg:block w-px h-4 bg-primary-700" />
                )}

                {config.telefono && (
                  <a
                    href={`tel:${config.telefono}`}
                    className="flex items-center gap-1.5 text-primary-200 hover:text-white transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span className="font-medium">{config.telefono}</span>
                  </a>
                )}

                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center gap-1.5 px-3 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full font-medium transition-all duration-200 hover:scale-105 group"
                  >
                    <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:opacity-0" />
                    <SocialIcon type="whatsapp" />
                    <span className="relative">WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== NAVBAR PRINCIPAL ===== */}
      <header
        className={`bg-white border-b transition-all duration-300 ease-in-out ${
          scrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-md border-gray-200/50'
            : 'border-gray-100 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? 'h-14' : 'h-16 lg:h-20'
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="/logo.png"
                alt={config.nombreEmpresa || 'Logo'}
                className={`w-auto object-contain transition-all duration-300 ${
                  scrolled ? 'h-8 lg:h-10' : 'h-10 lg:h-14'
                }`}
              />
            </Link>

            {/* Desktop Navigation - desplazado a la derecha */}
            <nav className="hidden lg:flex items-center gap-8 ml-auto mr-8">
              {navLinks.map(link => {
                const isActive = location.pathname.startsWith(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="relative text-sm font-medium transition-colors group py-1"
                  >
                    <span className={isActive ? 'text-secondary-600' : 'text-gray-700 group-hover:text-secondary-600'}>
                      {link.label}
                    </span>
                    {/* Animated underline */}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-secondary-500 rounded-full transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                )
              })}
            </nav>

            {/* Derecha: Telefono (solo si topbar oculta) + Hamburguesa */}
            <div className="flex items-center gap-3">
              {/* Telefono aparece en navbar cuando topbar se oculta */}
              {config.telefono && (
                <a
                  href={`tel:${config.telefono}`}
                  className={`hidden md:flex items-center gap-2 text-gray-700 transition-all duration-300 ${
                    scrolled ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none lg:opacity-0'
                  }`}
                >
                  <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold">{config.telefono}</span>
                </a>
              )}

              {/* Hamburguesa */}
              <button
                onClick={onMenuOpen}
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-secondary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 active:scale-95"
                aria-label="Abrir menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

export default PublicNavbar
