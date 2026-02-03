/**
 * Cambio de Estado Page
 * Cambiar estado de encomienda en el flujo
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import { Card, Button } from '../../components/common'
import encomiendasService from '../../services/encomiendasService'
import {
  Package,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Loader,
  Truck,
  MapPin,
  Warehouse
} from 'lucide-react'
import toast from 'react-hot-toast'

const CambioEstadoPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [encomienda, setEncomienda] = useState(null)
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [observacion, setObservacion] = useState('')

  useEffect(() => {
    cargarEncomienda()
  }, [id])

  const cargarEncomienda = async () => {
    try {
      setLoading(true)
      const response = await encomiendasService.obtener(id)
      setEncomienda(response.encomienda || response)
    } catch (error) {
      console.error('Error cargando encomienda:', error)
      toast.error('Error al cargar encomienda')
      navigate('/almacen/escaneo')
    } finally {
      setLoading(false)
    }
  }

  const getEstadoInfo = (estado) => {
    const info = {
      REGISTRADO: {
        label: 'Registrado',
        icon: Package,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        bgColor: 'bg-yellow-50'
      },
      EN_ALMACEN: {
        label: 'En Almacen',
        icon: Warehouse,
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        bgColor: 'bg-blue-50'
      },
      EN_RUTA: {
        label: 'En Ruta',
        icon: Truck,
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        bgColor: 'bg-purple-50'
      },
      LLEGO_A_DESTINO: {
        label: 'Llego a Destino',
        icon: MapPin,
        color: 'bg-green-100 text-green-800 border-green-300',
        bgColor: 'bg-green-50'
      },
      RETIRADO: {
        label: 'Retirado',
        icon: Check,
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        bgColor: 'bg-gray-50'
      }
    }
    return info[estado] || info.REGISTRADO
  }

  const getSiguienteEstado = (estadoActual) => {
    const flujo = {
      REGISTRADO: 'EN_ALMACEN',
      EN_ALMACEN: 'EN_RUTA',
      EN_RUTA: 'LLEGO_A_DESTINO',
      LLEGO_A_DESTINO: 'RETIRADO'
    }
    return flujo[estadoActual]
  }

  const handleCambiarEstado = async () => {
    if (!encomienda) return

    const siguienteEstado = getSiguienteEstado(encomienda.estadoActual)

    if (!siguienteEstado) {
      toast.error('No se puede cambiar el estado')
      return
    }

    // Si el siguiente estado es RETIRADO, redirigir a pagina de retiro
    if (siguienteEstado === 'RETIRADO') {
      navigate(`/almacen/retiro/${encomienda.id}`)
      return
    }

    try {
      setProcesando(true)

      await encomiendasService.cambiarEstado(encomienda.id, {
        nuevoEstado: siguienteEstado,
        nota: observacion || undefined
      })

      toast.success(`Estado cambiado a: ${getEstadoInfo(siguienteEstado).label}`)

      // Volver a escaneo
      navigate('/almacen/escaneo')
    } catch (error) {
      console.error('Error cambiando estado:', error)
      toast.error(error.response?.data?.error || 'Error al cambiar estado')
    } finally {
      setProcesando(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader className="w-6 h-6 animate-spin" />
            <span>Cargando...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!encomienda) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Encomienda no encontrada</p>
          <Button
            variant="outline"
            onClick={() => navigate('/almacen/escaneo')}
            className="mt-4"
          >
            Volver al escaneo
          </Button>
        </div>
      </MainLayout>
    )
  }

  const estadoActual = getEstadoInfo(encomienda.estadoActual)
  const siguienteEstado = getSiguienteEstado(encomienda.estadoActual)
  const estadoSiguiente = siguienteEstado ? getEstadoInfo(siguienteEstado) : null

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/almacen/escaneo')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al escaneo
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Cambio de Estado</h1>
          <p className="text-gray-500">Actualizar estado de la encomienda</p>
        </div>

        {/* Info de Encomienda */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm text-gray-500">Codigo</span>
              <p className="text-xl font-mono font-bold text-gray-900">
                {encomienda.codigoTracking}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">Descripcion</span>
              <p className="text-gray-900">{encomienda.descripcion || encomienda.tipoPaquete}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">
              {encomienda.puntoOrigen?.nombre} → {encomienda.puntoDestino?.nombre}
            </span>
          </div>
        </Card>

        {/* Cambio de Estado Visual */}
        <Card className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6 text-center">
            Transicion de Estado
          </h3>

          <div className="flex items-center justify-center gap-4">
            {/* Estado Actual */}
            <div className={`flex flex-col items-center p-4 rounded-xl border-2 ${estadoActual.color}`}>
              <estadoActual.icon className="w-8 h-8 mb-2" />
              <span className="font-medium text-sm">{estadoActual.label}</span>
              <span className="text-xs opacity-75">Estado Actual</span>
            </div>

            {/* Flecha */}
            {estadoSiguiente && (
              <>
                <ArrowRight className="w-8 h-8 text-gray-400" />

                {/* Estado Siguiente */}
                <div className={`flex flex-col items-center p-4 rounded-xl border-2 ${estadoSiguiente.color}`}>
                  <estadoSiguiente.icon className="w-8 h-8 mb-2" />
                  <span className="font-medium text-sm">{estadoSiguiente.label}</span>
                  <span className="text-xs opacity-75">Nuevo Estado</span>
                </div>
              </>
            )}
          </div>

          {/* Observacion */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observacion (opcional)
            </label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Agregue una observacion si es necesario..."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </Card>

        {/* Botones */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/almacen/escaneo')}
            className="flex-1"
          >
            Cancelar
          </Button>
          {estadoSiguiente && (
            <Button
              icon={Check}
              onClick={handleCambiarEstado}
              disabled={procesando}
              className="flex-1"
            >
              {procesando ? 'Procesando...' : `Cambiar a ${estadoSiguiente.label}`}
            </Button>
          )}
        </div>

        {/* Timeline de Estados */}
        <Card className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Flujo de Estados</h4>
          <div className="flex items-center justify-between">
            {['REGISTRADO', 'EN_ALMACEN', 'EN_RUTA', 'LLEGO_A_DESTINO', 'RETIRADO'].map((estado, index, arr) => {
              const info = getEstadoInfo(estado)
              const esActual = estado === encomienda.estadoActual
              const esPasado = arr.indexOf(encomienda.estadoActual) > index
              const esSiguiente = estado === siguienteEstado

              return (
                <div key={estado} className="flex items-center">
                  <div className={`flex flex-col items-center ${
                    esActual ? 'opacity-100' : esPasado ? 'opacity-50' : 'opacity-30'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      esActual || esPasado ? info.color : 'bg-gray-100 text-gray-400'
                    } ${esSiguiente ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}>
                      <info.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs mt-1 text-center max-w-[60px]">
                      {info.label}
                    </span>
                  </div>
                  {index < arr.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${
                      esPasado ? 'bg-green-400' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}

export default CambioEstadoPage
