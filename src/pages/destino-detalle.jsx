/**
 * DestinoDetalle - Pagina de detalle estilo Movil Bus
 * Hero + 2 columnas info/imagen + calendario festivo con gradiente
 * Ruta: /destinos/:slug
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'
import { PageHeroBanner } from '../components/public'
import PublicLayout from '../components/layout/PublicLayout'
import { MapPin, Clock, Calendar, Package, ArrowLeft, Loader2, Eye } from 'lucide-react'

/**
 * Convierte fecha ISO a formato legible en espanol.
 * Convierte UTC a hora local del navegador.
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

              {destino.direccionTerminal2 && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Terminal adicional</h4>
                    <p className="text-sm text-gray-600 mt-0.5">{destino.direccionTerminal2}</p>
                  </div>
                </div>
              )}

              {destino.horarios && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Horarios de salida</h4>
                    <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-line">{destino.horarios}</p>
                  </div>
                </div>
              )}

              {destino.horariosEncomiendas && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Encomiendas Express</h4>
                    <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-line">{destino.horariosEncomiendas}</p>
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

      {/* Calendario Festivo - seccion full width con gradiente */}
      {festividades.length > 0 && (
        <section className="bg-gradient-to-r from-primary-800 via-primary-700 to-secondary-500 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              {/* Izquierda: titulo + lista de festividades */}
              <div className="lg:col-span-2">
                <div className="border-l-4 border-white/40 pl-4 mb-8">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Calendar className="w-7 h-7 text-secondary-300" />
                    Calendario Festivo
                  </h2>
                  <p className="text-white/70 text-sm mt-1">
                    Festividades y eventos en {destino.nombre}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {festividades.map((fest, idx) => (
                    <div
                      key={fest.id || idx}
                      className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors"
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {fest.titulo || fest.nombre}
                        </h4>
                        <p className="text-sm text-white/70 mt-0.5">
                          {formatearFecha(fest.fecha || fest.fechaInicio)}
                          {fest.fechaFin && fest.fechaFin !== fest.fechaInicio && (
                            <> - {formatearFecha(fest.fechaFin)}</>
                          )}
                        </p>
                        {fest.descripcion && (
                          <p className="text-sm text-white/60 mt-1">
                            {fest.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Derecha: imagen del destino */}
              <div className="hidden lg:block">
                {imagenUrl ? (
                  <div className="rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src={imagenUrl}
                      alt={destino.nombre}
                      className="w-full h-80 object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/10 flex items-center justify-center h-80">
                    <MapPin className="w-16 h-16 text-white/30" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  )
}

export default DestinoDetalle
