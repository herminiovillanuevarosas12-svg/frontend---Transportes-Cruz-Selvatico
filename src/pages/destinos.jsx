/**
 * Destinos - Pagina publica
 * Muestra destinos configurados desde el admin + festividades
 * Ruta: /destinos
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'
import { PageHeroBanner } from '../components/public'
import PublicLayout from '../components/layout/PublicLayout'
import {
  MapPin,
  ArrowRight,
  Loader2,
  Search,
  Banknote
} from 'lucide-react'

const Destinos = () => {
  const [destinosPublicos, setDestinosPublicos] = useState([])
  const [festividades, setFestividades] = useState([])
  const [bannerDestinos, setBannerDestinos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [festRes, bannerRes, destPubRes] = await Promise.all([
        publicService.getFestividades().catch(() => ({ festividades: [] })),
        publicService.getDestinosBanner().catch(() => ({ banner: null })),
        publicService.getDestinos({ limit: 50 }).catch(() => ({ destinos: [] }))
      ])
      setFestividades(festRes.festividades || [])
      setBannerDestinos(bannerRes.banner || null)
      setDestinosPublicos(destPubRes.destinos || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const destinosFiltrados = filtro
    ? destinosPublicos.filter(d => d.nombre.toLowerCase().includes(filtro.toLowerCase()))
    : destinosPublicos

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
        <div className="mx-auto px-4 sm:px-8 lg:px-12">
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
              {destinosFiltrados.map((destino) => {
                const imgUrl = destino.imagenPath ? getUploadUrl(destino.imagenPath) : null
                return (
                  <Link
                    key={destino.id}
                    to={`/destinos/${destino.slug}`}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300"
                  >
                    {/* Imagen */}
                    <div className="relative h-44 overflow-hidden">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={destino.nombre}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
                          <MapPin className="w-12 h-12 text-white/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Badge ciudad */}
                      <div className="absolute bottom-3 left-3">
                        <h3 className="text-xl font-bold text-white drop-shadow-lg">
                          {destino.nombre}
                        </h3>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      {destino.subtitulo && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{destino.subtitulo}</p>
                      )}

                      {/* Precio + CTA */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        {destino.precioDesde ? (
                          <div className="flex items-center gap-1.5">
                            <Banknote className="w-4 h-4 text-secondary-500" />
                            <span className="text-sm font-bold text-secondary-600">
                              Desde S/ {Number(destino.precioDesde).toFixed(0)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Consultar precios</span>
                        )}
                        <span className="text-xs text-primary-600 font-medium group-hover:text-primary-700 flex items-center gap-1 transition-colors">
                          Ver detalle
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Stats */}
          {!loading && destinosPublicos.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 py-6 bg-white rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{destinosPublicos.length}</p>
                  <p className="text-xs text-gray-500">Destinos</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Festividades Section */}
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
    </PublicLayout>
  )
}

export default Destinos
