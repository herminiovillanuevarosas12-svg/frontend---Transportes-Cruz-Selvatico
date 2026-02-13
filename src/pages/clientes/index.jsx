/**
 * Clientes Index Page
 * Listado de clientes con programa de fidelizacion
 * Sistema de puntos: acumulados, canjeados, disponibles
 */

import { useState, useEffect } from 'react'
import { Table, Button, Modal, Card } from '../../components/common'
import { StatCard } from '../../components/common/Card'
import clientesService from '../../services/clientesService'
import toast from 'react-hot-toast'
import {
  Users,
  Search,
  Star,
  TrendingUp,
  Gift,
  Coins,
  Eye,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Clock,
  RefreshCw,
  Package,
  Ticket
} from 'lucide-react'

const ClientesIndexPage = () => {
  const [clientes, setClientes] = useState([])
  const [stats, setStats] = useState({
    totalClientes: 0,
    puntosAcumulados: 0,
    puntosCanjeados: 0,
    puntosDisponibles: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  // Modal de detalle
  const [showModal, setShowModal] = useState(false)
  const [clienteDetalle, setClienteDetalle] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  useEffect(() => {
    cargarStats()
  }, [])

  useEffect(() => {
    cargarClientes()
  }, [searchTerm, page])

  const cargarStats = async () => {
    try {
      const data = await clientesService.stats()
      setStats(data)
    } catch (error) {
      console.error('Error cargando estadisticas:', error)
    }
  }

  const cargarClientes = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const params = { page, limit: 15 }
      if (searchTerm) params.search = searchTerm

      const response = await clientesService.listar(params)
      setClientes(response.clientes || [])
      setPagination(response.pagination || { total: 0, totalPages: 1 })
    } catch (error) {
      console.error('Error cargando clientes:', error)
      toast.error('Error al cargar clientes')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    cargarStats()
    cargarClientes(true)
  }

  const handleVerDetalle = async (id) => {
    try {
      setLoadingDetalle(true)
      setShowModal(true)
      const response = await clientesService.obtener(id)
      setClienteDetalle(response.cliente)
    } catch (error) {
      console.error('Error obteniendo detalle:', error)
      toast.error('Error al cargar detalle del cliente')
      setShowModal(false)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const columns = [
    {
      key: 'nombreCompleto',
      header: 'Cliente',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-50">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{row.email || 'Sin email'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'documentoIdentidad',
      header: 'DNI',
      render: (value) => (
        <span className="font-mono text-sm text-gray-700">{value}</span>
      )
    },
    {
      key: 'puntosAcumulados',
      header: 'Pts. Acumulados',
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-primary-500" />
          <span className="font-semibold text-gray-900">
            {(value ?? 0).toLocaleString()}
          </span>
        </div>
      )
    },
    {
      key: 'puntosCanjeados',
      header: 'Pts. Canjeados',
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-secondary-500" />
          <span className="font-semibold text-gray-700">
            {(value ?? 0).toLocaleString()}
          </span>
        </div>
      )
    },
    {
      key: 'puntosDisponibles',
      header: 'Pts. Disponibles',
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-bold text-primary-600">
            {(value ?? 0).toLocaleString()}
          </span>
        </div>
      )
    },
    {
      key: 'totalViajes',
      header: 'Viajes',
      render: (value) => (
        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'ultimoViaje',
      header: 'Ultimo Viaje',
      render: (value) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          {formatDate(value)}
        </div>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={() => handleVerDetalle(row.id)}
        >
          Ver
        </Button>
      )
    }
  ]

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
              <p className="text-sm text-gray-500">Programa de Fidelizacion</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Clientes"
            value={stats.totalClientes.toLocaleString()}
            icon={Users}
            iconColor="primary"
            subtitle="Clientes registrados"
            loading={loading}
          />
          <StatCard
            title="Pts. Acumulados"
            value={stats.puntosAcumulados.toLocaleString()}
            icon={TrendingUp}
            iconColor="primary"
            subtitle="Puntos totales generados"
            loading={loading}
          />
          <StatCard
            title="Pts. Canjeados"
            value={stats.puntosCanjeados.toLocaleString()}
            icon={Gift}
            iconColor="secondary"
            subtitle="Puntos usados en descuentos"
            loading={loading}
          />
          <StatCard
            title="Pts. Disponibles"
            value={stats.puntosDisponibles.toLocaleString()}
            icon={Star}
            iconColor="warning"
            subtitle="Puntos por canjear"
            loading={loading}
          />
        </div>

        {/* Filtros y busqueda */}
        <Card padding={false}>
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Buscador */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o DNI..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none"
                />
              </div>

              {/* Info de puntos */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
                  <span>Acumulados</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-secondary-500" />
                  <span>Canjeados</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Disponibles</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <Table
            columns={columns}
            data={clientes}
            loading={loading}
            emptyMessage="No se encontraron clientes"
          />

          {/* Paginacion */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Mostrando {clientes.length} de {pagination.total} clientes
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  {page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modal de detalle */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setClienteDetalle(null)
        }}
        title="Detalle del Cliente"
        size="lg"
      >
        {loadingDetalle ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : clienteDetalle ? (
          <div className="space-y-6">
            {/* Info principal */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-primary-100">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {clienteDetalle.nombreCompleto}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    {clienteDetalle.documentoIdentidad}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    {clienteDetalle.telefono}
                  </div>
                </div>
                {clienteDetalle.email && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    {clienteDetalle.email}
                  </div>
                )}
              </div>
            </div>

            {/* Estadisticas de puntos */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary-50 rounded-xl border border-primary-100">
                <TrendingUp className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {(clienteDetalle.puntosAcumulados ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-primary-600 font-medium">Pts. Acumulados</p>
              </div>
              <div className="text-center p-4 bg-secondary-50 rounded-xl border border-secondary-100">
                <Gift className="w-6 h-6 text-secondary-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {(clienteDetalle.puntosCanjeados ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-secondary-600 font-medium">Pts. Canjeados</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {(clienteDetalle.puntosDisponibles ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-yellow-600 font-medium">Pts. Disponibles</p>
              </div>
            </div>

            {/* Contadores de actividad */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{clienteDetalle.totalViajes ?? 0}</p>
                  <p className="text-xs text-blue-600 font-medium">Pasajes Comprados</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{clienteDetalle.totalEncomiendas ?? 0}</p>
                  <p className="text-xs text-orange-600 font-medium">Encomiendas Enviadas</p>
                </div>
              </div>
            </div>

            {/* Info de puntos */}
            <div className="bg-primary-50 rounded-lg p-3 border border-primary-200">
              <p className="text-xs text-primary-800">
                <strong>Pts. Acumulados:</strong> Total de puntos generados por compras historicas.
                <br />
                <strong>Pts. Canjeados:</strong> Puntos que ha usado para obtener descuentos.
                <br />
                <strong>Pts. Disponibles:</strong> Puntos que puede usar en su proxima compra.
              </p>
            </div>

            {/* Historial de consumo */}
            {clienteDetalle.movimientos && clienteDetalle.movimientos.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Historial de Consumo
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {clienteDetalle.movimientos.map((mov) => (
                    <div
                      key={`${mov.tipo}-${mov.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          mov.tipo === 'PASAJE'
                            ? 'bg-blue-100'
                            : 'bg-orange-100'
                        }`}>
                          {mov.tipo === 'PASAJE'
                            ? <Ticket className="w-4 h-4 text-blue-600" />
                            : <Package className="w-4 h-4 text-orange-600" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {mov.origen} → {mov.destino}
                            </p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              mov.tipo === 'PASAJE'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {mov.tipo === 'PASAJE' ? 'Pasaje' : 'Encomienda'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{formatDate(mov.fecha)}</span>
                            {mov.hora && (
                              <>
                                <span>|</span>
                                <Clock className="w-3 h-3" />
                                <span>
                                  {new Date(mov.hora).toLocaleTimeString('es-PE', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </>
                            )}
                            {mov.monto > 0 && (
                              <>
                                <span>|</span>
                                <span className="text-gray-600 font-medium">S/ {mov.monto.toFixed(2)}</span>
                              </>
                            )}
                            {mov.puntosGanados > 0 && (
                              <>
                                <span>|</span>
                                <span className="text-primary-600 font-medium">+{mov.puntosGanados} pts</span>
                              </>
                            )}
                            {mov.puntosUsados > 0 && (
                              <>
                                <span>|</span>
                                <span className="text-secondary-600 font-medium">-{mov.puntosUsados} pts</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-gray-400">
                        {mov.codigo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </>
  )
}

export default ClientesIndexPage
