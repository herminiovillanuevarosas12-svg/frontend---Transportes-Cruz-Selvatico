/**
 * BannerCarousel Component
 * Carrusel de banners con auto-rotación para landing page
 */

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getUploadUrl } from '../../services/apiClient'

const BannerCarousel = ({
  banners = [],
  autoPlay = true,
  interval = 5000,
  showArrows = true,
  showIndicators = true,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Navegar al siguiente banner
  const nextSlide = useCallback(() => {
    if (banners.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  // Navegar al banner anterior
  const prevSlide = useCallback(() => {
    if (banners.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  // Ir a un banner específico
  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  // Auto-play
  useEffect(() => {
    if (!autoPlay || banners.length <= 1 || isHovered) return

    const timer = setInterval(nextSlide, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, banners.length, isHovered, nextSlide])

  // Si no hay banners, mostrar placeholder
  if (banners.length === 0) {
    return (
      <div className={`relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-xl font-semibold">Bienvenido</p>
            <p className="text-primary-200 mt-2">Viaja seguro, envía confiado</p>
          </div>
        </div>
      </div>
    )
  }

  const currentBanner = banners[currentIndex]

  return (
    <div
      className={`relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banners */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Imagen de fondo */}
            <div className="absolute inset-0">
              <img
                src={getUploadUrl(banner.imagenPath)}
                alt={banner.titulo || 'Banner'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = '/placeholder-banner.jpg'
                }}
              />
              {/* Overlay oscuro para legibilidad del texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            {/* Contenido del banner (título y subtítulo) */}
            {(banner.titulo || banner.subtitulo) && (
              <div className="absolute inset-0 flex items-end justify-start z-20">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-24 md:pb-32">
                  <div className="max-w-2xl">
                    {banner.titulo && (
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg animate-fade-in">
                        {banner.titulo}
                      </h2>
                    )}
                    {banner.subtitulo && (
                      <p className="mt-4 text-lg md:text-xl text-white/90 drop-shadow-md animate-fade-in animation-delay-200">
                        {banner.subtitulo}
                      </p>
                    )}
                    {banner.urlDestino && (
                      <a
                        href={banner.urlDestino}
                        className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-secondary-500 text-white rounded-xl font-semibold hover:bg-secondary-600 transition-colors animate-fade-in animation-delay-400"
                      >
                        Ver más
                        <ChevronRight className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Flechas de navegación */}
      {showArrows && banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
            style={{ opacity: isHovered ? 1 : 0 }}
            aria-label="Banner anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
            style={{ opacity: isHovered ? 1 : 0 }}
            aria-label="Banner siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicadores */}
      {showIndicators && banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 h-2 bg-white rounded-full'
                  : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/75'
              }`}
              aria-label={`Ir a banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BannerCarousel
