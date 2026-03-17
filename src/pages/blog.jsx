/**
 * Blog - Pagina publica del blog
 * Muestra articulos publicados con filtros, paginacion, sidebar y mas leidos
 * Ruta: /blog
 */

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import publicService from '../services/publicService'
import { getUploadUrl } from '../services/apiClient'
import PublicLayout from '../components/layout/PublicLayout'
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  ArrowRight
} from 'lucide-react'

const BlogPage = () => {
  const [articulos, setArticulos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [recomendados, setRecomendados] = useState([])
  const [masLeidos, setMasLeidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [paginacion, setPaginacion] = useState({ page: 1, limit: 6, total: 0, totalPages: 0 })
  const [filtros, setFiltros] = useState({ busqueda: '', categoria: '' })
  const [masLeidosIndex, setMasLeidosIndex] = useState(0)
  const gridRef = useRef(null)

  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  useEffect(() => {
    cargarArticulos()
  }, [paginacion.page, filtros])

  const cargarDatosIniciales = async () => {
    try {
      const [catRes, recRes, mlRes] = await Promise.all([
        publicService.getBlogCategorias().catch(() => ({ categorias: [] })),
        publicService.getBlogRecomendados().catch(() => ({ articulos: [] })),
        publicService.getBlogMasLeidos().catch(() => ({ articulos: [] }))
      ])
      setCategorias(catRes.categorias || [])
      setRecomendados(recRes.articulos || [])
      setMasLeidos(mlRes.articulos || [])
    } catch (error) {
      console.error('Error cargando datos iniciales blog:', error)
    }
  }

  const cargarArticulos = async () => {
    try {
      setLoading(true)
      const params = { page: paginacion.page, limit: 6 }
      if (filtros.busqueda) params.busqueda = filtros.busqueda
      if (filtros.categoria) params.categoria = filtros.categoria

      const res = await publicService.getBlogArticulos(params)
      setArticulos(res.articulos || [])
      setPaginacion(prev => ({ ...prev, ...res.paginacion }))
    } catch (error) {
      console.error('Error cargando articulos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    setPaginacion(prev => ({ ...prev, page: 1 }))
  }

  const handleCategoriaChange = (categoriaSlug) => {
    setFiltros(prev => ({ ...prev, categoria: categoriaSlug }))
    setPaginacion(prev => ({ ...prev, page: 1 }))
  }

  const cambiarPagina = (nuevaPagina) => {
    setPaginacion(prev => ({ ...prev, page: nuevaPagina }))
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const formatFecha = (fecha) => {
    if (!fecha) return ''
    return new Date(fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Carousel mas leidos - mostrar 3 a la vez
  const masLeidosVisibles = masLeidos.slice(masLeidosIndex, masLeidosIndex + 3)
  const canPrevML = masLeidosIndex > 0
  const canNextML = masLeidosIndex + 3 < masLeidos.length

  return (
    <PublicLayout>
      {/* ===== HERO BLOG ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-800 via-primary-600 to-primary-500">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
            Blog Herminio
          </h1>
          <p className="text-lg text-white/80 max-w-lg">
            Descubre lo ultimo sobre viajes, destinos, servicios de transporte y mucho mas.
          </p>
        </div>
      </section>

      {/* ===== BARRA DE BUSQUEDA ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-10 mb-10">
        <form onSubmit={handleBuscar} className="bg-white rounded-xl shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Escribe tu busqueda..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filtros.categoria}
            onChange={(e) => handleCategoriaChange(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[180px]"
          >
            <option value="">Todas las categorias</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.slug}>{cat.nombre}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <div ref={gridRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">

          {/* === GRID DE ARTICULOS === */}
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : articulos.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No se encontraron articulos</p>
                {(filtros.busqueda || filtros.categoria) && (
                  <button
                    onClick={() => { setFiltros({ busqueda: '', categoria: '' }); setPaginacion(prev => ({ ...prev, page: 1 })) }}
                    className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {articulos.map(articulo => (
                    <Link
                      key={articulo.id}
                      to={`/blog/${articulo.slug}`}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
                    >
                      {/* Imagen */}
                      <div className="relative h-48 overflow-hidden">
                        {articulo.imagenPath ? (
                          <img
                            src={getUploadUrl(articulo.imagenPath)}
                            alt={articulo.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                            <span className="text-primary-400 text-4xl font-bold">{articulo.titulo.charAt(0)}</span>
                          </div>
                        )}
                        {/* Badge categoria */}
                        {articulo.categoriaNombre && (
                          <span
                            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: articulo.categoriaColorBadge || '#2563EB' }}
                          >
                            {articulo.categoriaNombre}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {articulo.titulo}
                        </h3>
                        {articulo.extracto && (
                          <p className="text-sm text-gray-500 leading-relaxed flex-1 line-clamp-3">
                            {articulo.extracto}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                          {articulo.fechaPublicacion && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatFecha(articulo.fechaPublicacion)}
                            </span>
                          )}
                          {articulo.vistas > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              {articulo.vistas}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer de color */}
                      <div
                        className="px-5 py-2.5 text-xs font-semibold text-white"
                        style={{ backgroundColor: articulo.categoriaColorFooter || '#2563EB' }}
                      >
                        {articulo.categoriaNombre || 'Sin categoria'}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* === PAGINACION === */}
                {paginacion.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {Array.from({ length: paginacion.totalPages }, (_, i) => i + 1)
                      .filter(p => {
                        // Mostrar: primera, ultima, actual, y adyacentes
                        return p === 1 || p === paginacion.totalPages ||
                               Math.abs(p - paginacion.page) <= 2
                      })
                      .map((p, idx, arr) => (
                        <div key={p} className="flex items-center gap-2">
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="text-gray-400 text-sm">...</span>
                          )}
                          <button
                            onClick={() => cambiarPagina(p)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                              p === paginacion.page
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'border border-gray-200 text-gray-600 hover:border-primary-500 hover:text-primary-600'
                            }`}
                          >
                            {p}
                          </button>
                        </div>
                      ))}
                    {paginacion.page < paginacion.totalPages && (
                      <button
                        onClick={() => cambiarPagina(paginacion.page + 1)}
                        className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-all ml-2"
                      >
                        Siguiente <span className="ml-1">&rarr;</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* === SIDEBAR RECOMENDADOS === */}
          <aside className="hidden lg:block">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6 pl-3 border-l-4 border-primary-500">
              Recomendados
            </h2>
            <div className="space-y-1">
              {recomendados.length === 0 ? (
                <p className="text-sm text-gray-400">No hay articulos recomendados</p>
              ) : (
                recomendados.map(art => (
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
                ))
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ===== LO MAS LEIDO ===== */}
      {masLeidos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="w-1 h-8 bg-secondary-500 rounded-sm" />
              Lo mas leido
            </h2>
            {masLeidos.length > 3 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setMasLeidosIndex(Math.max(0, masLeidosIndex - 3))}
                  disabled={!canPrevML}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                    canPrevML
                      ? 'border-gray-200 hover:border-primary-500 hover:bg-primary-500 hover:text-white text-gray-600'
                      : 'border-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setMasLeidosIndex(Math.min(masLeidos.length - 3, masLeidosIndex + 3))}
                  disabled={!canNextML}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                    canNextML
                      ? 'border-gray-200 hover:border-primary-500 hover:bg-primary-500 hover:text-white text-gray-600'
                      : 'border-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {masLeidosVisibles.map(art => (
              <Link
                key={art.id}
                to={`/blog/${art.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  {art.imagenPath ? (
                    <img
                      src={getUploadUrl(art.imagenPath)}
                      alt={art.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <span className="text-primary-400 text-4xl font-bold">{art.titulo.charAt(0)}</span>
                    </div>
                  )}
                  {art.categoriaNombre && (
                    <span
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: art.categoriaColorBadge || '#2563EB' }}
                    >
                      {art.categoriaNombre}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {art.titulo}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                    {art.extracto}
                  </p>
                </div>
                <div
                  className="px-5 py-2.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: art.categoriaColorFooter || '#2563EB' }}
                >
                  {art.categoriaNombre || 'Sin categoria'}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </PublicLayout>
  )
}

export default BlogPage
