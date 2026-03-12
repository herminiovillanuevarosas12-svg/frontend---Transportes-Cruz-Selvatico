/**
 * Festividad Detalle Page
 * Vista completa de una festividad con galeria de imagenes
 * Ruta: /festividad/:id
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'
import { SearchBarHero } from '../components/public'
import PublicLayout from '../components/layout/PublicLayout'
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'

const FestividadDetallePage = () => {
  const { id } = useParams()
  const [festividad, setFestividad] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentImgIndex, setCurrentImgIndex] = useState(0)

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        setError(false)
        // Intentar endpoint individual, si falla usar listado completo
        try {
          const res = await publicService.getFestividad(id)
          setFestividad(res.festividad)
        } catch {
          // Fallback: obtener todas y filtrar por ID
          const res = await publicService.getFestividades()
          const found = (res.festividades || []).find(f => String(f.id) === String(id))
          if (found) {
            setFestividad(found)
          } else {
            setError(true)
          }
        }
      } catch (err) {
        console.error('Error cargando festividad:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  const handlePrevImg = useCallback(() => {
    if (!festividad?.imagenes?.length) return
    setCurrentImgIndex(i => i > 0 ? i - 1 : festividad.imagenes.length - 1)
  }, [festividad])

  const handleNextImg = useCallback(() => {
    if (!festividad?.imagenes?.length) return
    setCurrentImgIndex(i => i < festividad.imagenes.length - 1 ? i + 1 : 0)
  }, [festividad])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevImg()
      if (e.key === 'ArrowRight') handleNextImg()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrevImg, handleNextImg])

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          <p className="mt-4 text-gray-500 text-sm">Cargando...</p>
        </div>
      </PublicLayout>
    )
  }

  if (error || !festividad) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Festividad no encontrada</h2>
          <p className="text-gray-500 text-sm mb-6">No pudimos encontrar esta festividad.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-secondary-500 text-white rounded-lg font-semibold text-sm hover:bg-secondary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </PublicLayout>
    )
  }

  const imagenes = festividad.imagenes || []
  const currentImage = imagenes[currentImgIndex]

  return (
    <PublicLayout>
      {/* Hero con imagen principal */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden bg-gray-900">
        {imagenes.length > 0 ? (
          <>
            <img
              src={getUploadUrl(currentImage.imagenPath)}
              alt={`${festividad.titulo} - Foto ${currentImgIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Navegacion de imagenes */}
            {imagenes.length > 1 && (
              <>
                <button
                  onClick={handlePrevImg}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImg}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Contador */}
                <div className="absolute top-4 right-4 md:top-6 md:right-8">
                  <span className="px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                    {currentImgIndex + 1} / {imagenes.length}
                  </span>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center">
            <ImageIcon className="w-20 h-20 text-primary-600" />
          </div>
        )}

        {/* Info superpuesta */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="mx-auto px-0 sm:px-2 lg:px-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-white/80 text-sm hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                {festividad.puntoCiudad}
              </span>
              <span className="text-white/70 text-sm">
                {festividad.puntoNombre}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {festividad.titulo}
            </h1>
          </div>
        </div>
      </section>

      {/* Thumbnails de imagenes */}
      {imagenes.length > 1 && (
        <section className="bg-gray-900 py-4">
          <div className="mx-auto px-4 sm:px-8 lg:px-12">
            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {imagenes.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setCurrentImgIndex(idx)}
                  className={`flex-shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden transition-all ${
                    idx === currentImgIndex
                      ? 'ring-2 ring-secondary-500 opacity-100'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <img
                    src={getUploadUrl(img.imagenPath)}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contenido */}
      <section className="py-10 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          {festividad.descripcion && (
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {festividad.descripcion}
            </div>
          )}

          {/* Info ubicacion */}
          <div className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Ubicacion</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{festividad.puntoCiudad}</p>
                <p className="text-sm text-gray-500">{festividad.puntoNombre}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link
              to={`/buscar-pasajes?destino=${festividad.puntoCiudad}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-secondary-500 text-white rounded-xl font-bold uppercase text-sm tracking-wide hover:bg-secondary-600 transition-colors shadow-lg shadow-secondary-500/25"
            >
              COMPRAR PASAJE A {festividad.puntoCiudad?.toUpperCase()}
            </Link>
          </div>
        </div>
      </section>

      {/* Barra Compra tu pasaje */}
      <section className="bg-secondary-500 py-4">
        <div className="mx-auto px-4 sm:px-8 lg:px-12">
          <SearchBarHero className="!shadow-none !border-0" />
        </div>
      </section>
    </PublicLayout>
  )
}

export default FestividadDetallePage
