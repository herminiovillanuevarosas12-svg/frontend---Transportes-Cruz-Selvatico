/**
 * Encomiendas Info - Pagina publica informativa
 * Ruta: /encomiendas-info
 * Secciones: Hero (carrusel de imagenes), secciones de cards dinamicas (ej. "¿Por qué elegirnos?"),
 * Servicios/Flota (tabs), Como funciona (3 pasos), CTA tracking
 * Datos dinamicos desde API: secciones de cards, secciones Servicios/Flota, imagenes hero, whatsapp
 */

import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeroBanner } from '../components/public'
import PublicLayout from '../components/layout/PublicLayout'
import SeccionCards, { SeccionCardsSkeleton } from '../components/public/encomiendas/SeccionCards'
import { getUploadUrl } from '../services/apiClient'
import publicService from '../services/publicService'
import { useAuthStore } from '../features/auth/authStore'
import { PARAM_MODO_EDICION, importarConRespaldo, puedeEditarPagina } from '../utils/seccionesCards'
import { toast } from 'react-hot-toast'
import { Truck, Package, MapPin, Search, Clock, Pencil, X } from 'lucide-react'

// Editor inline (solo superadmin): se descarga únicamente al activar el modo edición
// Si el editor no se puede descargar (p. ej. tras un nuevo deploy), avisa y vuelve a la vista pública
const EditorNoDisponible = ({ onSalir }) => {
  useEffect(() => {
    toast.error('No se pudo cargar el editor. Recarga la página e inténtalo de nuevo.', { id: 'editor-no-disponible' })
    onSalir()
  }, [onSalir])
  return null
}

const EditorSeccionesCards = lazy(
  importarConRespaldo(() => import('../components/public/encomiendas/editor/EditorSeccionesCards'), EditorNoDisponible)
)

const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const EncomiendasInfoPage = () => {
  const [heroImagenes, setHeroImagenes] = useState([])
  // Secciones de cards (ej. "¿Por qué elegirnos?")
  const [seccionesCards, setSeccionesCards] = useState([])
  const [loadingCards, setLoadingCards] = useState(true)
  // Modo edición (superadmin)
  const puedeEditar = puedeEditarPagina(useAuthStore((state) => state.user))
  const [modoEdicion, setModoEdicion] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  // Secciones Servicios/Flota
  const [seccionesServicios, setSeccionesServicios] = useState([])
  const [seccionesFlota, setSeccionesFlota] = useState([])
  const [activeTab, setActiveTab] = useState('SERVICIOS')
  const [loadingSecciones, setLoadingSecciones] = useState(true)
  // WhatsApp
  const [whatsapp, setWhatsapp] = useState(null)

  const cargarSeccionesCards = useCallback(() => {
    publicService
      .getEncomiendasSeccionesCards()
      .then((res) => setSeccionesCards(res.secciones || []))
      .catch(() => {})
      .finally(() => setLoadingCards(false))
  }, [])

  // ?editar=1 (desde el panel admin) abre el modo edición si el usuario es superadmin
  useEffect(() => {
    if (!searchParams.has(PARAM_MODO_EDICION)) return
    if (puedeEditar) setModoEdicion(true)
    searchParams.delete(PARAM_MODO_EDICION)
    setSearchParams(searchParams, { replace: true })
  }, [searchParams, setSearchParams, puedeEditar])

  const salirModoEdicion = useCallback(() => {
    setModoEdicion(false)
    cargarSeccionesCards()
  }, [cargarSeccionesCards])

  useEffect(() => {
    // Cargar carrusel de portada
    publicService
      .getEncomiendasHeroImagenes()
      .then((res) => {
        setHeroImagenes((res.heroImagenes || []).map((img) => getUploadUrl(img.imagenPath)))
      })
      .catch(() => {})

    // Cargar secciones de cards
    cargarSeccionesCards()

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

  const getWhatsAppUrl = () => {
    if (!whatsapp) return '#'
    const numero = whatsapp.replace(/\D/g, '')
    return `https://wa.me/${numero}`
  }

  const seccionesActivas = activeTab === 'SERVICIOS' ? seccionesServicios : seccionesFlota
  const haySecciones = seccionesServicios.length > 0 || seccionesFlota.length > 0

  return (
    <PublicLayout searchBarLabel="Envío de encomiendas" searchBarIcon={Package}>
      <PageHeroBanner
        titulo="Encomiendas"
        imagenesFondo={heroImagenes}
        showSearchBar={false}
      />

      {/* Secciones de cards (dinamicas); el superadmin las edita en el lugar */}
      {modoEdicion && puedeEditar ? (
        <Suspense fallback={<SeccionCardsSkeleton />}>
          <EditorSeccionesCards onSalir={salirModoEdicion} />
        </Suspense>
      ) : loadingCards ? (
        <SeccionCardsSkeleton />
      ) : (
        seccionesCards.map((seccion) => <SeccionCards key={seccion.id} seccion={seccion} />)
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
      {puedeEditar && (
        <button
          type="button"
          onClick={modoEdicion ? salirModoEdicion : () => setModoEdicion(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-gray-900 text-white text-sm font-semibold shadow-xl hover:bg-gray-800 transition-colors"
        >
          {modoEdicion ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          {modoEdicion ? 'Salir de edición' : 'Modo edición'}
        </button>
      )}
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
