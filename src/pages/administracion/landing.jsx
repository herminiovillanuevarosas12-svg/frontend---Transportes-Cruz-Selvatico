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
  Package,
  Truck,
  Globe,
  Shield,
  Zap,
  Heart,
  Star,
  Search,
  Bus,
  Armchair,
  Thermometer,
  Wind,
  Wifi,
  Monitor,
  Headphones,
  Battery,
  Coffee,
  Sparkles,
  CircleDot,
  Navigation,
  Route,
  Gauge,
  ShieldCheck,
  CheckCircle2,
  Tv,
  Usb,
  PlugZap,
  Snowflake,
  Music,
  Power,
  BedDouble,
  Sofa,
  Footprints,
  Megaphone,
  Users,
  Target,
  Award,
  Lightbulb,
  HandHeart,
  HelpCircle,
  MessageSquare
} from 'lucide-react'

// Iconos disponibles para la sección de experiencia (relacionados al rubro transporte)
const ICONOS_EXPERIENCIA = [
  { key: 'Armchair', icon: Armchair, label: 'Asientos' },
  { key: 'BedDouble', icon: BedDouble, label: 'Cama' },
  { key: 'Sofa', icon: Sofa, label: 'Sofá' },
  { key: 'Thermometer', icon: Thermometer, label: 'Climatización' },
  { key: 'Snowflake', icon: Snowflake, label: 'Aire frío' },
  { key: 'Wind', icon: Wind, label: 'Ventilación' },
  { key: 'Wifi', icon: Wifi, label: 'WiFi' },
  { key: 'Monitor', icon: Monitor, label: 'Pantalla' },
  { key: 'Tv', icon: Tv, label: 'TV' },
  { key: 'Headphones', icon: Headphones, label: 'Audio' },
  { key: 'Music', icon: Music, label: 'Música' },
  { key: 'Coffee', icon: Coffee, label: 'Servicio' },
  { key: 'Battery', icon: Battery, label: 'Energía' },
  { key: 'Usb', icon: Usb, label: 'USB' },
  { key: 'PlugZap', icon: PlugZap, label: 'Enchufe' },
  { key: 'Power', icon: Power, label: 'Corriente' },
  { key: 'Shield', icon: Shield, label: 'Seguridad' },
  { key: 'ShieldCheck', icon: ShieldCheck, label: 'Protección' },
  { key: 'Bus', icon: Bus, label: 'Bus' },
  { key: 'Navigation', icon: Navigation, label: 'GPS' },
  { key: 'Route', icon: Route, label: 'Ruta' },
  { key: 'Gauge', icon: Gauge, label: 'Velocidad' },
  { key: 'Sparkles', icon: Sparkles, label: 'Premium' },
  { key: 'Star', icon: Star, label: 'Estrella' },
  { key: 'Eye', icon: Eye, label: 'Visión' },
  { key: 'Footprints', icon: Footprints, label: 'Comodidad' },
  { key: 'Globe', icon: Globe, label: 'Cobertura' },
  { key: 'Clock', icon: Clock, label: 'Puntualidad' },
  { key: 'CheckCircle2', icon: CheckCircle2, label: 'Verificado' },
  { key: 'Megaphone', icon: Megaphone, label: 'Anuncios' },
]

const ICONOS_VENTAJA = [
  { key: 'Package', icon: Package, label: 'Paquete' },
  { key: 'Truck', icon: Truck, label: 'Camion' },
  { key: 'Globe', icon: Globe, label: 'Global' },
  { key: 'Shield', icon: Shield, label: 'Seguridad' },
  { key: 'MapPin', icon: MapPin, label: 'Ubicacion' },
  { key: 'Clock', icon: Clock, label: 'Reloj' },
  { key: 'Zap', icon: Zap, label: 'Rapido' },
  { key: 'Heart', icon: Heart, label: 'Corazon' },
  { key: 'Star', icon: Star, label: 'Estrella' },
  { key: 'Eye', icon: Eye, label: 'Ojo' },
  { key: 'Search', icon: Search, label: 'Buscar' },
]

