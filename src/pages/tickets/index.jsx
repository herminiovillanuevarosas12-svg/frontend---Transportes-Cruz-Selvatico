/**
 * Tickets Index Page
 * Listado de tickets con filtros y acciones
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import { Table, Button, Card, StatusBadge, Modal, ComprobantePrint } from '../../components/common'
import { PermissionGate } from '../../features/auth'
import ticketsService from '../../services/ticketsService'
import facturacionService from '../../services/facturacionService'
import configuracionService from '../../services/configuracionService'
import {
  Ticket,
  Search,
  Filter,
  Printer,
  XCircle,
  Calendar,
  MapPin,
  User,
  FileText,
  Receipt,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * Formatea una fecha DATE de PostgreSQL evitando problemas de timezone.
 * Extrae YYYY-MM-DD del string ISO y lo formatea como DD/MM/YYYY.
 */
const formatearFechaLocal = (fecha) => {
  if (!fecha) return '--/--/----'
  try {
    const fechaStr = typeof fecha === 'string' ? fecha : fecha.toISOString()
    const soloFecha = fechaStr.split('T')[0]
    const [year, month, day] = soloFecha.split('-')
    return `${day}/${month}/${year}`
  } catch {
    return fecha
  }
}

const TicketsIndexPage = () => {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })

  // Filtros
  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    codigoInterno: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Modal de anulacion
  const [anularModal, setAnularModal] = useState({ open: false, ticket: null })
  const [motivoAnulacion, setMotivoAnulacion] = useState('')

  // Modal de facturacion
  const [facturarModal, setFacturarModal] = useState({ open: false, ticket: null })
  const [facturarForm, setFacturarForm] = useState({
    tipoComprobante: '03',
    serie: 'BT74',
    cliente: { tipoDoc: '1', numDoc: '', razonSocial: '', direccion: '' }
  })
  const [procesandoFactura, setProcesandoFactura] = useState(false)

  // Modal de ver comprobante
  const [verComprobanteModal, setVerComprobanteModal] = useState({ open: false, ticket: null })
  const [comprobanteParaVer, setComprobanteParaVer] = useState(null)
  const [datosEmpresa, setDatosEmpresa] = useState(null)
  const [cargandoComprobante, setCargandoComprobante] = useState(false)

  // Control de impresion
  const [printTarget, setPrintTarget] = useState(null)

  const cargarTickets = useCallback(async () => {
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

      const response = await ticketsService.listar(params)
      setTickets(response.tickets || [])
      setPagination(prev => ({ ...prev, total: response.total || 0 }))
    } catch (error) {
      console.error('Error cargando tickets:', error)
      toast.error('Error al cargar tickets')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    cargarTickets()
  }, [cargarTickets])

  // Cargar datos de empresa para impresión de comprobante
  useEffect(() => {
    const cargarDatosEmpresa = async () => {
      try {
        const response = await facturacionService.obtenerConfiguracion()
        setDatosEmpresa(response.configuracion)
      } catch (error) {
        console.error('Error cargando datos de empresa:', error)
      }
    }
    cargarDatosEmpresa()
  }, [])

  // Función para ver comprobante emitido
  const handleVerComprobante = async (ticket) => {
    const comprobanteId = ticket.idComprobante || ticket.id_comprobante
    if (!comprobanteId) return

    try {
      setCargandoComprobante(true)
      setVerComprobanteModal({ open: true, ticket })
      const response = await facturacionService.obtenerComprobante(comprobanteId)
      const comp = response.comprobante

      // Mapear datos al formato de ComprobantePrint
      // Usar datos del origen (ticket/encomienda) que viene del backend
      const tipoDoc = comp.tipoComprobante === '01' ? 'FACTURA' : comp.tipoComprobante === '03' ? 'BOLETA' : 'VERIFICACION'
      setComprobanteParaVer({
        tipoDocumento: tipoDoc,
        numeroCompleto: comp.numeroCompleto,
        clienteNombre: comp.clienteRazonSocial,
        clienteDocumento: comp.clienteNumDoc,
        clienteDireccion: comp.clienteDireccion,
        agencia: comp.origen?.agencia || null,
        ruta: comp.origen?.ruta || null,
        fecha: comp.origen?.fechaViaje || comp.origen?.fechaRegistro,
        hora: comp.origen?.horaSalida,
        total: comp.total,
        fechaEmision: comp.fechaEmision
      })
    } catch (error) {
      console.error('Error cargando comprobante:', error)
      toast.error('Error al cargar comprobante')
      setVerComprobanteModal({ open: false, ticket: null })
    } finally {
      setCargandoComprobante(false)
    }
  }

  // Función para imprimir comprobante
  const handlePrintComprobante = () => {
    setPrintTarget('comprobante')
    setTimeout(() => {
      window.print()
      setTimeout(() => setPrintTarget(null), 500)
    }, 300)
  }

  const handleAnular = async () => {
    if (!anularModal.ticket || !motivoAnulacion.trim()) {
      toast.error('Debe ingresar un motivo de anulacion')
      return
    }

    try {
      setLoading(true)
      await ticketsService.anular(anularModal.ticket.id, { motivo: motivoAnulacion })
      toast.success('Ticket anulado correctamente')
      setAnularModal({ open: false, ticket: null })
      setMotivoAnulacion('')
      cargarTickets()
    } catch (error) {
      console.error('Error anulando ticket:', error)
      toast.error(error.response?.data?.error || 'Error al anular ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleImprimir = (ticket) => {
    // Navegar a pagina de impresion
    navigate(`/tickets/${ticket.id}/imprimir`)
  }

  const handleFacturar = (ticket) => {
    // Pre-llenar con datos del pasajero
    setFacturarForm({
      tipoComprobante: '03',
      serie: 'BT74',
      cliente: {
        tipoDoc: '1',
        numDoc: ticket.pasajero?.documentoIdentidad || '',
        razonSocial: ticket.pasajero?.nombreCompleto || '',
        direccion: ''
      }
    })
    setFacturarModal({ open: true, ticket })
  }

  const confirmarFacturacion = async () => {
    if (!facturarForm.cliente.numDoc || !facturarForm.cliente.razonSocial) {
      toast.error('Complete los datos del cliente')
      return
    }

    try {
      setProcesandoFactura(true)
      await facturacionService.emitirDesdeTicket(facturarModal.ticket.id, {
        tipoComprobante: facturarForm.tipoComprobante,
        serie: facturarForm.serie,
        cliente: facturarForm.cliente
      })
      toast.success('Comprobante emitido exitosamente')
      setFacturarModal({ open: false, ticket: null })
      cargarTickets()
    } catch (error) {
      console.error('Error emitiendo comprobante:', error)
      toast.error(error.response?.data?.error || 'Error al emitir comprobante')
    } finally {
      setProcesandoFactura(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      fechaInicio: '',
      fechaFin: '',
      estado: '',
      codigoInterno: ''
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const columns = [
    {
      key: 'codigoInterno',
      header: 'Codigo',
      render: (value) => (
        <span className="font-mono font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'pasajero',
      header: 'Pasajero',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">{row.pasajero?.nombreCompleto || 'N/A'}</p>
            <p className="text-sm text-gray-500">{row.pasajero?.documentoIdentidad || ''}</p>
          </div>
        </div>
      )
    },
    {
      key: 'viaje',
      header: 'Ruta',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">
            {row.viaje?.ruta?.puntoOrigen?.nombre || '?'} → {row.viaje?.ruta?.puntoDestino?.nombre || '?'}
          </span>
        </div>
      )
    },
    {
      key: 'fechaViaje',
      header: 'Fecha Viaje',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">
            {formatearFechaLocal(row.viaje?.fechaServicio)}
          </span>
        </div>
      )
    },
    {
      key: 'precio',
      header: 'Precio',
      render: (_, row) => (
        <span className="font-medium text-gray-900">
          S/ {parseFloat(row.viaje?.ruta?.precioPasaje || 0).toFixed(2)}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Printer}
            onClick={() => handleImprimir(row)}
          >
            Imprimir
          </Button>
          {row.estado === 'EMITIDO' && !row.idComprobante && !row.id_comprobante && (
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
          {row.estado === 'EMITIDO' && (
            <PermissionGate permission="TICKETS_ANULAR">
              <Button
                variant="ghost"
                size="sm"
                icon={XCircle}
                className="text-red-600 hover:bg-red-50"
                onClick={() => setAnularModal({ open: true, ticket: row })}
              >
                Anular
              </Button>
            </PermissionGate>
          )}
        </div>
      )
    }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
            <p className="text-gray-500">Listado de pasajes vendidos</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros
            </Button>
            <PermissionGate permission="TICKETS_VENDER">
              <Button
                icon={Ticket}
                onClick={() => navigate('/tickets/venta')}
              >
                Nueva Venta
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Codigo
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="codigoInterno"
                    value={filters.codigoInterno}
                    onChange={handleFilterChange}
                    placeholder="Buscar por codigo..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={filters.fechaInicio}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  name="fechaFin"
                  value={filters.fechaFin}
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
                  <option value="EMITIDO">Emitido</option>
                  <option value="ANULADO">Anulado</option>
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
            data={tickets}
            loading={loading}
            emptyMessage="No hay tickets registrados"
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              onPageChange: (page) => setPagination(prev => ({ ...prev, page }))
            }}
          />
        </Card>
      </div>

      {/* Modal Anulacion */}
      <Modal
        isOpen={anularModal.open}
        onClose={() => {
          setAnularModal({ open: false, ticket: null })
          setMotivoAnulacion('')
        }}
        title="Anular Ticket"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setAnularModal({ open: false, ticket: null })
                setMotivoAnulacion('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleAnular}
              disabled={loading || !motivoAnulacion.trim()}
            >
              Anular Ticket
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Esta accion anulara el ticket <strong>{anularModal.ticket?.codigoInterno}</strong> y liberara el cupo del viaje.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de Anulacion *
            </label>
            <textarea
              value={motivoAnulacion}
              onChange={(e) => setMotivoAnulacion(e.target.value)}
              placeholder="Ingrese el motivo de la anulacion..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Modal Facturacion */}
      <Modal
        isOpen={facturarModal.open}
        onClose={() => setFacturarModal({ open: false, ticket: null })}
        title="Emitir Comprobante"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setFacturarModal({ open: false, ticket: null })}
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
              Emitir comprobante para el ticket <strong>{facturarModal.ticket?.codigoInterno}</strong>
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Pasaje: {facturarModal.ticket?.viaje?.ruta?.puntoOrigen?.nombre} → {facturarModal.ticket?.viaje?.ruta?.puntoDestino?.nombre}
            </p>
            <p className="text-sm font-semibold text-blue-800 mt-1">
              Monto: S/ {parseFloat(facturarModal.ticket?.viaje?.ruta?.precioPasaje || 0).toFixed(2)}
            </p>
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
                <input
                  type="text"
                  value={facturarForm.cliente.numDoc}
                  onChange={(e) => setFacturarForm(prev => ({
                    ...prev,
                    cliente: { ...prev.cliente, numDoc: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
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
          setVerComprobanteModal({ open: false, ticket: null })
          setComprobanteParaVer(null)
        }}
        title="Comprobante Emitido"
        size="md"
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setVerComprobanteModal({ open: false, ticket: null })
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
            <ComprobantePrint comprobante={comprobanteParaVer} empresa={datosEmpresa} />
          </div>
        ) : null}
      </Modal>

      {/* Area de impresion - Solo visible al imprimir */}
      {comprobanteParaVer && printTarget === 'comprobante' && (
        <div className="print-area" id="comprobante-print-area">
          <ComprobantePrint comprobante={comprobanteParaVer} empresa={datosEmpresa} />
        </div>
      )}
    </MainLayout>
  )
}

export default TicketsIndexPage
