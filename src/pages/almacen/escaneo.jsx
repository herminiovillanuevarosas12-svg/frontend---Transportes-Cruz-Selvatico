/**
 * Escaneo de Encomiendas Page
 * Escaneo QR con camara, ingreso manual por codigo, y busqueda por DNI
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
  X,
  Contact,
  ChevronRight,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

const ESTADO_LABELS = {
  REGISTRADO: 'Registrado',
  EN_ALMACEN: 'En Almacen',
  EN_RUTA: 'En Ruta',
  LLEGO_A_DESTINO: 'Llego a Destino',
  RETIRADO: 'Retirado'
}

const EscaneoAlmacenPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [scanning, setScanning] = useState(true)
  const [loading, setLoading] = useState(false)
  const [encomienda, setEncomienda] = useState(null)
  const [error, setError] = useState(null)
  // Modos: 'qr' | 'manual' | 'dni'
  const [modo, setModo] = useState('qr')
  const [codigoManual, setCodigoManual] = useState('')
  const [alertaRetiro, setAlertaRetiro] = useState(null)
  // Estado para busqueda por DNI
  const [dniBusqueda, setDniBusqueda] = useState('')
  const [listaEncomiendas, setListaEncomiendas] = useState(null)

  const handleScan = useCallback(async (codigo) => {
    if (loading) return

    try {
      setLoading(true)
      setError(null)
      setScanning(false)
      setListaEncomiendas(null)

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
  }, [])

  const resetScan = () => {
    setEncomienda(null)
    setError(null)
    setScanning(true)
    setCodigoManual('')
    setDniBusqueda('')
    setListaEncomiendas(null)
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

  const handleBusquedaDni = async (e) => {
    e.preventDefault()
    const dni = dniBusqueda.trim()
    if (!dni || dni.length < 6) {
      toast.error('Ingrese un DNI valido (minimo 6 digitos)')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setEncomienda(null)
      setScanning(false)

      const response = await encomiendasService.buscarPorDni(dni)

      if (response.encomiendas && response.encomiendas.length > 0) {
        setListaEncomiendas(response.encomiendas)
        toast.success(`${response.encomiendas.length} encomienda(s) encontrada(s)`)
      } else {
        setListaEncomiendas([])
        setError('No se encontraron encomiendas vigentes para este DNI')
      }
    } catch (error) {
      console.error('Error buscando por DNI:', error)
      setError(error.response?.data?.error || 'Error al buscar por DNI')
      toast.error('Error al buscar por DNI')
    } finally {
      setLoading(false)
    }
  }

  const seleccionarEncomienda = (enc) => {
    setEncomienda(enc)
    setListaEncomiendas(null)
  }

  const volverALista = () => {
    setEncomienda(null)
    setScanning(false)
  }

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo)
    setError(null)
    setEncomienda(null)
    setListaEncomiendas(null)
    setScanning(true)
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
      const idPuntoUsuario = user?.id_punto
      const idPuntoDestino = encomienda.ruta?.puntoDestino?.id
      const nombrePuntoDestino = encomienda.ruta?.puntoDestino?.nombre

      if (idPuntoUsuario && idPuntoDestino && idPuntoUsuario !== idPuntoDestino) {
        setAlertaRetiro({
          mensaje: 'No puede registrar la entrega de esta encomienda',
          razon: `Solo el punto de destino "${nombrePuntoDestino}" puede registrar la entrega.`,
          detalle: 'La encomienda debe ser entregada en su punto de destino.'
        })
        return
      }

      navigate(`/almacen/retiro/${encomienda.id}`)
    } else {
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

        {/* Scanner / Modo Manual / Busqueda DNI */}
        {scanning && (
          <div className="space-y-4">
            {/* Toggle entre modos */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                <button
                  onClick={() => cambiarModo('qr')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    modo === 'qr'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Escanear QR
                </button>
                <button
                  onClick={() => cambiarModo('manual')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    modo === 'manual'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Keyboard className="w-4 h-4" />
                  Codigo
                </button>
                <button
                  onClick={() => cambiarModo('dni')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    modo === 'dni'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Contact className="w-4 h-4" />
                  Buscar DNI
                </button>
              </div>
            </div>

            {/* Modo Escaner QR */}
            {modo === 'qr' && (
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

            {/* Modo Manual - Codigo */}
            {modo === 'manual' && (
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
                      placeholder="Ej: ENC-00000001"
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

            {/* Modo DNI */}
            {modo === 'dni' && (
              <Card>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Contact className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Buscar por DNI</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Ingrese el DNI del remitente o destinatario
                  </p>
                </div>

                <form onSubmit={handleBusquedaDni} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DNI del Cliente
                    </label>
                    <input
                      type="text"
                      value={dniBusqueda}
                      onChange={(e) => setDniBusqueda(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej: 12345678"
                      maxLength={15}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-center font-mono text-lg"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    icon={Search}
                    className="w-full"
                    disabled={!dniBusqueda.trim() || dniBusqueda.trim().length < 6}
                  >
                    Buscar Encomiendas
                  </Button>
                </form>

                <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-700">
                    <strong>Nota:</strong> Solo se muestran encomiendas vigentes (no entregadas).
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
        {error && !loading && !listaEncomiendas && (
          <Card className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No encontrado</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button icon={RefreshCw} onClick={resetScan}>
              Buscar de nuevo
            </Button>
          </Card>
        )}

        {/* Lista de encomiendas por DNI */}
        {listaEncomiendas && !encomienda && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Encomiendas vigentes
                </h3>
                <p className="text-sm text-gray-500">
                  DNI: {dniBusqueda} — {listaEncomiendas.length} resultado(s)
                </p>
              </div>
              <Button variant="outline" icon={RefreshCw} onClick={resetScan} size="sm">
                Nueva busqueda
              </Button>
            </div>

            {listaEncomiendas.length === 0 ? (
              <Card className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin encomiendas vigentes</h3>
                <p className="text-gray-500 mb-4">No hay encomiendas pendientes para este DNI.</p>
                <Button icon={RefreshCw} onClick={resetScan}>
                  Buscar otro DNI
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {listaEncomiendas.map((enc) => (
                  <Card
                    key={enc.id}
                    className="cursor-pointer hover:shadow-md hover:border-blue-200 transition-all border"
                    onClick={() => seleccionarEncomienda(enc)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Codigo y Estado */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono font-bold text-gray-900 text-sm">
                            {enc.codigoRastreo}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(enc.estado)}`}>
                            {ESTADO_LABELS[enc.estado] || enc.estado?.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Ruta */}
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">
                            {enc.ruta?.puntoOrigen?.nombre} → {enc.ruta?.puntoDestino?.nombre}
                          </span>
                        </div>

                        {/* Descripcion y destinatario */}
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Package className="w-3.5 h-3.5" />
                            {enc.descripcion}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {enc.destinatarioNombre}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resultado - Detalle de encomienda seleccionada */}
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
                  {ESTADO_LABELS[encomienda.estado] || encomienda.estado?.replace(/_/g, ' ')}
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
              {/* Boton volver a lista (solo si vino de busqueda por DNI) */}
              {listaEncomiendas ? (
                <Button
                  variant="outline"
                  icon={ArrowRight}
                  onClick={volverALista}
                  className="flex-1"
                >
                  Volver a la lista
                </Button>
              ) : (
                <Button
                  variant="outline"
                  icon={RefreshCw}
                  onClick={resetScan}
                  className="flex-1"
                >
                  Escanear otra
                </Button>
              )}
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