const ICONOS_NOSOTROS = [
  { key: 'Bus', icon: Bus, label: 'Bus' },
  { key: 'Route', icon: Route, label: 'Ruta' },
  { key: 'Target', icon: Target, label: 'Objetivo' },
  { key: 'Eye', icon: Eye, label: 'Vision' },
  { key: 'Heart', icon: Heart, label: 'Corazon' },
  { key: 'Shield', icon: Shield, label: 'Seguridad' },
  { key: 'Star', icon: Star, label: 'Estrella' },
  { key: 'Globe', icon: Globe, label: 'Global' },
  { key: 'Users', icon: Users, label: 'Equipo' },
  { key: 'Award', icon: Award, label: 'Premio' },
  { key: 'Lightbulb', icon: Lightbulb, label: 'Innovacion' },
  { key: 'HandHeart', icon: HandHeart, label: 'Servicio' },
  { key: 'Truck', icon: Truck, label: 'Transporte' },
  { key: 'Zap', icon: Zap, label: 'Energia' },
  { key: 'Package', icon: Package, label: 'Paquete' },
  { key: 'MapPin', icon: MapPin, label: 'Ubicacion' },
]

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
    experienciaFeatures: '',
    experienciaCtaTexto: 'VER SERVICIOS',
    experienciaCtaLink: '/rutas-info',
    encomiendasLandingTitulo: '',
    encomiendasLandingDescripcion: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
  const [rutasAdmin, setRutasAdmin] = useState([])
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

  // Destinos Imagenes
  const [destinosImagenes, setDestinosImagenes] = useState([])
  const [bannerDestinos, setBannerDestinos] = useState(null)
  const [bannerDestinosPreview, setBannerDestinosPreview] = useState(null)
  const [savingBannerDest, setSavingBannerDest] = useState(false)
  const [savingDestImg, setSavingDestImg] = useState(null)
  const bannerDestInputRef = useRef(null)

  // Encomiendas Info
  const [encomiendasVentajas, setEncomiendasVentajas] = useState([])
  const [encomiendasHeroImagen, setEncomiendasHeroImagen] = useState(null)
  const [encomiendasHeroPreview, setEncomiendasHeroPreview] = useState(null)
  const [showEncModal, setShowEncModal] = useState(false)
  const [editingVentaja, setEditingVentaja] = useState(null)
  const [ventajaForm, setVentajaForm] = useState({
    titulo: '',
    descripcion: '',
    icono: 'Package',
    orden: 0,
    imagenPreview: null,
    imagenFile: null
  })
  const [savingVentaja, setSavingVentaja] = useState(false)
  const [savingEncHero, setSavingEncHero] = useState(false)
  const [encLandingImgPreview, setEncLandingImgPreview] = useState(null)
  const [savingEncLandingImg, setSavingEncLandingImg] = useState(false)

  // Experiencia (tab nuevo)
  const [experienciaIconos, setExperienciaIconos] = useState([])
  const [imgFondoExpPreview, setImgFondoExpPreview] = useState(null)
  const [savingImgFondoExp, setSavingImgFondoExp] = useState(false)
  const [showIconoModal, setShowIconoModal] = useState(false)
  const [editingIcono, setEditingIcono] = useState(null)
  const [iconoForm, setIconoForm] = useState({ nombreIcono: '', etiqueta: '' })
  const [savingIcono, setSavingIcono] = useState(false)

  // Nosotros
  const [nosotrosValores, setNosotrosValores] = useState([])
  const [nosotrosConfig, setNosotrosConfig] = useState({
    nosotrosHeroTitulo: 'Nosotros',
    nosotrosHeroSubtitulo: 'Conocenos',
    nosotrosMisionTitulo: 'Mision',
    nosotrosMisionTexto: '',
    nosotrosMisionIcono: 'Bus',
    nosotrosVisionTitulo: 'Vision',
    nosotrosVisionTexto: '',
    nosotrosVisionIcono: 'Route',
    nosotrosValoresTitulo: 'Valores institucionales'
  })
  const [nosotrosHeroImagen, setNosotrosHeroImagen] = useState(null)
  const [nosotrosHeroPreview, setNosotrosHeroPreview] = useState(null)
  const [savingNosotrosConfig, setSavingNosotrosConfig] = useState(false)
  const [savingNosotrosHero, setSavingNosotrosHero] = useState(false)
  const [showNosotrosValorModal, setShowNosotrosValorModal] = useState(false)
  const [editingNosotrosValor, setEditingNosotrosValor] = useState(null)
  const [nosotrosValorForm, setNosotrosValorForm] = useState({
    titulo: '',
    orden: 0,
    imagenPreview: null,
    imagenFile: null
  })
  const [savingNosotrosValor, setSavingNosotrosValor] = useState(false)

  // Preguntas Frecuentes
  const [faqs, setFaqs] = useState([])
  const [showFaqModal, setShowFaqModal] = useState(false)
  const [editingFaq, setEditingFaq] = useState(null)
  const [faqForm, setFaqForm] = useState({
    pregunta: '',
    respuesta: '',
    categoria: 'general'
  })
  const [savingFaq, setSavingFaq] = useState(false)

  const fileInputRef = useRef(null)
  const imgFondoExpInputRef = useRef(null)
  const nosotrosHeroInputRef = useRef(null)
  const nosotrosValorImgRef = useRef(null)
  const festImgInputRef = useRef(null)
  const encHeroInputRef = useRef(null)
  const encVentajaImgRef = useRef(null)
  const encLandingImgRef = useRef(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [bannersRes, galleryRes, configRes, festRes, puntosRes, encRes, iconosRes, nosotrosRes, faqsRes, destImgRes, destBannerRes, rutasRes] = await Promise.all([
        landingService.listarBanners('banner'),
        landingService.listarBanners('gallery'),
        landingService.getConfigLanding(),
        landingService.listarFestividades().catch(() => ({ festividades: [] })),
        publicService.getPuntos().catch(() => ({ puntos: [] })),
        landingService.listarEncomiendasVentajas().catch(() => ({ ventajas: [], heroImagen: null })),
        landingService.listarExperienciaIconos().catch(() => ({ iconos: [] })),
        landingService.listarNosotrosValores().catch(() => ({ valores: [], config: {} })),
        landingService.listarPreguntasFrecuentes().catch(() => ({ preguntas: [] })),
        landingService.listarDestinosImagenes().catch(() => ({ imagenes: [] })),
        publicService.getDestinosBanner().catch(() => ({ banner: null })),
        publicService.getRutas().catch(() => ({ rutas: [] }))
      ])
      setBanners(bannersRes.banners || [])
      setGallery(galleryRes.banners || [])
      setFestividades(festRes.festividades || [])
      setPuntos(puntosRes.puntos || [])
      setEncomiendasVentajas(encRes.ventajas || [])
      setDestinosImagenes(destImgRes.imagenes || [])
      setRutasAdmin(rutasRes.rutas || [])
      if (destBannerRes.banner) {
        setBannerDestinos(destBannerRes.banner)
        setBannerDestinosPreview(getUploadUrl(destBannerRes.banner))
      }
      setExperienciaIconos(iconosRes.iconos || [])
      if (encRes.heroImagen) {
        setEncomiendasHeroImagen(encRes.heroImagen)
        setEncomiendasHeroPreview(getUploadUrl(encRes.heroImagen))
      }
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
          experienciaFeatures: configRes.config.experienciaFeatures || '',
          experienciaCtaTexto: configRes.config.experienciaCtaTexto || 'VER SERVICIOS',
          experienciaCtaLink: configRes.config.experienciaCtaLink || '/destinos',
          encomiendasLandingTitulo: configRes.config.encomiendasLandingTitulo || '',
          encomiendasLandingDescripcion: configRes.config.encomiendasLandingDescripcion || ''
        })
        if (configRes.config.imagenFondoExperiencia) {
          setImgFondoExpPreview(getUploadUrl(configRes.config.imagenFondoExperiencia))
        }
        if (configRes.config.encomiendasLandingImagen) {
          setEncLandingImgPreview(getUploadUrl(configRes.config.encomiendasLandingImagen))
        }
      }
      // Nosotros
      setNosotrosValores(nosotrosRes.valores || [])
      if (nosotrosRes.config) {
        setNosotrosConfig({
          nosotrosHeroTitulo: nosotrosRes.config.nosotrosHeroTitulo || 'Nosotros',
          nosotrosHeroSubtitulo: nosotrosRes.config.nosotrosHeroSubtitulo || 'Conocenos',
          nosotrosMisionTitulo: nosotrosRes.config.nosotrosMisionTitulo || 'Mision',
          nosotrosMisionTexto: nosotrosRes.config.nosotrosMisionTexto || '',
          nosotrosMisionIcono: nosotrosRes.config.nosotrosMisionIcono || 'Bus',
          nosotrosVisionTitulo: nosotrosRes.config.nosotrosVisionTitulo || 'Vision',
          nosotrosVisionTexto: nosotrosRes.config.nosotrosVisionTexto || '',
          nosotrosVisionIcono: nosotrosRes.config.nosotrosVisionIcono || 'Route',
          nosotrosValoresTitulo: nosotrosRes.config.nosotrosValoresTitulo || 'Valores institucionales'
        })
        if (nosotrosRes.config.nosotrosHeroImagen) {
          setNosotrosHeroImagen(nosotrosRes.config.nosotrosHeroImagen)
          setNosotrosHeroPreview(getUploadUrl(nosotrosRes.config.nosotrosHeroImagen))
        }
      }
      // Preguntas Frecuentes
      setFaqs(faqsRes.preguntas || [])
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
  // ============================================
  // IMAGEN EXPERIENCIA
  // ============================================


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
  // ENCOMIENDAS INFO HANDLERS
  // ============================================

  const handleEncHeroUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSavingEncHero(true)
    try {
      const formData = new FormData()
      formData.append('imagen', file)
      const res = await landingService.subirImagenEncomiendasHero(formData)
      setEncomiendasHeroImagen(res.heroImagen)
      setEncomiendasHeroPreview(getUploadUrl(res.heroImagen))
      toast.success('Imagen hero actualizada')
    } catch (error) {
      console.error(error)
      toast.error('Error al subir imagen hero')
    } finally {
      setSavingEncHero(false)
      if (encHeroInputRef.current) encHeroInputRef.current.value = ''
    }
  }

  const handleEncLandingImgUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSavingEncLandingImg(true)
    try {
      const formData = new FormData()
      formData.append('imagen', file)
      const res = await landingService.subirImagenEncomiendasLanding(formData)
      setEncLandingImgPreview(getUploadUrl(res.encomiendasLandingImagen))
      toast.success('Imagen actualizada')
    } catch (error) {
      console.error(error)
      toast.error('Error al subir imagen')
    } finally {
      setSavingEncLandingImg(false)
      if (encLandingImgRef.current) encLandingImgRef.current.value = ''
    }
  }

  const handleEncLandingImgDelete = async () => {
    if (!confirm('Eliminar imagen de encomiendas del landing?')) return
    setSavingEncLandingImg(true)
    try {
      await landingService.eliminarImagenEncomiendasLanding()
      setEncLandingImgPreview(null)
      toast.success('Imagen eliminada')
    } catch (error) {
      toast.error('Error al eliminar imagen')
    } finally {
      setSavingEncLandingImg(false)
    }
  }

  const handleEncHeroDelete = async () => {
    if (!confirm('Eliminar imagen hero de encomiendas?')) return
    setSavingEncHero(true)
    try {
      await landingService.eliminarImagenEncomiendasHero()
      setEncomiendasHeroImagen(null)
      setEncomiendasHeroPreview(null)
      toast.success('Imagen hero eliminada')
    } catch (error) {
      toast.error('Error al eliminar imagen hero')
    } finally {
      setSavingEncHero(false)
    }
  }

  const abrirEncModal = (ventaja = null) => {
    if (ventaja) {
      setEditingVentaja(ventaja)
      setVentajaForm({
        titulo: ventaja.titulo || '',
        descripcion: ventaja.descripcion || '',
        icono: ventaja.icono || 'Package',
        orden: ventaja.orden || 0,
        imagenPreview: ventaja.imagenPath ? getUploadUrl(ventaja.imagenPath) : null,
        imagenFile: null
      })
    } else {
      setEditingVentaja(null)
      setVentajaForm({
        titulo: '',
        descripcion: '',
        icono: 'Package',
        orden: encomiendasVentajas.length,
        imagenPreview: null,
        imagenFile: null
      })
    }
    setShowEncModal(true)
  }

  const cerrarEncModal = () => {
    setShowEncModal(false)
    setEditingVentaja(null)
    setVentajaForm({ titulo: '', descripcion: '', icono: 'Package', orden: 0, imagenPreview: null, imagenFile: null })
  }

  const handleVentajaImgChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setVentajaForm(prev => ({ ...prev, imagenPreview: reader.result, imagenFile: file }))
    reader.readAsDataURL(file)
  }

  const guardarVentaja = async () => {
    if (!ventajaForm.titulo.trim()) {
      toast.error('El titulo es obligatorio')
      return
    }
    setSavingVentaja(true)
    try {
      const formData = new FormData()
      formData.append('titulo', ventajaForm.titulo)
      formData.append('descripcion', ventajaForm.descripcion)
      formData.append('icono', ventajaForm.icono)
      formData.append('orden', ventajaForm.orden)
      if (ventajaForm.imagenFile) {
        formData.append('imagen', ventajaForm.imagenFile)
      }

      if (editingVentaja) {
        await landingService.actualizarEncomiendasVentaja(editingVentaja.id, formData)
        toast.success('Ventaja actualizada')
      } else {
        await landingService.crearEncomiendasVentaja(formData)
        toast.success('Ventaja creada')
      }
      cerrarEncModal()
      // Recargar ventajas
      const encRes = await landingService.listarEncomiendasVentajas().catch(() => ({ ventajas: [] }))
      setEncomiendasVentajas(encRes.ventajas || [])
    } catch (error) {
      console.error(error)
      toast.error('Error al guardar ventaja')
    } finally {
      setSavingVentaja(false)
    }
  }

  const eliminarVentaja = async (id) => {
    if (!confirm('Eliminar esta ventaja?')) return
    try {
      await landingService.eliminarEncomiendasVentaja(id)
      setEncomiendasVentajas(prev => prev.filter(v => v.id !== id))
      toast.success('Ventaja eliminada')
    } catch (error) {
      toast.error('Error al eliminar ventaja')
    }
  }

  const toggleVentaja = async (id) => {
    try {
      const res = await landingService.toggleEncomiendasVentaja(id)
      setEncomiendasVentajas(prev => prev.map(v => v.id === id ? { ...v, activo: res.activo } : v))
      toast.success(res.mensaje)
    } catch (error) {
      toast.error('Error al cambiar estado')
    }
  }

  // ============================================
  // EXPERIENCIA
  // ============================================

  const handleImgFondoExpChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSavingImgFondoExp(true)
    const formData = new FormData()
    formData.append('imagen', file)
    landingService.subirImagenFondoExperiencia(formData)
      .then((res) => {
        setImgFondoExpPreview(getUploadUrl(res.imagenFondoExperiencia))
        toast.success('Imagen de fondo actualizada')
      })
      .catch(() => toast.error('Error al subir imagen'))
      .finally(() => setSavingImgFondoExp(false))
  }

  const eliminarImgFondoExperiencia = async () => {
    setSavingImgFondoExp(true)
    try {
      await landingService.eliminarImagenFondoExperiencia()
      setImgFondoExpPreview(null)
      toast.success('Imagen de fondo eliminada')
    } catch {
      toast.error('Error al eliminar imagen')
    } finally {
      setSavingImgFondoExp(false)
    }
  }

  const abrirIconoModal = (icono = null) => {
    if (icono) {
      setEditingIcono(icono)
      setIconoForm({ nombreIcono: icono.nombreIcono, etiqueta: icono.etiqueta || '' })
    } else {
      setEditingIcono(null)
      setIconoForm({ nombreIcono: '', etiqueta: '' })
    }
    setShowIconoModal(true)
  }

  const cerrarIconoModal = () => {
    setShowIconoModal(false)
    setEditingIcono(null)
    setIconoForm({ nombreIcono: '', etiqueta: '' })
  }

  const guardarIcono = async () => {
    if (!iconoForm.nombreIcono) {
      toast.error('Selecciona un icono')
      return
    }
    setSavingIcono(true)
    try {
      if (editingIcono) {
        const res = await landingService.actualizarExperienciaIcono(editingIcono.id, iconoForm)
        setExperienciaIconos(prev => prev.map(i => i.id === editingIcono.id ? res.icono : i))
        toast.success('Icono actualizado')
      } else {
        const res = await landingService.crearExperienciaIcono(iconoForm)
        setExperienciaIconos(prev => [...prev, res.icono])
        toast.success('Icono creado')
      }
      cerrarIconoModal()
    } catch {
      toast.error('Error al guardar icono')
    } finally {
      setSavingIcono(false)
    }
  }

  const eliminarIcono = async (id) => {
    try {
      await landingService.eliminarExperienciaIcono(id)
      setExperienciaIconos(prev => prev.filter(i => i.id !== id))
      toast.success('Icono eliminado')
    } catch {
      toast.error('Error al eliminar icono')
    }
  }

  // ============================================
  // NOSOTROS HANDLERS
  // ============================================

  const guardarNosotrosConfig = async () => {
    setSavingNosotrosConfig(true)
    try {
      await landingService.actualizarNosotrosConfig(nosotrosConfig)
      toast.success('Configuracion de Nosotros guardada')
    } catch {
      toast.error('Error al guardar configuracion')
    } finally {
      setSavingNosotrosConfig(false)
    }
  }

  const handleNosotrosHeroChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSavingNosotrosHero(true)
    const formData = new FormData()
    formData.append('imagen', file)
    landingService.subirHeroNosotros(formData)
      .then((res) => {
        setNosotrosHeroImagen(res.heroImagen)
        setNosotrosHeroPreview(getUploadUrl(res.heroImagen))
        toast.success('Imagen hero actualizada')
      })
      .catch(() => toast.error('Error al subir imagen'))
      .finally(() => setSavingNosotrosHero(false))
  }

  const eliminarNosotrosHero = async () => {
    setSavingNosotrosHero(true)
    try {
      await landingService.eliminarHeroNosotros()
      setNosotrosHeroImagen(null)
      setNosotrosHeroPreview(null)
      toast.success('Imagen hero eliminada')
    } catch {
      toast.error('Error al eliminar imagen')
    } finally {
      setSavingNosotrosHero(false)
    }
  }

  const abrirNosotrosValorModal = (valor = null) => {
    if (valor) {
      setEditingNosotrosValor(valor)
      setNosotrosValorForm({
        titulo: valor.titulo,
        orden: valor.orden || 0,
        imagenPreview: valor.imagenPath ? getUploadUrl(valor.imagenPath) : null,
        imagenFile: null
      })
    } else {
      setEditingNosotrosValor(null)
      setNosotrosValorForm({ titulo: '', orden: 0, imagenPreview: null, imagenFile: null })
    }
    setShowNosotrosValorModal(true)
  }

  const cerrarNosotrosValorModal = () => {
    setShowNosotrosValorModal(false)
    setEditingNosotrosValor(null)
    setNosotrosValorForm({ titulo: '', orden: 0, imagenPreview: null, imagenFile: null })
  }

  const guardarNosotrosValor = async () => {
    if (!nosotrosValorForm.titulo.trim()) {
      return toast.error('El titulo es requerido')
    }
    if (!editingNosotrosValor && !nosotrosValorForm.imagenFile) {
      return toast.error('La imagen es requerida')
    }
    setSavingNosotrosValor(true)
    try {
      const formData = new FormData()
      formData.append('titulo', nosotrosValorForm.titulo.trim())
      formData.append('orden', nosotrosValorForm.orden)
      if (nosotrosValorForm.imagenFile) {
        formData.append('imagen', nosotrosValorForm.imagenFile)
      }
      if (editingNosotrosValor) {
        await landingService.actualizarNosotrosValor(editingNosotrosValor.id, formData)
        toast.success('Valor actualizado')
      } else {
        await landingService.crearNosotrosValor(formData)
        toast.success('Valor creado')
      }
      cerrarNosotrosValorModal()
      const res = await landingService.listarNosotrosValores()
      setNosotrosValores(res.valores || [])
    } catch {
      toast.error('Error al guardar valor')
    } finally {
      setSavingNosotrosValor(false)
    }
  }

  const eliminarNosotrosValor = async (id) => {
    if (!confirm('Eliminar este valor?')) return
    try {
      await landingService.eliminarNosotrosValor(id)
      setNosotrosValores(prev => prev.filter(v => v.id !== id))
      toast.success('Valor eliminado')
    } catch {
      toast.error('Error al eliminar valor')
    }
  }

  const toggleNosotrosValor = async (id) => {
    try {
      const res = await landingService.toggleNosotrosValor(id)
      setNosotrosValores(prev => prev.map(v => v.id === id ? { ...v, activo: res.activo } : v))
      toast.success(res.mensaje)
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  // ============================================
  // PREGUNTAS FRECUENTES
  // ============================================

  const abrirFaqModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq)
      setFaqForm({
        pregunta: faq.pregunta || '',
        respuesta: faq.respuesta || '',
        categoria: faq.categoria || 'general'
      })
    } else {
      setEditingFaq(null)
      setFaqForm({ pregunta: '', respuesta: '', categoria: 'general' })
    }
    setShowFaqModal(true)
  }

  const cerrarFaqModal = () => {
    setShowFaqModal(false)
    setEditingFaq(null)
    setFaqForm({ pregunta: '', respuesta: '', categoria: 'general' })
  }

  const guardarFaq = async () => {
    if (!faqForm.pregunta.trim() || !faqForm.respuesta.trim()) {
      toast.error('La pregunta y respuesta son obligatorias')
      return
    }
    try {
      setSavingFaq(true)
      const data = {
        pregunta: faqForm.pregunta.trim(),
        respuesta: faqForm.respuesta.trim(),
        categoria: faqForm.categoria,
        orden: editingFaq ? editingFaq.orden : faqs.length
      }
      if (editingFaq) {
        await landingService.actualizarPreguntaFrecuente(editingFaq.id, data)
        toast.success('Pregunta actualizada')
      } else {
        await landingService.crearPreguntaFrecuente(data)
        toast.success('Pregunta creada')
      }
      cerrarFaqModal()
      const res = await landingService.listarPreguntasFrecuentes()
      setFaqs(res.preguntas || [])
    } catch (error) {
      console.error('Error guardando FAQ:', error)
      toast.error('Error al guardar la pregunta')
    } finally {
      setSavingFaq(false)
    }
  }

  const eliminarFaq = async (id) => {
    if (!confirm('¿Eliminar esta pregunta frecuente?')) return
    try {
      await landingService.eliminarPreguntaFrecuente(id)
      toast.success('Pregunta eliminada')
      setFaqs(prev => prev.filter(f => f.id !== id))
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const toggleFaq = async (id) => {
    try {
      const res = await landingService.togglePreguntaFrecuente(id)
      setFaqs(prev => prev.map(f => f.id === id ? { ...f, activo: res.activo } : f))
      toast.success(res.mensaje)
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  const moverFaq = async (index, direction) => {
    const newFaqs = [...faqs]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newFaqs.length) return
    ;[newFaqs[index], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[index]]
    const ordenes = newFaqs.map((f, i) => ({ id: f.id, orden: i }))
    setFaqs(newFaqs)
    try {
      await landingService.reordenarPreguntasFrecuentes(ordenes)
    } catch {
      toast.error('Error al reordenar')
      const res = await landingService.listarPreguntasFrecuentes()
      setFaqs(res.preguntas || [])
    }
  }

  const CATEGORIAS_FAQ = [
    { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-700' },
    { value: 'pasajes', label: 'Pasajes', color: 'bg-blue-100 text-blue-700' },
    { value: 'viajes', label: 'Viajes', color: 'bg-green-100 text-green-700' },
    { value: 'encomiendas', label: 'Encomiendas', color: 'bg-amber-100 text-amber-700' }
  ]

  const getCategoriaInfo = (cat) => CATEGORIAS_FAQ.find(c => c.value === cat) || CATEGORIAS_FAQ[0]

  // ============================================
  // DESTINOS IMAGENES
  // ============================================

  // Derivar ciudades de rutas
  const ciudadesDestinoAdmin = (() => {
    const map = {}
    rutasAdmin.forEach(ruta => {
      ;[ruta.origen, ruta.destino].forEach(punto => {
        const ciudad = punto?.ciudad
        if (ciudad && !map[ciudad]) map[ciudad] = true
      })
    })
    return Object.keys(map).sort()
  })()

  // Map de imágenes por ciudad
  const imgPorCiudad = {}
  destinosImagenes.forEach(img => { imgPorCiudad[img.ciudad] = img })

  const handleBannerDestChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }
    subirBannerDest(file)
  }

  const subirBannerDest = async (file) => {
    try {
      setSavingBannerDest(true)
      const res = await landingService.subirBannerDestinos(file)
      setBannerDestinos(res.bannerPath)
      setBannerDestinosPreview(getUploadUrl(res.bannerPath))
      toast.success('Banner subido')
    } catch { toast.error('Error al subir banner') }
    finally { setSavingBannerDest(false) }
  }

  const eliminarBannerDest = async () => {
    if (!confirm('¿Eliminar banner de destinos?')) return
    try {
      setSavingBannerDest(true)
      await landingService.eliminarBannerDestinos()
      setBannerDestinos(null)
      setBannerDestinosPreview(null)
      toast.success('Banner eliminado')
    } catch { toast.error('Error al eliminar') }
    finally { setSavingBannerDest(false) }
  }

  const subirImgDestino = async (ciudad, file) => {
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }
    try {
      setSavingDestImg(ciudad)
      await landingService.subirImagenDestino(ciudad, file)
      toast.success(`Imagen de ${ciudad} subida`)
      cargarDatos()
    } catch { toast.error('Error al subir imagen') }
    finally { setSavingDestImg(null) }
  }

  const eliminarImgDestino = async (id, ciudad) => {
    if (!confirm(`¿Eliminar imagen de ${ciudad}?`)) return
    try {
      setSavingDestImg(ciudad)
      await landingService.eliminarImagenDestino(id)
      toast.success('Imagen eliminada')
      setDestinosImagenes(prev => prev.filter(i => i.id !== id))
    } catch { toast.error('Error al eliminar') }
    finally { setSavingDestImg(null) }
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
              onClick={() => setActiveTab('destinos')}
              className={`pb-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'destinos'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Destinos
              </div>
            </button>
            <button
              onClick={() => setActiveTab('experiencia')}
              className={`pb-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'experiencia'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Experiencia
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
            <button
              onClick={() => setActiveTab('encomiendas')}
              className={`pb-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'encomiendas'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Encomiendas
              </div>
            </button>
            <button
              onClick={() => setActiveTab('nosotros')}
              className={`pb-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'nosotros'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Nosotros
              </div>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`pb-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'faq'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                FAQ
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

        {/* Tab: Destinos */}
        {!loading && activeTab === 'destinos' && (
          <div className="space-y-8">
            {/* Banner de destinos */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Banner de la pagina Destinos</h3>
              <p className="text-sm text-gray-500 mb-4">Imagen hero que aparece en la parte superior de /destinos. Recomendado: 1600x500px. Max 5MB.</p>
              <div className="flex items-start gap-6">
                <div
                  onClick={() => !savingBannerDest && bannerDestInputRef.current?.click()}
                  className="relative w-80 h-44 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 hover:border-primary-300 transition-colors flex-shrink-0"
                >
                  {savingBannerDest && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {bannerDestinosPreview ? (
                    <img src={bannerDestinosPreview} alt="Banner destinos" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Image className="w-8 h-8 mb-2" />
                      <span className="text-xs">Click para subir</span>
                    </div>
                  )}
                  <input ref={bannerDestInputRef} type="file" accept="image/*" onChange={handleBannerDestChange} className="hidden" />
                </div>
                {bannerDestinos && (
                  <button
                    onClick={eliminarBannerDest}
                    disabled={savingBannerDest}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
                  >
                    Eliminar banner
                  </button>
                )}
              </div>
            </div>

            {/* Imagenes por ciudad */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Imagenes por destino</h3>
              <p className="text-sm text-gray-500 mb-6">Sube una foto para cada ciudad. Si no tiene foto, se usara una imagen por defecto. Max 5MB.</p>

              {ciudadesDestinoAdmin.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No hay ciudades configuradas</p>
                  <p className="text-sm mt-1">Las ciudades se derivan de las rutas activas</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {ciudadesDestinoAdmin.map(ciudad => {
                    const img = imgPorCiudad[ciudad]
                    const isSaving = savingDestImg === ciudad
                    return (
                      <div key={ciudad} className="group relative rounded-xl border border-gray-200 overflow-hidden">
                        <div className="relative h-36 bg-gray-100">
                          {isSaving && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                          {img ? (
                            <img src={getUploadUrl(img.imagenPath)} alt={ciudad} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-300">
                              <MapPin className="w-8 h-8" />
                              <span className="text-xs mt-1">Sin imagen</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-semibold text-gray-900 mb-2">{ciudad}</p>
                          <div className="flex gap-2">
                            <label className="flex-1 text-center px-2 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium cursor-pointer hover:bg-primary-100 transition-colors">
                              {img ? 'Cambiar' : 'Subir'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) subirImgDestino(ciudad, file)
                                  e.target.value = ''
                                }}
                              />
                            </label>
                            {img && (
                              <button
                                onClick={() => eliminarImgDestino(img.id, ciudad)}
                                disabled={isSaving}
                                className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Experiencia */}
        {!loading && activeTab === 'experiencia' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Sección "Experiencia de Viaje"</h3>
              <p className="text-sm text-gray-500 mb-6">Configura la sección full-width con imagen de fondo, textos e iconos que aparece en la landing page.</p>
            </div>

            {/* Imagen de fondo */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Imagen de Fondo</h4>
              <p className="text-xs text-gray-500 mb-4">Imagen que cubre toda la sección. Recomendado: 1600x700px, interior de bus premium. Max 5MB.</p>
              <div className="flex items-start gap-6">
                <div
                  onClick={() => !savingImgFondoExp && imgFondoExpInputRef.current?.click()}
                  className="relative w-80 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 hover:border-primary-300 transition-colors flex-shrink-0"
                >
                  {savingImgFondoExp && (
                    <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {imgFondoExpPreview ? (
                    <>
                      <img src={imgFondoExpPreview} alt="Fondo experiencia" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium text-sm">Cambiar imagen</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-xs">Clic para subir imagen de fondo</span>
                    </div>
                  )}
                </div>
                {imgFondoExpPreview && (
                  <button
                    onClick={eliminarImgFondoExperiencia}
                    disabled={savingImgFondoExp}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                )}
              </div>
              <input
                ref={imgFondoExpInputRef}
                type="file"
                accept="image/*"
                onChange={handleImgFondoExpChange}
                className="hidden"
              />
            </div>

            {/* Textos */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Textos de la Sección</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">
                    Título (usa | para separar línea cursiva de líneas bold)
                  </label>
                  <input
                    type="text"
                    value={config.experienciaTitulo}
                    onChange={(e) => setConfig(prev => ({ ...prev, experienciaTitulo: e.target.value }))}
                    placeholder="Haz de tus viajes una gran|experiencia con|seguridad y|comodidad"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Antes del primer | es texto cursivo pequeño. Cada | genera una nueva línea bold grande.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1.5">Texto del Botón CTA</label>
                    <input
                      type="text"
                      value={config.experienciaCtaTexto}
                      onChange={(e) => setConfig(prev => ({ ...prev, experienciaCtaTexto: e.target.value }))}
                      placeholder="VER SERVICIOS"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1.5">Enlace del Botón CTA</label>
                    <input
                      type="text"
                      value={config.experienciaCtaLink}
                      onChange={(e) => setConfig(prev => ({ ...prev, experienciaCtaLink: e.target.value }))}
                      placeholder="/destinos"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Iconos circulares */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Iconos Circulares</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Se muestran sobre la imagen de fondo como círculos con borde blanco</p>
                </div>
                <button
                  onClick={() => abrirIconoModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Icono
                </button>
              </div>

              {experienciaIconos.length === 0 ? (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <CircleDot className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No hay iconos configurados. Se mostrarán los iconos por defecto.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {experienciaIconos.map((icono) => {
                    const iconData = ICONOS_EXPERIENCIA.find(i => i.key === icono.nombreIcono)
                    const IconComp = iconData?.icon || CircleDot
                    return (
                      <div key={icono.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 group">
                        <div className="w-12 h-12 rounded-full border-2 border-primary-500 bg-primary-50 flex items-center justify-center flex-shrink-0">
                          <IconComp className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{iconData?.label || icono.nombreIcono}</p>
                          {icono.etiqueta && (
                            <p className="text-xs text-gray-500 truncate">{icono.etiqueta}</p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => abrirIconoModal(icono)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => eliminarIcono(icono.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Botón guardar config */}
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

        {/* Modal de icono */}
        {showIconoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingIcono ? 'Editar Icono' : 'Agregar Icono'}
                </h3>
                <button onClick={cerrarIconoModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                {/* Selector de icono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Icono</label>
                  <div className="grid grid-cols-6 gap-2 max-h-56 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50">
                    {ICONOS_EXPERIENCIA.map(({ key, icon: IconC, label }) => (
                      <button
                        key={key}
                        onClick={() => setIconoForm(prev => ({ ...prev, nombreIcono: key }))}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all text-center ${
                          iconoForm.nombreIcono === key
                            ? 'bg-primary-100 border-2 border-primary-500 text-primary-700'
                            : 'hover:bg-gray-100 border-2 border-transparent text-gray-600'
                        }`}
                        title={label}
                      >
                        <IconC className="w-6 h-6" />
                        <span className="text-[10px] leading-tight truncate w-full">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Etiqueta / tooltip */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Etiqueta (tooltip)</label>
                  <input
                    type="text"
                    value={iconoForm.etiqueta}
                    onChange={(e) => setIconoForm(prev => ({ ...prev, etiqueta: e.target.value }))}
                    placeholder="Ej: Asientos reclinables 180°"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Preview */}
                {iconoForm.nombreIcono && (
                  <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-xl">
                    <div className="w-1 h-10 bg-primary-500 rounded-full flex-shrink-0" />
                    <div className="w-12 h-12 rounded-full border-2 border-white/60 bg-white/10 flex items-center justify-center">
                      {(() => {
                        const IC = ICONOS_EXPERIENCIA.find(i => i.key === iconoForm.nombreIcono)?.icon || CircleDot
                        return <IC className="w-6 h-6 text-white" />
                      })()}
                    </div>
                    <span className="text-white/70 text-sm">{iconoForm.etiqueta || 'Sin etiqueta'}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
                <button
                  onClick={cerrarIconoModal}
                  className="px-4 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarIcono}
                  disabled={savingIcono || !iconoForm.nombreIcono}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {savingIcono ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingIcono ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
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

        {/* Tab: Encomiendas Info */}
        {!loading && activeTab === 'encomiendas' && (
          <div className="space-y-8">
            {/* Imagen Hero */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-primary-600" />
                Imagen Hero - Fondo de Encomiendas
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Esta imagen se muestra como fondo del banner principal en la pagina de Encomiendas.
              </p>
              <div className="flex items-start gap-6">
                <div
                  onClick={() => !savingEncHero && encHeroInputRef.current?.click()}
                  className="relative w-64 h-36 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 hover:border-primary-300 transition-colors flex-shrink-0"
                >
                  {encomiendasHeroPreview ? (
                    <>
                      <img src={encomiendasHeroPreview} alt="Hero Encomiendas" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium text-sm">Cambiar imagen</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <Upload className="w-8 h-8 mb-1" />
                      <span className="text-xs">Clic para seleccionar</span>
                    </div>
                  )}
                  {savingEncHero && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <input ref={encHeroInputRef} type="file" accept="image/*" onChange={handleEncHeroUpload} className="hidden" />
                {encomiendasHeroPreview && (
                  <button
                    onClick={handleEncHeroDelete}
                    disabled={savingEncHero}
                    className="px-4 py-2 text-red-600 border border-red-200 rounded-xl text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Eliminar
                  </button>
                )}
              </div>
            </div>

            {/* Seccion Encomiendas en Landing */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary-600" />
                Seccion Encomiendas - Landing Page
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Titulo, descripcion e imagen que aparecen en la seccion de encomiendas del landing principal.
              </p>

              <div className="space-y-4">
                {/* Titulo */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">Titulo</label>
                  <input
                    type="text"
                    value={config.encomiendasLandingTitulo}
                    onChange={(e) => setConfig(prev => ({ ...prev, encomiendasLandingTitulo: e.target.value }))}
                    placeholder="Envia sobres, paqueteria y encomiendas"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Descripcion */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">Descripcion</label>
                  <textarea
                    value={config.encomiendasLandingDescripcion}
                    onChange={(e) => setConfig(prev => ({ ...prev, encomiendasLandingDescripcion: e.target.value }))}
                    placeholder="Confia tus paquetes y documentos con nosotros..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Imagen (lado derecho)</label>
                  <div className="flex items-start gap-4">
                    <div
                      onClick={() => !savingEncLandingImg && encLandingImgRef.current?.click()}
                      className="relative w-48 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 hover:border-primary-300 transition-colors flex-shrink-0"
                    >
                      {encLandingImgPreview ? (
                        <>
                          <img src={encLandingImgPreview} alt="Encomiendas" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-medium text-xs">Cambiar</span>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-xs">Seleccionar</span>
                        </div>
                      )}
                      {savingEncLandingImg && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <input ref={encLandingImgRef} type="file" accept="image/*" onChange={handleEncLandingImgUpload} className="hidden" />
                    {encLandingImgPreview && (
                      <button
                        onClick={handleEncLandingImgDelete}
                        disabled={savingEncLandingImg}
                        className="px-3 py-1.5 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={guardarConfig}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar textos
                </button>
              </div>
            </div>

            {/* Ventajas/Cards */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-600" />
                  Ventajas / Cards
                </h3>
                <button
                  onClick={() => abrirEncModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Ventaja
                </button>
              </div>

              {encomiendasVentajas.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay ventajas configuradas</p>
                  <p className="text-sm">Las ventajas por defecto se mostraran en la pagina publica</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {encomiendasVentajas.map((v) => (
                    <div
                      key={v.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                        v.activo ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                      }`}
                    >
                      {/* Imagen o icono */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        {v.imagenPath ? (
                          <img src={getUploadUrl(v.imagenPath)} alt={v.titulo} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{v.titulo}</h4>
                        <p className="text-sm text-gray-500 truncate">{v.descripcion}</p>
                        <span className="text-xs text-gray-400">Orden: {v.orden} | Icono: {v.icono}</span>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => toggleVentaja(v.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            v.activo ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={v.activo ? 'Desactivar' : 'Activar'}
                        >
                          {v.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => abrirEncModal(v)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminarVentaja(v.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
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
          </div>
        )}

        {/* Tab: Nosotros */}
        {!loading && activeTab === 'nosotros' && (
          <div className="space-y-8">
            {/* Imagen Hero Nosotros */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagen Hero</h3>
              <p className="text-sm text-gray-500 mb-4">Imagen de fondo para el banner superior de la pagina Nosotros.</p>
              <input
                type="file"
                ref={nosotrosHeroInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleNosotrosHeroChange}
              />
              {nosotrosHeroPreview ? (
                <div className="relative rounded-xl overflow-hidden mb-3">
                  <img src={nosotrosHeroPreview} alt="Hero Nosotros" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => nosotrosHeroInputRef.current?.click()}
                      disabled={savingNosotrosHero}
                      className="px-4 py-2 bg-white text-gray-800 rounded-lg font-medium text-sm hover:bg-gray-100"
                    >
                      Cambiar
                    </button>
                    <button
                      onClick={eliminarNosotrosHero}
                      disabled={savingNosotrosHero}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => nosotrosHeroInputRef.current?.click()}
                  disabled={savingNosotrosHero}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm font-medium">Subir imagen hero</span>
                </button>
              )}
            </div>

            {/* Config Mision / Vision */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuracion de la pagina</h3>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">Titulo del Hero</label>
                  <input
                    type="text"
                    value={nosotrosConfig.nosotrosHeroTitulo}
                    onChange={(e) => setNosotrosConfig(prev => ({ ...prev, nosotrosHeroTitulo: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">Subtitulo del Hero</label>
                  <input
                    type="text"
                    value={nosotrosConfig.nosotrosHeroSubtitulo}
                    onChange={(e) => setNosotrosConfig(prev => ({ ...prev, nosotrosHeroSubtitulo: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Mision */}
              <div className="border-t border-gray-100 pt-6 mb-6">
                <h4 className="font-semibold text-gray-800 mb-4">Mision</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1.5">Titulo</label>
                    <input
                      type="text"
                      value={nosotrosConfig.nosotrosMisionTitulo}
                      onChange={(e) => setNosotrosConfig(prev => ({ ...prev, nosotrosMisionTitulo: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1.5">Icono</label>
                    <div className="flex flex-wrap gap-2">
                      {ICONOS_NOSOTROS.map(({ key, icon: Ic, label }) => (
                        <button
                          key={key}
                          onClick={() => setNosotrosConfig(prev => ({ ...prev, nosotrosMisionIcono: key }))}
                          title={label}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            nosotrosConfig.nosotrosMisionIcono === key
                              ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                          }`}
                        >
                          <Ic className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">Texto de la Mision</label>
                  <textarea
                    value={nosotrosConfig.nosotrosMisionTexto}
                    onChange={(e) => setNosotrosConfig(prev => ({ ...prev, nosotrosMisionTexto: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Vision */}
              <div className="border-t border-gray-100 pt-6 mb-6">
                <h4 className="font-semibold text-gray-800 mb-4">Vision</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1.5">Titulo</label>
                    <input
                      type="text"
                      value={nosotrosConfig.nosotrosVisionTitulo}
                      onChange={(e) => setNosotrosConfig(prev => ({ ...prev, nosotrosVisionTitulo: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1.5">Icono</label>
                    <div className="flex flex-wrap gap-2">
                      {ICONOS_NOSOTROS.map(({ key, icon: Ic, label }) => (
                        <button
                          key={key}
                          onClick={() => setNosotrosConfig(prev => ({ ...prev, nosotrosVisionIcono: key }))}
                          title={label}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            nosotrosConfig.nosotrosVisionIcono === key
                              ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                          }`}
                        >
                          <Ic className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">Texto de la Vision</label>
                  <textarea
                    value={nosotrosConfig.nosotrosVisionTexto}
                    onChange={(e) => setNosotrosConfig(prev => ({ ...prev, nosotrosVisionTexto: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Titulo de valores */}
              <div className="border-t border-gray-100 pt-6 mb-6">
                <label className="block text-sm text-gray-500 mb-1.5">Titulo de la seccion Valores</label>
                <input
                  type="text"
                  value={nosotrosConfig.nosotrosValoresTitulo}
                  onChange={(e) => setNosotrosConfig(prev => ({ ...prev, nosotrosValoresTitulo: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Boton guardar */}
              <button
                onClick={guardarNosotrosConfig}
                disabled={savingNosotrosConfig}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {savingNosotrosConfig ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Guardar configuracion
              </button>
            </div>

            {/* CRUD Valores Institucionales */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Valores institucionales</h3>
                  <p className="text-sm text-gray-500 mt-1">Tarjetas con imagen que aparecen en la seccion de valores.</p>
                </div>
                <button
                  onClick={() => abrirNosotrosValorModal()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Agregar valor
                </button>
              </div>

              {nosotrosValores.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No hay valores creados</p>
                  <p className="text-sm mt-1">Agrega valores institucionales con imagen.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nosotrosValores.map((valor) => (
                    <div key={valor.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                        {valor.imagenPath && (
                          <img
                            src={getUploadUrl(valor.imagenPath)}
                            alt={valor.titulo}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{valor.titulo}</p>
                        <p className="text-xs text-gray-400">Orden: {valor.orden || 0}</p>
                      </div>
                      {/* Acciones */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleNosotrosValor(valor.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            valor.activo ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={valor.activo ? 'Desactivar' : 'Activar'}
                        >
                          {valor.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => abrirNosotrosValorModal(valor)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminarNosotrosValor(valor.id)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Valor Nosotros */}
      {showNosotrosValorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingNosotrosValor ? 'Editar valor' : 'Nuevo valor'}
                </h2>
                <button
                  onClick={cerrarNosotrosValorModal}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Titulo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Titulo *</label>
                <input
                  type="text"
                  value={nosotrosValorForm.titulo}
                  onChange={(e) => setNosotrosValorForm(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Excelencia en el servicio"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Orden */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Orden</label>
                <input
                  type="number"
                  value={nosotrosValorForm.orden}
                  onChange={(e) => setNosotrosValorForm(prev => ({ ...prev, orden: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Imagen {!editingNosotrosValor && '*'}
                </label>
                <input
                  type="file"
                  ref={nosotrosValorImgRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setNosotrosValorForm(prev => ({
                        ...prev,
                        imagenFile: file,
                        imagenPreview: URL.createObjectURL(file)
                      }))
                    }
                  }}
                />
                {nosotrosValorForm.imagenPreview ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={nosotrosValorForm.imagenPreview}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      onClick={() => nosotrosValorImgRef.current?.click()}
                      className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <span className="px-4 py-2 bg-white text-gray-800 rounded-lg font-medium text-sm">
                        Cambiar imagen
                      </span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => nosotrosValorImgRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm font-medium">Seleccionar imagen</span>
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={cerrarNosotrosValorModal}
                className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarNosotrosValor}
                disabled={savingNosotrosValor}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {savingNosotrosValor ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {editingNosotrosValor ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
        {/* Tab: Preguntas Frecuentes */}
        {!loading && activeTab === 'faq' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <span className="text-sm text-gray-500">
                {faqs.length} pregunta{faqs.length !== 1 ? 's' : ''} frecuente{faqs.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => abrirFaqModal()}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agregar Pregunta
              </button>
            </div>

            {/* Lista */}
            {faqs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No hay preguntas frecuentes</h3>
                <p className="text-gray-500 mt-1">Agrega preguntas para mostrar en la pagina publica</p>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq, index) => {
                  const catInfo = getCategoriaInfo(faq.categoria)
                  return (
                    <div
                      key={faq.id}
                      className={`bg-white rounded-xl border ${faq.activo ? 'border-gray-200' : 'border-gray-200 opacity-60'} p-4 flex items-start gap-4`}
                    >
                      {/* Numero de orden */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm ${faq.activo ? 'text-gray-900' : 'text-gray-500'}`}>
                          {faq.pregunta}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{faq.respuesta}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catInfo.color}`}>
                            {catInfo.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${faq.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {faq.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => moverFaq(index, -1)}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Subir"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moverFaq(index, 1)}
                          disabled={index === faqs.length - 1}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Bajar"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title={faq.activo ? 'Desactivar' : 'Activar'}
                        >
                          {faq.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => abrirFaqModal(faq)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-50 hover:text-primary-600"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminarFaq(faq.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      {/* Modal FAQ */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingFaq ? 'Editar pregunta' : 'Nueva pregunta'}
                </h2>
                <button
                  onClick={cerrarFaqModal}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Pregunta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pregunta *</label>
                <input
                  type="text"
                  value={faqForm.pregunta}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, pregunta: e.target.value }))}
                  placeholder="Ej: ¿Puedo cambiar la fecha de mi pasaje?"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Respuesta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Respuesta *</label>
                <textarea
                  value={faqForm.respuesta}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, respuesta: e.target.value }))}
                  placeholder="Escribe la respuesta..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS_FAQ.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setFaqForm(prev => ({ ...prev, categoria: cat.value }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        faqForm.categoria === cat.value
                          ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={cerrarFaqModal}
                className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarFaq}
                disabled={savingFaq}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {savingFaq ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {editingFaq ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal Ventaja Encomienda */}
      {showEncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingVentaja ? 'Editar Ventaja' : 'Nueva Ventaja'}
              </h2>
              <button onClick={cerrarEncModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Card</label>
                <div
                  onClick={() => encVentajaImgRef.current?.click()}
                  className="relative w-full h-40 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 hover:border-primary-300 transition-colors"
                >
                  {ventajaForm.imagenPreview ? (
                    <>
                      <img src={ventajaForm.imagenPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium text-sm">Cambiar imagen</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <Upload className="w-8 h-8 mb-1" />
                      <span className="text-xs">Clic para seleccionar imagen</span>
                      <span className="text-xs mt-0.5">Si no se sube imagen, se mostrara un icono</span>
                    </div>
                  )}
                </div>
                <input ref={encVentajaImgRef} type="file" accept="image/*" onChange={handleVentajaImgChange} className="hidden" />
              </div>

              {/* Titulo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Titulo *</label>
                <input
                  type="text"
                  value={ventajaForm.titulo}
                  onChange={(e) => setVentajaForm(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Cobertura a nivel nacional"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Descripcion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripcion</label>
                <textarea
                  value={ventajaForm.descripcion}
                  onChange={(e) => setVentajaForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripcion de la ventaja..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Icono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icono (se usa si no hay imagen)</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICONOS_VENTAJA.map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setVentajaForm(prev => ({ ...prev, icono: key }))}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                        ventajaForm.icono === key
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                      title={label}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Orden */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Orden</label>
                <input
                  type="number"
                  value={ventajaForm.orden}
                  onChange={(e) => setVentajaForm(prev => ({ ...prev, orden: parseInt(e.target.value) || 0 }))}
                  min={0}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={cerrarEncModal}
                className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarVentaja}
                disabled={savingVentaja}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {savingVentaja ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {editingVentaja ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LandingAdminPage
