/**
 * Encomiendas Info - Pagina publica informativa estilo Movil Bus
 * Ruta: /encomiendas-info
 * Secciones: Por que elegirnos (carousel), Como funciona (3 pasos), CTA tracking
 * Datos dinamicos desde API: ventajas + imagen hero
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeroBanner } from '../components/public'
import PublicLayout from '../components/layout/PublicLayout'
import { getUploadUrl } from '../services/apiClient'
import publicService from '../services/publicService'
import {
  Truck,
  Globe,
  Shield,
  Package,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  Heart,
  Star,
  Eye,
} from 'lucide-react'

const ICONOS_MAP = {
  Truck,
  Globe,
  Shield,
  Package,
  MapPin,
  Search,
  Clock,
  Zap,
  Heart,
  Star,
  Eye,
}

const VENTAJAS_DEFAULT = [
  {
    icono: 'Truck',
    titulo: 'Estandar A1 con tarifas competitivas',
    descripcion:
      'Ofrecemos las mejores tarifas del mercado sin sacrificar la calidad del servicio. Precios accesibles para todos tus envios con garantia de entrega.',
  },
  {
    icono: 'Globe',
    titulo: 'Cobertura a nivel nacional',
    descripcion:
      'Llegamos a las principales ciudades y terminales del pais. Conectamos la selva, sierra y costa con rutas directas y seguras.',
  },
  {
    icono: 'Shield',
    titulo: 'Monitoreo 24/7',
    descripcion:
      'Rastrea tu encomienda en tiempo real desde cualquier dispositivo. Recibe actualizaciones en cada etapa del envio para tu tranquilidad.',
  },
]

const PASOS = [
  {
    numero: 1,
    icono: Package,
    titulo: 'Lleva tu paquete',
    descripcion:
      'Acercate a cualquiera de nuestras agencias con tu paquete. Registramos los datos del remitente y destinatario.',
  },
  {
    numero: 2,
    icono: Truck,
    titulo: 'Nosotros lo enviamos',
    descripcion:
      'Tu paquete viaja de forma segura en nuestras unidades con seguimiento en cada punto de la ruta.',
  },
  {
    numero: 3,
    icono: MapPin,
    titulo: 'Retira en destino',
    descripcion:
      'El destinatario recoge la encomienda en la agencia de destino presentando su documento de identidad.',
  },
]

const EncomiendasInfoPage = () => {
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [ventajas, setVentajas] = useState([])
  const [heroImagen, setHeroImagen] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publicService
      .getEncomiendasVentajas()
      .then((res) => {
        if (res.ventajas && res.ventajas.length > 0) {
          setVentajas(res.ventajas)
        } else {
          setVentajas(VENTAJAS_DEFAULT)
        }
        if (res.heroImagen) {
          setHeroImagen(res.heroImagen)
        }
      })
      .catch(() => {
        setVentajas(VENTAJAS_DEFAULT)
      })
      .finally(() => setLoading(false))
  }, [])

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? ventajas.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCarouselIndex((prev) => (prev === ventajas.length - 1 ? 0 : prev + 1))
  }

  return (
    <PublicLayout>
      <PageHeroBanner
        titulo="Encomiendas"
        imagenFondo={heroImagen ? getUploadUrl(heroImagen) : null}
        showSearchBar={false}
      />

      {/* Seccion: Por que elegirnos */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Titulo con borde izquierdo + flechas */}
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 border-l-4 border-secondary-500 pl-4">
              Por que elegirnos?
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 hover:border-secondary-500 hover:text-secondary-500 transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 hover:border-secondary-500 hover:text-secondary-500 transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Grid de cards - desktop muestra las 3, mobile carousel */}
              <div className="hidden md:grid md:grid-cols-3 gap-8">
                {ventajas.map((v, idx) => {
                  const Icono = ICONOS_MAP[v.icono] || Package
                  return (
                    <div
                      key={v.id || idx}
                      className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      {/* Imagen o placeholder con icono */}
                      {v.imagenPath ? (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={getUploadUrl(v.imagenPath)}
                            alt={v.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full border-2 border-secondary-500 flex items-center justify-center">
                            <Icono className="w-10 h-10 text-secondary-500" />
                          </div>
                        </div>
                      )}
                      {/* Contenido */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-secondary-500 mb-2">
                          {v.titulo}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {v.descripcion}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Mobile carousel - una card a la vez */}
              <div className="md:hidden">
                {ventajas.map((v, idx) => {
                  const Icono = ICONOS_MAP[v.icono] || Package
                  if (idx !== carouselIndex) return null

                  return (
                    <div
                      key={v.id || idx}
                      className="rounded-xl border border-gray-200 overflow-hidden animate-fade-in"
                    >
                      {v.imagenPath ? (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={getUploadUrl(v.imagenPath)}
                            alt={v.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full border-2 border-secondary-500 flex items-center justify-center">
                            <Icono className="w-10 h-10 text-secondary-500" />
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-secondary-500 mb-2">
                          {v.titulo}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {v.descripcion}
                        </p>
                      </div>
                    </div>
                  )
                })}

                {/* Indicadores de carousel */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  {ventajas.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === carouselIndex
                          ? 'bg-secondary-500 w-6'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Ventaja ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Seccion: Como funciona */}
      <section className="bg-gray-50 py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 border-l-4 border-secondary-500 pl-4 mb-12">
            Como funciona?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {PASOS.map((paso) => {
              const Icono = paso.icono
              return (
                <div key={paso.numero} className="flex flex-col items-center text-center">
                  {/* Icono grande con numero */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full border-2 border-secondary-500 flex items-center justify-center">
                      <Icono className="w-11 h-11 text-secondary-500" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-8 h-8 bg-secondary-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      {paso.numero}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {paso.titulo}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                    {paso.descripcion}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA: Rastrea tu encomienda */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-800 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-secondary-400 flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-secondary-400" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Rastrea tu encomienda
          </h2>
          <p className="text-lg text-primary-200 max-w-xl mx-auto mb-8">
            Consulta el estado de tu envio en tiempo real ingresando tu codigo de seguimiento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tracking"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-secondary-500 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-secondary-600 transition-colors shadow-lg shadow-secondary-500/25"
            >
              <Search className="w-5 h-5" />
              Rastrear envio
            </Link>
            <Link
              to="/contacto"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 text-white border border-white/20 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-white/20 transition-colors"
            >
              <Clock className="w-5 h-5" />
              Consultar horarios
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

export default EncomiendasInfoPage
