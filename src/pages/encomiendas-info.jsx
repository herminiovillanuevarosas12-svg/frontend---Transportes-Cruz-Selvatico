/**
 * Encomiendas Info - Pagina publica informativa
 * Ruta: /encomiendas-info
 * Secciones: Por que elegirnos (carousel), Servicios/Flota (tabs), Como funciona (3 pasos), CTA tracking
 * Datos dinamicos desde API: ventajas, secciones, imagen hero, whatsapp
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

const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const EncomiendasInfoPage = () => {
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [ventajas, setVentajas] = useState([])
  const [heroImagen, setHeroImagen] = useState(null)
  const [loading, setLoading] = useState(true)
  // Secciones Servicios/Flota
  const [seccionesServicios, setSeccionesServicios] = useState([])
  const [seccionesFlota, setSeccionesFlota] = useState([])
  const [activeTab, setActiveTab] = useState('SERVICIOS')
  const [loadingSecciones, setLoadingSecciones] = useState(true)
  // WhatsApp
  const [whatsapp, setWhatsapp] = useState(null)

  useEffect(() => {
    // Cargar ventajas
    publicService
      .getEncomiendasVentajas()
      .then((res) => {
        if (res.ventajas && res.ventajas.length > 0) {
          setVentajas(res.ventajas)
        }
        if (res.heroImagen) {
          setHeroImagen(res.heroImagen)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    // Cargar secciones Servicios/Flota
    publicService
      .getEncomiendasSecciones()
      .then((res) => {
        setSeccionesServicios(res.servicios || [])
        setSeccionesFlota(res.flota || [])
      })
      .catch(() => {})
      .finally(() => setLoadingSecciones(false))

    // Cargar config (whatsapp)
    publicService
      .getConfigLanding()
      .then((res) => {
        if (res.config?.whatsapp) {
          setWhatsapp(res.config.whatsapp)
        }
      })
      .catch(() => {})
  }, [])

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? ventajas.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCarouselIndex((prev) => (prev === ventajas.length - 1 ? 0 : prev + 1))
  }

  const getWhatsAppUrl = () => {
    if (!whatsapp) return '#'
    const numero = whatsapp.replace(/\D/g, '')
    return `https://wa.me/${numero}`
  }

  const seccionesActivas = activeTab === 'SERVICIOS' ? seccionesServicios : seccionesFlota
  const haySecciones = seccionesServicios.length > 0 || seccionesFlota.length > 0

  return (
    <PublicLayout>
      <PageHeroBanner
        titulo="Encomiendas"
        imagenFondo={heroImagen ? getUploadUrl(heroImagen) : null}
        showSearchBar={false}
      />

      {/* Seccion: Por que elegirnos */}
      {ventajas.length > 0 && (
        <section className="bg-white py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4">
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
                        {v.imagenPath ? (
                          <div className="h-60 overflow-hidden">
                            <img
                              src={getUploadUrl(v.imagenPath)}
                              alt={v.titulo}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-60 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
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
                          <div className="h-60 overflow-hidden">
                            <img
                              src={getUploadUrl(v.imagenPath)}
                              alt={v.titulo}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-60 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
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
                  {ventajas.length > 1 && (
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
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Seccion: Servicios / Flota (tabs) */}
      {!loadingSecciones && haySecciones && (
        <section className="bg-white py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 mb-12">
              <button
                onClick={() => setActiveTab('SERVICIOS')}
                className={`py-4 text-center text-lg font-bold uppercase tracking-wider rounded-l-xl transition-all duration-300 ${
                  activeTab === 'SERVICIOS'
                    ? 'bg-white text-gray-900 border-2 border-secondary-500 shadow-md'
                    : 'bg-secondary-500 text-white hover:bg-secondary-600'
                }`}
              >
                Servicios
              </button>
              <button
                onClick={() => setActiveTab('FLOTA')}
                className={`py-4 text-center text-lg font-bold uppercase tracking-wider rounded-r-xl transition-all duration-300 ${
                  activeTab === 'FLOTA'
                    ? 'bg-white text-gray-900 border-2 border-secondary-500 shadow-md'
                    : 'bg-secondary-500 text-white hover:bg-secondary-600'
                }`}
              >
                Flota
              </button>
            </div>

            {/* Bloques con layout alternado */}
            <div className="space-y-16 lg:space-y-20">
              {seccionesActivas.length === 0 ? (
                <p className="text-center text-gray-400 py-12">
                  No hay contenido disponible para esta seccion.
                </p>
              ) : (
                seccionesActivas.map((seccion, idx) => {
                  const imageLeft = idx % 2 === 0

                  return (
                    <div
                      key={seccion.id}
                      className={`flex flex-col ${imageLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 lg:gap-12 items-center`}
                    >
                      {/* Imagen */}
                      <div className="w-full md:w-1/2">
                        {seccion.imagenPath ? (
                          <img
                            src={getUploadUrl(seccion.imagenPath)}
                            alt={seccion.titulo}
                            className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-xl shadow-lg"
                          />
                        ) : (
                          <div className="w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Texto + Boton WhatsApp */}
                      <div className="w-full md:w-1/2 flex flex-col justify-center">
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                          {seccion.titulo}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-6">
                          {seccion.descripcion}
                        </p>
                        {whatsapp && (
                          <div>
                            <a
                              href={getWhatsAppUrl()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2.5 px-6 py-3 bg-secondary-500 text-white rounded-full font-bold text-sm uppercase tracking-wide hover:bg-secondary-600 transition-colors shadow-lg shadow-secondary-500/25"
                            >
                              ESCRIBENOS
                              <WhatsAppIcon className="w-5 h-5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </section>
      )}

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

export default EncomiendasInfoPage
