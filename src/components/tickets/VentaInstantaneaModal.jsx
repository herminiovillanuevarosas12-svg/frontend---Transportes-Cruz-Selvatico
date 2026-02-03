/**
 * VentaInstantaneaModal Component
 * Modal para venta rapida de pasajes - SIN horario predefinido
 * La venta se registra con la hora actual del momento
 *
 * Incluye: BOLETA, FACTURA y VERIFICACION (nota de venta)
 * TIMEZONE: Usa hora de Peru para mostrar confirmacion visual
 */

import { useState, useEffect, useRef } from 'react'
import { Modal } from '../common'
import {
  Zap,
  Clock,
  User,
  Search,
  X,
  ChevronDown,
  Check,
  Star,
  Gift,
  MapPin,
  Receipt,
  FileText,
  Building2,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import rutasService from '../../services/rutasService'
import ticketsService from '../../services/ticketsService'
import clientesService from '../../services/clientesService'
import configuracionService from '../../services/configuracionService'
import useDocLookup from '../../hooks/useDocLookup'
import { getTodayInPeru } from '../../utils/dateUtils'

/**
 * Obtiene la hora actual en Peru formateada
 */
const getHoraActualPeru = () => {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  return formatter.format(now)
}

const VentaInstantaneaModal = ({ isOpen, onClose, onVentaExitosa }) => {
  // Estados principales
  const [loading, setLoading] = useState(false)
  const [rutas, setRutas] = useState([])
  const [clientes, setClientes] = useState([])

  // Hora actual (se actualiza cada segundo cuando el modal esta abierto)
  const [horaActual, setHoraActual] = useState(getHoraActualPeru())
  const [fechaHoy] = useState(getTodayInPeru())

  // Configuracion de puntos
  const [configPuntos, setConfigPuntos] = useState({
    solesPorPunto: 10,
    puntosPorSolDescuento: 10
  })

  // Datos del formulario
  const [idRuta, setIdRuta] = useState('')
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null)

  // Datos del pasajero
  const [documento, setDocumento] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [telefono, setTelefono] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [clientesFiltrados, setClientesFiltrados] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  // Pago y puntos
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [puntosACanjear, setPuntosACanjear] = useState(0)
  const [comentario, setComentario] = useState('')

  // Tipo de comprobante y datos de factura
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [clienteFactura, setClienteFactura] = useState({
    ruc: '',
    razonSocial: '',
    direccion: ''
  })
  const [errorBusquedaRuc, setErrorBusquedaRuc] = useState('')

  // Hook para busqueda de DNI/RUC en SUNAT
  const { loading: buscandoDoc, consultarDni, consultarRuc, reset: resetDocLookup } = useDocLookup()

  const documentoInputRef = useRef(null)

  // Actualizar hora cada segundo cuando el modal esta abierto
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      setHoraActual(getHoraActualPeru())
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      cargarRutas()
      cargarClientes()
      cargarConfigPuntos()
    }
  }, [isOpen])

  // Actualizar ruta seleccionada cuando cambia idRuta
  useEffect(() => {
    if (idRuta) {
      const ruta = rutas.find(r => r.id === parseInt(idRuta))
      setRutaSeleccionada(ruta || null)
    } else {
      setRutaSeleccionada(null)
    }
  }, [idRuta, rutas])

  const cargarRutas = async () => {
    try {
      const response = await rutasService.listar()
      setRutas(response.rutas || [])
    } catch (error) {
      console.error('Error cargando rutas:', error)
      toast.error('Error al cargar rutas')
    }
  }

  const cargarClientes = async () => {
    try {
      const response = await clientesService.listar({ limit: 1000 })
      setClientes(response.clientes || [])
    } catch (error) {
      console.error('Error cargando clientes:', error)
    }
  }

  const cargarConfigPuntos = async () => {
    try {
      const response = await configuracionService.obtener()
      const config = response.configuracion || response
      setConfigPuntos({
        solesPorPunto: parseFloat(config.solesPorPunto) || 10,
        puntosPorSolDescuento: parseFloat(config.puntosPorSolDescuento) || 10
      })
    } catch (error) {
      console.error('Error cargando config puntos:', error)
    }
  }

  // Handler para documento con autocompletado (DNI 8 digitos o RUC 11 digitos)
  const handleDocumentoChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11)
    setDocumento(value)
    setClienteSeleccionado(null)

    // Filtrar clientes locales
    if (value.length >= 2) {
      const filtrados = clientes.filter(c =>
        c.documentoIdentidad.includes(value)
      ).slice(0, 5)
      setClientesFiltrados(filtrados)
      setShowDropdown(filtrados.length > 0)
    } else {
      setClientesFiltrados([])
      setShowDropdown(false)
    }

    // Si completa 8 (DNI) o 11 (RUC) digitos, buscar en BD local y luego API
    // IMPORTANTE: Si tiene 8 digitos pero empieza con "10" o "20", es un RUC en progreso, no buscar
    const esRucEnProgreso = value.length === 8 && (value.startsWith('10') || value.startsWith('20'))
    const debeBuscar = (value.length === 8 && !esRucEnProgreso) || value.length === 11

    if (debeBuscar) {
      const clienteLocal = clientes.find(c => c.documentoIdentidad === value)

      if (clienteLocal) {
        handleSeleccionarCliente(clienteLocal)
      } else {
        const result = value.length === 8
          ? await consultarDni(value, true)
          : await consultarRuc(value)
        if (result) {
          setNombreCompleto(result.nombre_completo || result.razon_social || result.nombre_o_razon_social || '')
          toast.success(value.length === 8 ? 'Datos obtenidos de RENIEC' : 'Datos obtenidos de SUNAT')
        } else {
          toast.info('Documento no encontrado. Ingrese los datos manualmente.')
        }
      }
      setShowDropdown(false)
    }
  }

  const handleSeleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente)
    setDocumento(cliente.documentoIdentidad)
    setNombreCompleto(cliente.nombreCompleto)
    setTelefono(formatTelefonoDisplay(cliente.telefono))
    setShowDropdown(false)
    setPuntosACanjear(0)
  }

  const handleLimpiarCliente = () => {
    setClienteSeleccionado(null)
    setDocumento('')
    setNombreCompleto('')
    setTelefono('')
    setPuntosACanjear(0)
    resetDocLookup()
  }

  const formatTelefonoDisplay = (tel) => {
    if (!tel) return ''
    const cleaned = tel.replace(/\D/g, '')
    let formatted = ''
    for (let i = 0; i < cleaned.length && i < 9; i++) {
      if (i > 0 && i % 3 === 0) formatted += ' '
      formatted += cleaned[i]
    }
    return formatted
  }

  const handleTelefonoChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 0 && value[0] !== '9') return
    value = value.slice(0, 9)

    let formatted = ''
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 3 === 0) formatted += ' '
      formatted += value[i]
    }
    setTelefono(formatted)
  }

  // Handler para RUC con auto-busqueda en SUNAT
  const handleRucChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11)
    setErrorBusquedaRuc('')
    setClienteFactura(prev => ({
      ...prev,
      ruc: value,
      razonSocial: '',
      direccion: ''
    }))

    // Auto-busqueda cuando se completa el RUC
    if (value.length === 11) {
      const result = await consultarRuc(value)
      if (result) {
        setErrorBusquedaRuc('')
        setClienteFactura(prev => ({
          ...prev,
          razonSocial: result.razon_social || result.nombre_o_razon_social || '',
          direccion: result.direccion || result.domicilio_fiscal || ''
        }))
        toast.success('Datos de empresa obtenidos de SUNAT')
      } else {
        setErrorBusquedaRuc('RUC no encontrado. Verifique que el numero sea correcto.')
      }
    }
  }

  // Calculos de precio y puntos
  const precioOriginal = parseFloat(rutaSeleccionada?.precioPasaje || 0)
  const puntosDisponibles = clienteSeleccionado?.puntosDisponibles || clienteSeleccionado?.puntos || 0
  const puntosACanjearFinal = Math.min(puntosACanjear, puntosDisponibles)
  const descuentoPuntos = puntosACanjearFinal / configPuntos.puntosPorSolDescuento
  const descuentoFinal = Math.min(descuentoPuntos, precioOriginal)
  const precioFinal = Math.max(0, precioOriginal - descuentoFinal)
  const puntosGanados = Math.floor(precioOriginal / configPuntos.solesPorPunto)

  // Validacion del formulario
  const formValido =
    idRuta &&
    (documento.length === 8 || documento.length === 11) &&
    nombreCompleto.trim() &&
    telefono.replace(/\s/g, '').length === 9 &&
    tipoDocumento &&
    (tipoDocumento !== 'FACTURA' || (clienteFactura.ruc.length === 11 && clienteFactura.razonSocial))

  // Handler de venta instantanea
  const handleVender = async () => {
    if (!formValido) return

    setLoading(true)

    try {
      const payload = {
        idRuta: parseInt(idRuta),
        pasajero: {
          nombreCompleto: nombreCompleto.trim(),
          documentoIdentidad: documento,
          tipoDocumento: documento.length === 11 ? '6' : '1',
          telefono: telefono.replace(/\s/g, ''),
          comentario: comentario.trim() || null
        },
        metodoPago,
        puntosACanjear: parseInt(puntosACanjear) || 0,
        tipoDocumento
      }

      // Agregar datos de factura si corresponde
      if (tipoDocumento === 'FACTURA') {
        payload.clienteFactura = clienteFactura
      }

      // Llamar al endpoint de venta instantanea
      const response = await ticketsService.venderInstantaneo(payload)

      toast.success('Venta instantanea realizada!')

      if (onVentaExitosa) {
        onVentaExitosa(response)
      }

      handleReset()
      onClose()

    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al realizar la venta')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setIdRuta('')
    setRutaSeleccionada(null)
    setDocumento('')
    setNombreCompleto('')
    setTelefono('')
    setClienteSeleccionado(null)
    setClientesFiltrados([])
    setShowDropdown(false)
    setMetodoPago('EFECTIVO')
    setPuntosACanjear(0)
    setComentario('')
    setTipoDocumento('')
    setClienteFactura({ ruc: '', razonSocial: '', direccion: '' })
    setErrorBusquedaRuc('')
    resetDocLookup()
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Venta Instantanea"
      description="Venta rapida con hora actual - sin horario predefinido"
      icon={Zap}
      iconColor="warning"
      size="lg"
      closeOnOverlay={false}
    >
      <div className="space-y-5">
        {/* Selector de Ruta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Seleccionar Ruta *
          </label>
          <select
            value={idRuta}
            onChange={(e) => setIdRuta(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-base"
          >
            <option value="">-- Seleccione una ruta --</option>
            {rutas.map(ruta => (
              <option key={ruta.id} value={ruta.id}>
                {ruta.puntoOrigen?.nombre} → {ruta.puntoDestino?.nombre} - S/ {parseFloat(ruta.precioPasaje).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        {/* Info de Hora Actual - Se muestra cuando hay ruta seleccionada */}
        {idRuta && (
          <div className="rounded-xl p-4 border-2 bg-amber-50 border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hora de venta</p>
                  <p className="text-2xl font-bold text-amber-700 font-mono">
                    {horaActual}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-semibold text-gray-800">{fechaHoy}</p>
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1 justify-end">
                  <Zap className="w-3 h-3" />
                  Venta instantanea
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Datos del Pasajero - Solo si hay ruta seleccionada */}
        {idRuta && (
          <>
            <div className="border-t pt-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Datos del Pasajero
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DNI/RUC con autocompletado */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DNI / RUC *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={documentoInputRef}
                      type="text"
                      value={documento}
                      onChange={handleDocumentoChange}
                      onFocus={() => {
                        if (documento.length >= 2) {
                          const filtrados = clientes.filter(c =>
                            c.documentoIdentidad.includes(documento)
                          ).slice(0, 5)
                          setClientesFiltrados(filtrados)
                          setShowDropdown(filtrados.length > 0)
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      placeholder="Ingrese DNI o RUC..."
                      maxLength={11}
                      inputMode="numeric"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    />
                    {buscandoDoc ? (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : clienteSeleccionado ? (
                      <button
                        type="button"
                        onClick={handleLimpiarCliente}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    ) : (
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Dropdown de clientes */}
                  {showDropdown && clientesFiltrados.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                      {clientesFiltrados.map((cliente) => (
                        <button
                          key={cliente.id}
                          type="button"
                          onClick={() => handleSeleccionarCliente(cliente)}
                          className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center gap-2 border-b border-gray-100 last:border-0"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {cliente.nombreCompleto}
                            </p>
                            <p className="text-xs text-gray-500">
                              DNI: {cliente.documentoIdentidad}
                            </p>
                          </div>
                          {cliente.puntosDisponibles > 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                              {cliente.puntosDisponibles} pts
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {clienteSeleccionado && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Cliente registrado
                    </p>
                  )}
                </div>

                {/* Telefono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefono *
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    placeholder="987 654 321"
                    maxLength={11}
                    inputMode="numeric"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Nombre Completo / Razon Social */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo / Razon Social *
                  </label>
                  <input
                    type="text"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    placeholder="Nombre del pasajero"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Comentarios (opcional) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comentarios (opcional)
                  </label>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Informacion adicional..."
                    rows={2}
                    maxLength={500}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Metodo de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metodo de Pago
              </label>
              <div className="flex gap-3">
                {['EFECTIVO', 'YAPE', 'TARJETA'].map(metodo => (
                  <label
                    key={metodo}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                      metodoPago === metodo
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value={metodo}
                      checked={metodoPago === metodo}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{metodo}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tipo de Comprobante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Comprobante *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'BOLETA', label: 'Boleta', icon: Receipt, desc: 'Electronica (SUNAT)' },
                  { value: 'FACTURA', label: 'Factura', icon: FileText, desc: 'Electronica (SUNAT)' },
                  { value: 'VERIFICACION', label: 'Verificacion', icon: FileText, desc: 'Documento interno' }
                ].map(tipo => (
                  <button
                    key={tipo.value}
                    type="button"
                    onClick={() => setTipoDocumento(tipo.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      tipoDocumento === tipo.value
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <tipo.icon className={`w-5 h-5 mx-auto mb-1 ${
                      tipoDocumento === tipo.value ? 'text-amber-600' : 'text-gray-500'
                    }`} />
                    <span className={`block text-sm font-medium ${
                      tipoDocumento === tipo.value ? 'text-amber-700' : 'text-gray-700'
                    }`}>{tipo.label}</span>
                    <span className="block text-[10px] text-gray-400 mt-0.5">{tipo.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Datos adicionales para Factura */}
            {tipoDocumento === 'FACTURA' && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Datos del Cliente (Factura)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">RUC *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={clienteFactura.ruc}
                        onChange={handleRucChange}
                        placeholder="20XXXXXXXXX"
                        maxLength={11}
                        inputMode="numeric"
                        className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none text-sm"
                      />
                      {buscandoDoc && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    {errorBusquedaRuc && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errorBusquedaRuc}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Razon Social *</label>
                    <input
                      type="text"
                      value={clienteFactura.razonSocial}
                      readOnly
                      placeholder="Se autocompleta con el RUC"
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Direccion Fiscal</label>
                    <input
                      type="text"
                      value={clienteFactura.direccion}
                      readOnly
                      placeholder="Se autocompleta con el RUC"
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Seccion de Puntos */}
            {clienteSeleccionado && puntosDisponibles > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-gray-900">Puntos Disponibles</span>
                  </div>
                  <span className="text-xl font-bold text-yellow-600">{puntosDisponibles} pts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={puntosACanjear}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0
                        setPuntosACanjear(Math.min(Math.max(0, value), puntosDisponibles))
                      }}
                      min="0"
                      max={puntosDisponibles}
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-center font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPuntosACanjear(puntosDisponibles)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                  >
                    Usar todos
                  </button>
                </div>
                {puntosACanjear > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-yellow-700">
                    <Gift className="w-4 h-4" />
                    <span>Descuento: <strong>S/ {descuentoFinal.toFixed(2)}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Resumen de Precio */}
            <div className="bg-gray-50 rounded-xl p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total a pagar</p>
                  {puntosACanjear > 0 && (
                    <p className="text-xs text-gray-400 line-through">
                      S/ {precioOriginal.toFixed(2)}
                    </p>
                  )}
                </div>
                <p className="text-3xl font-bold text-amber-600">
                  S/ {precioFinal.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>Ganara +{puntosGanados} puntos con esta compra</span>
              </div>
            </div>
          </>
        )}

        {/* Botones de Accion */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleVender}
            disabled={!formValido || loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Vender Ahora
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default VentaInstantaneaModal
