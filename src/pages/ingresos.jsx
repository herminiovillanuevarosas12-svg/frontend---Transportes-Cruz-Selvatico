/**
 * Ingresos Page
 * Pagina detallada de indicadores de ingresos por pasajes y encomiendas
 */

import { useState, useEffect } from 'react'
import Card, { StatCard } from '../components/common/Card'
import dashboardService from '../services/dashboardService'
import {
  DollarSign,
  Banknote,
  CircleDollarSign,
  Calendar,
  RefreshCw,
  TrendingUp,
  MapPin,
  Ticket,
  Package,
  Building2,
  Filter
} from 'lucide-react'

const RANGOS_FECHA = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Esta Semana' },
  { id: 'mes', label: 'Este Mes' },
  { id: 'personalizado', label: 'Personalizado' }
]

const calcularRangoFecha = (rangoId) => {
  const hoy = new Date()
  const formatear = (date) => date.toISOString().split('T')[0]

  switch (rangoId) {
    case 'hoy':
      return { fechaInicio: formatear(hoy), fechaFin: formatear(hoy) }
    case 'semana': {
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1)
      return { fechaInicio: formatear(inicioSemana), fechaFin: formatear(hoy) }
    }
    case 'mes': {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      return { fechaInicio: formatear(inicioMes), fechaFin: formatear(hoy) }
    }
    default:
      return { fechaInicio: formatear(hoy), fechaFin: formatear(hoy) }
  }
}

