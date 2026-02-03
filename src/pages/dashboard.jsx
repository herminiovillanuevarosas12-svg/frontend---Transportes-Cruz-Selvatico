/**
 * Dashboard Page
 * Pagina principal premium con metricas y estadisticas
 */

import { useState, useEffect } from 'react'
import MainLayout from '../components/layout/MainLayout'
import Card, { StatCard } from '../components/common/Card'
import dashboardService from '../services/dashboardService'
import { formatInTimezone } from '../utils/dateUtils'
import {
  Ticket,
  Package,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Route,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  RefreshCw,
  Calendar,
  Sparkles,
  DollarSign,
  Banknote,
  CircleDollarSign
} from 'lucide-react'

const DashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState({
    ventasHoy: 0,
    encomiendasHoy: 0,
    encomiendasEntregadas: 0,
    rutasMasUsadas: [],
    puntosOrigen: { tickets: [], encomiendas: [] },
    puntosDestino: { tickets: [], encomiendas: [] },
    ingresoTotal: 0,
    ingresoPasajes: 0,
    ingresoEncomiendas: 0
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // Cargar datos en paralelo
      const [
        ventasRes,
        encomiendasRes,
        entregadasRes,
        rutasRes,
        origenRes,
        destinoRes,
        ingresoRes
      ] = await Promise.all([
        dashboardService.ventasHoy(),
        dashboardService.encomiendasHoy(),
        dashboardService.encomiendasEntregadas(),
        dashboardService.rutasMasUsadas(),
        dashboardService.puntosOrigen(),
        dashboardService.puntosDestino(),
        dashboardService.ingresoDia()
      ])

      setData({
        ventasHoy: ventasRes.ventasHoy || 0,
        encomiendasHoy: encomiendasRes.encomiendasHoy || 0,
        encomiendasEntregadas: entregadasRes.encomiendasEntregadas || 0,
        rutasMasUsadas: rutasRes.rutasMasUsadas || [],
        puntosOrigen: origenRes.puntosOrigen || { tickets: [], encomiendas: [] },
        puntosDestino: destinoRes.puntosDestino || { tickets: [], encomiendas: [] },
        ingresoTotal: ingresoRes.ingresoTotal || 0,
        ingresoPasajes: ingresoRes.ingresoPasajes || 0,
        ingresoEncomiendas: ingresoRes.ingresoEncomiendas || 0
      })
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Colores para barras de progreso
  const barColors = [
    'from-primary-500 to-primary-600',
    'from-secondary-500 to-secondary-600',
    'from-success-500 to-success-600',
    'from-info-500 to-info-600',
    'from-warning-500 to-warning-600'
  ]

  // Obtener el valor maximo para calcular porcentajes
  const getMaxValue = (items, key) => {
    if (!items || items.length === 0) return 1
    return Math.max(...items.map(item => item[key] || 0))
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Resumen de operaciones del sistema</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              {formatInTimezone(new Date(), { includeTime: false })}
            </div>
            <button
              onClick={() => cargarDatos(true)}
              disabled={refreshing}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ingresos del Dia */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Ingreso Total Hoy"
            value={loading ? '-' : `S/ ${data.ingresoTotal.toFixed(2)}`}
            icon={DollarSign}
            iconColor="success"
            subtitle="Pasajes + Encomiendas"
            loading={loading}
          />
          <StatCard
            title="Ingreso Pasajes Hoy"
            value={loading ? '-' : `S/ ${data.ingresoPasajes.toFixed(2)}`}
            icon={Banknote}
            iconColor="primary"
            subtitle="Venta de tickets"
            loading={loading}
          />
          <StatCard
            title="Ingreso Encomiendas Hoy"
            value={loading ? '-' : `S/ ${data.ingresoEncomiendas.toFixed(2)}`}
            icon={CircleDollarSign}
            iconColor="warning"
            subtitle="Envios registrados"
            loading={loading}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pasajes Vendidos Hoy"
            value={loading ? '-' : data.ventasHoy}
            icon={Ticket}
            iconColor="primary"
            subtitle="Tickets emitidos hoy"
            loading={loading}
          />
          <StatCard
            title="Encomiendas Hoy"
            value={loading ? '-' : data.encomiendasHoy}
            icon={Package}
            iconColor="success"
            subtitle="Registradas hoy"
            loading={loading}
          />
          <StatCard
            title="Encomiendas Entregadas"
            value={loading ? '-' : data.encomiendasEntregadas}
            icon={CheckCircle2}
            iconColor="info"
            subtitle="Ultimos 30 dias"
            loading={loading}
          />
          <StatCard
            title="Rutas Activas"
            value={loading ? '-' : data.rutasMasUsadas.length}
            icon={TrendingUp}
            iconColor="warning"
            subtitle="Con movimiento"
            loading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rutas mas usadas */}
          <Card
            title="Rutas mas Usadas"
            subtitle="Top 5 rutas con mayor movimiento"
            headerAction={
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 rounded-lg">
                <Route className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-medium text-primary-700">Tickets</span>
              </div>
            }
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-12" />
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : data.rutasMasUsadas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Route className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Sin datos de rutas</p>
              </div>
            ) : (
              <div className="space-y-5">
                {data.rutasMasUsadas.slice(0, 5).map((ruta, index) => {
                  const maxValue = getMaxValue(data.rutasMasUsadas, 'total_tickets')
                  const percentage = (ruta.total_tickets / maxValue) * 100

                  return (
                    <div key={ruta.id} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`
                            w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                            ${index === 0 ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' :
                              index === 1 ? 'bg-primary-100 text-primary-700' :
                              'bg-gray-100 text-gray-600'}
                          `}>
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                            {ruta.origen} → {ruta.destino}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {ruta.total_tickets}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${barColors[index]} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Top Puntos por Origen */}
          <Card
            title="Top Puntos por Origen"
            subtitle="Puntos con mayor emision de tickets"
            headerAction={
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success-50 rounded-lg">
                <MapPin className="w-4 h-4 text-success-600" />
                <span className="text-xs font-medium text-success-700">Origen</span>
              </div>
            }
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-12" />
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : !data.puntosOrigen?.tickets?.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <MapPin className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Sin datos de puntos</p>
              </div>
            ) : (
              <div className="space-y-5">
                {data.puntosOrigen.tickets.slice(0, 5).map((punto, index) => {
                  const maxValue = getMaxValue(data.puntosOrigen.tickets, 'total')
                  const percentage = (punto.total / maxValue) * 100

                  return (
                    <div key={punto.id} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: index === 0 ? '#039855' : '#D1FADF'
                            }}
                          >
                            <MapPin
                              className="w-4 h-4"
                              style={{ color: index === 0 ? '#ffffff' : '#039855' }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                            {punto.nombre}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {punto.total}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: '#12B76A' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Second Row - Destinos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Puntos por Destino - Tickets */}
          <Card
            title="Top Destinos de Tickets"
            subtitle="Destinos mas solicitados"
            headerAction={
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-info-50 rounded-lg">
                <Ticket className="w-4 h-4 text-info-600" />
                <span className="text-xs font-medium text-info-700">Destino</span>
              </div>
            }
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-12" />
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : !data.puntosDestino?.tickets?.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <MapPin className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Sin datos de destinos</p>
              </div>
            ) : (
              <div className="space-y-5">
                {data.puntosDestino.tickets.slice(0, 5).map((punto, index) => {
                  const maxValue = getMaxValue(data.puntosDestino.tickets, 'total')
                  const percentage = (punto.total / maxValue) * 100

                  return (
                    <div key={punto.id} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: index === 0 ? '#0086C9' : '#E0F2FE'
                            }}
                          >
                            <MapPin
                              className="w-4 h-4"
                              style={{ color: index === 0 ? '#ffffff' : '#0086C9' }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {punto.nombre}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {punto.total}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: '#0BA5EC' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Top Puntos por Destino - Encomiendas */}
          <Card
            title="Top Destinos de Encomiendas"
            subtitle="Destinos con mas envios"
            headerAction={
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary-50 rounded-lg">
                <Package className="w-4 h-4 text-secondary-600" />
                <span className="text-xs font-medium text-secondary-700">Destino</span>
              </div>
            }
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-12" />
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : !data.puntosDestino?.encomiendas?.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Package className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Sin datos de encomiendas</p>
              </div>
            ) : (
              <div className="space-y-5">
                {data.puntosDestino.encomiendas.slice(0, 5).map((punto, index) => {
                  const maxValue = getMaxValue(data.puntosDestino.encomiendas, 'total')
                  const percentage = (punto.total / maxValue) * 100

                  return (
                    <div key={punto.id} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: index === 0 ? '#DC6803' : '#FEF0C7'
                            }}
                          >
                            <Package
                              className="w-4 h-4"
                              style={{ color: index === 0 ? '#ffffff' : '#DC6803' }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                            {punto.nombre}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {punto.total}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: '#F79009' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Stats Banner - Cruz Selvatico */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
          {/* Decorative elements - Verde y Rojo */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-400 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Resumen Rapido</h3>
                <p className="text-primary-200 text-sm">Estadisticas del dia</p>
              </div>
              <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
                <Sparkles className="w-4 h-4 text-secondary-400" />
                <span className="text-sm font-medium">En vivo</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{loading ? '-' : `S/ ${data.ingresoTotal.toFixed(2)}`}</p>
                <p className="text-primary-200 text-sm mt-1">Ingreso Total</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{loading ? '-' : data.ventasHoy}</p>
                <p className="text-primary-200 text-sm mt-1">Pasajes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{loading ? '-' : data.encomiendasHoy}</p>
                <p className="text-primary-200 text-sm mt-1">Encomiendas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{loading ? '-' : data.encomiendasEntregadas}</p>
                <p className="text-primary-200 text-sm mt-1">Entregadas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{loading ? '-' : data.rutasMasUsadas.length}</p>
                <p className="text-primary-200 text-sm mt-1">Rutas Activas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default DashboardPage
