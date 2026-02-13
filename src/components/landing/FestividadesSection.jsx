/**
 * FestividadesSection - Sección de festividades por punto en la landing
 * Muestra cards con imagen, título, descripción y badge de ciudad/punto
 */

import { useState, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, MapPin, PartyPopper } from 'lucide-react'
import { getUploadUrl } from '../../services/apiClient'

const FestividadesSection = ({ festividades = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef(null)

  const getVisibleCards = useCallback(() => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth < 640) return 1
    if (window.innerWidth < 1024) return 2
    return 3
  }, [])

  if (!festividades || festividades.length === 0) {
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
    const maxIndex = Math.max(0, festividades.length - getVisibleCards())
    const newIndex = Math.min(maxIndex, currentIndex + 1)
    setCurrentIndex(newIndex)
    scrollToIndex(newIndex)
  }

  const getImageUrl = (festividad) => {
    const path = festividad?.imagenPath || festividad?.imagen_path
    if (!path) return null
    return getUploadUrl(path)
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titulo */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500 rounded-full text-white text-sm font-medium mb-4">
            <PartyPopper className="w-4 h-4" />
            Festividades
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-4">
            Eventos y Celebraciones
          </h2>
          <p className="text-lg text-primary-600 max-w-2xl mx-auto">
            Descubre las festividades y eventos en nuestros destinos
          </p>
        </div>

        {/* Carrusel */}
        <div className="relative">
          {/* Botones de navegacion */}
          {festividades.length > getVisibleCards() && (
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
                disabled={currentIndex >= festividades.length - getVisibleCards()}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Cards */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {festividades.map((festividad, index) => {
              const imgUrl = getImageUrl(festividad)
              return (
                <div
                  key={festividad.id || index}
                  className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start"
                >
                  <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden shadow-md hover:shadow-xl hover:border-primary-300 transition-all duration-300 group h-full flex flex-col">
                    {/* Imagen */}
                    {imgUrl ? (
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img
                          src={imgUrl}
                          alt={festividad.titulo}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = '/placeholder-banner.jpg'
                          }}
                        />
                        {/* Badge ciudad */}
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-primary-700 rounded-full text-xs font-semibold shadow-sm">
                            <MapPin className="w-3 h-3" />
                            {festividad.puntoCiudad}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
                        <PartyPopper className="w-16 h-16 text-primary-300" />
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-primary-700 rounded-full text-xs font-semibold shadow-sm">
                            <MapPin className="w-3 h-3" />
                            {festividad.puntoCiudad}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Contenido */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-primary-800 mb-2 group-hover:text-primary-600 transition-colors">
                        {festividad.titulo}
                      </h3>
                      {festividad.descripcion && (
                        <p className="text-sm text-gray-600 leading-relaxed flex-1 line-clamp-3">
                          {festividad.descripcion}
                        </p>
                      )}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-primary-500 font-medium">
                          {festividad.puntoNombre}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Indicadores */}
          {festividades.length > getVisibleCards() && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.ceil(festividades.length / getVisibleCards()) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const idx = i * getVisibleCards()
                    setCurrentIndex(idx)
                    scrollToIndex(idx)
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
  )
}

export default FestividadesSection
