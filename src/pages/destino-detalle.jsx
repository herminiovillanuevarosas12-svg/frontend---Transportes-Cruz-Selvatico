/**
 * DestinoDetalle - Pagina de detalle estilo Movil Bus
 * Hero + 2 columnas info/imagen + Atractivos turisticos + Calendario festivo
 * Ruta: /destinos/:slug
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'
import { PageHeroBanner } from '../components/public'
import PublicLayout from '../components/layout/PublicLayout'
import { MapPin, Clock, Calendar, ArrowLeft, Loader2, Eye, Mountain, Thermometer, Phone, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Convierte fecha ISO a formato legible en espanol.
 */
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return ''
  try {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  } catch {
    return fechaStr
  }
}

/**
 * Seccion unificada "Atractivos turisticos" con carrusel de festividades.
 * Imagen de fondo full-width por slide + cuadro con info superpuesto a la derecha.
 */
const AtractivosCarousel = ({ festividades, destino, imagenAtractivosUrl }) => {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const total = festividades.length

  const goTo = (idx) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(idx)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const prev = () => goTo(current === 0 ? total - 1 : current - 1)
  const next = () => goTo(current === total - 1 ? 0 : current + 1)

  const fest = festividades[current]

  return (
    <section className="relative w-full overflow-hidden h-[420px]">
      {/* Slides de imagenes de fondo con transicion fade */}
      {festividades.map((f, idx) => {
        const img = f.imagenPath ? getUploadUrl(f.imagenPath) : imagenAtractivosUrl
        return (
          <div
            key={f.id || idx}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {img ? (
              <img
                src={img}
                alt={f.titulo || f.nombre}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-secondary-600" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/60" />
          </div>
        )
      })}

      {/* Contenido superpuesto - altura fija */}
      <div className="relative z-20 flex items-center h-[420px]">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Columna izquierda - vacia para mostrar imagen */}
            <div className="hidden lg:block" />

            {/* Columna derecha - cuadro con info, altura fija */}
            <div className="bg-primary-800/80 backdrop-blur-sm rounded-2xl p-8 lg:p-10 h-[340px] flex flex-col overflow-hidden">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 shrink-0">
                Atractivos turisticos
              </h2>
              <p className="text-secondary-400 font-semibold text-sm mb-4 shrink-0 truncate">
                {fest.titulo || fest.nombre}
              </p>
              {fest.descripcion && (
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line line-clamp-5 flex-1 min-h-0 overflow-hidden">
                  {fest.descripcion}
                </p>
              )}

              {/* Parte inferior fija */}
              <div className="shrink-0 mt-auto pt-4">
                {/* Link a detalle */}
                {fest.id && (
                  <Link
                    to={`/festividad/${fest.id}`}
                    className="inline-flex items-center gap-2 text-secondary-400 hover:text-secondary-300 font-semibold text-sm transition-colors"
                  >
                    Ver mas detalles
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}

                {/* Indicadores de slide */}
                {total > 1 && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                    {festividades.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goTo(idx)}
                        className={`rounded-full transition-all duration-300 ${
                          idx === current
                            ? 'w-8 h-2.5 bg-secondary-400'
                            : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Ir a atractivo ${idx + 1}`}
                      />
                    ))}
                    <span className="text-white/40 text-xs ml-3">
                      {current + 1} / {total}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flechas de navegacion */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            aria-label="Atractivo anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            aria-label="Atractivo siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </section>
  )
}

