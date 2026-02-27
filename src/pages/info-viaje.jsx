/**
 * Info Viaje Page
 * Pagina publica con contenido dinamico sobre informacion de viaje
 * Estilo Movil Bus: PageHeroBanner + contenido prose centrado
 * Ruta: /info-viaje
 */

import { useState, useEffect } from 'react'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'
import { PageHeroBanner } from '../components/public'
import PublicLayout from '../components/layout/PublicLayout'

const InfoViajePage = () => {
  const [pagina, setPagina] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const cargarPagina = async () => {
      try {
        setLoading(true)
        setError(false)
        const res = await publicService.getPagina('info-viaje')
        setPagina(res.pagina || null)
      } catch (err) {
        console.error('Error cargando pagina info-viaje:', err)
        setError(true)
        setPagina(null)
      } finally {
        setLoading(false)
      }
    }
    cargarPagina()
  }, [])

  const tieneContenido = pagina?.contenido && pagina.contenido.trim().length > 0
  const esHTML = tieneContenido && /<[a-z][\s\S]*>/i.test(pagina.contenido)
  const imagenHero = pagina?.imagenHeroPath || pagina?.imagenHero || pagina?.imagen_hero
  const imagenUrl = imagenHero ? getUploadUrl(imagenHero) : null

  return (
    <PublicLayout>
      <PageHeroBanner
        titulo="Info para tu viaje"
        subtitulo="Informacion"
        imagenFondo={imagenUrl}
        showSearchBar={false}
      />

      <section className="bg-white py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-5" />
              <p className="text-gray-400 text-sm font-medium tracking-wide">
                Cargando contenido...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No pudimos cargar esta pagina
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Ocurrio un error al obtener el contenido. Por favor intenta nuevamente mas tarde.
                </p>
              </div>
            </div>
          )}

          {/* Contenido Dinamico */}
          {!loading && !error && tieneContenido && (
            <article>
              {/* Titulo de la pagina si existe y difiere del banner */}
              {pagina.titulo && pagina.titulo.toLowerCase() !== 'info para tu viaje' && (
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 border-l-4 border-secondary-500 pl-4">
                  {pagina.titulo}
                </h2>
              )}

              {/* Contenido HTML */}
              {esHTML ? (
                <div
                  className="prose prose-lg max-w-none text-gray-600 prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-secondary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-strong:text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: pagina.contenido }}
                />
              ) : (
                /* Contenido Texto Plano */
                <div className="text-gray-600 text-base lg:text-lg leading-relaxed whitespace-pre-line">
                  {pagina.contenido}
                </div>
              )}
            </article>
          )}

          {/* Empty State - Proximamente */}
          {!loading && !error && !tieneContenido && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-14 h-14 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Proximamente...
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Estamos preparando toda la informacion que necesitas para tu viaje.
                  Vuelve pronto para enterarte de todo.
                </p>
                <div className="mt-6 h-1 w-16 bg-secondary-500 rounded-full mx-auto" />
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}

export default InfoViajePage