const IngresosPage = () => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [rangoActivo, setRangoActivo] = useState('hoy')
  const [fechaPersonalizada, setFechaPersonalizada] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0]
  })
  const [data, setData] = useState({
    ingresoTotal: 0,
    ingresoPasajes: { total: 0, cantidad: 0, porAgencia: [] },
    ingresoEncomiendas: { total: 0, cantidad: 0, porAgencia: [] }
  })

  useEffect(() => {
    cargarDatos()
  }, [rangoActivo, fechaPersonalizada])

  const obtenerFechas = () => {
    if (rangoActivo === 'personalizado') {
      return fechaPersonalizada
    }
    return calcularRangoFecha(rangoActivo)
  }

  const cargarDatos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const { fechaInicio, fechaFin } = obtenerFechas()

      const [pasajesRes, encomiendasRes] = await Promise.all([
        dashboardService.ingresoPasajes(fechaInicio, fechaFin),
        dashboardService.ingresoEncomiendas(fechaInicio, fechaFin)
      ])

      setData({
        ingresoTotal: (pasajesRes.total || 0) + (encomiendasRes.total || 0),
        ingresoPasajes: pasajesRes,
        ingresoEncomiendas: encomiendasRes
      })
    } catch (error) {
      console.error('Error cargando ingresos:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRangoChange = (rangoId) => {
    setRangoActivo(rangoId)
  }

  const getMaxAgencia = (agencias) => {
    if (!agencias || agencias.length === 0) return 1
    return Math.max(...agencias.map(a => a.total || 0))
  }

  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-700 rounded-xl flex items-center justify-center shadow-lg shadow-success-500/25">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ingresos</h1>
                <p className="text-sm text-gray-500">Control detallado de ingresos por pasajes y encomiendas</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => cargarDatos(true)}
              disabled={refreshing}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filtros de Fecha */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Periodo:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {RANGOS_FECHA.map((rango) => (
                <button
                  key={rango.id}
                  onClick={() => handleRangoChange(rango.id)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${rangoActivo === rango.id
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {rango.label}
                </button>
              ))}
            </div>
            {rangoActivo === 'personalizado' && (
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="date"
                  value={fechaPersonalizada.fechaInicio}
                  onChange={(e) => setFechaPersonalizada(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={fechaPersonalizada.fechaFin}
                  onChange={(e) => setFechaPersonalizada(prev => ({ ...prev, fechaFin: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Cards Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Ingreso Total"
            value={loading ? '-' : `S/ ${data.ingresoTotal.toFixed(2)}`}
            icon={DollarSign}
            iconColor="success"
            subtitle={`${(data.ingresoPasajes.cantidad || 0) + (data.ingresoEncomiendas.cantidad || 0)} operaciones`}
            loading={loading}
          />
          <StatCard
            title="Ingreso por Pasajes"
            value={loading ? '-' : `S/ ${(data.ingresoPasajes.total || 0).toFixed(2)}`}
            icon={Banknote}
            iconColor="primary"
            subtitle={`${data.ingresoPasajes.cantidad || 0} tickets vendidos`}
            loading={loading}
          />
          <StatCard
            title="Ingreso por Encomiendas"
            value={loading ? '-' : `S/ ${(data.ingresoEncomiendas.total || 0).toFixed(2)}`}
            icon={CircleDollarSign}
            iconColor="warning"
            subtitle={`${data.ingresoEncomiendas.cantidad || 0} envios registrados`}
            loading={loading}
          />
        </div>

        {/* Tablas por Agencia */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ingresos por Pasajes por Agencia */}
          <Card
            title="Pasajes por Agencia"
            subtitle="Ingresos por venta de tickets por punto de origen"
            headerAction={
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 rounded-lg">
                <Ticket className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-medium text-primary-700">
                  S/ {(data.ingresoPasajes.total || 0).toFixed(2)}
                </span>
              </div>
            }
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-20" />
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : !data.ingresoPasajes.porAgencia?.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Ticket className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Sin ingresos por pasajes en este periodo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.ingresoPasajes.porAgencia.map((agencia, index) => {
                  const maxValue = getMaxAgencia(data.ingresoPasajes.porAgencia)
                  const percentage = maxValue > 0 ? (agencia.total / maxValue) * 100 : 0

                  return (
                    <div key={agencia.agencia_id} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            ${index === 0 ? 'bg-primary-600' : 'bg-primary-100'}
                          `}>
                            <Building2 className={`w-4 h-4 ${index === 0 ? 'text-white' : 'text-primary-600'}`} />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {agencia.agencia_nombre}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              {agencia.cantidad} tickets
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          S/ {agencia.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Ingresos por Encomiendas por Agencia */}
          <Card
            title="Encomiendas por Agencia"
            subtitle="Ingresos por envios por punto de origen"
            headerAction={
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-warning-50 rounded-lg">
                <Package className="w-4 h-4 text-warning-600" />
                <span className="text-xs font-medium text-warning-700">
                  S/ {(data.ingresoEncomiendas.total || 0).toFixed(2)}
                </span>
              </div>
            }
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-20" />
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : !data.ingresoEncomiendas.porAgencia?.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Package className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Sin ingresos por encomiendas en este periodo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.ingresoEncomiendas.porAgencia.map((agencia, index) => {
                  const maxValue = getMaxAgencia(data.ingresoEncomiendas.porAgencia)
                  const percentage = maxValue > 0 ? (agencia.total / maxValue) * 100 : 0

                  return (
                    <div key={agencia.agencia_id} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            ${index === 0 ? 'bg-warning-600' : 'bg-warning-100'}
                          `}>
                            <Building2 className={`w-4 h-4 ${index === 0 ? 'text-white' : 'text-warning-600'}`} />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {agencia.agencia_nombre}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              {agencia.cantidad} envios
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          S/ {agencia.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-warning-500 to-warning-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Tabla Detallada Combinada */}
        <Card
          title="Resumen por Agencia"
          subtitle="Ingresos totales combinados (pasajes + encomiendas) por agencia"
          headerAction={
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-success-600" />
              <span className="text-xs font-medium text-success-700">
                S/ {data.ingresoTotal.toFixed(2)}
              </span>
            </div>
          }
        >
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : (() => {
            // Combinar agencias de ambos tipos de ingreso
            const agenciaMap = new Map()

            data.ingresoPasajes.porAgencia?.forEach(a => {
              agenciaMap.set(a.agencia_id, {
                id: a.agencia_id,
                nombre: a.agencia_nombre,
                tipo: a.agencia_tipo,
                pasajes: a.total,
                cantPasajes: a.cantidad,
                encomiendas: 0,
                cantEncomiendas: 0
              })
            })

            data.ingresoEncomiendas.porAgencia?.forEach(a => {
              if (agenciaMap.has(a.agencia_id)) {
                const existing = agenciaMap.get(a.agencia_id)
                existing.encomiendas = a.total
                existing.cantEncomiendas = a.cantidad
              } else {
                agenciaMap.set(a.agencia_id, {
                  id: a.agencia_id,
                  nombre: a.agencia_nombre,
                  tipo: a.agencia_tipo,
                  pasajes: 0,
                  cantPasajes: 0,
                  encomiendas: a.total,
                  cantEncomiendas: a.cantidad
                })
              }
            })

            const agenciasCombinadas = Array.from(agenciaMap.values())
              .map(a => ({ ...a, totalGeneral: a.pasajes + a.encomiendas }))
              .sort((a, b) => b.totalGeneral - a.totalGeneral)

            if (agenciasCombinadas.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Building2 className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">Sin datos de ingresos en este periodo</p>
                </div>
              )
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Agencia</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Pasajes</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Encomiendas</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agenciasCombinadas.map((agencia) => (
                      <tr key={agencia.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{agencia.nombre}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`
                            px-2 py-1 rounded-lg text-xs font-medium
                            ${agencia.tipo === 'TERMINAL' ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-600'}
                          `}>
                            {agencia.tipo}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div>
                            <span className="text-sm font-semibold text-gray-900">S/ {agencia.pasajes.toFixed(2)}</span>
                            <p className="text-xs text-gray-400">{agencia.cantPasajes} tickets</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div>
                            <span className="text-sm font-semibold text-gray-900">S/ {agencia.encomiendas.toFixed(2)}</span>
                            <p className="text-xs text-gray-400">{agencia.cantEncomiendas} envios</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-bold text-success-600">S/ {agencia.totalGeneral.toFixed(2)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td colSpan="2" className="py-3 px-4 text-sm font-bold text-gray-700">TOTAL</td>
                      <td className="py-3 px-4 text-right text-sm font-bold text-primary-700">
                        S/ {(data.ingresoPasajes.total || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-bold text-warning-700">
                        S/ {(data.ingresoEncomiendas.total || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-bold text-success-700">
                        S/ {data.ingresoTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )
          })()}
        </Card>
      </div>
  )
}

export default IngresosPage
