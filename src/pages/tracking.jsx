/**
 * Tracking Page
 * Pagina publica premium para consulta de encomiendas
 */

import { useState } from 'react'
import PublicLayout from '../components/layout/PublicLayout'
import trackingService from '../services/trackingService'
import { formatTimestamp } from '../utils/dateUtils'
import {
  Search,
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  Box,
  AlertCircle,
  ArrowRight,
  User,
  Phone,
  Calendar,
  Sparkles
} from 'lucide-react'

// Estados con iconos y colores Cruz Selvatico - Verde y Rojo
const ESTADOS = {
  'REGISTRADO': {
    label: 'Registrado',
    icon: Box,
    color: 'text-primary-600',
    bgColor: 'bg-primary-100',
    bgSolid: 'bg-primary-500',
    ringColor: 'ring-primary-300',
    shadowColor: 'shadow-primary-500/40'
  },
  'EN_ALMACEN': {
    label: 'En Almacen',
    icon: Package,
    color: 'text-warning-600',
    bgColor: 'bg-warning-100',
    bgSolid: 'bg-warning-500',
    ringColor: 'ring-warning-300',
    shadowColor: 'shadow-warning-500/40'
  },
  'EN_RUTA': {
    label: 'En Ruta',
    icon: Truck,
    color: 'text-secondary-600',
    bgColor: 'bg-secondary-100',
    bgSolid: 'bg-secondary-500',
    ringColor: 'ring-secondary-300',
    shadowColor: 'shadow-secondary-500/40'
  },
  'LLEGO_A_DESTINO': {
    label: 'Llego a Destino',
    icon: MapPin,
    color: 'text-primary-700',
    bgColor: 'bg-primary-200',
    bgSolid: 'bg-primary-600',
    ringColor: 'ring-primary-400',
    shadowColor: 'shadow-primary-600/40'
  },
  'RETIRADO': {
    label: 'Entregado',
    icon: CheckCircle2,
    color: 'text-primary-700',
    bgColor: 'bg-primary-100',
    bgSolid: 'bg-primary-700',
    ringColor: 'ring-primary-400',
    shadowColor: 'shadow-primary-700/40'
  }
}

const ESTADOS_ORDEN = ['REGISTRADO', 'EN_ALMACEN', 'EN_RUTA', 'LLEGO_A_DESTINO', 'RETIRADO']

