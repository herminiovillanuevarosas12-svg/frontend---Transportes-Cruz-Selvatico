/**
 * FestividadesPage - Listado de festividades y eventos
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, PartyPopper, Loader2 } from 'lucide-react'
import PublicLayout from '../components/layout/PublicLayout'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'

const FestividadesPage = () => {
  const [festividades, setFestividades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publicService.getFestividades()
      .then(res => setFestividades(res.festividades || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-900 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PartyPopper className="w-8 h-8 text-secondary-400" />
            <h1 className="text-3xl lg:text-4xl font-bold">Festividades y Eventos</h1>
          </div>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            Descubre las festividades y eventos culturales en nuestros destinos
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : festividades.length === 0 ? (
            <div className="text-center py-20">
              <PartyPopper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay festividades disponibles por el momento</p>
            </div>
          ) : (
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
                        <PartyPopper className="w-16 h-16 text-primary-300" />
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
          )}
        </div>
      </section>
    </PublicLayout>
  )
}

export default FestividadesPage
