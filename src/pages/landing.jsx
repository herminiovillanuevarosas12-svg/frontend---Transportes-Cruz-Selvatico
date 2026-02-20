/**
 * Landing Page - Estilo MovilBus
 * Página principal pública con carrusel de banners, buscador de pasajes,
 * tracking, destinos populares, servicios, beneficios y footer dinámico
 */

import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'
import BannerCarousel from '../components/common/BannerCarousel'
import {
  ExperienceSection,
  GallerySection
} from '../components/landing'
import Modal from '../components/common/Modal'
import {
  Bus,
  Package,
  MapPin,
  Search,
  Shield,
  Clock,
  Users,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  Ticket,
  Navigation,
  Eye,
  Truck,
  ChevronRight,
  Globe,
  Leaf,
  TreePine,
  Calendar,
  MapPinned,
  MessageCircle,
  ChevronLeft
} from 'lucide-react'

const LandingPage = () => {
  const navigate = useNavigate()
  const [rutas, setRutas] = useState([])
  const [puntos, setPuntos] = useState([])
  const [ciudades, setCiudades] = useState({})
  const [banners, setBanners] = useState([])
  const [gallery, setGallery] = useState([])
  const [festividades, setFestividades] = useState([])
  const [config, setConfig] = useState({
    nombreEmpresa: 'Transportes',
    slogan: 'Viaja seguro, envía confiado',
    telefono: '',
    direccion: '',
    emailContacto: '',
    whatsapp: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    tiempoRotacionBanner: 5
  })
  const [serviciosLanding, setServiciosLanding] = useState([])
  const [loading, setLoading] = useState(true)

  // Buscador de pasajes
  const [busqueda, setBusqueda] = useState({
    origen: '',
    destino: '',
    fecha: ''
  })

  // Tracking
  const [codigoTracking, setCodigoTracking] = useState('')

  // Modal festividad
  const [selectedFest, setSelectedFest] = useState(null)
  const [festModalOpen, setFestModalOpen] = useState(false)
  const [currentImgIndex, setCurrentImgIndex] = useState(0)

  const openFestModal = useCallback((fest) => {
    setSelectedFest(fest)
    setCurrentImgIndex(0)
    setFestModalOpen(true)
  }, [])

  const closeFestModal = useCallback(() => {
    setFestModalOpen(false)
    setSelectedFest(null)
    setCurrentImgIndex(0)
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [rutasRes, puntosRes, bannersRes, galleryRes, configRes, festividadesRes, serviciosRes] = await Promise.all([
        publicService.getRutas(),
        publicService.getPuntos(),
        publicService.getBanners().catch(() => ({ banners: [] })),
        publicService.getGallery().catch(() => ({ imagenes: [] })),
        publicService.getConfigLanding().catch(() => ({ config: {} })),
        publicService.getFestividades().catch(() => ({ festividades: [] })),
        publicService.getServiciosLanding().catch(() => ({ servicios: [] }))
      ])
      setRutas(rutasRes.rutas || [])
      setPuntos(puntosRes.puntos || [])
      setCiudades(puntosRes.ciudades || {})
      setBanners(bannersRes.banners || [])
      setGallery(galleryRes.imagenes || [])
      setFestividades(festividadesRes.festividades || [])
      setServiciosLanding(serviciosRes.servicios || [])
      if (configRes.config) {
        setConfig(prev => ({ ...prev, ...configRes.config }))
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Obtener ciudades únicas para los selectores
  const ciudadesUnicas = [...new Set(puntos.map(p => p.ciudad))].sort()

  // Buscar pasajes
  const handleBuscarPasajes = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (busqueda.origen) params.set('origen', busqueda.origen)
    if (busqueda.destino) params.set('destino', busqueda.destino)
    if (busqueda.fecha) params.set('fecha', busqueda.fecha)
    navigate(`/rutas-info?${params.toString()}`)
  }

  // Buscar tracking
  const handleTracking = (e) => {
    e.preventDefault()
    if (codigoTracking.trim()) {
      navigate(`/tracking?codigo=${codigoTracking.trim()}`)
    }
  }

  // Obtener destinos populares (ciudades con más rutas)
  const getDestinosPopulares = () => {
    const conteoDestinos = {}
    rutas.forEach(ruta => {
      const ciudad = ruta.destino?.ciudad
      if (ciudad) {
        conteoDestinos[ciudad] = (conteoDestinos[ciudad] || 0) + 1
      }
    })
    return Object.entries(conteoDestinos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([ciudad, count]) => ({ ciudad, rutas: count }))
  }

  const destinosPopulares = getDestinosPopulares()

  const beneficios = [
    {
      icon: Shield,
      title: 'Seguridad Garantizada',
      description: 'Tus envíos y pasajeros viajan protegidos con nuestro sistema de seguimiento.'
    },
    {
      icon: Clock,
      title: 'Puntualidad',
      description: 'Horarios fijos y salidas a tiempo. Respetamos tu tiempo siempre.'
    },
    {
      icon: Eye,
      title: 'Rastreo en Tiempo Real',
      description: 'Sigue el estado de tu encomienda paso a paso con tracking QR.'
    },
    {
      icon: Globe,
      title: 'Amplia Cobertura',
      description: `Llegamos a ${Object.keys(ciudades).length || 10}+ ciudades del país.`
    }
  ]

  // Mapeo de iconos por clave de servicio
  const servicioIconMap = {
    pasajes: Ticket,
    encomiendas: Package
  }

  // Datos dinámicos de servicios (de la API) con fallback
  const servicios = serviciosLanding.length > 0
    ? serviciosLanding.map((s, index) => ({
        icon: servicioIconMap[s.clave] || Ticket,
        title: s.titulo,
        description: s.descripcion,
        features: s.features ? s.features.split('|') : [],
        cta: s.ctaTexto,
        link: s.ctaLink,
        isPrimary: index === 0
      }))
    : [
        {
          icon: Ticket,
          title: 'Pasajes Interprovinciales',
          description: 'Viaja cómodo y seguro a los mejores destinos con buses modernos.',
          features: ['Asientos reclinables', 'WiFi a bordo', 'Aire acondicionado', 'Servicio a bordo'],
          cta: 'Ver Rutas y Horarios',
          link: '/rutas-info',
          isPrimary: true
        },
        {
          icon: Package,
          title: 'Servicio de Encomiendas',
          description: 'Envía paquetes y documentos con total confianza y seguimiento.',
          features: ['Tracking QR', 'Notificaciones SMS', 'Seguro incluido', 'Entrega garantizada'],
          cta: 'Rastrear Envío',
          link: '/tracking',
          isPrimary: false
        }
      ]

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header - Glass Effect */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary-800/95 backdrop-blur-xl border-b border-primary-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <div className="bg-white rounded-xl px-3 py-1.5 shadow-lg">
                <img
                  src="/logo.png"
                  alt={config.nombreEmpresa}
                  className="h-10 w-auto object-contain"
                />
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1 md:gap-2">
              {/* Enlaces a secciones de la página */}
              <a
                href="#servicios"
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary-100 hover:text-white hover:bg-primary-700/50 transition-all"
              >
                Servicios
              </a>
              <a
                href="#destinos"
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary-100 hover:text-white hover:bg-primary-700/50 transition-all"
              >
                Destinos
              </a>
              <Link
                to="/rutas-info"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary-100 hover:text-white hover:bg-primary-700/50 transition-all"
              >
                <Navigation className="w-4 h-4" />
                Rutas
              </Link>
              <Link
                to="/tracking"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary-100 hover:text-white hover:bg-primary-700/50 transition-all"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Rastrear</span>
              </Link>
              {config.whatsapp && (
                <a
                  href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary-100 hover:text-white hover:bg-primary-700/50 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
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

      {/* Hero Section con Banner Carrusel */}
      <section className="relative pt-16 lg:pt-20">
        {/* Banner Carrusel */}
        <BannerCarousel
          banners={banners}
          autoPlay={true}
          interval={config.tiempoRotacionBanner * 1000}
          showArrows={true}
          showIndicators={true}
        />

        {/* Buscador de Pasajes - Flotante sobre el banner */}
        <div className="absolute bottom-0 left-0 right-0 z-20 transform translate-y-1/2">
          <div className="max-w-5xl mx-auto px-4">
            <form
              onSubmit={handleBuscarPasajes}
              className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 border border-gray-100"
            >
              <div className="grid md:grid-cols-4 gap-4">
                {/* Origen */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Origen</label>
                  <div className="relative">
                    <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
                    <select
                      value={busqueda.origen}
                      onChange={(e) => {
                        const val = e.target.value
                        setBusqueda(prev => ({
                          ...prev,
                          origen: val,
                          destino: prev.destino === val ? '' : prev.destino
                        }))
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="">Seleccionar ciudad</option>
                      {ciudadesUnicas.map(ciudad => (
                        <option key={ciudad} value={ciudad}>{ciudad}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Destino */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Destino</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
                    <select
                      value={busqueda.destino}
                      onChange={(e) => setBusqueda(prev => ({ ...prev, destino: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="">Seleccionar ciudad</option>
                      {ciudadesUnicas.filter(c => c !== busqueda.origen).map(ciudad => (
                        <option key={ciudad} value={ciudad}>{ciudad}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Fecha de viaje</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={busqueda.fecha}
                      onChange={(e) => setBusqueda(prev => ({ ...prev, fecha: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                    />
                  </div>
                </div>

                {/* Botón */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-3 bg-secondary-500 text-white rounded-xl font-semibold hover:bg-secondary-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Buscar Pasajes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Espacio para el buscador flotante */}
      <div className="h-20 md:h-16 bg-primary-50" />

      {/* Tracking de Encomiendas */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-r from-primary-700 to-primary-800 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-white">Rastrea tu Encomienda</h2>
                <p className="text-primary-200 mt-1">Ingresa el código de tracking para conocer el estado de tu envío</p>
              </div>
              <form onSubmit={handleTracking} className="w-full md:w-auto flex gap-2">
                <input
                  type="text"
                  value={codigoTracking}
                  onChange={(e) => setCodigoTracking(e.target.value.toUpperCase())}
                  placeholder="ENC-XXXXXXXX-XXXXX"
                  className="flex-1 md:w-64 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-primary-300 focus:outline-none focus:border-white/40 transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-secondary-500 text-white rounded-xl font-semibold hover:bg-secondary-600 transition-colors flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Rastrear</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Destinos Populares + Festividades */}
      {(destinosPopulares.length > 0 || festividades.length > 0) && (
        <section id="destinos" className="py-16 bg-primary-50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 rounded-full text-white text-sm font-medium mb-4">
                <MapPin className="w-4 h-4" />
                Destinos Populares
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-800">
                ¿A dónde quieres viajar?
              </h2>
            </div>

            {/* Cards de destinos */}
            {destinosPopulares.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {destinosPopulares.map((destino, index) => (
                  <Link
                    key={destino.ciudad}
                    to={`/rutas-info?destino=${destino.ciudad}`}
                    className="group bg-white rounded-2xl p-5 border border-primary-100 hover:border-primary-300 hover:shadow-lg transition-all duration-300 text-center"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/25">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                      {destino.ciudad}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {destino.rutas} {destino.rutas === 1 ? 'ruta' : 'rutas'}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            {/* Festividades de los destinos */}
            {festividades.length > 0 && (
              <div className="mt-12">
                <div className="text-center mb-8">
                  <h3 className="text-xl lg:text-2xl font-bold text-primary-700">
                    Festividades y Eventos en Nuestros Destinos
                  </h3>
                  <p className="text-primary-600 mt-2">
                    Conoce las celebraciones que hacen únicos a estos lugares
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {festividades.map((fest) => {
                    const coverImg = fest.imagenes?.[0]?.imagenPath
                    return (
                      <div
                        key={fest.id}
                        onClick={() => openFestModal(fest)}
                        className="group bg-white rounded-2xl border border-primary-100 overflow-hidden shadow-md hover:shadow-xl hover:border-primary-300 transition-all duration-300 cursor-pointer"
                      >
                        {/* Imagen */}
                        {coverImg ? (
                          <div className="aspect-[16/10] overflow-hidden relative">
                            <img
                              src={getUploadUrl(coverImg)}
                              alt={fest.titulo}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = '/placeholder-banner.jpg'
                              }}
                            />
                            <div className="absolute top-3 left-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-primary-700 rounded-full text-xs font-semibold shadow-sm">
                                <MapPin className="w-3 h-3" />
                                {fest.puntoCiudad}
                              </span>
                            </div>
                            {fest.imagenes?.length > 1 && (
                              <div className="absolute bottom-3 right-3">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white rounded-full text-xs font-medium">
                                  {fest.imagenes.length} fotos
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-[16/10] bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
                            <MapPin className="w-16 h-16 text-primary-300" />
                            <div className="absolute top-3 left-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-primary-700 rounded-full text-xs font-semibold shadow-sm">
                                <MapPin className="w-3 h-3" />
                                {fest.puntoCiudad}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Contenido */}
                        <div className="p-5">
                          <h4 className="text-lg font-bold text-primary-800 mb-2 group-hover:text-primary-600 transition-colors">
                            {fest.titulo}
                          </h4>
                          {fest.descripcion && (
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                              {fest.descripcion}
                            </p>
                          )}
                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-primary-500 font-medium">
                              {fest.puntoNombre}
                            </p>
                            <span className="text-xs text-primary-400 group-hover:text-primary-600 transition-colors">
                              Ver detalle →
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Modal detalle festividad */}
            <Modal
              isOpen={festModalOpen}
              onClose={closeFestModal}
              size="xl"
              bodyClassName="max-h-[80vh] overflow-y-auto"
            >
              {selectedFest && (
                <div className="-mx-6 -mt-6">
                  {/* Carrusel de imágenes */}
                  {selectedFest.imagenes?.length > 0 ? (
                    <div className="relative">
                      <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                        <img
                          src={getUploadUrl(selectedFest.imagenes[currentImgIndex]?.imagenPath)}
                          alt={`${selectedFest.titulo} - Foto ${currentImgIndex + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = '/placeholder-banner.jpg'
                          }}
                        />
                      </div>

                      {/* Flechas de navegación */}
                      {selectedFest.imagenes.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImgIndex(i => i > 0 ? i - 1 : selectedFest.imagenes.length - 1)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setCurrentImgIndex(i => i < selectedFest.imagenes.length - 1 ? i + 1 : 0)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>

                          {/* Indicadores */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                            {selectedFest.imagenes.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentImgIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  idx === currentImgIndex
                                    ? 'bg-white w-6'
                                    : 'bg-white/60 hover:bg-white/80'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Contador */}
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white rounded-full text-xs font-medium">
                              {currentImgIndex + 1} / {selectedFest.imagenes.length}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <MapPin className="w-20 h-20 text-primary-300" />
                    </div>
                  )}

                  {/* Contenido del modal */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold">
                        <MapPin className="w-3 h-3" />
                        {selectedFest.puntoCiudad}
                      </span>
                      <span className="text-sm text-gray-400">
                        {selectedFest.puntoNombre}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-primary-800 mb-4">
                      {selectedFest.titulo}
                    </h2>

                    {selectedFest.descripcion && (
                      <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                        {selectedFest.descripcion}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Modal>
          </div>
        </section>
      )}

      {/* Servicios */}
      <section id="servicios" className="py-20 bg-gradient-to-b from-white to-primary-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500 rounded-full text-white text-sm font-medium mb-4">
              <Truck className="w-4 h-4" />
              Nuestros Servicios
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-800">
              Soluciones de transporte completas
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {servicios.map((servicio, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-3xl ${
                  servicio.isPrimary
                    ? 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800'
                    : 'bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700'
                }`}
              >
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '24px 24px'
                }} />

                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl ${
                  servicio.isPrimary ? 'bg-primary-400/30' : 'bg-secondary-400/30'
                }`} />

                <div className="relative z-10 p-8 lg:p-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                    <servicio.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">
                    {servicio.title}
                  </h3>
                  <p className="text-white/80 mb-6 leading-relaxed">
                    {servicio.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {servicio.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/90 text-sm">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Link
                    to={servicio.link}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors group-hover:shadow-lg"
                  >
                    {servicio.cta}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 rounded-full text-white text-sm font-medium mb-4">
              <CheckCircle2 className="w-4 h-4" />
              ¿Por qué elegirnos?
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-800">
              Beneficios que nos distinguen
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beneficios.map((beneficio, index) => (
              <div
                key={index}
                className="group p-6 bg-white rounded-2xl border-2 border-primary-100 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-200/50 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary-500/30">
                  <beneficio.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-primary-800 mb-2">
                  {beneficio.title}
                </h3>
                <p className="text-primary-600 text-sm leading-relaxed">
                  {beneficio.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Experiencia de Viaje */}
      <ExperienceSection imagenUrl={config.imagenExperiencia ? getUploadUrl(config.imagenExperiencia) : null} config={config} />

      {/* Galería de Imágenes */}
      <GallerySection imagenes={gallery} />

      {/* Rutas Disponibles */}
      {!loading && rutas.length > 0 && (
        <section className="py-20 bg-primary-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500/20 border border-secondary-500/30 rounded-full text-secondary-300 text-sm font-medium mb-4">
                  <Navigation className="w-4 h-4" />
                  Rutas Disponibles
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white">
                  Viaja con nosotros
                </h2>
              </div>
              <Link
                to="/rutas-info"
                className="inline-flex items-center gap-2 text-secondary-300 font-semibold hover:text-secondary-200 transition-colors"
              >
                Ver todas las rutas
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rutas.slice(0, 4).map((ruta) => (
                <Link
                  key={ruta.id}
                  to={`/rutas-info?origen=${ruta.origen?.ciudad}&destino=${ruta.destino?.ciudad}`}
                  className="group p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-secondary-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-secondary-500/20 rounded-xl flex items-center justify-center group-hover:bg-secondary-500/30 transition-colors">
                      <Bus className="w-5 h-5 text-secondary-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{ruta.origen?.ciudad}</p>
                      <p className="text-primary-300 text-sm truncate flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        {ruta.destino?.ciudad}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary-300 font-bold text-lg">S/ {Number(ruta.precioPasaje || 0).toFixed(2)}</p>
                      <p className="text-primary-400 text-xs">{ruta.horarios?.length || 0} salidas diarias</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-primary-400 group-hover:text-secondary-300 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA - Rastrear Encomienda */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-400/30 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Rastrea tu encomienda ahora
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
            Ingresa el código de tracking para conocer el estado actual de tu envío en tiempo real.
          </p>
          <Link
            to="/tracking"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-secondary-600 rounded-xl font-bold hover:bg-gray-100 hover:shadow-2xl transition-all duration-200"
          >
            <Search className="w-5 h-5" />
            Ir a Rastreo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white">
        <div className="bg-secondary-600">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1320 40 1080 0 720 30C360 60 120 20 0 40L0 60Z" fill="#1a472a"/>
          </svg>
        </div>

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
              <h4 className="font-semibold text-white mb-6 flex items-center gap-2">
                <TreePine className="w-4 h-4 text-primary-300" />
                Servicios
              </h4>
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
              © {new Date().getFullYear()} {config.nombreEmpresa}. Todos los derechos reservados.
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

export default LandingPage
