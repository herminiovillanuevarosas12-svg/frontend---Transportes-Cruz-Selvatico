/**
 * Escaneo de Encomiendas Page
 * Escaneo QR con camara para identificar encomiendas
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, StatusBadge, QRScanner } from '../../components/common'
import { useAuthStore } from '../../features/auth/authStore'
import encomiendasService from '../../services/encomiendasService'
import {
  QrCode,
  Package,
  MapPin,
  User,
  Phone,
  ArrowRight,
  Check,
  AlertCircle,
  RefreshCw,
  Keyboard,
  Search,
  ShieldAlert,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

const EscaneoAlmacenPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [scanning, setScanning] = useState(true)
  const [loading, setLoading] = useState(false)
  const [encomienda, setEncomienda] = useState(null)
  const [error, setError] = useState(null)
  const [modoManual, setModoManual] = useState(false)
  const [codigoManual, setCodigoManual] = useState('')
  const [alertaRetiro, setAlertaRetiro] = useState(null)

  const handleScan = useCallback(async (codigo) => {
    if (loading) return

    try {
      setLoading(true)
      setError(null)
      setScanning(false)

      // Buscar encomienda por codigo
      const response = await encomiendasService.buscarPorCodigo(codigo)

      if (response.encomienda) {
        setEncomienda(response.encomienda)
        toast.success('Encomienda encontrada')
      } else {
        setError('Encomienda no encontrada')
        toast.error('Encomienda no encontrada')
      }
    } catch (error) {
      console.error('Error buscando encomienda:', error)
      setError(error.response?.data?.error || 'Error al buscar encomienda')
      toast.error('Error al buscar encomienda')
    } finally {
      setLoading(false)
    }
  }, [loading])

  const handleScanError = useCallback((error) => {
    console.error('Error de escaneo:', error)
    // No mostrar error por cada frame fallido
  }, [])

  const resetScan = () => {
    setEncomienda(null)
    setError(null)
    setScanning(true)
    setCodigoManual('')
  }

  const handleBusquedaManual = async (e) => {
    e.preventDefault()
    const codigo = codigoManual.trim()
    if (!codigo) {
      toast.error('Ingrese un codigo de encomienda')
      return
    }
    await handleScan(codigo)
  }

  const toggleModoManual = () => {
    setModoManual(!modoManual)
    setError(null)
  }

  const getEstadoColor = (estado) => {
    const colores = {
      REGISTRADO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      EN_ALMACEN: 'bg-blue-100 text-blue-800 border-blue-200',
      EN_RUTA: 'bg-purple-100 text-purple-800 border-purple-200',
      LLEGO_A_DESTINO: 'bg-green-100 text-green-800 border-green-200',
      RETIRADO: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200'
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

  const handleCambiarEstado = () => {
    if (!encomienda) return

    const siguienteEstado = getSiguienteEstado(encomienda.estado)

    if (siguienteEstado === 'RETIRADO') {
      // Verificar si el usuario puede registrar el retiro
      // Solo usuarios del punto destino pueden registrar retiros (superadmin no tiene punto asignado)
      const idPuntoUsuario = user?.id_punto
      const idPuntoDestino = encomienda.ruta?.puntoDestino?.id
      const nombrePuntoDestino = encomienda.ruta?.puntoDestino?.nombre

      if (idPuntoUsuario && idPuntoDestino && idPuntoUsuario !== idPuntoDestino) {
        // Mostrar alerta informativa
        setAlertaRetiro({
          mensaje: 'No puede registrar la entrega de esta encomienda',
          razon: `Solo el punto de destino "${nombrePuntoDestino}" puede registrar la entrega.`,
          detalle: 'La encomienda debe ser entregada en su punto de destino.'
        })
        return
      }

      // Ir a pagina de retiro con verificacion
      navigate(`/almacen/retiro/${encomienda.id}`)
    } else {
      // Ir a pagina de cambio de estado
      navigate(`/almacen/cambio-estado/${encomienda.id}`)
    }
  }

  return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Escaneo de Encomiendas</h1>
          <p className="text-gray-500">Escanee el codigo QR de la encomienda</p>
        </div>

        {/* Scanner o Modo Manual */}
        {scanning && (
          <div className="space-y-4">
            {/* Toggle entre modos */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                <button
                  onClick={() => setModoManual(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    !modoManual
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Escanear QR
                </button>
                <button
                  onClick={() => setModoManual(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    modoManual
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Keyboard className="w-4 h-4" />
                  Ingreso Manual
                </button>
              </div>
            </div>

            {/* Modo Escaner QR */}
            {!modoManual && (
              <Card className="overflow-hidden">
                <QRScanner
                  onScan={handleScan}
                  onError={handleScanError}
                />
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <QrCode className="w-5 h-5" />
                    <span>Apunte la camara al codigo QR</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Modo Manual */}
            {modoManual && (
              <Card>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Keyboard className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Ingreso Manual</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Ingrese el codigo de la encomienda manualmente
                  </p>
                </div>

                <form onSubmit={handleBusquedaManual} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Codigo de Encomienda
                    </label>
                    <input
                      type="text"
                      value={codigoManual}
                      onChange={(e) => setCodigoManual(e.target.value.toUpperCase())}
                      placeholder="Ej: ENC-20250119-0001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center font-mono text-lg uppercase"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    icon={Search}
                    className="w-full"
                    disabled={!codigoManual.trim()}
                  >
                    Buscar Encomienda
                  </Button>
                </form>

                <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-700">
                    <strong>Tip:</strong> El codigo se encuentra impreso en la guia de encomienda o debajo del codigo QR.
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <Card className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Buscando encomienda...</p>
          </Card>
        )}

        {/* Error */}
        {error && !loading && (
          <Card className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No encontrado</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button icon={RefreshCw} onClick={resetScan}>
              Escanear de nuevo
            </Button>
          </Card>
        )}

        {/* Resultado */}
        {encomienda && !loading && (
          <div className="space-y-4">
            {/* Info Principal */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-500">Codigo de Rastreo</span>
                  <p className="text-xl font-mono font-bold text-gray-900">
                    {encomienda.codigoRastreo}
                  </p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getEstadoColor(encomienda.estado)}`}>
                  {encomienda.estado?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Ruta */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <span className="text-sm text-blue-700">Ruta</span>
                  <p className="font-medium text-blue-900">
                    {encomienda.ruta?.puntoOrigen?.nombre} → {encomienda.ruta?.puntoDestino?.nombre}
                  </p>
                </div>
              </div>

              {/* Detalles */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Descripcion</span>
                  <p className="text-gray-900">{encomienda.descripcion}</p>
                </div>
                <div>
                  <span className="text-gray-500">Peso</span>
                  <p className="text-gray-900">{encomienda.peso} kg</p>
                </div>
              </div>
            </Card>

            {/* Remitente y Destinatario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Remitente</span>
                </div>
                <p className="font-medium text-gray-900">{encomienda.remitenteNombre}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <Phone className="w-3 h-3" />
                  {encomienda.remitenteTelefono}
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Destinatario</span>
                </div>
                <p className="font-medium text-gray-900">{encomienda.destinatarioNombre}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <Phone className="w-3 h-3" />
                  {encomienda.destinatarioTelefono}
                </div>
              </Card>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                icon={RefreshCw}
                onClick={resetScan}
                className="flex-1"
              >
                Escanear otra
              </Button>
              {encomienda.estado !== 'RETIRADO' && (
                <Button
                  icon={ArrowRight}
                  onClick={handleCambiarEstado}
                  className="flex-1"
                >
                  {getSiguienteEstado(encomienda.estado) === 'RETIRADO'
                    ? 'Registrar Retiro'
                    : 'Cambiar Estado'
                  }
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Modal de Alerta - No puede registrar retiro */}
        {alertaRetiro && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-800">
                      Accion no permitida
                    </h3>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="px-6 py-5">
                <p className="text-gray-900 font-medium mb-2">
                  {alertaRetiro.mensaje}
                </p>
                <p className="text-gray-600 mb-3">
                  {alertaRetiro.razon}
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Nota:</strong> {alertaRetiro.detalle}
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="px-6 py-4 bg-gray-50 border-t">
                <Button
                  onClick={() => setAlertaRetiro(null)}
                  className="w-full"
                  icon={X}
                >
                  Entendido
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}

export default EscaneoAlmacenPage
