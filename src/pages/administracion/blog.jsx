/**
 * Blog Admin Page
 * Panel de administracion del blog (Articulos + Categorias)
 */

import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import blogService from '../../services/blogService'
import { getUploadUrl } from '../../services/apiClient'

const getErrorMsg = (error, fallback = 'Error inesperado') =>
  error?.response?.data?.error || error?.response?.data?.message || error?.message || fallback

import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Upload,
  X,
  Save,
  Star,
  Heart,
  Tag,
  Search,
  Loader2,
  ChevronDown,
  Image,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  Link2,
  Heading2,
  Quote,
  Minus
} from 'lucide-react'

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const BlogAdminPage = () => {
  const [tab, setTab] = useState('articulos')
  const [articulos, setArticulos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

  // Modal articulo
  const [showModal, setShowModal] = useState(false)
  const [editandoArticulo, setEditandoArticulo] = useState(null)

  // Modal categoria
  const [showModalCat, setShowModalCat] = useState(false)
  const [editandoCat, setEditandoCat] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [artRes, catRes] = await Promise.all([
        blogService.listarArticulos(),
        blogService.listarCategorias()
      ])
      setArticulos(artRes.articulos || [])
      setCategorias(catRes.categorias || [])
    } catch (error) {
      toast.error(getErrorMsg(error, 'Error cargando datos del blog'))
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // TABS
  // ============================================

  const tabs = [
    { id: 'articulos', label: 'Articulos', icon: FileText },
    { id: 'categorias', label: 'Categorias', icon: Tag }
  ]

  // Filtrar articulos
  const articulosFiltrados = filtro
    ? articulos.filter(a =>
        a.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
        (a.categoriaNombre || '').toLowerCase().includes(filtro.toLowerCase())
      )
    : articulos

  // ============================================
  // ACCIONES ARTICULOS
  // ============================================

  const handleToggleEstado = async (id) => {
    try {
      const res = await blogService.toggleEstado(id)
      toast.success(res.mensaje)
      cargarDatos()
    } catch (error) {
      toast.error(getErrorMsg(error))
    }
  }

  const handleToggleDestacado = async (id) => {
    try {
      await blogService.toggleDestacado(id)
      cargarDatos()
    } catch (error) {
      toast.error(getErrorMsg(error))
    }
  }

  const handleToggleRecomendado = async (id) => {
    try {
      await blogService.toggleRecomendado(id)
      cargarDatos()
    } catch (error) {
      toast.error(getErrorMsg(error))
    }
  }

  const handleEliminarArticulo = async (id, titulo) => {
    if (!confirm(`¿Eliminar el articulo "${titulo}"?`)) return
    try {
      const res = await blogService.eliminarArticulo(id)
      toast.success(res.mensaje)
      cargarDatos()
    } catch (error) {
      toast.error(getErrorMsg(error))
    }
  }

  const handleEditarArticulo = async (id) => {
    try {
      const res = await blogService.obtenerArticulo(id)
      setEditandoArticulo(res.articulo)
      setShowModal(true)
    } catch (error) {
      toast.error(getErrorMsg(error))
    }
  }

  // ============================================
  // ACCIONES CATEGORIAS
  // ============================================

  const handleEliminarCategoria = async (id, nombre) => {
    if (!confirm(`¿Eliminar la categoria "${nombre}"?`)) return
    try {
      const res = await blogService.eliminarCategoria(id)
      toast.success(res.mensaje)
      cargarDatos()
    } catch (error) {
      toast.error(getErrorMsg(error))
    }
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion del Blog</h1>
          <p className="text-sm text-gray-500 mt-1">Administra articulos y categorias del blog</p>
        </div>
        <button
          onClick={() => {
            if (tab === 'articulos') { setEditandoArticulo(null); setShowModal(true) }
            else { setEditandoCat(null); setShowModalCat(true) }
          }}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {tab === 'articulos' ? 'Nuevo Articulo' : 'Nueva Categoria'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : tab === 'articulos' ? (
        /* ===== TAB ARTICULOS ===== */
        <div className="space-y-4">
          {/* Buscador */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar articulos..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Imagen</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Titulo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Dest.</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Rec.</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Vistas</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articulosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        No hay articulos
                      </td>
                    </tr>
                  ) : (
                    articulosFiltrados.map(art => (
                      <tr key={art.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          {art.imagenPath ? (
                            <img src={getUploadUrl(art.imagenPath)} alt="" className="w-14 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-14 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Image className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900 text-sm truncate max-w-[250px]">{art.titulo}</p>
                        </td>
                        <td className="px-4 py-3">
                          {art.categoriaNombre && (
                            <span
                              className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: art.categoriaColor || '#2563EB' }}
                            >
                              {art.categoriaNombre}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleEstado(art.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                              art.estado === 'PUBLICADO'
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                            }`}
                          >
                            {art.estado === 'PUBLICADO' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {art.estado === 'PUBLICADO' ? 'Publicado' : 'Borrador'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleDestacado(art.id)}
                            className={`p-1 rounded transition-colors ${art.destacado ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                            title="Destacado"
                          >
                            <Star className="w-4 h-4" fill={art.destacado ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleRecomendado(art.id)}
                            className={`p-1 rounded transition-colors ${art.recomendado ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
                            title="Recomendado"
                          >
                            <Heart className="w-4 h-4" fill={art.recomendado ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-500">
                          {art.vistas || 0}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditarArticulo(art.id)}
                              className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEliminarArticulo(art.id, art.titulo)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ===== TAB CATEGORIAS ===== */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Slug</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Color</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Orden</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categorias.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      No hay categorias
                    </td>
                  </tr>
                ) : (
                  categorias.map(cat => (
                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 text-sm">{cat.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{cat.slug}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: cat.colorBadge }} />
                          <span className="text-xs text-gray-500">{cat.colorBadge}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">{cat.orden}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditandoCat(cat); setShowModalCat(true) }}
                            className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEliminarCategoria(cat.id, cat.nombre)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== MODAL ARTICULO ===== */}
      {showModal && (
        <ArticuloModal
          articulo={editandoArticulo}
          categorias={categorias}
          onClose={() => { setShowModal(false); setEditandoArticulo(null) }}
          onSaved={() => { setShowModal(false); setEditandoArticulo(null); cargarDatos() }}
        />
      )}

      {/* ===== MODAL CATEGORIA ===== */}
      {showModalCat && (
        <CategoriaModal
          categoria={editandoCat}
          onClose={() => { setShowModalCat(false); setEditandoCat(null) }}
          onSaved={() => { setShowModalCat(false); setEditandoCat(null); cargarDatos() }}
        />
      )}
    </div>
  )
}

// ============================================
// MODAL ARTICULO
// ============================================

const ArticuloModal = ({ articulo, categorias, onClose, onSaved }) => {
  const [form, setForm] = useState({
    titulo: articulo?.titulo || '',
    extracto: articulo?.extracto || '',
    contenido: articulo?.contenido || '',
    idCategoria: articulo?.idCategoria || '',
    autor: articulo?.autor || '',
    destacado: articulo?.destacado || false,
    recomendado: articulo?.recomendado || false,
    estado: articulo?.estado || 'BORRADOR',
    tags: articulo?.tags || '',
    metaDescription: articulo?.metaDescription || ''
  })
  const [imagen, setImagen] = useState(null)
  const [preview, setPreview] = useState(articulo?.imagenPath ? getUploadUrl(articulo.imagenPath) : null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)
  const editorRef = useRef(null)

  const handleImagenChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImagen(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!form.titulo.trim()) {
      toast.error('El titulo es requerido')
      return
    }

    // Capturar contenido del editor antes de enviar
    const contenido = editorRef.current ? editorRef.current.innerHTML : form.contenido

    try {
      setSaving(true)
      const formData = new FormData()
      formData.append('titulo', form.titulo)
      formData.append('extracto', form.extracto)
      formData.append('contenido', contenido)
      formData.append('idCategoria', form.idCategoria)
      formData.append('autor', form.autor)
      formData.append('destacado', form.destacado)
      formData.append('recomendado', form.recomendado)
      formData.append('estado', form.estado)
      formData.append('tags', form.tags)
      formData.append('metaDescription', form.metaDescription)
      if (imagen) formData.append('imagen', imagen)

      if (articulo) {
        await blogService.actualizarArticulo(articulo.id, formData)
        toast.success('Articulo actualizado')
      } else {
        await blogService.crearArticulo(formData)
        toast.success('Articulo creado')
      }
      onSaved()
    } catch (error) {
      toast.error(getErrorMsg(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {articulo ? 'Editar Articulo' : 'Nuevo Articulo'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Titulo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titulo *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm(prev => ({ ...prev, titulo: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Titulo del articulo"
            />
          </div>

          {/* Extracto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Extracto</label>
            <textarea
              value={form.extracto}
              onChange={(e) => setForm(prev => ({ ...prev, extracto: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Resumen corto del articulo"
            />
          </div>

          {/* Contenido - Editor de texto enriquecido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contenido</label>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 border border-gray-200 border-b-0 rounded-t-lg bg-gray-50">
              {[
                { cmd: 'bold', icon: Bold, title: 'Negrita' },
                { cmd: 'italic', icon: Italic, title: 'Cursiva' },
                { cmd: 'underline', icon: Underline, title: 'Subrayado' },
              ].map(btn => (
                <button
                  key={btn.cmd}
                  type="button"
                  title={btn.title}
                  onMouseDown={(e) => { e.preventDefault(); document.execCommand(btn.cmd, false, null) }}
                  className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  <btn.icon className="w-4 h-4" />
                </button>
              ))}
              <span className="w-px h-5 bg-gray-300 mx-1" />
              <button type="button" title="Titulo" onMouseDown={(e) => { e.preventDefault(); document.execCommand('formatBlock', false, 'h2') }}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
                <Heading2 className="w-4 h-4" />
              </button>
              <button type="button" title="Cita" onMouseDown={(e) => { e.preventDefault(); document.execCommand('formatBlock', false, 'blockquote') }}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
                <Quote className="w-4 h-4" />
              </button>
              <span className="w-px h-5 bg-gray-300 mx-1" />
              <button type="button" title="Lista con viñetas" onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertUnorderedList', false, null) }}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
                <List className="w-4 h-4" />
              </button>
              <button type="button" title="Lista numerada" onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertOrderedList', false, null) }}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
                <ListOrdered className="w-4 h-4" />
              </button>
              <span className="w-px h-5 bg-gray-300 mx-1" />
              <button type="button" title="Alinear izquierda" onMouseDown={(e) => { e.preventDefault(); document.execCommand('justifyLeft', false, null) }}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
                <AlignLeft className="w-4 h-4" />
              </button>
              <button type="button" title="Centrar" onMouseDown={(e) => { e.preventDefault(); document.execCommand('justifyCenter', false, null) }}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
                <AlignCenter className="w-4 h-4" />
              </button>
              <span className="w-px h-5 bg-gray-300 mx-1" />
              <button type="button" title="Insertar enlace" onMouseDown={(e) => {
                e.preventDefault()
                const url = prompt('URL del enlace:')
                if (url) document.execCommand('createLink', false, url)
              }}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
                <Link2 className="w-4 h-4" />
              </button>
              <button type="button" title="Linea separadora" onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertHorizontalRule', false, null) }}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
                <Minus className="w-4 h-4" />
              </button>
            </div>
            {/* Area editable */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: form.contenido }}
              onBlur={() => {
                if (editorRef.current) {
                  setForm(prev => ({ ...prev, contenido: editorRef.current.innerHTML }))
                }
              }}
              className="w-full min-h-[250px] max-h-[400px] overflow-y-auto px-4 py-3 border border-gray-200 rounded-b-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 prose prose-sm max-w-none"
              style={{ lineHeight: '1.7' }}
            />
          </div>

          {/* Fila: Categoria + Autor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
              <select
                value={form.idCategoria}
                onChange={(e) => setForm(prev => ({ ...prev, idCategoria: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sin categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Autor</label>
              <input
                type="text"
                value={form.autor}
                onChange={(e) => setForm(prev => ({ ...prev, autor: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Nombre del autor"
              />
            </div>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagen destacada</label>
            <div className="flex items-center gap-4">
              {preview && (
                <img src={preview} alt="" className="w-24 h-16 rounded-lg object-cover" />
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {preview ? 'Cambiar imagen' : 'Subir imagen'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
            </div>
          </div>

          {/* Fila: Estado + Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
              <select
                value={form.estado}
                onChange={(e) => setForm(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="BORRADOR">Borrador</option>
                <option value="PUBLICADO">Publicado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (separados por coma)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="viajes, turismo, tips"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) => setForm(prev => ({ ...prev, destacado: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Destacado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.recomendado}
                onChange={(e) => setForm(prev => ({ ...prev, recomendado: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Recomendado</span>
            </label>
          </div>

          {/* Meta description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta descripcion (SEO)</label>
            <input
              type="text"
              value={form.metaDescription}
              onChange={(e) => setForm(prev => ({ ...prev, metaDescription: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Descripcion para motores de busqueda"
              maxLength={300}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {articulo ? 'Guardar cambios' : 'Crear articulo'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MODAL CATEGORIA
// ============================================

const CategoriaModal = ({ categoria, onClose, onSaved }) => {
  const [form, setForm] = useState({
    nombre: categoria?.nombre || '',
    colorBadge: categoria?.colorBadge || '#2563EB',
    colorFooter: categoria?.colorFooter || '#2563EB',
    orden: categoria?.orden || 0
  })
  const [saving, setSaving] = useState(false)

  const coloresPreset = [
    { label: 'Azul', value: '#2563EB' },
    { label: 'Amarillo', value: '#F59E0B' },
    { label: 'Rojo', value: '#E53935' },
    { label: 'Morado', value: '#8B5CF6' },
    { label: 'Verde', value: '#4A9B52' },
    { label: 'Naranja', value: '#F97316' },
    { label: 'Cyan', value: '#06B6D4' },
    { label: 'Rosa', value: '#EC4899' }
  ]

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!form.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    try {
      setSaving(true)
      if (categoria) {
        await blogService.actualizarCategoria(categoria.id, form)
        toast.success('Categoria actualizada')
      } else {
        await blogService.crearCategoria(form)
        toast.success('Categoria creada')
      }
      onSaved()
    } catch (error) {
      toast.error(getErrorMsg(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {categoria ? 'Editar Categoria' : 'Nueva Categoria'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm(prev => ({ ...prev, nombre: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nombre de la categoria"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {coloresPreset.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, colorBadge: c.value, colorFooter: c.value }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    form.colorBadge === c.value ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.colorBadge}
                onChange={(e) => setForm(prev => ({ ...prev, colorBadge: e.target.value, colorFooter: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-sm text-gray-500">{form.colorBadge}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Orden</label>
            <input
              type="number"
              value={form.orden}
              onChange={(e) => setForm(prev => ({ ...prev, orden: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              min={0}
            />
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-500">Preview:</span>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: form.colorBadge }}
            >
              {form.nombre || 'Categoria'}
            </span>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {categoria ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BlogAdminPage
