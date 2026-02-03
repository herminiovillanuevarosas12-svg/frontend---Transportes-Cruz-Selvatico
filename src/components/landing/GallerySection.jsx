/**
 * GallerySection - Galeria de imagenes configurable
 * Carrusel horizontal con imagenes desde admin
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { getUploadUrl } from '../../services/apiClient'

const GallerySection = ({ imagenes = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const scrollRef = useRef(null)

  const getVisibleCards = useCallback(() => {
    if (typeof window === 'undefined') return 4
    if (window.innerWidth < 640) return 1
    if (window.innerWidth < 1024) return 2
    return 4
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
  }, [])

  const nextLightbox = useCallback(() => {
    if (imagenes.length === 0) return
    setLightboxIndex((prev) => (prev + 1) % imagenes.length)
  }, [imagenes.length])

  const prevLightbox = useCallback(() => {
    if (imagenes.length === 0) return
    setLightboxIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length)
  }, [imagenes.length])

  // Cerrar con ESC - Hook debe estar siempre en el mismo orden
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextLightbox()
      if (e.key === 'ArrowLeft') prevLightbox()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, closeLightbox, nextLightbox, prevLightbox])

  const getImageUrl = useCallback((imagen) => {
    // Soportar ambos formatos: imagenPath (del API) o imagen_path
    const path = imagen?.imagenPath || imagen?.imagen_path
    if (!path) return ''
    // Usar getUploadUrl que maneja tanto URLs de S3 como rutas relativas
    return getUploadUrl(path)
  }, [])

  // Si no hay imagenes, no mostrar seccion (después de todos los hooks)
  if (!imagenes || imagenes.length === 0) {
    return null
  }

  const scrollToIndex = (index) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth / getVisibleCards()
      scrollRef.current.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth'
      })
    }
  }

  const handlePrev = () => {
    const newIndex = Math.max(0, currentIndex - 1)
    setCurrentIndex(newIndex)
    scrollToIndex(newIndex)
  }

  const handleNext = () => {
    const maxIndex = Math.max(0, imagenes.length - getVisibleCards())
    const newIndex = Math.min(maxIndex, currentIndex + 1)
    setCurrentIndex(newIndex)
    scrollToIndex(newIndex)
  }

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Titulo */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestra Galería
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conoce nuestras instalaciones, unidades y equipo de trabajo
            </p>
          </div>

          {/* Carrusel */}
          <div className="relative">
            {/* Botones de navegacion */}
            {imagenes.length > getVisibleCards() && (
              <>
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex >= imagenes.length - getVisibleCards()}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Grid de imagenes */}
            <div
              ref={scrollRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {imagenes.map((imagen, index) => (
                <div
                  key={imagen.id || index}
                  className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4 snap-start"
                >
                  <div
                    onClick={() => openLightbox(index)}
                    className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg cursor-pointer group relative"
                  >
                    <img
                      src={getImageUrl(imagen)}
                      alt={imagen.titulo || `Imagen ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {imagen.titulo && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white font-medium">{imagen.titulo}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Indicadores */}
            {imagenes.length > getVisibleCards() && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: Math.ceil(imagenes.length / getVisibleCards()) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentIndex(i * getVisibleCards())
                      scrollToIndex(i * getVisibleCards())
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                      Math.floor(currentIndex / getVisibleCards()) === i
                        ? 'bg-primary-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Boton cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navegacion */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              prevLightbox()
            }}
            className="absolute left-4 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              nextLightbox()
            }}
            className="absolute right-4 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Imagen */}
          <div
            className="flex flex-col items-center justify-center max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(imagenes[lightboxIndex])}
              alt={imagenes[lightboxIndex]?.titulo || ''}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {imagenes[lightboxIndex]?.titulo && (
              <div className="text-center mt-4 text-white text-lg">
                {imagenes[lightboxIndex].titulo}
              </div>
            )}
          </div>

          {/* Contador */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {lightboxIndex + 1} / {imagenes.length}
          </div>
        </div>
      )}
    </>
  )
}

export default GallerySection
