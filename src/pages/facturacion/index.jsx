/**
 * Facturación Electrónica Page
 * Módulo de facturación con KEYFACIL (Facturas, Boletas, Guías de Remisión)
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import Card, { StatCard } from '../../components/common/Card'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import facturacionService from '../../services/facturacionService'
import { formatDateOnly } from '../../utils/dateUtils'
import useDocLookup from '../../hooks/useDocLookup'
import {
  FileText,
  Receipt,
  Truck,
  Ban,
  RefreshCw,
  Calendar,
  Search,
  Plus,
  Eye,
  FileDown,
  XCircle,
  DollarSign,
  Percent,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Settings,
  ChevronDown
} from 'lucide-react'

// Constantes
const TIPOS_COMPROBANTE = {
  '01': { label: 'Factura', prefijo: 'F' },
  '03': { label: 'Boleta', prefijo: 'B' }
}

const TIPOS_DOCUMENTO = {
  '6': 'RUC',
  '1': 'DNI',
  '-': 'Sin Documento'
}

const ESTADOS_COMPROBANTE = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  ENVIADO: { label: 'Enviado', color: 'bg-blue-100 text-blue-700' },
  ACEPTADO: { label: 'Aceptado', color: 'bg-green-100 text-green-700' },
  RECHAZADO: { label: 'Rechazado', color: 'bg-red-100 text-red-700' },
  ANULADO: { label: 'Anulado', color: 'bg-gray-100 text-gray-700' }
}

const ESTADOS_GUIA = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  ENVIADA: { label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
  ACEPTADA: { label: 'Aceptada', color: 'bg-green-100 text-green-700' },
  RECHAZADA: { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
  ANULADA: { label: 'Anulada', color: 'bg-gray-100 text-gray-700' }
}

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

const TIPOS_DOC_IDENTIDAD = [
  { value: '1', label: 'DNI' },
  { value: '6', label: 'RUC' }
]

const FacturacionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Estados principales
  const [activeTab, setActiveTab] = useState('facturas')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Estados de datos
  const [metricas, setMetricas] = useState({
    facturasMes: 0,
    boletasMes: 0,
    guiasMes: 0,
    docsHoy: 0,
    anuladosMes: 0,
    baseImponibleMes: 0,
    igvMes: 0
  })
  const [comprobantes, setComprobantes] = useState([])
  const [guias, setGuias] = useState([])
  const [series, setSeries] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 })

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    estado: '',
    busqueda: ''
  })

  // Estados de modales
  const [showEmitirModal, setShowEmitirModal] = useState(false)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [showAnularModal, setShowAnularModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showEmitirGuiaModal, setShowEmitirGuiaModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  // Estado del formulario de guía de remisión
  const [guiaForm, setGuiaForm] = useState({
    serie: 'TZ74',
    fechaInicioTraslado: '',
    motivoTraslado: '01',
    transporteTipo: '01',
    pesoBrutoTotal: '',
    numeroBultos: 1,
    ubigeoPartida: '',
    direccionPartida: '',
    ubigeoLlegada: '',
    direccionLlegada: '',
    destinatario: { tipoDoc: '1', numDoc: '', razonSocial: '' },
    transportista: { ruc: '', razonSocial: '' },
    conductor: { tipoDoc: '1', numDoc: '', nombres: '', apellidos: '', licencia: '' },
    vehiculo: { placa: '' },
    items: [{ codigo: '', descripcion: '', cantidad: 1, peso: 0 }]
  })

  // Estados del formulario de emisión
  const [emitirForm, setEmitirForm] = useState({
    tipoComprobante: '03',
    serie: 'BT74',
    cliente: {
      tipoDoc: '1',
      numDoc: '',
      razonSocial: '',
      direccion: ''
    },
    items: [{ descripcion: '', cantidad: 1, precioUnitario: 0 }]
  })

  const [motivoAnulacion, setMotivoAnulacion] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [errorBusquedaDoc, setErrorBusquedaDoc] = useState('')

  // Hook para auto-busqueda de DNI/RUC
  const { loading: buscandoDoc, consultarDni, consultarRuc, reset: resetDocLookup } = useDocLookup()

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos()
  }, [])

  // Verificar si hay un comprobante en la URL para mostrar detalle automáticamente
  useEffect(() => {
    const comprobanteId = searchParams.get('comprobante')
    if (comprobanteId && !loading) {
      // Cargar y mostrar el comprobante
      const cargarComprobanteUrl = async () => {
        try {
          const res = await facturacionService.obtenerComprobante(comprobanteId)
          if (res.comprobante) {
            setSelectedItem(res.comprobante)
            setShowDetalleModal(true)
            // Cambiar al tab correcto según el tipo de comprobante
            if (res.comprobante.tipoComprobante === '01' || res.comprobante.tipo_comprobante === '01') {
              setActiveTab('facturas')
            } else if (res.comprobante.tipoComprobante === '03' || res.comprobante.tipo_comprobante === '03') {
              setActiveTab('boletas')
            }
            // Limpiar el parámetro de la URL
            setSearchParams({})
          }
        } catch (error) {
          console.error('Error cargando comprobante desde URL:', error)
        }
      }
      cargarComprobanteUrl()
    }
  }, [searchParams, loading])

  // Recargar al cambiar de tab o filtros
  useEffect(() => {
    if (!loading) {
      cargarListado()
    }
  }, [activeTab, pagination.page])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [metricasRes, seriesRes] = await Promise.all([
        facturacionService.obtenerMetricas(),
        facturacionService.obtenerSeries()
      ])

      setMetricas(metricasRes)
      setSeries(seriesRes.series || [])

      await cargarListado()
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarListado = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filtros.fechaDesde && { fechaDesde: filtros.fechaDesde },
        ...filtros.fechaHasta && { fechaHasta: filtros.fechaHasta },
        ...filtros.estado && { estado: filtros.estado }
      }

      if (activeTab === 'facturas') {
        params.tipoComprobante = '01'
        const res = await facturacionService.listarComprobantes(params)
        setComprobantes(res.comprobantes || [])
        setPagination(res.pagination)
      } else if (activeTab === 'boletas') {
        params.tipoComprobante = '03'
        const res = await facturacionService.listarComprobantes(params)
        setComprobantes(res.comprobantes || [])
        setPagination(res.pagination)
      } else if (activeTab === 'guias') {
        const res = await facturacionService.listarGuias(params)
        setGuias(res.guias || [])
        setPagination(res.pagination)
      } else if (activeTab === 'anulados') {
        params.estado = 'ANULADO'
        delete params.tipoComprobante
        const res = await facturacionService.listarComprobantes(params)
        setComprobantes(res.comprobantes || [])
        setPagination(res.pagination)
      }
    } catch (error) {
      console.error('Error cargando listado:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    await cargarDatos()
  }

  const handleBuscar = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    cargarListado()
  }

  const handleVerDetalle = async (item) => {
    try {
      let detalle
      if (activeTab === 'guias') {
        const res = await facturacionService.obtenerGuia(item.id)
        detalle = res.guia
      } else {
        const res = await facturacionService.obtenerComprobante(item.id)
        detalle = res.comprobante
      }
      setSelectedItem(detalle)
      setShowDetalleModal(true)
    } catch (error) {
      console.error('Error obteniendo detalle:', error)
    }
  }

  const handleVerPdf = (url) => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  const handleAnular = (item) => {
    setSelectedItem(item)
    setMotivoAnulacion('')
    setShowAnularModal(true)
  }

  const confirmarAnulacion = async () => {
    if (!motivoAnulacion.trim()) {
      alert('Ingrese el motivo de anulación')
      return
    }

    try {
      setProcesando(true)

      if (activeTab === 'guias') {
        await facturacionService.anularGuia(selectedItem.id, motivoAnulacion)
      } else {
        await facturacionService.anularComprobante(selectedItem.id, motivoAnulacion)
      }

      setShowAnularModal(false)
      await cargarDatos()
    } catch (error) {
      console.error('Error anulando:', error)
      alert(error.response?.data?.error || 'Error al anular')
    } finally {
      setProcesando(false)
    }
  }

  const handleEmitir = () => {
    setErrorBusquedaDoc('')
    setEmitirForm({
      tipoComprobante: activeTab === 'facturas' ? '01' : '03',
      serie: activeTab === 'facturas' ? 'FT74' : 'BT74',
      cliente: {
        tipoDoc: activeTab === 'facturas' ? '6' : '1',
        numDoc: '',
        razonSocial: '',
        direccion: ''
      },
      items: [{ descripcion: '', cantidad: 1, precioUnitario: 0 }]
    })
    setShowEmitirModal(true)
  }

  const agregarItem = () => {
    setEmitirForm(prev => ({
      ...prev,
      items: [...prev.items, { descripcion: '', cantidad: 1, precioUnitario: 0 }]
    }))
  }

  const eliminarItem = (index) => {
    if (emitirForm.items.length > 1) {
      setEmitirForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  const actualizarItem = (index, campo, valor) => {
    setEmitirForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [campo]: valor } : item
      )
    }))
  }

  const calcularTotales = () => {
    const subtotalSinIgv = emitirForm.items.reduce((sum, item) => {
      const precio = parseFloat(item.precioUnitario) || 0
      const cantidad = parseFloat(item.cantidad) || 0
      const total = precio * cantidad
      const valorSinIgv = total / 1.18
      return sum + valorSinIgv
    }, 0)

    const igv = subtotalSinIgv * 0.18
    const total = subtotalSinIgv + igv

    return {
      subtotal: subtotalSinIgv.toFixed(2),
      igv: igv.toFixed(2),
      total: total.toFixed(2)
    }
  }

  const confirmarEmision = async () => {
    // Validaciones
    if (!emitirForm.cliente.numDoc || !emitirForm.cliente.razonSocial) {
      alert('Complete los datos del cliente')
      return
    }

    if (emitirForm.items.some(item => !item.descripcion || item.precioUnitario <= 0)) {
      alert('Complete todos los items correctamente')
      return
    }

    try {
      setProcesando(true)

      await facturacionService.emitirComprobante({
        tipoComprobante: emitirForm.tipoComprobante,
        serie: emitirForm.serie,
        cliente: emitirForm.cliente,
        items: emitirForm.items.map(item => ({
          descripcion: item.descripcion,
          cantidad: parseFloat(item.cantidad),
          precioUnitario: parseFloat(item.precioUnitario)
        }))
      })

      setShowEmitirModal(false)
      await cargarDatos()
    } catch (error) {
      console.error('Error emitiendo:', error)
      alert(error.response?.data?.error || 'Error al emitir comprobante')
    } finally {
      setProcesando(false)
    }
  }

  const handleEmitirGuia = () => {
    setGuiaForm({
      serie: 'TZ74',
      fechaInicioTraslado: new Date().toISOString().split('T')[0],
      motivoTraslado: '01',
      transporteTipo: '01',
      pesoBrutoTotal: '',
      numeroBultos: 1,
      ubigeoPartida: '',
      direccionPartida: '',
      ubigeoLlegada: '',
      direccionLlegada: '',
      destinatario: { tipoDoc: '1', numDoc: '', razonSocial: '' },
      transportista: { ruc: '', razonSocial: '' },
      conductor: { tipoDoc: '1', numDoc: '', nombres: '', apellidos: '', licencia: '' },
      vehiculo: { placa: '' },
      items: [{ codigo: '', descripcion: '', cantidad: 1, peso: 0 }]
    })
    setShowEmitirGuiaModal(true)
  }

  const agregarItemGuia = () => {
    setGuiaForm(prev => ({
      ...prev,
      items: [...prev.items, { codigo: '', descripcion: '', cantidad: 1, peso: 0 }]
    }))
  }

  const eliminarItemGuia = (index) => {
    if (guiaForm.items.length > 1) {
      setGuiaForm(prev => {
        const nuevosItems = prev.items.filter((_, i) => i !== index)
        // Recalcular peso bruto total
        const pesoBrutoTotal = nuevosItems.reduce((sum, item) => sum + (parseFloat(item.peso) || 0), 0)
        return {
          ...prev,
          items: nuevosItems,
          pesoBrutoTotal: pesoBrutoTotal.toFixed(2)
        }
      })
    }
  }

  const actualizarItemGuia = (index, campo, valor) => {
    setGuiaForm(prev => {
      const nuevosItems = prev.items.map((item, i) =>
        i === index ? { ...item, [campo]: valor } : item
      )
      // Calcular peso bruto total automáticamente
      const pesoBrutoTotal = nuevosItems.reduce((sum, item) => sum + (parseFloat(item.peso) || 0), 0)
      return {
        ...prev,
        items: nuevosItems,
        pesoBrutoTotal: pesoBrutoTotal.toFixed(2)
      }
    })
  }

  const confirmarEmisionGuia = async () => {
    // Validaciones
    if (!guiaForm.fechaInicioTraslado || !guiaForm.pesoBrutoTotal) {
      alert('Complete fecha de traslado y peso bruto')
      return
    }
    if (!guiaForm.ubigeoPartida || guiaForm.ubigeoPartida.length !== 6) {
      alert('Ubigeo de partida debe tener 6 dígitos (ej: 150101)')
      return
    }
    if (!guiaForm.direccionPartida) {
      alert('Complete la dirección de partida')
      return
    }
    if (!guiaForm.ubigeoLlegada || guiaForm.ubigeoLlegada.length !== 6) {
      alert('Ubigeo de llegada debe tener 6 dígitos (ej: 150101)')
      return
    }
    if (!guiaForm.direccionLlegada) {
      alert('Complete la dirección de llegada')
      return
    }
    if (!guiaForm.destinatario.numDoc || !guiaForm.destinatario.razonSocial) {
      alert('Complete datos del destinatario')
      return
    }
    if (!guiaForm.transportista.ruc) {
      alert('Debe ingresar RUC del transportista')
      return
    }
    if (!guiaForm.transportista.razonSocial) {
      alert('Debe ingresar razón social del transportista')
      return
    }
    if (!guiaForm.conductor.numDoc) {
      alert('Debe ingresar número de documento del conductor')
      return
    }
    if (!guiaForm.conductor.nombres || !guiaForm.conductor.apellidos) {
      alert('Debe ingresar nombres y apellidos del conductor')
      return
    }
    if (guiaForm.items.some(item => !item.descripcion || item.cantidad <= 0)) {
      alert('Complete todos los items correctamente')
      return
    }

    try {
      setProcesando(true)
      await facturacionService.emitirGuia(guiaForm)
      setShowEmitirGuiaModal(false)
      await cargarDatos()
    } catch (error) {
      console.error('Error emitiendo guía:', error)
      alert(error.response?.data?.error || 'Error al emitir guía')
    } finally {
      setProcesando(false)
    }
  }

  // Formatear fecha usando utilidad centralizada
  const formatFecha = (fecha) => {
    if (!fecha) return '-'
    return formatDateOnly(fecha)
  }

  // Formatear moneda
  const formatMoneda = (valor) => {
    return `S/ ${parseFloat(valor || 0).toFixed(2)}`
  }

  // Columnas para comprobantes
  const columnasComprobantes = [
    {
      key: 'numeroCompleto',
      header: 'Número',
      render: (_, row) => (
        <span className="font-mono font-medium text-gray-900">
          {row.numeroCompleto || `${row.serie}-${String(row.numero).padStart(8, '0')}`}
        </span>
      )
    },
    {
      key: 'fechaEmision',
      header: 'Fecha',
      render: (_, row) => formatFecha(row.fechaEmision || row.fecha_emision)
    },
    {
      key: 'clienteRazonSocial',
      header: 'Cliente',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900 truncate max-w-[200px]">
            {row.clienteRazonSocial || row.cliente_razon_social}
          </p>
          <p className="text-xs text-gray-500">
            {TIPOS_DOCUMENTO[row.clienteTipoDoc || row.cliente_tipo_doc] || 'Doc'}: {row.clienteNumDoc || row.cliente_num_doc}
          </p>
        </div>
      )
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      render: (_, row) => formatMoneda(row.subtotal)
    },
    {
      key: 'igv',
      header: 'IGV',
      render: (_, row) => formatMoneda(row.igv)
    },
    {
      key: 'total',
      header: 'Total',
      render: (_, row) => (
        <span className="font-semibold text-gray-900">
          {formatMoneda(row.total)}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (_, row) => {
        const config = ESTADOS_COMPROBANTE[row.estado] || { label: row.estado, color: 'bg-gray-100 text-gray-700' }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        )
      }
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVerDetalle(row)}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </button>
          {(row.pdfUrl || row.pdf_url) && (
            <button
              onClick={() => handleVerPdf(row.pdfUrl || row.pdf_url)}
              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Ver PDF"
            >
              <FileDown className="w-4 h-4" />
            </button>
          )}
          {row.estado !== 'ANULADO' && (
            <button
              onClick={() => handleAnular(row)}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Anular"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ]

  // Columnas para guías
  const columnasGuias = [
    {
      key: 'numeroCompleto',
      header: 'Número',
      render: (_, row) => (
        <span className="font-mono font-medium text-gray-900">
          {row.numeroCompleto || `${row.serie}-${String(row.numero).padStart(8, '0')}`}
        </span>
      )
    },
    {
      key: 'fechaEmision',
      header: 'Fecha',
      render: (_, row) => formatFecha(row.fechaEmision || row.fecha_emision)
    },
    {
      key: 'destinatarioRazonSocial',
      header: 'Destinatario',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900 truncate max-w-[200px]">
            {row.destinatarioRazonSocial || row.destinatario_razon_social}
          </p>
          <p className="text-xs text-gray-500">
            {row.destinatarioNumDoc || row.destinatario_num_doc}
          </p>
        </div>
      )
    },
    {
      key: 'direccionPartida',
      header: 'Partida',
      render: (_, row) => (
        <span className="text-sm truncate max-w-[150px] block">
          {row.direccionPartida || row.direccion_partida}
        </span>
      )
    },
    {
      key: 'direccionLlegada',
      header: 'Llegada',
      render: (_, row) => (
        <span className="text-sm truncate max-w-[150px] block">
          {row.direccionLlegada || row.direccion_llegada}
        </span>
      )
    },
    {
      key: 'pesoBrutoTotal',
      header: 'Peso',
      render: (_, row) => `${parseFloat(row.pesoBrutoTotal || row.peso_bruto_total || 0).toFixed(2)} KG`
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (_, row) => {
        const config = ESTADOS_GUIA[row.estado] || { label: row.estado, color: 'bg-gray-100 text-gray-700' }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        )
      }
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVerDetalle(row)}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </button>
          {(row.pdfUrl || row.pdf_url) && (
            <button
              onClick={() => handleVerPdf(row.pdfUrl || row.pdf_url)}
              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Ver PDF"
            >
              <FileDown className="w-4 h-4" />
            </button>
          )}
          {row.estado !== 'ANULADA' && (
            <button
              onClick={() => handleAnular(row)}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Anular"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ]

  const tabs = [
    { id: 'facturas', label: 'Facturas', icon: FileText },
    { id: 'boletas', label: 'Boletas', icon: Receipt },
    { id: 'guias', label: 'Guías de Remisión', icon: Truck },
    { id: 'anulados', label: 'Anulados', icon: Ban }
  ]

  const totales = calcularTotales()

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Facturación Electrónica</h1>
              <p className="text-sm text-gray-500">Gestión de comprobantes y guías de remisión</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              title="Configuración"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            {(activeTab === 'facturas' || activeTab === 'boletas') && (
              <Button onClick={handleEmitir} icon={Plus}>
                Emitir {activeTab === 'facturas' ? 'Factura' : 'Boleta'}
              </Button>
            )}
            {activeTab === 'guias' && (
              <Button onClick={handleEmitirGuia} icon={Plus}>
                Emitir Guía
              </Button>
            )}
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          <StatCard
            title="Facturas Mes"
            value={loading ? '-' : metricas.facturasMes}
            icon={FileText}
            iconColor="primary"
            loading={loading}
          />
          <StatCard
            title="Boletas Mes"
            value={loading ? '-' : metricas.boletasMes}
            icon={Receipt}
            iconColor="success"
            loading={loading}
          />
          <StatCard
            title="Guías Mes"
            value={loading ? '-' : metricas.guiasMes}
            icon={Truck}
            iconColor="info"
            loading={loading}
          />
          <StatCard
            title="Docs Hoy"
            value={loading ? '-' : metricas.docsHoy}
            icon={Clock}
            iconColor="warning"
            loading={loading}
          />
          <StatCard
            title="Anulados Mes"
            value={loading ? '-' : metricas.anuladosMes}
            icon={Ban}
            iconColor="error"
            loading={loading}
          />
          <StatCard
            title="Base Imponible"
            value={loading ? '-' : formatMoneda(metricas.baseImponibleMes)}
            icon={DollarSign}
            iconColor="secondary"
            loading={loading}
          />
          <StatCard
            title="IGV del Mes"
            value={loading ? '-' : formatMoneda(metricas.igvMes)}
            icon={Percent}
            iconColor="primary"
            loading={loading}
          />
        </div>

        {/* Tabs y Contenido */}
        <Card padding={false}>
          {/* Tabs */}
          <div className="border-b border-gray-200 px-6 pt-4">
            <nav className="flex gap-1 -mb-px" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Filtros */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <Input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <Input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
                />
              </div>
              {activeTab !== 'anulados' && (
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <Select
                    value={filtros.estado}
                    onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                    options={[
                      { value: '', label: 'Todos' },
                      { value: 'PENDIENTE', label: 'Pendiente' },
                      { value: 'ACEPTADO', label: 'Aceptado' },
                      { value: 'RECHAZADO', label: 'Rechazado' }
                    ]}
                  />
                </div>
              )}
              <Button onClick={handleBuscar} variant="secondary" icon={Search}>
                Buscar
              </Button>
            </div>
          </div>

          {/* Tabla */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : (
              <Table
                columns={activeTab === 'guias' ? columnasGuias : columnasComprobantes}
                data={activeTab === 'guias' ? guias : comprobantes}
                emptyMessage={`No hay ${activeTab === 'guias' ? 'guías de remisión' : 'comprobantes'} para mostrar`}
              />
            )}

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal Emitir Comprobante */}
      <Modal
        isOpen={showEmitirModal}
        onClose={() => setShowEmitirModal(false)}
        title={`Emitir ${emitirForm.tipoComprobante === '01' ? 'Factura' : 'Boleta'}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Tipo y Serie */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <Select
                value={emitirForm.tipoComprobante}
                onChange={(e) => setEmitirForm(prev => ({
                  ...prev,
                  tipoComprobante: e.target.value,
                  serie: e.target.value === '01' ? 'FT74' : 'BT74',
                  cliente: {
                    ...prev.cliente,
                    tipoDoc: e.target.value === '01' ? '6' : '1'
                  }
                }))}
                options={[
                  { value: '01', label: 'Factura' },
                  { value: '03', label: 'Boleta' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serie</label>
              <Select
                value={emitirForm.serie}
                onChange={(e) => setEmitirForm(prev => ({ ...prev, serie: e.target.value }))}
                options={series
                  .filter(s => s.tipoComprobante === emitirForm.tipoComprobante)
                  .map(s => ({ value: s.serie, label: `${s.serie} (Actual: ${s.numeroActual})` }))
                }
              />
            </div>
          </div>

          {/* Datos del Cliente */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Datos del Cliente</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Doc.</label>
                <Select
                  value={emitirForm.cliente.tipoDoc}
                  onChange={(e) => setEmitirForm(prev => ({
                    ...prev,
                    cliente: { ...prev.cliente, tipoDoc: e.target.value }
                  }))}
                  options={emitirForm.tipoComprobante === '01'
                    ? [{ value: '6', label: 'RUC' }]
                    : [
                        { value: '1', label: 'DNI' },
                        { value: '6', label: 'RUC' },
                        { value: '-', label: 'Sin Doc.' }
                      ]
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número Doc.</label>
                <div className="relative">
                  <Input
                    value={emitirForm.cliente.numDoc}
                    onChange={async (e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      setErrorBusquedaDoc('')
                      setEmitirForm(prev => ({
                        ...prev,
                        cliente: { ...prev.cliente, numDoc: value, razonSocial: '', direccion: '' }
                      }))
                      // Auto-busqueda cuando se completa el documento
                      if (emitirForm.cliente.tipoDoc === '6' && value.length === 11) {
                        const result = await consultarRuc(value)
                        if (result) {
                          setErrorBusquedaDoc('')
                          setEmitirForm(prev => ({
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
                      } else if (emitirForm.cliente.tipoDoc === '1' && value.length === 8) {
                        const result = await consultarDni(value)
                        if (result) {
                          setErrorBusquedaDoc('')
                          setEmitirForm(prev => ({
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
                    placeholder={emitirForm.cliente.tipoDoc === '6' ? '20XXXXXXXXX' : '12345678'}
                    maxLength={emitirForm.cliente.tipoDoc === '6' ? 11 : 8}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social / Nombre</label>
                <Input
                  value={emitirForm.cliente.razonSocial}
                  onChange={(e) => setEmitirForm(prev => ({
                    ...prev,
                    cliente: { ...prev.cliente, razonSocial: e.target.value }
                  }))}
                  placeholder="Nombre completo o razón social"
                  readOnly={emitirForm.cliente.tipoDoc === '6'}
                  className={emitirForm.cliente.tipoDoc === '6' ? 'bg-gray-100 cursor-not-allowed' : ''}
                />
                {emitirForm.cliente.tipoDoc === '6' && (
                  <p className="text-xs text-gray-500 mt-1">Se autocompleta con los datos del RUC</p>
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Fiscal {emitirForm.cliente.tipoDoc === '6' ? '' : '(opcional)'}</label>
                <Input
                  value={emitirForm.cliente.direccion}
                  onChange={(e) => setEmitirForm(prev => ({
                    ...prev,
                    cliente: { ...prev.cliente, direccion: e.target.value }
                  }))}
                  placeholder="Dirección del cliente"
                  readOnly={emitirForm.cliente.tipoDoc === '6'}
                  className={emitirForm.cliente.tipoDoc === '6' ? 'bg-gray-100 cursor-not-allowed' : ''}
                />
                {emitirForm.cliente.tipoDoc === '6' && (
                  <p className="text-xs text-gray-500 mt-1">Se autocompleta con los datos del RUC</p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">Items</h4>
              <Button variant="secondary" size="sm" onClick={agregarItem} icon={Plus}>
                Agregar
              </Button>
            </div>
            <div className="space-y-3">
              {emitirForm.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6">
                    <Input
                      value={item.descripcion}
                      onChange={(e) => actualizarItem(index, 'descripcion', e.target.value)}
                      placeholder="Descripción"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      value={item.precioUnitario}
                      onChange={(e) => actualizarItem(index, 'precioUnitario', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="Precio"
                    />
                  </div>
                  <div className="col-span-1">
                    {emitirForm.items.length > 1 && (
                      <button
                        onClick={() => eliminarItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="border-t border-gray-200 pt-4 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-medium">S/ {totales.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IGV (18%):</span>
                  <span className="font-medium">S/ {totales.igv}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span className="text-primary-600">S/ {totales.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setShowEmitirModal(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmarEmision} loading={procesando}>
            Emitir Comprobante
          </Button>
        </div>
      </Modal>

      {/* Modal Detalle */}
      <Modal
        isOpen={showDetalleModal}
        onClose={() => setShowDetalleModal(false)}
        title={`Detalle ${activeTab === 'guias' ? 'Guía de Remisión' : 'Comprobante'}`}
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Número:</span>
                <p className="font-mono font-semibold">{selectedItem.numeroCompleto}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Fecha:</span>
                <p className="font-medium">{formatFecha(selectedItem.fechaEmision || selectedItem.fecha_emision)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Estado:</span>
                <p className="font-medium">{selectedItem.estado}</p>
              </div>
              {selectedItem.total && (
                <div>
                  <span className="text-sm text-gray-500">Total:</span>
                  <p className="font-semibold text-primary-600">{formatMoneda(selectedItem.total)}</p>
                </div>
              )}
            </div>

            {selectedItem.items && selectedItem.items.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Items</h4>
                <div className="space-y-2">
                  {selectedItem.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-2 border-b border-gray-100">
                      <span>{item.descripcion}</span>
                      <span className="font-medium">
                        {item.cantidad} x {formatMoneda(item.precioUnitario || item.precio_unitario)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedItem.mensajeError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Error:</span>
                </div>
                <p className="text-sm text-red-600 mt-1">{selectedItem.mensajeError}</p>
              </div>
            )}

            {(selectedItem.pdfUrl || selectedItem.pdf_url) && (
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => handleVerPdf(selectedItem.pdfUrl || selectedItem.pdf_url)}
                  icon={FileDown}
                >
                  Descargar PDF
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Anular */}
      <Modal
        isOpen={showAnularModal}
        onClose={() => setShowAnularModal(false)}
        title="Anular Comprobante"
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Esta acción no se puede deshacer</span>
            </div>
            <p className="text-sm text-yellow-600 mt-2">
              El comprobante {selectedItem?.numeroCompleto} será anulado.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de anulación *
            </label>
            <textarea
              value={motivoAnulacion}
              onChange={(e) => setMotivoAnulacion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Ingrese el motivo de la anulación"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setShowAnularModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarAnulacion} loading={procesando}>
            Confirmar Anulación
          </Button>
        </div>
      </Modal>

      {/* Modal Configuración */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="Configuración de Facturación"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Configuración SUNAT/KEYFACIL</span>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              La configuración de facturación se gestiona desde el módulo de configuración del sistema.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Series Activas</h4>
            <div className="space-y-2">
              {series.map((serie) => (
                <div key={serie.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium">{serie.serie}</span>
                    <span className="text-sm text-gray-500">
                      {serie.tipoComprobante === '01' ? 'Factura' : serie.tipoComprobante === '03' ? 'Boleta' : 'Guía'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    Actual: #{serie.numeroActual}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setShowConfigModal(false)}>
            Cerrar
          </Button>
        </div>
      </Modal>

      {/* Modal Emitir Guía de Remisión */}
      <Modal
        isOpen={showEmitirGuiaModal}
        onClose={() => setShowEmitirGuiaModal(false)}
        title="Emitir Guía de Remisión"
        size="xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Datos Generales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serie</label>
              <Input
                value={guiaForm.serie}
                onChange={(e) => setGuiaForm(prev => ({ ...prev, serie: e.target.value }))}
                placeholder="T001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Traslado *</label>
              <Input
                type="date"
                value={guiaForm.fechaInicioTraslado}
                onChange={(e) => setGuiaForm(prev => ({ ...prev, fechaInicioTraslado: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo Traslado</label>
              <Select
                value={guiaForm.motivoTraslado}
                onChange={(e) => setGuiaForm(prev => ({ ...prev, motivoTraslado: e.target.value }))}
                options={MOTIVOS_TRASLADO}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Transporte</label>
              <Select
                value={guiaForm.transporteTipo}
                onChange={(e) => setGuiaForm(prev => ({ ...prev, transporteTipo: e.target.value }))}
                options={TIPOS_TRANSPORTE}
              />
            </div>
          </div>

          {/* Punto de Partida */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Punto de Partida</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubigeo *</label>
                <Input
                  value={guiaForm.ubigeoPartida}
                  onChange={(e) => setGuiaForm(prev => ({ ...prev, ubigeoPartida: e.target.value }))}
                  placeholder="150101"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Código SUNAT de 6 dígitos</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <Input
                  value={guiaForm.direccionPartida}
                  onChange={(e) => setGuiaForm(prev => ({ ...prev, direccionPartida: e.target.value }))}
                  placeholder="Av. Principal 123, Lima"
                />
              </div>
            </div>
          </div>

          {/* Punto de Llegada */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Punto de Llegada</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubigeo *</label>
                <Input
                  value={guiaForm.ubigeoLlegada}
                  onChange={(e) => setGuiaForm(prev => ({ ...prev, ubigeoLlegada: e.target.value }))}
                  placeholder="150101"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Código SUNAT de 6 dígitos</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <Input
                  value={guiaForm.direccionLlegada}
                  onChange={(e) => setGuiaForm(prev => ({ ...prev, direccionLlegada: e.target.value }))}
                  placeholder="Jr. Destino 456, Provincia"
                />
              </div>
            </div>
          </div>

          {/* Destinatario */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Destinatario</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Doc.</label>
                <Select
                  value={guiaForm.destinatario.tipoDoc}
                  onChange={(e) => setGuiaForm(prev => ({
                    ...prev,
                    destinatario: { ...prev.destinatario, tipoDoc: e.target.value }
                  }))}
                  options={TIPOS_DOC_IDENTIDAD}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número Doc. *</label>
                <div className="relative">
                  <Input
                    value={guiaForm.destinatario.numDoc}
                    onChange={async (e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      setGuiaForm(prev => ({
                        ...prev,
                        destinatario: { ...prev.destinatario, numDoc: value }
                      }))
                      // Auto-busqueda cuando se completa el documento
                      if (guiaForm.destinatario.tipoDoc === '6' && value.length === 11) {
                        const result = await consultarRuc(value)
                        if (result) {
                          setGuiaForm(prev => ({
                            ...prev,
                            destinatario: {
                              ...prev.destinatario,
                              razonSocial: result.razon_social || result.nombre_o_razon_social || ''
                            }
                          }))
                        }
                      } else if (guiaForm.destinatario.tipoDoc === '1' && value.length === 8) {
                        const result = await consultarDni(value)
                        if (result) {
                          setGuiaForm(prev => ({
                            ...prev,
                            destinatario: {
                              ...prev.destinatario,
                              razonSocial: result.nombre_completo || ''
                            }
                          }))
                        }
                      }
                    }}
                    placeholder={guiaForm.destinatario.tipoDoc === '6' ? '20XXXXXXXXX' : '12345678'}
                    maxLength={guiaForm.destinatario.tipoDoc === '6' ? 11 : 8}
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
                <Input
                  value={guiaForm.destinatario.razonSocial}
                  onChange={(e) => setGuiaForm(prev => ({
                    ...prev,
                    destinatario: { ...prev.destinatario, razonSocial: e.target.value }
                  }))}
                  placeholder="Nombre o razón social"
                />
              </div>
            </div>
          </div>

          {/* Transportista (obligatorio según KEYFACIL) */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Transportista *</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUC *</label>
                <div className="relative">
                  <Input
                    value={guiaForm.transportista.ruc}
                    onChange={async (e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                      setGuiaForm(prev => ({
                        ...prev,
                        transportista: { ...prev.transportista, ruc: value }
                      }))
                      // Auto-busqueda cuando se completa el RUC del transportista
                      if (value.length === 11) {
                        const result = await consultarRuc(value)
                        if (result) {
                          setGuiaForm(prev => ({
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
                <Input
                  value={guiaForm.transportista.razonSocial}
                  onChange={(e) => setGuiaForm(prev => ({
                    ...prev,
                    transportista: { ...prev.transportista, razonSocial: e.target.value }
                  }))}
                  placeholder="Nombre del transportista"
                />
              </div>
            </div>
          </div>

          {/* Conductor (obligatorio según KEYFACIL) */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Conductor *</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Doc.</label>
                <Select
                  value={guiaForm.conductor.tipoDoc}
                  onChange={(e) => setGuiaForm(prev => ({
                    ...prev,
                    conductor: { ...prev.conductor, tipoDoc: e.target.value }
                  }))}
                  options={TIPOS_DOC_IDENTIDAD}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número Doc. *</label>
                <div className="relative">
                  <Input
                    value={guiaForm.conductor.numDoc}
                    onChange={async (e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8)
                      setGuiaForm(prev => ({
                        ...prev,
                        conductor: { ...prev.conductor, numDoc: value }
                      }))
                      // Auto-busqueda cuando se completa el DNI del conductor
                      if (value.length === 8) {
                        const result = await consultarDni(value, true) // skipLocal=true para ir directo a API
                        if (result) {
                          setGuiaForm(prev => ({
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
                <Input
                  value={guiaForm.conductor.licencia}
                  onChange={(e) => setGuiaForm(prev => ({
                    ...prev,
                    conductor: { ...prev.conductor, licencia: e.target.value }
                  }))}
                  placeholder="Q12345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
                <Input
                  value={guiaForm.conductor.nombres}
                  onChange={(e) => setGuiaForm(prev => ({
                    ...prev,
                    conductor: { ...prev.conductor, nombres: e.target.value }
                  }))}
                  placeholder="Juan Carlos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                <Input
                  value={guiaForm.conductor.apellidos}
                  onChange={(e) => setGuiaForm(prev => ({
                    ...prev,
                    conductor: { ...prev.conductor, apellidos: e.target.value }
                  }))}
                  placeholder="Pérez García"
                />
              </div>
            </div>
          </div>

          {/* Vehículo */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Vehículo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                <Input
                  value={guiaForm.vehiculo.placa}
                  onChange={(e) => setGuiaForm(prev => ({
                    ...prev,
                    vehiculo: { ...prev.vehiculo, placa: e.target.value.toUpperCase() }
                  }))}
                  placeholder="ABC-123"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">Items a Transportar</h4>
              <Button variant="secondary" size="sm" onClick={agregarItemGuia} icon={Plus}>
                Agregar Item
              </Button>
            </div>
            <div className="space-y-3">
              {guiaForm.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Código</label>
                    <Input
                      value={item.codigo}
                      onChange={(e) => actualizarItemGuia(index, 'codigo', e.target.value)}
                      placeholder="001"
                    />
                  </div>
                  <div className="col-span-5">
                    <label className="block text-xs text-gray-500 mb-1">Descripción *</label>
                    <Input
                      value={item.descripcion}
                      onChange={(e) => actualizarItemGuia(index, 'descripcion', e.target.value)}
                      placeholder="Descripción del producto"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Cantidad *</label>
                    <Input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => actualizarItemGuia(index, 'cantidad', parseFloat(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Peso (KG)</label>
                    <Input
                      type="number"
                      value={item.peso}
                      onChange={(e) => actualizarItemGuia(index, 'peso', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-1">
                    {guiaForm.items.length > 1 && (
                      <button
                        onClick={() => eliminarItemGuia(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Peso y Bultos - Resumen */}
            <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso Bruto Total (KG) *</label>
                <Input
                  type="number"
                  value={guiaForm.pesoBrutoTotal}
                  readOnly
                  className="bg-white border-2 border-primary-300 font-semibold"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Suma automática de los pesos de items</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Bultos</label>
                <Input
                  type="number"
                  value={guiaForm.numeroBultos}
                  onChange={(e) => setGuiaForm(prev => ({ ...prev, numeroBultos: parseInt(e.target.value) || 1 }))}
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setShowEmitirGuiaModal(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmarEmisionGuia} loading={procesando}>
            Emitir Guía de Remisión
          </Button>
        </div>
      </Modal>
    </MainLayout>
  )
}

export default FacturacionPage
