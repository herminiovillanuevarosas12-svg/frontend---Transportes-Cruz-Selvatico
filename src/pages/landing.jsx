/**
 * Landing Page - Estilo MovilBus
 * Navbar blanco propio, hero con banner carousel + buscador flotante,
 * descuentos especiales, encomiendas, experiencia, destinos, footer 5 columnas
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'
import BannerCarousel from '../components/common/BannerCarousel'
import {
  ExperienceSection,
  GallerySection
} from '../components/landing'
import { MobileMenu } from '../components/public'
import WhatsAppFloat from '../components/public/WhatsAppFloat'
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
  ChevronLeft,
  Home,
  Menu,
  Tag,
  Percent
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
    slogan: 'Viaja seguro, envia confiado',
    telefono: '',
    direccion: '',
    emailContacto: '',
    whatsapp: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    tiempoRotacionBanner: 5
  })
  const [experienciaIconos, setExperienciaIconos] = useState([])
  const [promociones, setPromociones] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  // Carousel indices para promociones y destinos
  const [promoIndex, setPromoIndex] = useState(0)
  const [destinoIndex, setDestinoIndex] = useState(0)

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
      const [rutasRes, puntosRes, bannersRes, galleryRes, configRes, festividadesRes, promoRes, iconosRes] = await Promise.all([
        publicService.getRutas(),
        publicService.getPuntos(),
        publicService.getBanners().catch(() => ({ banners: [] })),
        publicService.getGallery().catch(() => ({ imagenes: [] })),
        publicService.getConfigLanding().catch(() => ({ config: {} })),
        publicService.getFestividades().catch(() => ({ festividades: [] })),
        publicService.getPromociones().catch(() => ({ promociones: [] })),
        publicService.getExperienciaIconos().catch(() => ({ iconos: [] }))
      ])
      setRutas(rutasRes.rutas || [])
      setPuntos(puntosRes.puntos || [])
      setCiudades(puntosRes.ciudades || {})
      setBanners(bannersRes.banners || [])
      setGallery(galleryRes.imagenes || [])
      setFestividades(festividadesRes.festividades || [])
      setPromociones(promoRes.promociones || [])
      setExperienciaIconos(iconosRes.iconos || [])
      if (configRes.config) {
        setConfig(prev => ({ ...prev, ...configRes.config }))
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Obtener ciudades unicas para los selectores
  const ciudadesUnicas = [...new Set(puntos.map(p => p.ciudad))].sort()

  // Buscar pasajes
  const handleBuscarPasajes = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (busqueda.origen) params.set('origen', busqueda.origen)
    if (busqueda.destino) params.set('destino', busqueda.destino)
    if (busqueda.fecha) params.set('fecha', busqueda.fecha)
    navigate(`/buscar-pasajes?${params.toString()}`)
  }

  // Buscar tracking
  const handleTracking = (e) => {
    e.preventDefault()
    if (codigoTracking.trim()) {
      navigate(`/tracking?codigo=${codigoTracking.trim()}`)
    }
  }

  // Obtener destinos populares (ciudades con mas rutas)
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
      .slice(0, 8)
      .map(([ciudad, count]) => {
        const rutaEjemplo = rutas.find(r => r.destino?.ciudad === ciudad)
        return {
          ciudad,
          rutas: count,
          precio: rutaEjemplo ? Number(rutaEjemplo.precioPasaje || 0).toFixed(0) : null
        }
      })
  }

  const destinosPopulares = getDestinosPopulares()

  // Navegacion carousel promociones
  const promoVisible = 3
  const promoMax = Math.max(0, promociones.length - promoVisible)
  const handlePromoLeft = () => setPromoIndex(i => Math.max(0, i - 1))
  const handlePromoRight = () => setPromoIndex(i => Math.min(promoMax, i + 1))

  // Navegacion carousel destinos
  const destinoVisible = 4
  const destinoMax = Math.max(0, destinosPopulares.length - destinoVisible)
  const handleDestinoLeft = () => setDestinoIndex(i => Math.max(0, i - 1))
  const handleDestinoRight = () => setDestinoIndex(i => Math.min(destinoMax, i + 1))

  // Imagenes placeholder para destinos
  const destinoImages = [
    'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1531968455001-5c5272a67c71?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1591017403286-fd8493524e1e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop'
  ]

  const navLinks = [
    { to: '/destinos', label: 'Destinos' },
    { to: '/encomiendas-info', label: 'Encomiendas' },
    { to: '/tracking', label: 'Rastrea tu envio' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ==================== NAVBAR ==================== */}
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
                  className="text-sm font-medium text-gray-700 hover:text-secondary-600 transition-colors"
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

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative">
        {/* Banner Carrusel */}
        <BannerCarousel
          banners={banners}
          autoPlay={true}
          interval={config.tiempoRotacionBanner * 1000}
          showArrows={true}
          showIndicators={true}
        />

        {/* Buscador de Pasajes - Card flotante al fondo del hero */}
        <div className="absolute bottom-0 left-0 right-0 z-20 transform translate-y-1/2">
          <div className="max-w-5xl mx-auto px-4">
            <form
              onSubmit={handleBuscarPasajes}
              className="bg-white rounded-2xl shadow-2xl p-5 md:p-6 border border-gray-100"
            >
              <p className="text-sm font-semibold text-gray-700 mb-3">Compra tu pasaje:</p>
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
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent appearance-none cursor-pointer text-sm"
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
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent appearance-none cursor-pointer text-sm"
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
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent cursor-pointer text-sm"
                    />
                  </div>
                </div>

                {/* Boton */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-3 bg-secondary-500 text-white rounded-xl font-bold uppercase tracking-wide hover:bg-secondary-600 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Search className="w-5 h-5" />
                    BUSCAR
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Espacio para el buscador flotante */}
      <div className="h-24 md:h-20" />

      {/* ==================== DESCUENTOS ESPECIALES ==================== */}
      {promociones.length > 0 && (
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header con titulo + flechas */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-secondary-500 rounded-full" />
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Descuentos especiales
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePromoLeft}
                  disabled={promoIndex === 0}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handlePromoRight}
                  disabled={promoIndex >= promoMax}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Carousel de promociones */}
            <div className="overflow-hidden">
              <div
                className="flex gap-6 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${promoIndex * (100 / promoVisible)}%)` }}
              >
                {promociones.map((promo) => (
                  <div
                    key={promo.id}
                    className="min-w-[calc(33.333%-16px)] flex-shrink-0 group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
                    style={{ minWidth: `calc(${100 / promoVisible}% - 16px)` }}
                  >
                    {promo.imagenPath ? (
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img
                          src={getUploadUrl(promo.imagenPath)}
                          alt={promo.titulo}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = '/placeholder-banner.jpg'
                          }}
                        />
                        {promo.porcentajeDescuento && (
                          <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary-500 text-white rounded-lg text-sm font-bold shadow-lg">
                              -{promo.porcentajeDescuento}%
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center relative">
                        <Tag className="w-16 h-16 text-white/30" />
                        {promo.porcentajeDescuento && (
                          <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-secondary-600 rounded-lg text-sm font-bold shadow-lg">
                              -{promo.porcentajeDescuento}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-secondary-600 transition-colors line-clamp-2">
                        {promo.titulo}
                      </h3>
                      {promo.urlDestino && (
                        <Link
                          to={promo.urlDestino}
                          className="mt-2 inline-flex items-center gap-1 text-sm text-secondary-600 font-medium hover:text-secondary-700 transition-colors"
                        >
                          Ver oferta <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== SECCION ENCOMIENDAS ==================== */}
      <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
        {/* Imagen de fondo full-width */}
        <img
          src={config.encomiendasLandingImagen ? getUploadUrl(config.encomiendasLandingImagen) : 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1600&h=700&fit=crop'}
          alt="Servicio de encomiendas"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay oscuro gradiente */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />

        {/* Contenido superpuesto */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white/80 text-xs font-medium mb-6 backdrop-blur-sm">
                <Package className="w-3.5 h-3.5" />
                Servicio de encomiendas
              </div>
              <h2 className="text-3xl lg:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {config.encomiendasLandingTitulo || 'Envia sobres, paqueteria y encomiendas'}
              </h2>
              <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-lg">
                {config.encomiendasLandingDescripcion || 'Confia tus paquetes y documentos con nosotros. Seguimiento en tiempo real, notificaciones y cobertura a todas nuestras rutas.'}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/tracking"
                  className="inline-flex items-center gap-2 px-7 py-3 border-2 border-white text-white rounded-lg font-bold uppercase text-sm tracking-wide hover:bg-white hover:text-primary-800 transition-all duration-300"
                >
                  <Search className="w-4 h-4" />
                  RASTREAR ENVIO
                </Link>
                <Link
                  to="/encomiendas-info"
                  className="inline-flex items-center gap-2 px-7 py-3 border-2 border-white/50 text-white/90 rounded-lg font-bold uppercase text-sm tracking-wide hover:bg-white hover:text-primary-800 transition-all duration-300"
                >
                  VER MAS
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== EXPERIENCIA + GALERIA ==================== */}
      <ExperienceSection
        imagenUrl={config.imagenFondoExperiencia ? getUploadUrl(config.imagenFondoExperiencia) : null}
        config={config}
        iconos={experienciaIconos}
      />
      <GallerySection imagenes={gallery} />

      {/* ==================== DESTINOS POPULARES ==================== */}
      {destinosPopulares.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header con titulo + flechas */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-secondary-500 rounded-full" />
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Descubre mas destinos
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDestinoLeft}
                  disabled={destinoIndex === 0}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDestinoRight}
                  disabled={destinoIndex >= destinoMax}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Carousel de destinos */}
            <div className="overflow-hidden">
              <div
                className="flex gap-5 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${destinoIndex * (100 / destinoVisible)}%)` }}
              >
                {destinosPopulares.map((destino, index) => (
                  <div
                    key={destino.ciudad}
                    className="flex-shrink-0 group"
                    style={{ minWidth: `calc(${100 / destinoVisible}% - 15px)` }}
                  >
                    <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-gray-200">
                      {/* Imagen de fondo */}
                      <img
                        src={destinoImages[index % destinoImages.length]}
                        alt={destino.ciudad}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Gradiente oscuro */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* Contenido sobre la imagen */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {destino.ciudad}
                        </h3>
                        {destino.precio && (
                          <p className="text-secondary-300 font-bold text-lg mb-3">
                            S/{destino.precio}
                          </p>
                        )}
                        <Link
                          to={`/buscar-pasajes?destino=${destino.ciudad}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary-500 text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-secondary-600 transition-colors"
                        >
                          CONOCE MAS
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Boton ver todos */}
            <div className="text-center mt-10">
              <Link
                to="/destinos"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-secondary-500 text-white rounded-xl font-bold uppercase text-sm tracking-wide hover:bg-secondary-600 transition-colors shadow-lg shadow-secondary-500/25"
              >
                VER TODOS LOS DESTINOS
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ==================== FESTIVIDADES ==================== */}
      {festividades.length > 0 && (
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-primary-600 rounded-full" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Festividades y eventos
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {festividades.map((fest) => {
                const coverImg = fest.imagenes?.[0]?.imagenPath
                return (
                  <div
                    key={fest.id}
                    onClick={() => openFestModal(fest)}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-secondary-300 transition-all duration-300 cursor-pointer"
                  >
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
                    <div className="p-5">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-secondary-600 transition-colors">
                        {fest.titulo}
                      </h4>
                      {fest.descripcion && (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                          {fest.descripcion}
                        </p>
                      )}
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-primary-600 font-medium">
                          {fest.puntoNombre}
                        </p>
                        <span className="text-xs text-secondary-500 group-hover:text-secondary-600 font-medium transition-colors">
                          Ver detalle &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal detalle festividad */}
            <Modal
              isOpen={festModalOpen}
              onClose={closeFestModal}
              size="xl"
              bodyClassName="max-h-[80vh] overflow-y-auto"
            >
              {selectedFest && (
                <div className="-mx-6 -mt-6">
                  {/* Carrusel de imagenes */}
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

                      {/* Flechas de navegacion */}
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

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
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

      {/* ==================== FOOTER 5 COLUMNAS ==================== */}
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

            {/* Enlaces */}
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

            {/* Servicios */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Servicios</h4>
              <ul className="space-y-2.5">
                <li><Link to="/buscar-pasajes" className="text-primary-300 hover:text-white transition-colors text-sm">Comprar pasajes</Link></li>
                <li><Link to="/encomiendas-info" className="text-primary-300 hover:text-white transition-colors text-sm">Encomiendas</Link></li>
                <li><Link to="/tracking" className="text-primary-300 hover:text-white transition-colors text-sm">Rastrear envio</Link></li>
                <li><Link to="/rutas-info" className="text-primary-300 hover:text-white transition-colors text-sm">Rutas y horarios</Link></li>
              </ul>
            </div>

            {/* Rutas frecuentes */}
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

          {/* Copyright */}
          <div className="mt-10 pt-6 border-t border-primary-700 text-center">
            <p className="text-sm text-primary-400">
              &copy; {new Date().getFullYear()} {config.nombreEmpresa}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* ==================== MOBILE MENU ==================== */}
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

export default LandingPage
