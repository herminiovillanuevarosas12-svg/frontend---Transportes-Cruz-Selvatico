/**
 * Landing Page - Estilo MovilBus
 * Navbar blanco propio, hero con banner carousel + buscador flotante,
 * descuentos especiales, encomiendas, experiencia, destinos, footer 5 columnas
 */

import { useState, useEffect, useRef } from 'react'
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

import PublicNavbar from '../components/public/PublicNavbar'
import {
  Bus,
  Package,
  MapPin,
  Search,
  ArrowRight,
  Phone,
  Mail,
  ChevronRight,
  Calendar,
  MapPinned,
  ChevronLeft,
  Tag
} from 'lucide-react'

const LandingPage = () => {
  const navigate = useNavigate()
  const [puntos, setPuntos] = useState([])
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
  const [destinosPublicos, setDestinosPublicos] = useState([])
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

  // Carousel indice para promociones
  const [promoIndex, setPromoIndex] = useState(0)

  // Sticky buscador: aparece cuando el hero sale del viewport
  const heroRef = useRef(null)
  const [stickyBuscador, setStickyBuscador] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const observer = new IntersectionObserver(
      ([entry]) => setStickyBuscador(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  const cargarDatos = async () => {
    try {
      const [puntosRes, bannersRes, galleryRes, configRes, festividadesRes, promoRes, iconosRes, destPubRes] = await Promise.all([
        publicService.getPuntos(),
        publicService.getBanners().catch(() => ({ banners: [] })),
        publicService.getGallery().catch(() => ({ imagenes: [] })),
        publicService.getConfigLanding().catch(() => ({ config: {} })),
        publicService.getFestividades().catch(() => ({ festividades: [] })),
        publicService.getPromociones().catch(() => ({ promociones: [] })),
        publicService.getExperienciaIconos().catch(() => ({ iconos: [] })),
        publicService.getDestinos({ limit: 50 }).catch(() => ({ destinos: [] }))
      ])
      setPuntos(puntosRes.puntos || [])
      setBanners(bannersRes.banners || [])
      setGallery(galleryRes.imagenes || [])
      setFestividades(festividadesRes.festividades || [])
      setPromociones(promoRes.promociones || [])
      setExperienciaIconos(iconosRes.iconos || [])
      setDestinosPublicos(destPubRes.destinos || [])
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

  // Navegacion carousel promociones
  const promoVisible = 3
  const promoMax = Math.max(0, promociones.length - promoVisible)
  const handlePromoLeft = () => setPromoIndex(i => Math.max(0, i - 1))
  const handlePromoRight = () => setPromoIndex(i => Math.min(promoMax, i + 1))

  // Drag para destinos
  const destinoScrollRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragScrollLeft, setDragScrollLeft] = useState(0)

  const handleDragStart = (e) => {
    const el = destinoScrollRef.current
    if (!el) return
    setIsDragging(true)
    setDragStartX(e.pageX || e.touches?.[0]?.pageX || 0)
    setDragScrollLeft(el.scrollLeft)
  }
  const handleDragMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const el = destinoScrollRef.current
    if (!el) return
    const x = e.pageX || e.touches?.[0]?.pageX || 0
    el.scrollLeft = dragScrollLeft - (x - dragStartX)
  }
  const handleDragEnd = () => setIsDragging(false)

  return (
    <div className="min-h-screen bg-white">
      {/* ==================== NAVBAR ==================== */}
      <PublicNavbar
        config={config}
        onMenuOpen={() => setMobileMenuOpen(true)}
      />

      {/* ==================== BARRA STICKY NARANJA (aparece al scrollear) ==================== */}
      <div
        className={`fixed top-14 left-0 right-0 z-40 transition-all duration-300 ${
          stickyBuscador
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <form
          onSubmit={handleBuscarPasajes}
          className="bg-secondary-500 px-4 py-2.5"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <p className="text-white font-bold text-sm whitespace-nowrap flex items-center gap-2">
              <Bus className="w-4 h-4" />
              Compra tu pasaje:
            </p>
            <div className="flex flex-1 items-center gap-2 md:gap-3">
              {/* Origen */}
              <div className="flex-1 relative">
                <label className="absolute -top-2 left-3 text-[10px] text-white/70 font-medium">Origen</label>
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
                  className="w-full px-3 py-2 pt-3 bg-white/15 border border-white/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40 appearance-none cursor-pointer placeholder:text-white/50 [&>option]:text-gray-900"
                >
                  <option value="">Ciudad</option>
                  {ciudadesUnicas.map(ciudad => (
                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                  ))}
                </select>
              </div>
              {/* Destino */}
              <div className="flex-1 relative">
                <label className="absolute -top-2 left-3 text-[10px] text-white/70 font-medium">Destino</label>
                <select
                  value={busqueda.destino}
                  onChange={(e) => setBusqueda(prev => ({ ...prev, destino: e.target.value }))}
                  className="w-full px-3 py-2 pt-3 bg-white/15 border border-white/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40 appearance-none cursor-pointer placeholder:text-white/50 [&>option]:text-gray-900"
                >
                  <option value="">Ciudad</option>
                  {ciudadesUnicas.filter(c => c !== busqueda.origen).map(ciudad => (
                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                  ))}
                </select>
              </div>
              {/* Fecha */}
              <div className="flex-1 relative hidden sm:block">
                <label className="absolute -top-2 left-3 text-[10px] text-white/70 font-medium">Fecha salida</label>
                <input
                  type="date"
                  value={busqueda.fecha}
                  onChange={(e) => setBusqueda(prev => ({ ...prev, fecha: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 pt-3 bg-white/15 border border-white/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer [color-scheme:dark]"
                />
              </div>
              {/* Boton */}
              <button
                type="submit"
                className="px-6 py-2.5 bg-white text-secondary-600 rounded-lg font-bold uppercase text-sm tracking-wide hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 whitespace-nowrap shadow-lg"
              >
                <Search className="w-4 h-4" />
                BUSCAR
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ==================== HERO SECTION ==================== */}
      <section ref={heroRef} className="relative">
        {/* Banner Carrusel */}
        <BannerCarousel
          banners={banners}
          autoPlay={true}
          interval={config.tiempoRotacionBanner * 1000}
          showArrows={true}
          showIndicators={true}
        />

        {/* Buscador de Pasajes - flotante sobre el borde inferior del hero */}
        <div className="absolute bottom-6 md:bottom-8 left-0 right-0 z-20">
          <div className="max-w-5xl mx-auto px-4">
            <form
              onSubmit={handleBuscarPasajes}
              className="bg-white/95 backdrop-blur-md rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] px-5 py-4 md:px-7 md:py-5"
            >
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Bus className="w-4 h-4 text-secondary-500" />
                Compra tu pasaje
              </p>
              <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
                {/* Origen */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Origen</label>
                  <div className="relative">
                    <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-primary-500" />
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
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200/70 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent appearance-none cursor-pointer text-sm transition-all hover:bg-gray-50"
                    >
                      <option value="">Seleccionar ciudad</option>
                      {ciudadesUnicas.map(ciudad => (
                        <option key={ciudad} value={ciudad}>{ciudad}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Destino */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Destino</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary-500" />
                    <select
                      value={busqueda.destino}
                      onChange={(e) => setBusqueda(prev => ({ ...prev, destino: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200/70 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent appearance-none cursor-pointer text-sm transition-all hover:bg-gray-50"
                    >
                      <option value="">Seleccionar ciudad</option>
                      {ciudadesUnicas.filter(c => c !== busqueda.origen).map(ciudad => (
                        <option key={ciudad} value={ciudad}>{ciudad}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fecha */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Fecha de viaje</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="date"
                      value={busqueda.fecha}
                      onChange={(e) => setBusqueda(prev => ({ ...prev, fecha: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200/70 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent cursor-pointer text-sm transition-all hover:bg-gray-50"
                    />
                  </div>
                </div>

                {/* Boton */}
                <div className="md:flex-shrink-0">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-8 py-2.5 bg-secondary-500 text-white rounded-full font-bold uppercase tracking-wide hover:bg-secondary-600 hover:shadow-lg hover:shadow-secondary-500/25 transition-all duration-200 flex items-center justify-center gap-2 text-sm active:scale-[0.97]"
                  >
                    <Search className="w-4 h-4" />
                    BUSCAR
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Espacio mínimo post-hero */}
      <div className="h-4 md:h-6" />

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
        {config.encomiendasLandingImagen ? (
          <img
            src={getUploadUrl(config.encomiendasLandingImagen)}
            alt="Servicio de encomiendas"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900" />
        )}

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
      {destinosPublicos.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="mx-auto px-4 sm:px-8 lg:px-12">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-secondary-500 rounded-full" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Descubre mas destinos
              </h2>
            </div>

            {/* Carousel de destinos - drag + flechas */}
            <div className="relative">
              {destinosPublicos.length > 4 && (
                <>
                  <button
                    onClick={() => {
                      const el = destinoScrollRef.current
                      if (el) el.scrollBy({ left: -(el.offsetWidth / 4), behavior: 'smooth' })
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const el = destinoScrollRef.current
                      if (el) el.scrollBy({ left: el.offsetWidth / 4, behavior: 'smooth' })
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <div
                ref={destinoScrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                {destinosPublicos.map((destino) => {
                  const imgUrl = destino.imagenPath ? getUploadUrl(destino.imagenPath) : null
                  return (
                    <div
                      key={destino.id}
                      className="flex-shrink-0 w-[calc(25%-12px)] min-w-[260px] snap-start group"
                    >
                      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-200">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={destino.nombre}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
                            <MapPin className="w-12 h-12 text-white/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white/70 text-xs mb-0.5">Descubre la magia de</p>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {destino.nombre}
                          </h3>
                          {destino.precioDesde && (
                            <>
                              <p className="text-white/70 text-xs">Pasajes desde:</p>
                              <p className="text-white font-bold text-xl mb-2">
                                S/{Number(destino.precioDesde).toFixed(0)}
                              </p>
                            </>
                          )}
                          <Link
                            to={`/destinos/${destino.slug}`}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-white text-white rounded-full text-xs font-semibold hover:bg-white hover:text-gray-900 transition-colors"
                            onClick={(e) => isDragging && e.preventDefault()}
                          >
                            CONOCE MAS
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
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
          <div className="mx-auto px-4 sm:px-8 lg:px-12">
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
                  <Link
                    key={fest.id}
                    to={`/festividad/${fest.id}`}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-secondary-300 transition-all duration-300"
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
                  </Link>
                )
              })}
            </div>
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

            {/* Destinos */}
            {destinosPublicos.length > 0 && (
              <div className="hidden lg:block">
                <h4 className="font-semibold text-white mb-4 text-sm">Destinos</h4>
                <ul className="space-y-2.5">
                  {destinosPublicos.slice(0, 5).map(dest => (
                    <li key={dest.id}>
                      <Link to={`/destinos/${dest.slug}`} className="text-primary-300 hover:text-white transition-colors text-sm">
                        {dest.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
