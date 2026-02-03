/**
 * Rutas Info Page
 * Pagina publica informativa de rutas, horarios y precios
 */

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PublicLayout from '../components/layout/PublicLayout'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'
import {
  Bus,
  MapPin,
  Clock,
  Banknote,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Building2,
  Navigation,
  Sparkles,
  Phone,
  Search
} from 'lucide-react'

const RutasInfoPage = () => {
  const [searchParams] = useSearchParams()
  const [rutas, setRutas] = useState([])
  const [puntos, setPuntos] = useState([])
  const [ciudades, setCiudades] = useState({})
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedRuta, setExpandedRuta] = useState(null)
  const [filtro, setFiltro] = useState('')

  // Filtros desde URL
  const [filtroOrigen, setFiltroOrigen] = useState('')
  const [filtroDestino, setFiltroDestino] = useState('')

  useEffect(() => {
    // Leer parámetros de URL
    const origen = searchParams.get('origen') || ''
    const destino = searchParams.get('destino') || ''

    setFiltroOrigen(origen)
    setFiltroDestino(destino)

    // Si hay filtros de URL, usarlos como filtro de texto también
    if (origen || destino) {
      setFiltro(`${origen} ${destino}`.trim())
    }

    cargarDatos()
  }, [searchParams])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [rutasRes, puntosRes, bannersRes] = await Promise.all([
        publicService.getRutas(),
        publicService.getPuntos(),
        publicService.getBanners()
      ])
      setRutas(rutasRes.rutas || [])
      setPuntos(puntosRes.puntos || [])
      setCiudades(puntosRes.ciudades || {})
      setBanners(bannersRes.banners || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Obtener URL de imagen del banner
  const getBannerImageUrl = () => {
    if (banners.length === 0) return null
    const banner = banners[0]
    const path = banner?.imagenPath || banner?.imagen_path
    if (!path) return null
    // Usar getUploadUrl que maneja tanto URLs de S3 como rutas relativas
    return getUploadUrl(path)
  }

  const bannerImageUrl = getBannerImageUrl()

  const rutasFiltradas = rutas.filter(ruta => {
    // Filtrar por origen y destino de URL
    if (filtroOrigen && ruta.origen?.ciudad?.toLowerCase() !== filtroOrigen.toLowerCase()) {
      return false
    }
    if (filtroDestino && ruta.destino?.ciudad?.toLowerCase() !== filtroDestino.toLowerCase()) {
      return false
    }

    // Filtro de texto libre
    if (!filtro) return true
    const search = filtro.toLowerCase()
    return (
      ruta.origen?.nombre?.toLowerCase().includes(search) ||
      ruta.origen?.ciudad?.toLowerCase().includes(search) ||
      ruta.destino?.nombre?.toLowerCase().includes(search) ||
      ruta.destino?.ciudad?.toLowerCase().includes(search)
    )
  })

  const toggleRuta = (id) => {
    setExpandedRuta(expandedRuta === id ? null : id)
  }

  return (
    <PublicLayout>
      {/* Hero Section - Cruz Selvatico */}
      <div className="relative overflow-hidden">
        {/* Background con imagen del banner o gradiente de respaldo */}
        <div className="absolute inset-0">
          {bannerImageUrl ? (
            <>
              {/* Imagen del banner como fondo */}
              <img
                src={bannerImageUrl}
                alt="Banner"
                className="w-full h-full object-cover"
              />
              {/* Overlay oscuro para legibilidad del texto */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-800/80 to-primary-900/70" />
            </>
          ) : (
            <>
              {/* Gradiente de respaldo si no hay banner */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-800" />
              {/* Pattern de lineas */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `repeating-linear-gradient(
                  90deg,
                  #fff 0px,
                  #fff 1px,
                  transparent 1px,
                  transparent 60px
                ), repeating-linear-gradient(
                  0deg,
                  #fff 0px,
                  #fff 1px,
                  transparent 1px,
                  transparent 60px
                )`
              }} />
            </>
          )}
          {/* Gradiente de acento - Rojo */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary-500/15 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-400/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-12 pb-6 lg:pt-16 lg:pb-8">
          <div className="max-w-3xl">
            {/* Badge - Cruz Selvatico */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500/15 border border-secondary-500/30 rounded-full text-secondary-300 text-sm font-medium mb-4">
              <Navigation className="w-4 h-4" />
              Rutas y Destinos
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Conoce nuestras
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-secondary-500">
                rutas disponibles
              </span>
            </h1>

            <p className="mt-3 text-lg text-primary-200 max-w-xl leading-relaxed">
              Consulta horarios de salida, precios y destinos. Viaja seguro y comodo con nosotros a los principales puntos del pais.
            </p>

            {/* Filtros de búsqueda */}
            <div className="mt-6 max-w-3xl">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Selector Origen */}
                <div>
                  <label className="block text-xs font-medium text-primary-200 mb-1.5">Origen</label>
                  <select
                    value={filtroOrigen}
                    onChange={(e) => setFiltroOrigen(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="text-gray-900">Todas las ciudades</option>
                    {Object.keys(ciudades).map(ciudad => (
                      <option key={ciudad} value={ciudad} className="text-gray-900">{ciudad}</option>
                    ))}
                  </select>
                </div>

                {/* Selector Destino */}
                <div>
                  <label className="block text-xs font-medium text-primary-200 mb-1.5">Destino</label>
                  <select
                    value={filtroDestino}
                    onChange={(e) => setFiltroDestino(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="text-gray-900">Todas las ciudades</option>
                    {Object.keys(ciudades).map(ciudad => (
                      <option key={ciudad} value={ciudad} className="text-gray-900">{ciudad}</option>
                    ))}
                  </select>
                </div>

                {/* Búsqueda libre */}
                <div>
                  <label className="block text-xs font-medium text-primary-200 mb-1.5">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-300" />
                    <input
                      type="text"
                      value={filtro}
                      onChange={(e) => setFiltro(e.target.value)}
                      placeholder="Terminal..."
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Botón limpiar filtros */}
              {(filtroOrigen || filtroDestino || filtro) && (
                <button
                  onClick={() => {
                    setFiltroOrigen('')
                    setFiltroDestino('')
                    setFiltro('')
                  }}
                  className="mt-4 text-sm text-secondary-300 hover:text-secondary-200 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Stats - Cruz Selvatico */}
            <div className="mt-6 flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary-500/15 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-secondary-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{Object.keys(ciudades).length}</p>
                  <p className="text-sm text-primary-300">Ciudades</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{rutas.length}</p>
                  <p className="text-sm text-primary-300">Rutas activas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-200" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{puntos.length}</p>
                  <p className="text-sm text-primary-300">Terminales</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rutas Section - Cruz Selvatico */}
      <div className="bg-primary-50/30 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Todas nuestras rutas
              </h2>
              <p className="mt-2 text-gray-500">
                Selecciona una ruta para ver horarios y detalles
              </p>
            </div>
            <p className="text-sm text-gray-400">
              {rutasFiltradas.length} {rutasFiltradas.length === 1 ? 'ruta encontrada' : 'rutas encontradas'}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-5 bg-slate-200 rounded w-48 mb-2" />
                      <div className="h-4 bg-slate-100 rounded w-32" />
                    </div>
                    <div className="h-8 bg-slate-200 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rutas List */}
          {!loading && (
            <div className="grid gap-4">
              {rutasFiltradas.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No se encontraron rutas
                  </h3>
                  <p className="text-slate-500">
                    Intenta con otro termino de busqueda
                  </p>
                </div>
              ) : (
                rutasFiltradas.map((ruta) => (
                  <div
                    key={ruta.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Ruta Header */}
                    <button
                      onClick={() => toggleRuta(ruta.id)}
                      className="w-full p-6 flex items-center gap-4 text-left"
                    >
                      {/* Icon */}
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/25">
                        <Bus className="w-6 h-6 text-white" />
                      </div>

                      {/* Route Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900">
                            {ruta.origen?.nombre}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-900">
                            {ruta.destino?.nombre}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {ruta.origen?.ciudad} - {ruta.destino?.ciudad}
                        </p>
                      </div>

                      {/* Price & Expand */}
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-2xl font-bold text-secondary-600">
                            S/ {Number(ruta.precioPasaje || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-400">por pasaje</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${expandedRuta === ruta.id ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                          {expandedRuta === ruta.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {expandedRuta === ruta.id && (
                      <div className="px-6 pb-6 border-t border-slate-100 animate-fade-in">
                        <div className="pt-6 grid md:grid-cols-3 gap-6">
                          {/* Horarios */}
                          <div className="md:col-span-2">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                              <Clock className="w-4 h-4 text-primary-500" />
                              Horarios de Salida
                            </h4>
                            {ruta.horarios?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {ruta.horarios.map((horario) => (
                                  <div
                                    key={horario.id}
                                    className="px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                                  >
                                    <span className="text-slate-700 font-medium text-sm">{horario.hora}</span>
                                    {horario.capacidadTotal && (
                                      <span className="ml-2 text-xs text-slate-400">({horario.capacidadTotal} asientos)</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 text-sm">
                                Consulte horarios disponibles
                              </p>
                            )}
                          </div>

                          {/* Detalles */}
                          <div className="space-y-4">
                            <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-100">
                              <div className="flex items-center gap-3">
                                <Banknote className="w-5 h-5 text-secondary-600" />
                                <div>
                                  <p className="text-xs text-secondary-600 font-medium">Precio del pasaje</p>
                                  <p className="text-xl font-bold text-secondary-700">S/ {Number(ruta.precioPasaje || 0).toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Terminales */}
                        <div className="mt-6 pt-6 border-t border-slate-100">
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Origen */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Terminal Origen</p>
                              <p className="font-semibold text-slate-900">{ruta.origen?.nombre}</p>
                              {ruta.origen?.direccion && (
                                <p className="text-sm text-slate-500 mt-1 flex items-start gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                  {ruta.origen.direccion}
                                </p>
                              )}
                            </div>
                            {/* Destino */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Terminal Destino</p>
                              <p className="font-semibold text-slate-900">{ruta.destino?.nombre}</p>
                              {ruta.destino?.direccion && (
                                <p className="text-sm text-slate-500 mt-1 flex items-start gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                  {ruta.destino.direccion}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cobertura Section */}
      <div className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Nuestra cobertura
            </h2>
            <p className="mt-2 text-slate-500">
              Llegamos a las principales ciudades y terminales
            </p>
          </div>

          {/* Ciudades Grid */}
          {!loading && Object.keys(ciudades).length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(ciudades).map(([ciudad, terminales]) => (
                <div
                  key={ciudad}
                  className="group p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <MapPin className="w-5 h-5 text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                        {ciudad}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {terminales.length} {terminales.length === 1 ? 'terminal' : 'terminales'}
                      </p>
                      <div className="mt-3 space-y-1">
                        {terminales.map((terminal) => (
                          <p key={terminal.id} className="text-xs text-slate-400 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3" />
                            {terminal.nombre}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section - Cruz Selvatico */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-700 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500/15 border border-secondary-500/25 rounded-full text-secondary-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Servicio de encomiendas
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Envia tus paquetes con nosotros
          </h2>
          <p className="mt-4 text-lg text-primary-200 max-w-xl mx-auto">
            Servicio de encomiendas seguro y confiable. Rastrea tu envio en tiempo real.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tracking"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-secondary-500 text-white rounded-xl font-semibold hover:bg-secondary-600 transition-colors"
            >
              <Search className="w-5 h-5" />
              Rastrear Encomienda
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Contactanos
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

export default RutasInfoPage
