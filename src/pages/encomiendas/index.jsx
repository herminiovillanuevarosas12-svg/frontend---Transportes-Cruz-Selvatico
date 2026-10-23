/**
 * Encomiendas Index Page
 * Listado de encomiendas con filtros y acciones
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Card, Modal, Input, Select, ComprobantePrint, QRGenerator, RotuloEncomiendaPrint, RotuloPreviewModal, DocumentoIdentidadInput, GuiaEntregaPrint } from '../../components/common'
import { PermissionGate, useAuthStore } from '../../features/auth'
import encomiendasService from '../../services/encomiendasService'
import { getUploadUrl } from '../../services/apiClient'
import facturacionService from '../../services/facturacionService'
import configuracionService from '../../services/configuracionService'
import puntosService from '../../services/puntosService'
import { conductoresService, busesService } from '../../services/flotaService'
import { formatDateOnly, formatTimeOnly, formatTimestamp, getTodayInPeru } from '../../utils/dateUtils'
import debugLog from '../../utils/debugLog'
import bluetoothPrinter from '../../services/bluetoothPrinter'
import { PRINTER_PROFILES } from '../../services/printing/profiles'
import { setPrintPageSize, clearPrintPageSize } from '../../utils/printPageSize'
import useDocLookup from '../../hooks/useDocLookup'
import {
  TIPOS_DOCUMENTO,
  CODIGO_DNI,
  CODIGO_RUC,
  detectarTipoDocumento,
  normalizarDocumento,
  ajustarTipoPorNumero,
  obtenerTipoDocumento,
  esDocumentoValido,
  mensajeErrorDocumento,
  siglaDocumento
} from '../../utils/documentoIdentidad'
import { generarListaEncomiendasPDF } from '../../components/encomiendas/encomiendasListaPDF'
import { generarGuiaEntregaPDF } from '../../components/encomiendas/guiaEntregaPDF'
import { generarManifiestoPDF } from '../../components/encomiendas/manifiestoEncomiendasPDF'
import {
  esSeleccionableParaManifiesto,
  resumirSeleccionManifiesto,
  origenDeSeleccion,
  destinoComun
} from '../../utils/manifiestoEncomiendas'
import { textoSelector } from '../../utils/selector'
import { comprimirImagenADataUrl, mensajeErrorImagen } from '../../utils/imageCompression'
import {
  Package,
  Search,
  Filter,
  Plus,
  Eye,
  MapPin,
  User,
  Phone,
  Calendar,
  Truck,
  FileText,
  Receipt,
  Printer,
  Tag,
  AlertCircle,
  Clock,
  Camera,
  CheckCircle2,
  Loader2,
  PackageCheck,
  ImagePlus,
  Lock,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  FileDown,
  ClipboardList,
  FileStack
} from 'lucide-react'
import toast from 'react-hot-toast'

const EncomiendasIndexPage = () => {
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  const hasPermission = useAuthStore(state => state.hasPermission)
  const [encomiendas, setEncomiendas] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })

  // Filtros
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    estado: '',
    codigoTracking: '',
    dni: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Exportación PDF
  const [exportandoPdf, setExportandoPdf] = useState(false)

  // Manifiesto de encomiendas: selección de encomiendas En ruta (id -> encomienda, persiste entre páginas)
  const [modoManifiesto, setModoManifiesto] = useState(false)
  const [seleccionManifiesto, setSeleccionManifiesto] = useState({})
  const [generandoManifiesto, setGenerandoManifiesto] = useState(false)
  const [descargandoManifiesto, setDescargandoManifiesto] = useState(null)
  const [manifiestosModal, setManifiestosModal] = useState(false)
  const [manifiestos, setManifiestos] = useState([])
  const [manifiestosPagination, setManifiestosPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [cargandoManifiestos, setCargandoManifiestos] = useState(false)
  // Datos del viaje del manifiesto: modal abierto, opciones de las listas y valores elegidos
  const [datosViajeModal, setDatosViajeModal] = useState(false)
  const [opcionesViaje, setOpcionesViaje] = useState({ puntos: [], conductores: [], buses: [] })
  const [cargandoOpcionesViaje, setCargandoOpcionesViaje] = useState(false)
  const [datosViaje, setDatosViaje] = useState({})

  // Modal de detalle
  const [detalleModal, setDetalleModal] = useState({ open: false, encomienda: null })
  const [detalleCompleto, setDetalleCompleto] = useState(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

  // Reimprimir guia
  const [printData, setPrintData] = useState(null)

  // Modal de facturacion
  const [facturarModal, setFacturarModal] = useState({ open: false, encomienda: null })
  const [facturarForm, setFacturarForm] = useState({
    tipoComprobante: '03',
    serie: 'BT74',
    incluyeIgv: true,
    cliente: { tipoDoc: '1', numDoc: '', razonSocial: '', direccion: '' }
  })
  const [procesandoFactura, setProcesandoFactura] = useState(false)
  const [configSunat, setConfigSunat] = useState(null)

  // Modal de guía de remisión
  const [guiaModal, setGuiaModal] = useState({ open: false, encomienda: null })
  const [guiaEncomiendaForm, setGuiaEncomiendaForm] = useState({
    fechaInicioTraslado: '',
    motivoTraslado: '01',
    transporteTipo: '01',
    ubigeoPartida: '',
    direccionPartida: '',
    ubigeoLlegada: '',
    direccionLlegada: '',
    transportista: { ruc: '', razonSocial: '' },
    conductor: { tipoDoc: '1', numDoc: '', nombres: '', apellidos: '', licencia: '' },
    vehiculo: { placa: '' }
  })
  const [procesandoGuia, setProcesandoGuia] = useState(false)

  // Hook para auto-busqueda de DNI/RUC
  const { loading: buscandoDoc, consultarDni, consultarRuc, consultarDocumentoDiferido, reset: resetDocLookup } = useDocLookup()
  const [errorBusquedaDoc, setErrorBusquedaDoc] = useState('')

  // Datos de empresa para impresión
  const [datosEmpresa, setDatosEmpresa] = useState(null)

  // Políticas de encomienda para impresión
  const [politicasEncomienda, setPoliticasEncomienda] = useState('')

  // Modal de ver comprobante
  const [verComprobanteModal, setVerComprobanteModal] = useState({ open: false, encomienda: null })
  const [comprobanteParaVer, setComprobanteParaVer] = useState(null)
  const [encomiendaDetalleComprobante, setEncomiendaDetalleComprobante] = useState(null)
  const [cargandoComprobante, setCargandoComprobante] = useState(false)

  // Modal de entrega
  const [entregarModal, setEntregarModal] = useState({ open: false, encomienda: null })
  const [entregarForm, setEntregarForm] = useState({ tipoDocRetiro: CODIGO_DNI, dniRetiro: '', nombreRetiro: '', nota: '', claveIngresada: '' })
  const [fotoEntrega, setFotoEntrega] = useState(null)
  const [procesandoEntrega, setProcesandoEntrega] = useState(false)
  const [encomiendaDetalleEntrega, setEncomiendaDetalleEntrega] = useState(null)
  const fotoEntregaRef = useRef(null)

  // Entrega confirmada: datos de quien recibe para imprimir la guía de entrega
  const [entregaRegistrada, setEntregaRegistrada] = useState(null)
  const [guiaEntregaData, setGuiaEntregaData] = useState(null)
  const [preparandoGuiaEntrega, setPreparandoGuiaEntrega] = useState(false)

  // Control de impresion
  const [printTarget, setPrintTarget] = useState(null)

  // Modal de preview de rótulo
  const [rotuloPreviewModal, setRotuloPreviewModal] = useState({ open: false, encomienda: null })

  // Estado de la impresora Bluetooth
  const [btState, setBtState] = useState(bluetoothPrinter.getState())
  const [btBusy, setBtBusy] = useState(false)
  useEffect(() => {
    const unsub = bluetoothPrinter.subscribe(setBtState)
    bluetoothPrinter.tryReconnect().catch(() => {})
    return unsub
  }, [])

  const handleConectarBT = async () => {
    if (btState.isConnected) {
      await bluetoothPrinter.disconnect()
      toast.success('Impresora desconectada')
      return
    }
    if (!btState.isAvailable) {
      toast.error('Web Bluetooth no disponible. Use Chrome o Edge en Android/Windows.')
      return
    }
    try {
      setBtBusy(true)
      const st = await bluetoothPrinter.requestAndConnect()
      toast.success(`Impresora conectada: ${st.deviceName || 'sin nombre'}`)
    } catch (err) {
      const msg = err?.name === 'NotFoundError' ? 'No seleccionó ninguna impresora' : (err?.message || 'Error al conectar')
      toast.error(msg)
    } finally {
      setBtBusy(false)
    }
  }

  const handleTestBT = async () => {
    try {
      setBtBusy(true)
      await bluetoothPrinter.printTestPage()
      toast.success('Test enviado a impresora')
    } catch (err) {
      toast.error(err?.message || 'Error al imprimir test')
    } finally {
      setBtBusy(false)
    }
  }

  const handleProtocolChange = (e) => {
    bluetoothPrinter.setProtocol(e.target.value)
    toast.success(`Protocolo: ${e.target.value === 'auto' ? 'Auto' : e.target.value.toUpperCase()}`)
  }

  const handleFormatChange = (e) => {
    bluetoothPrinter.setFormat(e.target.value)
    const fmt = PRINTER_PROFILES.find((f) => f.id === e.target.value)
    toast.success(`Formato: ${fmt?.label || e.target.value}`)
  }

  // Constantes para catálogos SUNAT
  const MOTIVOS_TRASLADO = [
    { value: '01', label: 'Venta' },
    { value: '02', label: 'Compra' },
    { value: '04', label: 'Traslado entre establecimientos' },
    { value: '08', label: 'Importación' },
    { value: '09', label: 'Exportación' },
    { value: '13', label: 'Otros' },
    { value: '14', label: 'Venta sujeta a confirmación' }
  ]

  const TIPOS_TRANSPORTE = [
    { value: '01', label: 'Transporte Público' },
    { value: '02', label: 'Transporte Privado' }
  ]

  const cargarEncomiendas = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }
      // Limpiar params vacios
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key]
      })

      const response = await encomiendasService.listar(params)
      setEncomiendas(response.encomiendas || [])
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1
      }))
    } catch (error) {
      console.error('Error cargando encomiendas:', error)
      toast.error('Error al cargar encomiendas')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    cargarEncomiendas()
    // Cargar datos de empresa para impresión
    facturacionService.obtenerConfiguracion()
      .then(res => {
        setDatosEmpresa(res.configuracion)
        setConfigSunat(res.configuracion)
      })
      .catch(() => {})
    // Cargar políticas de encomienda
    configuracionService.obtener()
      .then(res => {
        if (res.configuracion?.politicasEncomienda) {
          setPoliticasEncomienda(res.configuracion.politicasEncomienda)
        }
      })
      .catch(() => {})
  }, [cargarEncomiendas])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      fechaDesde: '',
      fechaHasta: '',
      estado: '',
      codigoTracking: '',
      dni: ''
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Exportar listado a PDF respetando los filtros activos
  const handleExportarPDF = async () => {
    try {
      setExportandoPdf(true)
      const baseParams = { ...filters }
      // Limpiar params vacios (igual que cargarEncomiendas)
      Object.keys(baseParams).forEach(key => {
        if (baseParams[key] === '') delete baseParams[key]
      })

      // Traer TODOS los registros que coinciden con los filtros (no solo la pagina actual)
      const limit = 500
      let page = 1
      let totalPages = 1
      let todas = []
      do {
        const response = await encomiendasService.listar({ ...baseParams, page, limit })
        todas = todas.concat(response.encomiendas || [])
        totalPages = response.pagination?.totalPages || 1
        page++
      } while (page <= totalPages && page <= 20) // tope de seguridad: 10,000 registros

      if (todas.length === 0) {
        toast.error('No hay encomiendas para exportar')
        return
      }

      await generarListaEncomiendasPDF(todas, filters, datosEmpresa?.razonSocial || 'Cruz Selvatico')
      toast.success(`PDF generado con ${todas.length} encomienda${todas.length !== 1 ? 's' : ''}`)
    } catch (error) {
      console.error('Error exportando PDF:', error)
      toast.error('Error al exportar PDF')
    } finally {
      setExportandoPdf(false)
    }
  }

  // Manifiesto: entrar al modo selección mostrando solo las encomiendas En ruta
  const handleIniciarManifiesto = () => {
    setModoManifiesto(true)
    setSeleccionManifiesto({})
    setShowFilters(true)
    setFilters(prev => ({ ...prev, estado: 'EN_RUTA' }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleCancelarManifiesto = () => {
    setModoManifiesto(false)
    setSeleccionManifiesto({})
  }

  const toggleSeleccionManifiesto = (encomienda) => {
    setSeleccionManifiesto(prev => {
      const siguiente = { ...prev }
      if (siguiente[encomienda.id]) delete siguiente[encomienda.id]
      else siguiente[encomienda.id] = encomienda
      return siguiente
    })
  }

  // Un manifiesto tiene un solo origen: lo fija la primera encomienda elegida.
  // Sin selección, "seleccionar página" toma el origen de la primera seleccionable.
  const encomiendasSeleccionadas = Object.values(seleccionManifiesto)
  const idOrigenFijado = origenDeSeleccion(encomiendasSeleccionadas)
  const idOrigenPagina = idOrigenFijado ?? origenDeSeleccion(encomiendas.filter((e) => esSeleccionableParaManifiesto(e)))
  const seleccionablesPagina = encomiendas.filter((e) => esSeleccionableParaManifiesto(e, idOrigenPagina))
  const paginaSeleccionada = seleccionablesPagina.length > 0 &&
    seleccionablesPagina.every(e => seleccionManifiesto[e.id])

  const toggleSeleccionPagina = () => {
    setSeleccionManifiesto(prev => {
      const siguiente = { ...prev }
      seleccionablesPagina.forEach(e => {
        if (paginaSeleccionada) delete siguiente[e.id]
        else siguiente[e.id] = e
      })
      return siguiente
    })
  }

  const resumenSeleccion = resumirSeleccionManifiesto(encomiendasSeleccionadas)

  // Abrir el modal de datos del viaje con las listas actualizadas
  const handleAbrirDatosViaje = async () => {
    if (encomiendasSeleccionadas.length === 0) {
      toast.error('Seleccione al menos una encomienda En ruta')
      return
    }

    setDatosViaje({
      idPuntoDestino: destinoComun(encomiendasSeleccionadas) ?? '',
      fechaSalida: getTodayInPeru(),
      horaSalida: '',
      idConductor: '',
      idBus: ''
    })
    setDatosViajeModal(true)

    try {
      setCargandoOpcionesViaje(true)
      const [respuestaPuntos, respuestaConductores, respuestaBuses] = await Promise.all([
        puntosService.listar(),
        conductoresService.listar(),
        busesService.listar()
      ])
      setOpcionesViaje({
        puntos: respuestaPuntos.puntos || [],
        conductores: respuestaConductores.conductores || [],
        buses: respuestaBuses.buses || []
      })
    } catch (error) {
      console.error('Error cargando datos del viaje:', error)
      toast.error(error.response?.data?.error || 'Error al cargar destinos, conductores y buses')
    } finally {
      setCargandoOpcionesViaje(false)
    }
  }

  const setCampoViaje = (campo, valor) => setDatosViaje(prev => ({ ...prev, [campo]: valor }))

  // Destino final: cualquier punto activo distinto del origen
  const opcionesDestino = opcionesViaje.puntos
    .filter(punto => punto.id !== idOrigenFijado)
    .map(punto => ({ value: punto.id, label: `${punto.nombre} (${punto.ciudad})` }))

  const handleGenerarManifiesto = async () => {
    const faltante = Object.values(datosViaje).some(valor => valor === '' || valor === null)
    if (faltante) {
      toast.error('Complete todos los datos del viaje')
      return
    }

    try {
      setGenerandoManifiesto(true)
      const { mensaje, manifiesto } = await encomiendasService.generarManifiesto({
        idsEncomiendas: encomiendasSeleccionadas.map(e => e.id),
        ...datosViaje
      })
      toast.success(mensaje)
      setDatosViajeModal(false)
      setModoManifiesto(false)
      setSeleccionManifiesto({})
      cargarEncomiendas()
      try {
        await generarManifiestoPDF(manifiesto)
      } catch (errorPdf) {
        console.error('Error generando PDF del manifiesto:', errorPdf)
        toast.error(`El manifiesto ${manifiesto.numeroCompleto} se generó, pero falló la descarga del PDF. Descárguelo desde "Manifiestos".`)
      }
    } catch (error) {
      console.error('Error generando manifiesto:', error)
      toast.error(error.response?.data?.error || 'Error al generar el manifiesto')
      // Otra persona pudo incluir alguna encomienda: refrescar para mostrar los bloqueos
      if (error.response?.status === 409) {
        setDatosViajeModal(false)
        cargarEncomiendas()
      }
    } finally {
      setGenerandoManifiesto(false)
    }
  }

  const handleDescargarManifiesto = async (idManifiesto) => {
    try {
      setDescargandoManifiesto(idManifiesto)
      const { manifiesto } = await encomiendasService.obtenerManifiesto(idManifiesto)
      await generarManifiestoPDF(manifiesto)
    } catch (error) {
      console.error('Error descargando manifiesto:', error)
      toast.error(error.response?.data?.error || 'Error al descargar el manifiesto')
    } finally {
      setDescargandoManifiesto(null)
    }
  }

  const cargarManifiestos = async (page = 1) => {
    try {
      setCargandoManifiestos(true)
      const response = await encomiendasService.listarManifiestos({ page, limit: manifiestosPagination.limit })
      setManifiestos(response.manifiestos || [])
      setManifiestosPagination(prev => ({
        ...prev,
        page,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1
      }))
    } catch (error) {
      console.error('Error cargando manifiestos:', error)
      toast.error('Error al cargar los manifiestos')
    } finally {
      setCargandoManifiestos(false)
    }
  }

  const handleAbrirManifiestos = () => {
    setManifiestosModal(true)
    cargarManifiestos(1)
  }

  // Función para ver comprobante emitido
  const handleVerComprobante = async (encomienda) => {
    const comprobanteId = encomienda.idComprobante || encomienda.id_comprobante
    if (!comprobanteId) return

    try {
      setCargandoComprobante(true)
      setVerComprobanteModal({ open: true, encomienda })
      const response = await facturacionService.obtenerComprobante(comprobanteId)
      const comp = response.comprobante

      // Mapear datos al formato de ComprobantePrint
      // Usar comp.origen que viene del backend con los datos completos
      const tipoDoc = comp.tipoComprobante === '01' ? 'FACTURA' : comp.tipoComprobante === '03' ? 'BOLETA' : 'VERIFICACION'
      setComprobanteParaVer({
        tipoDocumento: tipoDoc,
        numeroCompleto: comp.numeroCompleto,
        clienteNombre: comp.clienteRazonSocial,
        clienteDocumento: comp.clienteNumDoc,
        clienteDireccion: comp.clienteDireccion,
        agencia: comp.origen?.agencia || null,
        ruta: comp.origen?.ruta || {
          origen: encomienda.puntoOrigen?.nombre,
          destino: encomienda.puntoDestino?.nombre
        },
        fecha: comp.origen?.fechaRegistro || encomienda.fechaRegistro,
        hora: null, // Encomiendas no tienen hora específica
        total: comp.total,
        fechaEmision: comp.fechaEmision
      })
      // Guardar detalle de encomienda si el comprobante es de tipo ENCOMIENDA
      if (comp.origen?.tipo === 'ENCOMIENDA' && comp.origen?.paquete) {
        setEncomiendaDetalleComprobante(comp.origen.paquete)
      } else {
        setEncomiendaDetalleComprobante(null)
      }
    } catch (error) {
      console.error('Error cargando comprobante:', error)
      toast.error('Error al cargar comprobante')
      setVerComprobanteModal({ open: false, encomienda: null })
    } finally {
      setCargandoComprobante(false)
    }
  }

  // Función para imprimir comprobante
  const handlePrintComprobante = () => {
    debugLog.info('print:comprobante', 'Click Imprimir Comprobante', {})
    setPrintTarget('comprobante')
    setPrintPageSize('comprobante')
    setTimeout(() => {
      const area = document.getElementById('comprobante-print-area') || document.querySelector('.print-area')
      debugLog.info('print:comprobante', 'DOM antes de window.print()', {
        existeArea: !!area,
        areaChildren: area?.children?.length || 0,
        mediaPrintMatches: window.matchMedia?.('print')?.matches,
      })
      try {
        window.print()
      } catch (err) {
        debugLog.error('print:comprobante', 'window.print() excepción', { err: String(err) })
      }
      setTimeout(() => {
        setPrintTarget(null)
        clearPrintPageSize()
      }, 500)
    }, 300)
  }

  // Funciones de entrega
  const handleAbrirEntregarModal = async (encomienda) => {
    resetDocLookup()
    setEntregarForm({ tipoDocRetiro: CODIGO_DNI, dniRetiro: '', nombreRetiro: '', nota: '', claveIngresada: '' })
    setFotoEntrega(null)
    setEncomiendaDetalleEntrega(null)
    setEntregaRegistrada(null)
    setEntregarModal({ open: true, encomienda })
    try {
      const response = await encomiendasService.obtener(encomienda.id)
      setEncomiendaDetalleEntrega(response.encomienda)
    } catch (error) {
      console.error('Error cargando detalle para entrega:', error)
    }
  }

  const cerrarEntregarModal = () => {
    setEntregarModal({ open: false, encomienda: null })
    setEntregaRegistrada(null)
  }

  // Documento de quien retira: limpia el nombre y lo autocompleta desde RENIEC/SUNAT,
  // los clientes registrados o, si el documento coincide, el destinatario.
  const handleDocumentoEntregaChange = async ({ tipo, numero }) => {
    setEntregarForm(prev => ({ ...prev, tipoDocRetiro: tipo, dniRetiro: numero, nombreRetiro: '' }))
    if (!esDocumentoValido(tipo, numero)) return

    const result = await consultarDocumentoDiferido(numero, { tipo })
    if (result === undefined) return // cancelada por una escritura posterior
    const dniDestinatario = String(encomiendaDetalleEntrega?.destinatario_dni || '').trim().toUpperCase()
    const nombre = result?.nombre_completo || result?.razon_social
      || (numero === dniDestinatario ? encomiendaDetalleEntrega?.destinatarioNombre : '')
    if (!nombre) return
    // No pisar un nombre que el usuario escribió mientras se consultaba
    setEntregarForm(prev => (prev.nombreRetiro ? prev : { ...prev, nombreRetiro: nombre }))
  }

  const handleFotoEntregaChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      // Recodificar SIEMPRE a JPEG comprimido (max 1600px, calidad 0.8):
      // - normaliza formatos no renderizables (HEIC/HEIF de Android/iPhone)
      // - reduce el payload para evitar errores de tamano y timeouts
      const dataUrl = await comprimirImagenADataUrl(file, { maxSizeMB: 10 })
      setFotoEntrega(dataUrl)
    } catch (error) {
      toast.error(mensajeErrorImagen(error))
      if (fotoEntregaRef.current) {
        fotoEntregaRef.current.value = ''
      }
    }
  }

  // Datos de quien recibe tomados del formulario (valida documento y nombre).
  // Sirven para confirmar la entrega y para imprimir la guía antes de confirmarla.
  const entregaDesdeFormulario = () => {
    if (!esDocumentoValido(entregarForm.tipoDocRetiro, entregarForm.dniRetiro)) {
      toast.error(mensajeErrorDocumento(entregarForm.tipoDocRetiro, 'quien retira'))
      return null
    }
    const nombre = entregarForm.nombreRetiro.trim()
    if (!nombre) {
      toast.error('Ingrese el nombre de quien retira')
      return null
    }
    return {
      encomiendaId: entregarModal.encomienda.id,
      nombre,
      tipoDoc: entregarForm.tipoDocRetiro,
      numeroDoc: entregarForm.dniRetiro,
      fecha: new Date().toISOString(),
      atendidoPor: user?.nombres || '',
      nota: entregarForm.nota.trim(),
      comprobante: ''
    }
  }

  const confirmarEntrega = async () => {
    const entrega = entregaDesdeFormulario()
    if (!entrega) return
    const tieneClave = encomiendaDetalleEntrega?.clave_seguridad || encomiendaDetalleEntrega?.claveSeguridad
    if (tieneClave && !entregarForm.claveIngresada) {
      toast.error('Ingrese la clave de seguridad')
      return
    }
    try {
      setProcesandoEntrega(true)
      const response = await encomiendasService.retirar(entrega.encomiendaId, {
        dniRetiro: entrega.numeroDoc,
        tipoDocRetiro: entrega.tipoDoc,
        nombreRetiro: entrega.nombre,
        fotoBase64: fotoEntrega || undefined,
        nota: entrega.nota ? `Retiro por: ${entrega.nombre} - ${entrega.nota}` : `Retiro por: ${entrega.nombre}`,
        claveIngresada: entregarForm.claveIngresada || undefined
      })
      toast.success('Entrega registrada exitosamente')
      // El modal queda abierto en modo "entrega registrada" para imprimir la guía de entrega
      setEntregaRegistrada({
        ...entrega,
        fecha: response.encomienda?.dateTimeModification || entrega.fecha,
        comprobante: response.comprobante?.numeroCompleto || ''
      })
      cargarEncomiendas()
    } catch (error) {
      console.error('Error registrando entrega:', error)
      toast.error(error.response?.data?.error || 'Error al registrar entrega')
    } finally {
      setProcesandoEntrega(false)
    }
  }

  // Guía de entrega (80mm): datos de la encomienda + firma de recepción de quien retira.
  // Antes de confirmar usa los datos del formulario; después, los de la entrega registrada.
  const handleImprimirGuiaEntrega = async () => {
    const entrega = entregaRegistrada || entregaDesdeFormulario()
    if (!entrega) return
    try {
      setPreparandoGuiaEntrega(true)
      const response = await encomiendasService.imprimir(entrega.encomiendaId)
      setGuiaEntregaData({ encomienda: response.encomienda, entrega })
      setPrintTarget('entrega')
      setPrintPageSize('guia')

      setTimeout(() => {
        try { window.print() } catch (err) {
          debugLog.error('print:entrega', 'window.print() excepción', { err: String(err) })
        }
        setTimeout(() => {
          setPrintTarget(null)
          clearPrintPageSize()
        }, 500)
      }, 300)
    } catch (error) {
      console.error('Error preparando guía de entrega:', error)
      toast.error('Error al preparar la guía de entrega')
    } finally {
      setPreparandoGuiaEntrega(false)
    }
  }

  const handleDescargarGuiaEntrega = async () => {
    const entrega = entregaRegistrada || entregaDesdeFormulario()
    if (!entrega) return
    try {
      setPreparandoGuiaEntrega(true)
      const response = await encomiendasService.imprimir(entrega.encomiendaId)
      await generarGuiaEntregaPDF(response.encomienda, entrega)
    } catch (error) {
      console.error('Error generando PDF de guía de entrega:', error)
      toast.error('Error al generar el PDF de la guía de entrega')
    } finally {
      setPreparandoGuiaEntrega(false)
    }
  }

  // Cargar encomienda completa para modal de detalle
  const cargarDetalleEncomienda = async (encomienda) => {
    setDetalleModal({ open: true, encomienda })
    setDetalleCompleto(null)
    setCargandoDetalle(true)
    try {
      const response = await encomiendasService.obtener(encomienda.id)
      setDetalleCompleto(response.encomienda)
    } catch (error) {
      console.error('Error cargando detalle:', error)
      // Si falla, usar los datos del listado
      setDetalleCompleto(encomienda)
    } finally {
      setCargandoDetalle(false)
    }
  }

  const handleReimprimir = async (encomienda) => {
    debugLog.info('print:guia', 'Click Reimprimir Guía', { id: encomienda?.id, codigo: encomienda?.codigoTracking || encomienda?.codigo })
    try {
      const t0 = performance.now()
      const response = await encomiendasService.imprimir(encomienda.id)
      debugLog.info('print:guia', 'API imprimir() OK', {
        ms: Math.round(performance.now() - t0),
        hasEncomienda: !!response?.encomienda,
        codigo: response?.encomienda?.codigo,
        hasQr: !!response?.encomienda?.qr,
        qrLen: response?.encomienda?.qr?.length || 0,
      })
      setPrintData(response.encomienda)
      setPrintTarget('guia')
      setPrintPageSize('guia')
      debugLog.info('print:guia', 'printData/printTarget seteados, esperando 300ms', {})

      setTimeout(() => {
        const area = document.querySelector('.print-area')
        const allAreas = document.querySelectorAll('.print-area')
        debugLog.info('print:guia', 'DOM antes de window.print()', {
          areasEnDOM: allAreas.length,
          firstAreaChildren: area?.children?.length || 0,
          firstAreaHTML: area?.innerHTML?.length || 0,
          mediaPrintMatches: window.matchMedia?.('print')?.matches,
          devicePixelRatio: window.devicePixelRatio,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        })
        try {
          const ret = window.print()
          debugLog.info('print:guia', 'window.print() retornó', { ret: typeof ret === 'undefined' ? 'undefined' : String(ret) })
        } catch (err) {
          debugLog.error('print:guia', 'window.print() lanzó excepción', { err: String(err), stack: err?.stack })
        }
        setTimeout(() => {
          setPrintTarget(null)
          clearPrintPageSize()
        }, 500)
      }, 300)
    } catch (error) {
      debugLog.error('print:guia', 'Error en flujo Reimprimir', { err: String(error), msg: error?.message, stack: error?.stack })
      console.error('Error obteniendo datos de impresion:', error)
      toast.error('Error al preparar la impresion')
    }
  }

  // Click en "Imprimir Rótulo" → carga datos y abre modal de preview.
  const handleImprimirRotulo = async (encomienda) => {
    debugLog.info('print:rotulo', 'Click Imprimir Rótulo (abrir preview)', {
      id: encomienda?.id,
      codigo: encomienda?.codigoTracking || encomienda?.codigo,
    })
    try {
      const response = await encomiendasService.imprimir(encomienda.id)
      debugLog.info('print:rotulo', 'API imprimir() OK', {
        codigo: response?.encomienda?.codigo,
        hasQr: !!response?.encomienda?.qr,
      })
      setRotuloPreviewModal({ open: true, encomienda: response.encomienda })
    } catch (error) {
      debugLog.error('print:rotulo', 'Error cargando datos de rótulo', {
        err: String(error),
        status: error?.response?.status,
      })
      toast.error('Error al preparar el rotulo')
    }
  }

  // Confirmación desde el modal de preview → ejecuta impresión real (BT o fallback).
  const handleConfirmarImpresionRotulo = async () => {
    const enc = rotuloPreviewModal.encomienda
    if (!enc) throw new Error('Sin datos de encomienda')

    const btSt = bluetoothPrinter.getState()
    debugLog.info('print:rotulo', 'Confirmar impresión desde modal', {
      btConnected: btSt.isConnected,
      formatId: btSt.formatId,
      protocol: btSt.effectiveProtocol,
    })

    if (btSt.isConnected) {
      await bluetoothPrinter.printRotulo(enc)
      toast.success('Rótulo enviado a impresora BT')
      return
    }

    // Fallback window.print: el HTML del rótulo en CSS está fijado a 76×76 mm,
    // por lo que se mantiene el page size 'rotulo' acoplado a ese layout.
    return new Promise((resolve) => {
      setPrintData(enc)
      setPrintTarget('rotulo')
      document.documentElement.classList.add('printing-rotulo')
      document.body.classList.add('printing-rotulo')
      setPrintPageSize('rotulo')

      setTimeout(() => {
        try { window.print() } catch (err) {
          debugLog.error('print:rotulo', 'window.print() excepción', { err: String(err) })
        }
        setTimeout(() => {
          document.documentElement.classList.remove('printing-rotulo')
          document.body.classList.remove('printing-rotulo')
          clearPrintPageSize()
          setPrintTarget(null)
          resolve()
        }, 500)
      }, 300)
    })
  }

  const handleFacturar = (encomienda) => {
    setErrorBusquedaDoc('')
    setFacturarForm({
      tipoComprobante: '03',
      serie: 'BT74',
      incluyeIgv: configSunat?.exoneradoIgv ? false : true,
      cliente: {
        tipoDoc: detectarTipoDocumento(encomienda.remitenteDni || ''),
        numDoc: encomienda.remitenteDni || '',
        razonSocial: encomienda.remitenteNombre || '',
        direccion: ''
      }
    })
    setFacturarModal({ open: true, encomienda })
  }

  // Cambio de tipo de documento del cliente: adapta el número al nuevo tipo y limpia el nombre
  const handleTipoDocFacturar = (tipoDoc) => {
    setErrorBusquedaDoc('')
    setFacturarForm(prev => ({
      ...prev,
      cliente: { tipoDoc, numDoc: normalizarDocumento(tipoDoc, prev.cliente.numDoc), razonSocial: '', direccion: '' }
    }))
  }

  // Cambio del número: limpia el nombre y lo autocompleta desde RENIEC (DNI), SUNAT (RUC)
  // o los clientes registrados (CE). La consulta es diferida: si el usuario sigue escribiendo se cancela.
  const handleNumDocFacturar = async (valor) => {
    const esFactura = facturarForm.tipoComprobante === '01'
    const numDoc = normalizarDocumento(facturarForm.cliente.tipoDoc, valor)
    const tipoDoc = esFactura ? CODIGO_RUC : ajustarTipoPorNumero(facturarForm.cliente.tipoDoc, numDoc)
    setErrorBusquedaDoc('')
    setFacturarForm(prev => ({
      ...prev,
      cliente: { ...prev.cliente, tipoDoc, numDoc, razonSocial: '', direccion: '' }
    }))

    if (!esDocumentoValido(tipoDoc, numDoc)) return

    const result = await consultarDocumentoDiferido(numDoc, { tipo: tipoDoc })
    if (result === undefined) return // cancelada por una escritura posterior
    if (!result) {
      if (obtenerTipoDocumento(tipoDoc).consultaApi) {
        setErrorBusquedaDoc(tipoDoc === CODIGO_RUC
          ? 'RUC no encontrado. Verifique que el número sea correcto.'
          : 'DNI no encontrado. Ingrese el nombre manualmente.')
      }
      return
    }
    setFacturarForm(prev => ({
      ...prev,
      cliente: {
        ...prev.cliente,
        razonSocial: result.nombre_completo || result.razon_social || '',
        direccion: tipoDoc === CODIGO_RUC ? (result.direccion || '') : ''
      }
    }))
  }

  const confirmarFacturacion = async () => {
    if (!facturarForm.cliente.numDoc || !facturarForm.cliente.razonSocial) {
      toast.error('Complete los datos del cliente')
      return
    }

    try {
      setProcesandoFactura(true)
      await facturacionService.emitirDesdeEncomienda(facturarModal.encomienda.id, {
        tipoComprobante: facturarForm.tipoComprobante,
        serie: facturarForm.serie,
        incluyeIgv: facturarForm.incluyeIgv,
        cliente: facturarForm.cliente
      })
      toast.success('Comprobante emitido exitosamente')
      setFacturarModal({ open: false, encomienda: null })
      cargarEncomiendas()
    } catch (error) {
      console.error('Error emitiendo comprobante:', error)
      toast.error(error.response?.data?.error || 'Error al emitir comprobante')
    } finally {
      setProcesandoFactura(false)
    }
  }

  const handleAbrirGuiaModal = (encomienda) => {
    // Precargar direcciones desde puntos de origen/destino si están disponibles
    setGuiaEncomiendaForm({
      fechaInicioTraslado: new Date().toISOString().split('T')[0],
      motivoTraslado: '01',
      transporteTipo: '01',
      ubigeoPartida: encomienda.puntoOrigen?.ubigeo || '',
      direccionPartida: encomienda.puntoOrigen?.direccion || '',
      ubigeoLlegada: encomienda.puntoDestino?.ubigeo || '',
      direccionLlegada: encomienda.puntoDestino?.direccion || '',
      transportista: { ruc: '', razonSocial: '' },
      conductor: { tipoDoc: '1', numDoc: '', nombres: '', apellidos: '', licencia: '' },
      vehiculo: { placa: '' }
    })
    setGuiaModal({ open: true, encomienda })
  }

  const confirmarEmisionGuiaEncomienda = async () => {
    // Validaciones
    if (!guiaEncomiendaForm.fechaInicioTraslado) {
      toast.error('Ingrese la fecha de inicio de traslado')
      return
    }
    if (!guiaEncomiendaForm.ubigeoPartida || guiaEncomiendaForm.ubigeoPartida.length !== 6) {
      toast.error('Ubigeo de partida debe tener 6 dígitos')
      return
    }
    if (!guiaEncomiendaForm.direccionPartida) {
      toast.error('Ingrese la dirección de partida')
      return
    }
    if (!guiaEncomiendaForm.ubigeoLlegada || guiaEncomiendaForm.ubigeoLlegada.length !== 6) {
      toast.error('Ubigeo de llegada debe tener 6 dígitos')
      return
    }
    if (!guiaEncomiendaForm.direccionLlegada) {
      toast.error('Ingrese la dirección de llegada')
      return
    }
    if (!guiaEncomiendaForm.transportista.ruc) {
      toast.error('Debe ingresar RUC del transportista')
      return
    }
    if (!guiaEncomiendaForm.transportista.razonSocial) {
      toast.error('Debe ingresar razón social del transportista')
      return
    }
    if (!guiaEncomiendaForm.conductor.numDoc) {
      toast.error('Debe ingresar número de documento del conductor')
      return
    }
    if (!guiaEncomiendaForm.conductor.nombres || !guiaEncomiendaForm.conductor.apellidos) {
      toast.error('Debe ingresar nombres y apellidos del conductor')
      return
    }

    try {
      setProcesandoGuia(true)
      await facturacionService.emitirGuiaDesdeEncomienda(
        guiaModal.encomienda.id,
        guiaEncomiendaForm
      )
      toast.success('Guía de remisión emitida exitosamente')
      setGuiaModal({ open: false, encomienda: null })
      cargarEncomiendas()
    } catch (error) {
      console.error('Error emitiendo guía:', error)
      toast.error(error.response?.data?.error || 'Error al emitir guía')
    } finally {
      setProcesandoGuia(false)
    }
  }

  const getEstadoColor = (estado) => {
    const colores = {
      REGISTRADO: 'bg-yellow-100 text-yellow-800',
      EN_ALMACEN: 'bg-blue-100 text-blue-800',
      EN_RUTA: 'bg-purple-100 text-purple-800',
      LLEGO_A_DESTINO: 'bg-green-100 text-green-800',
      RETIRADO: 'bg-gray-100 text-gray-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  const columns = [
    {
      key: 'codigoTracking',
      header: 'Codigo',
      render: (value) => (
        <span className="font-mono font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'remitente',
      header: 'Remitente',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.remitenteNombre || 'N/A'}</p>
          <p className="text-sm text-gray-500">{row.remitenteTelefono || ''}</p>
        </div>
      )
    },
    {
      key: 'destinatario',
      header: 'Destinatario',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.destinatarioNombre || 'N/A'}</p>
          <p className="text-sm text-gray-500">{row.destinatarioTelefono || ''}</p>
        </div>
      )
    },
    {
      key: 'ruta',
      header: 'Ruta',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 text-sm">
            {row.puntoOrigen?.nombre || '?'} → {row.puntoDestino?.nombre || '?'}
          </span>
        </div>
      )
    },
    {
      key: 'descripcion',
      header: 'Descripcion',
      render: (value) => (
        <span className="text-gray-700 truncate max-w-[150px] block" title={value}>
          {value || 'Sin descripcion'}
        </span>
      )
    },
    {
      key: 'precioCalculado',
      header: 'Flete',
      render: (value) => (
        <span className="font-medium text-gray-900">
          S/ {parseFloat(value || 0).toFixed(2)}
        </span>
      )
    },
    {
      key: 'estadoActual',
      header: 'Estado',
      render: (value, row) => (
        <div className="flex flex-col items-start gap-1">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoColor(value)}`}>
            {value?.replace(/_/g, ' ') || 'N/A'}
          </span>
          {row.manifiesto && (
            hasPermission('ENCOMIENDAS_MANIFIESTO') && row.manifiesto.descargable ? (
              <button
                type="button"
                onClick={() => handleDescargarManifiesto(row.manifiesto.id)}
                disabled={descargandoManifiesto === row.manifiesto.id}
                className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-green-800 hover:underline disabled:opacity-50"
                title="Descargar manifiesto"
              >
                <ClipboardList className="w-3 h-3" />
                {row.manifiesto.numeroCompleto}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-green-800">
                <ClipboardList className="w-3 h-3" />
                {row.manifiesto.numeroCompleto}
              </span>
            )
          )}
        </div>
      )
    },
    {
      key: 'dateTimeRegistration',
      header: 'Fecha',
      render: (value) => (
        <span className="text-gray-600 text-sm">
          {value ? formatDateOnly(value) : 'N/A'}
        </span>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => cargarDetalleEncomienda(row)}
          >
            Ver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Printer}
            className="text-indigo-600 hover:bg-indigo-50"
            onClick={() => handleReimprimir(row)}
            title="Reimprimir Guia"
          >
            Guia
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Tag}
            className="text-pink-600 hover:bg-pink-50"
            onClick={() => handleImprimirRotulo(row)}
            title="Imprimir Rotulo Adhesivo 100x150mm"
          >
            Rotulo
          </Button>
          {!row.idComprobante && !row.id_comprobante && (
            <PermissionGate permission="FACTURACION_EMITIR">
              <Button
                variant="ghost"
                size="sm"
                icon={Receipt}
                className="text-green-600 hover:bg-green-50"
                onClick={() => handleFacturar(row)}
              >
                Facturar
              </Button>
            </PermissionGate>
          )}
          {row.estadoActual === 'LLEGO_A_DESTINO' && (
            <PermissionGate permission="ENCOMIENDAS_RETIRAR">
              <Button
                variant="ghost"
                size="sm"
                icon={PackageCheck}
                className="text-orange-600 hover:bg-orange-50"
                onClick={() => handleAbrirEntregarModal(row)}
              >
                Entregar
              </Button>
            </PermissionGate>
          )}
          {!row.idGuiaRemision && !row.id_guia_remision && (
            <PermissionGate permission="FACTURACION_EMITIR">
              <button
                onClick={() => handleAbrirGuiaModal(row)}
                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Generar Guía de Remisión"
              >
                <Truck className="w-4 h-4" />
              </button>
            </PermissionGate>
          )}
          {(row.idGuiaRemision || row.id_guia_remision) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              <Truck className="w-3 h-3 mr-1" />
              GRE
            </span>
          )}
          {(row.idComprobante || row.id_comprobante) && (
            <>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <FileText className="w-3 h-3 mr-1" />
                Facturado
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon={Eye}
                className="text-blue-600 hover:bg-blue-50"
                onClick={() => handleVerComprobante(row)}
                title="Ver comprobante"
              >
                Ver
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  // En modo manifiesto se antepone la columna de selección
  const columnaSeleccion = {
    key: 'seleccionManifiesto',
    header: (
      <input
        type="checkbox"
        className="w-4 h-4 accent-green-700"
        checked={paginaSeleccionada}
        onChange={toggleSeleccionPagina}
        disabled={seleccionablesPagina.length === 0}
        title="Seleccionar las encomiendas En ruta de esta página"
      />
    ),
    render: (_, row) => {
      if (row.manifiesto) {
        return (
          <span title={`Ya pertenece al manifiesto ${row.manifiesto.numeroCompleto}`}>
            <Lock className="w-4 h-4 text-gray-400" />
          </span>
        )
      }
      const seleccionable = esSeleccionableParaManifiesto(row, idOrigenFijado)
      const titulo = seleccionable
        ? 'Incluir en el manifiesto'
        : esSeleccionableParaManifiesto(row)
          ? `El manifiesto ya tiene encomiendas de ${encomiendasSeleccionadas[0]?.puntoOrigen?.nombre}: solo admite un origen`
          : 'Solo se pueden incluir encomiendas En ruta'
      return (
        <input
          type="checkbox"
          className="w-4 h-4 accent-green-700"
          checked={Boolean(seleccionManifiesto[row.id])}
          onChange={() => toggleSeleccionManifiesto(row)}
          disabled={!seleccionable}
          title={titulo}
        />
      )
    }
  }

  const columnasTabla = modoManifiesto ? [columnaSeleccion, ...columns] : columns

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Encomiendas</h1>
            <p className="text-gray-500">Gestion de envios y paquetes</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={btState.protocol || 'auto'}
              onChange={handleProtocolChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              title="Protocolo de la impresora térmica"
            >
              <option value="auto">Protocolo: Auto{btState.effectiveProtocol ? ` (${btState.effectiveProtocol.toUpperCase()})` : ''}</option>
              <option value="tspl">Protocolo: TSPL (TSC, EX58C)</option>
              <option value="escpos">Protocolo: ESC/POS (genérica)</option>
            </select>
            <select
              value={btState.formatId || '76x76'}
              onChange={handleFormatChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              title="Tamaño del rótulo a imprimir"
            >
              {PRINTER_PROFILES.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            <Button
              variant="outline"
              icon={btState.isConnected ? BluetoothConnected : (btState.isAvailable ? Bluetooth : BluetoothOff)}
              onClick={handleConectarBT}
              disabled={btBusy}
              className={btState.isConnected ? 'border-green-500 text-green-700' : ''}
              title={btState.isConnected
                ? `Conectado: ${btState.deviceName || 'sin nombre'} (${btState.effectiveProtocol?.toUpperCase()}) - click para desconectar`
                : (btState.isAvailable ? 'Conectar impresora Bluetooth' : 'Web Bluetooth no disponible en este navegador')}
            >
              {btBusy
                ? 'Conectando...'
                : btState.isConnected
                  ? `BT: ${btState.deviceName || 'OK'}`
                  : 'Conectar Impresora BT'}
            </Button>
            {btState.isConnected && (
              <Button
                variant="outline"
                icon={Printer}
                onClick={handleTestBT}
                disabled={btBusy}
                title="Imprimir página de prueba"
              >
                Test
              </Button>
            )}
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros
            </Button>
            <Button
              variant="outline"
              icon={FileDown}
              onClick={handleExportarPDF}
              disabled={exportandoPdf || loading}
              title="Exportar listado a PDF (respeta los filtros activos)"
            >
              {exportandoPdf ? 'Exportando...' : 'Exportar PDF'}
            </Button>
            <PermissionGate permission="ENCOMIENDAS_MANIFIESTO">
              <Button
                variant="outline"
                icon={FileStack}
                onClick={handleAbrirManifiestos}
                title="Ver y descargar los manifiestos generados"
              >
                Manifiestos
              </Button>
              {!modoManifiesto && (
                <Button
                  variant="outline"
                  icon={ClipboardList}
                  onClick={handleIniciarManifiesto}
                  title="Seleccionar encomiendas En ruta para generar un manifiesto"
                >
                  Generar Manifiesto
                </Button>
              )}
            </PermissionGate>
            <PermissionGate permission="ENCOMIENDAS_REGISTRAR">
              <Button
                icon={Plus}
                onClick={() => navigate('/encomiendas/registro')}
              >
                Nueva Encomienda
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Codigo de Rastreo
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="codigoTracking"
                    value={filters.codigoTracking}
                    onChange={handleFilterChange}
                    placeholder="Buscar por codigo..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documento (Remitente/Destinatario)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="dni"
                    value={filters.dni}
                    onChange={handleFilterChange}
                    placeholder="Buscar por documento..."
                    maxLength={12}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  name="fechaDesde"
                  value={filters.fechaDesde}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  name="fechaHasta"
                  value={filters.fechaHasta}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={filters.estado}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  <option value="">Todos</option>
                  <option value="REGISTRADO">Registrado</option>
                  <option value="EN_ALMACEN">En Almacen</option>
                  <option value="EN_RUTA">En Ruta</option>
                  <option value="LLEGO_A_DESTINO">Llego a Destino</option>
                  <option value="RETIRADO">Retirado</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-4 border-t">
              <Button variant="ghost" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          </Card>
        )}

        {/* Barra de selección del manifiesto */}
        {modoManifiesto && (
          <Card className="border-2 border-green-600">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">
                  Generar manifiesto: seleccione las encomiendas En ruta
                </p>
                <p className="text-sm text-gray-600">
                  {resumenSeleccion.cantidad} seleccionada{resumenSeleccion.cantidad !== 1 ? 's' : ''}
                  {' · '}{resumenSeleccion.pesoTotal.toFixed(2)} kg
                  {' · '}S/ {resumenSeleccion.fleteTotal.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {idOrigenFijado
                    ? `Origen: ${encomiendasSeleccionadas[0]?.puntoOrigen?.nombre}. Solo se pueden agregar encomiendas de este origen.`
                    : 'Todas deben tener el mismo origen. Las que ya pertenecen a un manifiesto aparecen bloqueadas.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={handleCancelarManifiesto}
                  disabled={generandoManifiesto}
                >
                  Cancelar
                </Button>
                <Button
                  icon={ClipboardList}
                  onClick={handleAbrirDatosViaje}
                  disabled={resumenSeleccion.cantidad === 0}
                >
                  Generar manifiesto ({resumenSeleccion.cantidad})
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tabla */}
        <Card padding={false}>
          <Table
            columns={columnasTabla}
            data={encomiendas}
            loading={loading}
            emptyMessage="No hay encomiendas registradas"
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              totalPages: pagination.totalPages
            }}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </Card>
      </div>

      {/* Modal Datos del viaje del manifiesto */}
      <Modal
        isOpen={datosViajeModal}
        onClose={() => setDatosViajeModal(false)}
        title="Datos del viaje"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDatosViajeModal(false)} disabled={generandoManifiesto}>
              Cancelar
            </Button>
            <Button
              icon={ClipboardList}
              onClick={handleGenerarManifiesto}
              loading={generandoManifiesto}
              disabled={cargandoOpcionesViaje}
            >
              Generar manifiesto ({resumenSeleccion.cantidad})
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <span className="text-gray-500">Oficina (origen): </span>
            <span className="font-medium text-gray-900">
              {encomiendasSeleccionadas[0]?.puntoOrigen?.nombre} ({encomiendasSeleccionadas[0]?.puntoOrigen?.ciudad})
            </span>
          </div>
          <Select
            label="Destino final"
            required
            value={datosViaje.idPuntoDestino ?? ''}
            onChange={(e) => setCampoViaje('idPuntoDestino', e.target.value)}
            options={opcionesDestino}
            placeholder={textoSelector({
              cargando: cargandoOpcionesViaje,
              cantidad: opcionesDestino.length,
              seleccionar: 'Seleccione el destino final',
              vacio: 'No hay otros puntos registrados'
            })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fecha de salida"
              type="date"
              required
              value={datosViaje.fechaSalida ?? ''}
              onChange={(e) => setCampoViaje('fechaSalida', e.target.value)}
            />
            <Input
              label="Hora de salida"
              type="time"
              required
              value={datosViaje.horaSalida ?? ''}
              onChange={(e) => setCampoViaje('horaSalida', e.target.value)}
            />
          </div>
          <Select
            label="Conductor"
            required
            value={datosViaje.idConductor ?? ''}
            onChange={(e) => setCampoViaje('idConductor', e.target.value)}
            options={opcionesViaje.conductores.map(c => ({ value: c.id, label: `${c.nombreCompleto} · Lic. ${c.licencia}` }))}
            placeholder={textoSelector({
              cargando: cargandoOpcionesViaje,
              cantidad: opcionesViaje.conductores.length,
              seleccionar: 'Seleccione el conductor',
              vacio: 'No hay conductores registrados (Administración > Flota > Conductores)'
            })}
          />
          <Select
            label="Bus"
            required
            value={datosViaje.idBus ?? ''}
            onChange={(e) => setCampoViaje('idBus', e.target.value)}
            options={opcionesViaje.buses.map(b => ({ value: b.id, label: `${b.numeroInterno} · ${b.placa} · ${b.marca}` }))}
            placeholder={textoSelector({
              cargando: cargandoOpcionesViaje,
              cantidad: opcionesViaje.buses.length,
              seleccionar: 'Seleccione el bus',
              vacio: 'No hay buses registrados (Administración > Flota > Buses)'
            })}
          />
        </div>
      </Modal>

      {/* Modal Manifiestos generados */}
      <Modal
        isOpen={manifiestosModal}
        onClose={() => setManifiestosModal(false)}
        title="Manifiestos de encomiendas"
        size="xl"
      >
        <Table
          columns={[
            {
              key: 'numeroCompleto',
              header: 'Numero',
              render: (value) => <span className="whitespace-nowrap font-mono font-semibold text-gray-900">{value}</span>
            },
            {
              key: 'fechaEmision',
              header: 'Fecha',
              render: (value) => <span className="text-sm text-gray-600">{formatTimestamp(value)}</span>
            },
            {
              key: 'origen',
              header: 'Ruta',
              render: (value, row) => (
                <span className="text-sm text-gray-700">{value || '-'} → {row.destino || '-'}</span>
              )
            },
            {
              key: 'fechaSalida',
              header: 'Salida',
              render: (value, row) => (
                <span className="whitespace-nowrap text-sm text-gray-600">
                  {value ? `${formatDateOnly(value)} ${formatTimeOnly(row.horaSalida)}` : '-'}
                </span>
              )
            },
            {
              key: 'cantidad',
              header: 'Encomiendas',
              render: (value) => <span className="text-gray-900">{value}</span>
            },
            {
              key: 'fleteTotal',
              header: 'Flete total',
              render: (value) => <span className="font-medium text-gray-900">S/ {Number(value || 0).toFixed(2)}</span>
            },
            {
              key: 'usuarioEmision',
              header: 'Generado por',
              render: (value) => <span className="text-sm text-gray-600">{value}</span>
            },
            {
              key: 'acciones',
              header: '',
              render: (_, row) => (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FileDown}
                  onClick={() => handleDescargarManifiesto(row.id)}
                  loading={descargandoManifiesto === row.id}
                >
                  PDF
                </Button>
              )
            }
          ]}
          data={manifiestos}
          loading={cargandoManifiestos}
          emptyMessage="Todavía no se ha generado ningún manifiesto"
          pagination={manifiestosPagination}
          onPageChange={cargarManifiestos}
        />
      </Modal>


      {/* Modal Detalle */}
      <Modal
        isOpen={detalleModal.open}
        onClose={() => {
          setDetalleModal({ open: false, encomienda: null })
          setDetalleCompleto(null)
        }}
        title="Detalle de Encomienda"
        size="lg"
      >
        {detalleModal.encomienda && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Codigo y Estado */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div>
                <span className="text-sm text-gray-500">Codigo de Rastreo</span>
                <p className="text-xl font-mono font-bold text-gray-900">
                  {detalleModal.encomienda.codigoTracking}
                </p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getEstadoColor(detalleModal.encomienda.estadoActual)}`}>
                {detalleModal.encomienda.estadoActual?.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Ruta */}
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
              <div>
                <span className="text-sm text-blue-700">Ruta</span>
                <p className="font-medium text-blue-900">
                  {detalleModal.encomienda.puntoOrigen?.nombre} → {detalleModal.encomienda.puntoDestino?.nombre}
                </p>
              </div>
            </div>

            {/* Remitente y Destinatario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">Remitente</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900">{detalleModal.encomienda.remitenteNombre}</p>
                  <p className="text-gray-500">{siglaDocumento(detalleModal.encomienda.remitenteDni)}: {detalleModal.encomienda.remitenteDni}</p>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Phone className="w-4 h-4" />
                    {detalleModal.encomienda.remitenteTelefono}
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">Destinatario</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900">{detalleModal.encomienda.destinatarioNombre}</p>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Phone className="w-4 h-4" />
                    {detalleModal.encomienda.destinatarioTelefono}
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles del Paquete */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">Detalles del Paquete</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <p className="text-gray-900">{detalleModal.encomienda.tipoPaquete}</p>
                </div>
                <div>
                  <span className="text-gray-500">Peso:</span>
                  <p className="text-gray-900">{detalleModal.encomienda.peso} kg</p>
                </div>
                <div>
                  <span className="text-gray-500">Dimensiones:</span>
                  <p className="text-gray-900">{detalleModal.encomienda.alto}x{detalleModal.encomienda.ancho}x{detalleModal.encomienda.largo} cm</p>
                </div>
                <div>
                  <span className="text-gray-500">Flete:</span>
                  <p className="text-lg font-bold text-blue-600">
                    S/ {parseFloat(detalleModal.encomienda.precioCalculado || 0).toFixed(2)}
                  </p>
                </div>
                {detalleModal.encomienda.descripcion && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Descripcion:</span>
                    <p className="text-gray-900">{detalleModal.encomienda.descripcion}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Historial de Estados */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">Historial de Estados</span>
              </div>

              {cargandoDetalle ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  <span className="ml-2 text-gray-500">Cargando historial...</span>
                </div>
              ) : detalleCompleto?.eventos && detalleCompleto.eventos.length > 0 ? (
                <div className="relative">
                  {/* Linea vertical de timeline */}
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />

                  <div className="space-y-4">
                    {detalleCompleto.eventos.map((evento, index) => (
                      <div key={evento.id} className="relative flex gap-4">
                        {/* Circulo del timeline */}
                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          index === detalleCompleto.eventos.length - 1
                            ? 'bg-green-100 border-green-500'
                            : 'bg-white border-gray-300'
                        }`}>
                          <CheckCircle2 className={`w-4 h-4 ${
                            index === detalleCompleto.eventos.length - 1
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`} />
                        </div>

                        {/* Contenido del evento */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getEstadoColor(evento.estadoDestino)}`}>
                              {evento.estadoDestino?.replace(/_/g, ' ')}
                            </span>
                            {evento.puntoEvento && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {evento.puntoEvento.nombre}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatTimestamp(evento.fechaEvento)}
                          </p>
                          {evento.nota && (
                            <p className="text-sm text-gray-500 mt-1 italic">
                              {evento.nota}
                            </p>
                          )}
                          {evento.usuarioEvento && (
                            <p className="text-xs text-gray-400 mt-1">
                              Por: {evento.usuarioEvento.nombres}
                            </p>
                          )}

                          {/* DNI de retiro si existe */}
                          {evento.dniRetiro && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Documento de quien retira:</strong> {evento.dniRetiro}
                            </p>
                          )}

                          {/* Foto de evidencia si existe */}
                          {evento.fotoEvidenciaPath && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                                <Camera className="w-4 h-4" />
                                <strong>Foto de evidencia:</strong>
                              </p>
                              <img
                                src={getUploadUrl(evento.fotoEvidenciaPath)}
                                alt="Foto de entrega"
                                className="max-w-xs rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(getUploadUrl(evento.fotoEvidenciaPath), '_blank')}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay historial de eventos disponible
                </p>
              )}
            </div>

            {/* Fechas */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              Registrado: {detalleModal.encomienda.dateTimeRegistration ? formatTimestamp(detalleModal.encomienda.dateTimeRegistration) : 'N/A'}
            </div>
          </div>
        )}
      </Modal>

      {/* Area de impresion Guia - Estilo Cruz Selvatico */}
      {printData && printTarget === 'guia' && (
        <div className="print-area" id="guia-encomienda-print">
          <div className="guia-ticket-cs">
            {/* ═══════ HEADER CON LOGO ═══════ */}
            <div className="guia-cs-header">
              <img src="/logo.png" alt="Cruz Selvatico" className="guia-cs-logo" />
              <div className="guia-cs-empresa-info">
                <span>RUC: 20600812727</span>
                <span>Cal. Ingobert Witting Nro. 270</span>
              </div>
              <div className="guia-cs-doc-title">Guia de Encomienda</div>
            </div>

            <div className="guia-cs-divider"></div>

            {/* ═══════ AGENCIA ═══════ */}
            <div className="guia-cs-section guia-cs-centered">
              <span className="guia-cs-label">AGENCIA</span>
              <span className="guia-cs-value-primary">{printData.origen}</span>
            </div>

            <div className="guia-cs-divider"></div>

            {/* ═══════ CODIGO ═══════ */}
            <div className="guia-cs-section guia-cs-centered">
              <span className="guia-cs-label">CODIGO</span>
              <span className="guia-cs-tracking">{printData.codigo}</span>
            </div>

            {/* ═══════ RUTA ═══════ */}
            <div className="guia-cs-ruta">
              <div className="guia-cs-ruta-col">
                <span className="guia-cs-label">ORIGEN</span>
                <span className="guia-cs-value-primary">{printData.origen}</span>
              </div>
              <div className="guia-cs-ruta-arrow">→</div>
              <div className="guia-cs-ruta-col">
                <span className="guia-cs-label">DESTINO</span>
                <span className="guia-cs-value-primary">{printData.destino}</span>
              </div>
            </div>

            {/* ═══════ TIPO Y PESO ═══════ */}
            <div className="guia-cs-row-2col">
              <div className="guia-cs-col">
                <span className="guia-cs-label">TIPO PAQUETE</span>
                <span className="guia-cs-value-bold">{printData.paquete?.tipo}</span>
              </div>
              <div className="guia-cs-col">
                <span className="guia-cs-label">PESO</span>
                <span className="guia-cs-value-bold">{printData.paquete?.peso} kg</span>
              </div>
            </div>

            <div className="guia-cs-divider"></div>

            {/* ═══════ REMITENTE ═══════ */}
            <div className="guia-cs-section">
              <span className="guia-cs-label">DATOS DEL REMITENTE</span>
              <div className="guia-cs-datos">
                <div className="guia-cs-dato-row">
                  <span className="guia-cs-dato-label">Nombre:</span>
                  <span className="guia-cs-dato-value">{printData.remitente?.nombre}</span>
                </div>
                <div className="guia-cs-dato-row">
                  <span className="guia-cs-dato-label">Documento:</span>
                  <span className="guia-cs-dato-value">{printData.remitente?.dni}</span>
                </div>
                <div className="guia-cs-dato-row">
                  <span className="guia-cs-dato-label">Telefono:</span>
                  <span className="guia-cs-dato-value">{printData.remitente?.telefono}</span>
                </div>
              </div>
            </div>

            <div className="guia-cs-divider"></div>

            {/* ═══════ DESTINATARIO ═══════ */}
            <div className="guia-cs-section">
              <span className="guia-cs-label">DATOS DEL DESTINATARIO</span>
              <div className="guia-cs-datos">
                <div className="guia-cs-dato-row">
                  <span className="guia-cs-dato-label">Nombre:</span>
                  <span className="guia-cs-dato-value">{printData.destinatario?.nombre}</span>
                </div>
                {printData.destinatario?.dni && (
                  <div className="guia-cs-dato-row">
                    <span className="guia-cs-dato-label">Documento:</span>
                    <span className="guia-cs-dato-value">{printData.destinatario.dni}</span>
                  </div>
                )}
                <div className="guia-cs-dato-row">
                  <span className="guia-cs-dato-label">Telefono:</span>
                  <span className="guia-cs-dato-value">{printData.destinatario?.telefono}</span>
                </div>
              </div>
            </div>

            {/* Contenido (si existe) */}
            {printData.paquete?.descripcion && (
              <>
                <div className="guia-cs-divider"></div>
                <div className="guia-cs-section">
                  <span className="guia-cs-label">CONTENIDO</span>
                  <span className="guia-cs-contenido">{printData.paquete.descripcion}</span>
                </div>
              </>
            )}

            {/* ═══════ PRECIO ═══════ */}
            <div className="guia-cs-precio-box">
              <div className="guia-cs-precio-left">
                <span className="guia-cs-precio-label">Precio</span>
                <span className="guia-cs-precio-label">Encomienda</span>
              </div>
              <div className="guia-cs-precio-right">
                <span className="guia-cs-precio-currency">S/</span>
                <span className="guia-cs-precio-monto">
                  {parseFloat(printData.precio || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Estado de pago */}
            <div className={`guia-cs-estado ${printData.pagoAlRecojo ? 'guia-cs-estado-pendiente' : 'guia-cs-estado-pagado'}`}>
              {printData.pagoAlRecojo ? 'PAGO AL RECOJO' : 'PAGADO'}
            </div>

            {/* ═══════ QR ═══════ */}
            <div className="guia-cs-qr-section">
              {printData.qr ? (
                <img src={printData.qr} alt="QR" className="guia-cs-qr" />
              ) : (
                <QRGenerator value={printData.codigo} size={90} />
              )}
            </div>

            <div className="guia-cs-divider"></div>

            {/* ═══════ PUNTOS ═══════ */}
            <div className="guia-cs-section">
              <span className="guia-cs-label">PROGRAMA DE PUNTOS</span>
              <div className="guia-cs-datos">
                <div className="guia-cs-dato-row">
                  <span className="guia-cs-dato-label">Acumulados:</span>
                  <span className="guia-cs-dato-value">
                    {printData.puntosAcumulados ?? 0} pts
                  </span>
                </div>
                <div className="guia-cs-dato-row">
                  <span className="guia-cs-dato-label">Ganados:</span>
                  <span className="guia-cs-dato-value guia-cs-puntos-ganados">
                    +{printData.puntosGanados ?? 0} pts
                  </span>
                </div>
                {printData.puntosUsados > 0 && (
                  <div className="guia-cs-dato-row">
                    <span className="guia-cs-dato-label">Descuento:</span>
                    <span className="guia-cs-dato-value">
                      -{printData.puntosUsados} pts = S/ {printData.descuentoPuntos?.toFixed(2) ?? '0.00'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="guia-cs-divider"></div>

            {/* ═══════ FECHA ═══════ */}
            <div className="guia-cs-fecha">
              Emitido: {printData.fechaRegistro ? formatTimestamp(printData.fechaRegistro) : ''}
            </div>

            {/* ═══════ POLITICAS ═══════ */}
            {politicasEncomienda && (
              <div className="guia-cs-politicas">
                <div className="guia-cs-politicas-title">POLITICAS DE ENVIO DE ENCOMIENDAS</div>
                <div className="guia-cs-politicas-content">
                  {politicasEncomienda.split('\n').map((linea, index) => (
                    linea.trim() && (
                      <p key={index}>• {linea.trim()}</p>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* ═══════ FOOTER ═══════ */}
            <div className="guia-cs-footer">
              <span className="guia-cs-empresa-nombre">Cruz Selvatico</span>
              <span className="guia-cs-gracias">Gracias por su preferencia</span>
            </div>
          </div>
        </div>
      )}

      {/* Area de impresion Guia de Entrega - con firma de recepcion */}
      {guiaEntregaData && printTarget === 'entrega' && (
        <div className="print-area" id="guia-entrega-print">
          <GuiaEntregaPrint encomienda={guiaEntregaData.encomienda} entrega={guiaEntregaData.entrega} />
        </div>
      )}

      {/* Area de impresion Rotulo Adhesivo 76x76mm.
          Se renderiza via portal como hijo directo de <body>: al imprimir,
          el CSS (.printing-rotulo) oculta #root con display:none para que
          el documento mida exactamente 76mm y se genere UNA sola pagina. */}
      {printData && printTarget === 'rotulo' && createPortal(
        <div className="print-area" id="rotulo-encomienda-print">
          <RotuloEncomiendaPrint encomienda={printData} />
        </div>,
        document.body
      )}

      {/* Modal de previsualización del rótulo antes de imprimir */}
      <RotuloPreviewModal
        isOpen={rotuloPreviewModal.open}
        onClose={() => setRotuloPreviewModal({ open: false, encomienda: null })}
        encomienda={rotuloPreviewModal.encomienda}
        onPrint={handleConfirmarImpresionRotulo}
        btConnected={btState.isConnected}
        deviceName={btState.deviceName}
      />

      {/* Modal Facturacion */}
      <Modal
        isOpen={facturarModal.open}
        onClose={() => setFacturarModal({ open: false, encomienda: null })}
        title="Emitir Comprobante"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setFacturarModal({ open: false, encomienda: null })}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarFacturacion}
              disabled={procesandoFactura}
            >
              {procesandoFactura ? 'Emitiendo...' : 'Emitir Comprobante'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Emitir comprobante para la encomienda <strong>{facturarModal.encomienda?.codigoTracking}</strong>
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Ruta: {facturarModal.encomienda?.puntoOrigen?.nombre} → {facturarModal.encomienda?.puntoDestino?.nombre}
            </p>
            <p className="text-sm font-semibold text-blue-800 mt-1">
              Monto: S/ {parseFloat(facturarModal.encomienda?.precioCalculado || 0).toFixed(2)}
            </p>
          </div>

          {/* Toggle IGV */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div>
              <span className="text-sm font-medium text-gray-700">Incluir IGV</span>
              <p className="text-xs text-gray-500 mt-0.5">
                {facturarForm.incluyeIgv
                  ? `Gravado - Se aplicará ${parseFloat(configSunat?.igvPorcentaje) || 18}% de IGV`
                  : 'Exonerado - No se aplicará IGV (Ley de la Amazonía)'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFacturarForm(prev => ({ ...prev, incluyeIgv: !prev.incluyeIgv }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                facturarForm.incluyeIgv ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  facturarForm.incluyeIgv ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={facturarForm.tipoComprobante}
                onChange={(e) => {
                  // Factura exige RUC: si el documento actual no es RUC se limpia para evitar
                  // emitir una factura con DNI y nombre de persona
                  const esFactura = e.target.value === '01'
                  setErrorBusquedaDoc('')
                  setFacturarForm(prev => {
                    const tipoDocActual = detectarTipoDocumento(prev.cliente.numDoc || '')
                    const mantieneDoc = !esFactura || tipoDocActual === CODIGO_RUC
                    return {
                      ...prev,
                      tipoComprobante: e.target.value,
                      serie: esFactura ? 'FT74' : 'BT74',
                      cliente: mantieneDoc
                        ? { ...prev.cliente, tipoDoc: esFactura ? CODIGO_RUC : tipoDocActual }
                        : { tipoDoc: CODIGO_RUC, numDoc: '', razonSocial: '', direccion: '' }
                    }
                  })
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
              >
                <option value="03">Boleta</option>
                <option value="01">Factura</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serie</label>
              <select
                value={facturarForm.serie}
                onChange={(e) => setFacturarForm(prev => ({ ...prev, serie: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
              >
                {facturarForm.tipoComprobante === '01' ? (
                  <option value="FT74">FT74</option>
                ) : (
                  <option value="BT74">BT74</option>
                )}
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Datos del Cliente</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Doc.</label>
                <select
                  value={facturarForm.cliente.tipoDoc}
                  onChange={(e) => handleTipoDocFacturar(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  {facturarForm.tipoComprobante === '01' ? (
                    <option value={CODIGO_RUC}>RUC</option>
                  ) : (
                    TIPOS_DOCUMENTO.map(t => (
                      <option key={t.codigo} value={t.codigo} title={t.nombre}>{t.sigla}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero Doc.</label>
                <div className="relative">
                  <input
                    type="text"
                    value={facturarForm.cliente.numDoc}
                    onChange={(e) => handleNumDocFacturar(e.target.value)}
                    placeholder={obtenerTipoDocumento(facturarForm.cliente.tipoDoc).placeholder}
                    maxLength={obtenerTipoDocumento(facturarForm.cliente.tipoDoc).alfanumerico ? 12 : 11}
                    inputMode={obtenerTipoDocumento(facturarForm.cliente.tipoDoc).alfanumerico ? 'text' : 'numeric'}
                    autoCapitalize="characters"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  />
                  {buscandoDoc && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {errorBusquedaDoc && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errorBusquedaDoc}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Razon Social / Nombre</label>
                <input
                  type="text"
                  value={facturarForm.cliente.razonSocial}
                  onChange={(e) => setFacturarForm(prev => ({
                    ...prev,
                    cliente: { ...prev.cliente, razonSocial: e.target.value }
                  }))}
                  readOnly={facturarForm.cliente.tipoDoc === '6'}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none ${facturarForm.cliente.tipoDoc === '6' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {facturarForm.cliente.tipoDoc === '6' && (
                  <p className="text-xs text-gray-500 mt-1">Se autocompleta con los datos del RUC</p>
                )}
              </div>
              {facturarForm.cliente.tipoDoc === '6' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Direccion Fiscal</label>
                  <input
                    type="text"
                    value={facturarForm.cliente.direccion}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Se autocompleta con los datos del RUC</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Guía de Remisión desde Encomienda */}
      <Modal
        isOpen={guiaModal.open}
        onClose={() => setGuiaModal({ open: false, encomienda: null })}
        title="Emitir Guía de Remisión"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setGuiaModal({ open: false, encomienda: null })}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarEmisionGuiaEncomienda}
              disabled={procesandoGuia}
            >
              {procesandoGuia ? 'Emitiendo...' : 'Emitir Guía'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Info de la Encomienda */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Encomienda: {guiaModal.encomienda?.codigoTracking}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
              <p>Peso: {guiaModal.encomienda?.peso} kg</p>
              <p>Tipo: {guiaModal.encomienda?.tipoPaquete}</p>
              <p className="col-span-2">Destinatario: {guiaModal.encomienda?.destinatarioNombre}</p>
            </div>
          </div>

          {/* Datos Generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Traslado *</label>
              <input
                type="date"
                value={guiaEncomiendaForm.fechaInicioTraslado}
                onChange={(e) => setGuiaEncomiendaForm(prev => ({ ...prev, fechaInicioTraslado: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo Traslado</label>
              <select
                value={guiaEncomiendaForm.motivoTraslado}
                onChange={(e) => setGuiaEncomiendaForm(prev => ({ ...prev, motivoTraslado: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
              >
                {MOTIVOS_TRASLADO.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Transporte</label>
              <select
                value={guiaEncomiendaForm.transporteTipo}
                onChange={(e) => setGuiaEncomiendaForm(prev => ({ ...prev, transporteTipo: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
              >
                {TIPOS_TRANSPORTE.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Punto de Partida */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Punto de Partida</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubigeo *</label>
                <input
                  type="text"
                  value={guiaEncomiendaForm.ubigeoPartida}
                  onChange={(e) => setGuiaEncomiendaForm(prev => ({ ...prev, ubigeoPartida: e.target.value }))}
                  placeholder="150101"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Código SUNAT de 6 dígitos</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <input
                  type="text"
                  value={guiaEncomiendaForm.direccionPartida}
                  onChange={(e) => setGuiaEncomiendaForm(prev => ({ ...prev, direccionPartida: e.target.value }))}
                  placeholder="Av. Principal 123, Lima"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Punto de Llegada */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Punto de Llegada</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubigeo *</label>
                <input
                  type="text"
                  value={guiaEncomiendaForm.ubigeoLlegada}
                  onChange={(e) => setGuiaEncomiendaForm(prev => ({ ...prev, ubigeoLlegada: e.target.value }))}
                  placeholder="150101"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Código SUNAT de 6 dígitos</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <input
                  type="text"
                  value={guiaEncomiendaForm.direccionLlegada}
                  onChange={(e) => setGuiaEncomiendaForm(prev => ({ ...prev, direccionLlegada: e.target.value }))}
                  placeholder="Jr. Destino 456, Provincia"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Transportista (obligatorio según KEYFACIL) */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Transportista *</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUC *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={guiaEncomiendaForm.transportista.ruc}
                    onChange={async (e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                      setGuiaEncomiendaForm(prev => ({
                        ...prev,
                        transportista: { ...prev.transportista, ruc: value }
                      }))
                      // Auto-busqueda cuando se completa el RUC del transportista
                      if (value.length === 11) {
                        const result = await consultarRuc(value)
                        if (result) {
                          setGuiaEncomiendaForm(prev => ({
                            ...prev,
                            transportista: {
                              ...prev.transportista,
                              razonSocial: result.razon_social || result.nombre_o_razon_social || ''
                            }
                          }))
                        }
                      }
                    }}
                    placeholder="20XXXXXXXXX"
                    maxLength={11}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  />
                  {buscandoDoc && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social *</label>
                <input
                  type="text"
                  value={guiaEncomiendaForm.transportista.razonSocial}
                  onChange={(e) => setGuiaEncomiendaForm(prev => ({
                    ...prev,
                    transportista: { ...prev.transportista, razonSocial: e.target.value }
                  }))}
                  placeholder="Nombre del transportista"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Conductor (obligatorio según KEYFACIL) */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Conductor *</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Doc.</label>
                <select
                  value={guiaEncomiendaForm.conductor.tipoDoc}
                  onChange={(e) => setGuiaEncomiendaForm(prev => ({
                    ...prev,
                    conductor: { ...prev.conductor, tipoDoc: e.target.value, numDoc: normalizarDocumento(e.target.value, prev.conductor.numDoc) }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  {TIPOS_DOCUMENTO.map(t => (
                    <option key={t.codigo} value={t.codigo} title={t.nombre}>{t.sigla}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número Doc. *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={guiaEncomiendaForm.conductor.numDoc}
                    onChange={async (e) => {
                      const value = normalizarDocumento(guiaEncomiendaForm.conductor.tipoDoc, e.target.value)
                      const tipoDoc = ajustarTipoPorNumero(guiaEncomiendaForm.conductor.tipoDoc, value)
                      setGuiaEncomiendaForm(prev => ({
                        ...prev,
                        conductor: { ...prev.conductor, tipoDoc, numDoc: value }
                      }))
                      // Auto-busqueda cuando se completa el DNI del conductor (CE y RUC no tienen datos de persona)
                      if (tipoDoc === CODIGO_DNI && value.length === 8) {
                        const result = await consultarDni(value, true) // skipLocal=true
                        if (result) {
                          setGuiaEncomiendaForm(prev => ({
                            ...prev,
                            conductor: {
                              ...prev.conductor,
                              nombres: result.nombres || '',
                              apellidos: `${result.apellido_paterno || ''} ${result.apellido_materno || ''}`.trim()
                            }
                          }))
                        }
                      }
                    }}
                    placeholder={obtenerTipoDocumento(guiaEncomiendaForm.conductor.tipoDoc).placeholder}
                    maxLength={obtenerTipoDocumento(guiaEncomiendaForm.conductor.tipoDoc).alfanumerico ? 12 : 11}
                    inputMode={obtenerTipoDocumento(guiaEncomiendaForm.conductor.tipoDoc).alfanumerico ? 'text' : 'numeric'}
                    autoCapitalize="characters"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  />
                  {buscandoDoc && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Licencia *</label>
                <input
                  type="text"
                  value={guiaEncomiendaForm.conductor.licencia}
                  onChange={(e) => setGuiaEncomiendaForm(prev => ({
                    ...prev,
                    conductor: { ...prev.conductor, licencia: e.target.value }
                  }))}
                  placeholder="Q12345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
                <input
                  type="text"
                  value={guiaEncomiendaForm.conductor.nombres}
                  onChange={(e) => setGuiaEncomiendaForm(prev => ({
                    ...prev,
                    conductor: { ...prev.conductor, nombres: e.target.value }
                  }))}
                  placeholder="Juan Carlos"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                <input
                  type="text"
                  value={guiaEncomiendaForm.conductor.apellidos}
                  onChange={(e) => setGuiaEncomiendaForm(prev => ({
                    ...prev,
                    conductor: { ...prev.conductor, apellidos: e.target.value }
                  }))}
                  placeholder="Pérez García"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Vehículo */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Vehículo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                <input
                  type="text"
                  value={guiaEncomiendaForm.vehiculo.placa}
                  onChange={(e) => setGuiaEncomiendaForm(prev => ({
                    ...prev,
                    vehiculo: { ...prev.vehiculo, placa: e.target.value.toUpperCase() }
                  }))}
                  placeholder="ABC-123"
                  maxLength={7}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Ver Comprobante */}
      <Modal
        isOpen={verComprobanteModal.open}
        onClose={() => {
          setVerComprobanteModal({ open: false, encomienda: null })
          setComprobanteParaVer(null)
        }}
        title="Comprobante Emitido"
        size="md"
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setVerComprobanteModal({ open: false, encomienda: null })
                setComprobanteParaVer(null)
              }}
            >
              Cerrar
            </Button>
            {comprobanteParaVer && (
              <Button
                icon={Printer}
                onClick={handlePrintComprobante}
              >
                Imprimir
              </Button>
            )}
          </div>
        }
      >
        {cargandoComprobante ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando comprobante...</span>
          </div>
        ) : comprobanteParaVer ? (
          <div className="no-print">
            <ComprobantePrint comprobante={comprobanteParaVer} empresa={datosEmpresa} encomiendaDetalle={encomiendaDetalleComprobante} />
          </div>
        ) : null}
      </Modal>

      {/* Modal Entrega */}
      <Modal
        isOpen={entregarModal.open}
        onClose={cerrarEntregarModal}
        title={entregaRegistrada ? 'Entrega Registrada' : 'Registrar Entrega'}
        size="lg"
        footer={
          <div className="flex flex-wrap items-center gap-2 w-full">
            {/* Guía de entrega con firma de recepción: disponible antes y después de confirmar */}
            <Button
              variant="secondary"
              size="sm"
              icon={Printer}
              onClick={handleImprimirGuiaEntrega}
              disabled={preparandoGuiaEntrega}
              title="Imprimir guía de entrega con firma de recepción"
            >
              Imprimir guía
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={FileDown}
              onClick={handleDescargarGuiaEntrega}
              disabled={preparandoGuiaEntrega}
              title="Descargar guía de entrega en PDF"
            >
              Descargar PDF
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              {entregaRegistrada ? (
                <Button variant="secondary" onClick={cerrarEntregarModal}>
                  Cerrar
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={cerrarEntregarModal}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmarEntrega}
                    disabled={procesandoEntrega}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {procesandoEntrega ? 'Registrando...' : 'Confirmar Entrega'}
                  </Button>
                </>
              )}
            </div>
          </div>
        }
      >
        {entregarModal.encomienda && entregaRegistrada && (
          <div className="text-center py-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-900">
              Encomienda <strong>{entregarModal.encomienda.codigoTracking}</strong> entregada
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Recibe: {entregaRegistrada.nombre} ({obtenerTipoDocumento(entregaRegistrada.tipoDoc).sigla} {entregaRegistrada.numeroDoc})
            </p>
            {entregaRegistrada.comprobante && (
              <p className="text-sm text-gray-600">
                Comprobante: {entregaRegistrada.comprobante}
              </p>
            )}
            <p className="text-sm text-orange-700 bg-orange-50 border border-orange-100 rounded-lg p-3 mt-4">
              Imprima la guía de entrega para que quien recibe firme la recepción.
            </p>
          </div>
        )}

        {entregarModal.encomienda && !entregaRegistrada && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                Registrar entrega de encomienda <strong>{entregarModal.encomienda.codigoTracking}</strong>
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Destinatario: {entregarModal.encomienda.destinatarioNombre}
              </p>
              <p className="text-sm text-orange-600">
                Ruta: {entregarModal.encomienda.puntoOrigen?.nombre} → {entregarModal.encomienda.puntoDestino?.nombre}
              </p>
            </div>

            <DocumentoIdentidadInput
              name="dniRetiro"
              label="Documento de quien retira *"
              tipo={entregarForm.tipoDocRetiro}
              numero={entregarForm.dniRetiro}
              onChange={handleDocumentoEntregaChange}
              buscando={buscandoDoc}
              color="orange"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de quien retira *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={entregarForm.nombreRetiro}
                  onChange={(e) => setEntregarForm(prev => ({ ...prev, nombreRetiro: e.target.value }))}
                  placeholder="Se autocompleta con el documento"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            {(encomiendaDetalleEntrega?.clave_seguridad || encomiendaDetalleEntrega?.claveSeguridad) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clave de Seguridad *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={entregarForm.claveIngresada}
                    onChange={(e) => setEntregarForm(prev => ({ ...prev, claveIngresada: e.target.value }))}
                    placeholder="Ingrese clave de 4 digitos"
                    maxLength={4}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto de Evidencia (opcional)
              </label>
              <input
                ref={fotoEntregaRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFotoEntregaChange}
                className="hidden"
              />
              {fotoEntrega ? (
                <div className="relative">
                  <img
                    src={fotoEntrega}
                    alt="Foto de evidencia"
                    className="w-full max-h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => {
                      setFotoEntrega(null)
                      if (fotoEntregaRef.current) fotoEntregaRef.current.value = ''
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fotoEntregaRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
                >
                  <ImagePlus className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Tomar foto o seleccionar archivo</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nota (opcional)
              </label>
              <input
                type="text"
                value={entregarForm.nota}
                onChange={(e) => setEntregarForm(prev => ({ ...prev, nota: e.target.value }))}
                placeholder="Observaciones de la entrega..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Area de impresion - Solo visible al imprimir */}
      {comprobanteParaVer && printTarget === 'comprobante' && (
        <div className="print-area" id="comprobante-print-area">
          <ComprobantePrint comprobante={comprobanteParaVer} empresa={datosEmpresa} encomiendaDetalle={encomiendaDetalleComprobante} />
        </div>
      )}
    </>
  )
}

export default EncomiendasIndexPage
