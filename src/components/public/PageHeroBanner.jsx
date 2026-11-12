/**
 * PageHeroBanner - Banner hero estilo Movil Bus para subpaginas
 * Imagen full-width con gradiente oscuro, titulo grande, search bar flotante.
 * Con `imagenesFondo` (2+ URLs) el fondo rota como carrusel con fundido.
 */

import { useState, useEffect } from 'react'
import SearchBarHero from './SearchBarHero'

const INTERVALO_CARRUSEL_MS = 5000

const PageHeroBanner = ({ titulo, subtitulo, imagenFondo, imagenesFondo, showSearchBar = true }) => {
  const imagenes = imagenesFondo?.length ? imagenesFondo : (imagenFondo ? [imagenFondo] : [])
  const esCarrusel = imagenes.length > 1
  const [indiceActual, setIndiceActual] = useState(0)

  // Si la lista cambia y el indice queda fuera de rango, volver al inicio
  useEffect(() => {
    if (indiceActual >= imagenes.length) setIndiceActual(0)
  }, [imagenes.length, indiceActual])

  // Rotacion automatica; se reinicia al elegir una imagen con los indicadores
  useEffect(() => {
    if (!esCarrusel) return
    const timer = setTimeout(
      () => setIndiceActual((prev) => (prev + 1) % imagenes.length),
      INTERVALO_CARRUSEL_MS
    )
    return () => clearTimeout(timer)
  }, [esCarrusel, imagenes.length, indiceActual])

  return (
    <section className="relative">
      {/* Hero Image Area */}
      <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 overflow-hidden">
        {/* Fondo de respaldo si no hay imagen */}
        <div className="absolute inset-0 bg-gray-900" />

        {/* Imagen(es) de fondo - sin filtro verde; en carrusel se apilan y se funden */}
        {imagenes.map((src, idx) => (
          <img
            key={`${idx}-${src}`}
            src={src}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
              idx === indiceActual ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Overlay negro sutil solo para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        {/* Contenido del hero */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              {subtitulo && (
                <p className="text-white/80 text-sm md:text-base mb-1">
                  {subtitulo}
                </p>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white italic leading-tight">
                {titulo}
              </h1>
            </div>
          </div>
        </div>

        {/* Indicadores del carrusel */}
        {esCarrusel && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {imagenes.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setIndiceActual(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === indiceActual ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Ver imagen ${idx + 1}`}
                aria-current={idx === indiceActual}
              />
            ))}
          </div>
        )}
      </div>

      {/* Search Bar flotante - overlap del hero */}
      {showSearchBar && (
        <div className="relative z-20 max-w-5xl mx-auto px-4 -mt-8 sm:-mt-10">
          <SearchBarHero />
        </div>
      )}

      {/* Espacio para el search bar flotante */}
      {showSearchBar && <div className="h-8 sm:h-10" />}
    </section>
  )
}

export default PageHeroBanner
