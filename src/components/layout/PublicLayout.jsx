/**
 * PublicLayout Component
 * Layout premium para paginas publicas - Cruz Selvatico
 */

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bus, Package, Search, LogIn, Sparkles, MapPin, Phone, Mail, Navigation, ArrowRight, Users, Home, Truck, MessageCircle } from 'lucide-react'

const PublicLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()

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
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2.5 bg-secondary-500 text-white rounded-xl text-sm font-semibold hover:bg-secondary-600 hover:shadow-xl hover:shadow-secondary-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Ingresar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - Cruz Selvatico */}
      <footer className="bg-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-white/95 rounded-xl px-4 py-2">
                  <img
                    src="/logo.png"
                    alt="Transportes Cruz Selvatico"
                    className="h-12 w-auto object-contain"
                  />
                </div>
              </div>
              <p className="text-primary-200 leading-relaxed max-w-sm">
                Conectamos destinos con seguridad, puntualidad y la mejor atencion. Tu confianza es nuestro compromiso.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-secondary-300">
                <div className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse" />
                Sistema operativo 24/7
              </div>
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
                <li className="text-primary-200 flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  +51 999 999 999
                </li>
                <li className="text-primary-200 flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  info@cruzselvatico.com
                </li>
                <li className="text-primary-200 flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  Lima, Peru
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-primary-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-300">
              {new Date().getFullYear()} Transportes Cruz Selvatico. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-primary-400">Hecho con dedicacion para nuestros clientes</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
