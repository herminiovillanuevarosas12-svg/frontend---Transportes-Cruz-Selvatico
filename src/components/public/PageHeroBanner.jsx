/**
 * PageHeroBanner - Banner hero estilo Movil Bus para subpaginas
 * Imagen full-width con gradiente oscuro, titulo grande, search bar flotante
 */

import SearchBarHero from './SearchBarHero'

const PageHeroBanner = ({ titulo, subtitulo, imagenFondo, showSearchBar = true }) => {
  return (
    <section className="relative">
      {/* Hero Image Area */}
      <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 overflow-hidden">
        {/* Fondo gradiente base */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600" />

        {/* Imagen de fondo */}
        {imagenFondo && (
          <img
            src={imagenFondo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            aria-hidden="true"
          />
        )}

        {/* Gradiente overlay para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />

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