const TrackingPage = () => {
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [encomienda, setEncomienda] = useState(null)

  const buscar = async (e) => {
    e.preventDefault()

    if (!codigo.trim()) return

    try {
      setLoading(true)
      setError(null)
      setEncomienda(null)

      const response = await trackingService.consultar(codigo.trim())
      setEncomienda(response.encomienda)
    } catch (err) {
      console.error('Error buscando encomienda:', err)
      setError(
        err.response?.data?.error || 'No se encontro la encomienda. Verifique el codigo.'
      )
    } finally {
      setLoading(false)
    }
  }

  const getEstadoIndex = (estado) => ESTADOS_ORDEN.indexOf(estado)

  return (
    <PublicLayout>
      {/* Hero Section - Cruz Selvatico */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
        {/* Decorative elements - Verde y Rojo */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-secondary-500/25 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 lg:py-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-secondary-400" />
              Seguimiento en tiempo real
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Rastrear Encomienda
            </h1>
            <p className="text-lg text-primary-100 max-w-md mx-auto">
              Ingrese el codigo de tracking para consultar el estado de su envio
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={buscar} className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl shadow-primary-900/30 p-2">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Ej: ENC-20250118-00001"
                    className="w-full pl-12 pr-4 py-4 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none text-lg transition-all"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !codigo.trim()}
                  className="px-8 py-4 bg-gradient-to-b from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">Buscar</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Error */}
        {error && (
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-4 p-5 bg-error-50 border border-error-200 rounded-2xl">
              <div className="w-12 h-12 bg-error-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-error-600" />
              </div>
              <div>
                <p className="font-semibold text-error-700">No encontrado</p>
                <p className="text-sm text-error-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resultado */}
        {encomienda && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header del resultado */}
              <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-6 py-8 text-white relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                </div>

                <div className="relative z-10">
                  {(() => {
                    const estadoActual = ESTADOS[encomienda.estado]
                    const IconoEstado = estadoActual?.icon
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-primary-200 text-sm font-medium mb-1">Codigo de Tracking</p>
                          <p className="text-2xl lg:text-3xl font-bold">{encomienda.codigo}</p>
                        </div>
                        <div className={`
                          inline-flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg
                          ${estadoActual?.bgSolid || 'bg-gray-500'} text-white
                        `}>
                          {IconoEstado && (
                            <IconoEstado className="w-5 h-5" />
                          )}
                          <span className="font-bold">
                            {estadoActual?.label || encomienda.estado}
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="px-6 py-8 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">Progreso del Envio</h3>

                {/* Timeline horizontal */}
                <div className="relative">
                  {/* Linea de fondo */}
                  <div className="absolute top-5 left-0 right-0 h-1.5 bg-gray-200 rounded-full" />
                  {/* Linea activa - gradient Cruz Selvatico */}
                  <div
                    className="absolute top-5 left-0 h-1.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-700 rounded-full transition-all duration-500"
                    style={{ width: `${(getEstadoIndex(encomienda.estado) / (ESTADOS_ORDEN.length - 1)) * 100}%` }}
                  />

                  <div className="relative flex justify-between">
                    {ESTADOS_ORDEN.map((estado, index) => {
                      const isActive = getEstadoIndex(encomienda.estado) >= index
                      const isCurrent = encomienda.estado === estado
                      const isPending = getEstadoIndex(encomienda.estado) < index
                      const EstadoIcon = ESTADOS[estado].icon
                      const estadoConfig = ESTADOS[estado]

                      return (
                        <div key={estado} className="flex flex-col items-center">
                          {/* Icono */}
                          <div
                            className={`
                              relative z-10 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300
                              ${isCurrent
                                ? `${estadoConfig.bgSolid} text-white shadow-lg ${estadoConfig.shadowColor} ring-4 ${estadoConfig.ringColor} scale-110`
                                : isActive
                                ? `${estadoConfig.bgSolid} text-white shadow-md`
                                : 'bg-gray-200 text-gray-400 border-2 border-gray-300'
                              }
                            `}
                          >
                            <EstadoIcon className={`w-5 h-5 ${isPending ? '' : 'drop-shadow-sm'}`} />
                          </div>

                          {/* Label */}
                          <span
                            className={`
                              mt-3 text-xs font-semibold text-center max-w-[80px]
                              ${isCurrent
                                ? `${estadoConfig.color} font-bold`
                                : isActive
                                ? 'text-gray-700'
                                : 'text-gray-400'
                              }
                            `}
                          >
                            {ESTADOS[estado].label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Detalles */}
              <div className="px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Ruta */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Origen</p>
                      <p className="text-lg font-semibold text-gray-900">{encomienda.origen?.nombre}</p>
                      <p className="text-sm text-gray-500">{encomienda.origen?.ciudad}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Destino</p>
                      <p className="text-lg font-semibold text-gray-900">{encomienda.destino?.nombre}</p>
                      <p className="text-sm text-gray-500">{encomienda.destino?.ciudad}</p>
                    </div>
                  </div>
                </div>

                {/* Remitente */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-info-600" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Remitente</p>
                  </div>
                  <p className="text-gray-900 font-medium">{encomienda.remitente}</p>
                  {encomienda.celularRemitente && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      {encomienda.celularRemitente}
                    </p>
                  )}
                </div>

                {/* Destinatario */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-success-600" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Destinatario</p>
                  </div>
                  <p className="text-gray-900 font-medium">{encomienda.destinatario}</p>
                  {encomienda.celularDestinatario && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      {encomienda.celularDestinatario}
                    </p>
                  )}
                </div>
              </div>

              {/* Historial */}
              {encomienda.historial?.length > 0 && (
                <div className="px-6 py-8 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                    Historial de Eventos
                  </h3>
                  <div className="space-y-4">
                    {encomienda.historial.map((evento, index) => {
                      const estadoConfig = ESTADOS[evento.estadoDestino]
                      const EventoIcon = estadoConfig?.icon || Clock

                      return (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md
                            ${estadoConfig?.bgSolid || 'bg-gray-500'} text-white
                          `}>
                            <EventoIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">
                              {estadoConfig?.label || evento.estadoDestino}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {evento.puntoEvento?.nombre}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatTimestamp(evento.fechaEvento)}
                              </p>
                            </div>
                            {evento.nota && (
                              <p className="text-sm text-gray-400 mt-2 italic">"{evento.nota}"</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!encomienda && !error && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Busque su encomienda
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Ingrese el codigo de tracking en el campo de busqueda para ver el estado actual de su envio
            </p>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}

export default TrackingPage
