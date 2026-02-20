/**
 * PublicLayout Component
 * Layout premium para paginas publicas - Cruz Selvatico
 */

import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bus, Package, Search, LogIn, Sparkles, MapPin, Phone, Mail, Navigation, ArrowRight, Users, Home, Truck, MessageCircle, Leaf } from 'lucide-react'
import publicService from '../../services/publicService'

const PublicLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [config, setConfig] = useState({
    nombreEmpresa: 'Transportes Cruz Selvatico',
    slogan: '',
    telefono: '',
    direccion: '',
    emailContacto: '',
    whatsapp: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: ''
  })

  useEffect(() => {
    publicService.getConfigLanding()
      .then(res => {
        if (res.config) setConfig(prev => ({ ...prev, ...res.config }))
      })
      .catch(() => {})
  }, [])

  // Navegar a sección de la landing
  const handleNavToSection = (sectionId) => {
    if (location.pathname === '/') {
      // Ya estamos en la landing, solo hacer scroll
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Navegar a la landing con hash
      navigate(`/#${sectionId}`)
      // Esperar a que cargue y hacer scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header - Glass Effect - Cruz Selvatico */}
      <header className="sticky top-0 z-50 bg-primary-800/95 backdrop-blur-xl border-b border-primary-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo - Cruz Selvatico */}
            <Link to="/" className="flex items-center group">
              <div className="bg-white rounded-xl px-3 py-1.5 shadow-lg">
                <img
                  src="/logo.png"
                  alt="Transportes Cruz Selvatico"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </Link>

            {/* Navigation - Cruz Selvatico */}
            <nav className="flex items-center gap-1 md:gap-2">
              {/* Enlace a Inicio */}
              <Link
                to="/"
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary-100 hover:text-white hover:bg-primary-700/50 transition-all"
              >
                <Home className="w-4 h-4" />
                Inicio
              </Link>
              {/* Enlace a Servicios en landing */}
              <button
                onClick={() => handleNavToSection('servicios')}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary-100 hover:text-white hover:bg-primary-700/50 transition-all"
              >
                Servicios
              </button>
              {/* Enlace a Destinos en landing */}
              <button
                onClick={() => handleNavToSection('destinos')}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary-100 hover:text-white hover:bg-primary-700/50 transition-all"
              >
                Destinos
              </button>
              <Link
                to="/rutas-info"
                className={`
                  hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${location.pathname === '/rutas-info'
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:text-white hover:bg-primary-700/50'
                  }
                `}
              >
                <Navigation className="w-4 h-4" />
                Rutas
              </Link>
              <Link
                to="/tracking"
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${location.pathname.includes('/tracking')
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:text-white hover:bg-primary-700/50'
                  }
                `}
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Rastrear</span>
              </Link>
              {/* Botón de login oculto - acceso solo por /login directo
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2.5 bg-secondary-500 text-white rounded-xl text-sm font-semibold hover:bg-secondary-600 hover:shadow-xl hover:shadow-secondary-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Ingresar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              */}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - Cruz Selvatico */}
      <footer className="bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-white rounded-xl px-4 py-2">
                  <img
                    src="/logo.png"
                    alt={config.nombreEmpresa}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              </div>
              <p className="text-primary-200 leading-relaxed max-w-sm">
                {config.slogan || 'Conectamos destinos con seguridad, puntualidad y la mejor atención. Tu confianza es nuestro compromiso.'}
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-secondary-300">
                <div className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse" />
                Sistema operativo 24/7
              </div>

              {/* Redes Sociales */}
              {(config.facebookUrl || config.instagramUrl || config.youtubeUrl || config.tiktokUrl) && (
                <div className="mt-6 flex items-center gap-3">
                  {config.facebookUrl && (
                    <a
                      href={config.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                      </svg>
                    </a>
                  )}
                  {config.instagramUrl && (
                    <a
                      href={config.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="18" cy="6" r="1.5"/>
                      </svg>
                    </a>
                  )}
                  {config.youtubeUrl && (
                    <a
                      href={config.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
                      </svg>
                    </a>
                  )}
                  {config.tiktokUrl && (
                    <a
                      href={config.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.19 8.19 0 004.77 1.53V6.79a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-6">Servicios</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/rutas-info" className="text-primary-200 hover:text-white transition-colors flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Rutas y Horarios
                  </Link>
                </li>
                <li>
                  <Link to="/tracking" className="text-primary-200 hover:text-white transition-colors flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Rastrear Encomienda
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-primary-200 hover:text-white transition-colors flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Acceso al Sistema
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-6">Contacto</h4>
              <ul className="space-y-4">
                {config.telefono && (
                  <li className="text-primary-200 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    {config.telefono}
                  </li>
                )}
                {config.whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-200 hover:text-white flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      WhatsApp
                    </a>
                  </li>
                )}
                {config.emailContacto && (
                  <li className="text-primary-200 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    {config.emailContacto}
                  </li>
                )}
                {config.direccion && (
                  <li className="text-primary-200 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    {config.direccion}
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-primary-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-300">
              &copy; {new Date().getFullYear()} {config.nombreEmpresa}. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary-400">
              <Leaf className="w-4 h-4" />
              Conectando destinos con confianza
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
