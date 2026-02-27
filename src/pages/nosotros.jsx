/**
 * Nosotros Page
 * Pagina publica con secciones: Hero, Slogan, Mision/Vision, Valores institucionales
 * Todo dinamico desde /api/public/nosotros (tbl_configuracion_sistema + tbl_nosotros_valores)
 * Ruta: /nosotros
 */

import { useState, useEffect } from 'react'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'
import { PageHeroBanner } from '../components/public'
import PublicLayout from '../components/layout/PublicLayout'
import {
  Bus,
  Route,
  Target,
  Eye,
  Heart,
  Shield,
  Star,
  Globe,
  Users,
  Truck,
  Zap,
  Package,
  MapPin,
  Clock,
  Search,
  Award,
  Lightbulb,
  HandHeart
} from 'lucide-react'

const ICONOS_MAP = {
  Bus, Route, Target, Eye, Heart, Shield, Star, Globe, Users, Truck,
  Zap, Package, MapPin, Clock, Search, Award, Lightbulb, HandHeart
}

const NosotrosPage = () => {
  const [config, setConfig] = useState({})
  const [valores, setValores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        setError(false)
        const res = await publicService.getNosotros()
        setConfig(res.config || {})
        setValores(res.valores || [])
      } catch (err) {
        console.error('Error cargando pagina nosotros:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const heroTitulo = config.nosotrosHeroTitulo || 'Nosotros'
  const heroSubtitulo = config.nosotrosHeroSubtitulo || 'Conocenos'
  const heroImagen = config.nosotrosHeroImagen ? getUploadUrl(config.nosotrosHeroImagen) : null

  const MisionIcono = ICONOS_MAP[config.nosotrosMisionIcono] || Bus
  const VisionIcono = ICONOS_MAP[config.nosotrosVisionIcono] || Route

  const tieneMisionOVision = config.nosotrosMisionTexto || config.nosotrosVisionTexto
  const tieneValores = valores.length > 0

  return (
    <PublicLayout>
      <PageHeroBanner
        titulo={heroTitulo}
        subtitulo={heroSubtitulo}
        imagenFondo={heroImagen}
        showSearchBar={false}
      />

      {/* Loading */}
      {loading && (
        <section className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-5" />
            <p className="text-gray-400 text-sm font-medium tracking-wide">
              Cargando contenido...
            </p>
          </div>
        </section>
      )}

      {/* Error */}
      {!loading && error && (
        <section className="bg-white py-20">
          <div className="max-w-md mx-auto text-center px-4">
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
        </section>
      )}

      {/* Contenido */}
      {!loading && !error && (
        <>
          {/* Seccion: Slogan */}
          {config.slogan && (
            <section className="bg-white pt-14 pb-8 lg:pt-20 lg:pb-12">
              <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                  {config.nombreEmpresa && (
                    <span>{config.nombreEmpresa},<br /></span>
                  )}
                  <span className="text-primary-700">{config.slogan}</span>
                </h2>
              </div>
            </section>
          )}

          {/* Seccion: Mision y Vision */}
          {tieneMisionOVision && (
            <section className="bg-white py-12 lg:py-16">
              <div className="max-w-5xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0">
                  {/* Mision */}
                  {config.nosotrosMisionTexto && (
                    <div className="flex flex-col items-center text-center px-6 md:px-10 md:border-r md:border-gray-200">
                      <div className="w-20 h-20 rounded-full border-2 border-primary-500 flex items-center justify-center mb-5">
                        <MisionIcono className="w-10 h-10 text-primary-600" />
                      </div>
                      <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                        {config.nosotrosMisionTitulo || 'Mision'}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                        {config.nosotrosMisionTexto}
                      </p>
                    </div>
                  )}

                  {/* Vision */}
                  {config.nosotrosVisionTexto && (
                    <div className="flex flex-col items-center text-center px-6 md:px-10">
                      <div className="w-20 h-20 rounded-full border-2 border-primary-500 flex items-center justify-center mb-5">
                        <VisionIcono className="w-10 h-10 text-primary-600" />
                      </div>
                      <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                        {config.nosotrosVisionTitulo || 'Vision'}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                        {config.nosotrosVisionTexto}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Seccion: Valores institucionales */}
          {tieneValores && (
            <section className="bg-gray-50 py-14 lg:py-20">
              <div className="max-w-6xl mx-auto px-4">
                {/* Titulo */}
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-10 lg:mb-14">
                  {config.nosotrosValoresTitulo || 'Valores institucionales'}
                </h2>

                {/* Grid de valores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
                  {valores.map((valor) => (
                    <div
                      key={valor.id}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      {/* Imagen */}
                      <img
                        src={getUploadUrl(valor.imagenPath)}
                        alt={valor.titulo}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Overlay gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-primary-900/30 to-transparent" />

                      {/* Titulo */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-semibold text-sm lg:text-base text-center leading-tight">
                          {valor.titulo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Empty state si no hay nada configurado */}
          {!config.slogan && !tieneMisionOVision && !tieneValores && (
            <section className="bg-white py-20">
              <div className="max-w-md mx-auto text-center px-4">
                <div className="w-14 h-14 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Users className="w-7 h-7 text-secondary-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Proximamente...
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Estamos preparando esta seccion con toda la informacion sobre nosotros.
                  Vuelve pronto para conocernos mejor.
                </p>
                <div className="mt-6 h-1 w-16 bg-secondary-500 rounded-full mx-auto" />
              </div>
            </section>
          )}
        </>
      )}
    </PublicLayout>
  )
}

export default NosotrosPage
