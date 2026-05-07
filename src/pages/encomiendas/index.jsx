/**
 * Encomiendas Index Page
 * Listado de encomiendas con filtros y acciones
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Card, StatusBadge, Modal, ComprobantePrint, QRGenerator, RotuloEncomiendaPrint, RotuloPreviewModal } from '../../components/common'
import { PermissionGate } from '../../features/auth'
import encomiendasService from '../../services/encomiendasService'
import { getUploadUrl } from '../../services/apiClient'
import facturacionService from '../../services/facturacionService'
import configuracionService from '../../services/configuracionService'
import { formatDateOnly, formatTimestamp } from '../../utils/dateUtils'
import debugLog from '../../utils/debugLog'
import bluetoothPrinter from '../../services/bluetoothPrinter'
import { PRINTER_PROFILES } from '../../services/printing/profiles'
import { setPrintPageSize, clearPrintPageSize } from '../../utils/printPageSize'
import useDocLookup from '../../hooks/useDocLookup'
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
  BluetoothOff
} from 'lucide-react'
import toast from 'react-hot-toast'

const EncomiendasIndexPage = () => {
  const navigate = useNavigate()
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
  const { loading: buscandoDoc, consultarDni, consultarRuc, reset: resetDocLookup } = useDocLookup()
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
  const [entregarForm, setEntregarForm] = useState({ dniRetiro: '', nota: '', claveIngresada: '' })
  const [fotoEntrega, setFotoEntrega] = useState(null)
  const [procesandoEntrega, setProcesandoEntrega] = useState(false)
  const [encomiendaDetalleEntrega, setEncomiendaDetalleEntrega] = useState(null)
  const fotoEntregaRef = useRef(null)

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
      setPagination(prev => ({ ...prev, total: response.total || 0 }))
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
    setEntregarForm({ dniRetiro: '', nota: '', claveIngresada: '' })
    setFotoEntrega(null)
    setEncomiendaDetalleEntrega(null)
    setEntregarModal({ open: true, encomienda })
    try {
      const response = await encomiendasService.obtener(encomienda.id)
      setEncomiendaDetalleEntrega(response.encomienda)
    } catch (error) {
      console.error('Error cargando detalle para entrega:', error)
    }
  }

  const handleFotoEntregaChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La foto no debe superar 5MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setFotoEntrega(reader.result)
    reader.readAsDataURL(file)
  }

  const confirmarEntrega = async () => {
    if (!entregarForm.dniRetiro || entregarForm.dniRetiro.length !== 8) {
      toast.error('Ingrese un DNI valido de 8 digitos')
      return
    }
    const tieneClave = encomiendaDetalleEntrega?.clave_seguridad || encomiendaDetalleEntrega?.claveSeguridad
    if (tieneClave && !entregarForm.claveIngresada) {
      toast.error('Ingrese la clave de seguridad')
      return
    }
    try {
      setProcesandoEntrega(true)
      await encomiendasService.retirar(entregarModal.encomienda.id, {
        dniRetiro: entregarForm.dniRetiro,
        fotoBase64: fotoEntrega || undefined,
        nota: entregarForm.nota || 'Entrega registrada desde lista',
        claveIngresada: entregarForm.claveIngresada || undefined
      })
      toast.success('Entrega registrada exitosamente')
      setEntregarModal({ open: false, encomienda: null })
      cargarEncomiendas()
    } catch (error) {
      console.error('Error registrando entrega:', error)
      toast.error(error.response?.data?.error || 'Error al registrar entrega')
    } finally {
      setProcesandoEntrega(false)
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
        tipoDoc: '1',
        numDoc: encomienda.remitenteDni || '',
        razonSocial: encomienda.remitenteNombre || '',
        direccion: ''
      }
    })
    setFacturarModal({ open: true, encomienda })
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
      render: (value) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoColor(value)}`}>
          {value?.replace(/_/g, ' ') || 'N/A'}
        </span>
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
                  DNI (Remitente/Destinatario)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="dni"
                    value={filters.dni}
                    onChange={handleFilterChange}
                    placeholder="Buscar por DNI..."
                    maxLength={8}
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

        {/* Tabla */}
        <Card padding={false}>
          <Table
            columns={columns}
            data={encomiendas}
            loading={loading}
            emptyMessage="No hay encomiendas registradas"
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              onPageChange: (page) => setPagination(prev => ({ ...prev, page }))
            }}
          />
        </Card>
      </div>


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
                  <p className="text-gray-500">DNI: {detalleModal.encomienda.remitenteDni}</p>
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
                              <strong>DNI de quien retira:</strong> {evento.dniRetiro}
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

      {/* Area de impresion Rotulo Adhesivo 100x150mm */}
      {printData && printTarget === 'rotulo' && (
        <div className="print-area" id="rotulo-encomienda-print">
          <RotuloEncomiendaPrint encomienda={printData} />
        </div>
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
                onChange={(e) => setFacturarForm(prev => ({
                  ...prev,
                  tipoComprobante: e.target.value,
                  serie: e.target.value === '01' ? 'FT74' : 'BT74',
                  cliente: { ...prev.cliente, tipoDoc: e.target.value === '01' ? '6' : '1' }
                }))}
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
                  onChange={(e) => setFacturarForm(prev => ({
                    ...prev,
                    cliente: { ...prev.cliente, tipoDoc: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  <option value="1">DNI</option>
                  <option value="6">RUC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero Doc.</label>
                <div className="relative">
                  <input
                    type="text"
                    value={facturarForm.cliente.numDoc}
                    onChange={async (e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      setErrorBusquedaDoc('')
                      setFacturarForm(prev => ({
                        ...prev,
                        cliente: { ...prev.cliente, numDoc: value, razonSocial: '', direccion: '' }
                      }))
                      // Auto-busqueda cuando se completa el documento
                      if (facturarForm.cliente.tipoDoc === '6' && value.length === 11) {
                        const result = await consultarRuc(value)
                        if (result) {
                          setErrorBusquedaDoc('')
                          setFacturarForm(prev => ({
                            ...prev,
                            cliente: {
                              ...prev.cliente,
                              razonSocial: result.razon_social || result.nombre_o_razon_social || '',
                              direccion: result.direccion || result.domicilio_fiscal || ''
                            }
                          }))
                        } else {
                          setErrorBusquedaDoc('RUC no encontrado. Verifique que el número sea correcto.')
                        }
                      } else if (facturarForm.cliente.tipoDoc === '1' && value.length === 8) {
                        const result = await consultarDni(value)
                        if (result) {
                          setErrorBusquedaDoc('')
                          setFacturarForm(prev => ({
                            ...prev,
                            cliente: {
                              ...prev.cliente,
                              razonSocial: result.nombre_completo || ''
                            }
                          }))
                        } else {
                          setErrorBusquedaDoc('DNI no encontrado. Verifique que el número sea correcto.')
                        }
                      }
                    }}
                    maxLength={facturarForm.cliente.tipoDoc === '6' ? 11 : 8}
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
                    conductor: { ...prev.conductor, tipoDoc: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  <option value="1">DNI</option>
                  <option value="6">RUC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número Doc. *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={guiaEncomiendaForm.conductor.numDoc}
                    onChange={async (e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8)
                      setGuiaEncomiendaForm(prev => ({
                        ...prev,
                        conductor: { ...prev.conductor, numDoc: value }
                      }))
                      // Auto-busqueda cuando se completa el DNI del conductor
                      if (value.length === 8) {
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
                    placeholder="12345678"
                    maxLength={8}
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
        onClose={() => setEntregarModal({ open: false, encomienda: null })}
        title="Registrar Entrega"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEntregarModal({ open: false, encomienda: null })}
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
        }
      >
        {entregarModal.encomienda && (
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI de quien retira *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={entregarForm.dniRetiro}
                  onChange={(e) => setEntregarForm(prev => ({ ...prev, dniRetiro: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Ingrese DNI (8 digitos)"
                  maxLength={8}
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
