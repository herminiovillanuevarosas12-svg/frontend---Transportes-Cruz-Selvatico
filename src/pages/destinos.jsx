/**
 * Destinos - Pagina publica
 * Muestra destinos derivados de rutas configuradas + festividades
 * Ruta: /destinos
 */

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'
import { PageHeroBanner } from '../components/public'
import PublicLayout from '../components/layout/PublicLayout'
import Modal from '../components/common/Modal'
import {
  MapPin,
  Bus,
  ArrowRight,
  Loader2,
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
  Banknote
} from 'lucide-react'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&h=400&fit=crop'

const Destinos = () => {
  const [rutas, setRutas] = useState([])
  const [ciudades, setCiudades] = useState({})
  const [festividades, setFestividades] = useState([])
  const [destinosImagenes, setDestinosImagenes] = useState([])
  const [bannerDestinos, setBannerDestinos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

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
      setLoading(true)
      const [rutasRes, puntosRes, festRes, imgRes, bannerRes] = await Promise.all([
        publicService.getRutas(),
        publicService.getPuntos(),
        publicService.getFestividades().catch(() => ({ festividades: [] })),
        publicService.getDestinosImagenes().catch(() => ({ imagenes: [] })),
        publicService.getDestinosBanner().catch(() => ({ banner: null }))
      ])
      setRutas(rutasRes.rutas || [])
      setCiudades(puntosRes.ciudades || {})
      setFestividades(festRes.festividades || [])
      setDestinosImagenes(imgRes.imagenes || [])
      setBannerDestinos(bannerRes.banner || null)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Derivar destinos de las rutas configuradas
  const getDestinos = () => {
    const destinoMap = {}
    rutas.forEach(ruta => {
      const ciudad = ruta.destino?.ciudad
      if (!ciudad) return
      if (!destinoMap[ciudad]) {
        destinoMap[ciudad] = {
          ciudad,
          rutas: 0,
          precioMin: Infinity,
          terminales: new Set()
        }
      }
      destinoMap[ciudad].rutas += 1
      const precio = Number(ruta.precioPasaje || 0)
      if (precio > 0 && precio < destinoMap[ciudad].precioMin) {
        destinoMap[ciudad].precioMin = precio
      }
      if (ruta.destino?.nombre) {
        destinoMap[ciudad].terminales.add(ruta.destino.nombre)
      }
    })
    // Tambien agregar ciudades de origen
    rutas.forEach(ruta => {
      const ciudad = ruta.origen?.ciudad
      if (!ciudad || destinoMap[ciudad]) return
      destinoMap[ciudad] = {
        ciudad,
        rutas: 0,
        precioMin: Infinity,
        terminales: new Set()
      }
      if (ruta.origen?.nombre) {
        destinoMap[ciudad].terminales.add(ruta.origen.nombre)
      }
    })

    return Object.values(destinoMap)
      .map(d => ({
        ...d,
        precioMin: d.precioMin === Infinity ? null : d.precioMin,
        terminales: Array.from(d.terminales)
      }))
      .sort((a, b) => b.rutas - a.rutas)
  }

  const destinos = getDestinos()
  const destinosFiltrados = filtro
    ? destinos.filter(d => d.ciudad.toLowerCase().includes(filtro.toLowerCase()))
    : destinos

  // Mapa de imágenes por ciudad (subidas por admin)
  const imgPorCiudad = {}
  destinosImagenes.forEach(img => {
    if (img.ciudad) imgPorCiudad[img.ciudad.toLowerCase()] = img.imagenPath
  })

  const getImagenDestino = (ciudad) => {
    const path = imgPorCiudad[ciudad.toLowerCase()]
    return path ? getUploadUrl(path) : FALLBACK_IMAGE
  }

  return (
    <PublicLayout>
      <PageHeroBanner
        titulo="destinos"
        subtitulo="Nuestros"
        showSearchBar={false}
        imagenFondo={bannerDestinos ? getUploadUrl(bannerDestinos) : undefined}
      />

      {/* Destinos Section */}
      <section className="py-12 lg:py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header + buscador */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Todos nuestros destinos
                </h2>
                <p className="mt-2 text-gray-500">
                  Conoce las ciudades y terminales a las que llegamos
                </p>
              </div>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar ciudad..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
              <p className="mt-4 text-gray-500 text-sm">Cargando destinos...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && destinosFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No se encontraron destinos
              </h3>
              <p className="text-gray-500 text-sm">
                {filtro
                  ? `No hay destinos que coincidan con "${filtro}".`
                  : 'No hay destinos disponibles en este momento.'}
              </p>
            </div>
          )}

          {/* Grid de destinos */}
          {!loading && destinosFiltrados.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {destinosFiltrados.map((destino, index) => (
                <Link
                  key={destino.ciudad}
                  to={`/rutas-info?destino=${encodeURIComponent(destino.ciudad)}`}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300"
                >
                  {/* Imagen */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={getImagenDestino(destino.ciudad)}
                      alt={destino.ciudad}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = FALLBACK_IMAGE
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Badge ciudad */}
                    <div className="absolute bottom-3 left-3">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">
                        {destino.ciudad}
                      </h3>
                    </div>

                    {/* Badge rutas */}
                    {destino.rutas > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-primary-700 rounded-full text-xs font-semibold shadow-sm">
                          <Bus className="w-3 h-3" />
                          {destino.rutas} {destino.rutas === 1 ? 'ruta' : 'rutas'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {/* Terminales */}
                    {destino.terminales.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {destino.terminales.slice(0, 2).map(terminal => (
                          <p key={terminal} className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            {terminal}
                          </p>
                        ))}
                        {destino.terminales.length > 2 && (
                          <p className="text-xs text-gray-400">
                            +{destino.terminales.length - 2} mas
                          </p>
                        )}
                      </div>
                    )}

                    {/* Precio + CTA */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      {destino.precioMin ? (
                        <div className="flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-secondary-500" />
                          <span className="text-sm font-bold text-secondary-600">
                            Desde S/ {destino.precioMin.toFixed(0)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Consultar precios</span>
                      )}
                      <span className="text-xs text-primary-600 font-medium group-hover:text-primary-700 flex items-center gap-1 transition-colors">
                        Ver rutas
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Stats */}
          {!loading && destinos.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 py-6 bg-white rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{destinos.length}</p>
                  <p className="text-xs text-gray-500">Ciudades</p>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-50 rounded-xl flex items-center justify-center">
                  <Bus className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{rutas.length}</p>
                  <p className="text-xs text-gray-500">Rutas activas</p>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{Object.values(ciudades).flat().length}</p>
                  <p className="text-xs text-gray-500">Terminales</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Festividades Section */}
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
    </PublicLayout>
  )
}

export default Destinos
