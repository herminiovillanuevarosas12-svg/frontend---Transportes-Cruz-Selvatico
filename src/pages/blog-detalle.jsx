/**
 * Blog Detalle - Pagina de articulo individual
 * Muestra el contenido completo del articulo + sidebar recomendados
 * Ruta: /blog/:slug
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'
import PublicLayout from '../components/layout/PublicLayout'
import {
  Loader2,
  Calendar,
  Eye,
  ChevronRight,
  ArrowLeft,
  Tag,
  User
} from 'lucide-react'

const BlogDetallePage = () => {
  const { slug } = useParams()
  const [articulo, setArticulo] = useState(null)
  const [recomendados, setRecomendados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      cargarArticulo()
      cargarRecomendados()
    }
  }, [slug])

  const cargarArticulo = async () => {
    try {
      setLoading(true)
      const res = await publicService.getBlogArticulo(slug)
      setArticulo(res.articulo)
    } catch (error) {
      console.error('Error cargando articulo:', error)
      setArticulo(null)
    } finally {
      setLoading(false)
    }
  }

  const cargarRecomendados = async () => {
    try {
      const res = await publicService.getBlogRecomendados()
      setRecomendados(res.articulos || [])
    } catch (error) {
      console.error('Error cargando recomendados:', error)
    }
  }

  const formatFecha = (fecha) => {
    if (!fecha) return ''
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </PublicLayout>
    )
  }

  if (!articulo) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Articulo no encontrado</h2>
          <p className="text-gray-500 mb-6">El articulo que buscas no existe o fue eliminado.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>
        </div>
      </PublicLayout>
    )
  }

  const tags = articulo.tags ? articulo.tags.split(',').map(t => t.trim()).filter(Boolean) : []

  return (
    <PublicLayout>
      {/* Hero imagen */}
      {articulo.imagenPath && (
        <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
          <img
            src={getUploadUrl(articulo.imagenPath)}
            alt={articulo.titulo}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 max-w-7xl mx-auto">
            {articulo.categoriaNombre && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3"
                style={{ backgroundColor: articulo.categoriaColorBadge || '#2563EB' }}
              >
                {articulo.categoriaNombre}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {articulo.titulo}
            </h1>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-primary-600 transition-colors">Inicio</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/blog" className="hover:text-primary-600 transition-colors">Blog</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium truncate max-w-[300px]">{articulo.titulo}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
          {/* === CONTENIDO PRINCIPAL === */}
          <article>
            {/* Titulo (si no tiene imagen hero) */}
            {!articulo.imagenPath && (
              <>
                {articulo.categoriaNombre && (
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-4"
                    style={{ backgroundColor: articulo.categoriaColorBadge || '#2563EB' }}
                  >
                    {articulo.categoriaNombre}
                  </span>
                )}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                  {articulo.titulo}
                </h1>
              </>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
              {articulo.fechaPublicacion && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatFecha(articulo.fechaPublicacion)}
                </span>
              )}
              {articulo.autor && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {articulo.autor}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {articulo.vistas || 0} vistas
              </span>
            </div>

            {/* Extracto destacado */}
            {articulo.extracto && (
              <div className="bg-primary-50 border-l-4 border-primary-500 p-5 rounded-r-lg mb-8">
                <p className="text-gray-700 leading-relaxed font-medium italic">
                  {articulo.extracto}
                </p>
              </div>
            )}

            {/* Contenido */}
            {articulo.contenido ? (
              <div
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary-600 prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: articulo.contenido }}
              />
            ) : (
              <p className="text-gray-500">Este articulo no tiene contenido disponible.</p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-gray-100">
                <Tag className="w-4 h-4 text-gray-400" />
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Boton volver */}
            <div className="mt-10">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al blog
              </Link>
            </div>
          </article>

          {/* === SIDEBAR === */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6 pl-3 border-l-4 border-primary-500">
                Recomendados
              </h2>
              <div className="space-y-1">
                {recomendados.filter(r => r.slug !== slug).slice(0, 5).map(art => (
                  <Link
                    key={art.id}
                    to={`/blog/${art.slug}`}
                    className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      {art.imagenPath ? (
                        <img src={getUploadUrl(art.imagenPath)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-snug line-clamp-3 group-hover:text-primary-600 transition-colors">
                        {art.extracto || art.titulo}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  )
}

export default BlogDetallePage
