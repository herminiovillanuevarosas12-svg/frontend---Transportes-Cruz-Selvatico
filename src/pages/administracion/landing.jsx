/**
 * Landing Admin Page
 * Panel de administración de landing page (Banners + Configuración)
 */

import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import landingService from '../../services/landingService'
import publicService from '../../services/publicService'
import { getUploadUrl } from '../../services/apiClient'
import {
  Image,
  Images,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Upload,
  X,
  Save,
  Link as LinkIcon,
  Calendar,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  PartyPopper,
  MapPin,
  Ticket,
  Package
} from 'lucide-react'

const LandingAdminPage = () => {
  const [activeTab, setActiveTab] = useState('banners')
  const [banners, setBanners] = useState([])
  const [gallery, setGallery] = useState([])
  const [config, setConfig] = useState({
    slogan: '',
    emailContacto: '',
    whatsapp: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    tiktokUrl: '',
    tiempoRotacionBanner: 5,
    imagenExperiencia: null,
    experienciaTitulo: '',
    experienciaDescripcion: '',
    experienciaBadgeNumero: '',
    experienciaBadgeTexto: '',
    experienciaFeatures: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingImgExp, setSavingImgExp] = useState(false)
  const [imgExpPreview, setImgExpPreview] = useState(null)

  // Modal de banner/galería
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('banner') // 'banner' o 'gallery'
  const [editingBanner, setEditingBanner] = useState(null)
  const [bannerForm, setBannerForm] = useState({
    titulo: '',
    subtitulo: '',
    urlDestino: '',
    activo: true,
    fechaInicio: '',
    fechaFin: '',
    imagenPreview: null,
    imagenFile: null
  })

  // Festividades
  const [festividades, setFestividades] = useState([])
  const [puntos, setPuntos] = useState([])
  const [showFestModal, setShowFestModal] = useState(false)
  const [editingFest, setEditingFest] = useState(null)
  const [festForm, setFestForm] = useState({
    titulo: '',
    descripcion: '',
    idPunto: '',
    activo: true,
    orden: 0
  })
  const [festImagenes, setFestImagenes] = useState([])
  const [festImagenesNuevas, setFestImagenesNuevas] = useState([])
  const [savingFest, setSavingFest] = useState(false)
  const [filtroPunto, setFiltroPunto] = useState('')

  // Servicios landing
  const [serviciosLanding, setServiciosLanding] = useState([])
  const [editingServicio, setEditingServicio] = useState(null)
  const [servicioForm, setServicioForm] = useState({
    titulo: '',
    descripcion: '',
    features: ['', '', '', ''],
    ctaTexto: '',
    ctaLink: ''
  })
  const [savingServicio, setSavingServicio] = useState(false)

  const fileInputRef = useRef(null)
  const imgExpInputRef = useRef(null)
  const festImgInputRef = useRef(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [bannersRes, galleryRes, configRes, festRes, puntosRes, serviciosRes] = await Promise.all([
        landingService.listarBanners('banner'),
        landingService.listarBanners('gallery'),
        landingService.getConfigLanding(),
        landingService.listarFestividades().catch(() => ({ festividades: [] })),
        publicService.getPuntos().catch(() => ({ puntos: [] })),
        landingService.listarServicios().catch(() => ({ servicios: [] }))
      ])
      setBanners(bannersRes.banners || [])
      setGallery(galleryRes.banners || [])
      setFestividades(festRes.festividades || [])
      setPuntos(puntosRes.puntos || [])
      setServiciosLanding(serviciosRes.servicios || [])
      if (configRes.config) {
        setConfig({
          slogan: configRes.config.slogan || '',
          emailContacto: configRes.config.emailContacto || '',
          whatsapp: configRes.config.whatsapp || '',
          facebookUrl: configRes.config.facebookUrl || '',
          instagramUrl: configRes.config.instagramUrl || '',
          youtubeUrl: configRes.config.youtubeUrl || '',
          tiktokUrl: configRes.config.tiktokUrl || '',
          tiempoRotacionBanner: configRes.config.tiempoRotacionBanner || 5,
          imagenExperiencia: configRes.config.imagenExperiencia || null,
          experienciaTitulo: configRes.config.experienciaTitulo || '',
          experienciaDescripcion: configRes.config.experienciaDescripcion || '',
          experienciaBadgeNumero: configRes.config.experienciaBadgeNumero || '',
          experienciaBadgeTexto: configRes.config.experienciaBadgeTexto || '',
          experienciaFeatures: configRes.config.experienciaFeatures || ''
        })
        if (configRes.config.imagenExperiencia) {
          setImgExpPreview(getUploadUrl(configRes.config.imagenExperiencia))
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // BANNERS
  // ============================================

  const abrirModalBanner = (banner = null, tipo = 'banner') => {
    setModalType(tipo)
    if (banner) {
      setEditingBanner(banner)
      setBannerForm({
        titulo: banner.titulo || '',
        subtitulo: banner.subtitulo || '',
        urlDestino: banner.urlDestino || '',
        activo: banner.activo !== false,
        fechaInicio: banner.fechaInicio ? banner.fechaInicio.split('T')[0] : '',
        fechaFin: banner.fechaFin ? banner.fechaFin.split('T')[0] : '',
        imagenPreview: banner.imagenPath ? getUploadUrl(banner.imagenPath) : null,
        imagenFile: null
      })
    } else {
      setEditingBanner(null)
      setBannerForm({
        titulo: '',
        subtitulo: '',
        urlDestino: '',
        activo: true,
        fechaInicio: '',
        fechaFin: '',
        imagenPreview: null,
        imagenFile: null
      })
    }
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setEditingBanner(null)
    setBannerForm({
      titulo: '',
      subtitulo: '',
      urlDestino: '',
      activo: true,
      fechaInicio: '',
      fechaFin: '',
      imagenPreview: null,
      imagenFile: null
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB')
        return
      }
      setBannerForm(prev => ({
        ...prev,
        imagenFile: file,
        imagenPreview: URL.createObjectURL(file)
      }))
    }
  }

  const guardarBanner = async () => {
    try {
      if (!editingBanner && !bannerForm.imagenFile) {
        toast.error(`Se requiere una imagen para ${modalType === 'gallery' ? 'la galería' : 'el banner'}`)
        return
      }

      setSaving(true)

      const listaActual = modalType === 'gallery' ? gallery : banners
      const formData = new FormData()
      formData.append('titulo', bannerForm.titulo)
      formData.append('subtitulo', bannerForm.subtitulo)
      formData.append('urlDestino', bannerForm.urlDestino)
      formData.append('activo', bannerForm.activo)
      formData.append('tipo', modalType)
      formData.append('orden', editingBanner?.orden || listaActual.length)
      if (bannerForm.fechaInicio) formData.append('fechaInicio', bannerForm.fechaInicio)
      if (bannerForm.fechaFin) formData.append('fechaFin', bannerForm.fechaFin)
      if (bannerForm.imagenFile) formData.append('imagen', bannerForm.imagenFile)

      if (editingBanner) {
        await landingService.actualizarBanner(editingBanner.id, formData)
        toast.success(modalType === 'gallery' ? 'Imagen actualizada' : 'Banner actualizado')
      } else {
        await landingService.crearBanner(formData)
        toast.success(modalType === 'gallery' ? 'Imagen agregada' : 'Banner creado')
      }

      cerrarModal()
      cargarDatos()
    } catch (error) {
      console.error('Error guardando:', error)
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const eliminarBanner = async (id) => {
    if (!confirm('¿Está seguro de eliminar este banner?')) return

    try {
      await landingService.eliminarBanner(id)
      toast.success('Banner eliminado')
      cargarDatos()
    } catch (error) {
      console.error('Error eliminando banner:', error)
      toast.error('Error al eliminar banner')
    }
  }

  const toggleActivoBanner = async (banner) => {
    try {
      await landingService.actualizarBanner(banner.id, {
        ...banner,
        activo: !banner.activo
      })
      toast.success(banner.activo ? 'Banner desactivado' : 'Banner activado')
      cargarDatos()
    } catch (error) {
      console.error('Error actualizando banner:', error)
      toast.error('Error al actualizar banner')
    }
  }

  const moverBanner = async (index, direction) => {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === banners.length - 1)
    ) return

    const newBanners = [...banners]
    const temp = newBanners[index]
    newBanners[index] = newBanners[index + direction]
    newBanners[index + direction] = temp

    const ordenes = newBanners.map((b, i) => ({ id: b.id, orden: i }))

    try {
      await landingService.reordenarBanners(ordenes)
      setBanners(newBanners)
      toast.success('Orden actualizado')
    } catch (error) {
      console.error('Error reordenando:', error)
      toast.error('Error al reordenar')
    }
  }

  const moverGallery = async (index, direction) => {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === gallery.length - 1)
    ) return

    const newGallery = [...gallery]
    const temp = newGallery[index]
    newGallery[index] = newGallery[index + direction]
    newGallery[index + direction] = temp

    const ordenes = newGallery.map((g, i) => ({ id: g.id, orden: i }))

    try {
      await landingService.reordenarBanners(ordenes)
      setGallery(newGallery)
      toast.success('Orden actualizado')
    } catch (error) {
      console.error('Error reordenando:', error)
      toast.error('Error al reordenar')
    }
  }

  // ============================================
  // FESTIVIDADES
  // ============================================

  const abrirModalFest = (fest = null) => {
    if (fest) {
      setEditingFest(fest)
      setFestForm({
        titulo: fest.titulo || '',
        descripcion: fest.descripcion || '',
        idPunto: fest.idPunto?.toString() || '',
        activo: fest.activo !== false,
        orden: fest.orden || 0
      })
      setFestImagenes(fest.imagenes || [])
    } else {
      setEditingFest(null)
      setFestForm({
        titulo: '',
        descripcion: '',
        idPunto: '',
        activo: true,
        orden: festividades.length
      })
      setFestImagenes([])
    }
    setFestImagenesNuevas([])
    setShowFestModal(true)
  }

  const cerrarModalFest = () => {
    festImagenesNuevas.forEach(img => URL.revokeObjectURL(img.preview))
    setShowFestModal(false)
    setEditingFest(null)
    setFestForm({ titulo: '', descripcion: '', idPunto: '', activo: true, orden: 0 })
    setFestImagenes([])
    setFestImagenesNuevas([])
  }

  const handleFestAddImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB')
      return
    }
    const totalImagenes = festImagenes.length + festImagenesNuevas.length
    if (totalImagenes >= 5) {
      toast.error('Máximo 5 imágenes por festividad')
      return
    }
    setFestImagenesNuevas(prev => [...prev, { file, preview: URL.createObjectURL(file) }])
    e.target.value = ''
  }

  const removeFestNewImage = (index) => {
    setFestImagenesNuevas(prev => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const deleteFestExistingImage = async (imgId) => {
    try {
      await landingService.eliminarImagenFestividad(imgId)
      setFestImagenes(prev => prev.filter(img => img.id !== imgId))
      toast.success('Imagen eliminada')
    } catch (error) {
      console.error('Error eliminando imagen:', error)
      toast.error('Error al eliminar imagen')
    }
  }

  const guardarFest = async () => {
    try {
      if (!festForm.titulo.trim()) {
        toast.error('El titulo es requerido')
        return
      }
      if (!festForm.idPunto) {
        toast.error('Selecciona un punto')
        return
      }

      setSavingFest(true)

      let festId = editingFest?.id

      if (editingFest) {
        await landingService.actualizarFestividad(editingFest.id, festForm)
      } else {
        const res = await landingService.crearFestividad(festForm)
        festId = res.festividad?.id
        if (!festId) throw new Error('No se pudo obtener el ID de la festividad creada')
      }

      // Subir imágenes nuevas
      for (const img of festImagenesNuevas) {
        const fd = new FormData()
        fd.append('imagen', img.file)
        await landingService.agregarImagenFestividad(festId, fd)
      }

      toast.success(editingFest ? 'Festividad actualizada' : 'Festividad creada')
      cerrarModalFest()
      cargarDatos()
    } catch (error) {
      console.error('Error guardando festividad:', error)
      toast.error('Error al guardar festividad')
    } finally {
      setSavingFest(false)
    }
  }

  const eliminarFest = async (id) => {
    if (!confirm('¿Eliminar esta festividad?')) return
    try {
      await landingService.eliminarFestividad(id)
      toast.success('Festividad eliminada')
      cargarDatos()
    } catch (error) {
      console.error('Error eliminando festividad:', error)
      toast.error('Error al eliminar festividad')
    }
  }

  const toggleFest = async (id) => {
    try {
      const res = await landingService.toggleFestividad(id)
      toast.success(res.mensaje)
      cargarDatos()
    } catch (error) {
      console.error('Error toggling festividad:', error)
      toast.error('Error al actualizar festividad')
    }
  }

  const festividadesFiltradas = filtroPunto
    ? festividades.filter(f => f.idPunto?.toString() === filtroPunto)
    : festividades

  // ============================================
  // SERVICIOS LANDING
  // ============================================

  const iconMap = {
    pasajes: Ticket,
    encomiendas: Package
  }

  const abrirEdicionServicio = (servicio) => {
    setEditingServicio(servicio)
    const featuresArr = servicio.features ? servicio.features.split('|') : ['', '', '', '']
    while (featuresArr.length < 4) featuresArr.push('')
    setServicioForm({
      titulo: servicio.titulo || '',
      descripcion: servicio.descripcion || '',
      features: featuresArr,
      ctaTexto: servicio.ctaTexto || '',
      ctaLink: servicio.ctaLink || ''
    })
  }

  const cancelarEdicionServicio = () => {
    setEditingServicio(null)
    setServicioForm({
      titulo: '',
      descripcion: '',
      features: ['', '', '', ''],
      ctaTexto: '',
      ctaLink: ''
    })
  }

  const guardarServicio = async () => {
    try {
      if (!servicioForm.titulo.trim() || !servicioForm.descripcion.trim()) {
        toast.error('Título y descripción son requeridos')
        return
      }
      if (!servicioForm.ctaTexto.trim() || !servicioForm.ctaLink.trim()) {
        toast.error('Texto y link del botón son requeridos')
        return
      }

      setSavingServicio(true)
      const featuresStr = servicioForm.features.filter(f => f.trim()).join('|')
      if (!featuresStr) {
        toast.error('Al menos una característica es requerida')
        setSavingServicio(false)
        return
      }

      await landingService.actualizarServicio(editingServicio.id, {
        titulo: servicioForm.titulo,
        descripcion: servicioForm.descripcion,
        features: featuresStr,
        ctaTexto: servicioForm.ctaTexto,
        ctaLink: servicioForm.ctaLink
      })
      toast.success('Servicio actualizado')
      cancelarEdicionServicio()
      cargarDatos()
    } catch (error) {
      console.error('Error guardando servicio:', error)
      toast.error('Error al guardar servicio')
    } finally {
      setSavingServicio(false)
    }
  }

  // ============================================
  // IMAGEN EXPERIENCIA
  // ============================================

  const handleImgExpChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB')
        return
      }
      subirImagenExperiencia(file)
    }
  }

  const subirImagenExperiencia = async (file) => {
    try {
      setSavingImgExp(true)
      const formData = new FormData()
      formData.append('imagen', file)
      const res = await landingService.subirImagenExperiencia(formData)
      setConfig(prev => ({ ...prev, imagenExperiencia: res.imagenExperiencia }))
      setImgExpPreview(getUploadUrl(res.imagenExperiencia))
      toast.success('Imagen de experiencia actualizada')
    } catch (error) {
      console.error('Error subiendo imagen de experiencia:', error)
      toast.error('Error al subir imagen')
    } finally {
      setSavingImgExp(false)
    }
  }

  const eliminarImgExperiencia = async () => {
    if (!confirm('¿Eliminar la imagen de la sección Experiencia?')) return
    try {
      setSavingImgExp(true)
      await landingService.eliminarImagenExperiencia()
      setConfig(prev => ({ ...prev, imagenExperiencia: null }))
      setImgExpPreview(null)
      toast.success('Imagen eliminada')
    } catch (error) {
      console.error('Error eliminando imagen:', error)
      toast.error('Error al eliminar imagen')
    } finally {
      setSavingImgExp(false)
    }
  }

  // ============================================
  // CONFIGURACIÓN
  // ============================================

  const guardarConfig = async () => {
    try {
      setSaving(true)
      await landingService.actualizarConfigLanding(config)
      toast.success('Configuración guardada')
    } catch (error) {
      console.error('Error guardando config:', error)
      toast.error('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Landing Page</h1>
          <p className="mt-1 text-gray-500">Gestiona el contenido de la página de inicio pública</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('banners')}
              className={`pb-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'banners'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Banners
              </div>
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`pb-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'gallery'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Images className="w-4 h-4" />
                Galería
              </div>
            </button>
            <button
              onClick={() => setActiveTab('festividades')}
              className={`pb-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'festividades'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <PartyPopper className="w-4 h-4" />
                Festividades
              </div>
            </button>
            <button
              onClick={() => setActiveTab('servicios')}
              className={`pb-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'servicios'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Servicios
              </div>
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`pb-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'config'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuración
              </div>
            </button>
          </nav>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Tab: Banners */}
        {!loading && activeTab === 'banners' && (
          <div className="space-y-6">
            {/* Botón agregar */}
            <div className="flex justify-end">
              <button
                onClick={() => abrirModalBanner()}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agregar Banner
              </button>
            </div>

            {/* Lista de banners */}
            {banners.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No hay banners</h3>
                <p className="text-gray-500 mt-1">Agrega tu primer banner para el carrusel</p>
              </div>
            ) : (
              <div className="space-y-3">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`bg-white rounded-xl border ${banner.activo ? 'border-gray-200' : 'border-gray-200 bg-gray-50'} p-4 flex items-center gap-4`}
                  >
                    {/* Imagen thumbnail */}
                    <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={getUploadUrl(banner.imagenPath)}
                        alt={banner.titulo || 'Banner'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = '/placeholder-banner.jpg'
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${banner.activo ? 'text-gray-900' : 'text-gray-500'}`}>
                        {banner.titulo || '(Sin título)'}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {banner.subtitulo || '(Sin subtítulo)'}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        {banner.urlDestino && (
                          <span className="flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            Con enlace
                          </span>
                        )}
                        {banner.fechaInicio && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {banner.fechaInicio.split('T')[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        banner.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {banner.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moverBanner(index, -1)}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30"
                        title="Subir"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moverBanner(index, 1)}
                        disabled={index === banners.length - 1}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30"
                        title="Bajar"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActivoBanner(banner)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title={banner.activo ? 'Desactivar' : 'Activar'}
                      >
                        {banner.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => abrirModalBanner(banner)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => eliminarBanner(banner.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Galería */}
        {!loading && activeTab === 'gallery' && (
          <div className="space-y-6">
            {/* Botón agregar */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Imágenes que se mostrarán en la sección de galería de la landing page
              </p>
              <button
                onClick={() => abrirModalBanner(null, 'gallery')}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agregar Imagen
              </button>
            </div>

            {/* Lista de imágenes */}
            {gallery.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Images className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No hay imágenes</h3>
                <p className="text-gray-500 mt-1">Agrega imágenes para mostrar en la galería</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((img, index) => (
                  <div
                    key={img.id}
                    className={`bg-white rounded-xl border ${img.activo ? 'border-gray-200' : 'border-gray-200 opacity-60'} overflow-hidden group`}
                  >
                    {/* Imagen */}
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={getUploadUrl(img.imagenPath)}
                        alt={img.titulo || 'Imagen'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = '/placeholder-banner.jpg'
                        }}
                      />
                      {/* Overlay con acciones */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirModalBanner(img, 'gallery')}
                          className="p-2 bg-white rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActivoBanner(img)}
                          className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                          title={img.activo ? 'Desactivar' : 'Activar'}
                        >
                          {img.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => eliminarBanner(img.id)}
                          className="p-2 bg-white rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <p className={`text-sm font-medium truncate ${img.activo ? 'text-gray-900' : 'text-gray-500'}`}>
                        {img.titulo || '(Sin título)'}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${img.activo ? 'text-green-600' : 'text-gray-400'}`}>
                          {img.activo ? 'Activa' : 'Inactiva'}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => moverGallery(index, -1)}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moverGallery(index, 1)}
                            disabled={index === gallery.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Festividades */}
        {!loading && activeTab === 'festividades' && (
          <div className="space-y-6">
            {/* Header con filtro y botón */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <select
                  value={filtroPunto}
                  onChange={(e) => setFiltroPunto(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todos los puntos</option>
                  {puntos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} - {p.ciudad}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-500">
                  {festividadesFiltradas.length} festividad{festividadesFiltradas.length !== 1 ? 'es' : ''}
                </span>
              </div>
              <button
                onClick={() => abrirModalFest()}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agregar Festividad
              </button>
            </div>

            {/* Lista */}
            {festividadesFiltradas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <PartyPopper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No hay festividades</h3>
                <p className="text-gray-500 mt-1">Agrega festividades para mostrar en la landing</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {festividadesFiltradas.map((fest) => (
                  <div
                    key={fest.id}
                    className={`bg-white rounded-xl border ${fest.activo ? 'border-gray-200' : 'border-gray-200 opacity-60'} overflow-hidden group`}
                  >
                    {/* Imagen */}
                    <div className="aspect-[16/10] relative overflow-hidden">
                      {fest.imagenes?.[0]?.imagenPath ? (
                        <img
                          src={getUploadUrl(fest.imagenes[0].imagenPath)}
                          alt={fest.titulo}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = '/placeholder-banner.jpg'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <PartyPopper className="w-12 h-12 text-primary-300" />
                        </div>
                      )}
                      {fest.imagenes?.length > 1 && (
                        <div className="absolute bottom-2 right-2">
                          <span className="px-2 py-0.5 bg-black/60 text-white rounded-full text-xs">
                            {fest.imagenes.length} fotos
                          </span>
                        </div>
                      )}
                      {/* Badge ciudad */}
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm text-primary-700 rounded-full text-xs font-semibold">
                          <MapPin className="w-3 h-3" />
                          {fest.puntoCiudad}
                        </span>
                      </div>
                      {/* Overlay acciones */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirModalFest(fest)}
                          className="p-2 bg-white rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFest(fest.id)}
                          className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                          title={fest.activo ? 'Desactivar' : 'Activar'}
                        >
                          {fest.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => eliminarFest(fest.id)}
                          className="p-2 bg-white rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-4">
                      <h3 className={`font-semibold truncate ${fest.activo ? 'text-gray-900' : 'text-gray-500'}`}>
                        {fest.titulo}
                      </h3>
                      {fest.descripcion && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{fest.descripcion}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400">{fest.puntoNombre}</span>
                        <span className={`text-xs font-medium ${fest.activo ? 'text-green-600' : 'text-gray-400'}`}>
                          {fest.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Servicios Landing */}
        {!loading && activeTab === 'servicios' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Edita el contenido de la sección "Soluciones de transporte completas" de la landing page
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {serviciosLanding.map((servicio) => {
                const Icon = iconMap[servicio.clave] || Ticket
                const isEditing = editingServicio?.id === servicio.id
                const isPasajes = servicio.clave === 'pasajes'

                return (
                  <div
                    key={servicio.id}
                    className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${isEditing ? 'ring-2 ring-primary-500' : ''}`}
                  >
                    {/* Header con color del servicio */}
                    <div className={`px-6 py-4 ${isPasajes ? 'bg-gradient-to-r from-primary-600 to-primary-700' : 'bg-gradient-to-r from-secondary-500 to-secondary-600'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{servicio.titulo}</h3>
                          <p className="text-white/70 text-xs">Clave: {servicio.clave}</p>
                        </div>
                        {!isEditing && (
                          <button
                            onClick={() => abrirEdicionServicio(servicio)}
                            className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                              type="text"
                              value={servicioForm.titulo}
                              onChange={(e) => setServicioForm(prev => ({ ...prev, titulo: e.target.value }))}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea
                              value={servicioForm.descripcion}
                              onChange={(e) => setServicioForm(prev => ({ ...prev, descripcion: e.target.value }))}
                              rows={2}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Características (4)</label>
                            <div className="space-y-2">
                              {servicioForm.features.map((feat, i) => (
                                <input
                                  key={i}
                                  type="text"
                                  value={feat}
                                  onChange={(e) => {
                                    const newFeatures = [...servicioForm.features]
                                    newFeatures[i] = e.target.value
                                    setServicioForm(prev => ({ ...prev, features: newFeatures }))
                                  }}
                                  placeholder={`Característica ${i + 1}`}
                                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Texto del botón</label>
                              <input
                                type="text"
                                value={servicioForm.ctaTexto}
                                onChange={(e) => setServicioForm(prev => ({ ...prev, ctaTexto: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Link del botón</label>
                              <input
                                type="text"
                                value={servicioForm.ctaLink}
                                onChange={(e) => setServicioForm(prev => ({ ...prev, ctaLink: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={cancelarEdicionServicio}
                              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl text-sm transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={guardarServicio}
                              disabled={savingServicio}
                              className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                            >
                              {savingServicio ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">{servicio.descripcion}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {servicio.features?.split('|').map((feat, i) => (
                              <span key={i} className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full flex-shrink-0" />
                                {feat}
                              </span>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-400">Botón: {servicio.ctaTexto}</span>
                            <span className="text-xs text-gray-400">{servicio.ctaLink}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {serviciosLanding.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No hay servicios configurados</h3>
                <p className="text-gray-500 mt-1">Los servicios se cargan automáticamente desde la base de datos</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Configuración */}
        {!loading && activeTab === 'config' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-8">
            {/* Slogan */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Slogan</h3>
              <input
                type="text"
                value={config.slogan}
                onChange={(e) => setConfig(prev => ({ ...prev, slogan: e.target.value }))}
                placeholder="Viaja seguro, envía confiado"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Datos de Contacto</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={config.emailContacto}
                    onChange={(e) => setConfig(prev => ({ ...prev, emailContacto: e.target.value }))}
                    placeholder="Email de contacto"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={config.whatsapp}
                    onChange={(e) => setConfig(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="WhatsApp (+51 999 999 999)"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Redes Sociales */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Redes Sociales</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={config.facebookUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, facebookUrl: e.target.value }))}
                    placeholder="URL de Facebook"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={config.instagramUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, instagramUrl: e.target.value }))}
                    placeholder="URL de Instagram"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={config.youtubeUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder="URL de YouTube"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.19 8.19 0 004.77 1.53V6.79a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                  <input
                    type="url"
                    value={config.tiktokUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, tiktokUrl: e.target.value }))}
                    placeholder="URL de TikTok"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Carrusel */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Carrusel de Banners</h3>
              <div className="max-w-xs">
                <label className="block text-sm text-gray-500 mb-2">
                  Tiempo de rotación (segundos)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={config.tiempoRotacionBanner}
                    onChange={(e) => setConfig(prev => ({ ...prev, tiempoRotacionBanner: parseInt(e.target.value) || 5 }))}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Imagen Sección Experiencia */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Imagen Sección "Haz de tus Viajes una Gran Experiencia"</h3>
              <p className="text-xs text-gray-500 mb-4">Esta imagen se muestra en la sección de experiencia del landing page. Recomendado: 800x600px, max 5MB.</p>
              <div className="flex items-start gap-6">
                <div
                  onClick={() => !savingImgExp && imgExpInputRef.current?.click()}
                  className="relative w-64 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 hover:border-primary-300 transition-colors flex-shrink-0"
                >
                  {savingImgExp && (
                    <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {imgExpPreview ? (
                    <>
                      <img
                        src={imgExpPreview}
                        alt="Imagen experiencia"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium text-sm">Cambiar imagen</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-xs">Clic para subir imagen</span>
                    </div>
                  )}
                </div>
                {imgExpPreview && (
                  <button
                    onClick={eliminarImgExperiencia}
                    disabled={savingImgExp}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                )}
              </div>
              <input
                ref={imgExpInputRef}
                type="file"
                accept="image/*"
                onChange={handleImgExpChange}
                className="hidden"
              />
            </div>

            {/* Textos Sección Experiencia */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Textos Sección "Experiencia de Viaje"</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">Título</label>
                  <input
                    type="text"
                    value={config.experienciaTitulo}
                    onChange={(e) => setConfig(prev => ({ ...prev, experienciaTitulo: e.target.value }))}
                    placeholder="Haz de tus Viajes una Gran Experiencia"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">Descripción</label>
                  <textarea
                    value={config.experienciaDescripcion}
                    onChange={(e) => setConfig(prev => ({ ...prev, experienciaDescripcion: e.target.value }))}
                    placeholder="En cada viaje nos esforzamos por brindarte el mejor servicio..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1.5">Badge número</label>
                    <input
                      type="text"
                      value={config.experienciaBadgeNumero}
                      onChange={(e) => setConfig(prev => ({ ...prev, experienciaBadgeNumero: e.target.value }))}
                      placeholder="+10"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1.5">Badge texto</label>
                    <input
                      type="text"
                      value={config.experienciaBadgeTexto}
                      onChange={(e) => setConfig(prev => ({ ...prev, experienciaBadgeTexto: e.target.value }))}
                      placeholder="Años de experiencia"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">
                    Características (una por línea, se muestran como lista con checks)
                  </label>
                  <textarea
                    value={config.experienciaFeatures ? config.experienciaFeatures.split('|').join('\n') : ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      experienciaFeatures: e.target.value.split('\n').join('|')
                    }))}
                    placeholder={'Asientos reclinables y espaciosos\nAire acondicionado en todas las unidades\nBuses modernos y bien mantenidos'}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {config.experienciaFeatures ? config.experienciaFeatures.split('|').filter(f => f.trim()).length : 0} características
                  </p>
                </div>
              </div>
            </div>

            {/* Botón guardar */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={guardarConfig}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Guardar Configuración
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Banner */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {modalType === 'gallery'
                  ? (editingBanner ? 'Editar Imagen' : 'Nueva Imagen')
                  : (editingBanner ? 'Editar Banner' : 'Nuevo Banner')
                }
              </h2>
              <button
                onClick={cerrarModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Preview de imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Banner *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 hover:border-primary-300 transition-colors"
                >
                  {bannerForm.imagenPreview ? (
                    <>
                      <img
                        src={bannerForm.imagenPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium">Cambiar imagen</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <Upload className="w-10 h-10 mb-2" />
                      <span className="text-sm">Clic para seleccionar imagen</span>
                      <span className="text-xs mt-1">Recomendado: 1920x600px, max 5MB</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Título y Subtítulo */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={bannerForm.titulo}
                    onChange={(e) => setBannerForm(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Título del banner"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={bannerForm.subtitulo}
                    onChange={(e) => setBannerForm(prev => ({ ...prev, subtitulo: e.target.value }))}
                    placeholder="Subtítulo del banner"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* URL destino */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de destino (opcional)
                </label>
                <input
                  type="url"
                  value={bannerForm.urlDestino}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, urlDestino: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Fechas */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha inicio (opcional)
                  </label>
                  <input
                    type="date"
                    value={bannerForm.fechaInicio}
                    onChange={(e) => setBannerForm(prev => ({ ...prev, fechaInicio: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha fin (opcional)
                  </label>
                  <input
                    type="date"
                    value={bannerForm.fechaFin}
                    onChange={(e) => setBannerForm(prev => ({ ...prev, fechaFin: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="activo"
                  checked={bannerForm.activo}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, activo: e.target.checked }))}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                  Banner activo
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={cerrarModal}
                className="px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarBanner}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {editingBanner ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Festividad */}
      {showFestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingFest ? 'Editar Festividad' : 'Nueva Festividad'}
              </h2>
              <button
                onClick={cerrarModalFest}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Imágenes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imágenes (máx. 5)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {/* Imágenes existentes */}
                  {festImagenes.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                      <img
                        src={getUploadUrl(img.imagenPath)}
                        alt="Foto festividad"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-banner.jpg' }}
                      />
                      <button
                        onClick={() => deleteFestExistingImage(img.id)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Imágenes nuevas (pendientes de subir) */}
                  {festImagenesNuevas.map((img, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-primary-300 group">
                      <img
                        src={img.preview}
                        alt="Nueva foto"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-primary-500/10" />
                      <button
                        onClick={() => removeFestNewImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary-600 text-white text-[10px] rounded font-medium">
                        Nueva
                      </span>
                    </div>
                  ))}

                  {/* Botón agregar */}
                  {(festImagenes.length + festImagenesNuevas.length) < 5 && (
                    <div
                      onClick={() => festImgInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                    >
                      <Plus className="w-6 h-6 text-gray-400" />
                      <span className="text-[10px] text-gray-400 mt-1">Agregar</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {festImagenes.length + festImagenesNuevas.length}/5 imágenes · Recomendado: 800x500px, max 5MB
                </p>
                <input
                  ref={festImgInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFestAddImage}
                  className="hidden"
                />
              </div>

              {/* Punto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Punto (Agencia/Terminal) *
                </label>
                <select
                  value={festForm.idPunto}
                  onChange={(e) => setFestForm(prev => ({ ...prev, idPunto: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccionar punto...</option>
                  {puntos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} - {p.ciudad}</option>
                  ))}
                </select>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titulo *
                </label>
                <input
                  type="text"
                  value={festForm.titulo}
                  onChange={(e) => setFestForm(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Nombre de la festividad o evento"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={festForm.descripcion}
                  onChange={(e) => setFestForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción del evento o festividad..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Estado */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="festActivo"
                  checked={festForm.activo}
                  onChange={(e) => setFestForm(prev => ({ ...prev, activo: e.target.checked }))}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="festActivo" className="text-sm font-medium text-gray-700">
                  Festividad activa (visible en landing)
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={cerrarModalFest}
                className="px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarFest}
                disabled={savingFest}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {savingFest ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {editingFest ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LandingAdminPage