const DestinoDetalle = () => {
  const { slug } = useParams()
  const [destino, setDestino] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const cargarDestino = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const res = await publicService.getDestino(slug)
        const data = res.destino || res.data || res
        if (!data || !data.nombre) {
          setNotFound(true)
        } else {
          setDestino(data)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    cargarDestino()
  }, [slug])

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          <p className="mt-4 text-gray-500 text-sm">Cargando destino...</p>
        </div>
      </PublicLayout>
    )
  }

  if (notFound || !destino) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Eye className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Destino no encontrado</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            El destino que buscas no existe o ya no esta disponible.
          </p>
          <Link
            to="/destinos"
            className="flex items-center gap-2 bg-primary-700 text-white rounded-lg px-6 py-3 font-semibold text-sm hover:bg-primary-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ver todos los destinos
          </Link>
        </div>
      </PublicLayout>
    )
  }

  const imagenUrl = destino.imagenPath ? getUploadUrl(destino.imagenPath) : null
  const imagenAtractivosUrl = destino.imagenAtractivos ? getUploadUrl(destino.imagenAtractivos) : null
  const festividades = Array.isArray(destino.festividades) ? destino.festividades : []

  return (
    <PublicLayout>
      <PageHeroBanner
        titulo={destino.nombre}
        subtitulo="Destino"
        imagenFondo={imagenUrl}
        showSearchBar={false}
      />

      <section className="max-w-7xl mx-auto px-4 py-10 lg:py-14">
        {/* Breadcrumb */}
        <Link
          to="/destinos"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a destinos
        </Link>

        {/* Layout 2 columnas: info izquierda + imagen derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          {/* Columna izquierda - informacion */}
          <div>
            {/* Nombre con borde izquierdo naranja */}
            <div className="border-l-4 border-secondary-500 pl-4 mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-primary-800 leading-tight">
                {destino.nombre}
              </h1>
              {destino.subtitulo && (
                <p className="text-lg text-secondary-500 font-medium mt-1">
                  {destino.subtitulo}
                </p>
              )}
            </div>

            {/* Descripcion con texto enriquecido */}
            {destino.descripcion && (
              <div className="text-gray-600 leading-relaxed mb-8 whitespace-pre-line text-[15px]">
                {destino.descripcion}
              </div>
            )}

            {/* Terminales e info */}
            <div className="space-y-5">
              {destino.direccionTerminal && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Terminal terrestre</h4>
                    <p className="text-sm text-gray-600 mt-0.5">{destino.direccionTerminal}</p>
                  </div>
                </div>
              )}

              {destino.telefonoTerminal && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Telefono</h4>
                    <p className="text-sm text-gray-600 mt-0.5">{destino.telefonoTerminal}</p>
                  </div>
                </div>
              )}

              {destino.horariosAtencion && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Horarios de atencion</h4>
                    <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-line">{destino.horariosAtencion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - imagen grande */}
          <div>
            {imagenUrl ? (
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={imagenUrl}
                  alt={destino.nombre}
                  className="w-full h-full object-cover min-h-[320px] max-h-[500px]"
                />
              </div>
            ) : (
              <div className="rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center min-h-[320px]">
                <MapPin className="w-16 h-16 text-primary-300" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Barra de estadisticas */}
      {(destino.altitud || destino.temperatura || destino.tiempoViaje) && (
        <section className="bg-primary-50/60 border-y border-primary-100">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {destino.altitud && (
                <div className="flex items-center gap-4 bg-white rounded-xl p-5 shadow-sm">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                    <Mountain className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Altitud</p>
                    <p className="text-lg font-bold text-primary-800">{destino.altitud}</p>
                  </div>
                </div>
              )}
              {destino.temperatura && (
                <div className="flex items-center gap-4 bg-white rounded-xl p-5 shadow-sm">
                  <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center shrink-0">
                    <Thermometer className="w-6 h-6 text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Temperatura</p>
                    <p className="text-lg font-bold text-primary-800">{destino.temperatura}</p>
                  </div>
                </div>
              )}
              {destino.tiempoViaje && (
                <div className="flex items-center gap-4 bg-white rounded-xl p-5 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tiempo de viaje</p>
                    <p className="text-lg font-bold text-primary-800">{destino.tiempoViaje}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* ATRACTIVOS TURISTICOS - Carrusel unificado                   */}
      {/* ============================================================ */}
      {festividades.length > 0 && (
        <AtractivosCarousel
          festividades={festividades}
          destino={destino}
          imagenAtractivosUrl={imagenAtractivosUrl}
        />
      )}
    </PublicLayout>
  )
}

export default DestinoDetalle
