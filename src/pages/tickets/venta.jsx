/**
 * Venta de Tickets Page
 * Formulario de venta de pasajes
 */

import { useState, useEffect, useRef } from 'react'
import { TicketPrint, ComprobantePrint } from '../../components/common'
import rutasService from '../../services/rutasService'
import viajesService from '../../services/viajesService'
import ticketsService from '../../services/ticketsService'
import clientesService from '../../services/clientesService'
import configuracionService from '../../services/configuracionService'
import facturacionService from '../../services/facturacionService'
import { formatDateOnly, formatTimeOnly, getTodayInPeru, isBeforeToday } from '../../utils/dateUtils'
import useDocLookup from '../../hooks/useDocLookup'
import { VentaInstantaneaModal } from '../../components/tickets'
import {
  Ticket,
  Clock,
  User,
  Check,
  Printer,
  Search,
  ChevronDown,
  X,
  Star,
  Gift,
  FileText,
  Receipt,
  Building2,
  AlertCircle,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

const VentaTicketPage = () => {
  const [step, setStep] = useState(1) // 1: Seleccion, 2: Pasajero, 3: Confirmacion
  const [loading, setLoading] = useState(false)

  // Modal de Venta Instantanea
  const [showVentaInstantanea, setShowVentaInstantanea] = useState(false)

  // Datos para seleccion
  const [rutas, setRutas] = useState([])
  const [disponibilidad, setDisponibilidad] = useState(null)

  // Datos de clientes para autocompletado
  const [clientes, setClientes] = useState([])
  const [clientesFiltrados, setClientesFiltrados] = useState([])
  const [showClientesDropdown, setShowClientesDropdown] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const documentoInputRef = useRef(null)

  // Configuracion de puntos y canje
  const [configPuntos, setConfigPuntos] = useState({
    solesPorPunto: 10,
    puntosPorSolDescuento: 10
  })
  const [puntosACanjear, setPuntosACanjear] = useState(0)

  // Precio editado manualmente (null = usar calculado)
  const [precioManual, setPrecioManual] = useState(null)

  // Hook para auto-busqueda de DNI/RUC
  const { loading: buscandoDoc, consultarDni, consultarRuc, reset: resetDocLookup } = useDocLookup()
  const [errorBusquedaRuc, setErrorBusquedaRuc] = useState('')

  // Datos de empresa para impresión
  const [datosEmpresa, setDatosEmpresa] = useState(null)

  // Datos del formulario
  const [formData, setFormData] = useState({
    idRuta: '',
    fecha: getTodayInPeru(), // Usar hora de Perú para fecha correcta
    idHorario: '',
    pasajero: {
      nombreCompleto: '',
      documentoIdentidad: '',
      tipoDocumento: '1',  // '1' = DNI, '6' = RUC
      telefono: '',
      comentario: '',
      direccion: ''  // Dirección fiscal (solo para RUC)
    },
    metodoPago: 'EFECTIVO'
  })

  // Tipo de documento (obligatorio)
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [clienteFactura, setClienteFactura] = useState({
    ruc: '',
    razonSocial: '',
    direccion: ''
  })

  // Ticket vendido y comprobante interno
  const [ticketVendido, setTicketVendido] = useState(null)
  const [comprobanteVendido, setComprobanteVendido] = useState(null)

  useEffect(() => {
    cargarRutas()
    cargarClientes()
    cargarConfiguracionPuntos()
    // Cargar datos de empresa para impresión
    facturacionService.obtenerConfiguracion()
      .then(res => setDatosEmpresa(res.configuracion))
      .catch(() => {}) // Silenciar error si no hay configuración
  }, [])

  const cargarConfiguracionPuntos = async () => {
    try {
      const response = await configuracionService.obtener()
      const config = response.configuracion || response
      setConfigPuntos({
        solesPorPunto: parseFloat(config.solesPorPunto) || 10,
        puntosPorSolDescuento: parseFloat(config.puntosPorSolDescuento) || 10
      })
    } catch (error) {
      console.error('Error cargando configuracion de puntos:', error)
    }
  }

  useEffect(() => {
    if (formData.idRuta && formData.fecha) {
      cargarDisponibilidad()
    }
  }, [formData.idRuta, formData.fecha])

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

  const cargarDisponibilidad = async () => {
    // Validar que haya ruta y fecha antes de llamar a la API
    if (!formData.idRuta || !formData.fecha) {
      return
    }

    try {
      setLoading(true)
      const response = await viajesService.disponibilidad(formData.idRuta, formData.fecha)

      if (response?.horarios) {
        // Ordenar por hora usando UTC (así se almacenan los campos TIME)
        response.horarios.sort((a, b) => {
          const horaA = new Date(a.horaSalida)
          const horaB = new Date(b.horaSalida)
          const minutosA = horaA.getUTCHours() * 60 + horaA.getUTCMinutes()
          const minutosB = horaB.getUTCHours() * 60 + horaB.getUTCMinutes()
          return minutosA - minutosB
        })
      }

      setDisponibilidad(response)
    } catch (error) {
      console.error('Error cargando disponibilidad:', error)
      setDisponibilidad(null)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('pasajero.')) {
      const campo = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        pasajero: { ...prev.pasajero, [campo]: value }
      }))
    } else if (name === 'fecha') {
      // Validar que la fecha no sea anterior a hoy
      if (isBeforeToday(value)) {
        toast.error('No se puede seleccionar una fecha anterior a hoy')
        setFormData(prev => ({ ...prev, fecha: getTodayInPeru() }))
      } else {
        setFormData(prev => ({ ...prev, fecha: value }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Handler para Documento de Identidad - 8 digitos (DNI) o 11 digitos (RUC) con autocompletado
  const handleDocumentoChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11)

    // Detectar tipo de documento automaticamente
    let tipoDoc = '1'  // DNI por defecto
    if (value.length === 11) {
      tipoDoc = '6'  // RUC
    }

    setFormData(prev => ({
      ...prev,
      pasajero: {
        ...prev.pasajero,
        documentoIdentidad: value,
        tipoDocumento: tipoDoc
      }
    }))

    // Limpiar cliente seleccionado si el usuario edita manualmente
    setClienteSeleccionado(null)

    // Filtrar clientes por documento
    if (value.length >= 2) {
      const filtrados = clientes.filter(c =>
        c.documentoIdentidad.includes(value)
      ).slice(0, 5)
      setClientesFiltrados(filtrados)
      setShowClientesDropdown(filtrados.length > 0)
    } else {
      setClientesFiltrados([])
      setShowClientesDropdown(false)
    }

    // Si completa 8 (DNI) o 11 (RUC) digitos y no hay cliente local encontrado, buscar en API
    // IMPORTANTE: Si tiene 8 digitos pero empieza con "10" o "20", es un RUC en progreso, no buscar
    const esRucEnProgreso = value.length === 8 && (value.startsWith('10') || value.startsWith('20'))
    const debeBuscar = (value.length === 8 && !esRucEnProgreso) || value.length === 11

    if (debeBuscar) {
      const clienteLocal = clientes.find(c => c.documentoIdentidad === value)
      if (clienteLocal) {
        handleSeleccionarCliente(clienteLocal)
      } else {
        // Buscar en API segun longitud
        const result = value.length === 8
          ? await consultarDni(value, true)
          : await consultarRuc(value)

        if (result && !formData.pasajero.nombreCompleto) {
          // Extraer dirección con todas las variantes posibles de la API
          const direccionFiscal = result.direccion || result.direccion_completa || result.domicilio_fiscal || result.direccion_fiscal || result.domicilio || ''
          setFormData(prev => ({
            ...prev,
            pasajero: {
              ...prev.pasajero,
              nombreCompleto: result.nombre_completo || result.razon_social || result.nombre_o_razon_social || '',
              direccion: direccionFiscal  // Guardar dirección para RUC
            }
          }))
          toast.success(value.length === 8 ? 'Datos obtenidos de RENIEC' : 'Datos obtenidos de SUNAT')
        } else if (!result) {
          toast.info('Documento no encontrado. Ingrese los datos manualmente.')
        }
      }
    }
  }

  // Seleccionar cliente del dropdown y autocompletar datos
  const handleSeleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente)
    setFormData(prev => ({
      ...prev,
      pasajero: {
        nombreCompleto: cliente.nombreCompleto,
        documentoIdentidad: cliente.documentoIdentidad,
        telefono: formatTelefonoDisplay(cliente.telefono)
      }
    }))
    setShowClientesDropdown(false)
    setPuntosACanjear(0) // Resetear puntos al cambiar cliente
  }

  // Formatear telefono para mostrar (987 654 321)
  const formatTelefonoDisplay = (telefono) => {
    if (!telefono) return ''
    const cleaned = telefono.replace(/\D/g, '')
    let formatted = ''
    for (let i = 0; i < cleaned.length && i < 9; i++) {
      if (i > 0 && i % 3 === 0) formatted += ' '
      formatted += cleaned[i]
    }
    return formatted
  }

  // Limpiar seleccion de cliente
  const handleLimpiarCliente = () => {
    setClienteSeleccionado(null)
    setFormData(prev => ({
      ...prev,
      pasajero: {
        nombreCompleto: '',
        documentoIdentidad: '',
        telefono: ''
      }
    }))
    setShowClientesDropdown(false)
    setPuntosACanjear(0) // Resetear puntos al limpiar cliente
  }

  // Handler para Telefono - 9 numeros, empieza con 9, espacios cada 3
  const handleTelefonoChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')

    // Si el primer digito no es 9, no permitir
    if (value.length > 0 && value[0] !== '9') {
      return
    }

    // Limitar a 9 digitos
    value = value.slice(0, 9)

    // Formatear con espacios cada 3 digitos (987 654 321)
    let formatted = ''
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 3 === 0) {
        formatted += ' '
      }
      formatted += value[i]
    }

    setFormData(prev => ({
      ...prev,
      pasajero: { ...prev.pasajero, telefono: formatted }
    }))
  }

  const handleVender = async () => {
    try {
      setLoading(true)

      // Quitar espacios del telefono antes de enviar
      const pasajeroData = {
        ...formData.pasajero,
        telefono: formData.pasajero.telefono.replace(/\s/g, '')
      }

      const payload = {
        idRuta: parseInt(formData.idRuta),
        idHorario: parseInt(formData.idHorario),
        fechaViaje: formData.fecha,
        pasajero: pasajeroData,
        metodoPago: formData.metodoPago,
        puntosACanjear: parseInt(puntosACanjear) || 0,
        tipoDocumento,
        ...(precioManual !== null && { precioManual })
      }

      if (tipoDocumento === 'FACTURA') {
        payload.clienteFactura = clienteFactura
      }

      const response = await ticketsService.vender(payload)

      setTicketVendido(response.ticket)
      setComprobanteVendido(response.comprobante || null)
      toast.success('Pasaje vendido exitosamente')

      // Actualizar puntos del cliente en la lista local para ventas consecutivas
      if (response.ticket?.pasajero?.id) {
        const puntosActualizados = response.ticket.puntosDisponiblesCliente
        setClientes(prev => prev.map(c =>
          c.id === response.ticket.pasajero.id
            ? { ...c, puntosDisponibles: puntosActualizados, puntos: puntosActualizados }
            : c
        ))
      }

      // Recargar disponibilidad para actualizar cupos en tiempo real
      await cargarDisponibilidad()

      setStep(3)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al vender pasaje')
    } finally {
      setLoading(false)
    }
  }

  const nuevaVenta = async () => {
    // Guardar ruta y fecha actuales para mantener contexto
    const rutaActual = formData.idRuta
    const fechaActual = formData.fecha

    setFormData({
      idRuta: rutaActual,      // Mantener ruta seleccionada
      fecha: fechaActual,       // Mantener fecha seleccionada
      idHorario: '',            // Limpiar horario para nueva selección
      pasajero: {
        nombreCompleto: '',
        documentoIdentidad: '',
        tipoDocumento: '1',
        telefono: '',
        comentario: ''
      },
      metodoPago: 'EFECTIVO'
    })
    setTicketVendido(null)
    setComprobanteVendido(null)
    setClienteSeleccionado(null)
    setClientesFiltrados([])
    setShowClientesDropdown(false)
    setPuntosACanjear(0)
    setPrecioManual(null)
    setTipoDocumento('')
    setClienteFactura({ ruc: '', razonSocial: '', direccion: '' })
    setErrorBusquedaRuc('')
    setStep(1)

    // Forzar recarga de disponibilidad (el useEffect no se dispara porque ruta/fecha no cambian)
    if (rutaActual && fechaActual) {
      await cargarDisponibilidad()
    }
  }

  const horarioSeleccionado = disponibilidad?.horarios?.find(h => h.idHorario === parseInt(formData.idHorario))

  // Calcular precios con puntos
  const precioOriginal = parseFloat(disponibilidad?.ruta?.precioPasaje || 0)
  const puntosDisponiblesCliente = clienteSeleccionado?.puntosDisponibles || clienteSeleccionado?.puntos || 0
  const puntosACanjearFinal = Math.min(puntosACanjear, puntosDisponiblesCliente)
  const descuentoPuntos = puntosACanjearFinal / configPuntos.puntosPorSolDescuento
  const descuentoFinal = Math.min(descuentoPuntos, precioOriginal)
  const precioCalculado = Math.max(0, precioOriginal - descuentoFinal)
  const precioFinal = precioManual !== null ? precioManual : precioCalculado
  const puntosGanados = Math.floor(precioOriginal / configPuntos.solesPorPunto)

  // Handler para puntos a canjear
  const handlePuntosChange = (e) => {
    const value = parseInt(e.target.value) || 0
    const maxPuntos = puntosDisponiblesCliente
    setPuntosACanjear(Math.min(Math.max(0, value), maxPuntos))
  }

  const handleUsarTodosPuntos = () => {
    setPuntosACanjear(puntosDisponiblesCliente)
  }

  // Mapear datos del ticket vendido al formato del componente TicketPrint
  const ticketParaImprimir = ticketVendido ? {
    codigo: ticketVendido.codigoInterno,
    viaje: {
      origen: ticketVendido.viaje?.ruta?.puntoOrigen?.nombre,
      destino: ticketVendido.viaje?.ruta?.puntoDestino?.nombre,
      fecha: ticketVendido.viaje?.fechaServicio,
      hora: ticketVendido.horaVentaReal || ticketVendido.viaje?.horario?.horaSalida,
      precio: ticketVendido.viaje?.ruta?.precioPasaje
    },
    pasajero: {
      nombre: ticketVendido.pasajero?.nombreCompleto,
      documento: ticketVendido.pasajero?.documentoIdentidad,
      telefono: ticketVendido.pasajero?.telefono
    },
    comentario: ticketVendido.comentario,
    fechaVenta: ticketVendido.fechaVenta,
    agencia: ticketVendido.agencia || null
  } : null

  // Mapear datos del comprobante para impresion (Boleta, Factura o Verificacion)
  const comprobanteParaImprimir = comprobanteVendido ? {
    tipoDocumento: comprobanteVendido.tipoDocumento || comprobanteVendido.tipo,
    numeroCompleto: comprobanteVendido.numeroCompleto,
    clienteNombre: comprobanteVendido.clienteRazonSocial || ticketVendido?.pasajero?.nombreCompleto,
    clienteDocumento: comprobanteVendido.clienteNumDoc || ticketVendido?.pasajero?.documentoIdentidad,
    clienteDireccion: comprobanteVendido.clienteDireccion || '',
    total: comprobanteVendido.total,
    fechaEmision: comprobanteVendido.fechaEmision || ticketVendido?.fechaVenta,
    horaEmision: comprobanteVendido.horaEmision,
    agencia: comprobanteVendido.agencia || null,
    ruta: {
      origen: ticketVendido?.viaje?.ruta?.puntoOrigen?.nombre,
      destino: ticketVendido?.viaje?.ruta?.puntoDestino?.nombre
    },
    fecha: ticketVendido?.viaje?.fechaServicio,
    hora: ticketVendido?.horaVentaReal || ticketVendido?.viaje?.horario?.horaSalida,
    comentario: comprobanteVendido.comentario || ticketVendido?.comentario
  } : null

  // Control de impresion independiente
  const [printTarget, setPrintTarget] = useState(null) // 'ticket' | 'comprobante'

  // Callback cuando se completa una venta instantanea
  const handleVentaInstantaneaExitosa = async (response) => {
    // Mostrar el ticket vendido en el step 3
    setTicketVendido(response.ticket)
    setComprobanteVendido(response.comprobante || null)

    // Actualizar puntos del cliente en la lista local
    if (response.ticket?.pasajero?.id) {
      const puntosActualizados = response.ticket.puntosDisponiblesCliente
      setClientes(prev => prev.map(c =>
        c.id === response.ticket.pasajero.id
          ? { ...c, puntosDisponibles: puntosActualizados, puntos: puntosActualizados }
          : c
      ))
    }

    // Recargar disponibilidad
    await cargarDisponibilidad()

    // Ir al step de confirmacion
    setStep(3)
  }

  const handlePrintTicket = () => {
    setPrintTarget('ticket')
    setTimeout(() => {
      window.print()
      setPrintTarget(null)
    }, 100)
  }

  const handlePrintComprobante = () => {
    setPrintTarget('comprobante')
    setTimeout(() => {
      window.print()
      setPrintTarget(null)
    }, 100)
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Venta de Pasaje</h1>
            <p className="text-gray-500">Registrar nueva venta de pasaje</p>
          </div>
          <button
            onClick={() => setShowVentaInstantanea(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
          >
            <Zap className="w-5 h-5" />
            Venta Instantanea
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[
            { num: 1, label: 'Seleccion' },
            { num: 2, label: 'Pasajero' },
            { num: 3, label: 'Confirmacion' }
          ].map((s, index) => (
            <div key={s.num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step >= s.num ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {index < 2 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  step > s.num ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Seleccion de ruta y horario */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            {/* Ruta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ruta *
              </label>
              <select
                name="idRuta"
                value={formData.idRuta}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Seleccione una ruta</option>
                {rutas.map(ruta => (
                  <option key={ruta.id} value={ruta.id}>
                    {ruta.puntoOrigen?.nombre} → {ruta.puntoDestino?.nombre} ({ruta.tipoCarro?.nombre || 'Estándar'}) - S/ {parseFloat(ruta.precioPasaje).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Viaje *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                min={getTodayInPeru()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Horarios */}
            {disponibilidad && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horario *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {disponibilidad.horarios.map(horario => {
                    const hora = formatTimeOnly(horario.horaSalida, { hour12: false })
                    const disponible = horario.cuposDisponibles > 0 && horario.estado === 'ABIERTO'
                    const horarioPasado = horario.horarioPasado || horario.estado === 'CERRADO'

                    return (
                      <button
                        key={horario.idHorario}
                        type="button"
                        onClick={() => disponible && setFormData(prev => ({ ...prev, idHorario: horario.idHorario }))}
                        disabled={!disponible}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          formData.idHorario === horario.idHorario
                            ? 'border-blue-600 bg-blue-50'
                            : disponible
                            ? 'border-gray-200 hover:border-gray-300'
                            : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{hora}</span>
                        </div>
                        <p className={`text-xs mt-1 ${
                          horarioPasado ? 'text-gray-500' : horario.cuposDisponibles > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {horarioPasado ? 'Hora pasada' : `${horario.cuposDisponibles} disponibles`}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Info de precio */}
            {disponibilidad && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Precio del pasaje:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    S/ {parseFloat(disponibilidad.ruta.precioPasaje).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Button */}
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.idRuta || !formData.fecha || !formData.idHorario}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Datos del pasajero */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo / Razon Social *
                </label>
                <input
                  type="text"
                  name="pasajero.nombreCompleto"
                  value={formData.pasajero.nombreCompleto}
                  onChange={handleChange}
                  placeholder="Ej: Juan Perez Garcia"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Documento - Combobox con clientes registrados */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DNI / RUC *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={documentoInputRef}
                    type="text"
                    name="pasajero.documentoIdentidad"
                    value={formData.pasajero.documentoIdentidad}
                    onChange={handleDocumentoChange}
                    onFocus={() => {
                      if (formData.pasajero.documentoIdentidad.length >= 2) {
                        const filtrados = clientes.filter(c =>
                          c.documentoIdentidad.includes(formData.pasajero.documentoIdentidad)
                        ).slice(0, 5)
                        setClientesFiltrados(filtrados)
                        setShowClientesDropdown(filtrados.length > 0)
                      }
                    }}
                    onBlur={() => {
                      // Delay para permitir click en dropdown
                      setTimeout(() => setShowClientesDropdown(false), 200)
                    }}
                    placeholder="Buscar por DNI o RUC..."
                    maxLength={11}
                    inputMode="numeric"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                  {buscandoDoc ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
                {showClientesDropdown && clientesFiltrados.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {clientesFiltrados.map((cliente) => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => handleSeleccionarCliente(cliente)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {cliente.nombreCompleto}
                          </p>
                          <p className="text-xs text-gray-500">
                            {cliente.documentoIdentidad?.length === 11 ? 'RUC' : 'DNI'}: {cliente.documentoIdentidad} | Tel: {cliente.telefono || 'Sin tel.'}
                          </p>
                        </div>
                        {(cliente.puntosDisponibles > 0) && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                            {cliente.puntosDisponibles} pts
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {clienteSeleccionado ? (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Cliente registrado: {clienteSeleccionado.nombreCompleto}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">8 digitos (DNI) o 11 digitos (RUC)</p>
                )}
              </div>

              {/* Telefono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefono *
                </label>
                <input
                  type="text"
                  name="pasajero.telefono"
                  value={formData.pasajero.telefono}
                  onChange={handleTelefonoChange}
                  placeholder="Ej: 987 654 321"
                  maxLength={11}
                  inputMode="numeric"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">9 digitos, debe iniciar con 9</p>
              </div>
            </div>

            {/* Metodo de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metodo de Pago *
              </label>
              <div className="flex gap-4">
                {['EFECTIVO', 'YAPE', 'TARJETA'].map(metodo => (
                  <label key={metodo} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="metodoPago"
                      value={metodo}
                      checked={formData.metodoPago === metodo}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">{metodo}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Comentarios (opcional) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios (opcional)
              </label>
              <textarea
                name="pasajero.comentario"
                value={formData.pasajero.comentario || ''}
                onChange={handleChange}
                placeholder="Informacion adicional del pasajero..."
                rows={2}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Este comentario aparecera en el ticket y comprobante</p>
            </div>

            {/* Tipo de Comprobante (obligatorio) */}
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
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <tipo.icon className={`w-5 h-5 mx-auto mb-1 ${
                      tipoDocumento === tipo.value ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <span className={`block text-sm font-medium ${
                      tipoDocumento === tipo.value ? 'text-blue-700' : 'text-gray-700'
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
                        onChange={async (e) => {
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
                            // Si es el mismo RUC que el pasajero, usar esos datos
                            if (value === formData.pasajero.documentoIdentidad && formData.pasajero.nombreCompleto) {
                              setErrorBusquedaRuc('')
                              setClienteFactura(prev => ({
                                ...prev,
                                razonSocial: formData.pasajero.nombreCompleto,
                                direccion: formData.pasajero.direccion || ''  // Usar dirección guardada
                              }))
                            } else {
                              // Resetear el hook para permitir nueva consulta
                              resetDocLookup()
                              const result = await consultarRuc(value)
                              if (result) {
                                setErrorBusquedaRuc('')
                                // Extraer dirección con todas las variantes posibles de la API
                                const direccionFiscal = result.direccion || result.direccion_completa || result.domicilio_fiscal || result.direccion_fiscal || result.domicilio || ''
                                setClienteFactura(prev => ({
                                  ...prev,
                                  razonSocial: result.razon_social || result.nombre_o_razon_social || '',
                                  direccion: direccionFiscal
                                }))
                              } else {
                                setErrorBusquedaRuc('RUC no encontrado. Verifique que el número sea correcto.')
                              }
                            }
                          }
                        }}
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
                      onChange={(e) => setClienteFactura(prev => ({
                        ...prev,
                        razonSocial: e.target.value
                      }))}
                      placeholder="Nombre de la empresa"
                      readOnly
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none text-sm bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Se autocompleta con los datos del RUC</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Direccion Fiscal</label>
                    <input
                      type="text"
                      value={clienteFactura.direccion}
                      onChange={(e) => setClienteFactura(prev => ({
                        ...prev,
                        direccion: e.target.value
                      }))}
                      placeholder="Direccion de la empresa"
                      readOnly
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none text-sm bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Se autocompleta con los datos del RUC</p>
                  </div>
                </div>
              </div>
            )}

            {/* Seccion de Puntos - solo si hay cliente seleccionado */}
            {clienteSeleccionado && puntosDisponiblesCliente > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-gray-900">Puntos Disponibles</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">{puntosDisponiblesCliente} pts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Puntos a canjear:</label>
                    <input
                      type="number"
                      value={puntosACanjear}
                      onChange={handlePuntosChange}
                      min="0"
                      max={puntosDisponiblesCliente}
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-center font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUsarTodosPuntos}
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

            {/* Resumen */}
            <div className={`rounded-lg p-4 space-y-2 ${precioManual !== null ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
              <h3 className="font-medium text-gray-900">Resumen</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Ruta:</span>
                <span className="text-gray-900">
                  {disponibilidad?.ruta?.origen?.nombre} → {disponibilidad?.ruta?.destino?.nombre}
                </span>
                <span className="text-gray-500">Fecha:</span>
                <span className="text-gray-900">{formData.fecha}</span>
                <span className="text-gray-500">Hora:</span>
                <span className="text-gray-900">
                  {horarioSeleccionado && formatTimeOnly(horarioSeleccionado.horaSalida, { hour12: false })}
                </span>
                <span className="text-gray-500">Precio Original:</span>
                <span className={`text-gray-900 ${(puntosACanjear > 0 || precioManual !== null) ? 'line-through text-gray-400' : 'text-xl font-bold text-blue-600'}`}>
                  S/ {precioOriginal.toFixed(2)}
                </span>
                {puntosACanjear > 0 && precioManual === null && (
                  <>
                    <span className="text-gray-500">Descuento Puntos:</span>
                    <span className="text-green-600 font-medium">- S/ {descuentoFinal.toFixed(2)}</span>
                  </>
                )}
                <span className="text-gray-500">Total a Pagar:</span>
                <span className="flex items-center gap-1">
                  <span className="text-lg font-bold text-gray-500">S/</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={precioManual !== null ? precioManual : precioFinal.toFixed(2)}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '')
                      const parts = val.split('.')
                      const sanitized = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '')
                      setPrecioManual(sanitized === '' ? 0 : sanitized)
                    }}
                    onBlur={() => {
                      if (precioManual !== null) {
                        const num = parseFloat(precioManual)
                        if (isNaN(num) || num < 0) {
                          setPrecioManual(null)
                        } else {
                          setPrecioManual(parseFloat(num.toFixed(2)))
                        }
                      }
                    }}
                    className={`w-28 text-right text-xl font-bold bg-transparent border-b-2 border-dashed outline-none ${
                      precioManual !== null
                        ? 'text-blue-600 border-blue-400'
                        : 'text-blue-600 border-transparent hover:border-gray-300 focus:border-blue-400'
                    }`}
                  />
                </span>
                {precioManual !== null && (
                  <>
                    <span></span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Precio editado
                      </span>
                      <button
                        type="button"
                        onClick={() => setPrecioManual(null)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Restaurar
                      </button>
                    </span>
                  </>
                )}
                <span className="text-gray-500 flex items-center gap-1">
                  <Star className="w-3 h-3" /> Puntos a ganar:
                </span>
                <span className="text-yellow-600 font-semibold">+{puntosGanados} puntos</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Atras
              </button>
              <button
                onClick={handleVender}
                disabled={
                  loading ||
                  !formData.pasajero.nombreCompleto ||
                  (formData.pasajero.documentoIdentidad.length !== 8 && formData.pasajero.documentoIdentidad.length !== 11) ||
                  formData.pasajero.telefono.replace(/\s/g, '').length !== 9 ||
                  !tipoDocumento ||
                  (tipoDocumento === 'FACTURA' && (clienteFactura.ruc.length !== 11 || !clienteFactura.razonSocial))
                }
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Ticket className="w-5 h-5" />
                    Vender Pasaje
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmacion */}
        {step === 3 && ticketVendido && (
          <>
            {/* Contenido visible en pantalla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center no-print">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Venta Exitosa!</h2>
              <p className="text-gray-500 mb-6">El pasaje ha sido emitido correctamente</p>

              {/* Vista previa del ticket en pantalla */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6 max-w-md mx-auto text-left">
                <div className="text-center mb-4">
                  <span className="text-xs text-gray-500">Codigo de Ticket</span>
                  <p className="text-2xl font-mono font-bold text-gray-900">
                    {ticketVendido.codigoInterno}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pasajero:</span>
                    <span className="text-gray-900">{ticketVendido.pasajero?.nombreCompleto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Documento:</span>
                    <span className="text-gray-900">{ticketVendido.pasajero?.documentoIdentidad}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ruta:</span>
                    <span className="text-gray-900">
                      {ticketVendido.viaje?.ruta?.puntoOrigen?.nombre} → {ticketVendido.viaje?.ruta?.puntoDestino?.nombre}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha:</span>
                    <span className="text-gray-900">
                      {formatDateOnly(ticketVendido.viaje?.fechaServicio)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hora:</span>
                    <span className="text-gray-900">
                      {formatTimeOnly(ticketVendido.horaVentaReal || ticketVendido.viaje?.horario?.horaSalida, { hour12: false })}
                    </span>
                  </div>
                </div>

                {/* Seccion de Puntos */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-gray-900 text-sm">Programa de Puntos</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {/* Puntos acumulados del cliente */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Puntos acumulados:</span>
                      <span className="text-gray-900 font-medium">
                        {ticketVendido.puntosAcumuladosCliente ?? ticketVendido.pasajero?.puntos_historicos ?? 0} pts
                      </span>
                    </div>
                    {/* Puntos ganados en esta compra */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Puntos ganados:</span>
                      <span className="text-green-600 font-semibold">
                        +{ticketVendido.puntosGanados ?? 0} pts
                      </span>
                    </div>
                    {/* Descuento por puntos usados */}
                    {ticketVendido.puntosUsados > 0 && (
                      <div className="flex justify-between items-center bg-yellow-50 -mx-2 px-2 py-1.5 rounded">
                        <span className="text-yellow-700 flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          Descuento por puntos:
                        </span>
                        <span className="text-yellow-700 font-semibold">
                          -{ticketVendido.puntosUsados} pts = S/ {ticketVendido.descuentoPuntos?.toFixed(2) ?? '0.00'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Comprobante generado */}
              {comprobanteVendido && (
                <div className="bg-green-50 rounded-xl p-4 mb-6 max-w-md mx-auto text-left border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900 text-sm">
                      {comprobanteVendido.tipoDocumento === 'FACTURA' ? 'Factura' :
                       comprobanteVendido.tipoDocumento === 'BOLETA' ? 'Boleta' : 'Nota de Venta'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Numero:</span>
                      <span className="text-gray-900 font-mono font-medium">
                        {comprobanteVendido.numeroCompleto}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total:</span>
                      <span className="text-gray-900 font-medium">
                        S/ {parseFloat(comprobanteVendido.total || 0).toFixed(2)}
                      </span>
                    </div>
                    {comprobanteVendido.agencia && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Agencia:</span>
                        <span className="text-gray-900 font-medium">{comprobanteVendido.agencia.nombre}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button
                  onClick={handlePrintTicket}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Ticket
                </button>
                {comprobanteParaImprimir && (
                  <button
                    onClick={handlePrintComprobante}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-green-300 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Imprimir Comprobante
                  </button>
                )}
                <button
                  onClick={nuevaVenta}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Nueva Venta
                </button>
              </div>
            </div>

            {/* Areas de impresion independientes - Solo visible al imprimir */}
            <div className={printTarget === 'ticket' ? 'print-area' : 'hidden'}>
              <TicketPrint ticket={ticketParaImprimir} empresa={datosEmpresa} />
            </div>
            {comprobanteParaImprimir && (
              <div className={printTarget === 'comprobante' ? 'print-area' : 'hidden'}>
                <ComprobantePrint comprobante={comprobanteParaImprimir} empresa={datosEmpresa} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Venta Instantanea */}
      <VentaInstantaneaModal
        isOpen={showVentaInstantanea}
        onClose={() => setShowVentaInstantanea(false)}
        onVentaExitosa={handleVentaInstantaneaExitosa}
      />
    </>
  )
}

export default VentaTicketPage
