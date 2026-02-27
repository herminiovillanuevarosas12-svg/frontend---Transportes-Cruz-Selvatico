/**
 * PublicLayout - Layout estilo Movil Bus para paginas publicas
 * Navbar blanco, links horizontales, telefono, hamburguesa, footer 5 columnas
 */

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Phone, Menu, MapPin, Mail, MessageCircle, Leaf } from 'lucide-react'
import publicService from '../../services/publicService'
import { MobileMenu } from '../public'
import WhatsAppFloat from '../public/WhatsAppFloat'

const PublicLayout = ({ children }) => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const navLinks = [
    { to: '/destinos', label: 'Destinos' },
    { to: '/encomiendas-info', label: 'Encomiendas' },
    { to: '/tracking', label: 'Rastrea tu envio' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar blanco - estilo Movil Bus */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="/logo.png"
                alt={config.nombreEmpresa}
                className="h-10 lg:h-14 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation - centrado */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname.startsWith(link.to)
                      ? 'text-secondary-600'
                      : 'text-gray-700 hover:text-secondary-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Derecha: Telefono + Hamburguesa */}
            <div className="flex items-center gap-3">
              {config.telefono && (
                <a
                  href={`tel:${config.telefono}`}
                  className="hidden md:flex items-center gap-2 text-gray-700"
                >
                  <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold">{config.telefono}</span>
                </a>
              )}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-secondary-600 transition-colors"
                aria-label="Abrir menu"
              >
                <Menu className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer estilo Movil Bus - 5 columnas */}
      <footer className="bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <div className="mb-5">
                <img
                  src="/logo.png"
                  alt={config.nombreEmpresa}
                  className="h-12 w-auto object-contain brightness-0 invert"
                />
              </div>

              {/* Redes Sociales */}
              {(config.facebookUrl || config.instagramUrl || config.youtubeUrl || config.tiktokUrl) && (
                <div className="flex items-center gap-2 mb-5">
                  {config.facebookUrl && (
                    <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-primary-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                    </a>
                  )}
                  {config.instagramUrl && (
                    <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-primary-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="18" cy="6" r="1.5"/></svg>
                    </a>
                  )}
                  {config.youtubeUrl && (
                    <a href={config.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-primary-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
                    </a>
                  )}
                  {config.tiktokUrl && (
                    <a href={config.tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-primary-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.19 8.19 0 004.77 1.53V6.79a4.85 4.85 0 01-1-.1z"/></svg>
                    </a>
                  )}
                </div>
              )}

              {config.direccion && (
                <p className="text-primary-300 text-sm flex items-start gap-2 mb-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {config.direccion}
                </p>
              )}
              {config.telefono && (
                <p className="text-primary-300 text-sm flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  {config.telefono}
                </p>
              )}
              {config.emailContacto && (
                <p className="text-primary-300 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  {config.emailContacto}
                </p>
              )}
            </div>

            {/* Enlaces col 1 */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Enlaces</h4>
              <ul className="space-y-2.5">
                <li><Link to="/nosotros" className="text-primary-300 hover:text-white transition-colors text-sm">Nosotros</Link></li>
                <li><Link to="/destinos" className="text-primary-300 hover:text-white transition-colors text-sm">Destinos</Link></li>
                <li><Link to="/info-viaje" className="text-primary-300 hover:text-white transition-colors text-sm">Info para tu viaje</Link></li>
                <li><Link to="/preguntas-frecuentes" className="text-primary-300 hover:text-white transition-colors text-sm">Preguntas frecuentes</Link></li>
                <li><Link to="/contacto" className="text-primary-300 hover:text-white transition-colors text-sm">Contacto</Link></li>
              </ul>
            </div>

            {/* Enlaces col 2 */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Servicios</h4>
              <ul className="space-y-2.5">
                <li><Link to="/buscar-pasajes" className="text-primary-300 hover:text-white transition-colors text-sm">Comprar pasajes</Link></li>
                <li><Link to="/encomiendas-info" className="text-primary-300 hover:text-white transition-colors text-sm">Encomiendas</Link></li>
                <li><Link to="/tracking" className="text-primary-300 hover:text-white transition-colors text-sm">Rastrear envio</Link></li>
                <li><Link to="/rutas-info" className="text-primary-300 hover:text-white transition-colors text-sm">Rutas y horarios</Link></li>
              </ul>
            </div>

            {/* Rutas frecuentes col 1 */}
            <div className="hidden lg:block">
              <h4 className="font-semibold text-white mb-4 text-sm">Rutas frecuentes</h4>
              <ul className="space-y-2.5">
                <li><Link to="/buscar-pasajes?destino=Lima" className="text-primary-300 hover:text-white transition-colors text-sm">Pasaje a Lima</Link></li>
                <li><Link to="/buscar-pasajes?destino=Huaraz" className="text-primary-300 hover:text-white transition-colors text-sm">Pasaje a Huaraz</Link></li>
                <li><Link to="/buscar-pasajes?destino=Chiclayo" className="text-primary-300 hover:text-white transition-colors text-sm">Pasaje a Chiclayo</Link></li>
                <li><Link to="/buscar-pasajes?destino=Tarapoto" className="text-primary-300 hover:text-white transition-colors text-sm">Pasaje a Tarapoto</Link></li>
                <li><Link to="/buscar-pasajes?destino=Cajamarca" className="text-primary-300 hover:text-white transition-colors text-sm">Pasaje a Cajamarca</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-primary-700 text-center">
            <p className="text-sm text-primary-400">
              &copy; {new Date().getFullYear()} {config.nombreEmpresa}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        config={config}
      />

      {/* WhatsApp flotante */}
      <WhatsAppFloat whatsapp={config.whatsapp} />
    </div>
  )
}

export default PublicLayout
