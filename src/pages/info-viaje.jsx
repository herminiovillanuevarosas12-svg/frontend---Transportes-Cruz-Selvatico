/**
 * Info Viaje Page
 * Pagina publica con items/cards dinamicos sobre informacion de viaje
 * Ruta: /info-viaje
 */

import { useState, useEffect } from 'react'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'
import { PageHeroBanner } from '../components/public'
import PublicLayout from '../components/layout/PublicLayout'
import {
  Info,
  Briefcase,
  Package,
  Clock,
  MapPin,
  Shield,
  Bus,
  Route,
  Globe,
  Zap,
  Heart,
  Star,
  CheckCircle2,
  HelpCircle,
  Wifi,
  Coffee
} from 'lucide-react'

const ICON_MAP = {
  Info, Briefcase, Package, Clock, MapPin, Shield, Bus, Route,
  Globe, Zap, Heart, Star, CheckCircle2, HelpCircle, Wifi, Coffee
}

const InfoViajePage = () => {
  const [items, setItems] = useState([])
  const [heroImagen, setHeroImagen] = useState(null)
  const [titulo, setTitulo] = useState('Info para tu viaje')
  const [subtitulo, setSubtitulo] = useState('Información')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        setError(false)
        const res = await publicService.getInfoViajeItems()
        setItems(res.items || [])
        setHeroImagen(res.heroImagen || null)
        setTitulo(res.titulo || 'Info para tu viaje')
        setSubtitulo(res.subtitulo || 'Información')
      } catch (err) {
        console.error('Error cargando info-viaje:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  const imagenUrl = heroImagen ? getUploadUrl(heroImagen) : null

  return (
    <PublicLayout>
      <PageHeroBanner
        titulo={titulo}
        subtitulo={subtitulo}
        imagenFondo={imagenUrl}
        showSearchBar={false}
      />

      <section className="bg-white py-12 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-5" />
              <p className="text-gray-400 text-sm font-medium tracking-wide">
                Cargando contenido...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No pudimos cargar esta pagina
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Ocurrio un error al obtener el contenido. Por favor intenta nuevamente mas tarde.
                </p>
              </div>
            </div>
          )}

          {/* Grid de tarjetas */}
          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const IconComp = ICON_MAP[item.icono] || Info
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {item.imagenPath ? (
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={getUploadUrl(item.imagenPath)}
                          alt={item.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
                        <IconComp className="w-12 h-12 text-primary-500" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                          <IconComp className="w-5 h-5 text-primary-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{item.titulo}</h3>
                      </div>
                      {item.descripcion && (
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {item.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty State - Proximamente */}
          {!loading && !error && items.length === 0 && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-14 h-14 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Proximamente...
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Estamos preparando toda la informacion que necesitas para tu viaje.
                  Vuelve pronto para enterarte de todo.
                </p>
                <div className="mt-6 h-1 w-16 bg-secondary-500 rounded-full mx-auto" />
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}

export default InfoViajePage
