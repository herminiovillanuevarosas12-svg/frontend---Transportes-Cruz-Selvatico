/**
 * Registro de Encomienda Page
 * Formulario para registrar nueva encomienda
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, QRGenerator, ClienteCombobox, ComprobantePrint, Combobox } from '../../components/common'
import { formatTimestamp } from '../../utils/dateUtils'
import puntosService from '../../services/puntosService'
import encomiendasService from '../../services/encomiendasService'
import configuracionService from '../../services/configuracionService'
import facturacionService from '../../services/facturacionService'
import clientesService from '../../services/clientesService'
import configTiposPaqueteService from '../../services/configTiposPaqueteService'
import preciosBaseService from '../../services/preciosBaseService'
import useDocLookup from '../../hooks/useDocLookup'
import {
  Package,
  User,
  MapPin,
  FileText,
  DollarSign,
  Check,
  Printer,
  ArrowLeft,
  Box,
  Star,
  Gift,
  Receipt,
  Building2,
  AlertCircle,
  Lock
} from 'lucide-react'
import toast from 'react-hot-toast'

const RegistroEncomiendaPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Datos, 2: Confirmacion
  const [loading, setLoading] = useState(false)
  const [puntos, setPuntos] = useState([])
  const [configPrecios, setConfigPrecios] = useState(null)
  const [tiposPaquete, setTiposPaquete] = useState([])
  const [tipoPaqueteSeleccionadoId, setTipoPaqueteSeleccionadoId] = useState('')
  const [preciosBase, setPreciosBase] = useState([])
  const [idPrecioBaseSeleccionado, setIdPrecioBaseSeleccionado] = useState('')

  // Sistema de puntos
  const [configPuntos, setConfigPuntos] = useState({
    solesPorPunto: 10,
    puntosPorSolDescuento: 10
  })
  const [politicasEncomienda, setPoliticasEncomienda] = useState('')
  const [clienteEncontrado, setClienteEncontrado] = useState(null)
  const [destinatarioEncontrado, setDestinatarioEncontrado] = useState(null)
  const [buscandoCliente, setBuscandoCliente] = useState(false)
  const [puntosACanjear, setPuntosACanjear] = useState(0)

  // Datos del formulario
  const [formData, setFormData] = useState({
    idPuntoOrigen: '',
    idPuntoDestino: '',
    // Remitente
    remitenteNombre: '',
    remitenteDni: '',
    remitenteTelefono: '',
    // Destinatario
    destinatarioNombre: '',
    destinatarioDni: '',
    destinatarioTelefono: '',
    // Paquete
    tipoPaquete: '',
    descripcion: '',
    peso: '',
    alto: '',
    ancho: '',
    largo: '',
    // Comentario
    comentario: ''
  })

  // Tipo de documento (obligatorio)
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [clienteFactura, setClienteFactura] = useState({
    ruc: '',
    razonSocial: '',
    direccion: ''
  })

  // Encomienda registrada y comprobante
  const [encomiendaRegistrada, setEncomiendaRegistrada] = useState(null)
  const [comprobanteRegistrado, setComprobanteRegistrado] = useState(null)
  const [printTarget, setPrintTarget] = useState(null) // 'guia' | 'comprobante'

  // Hook para auto-busqueda de DNI/RUC
  const { loading: buscandoDoc, consultarDni, consultarRuc, reset: resetDocLookup } = useDocLookup()
  const [errorBusquedaRuc, setErrorBusquedaRuc] = useState('')
  const [errorBusquedaDestinatario, setErrorBusquedaDestinatario] = useState('')
  const [buscandoDestinatario, setBuscandoDestinatario] = useState(false)

  // Datos de empresa para impresión
  const [datosEmpresa, setDatosEmpresa] = useState(null)

  // Pago al recojo y clave de seguridad
  const [pagoAlRecojo, setPagoAlRecojo] = useState(false)
  const [claveSeguridad, setClaveSeguridad] = useState('')
  const [confirmarClave, setConfirmarClave] = useState('')

  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  const cargarDatosIniciales = async () => {
    try {
      const [puntosRes, configRes, configSistemaRes, configSunatRes, tiposPaqueteRes, preciosBaseRes] = await Promise.all([
        puntosService.listar(),
        configuracionService.obtenerPreciosEncomienda().catch(() => null),
        configuracionService.obtener().catch(() => null),
        facturacionService.obtenerConfiguracion().catch(() => null),
        configTiposPaqueteService.listarActivos().catch(() => ({ configuraciones: [] })),
        preciosBaseService.listar().catch(() => ({ preciosBase: [] }))
      ])
      if (configSunatRes?.configuracion) {
        setDatosEmpresa(configSunatRes.configuracion)
      }
      setPuntos(puntosRes.puntos || [])
      setTiposPaquete(tiposPaqueteRes.configuraciones || [])
      const listaPreciosBase = preciosBaseRes.preciosBase || []
      setPreciosBase(listaPreciosBase)
      if (listaPreciosBase.length > 0) {
        setIdPrecioBaseSeleccionado(listaPreciosBase[0].id.toString())
      }
      if (configRes?.configuracion) {
        setConfigPrecios(configRes.configuracion)
      }
      if (configSistemaRes?.configuracion) {
        const config = configSistemaRes.configuracion
        setConfigPuntos({
          solesPorPunto: parseFloat(config.solesPorPunto) || 10,
          puntosPorSolDescuento: parseFloat(config.puntosPorSolDescuento) || 10
        })
        if (config.politicasEncomienda) {
          setPoliticasEncomienda(config.politicasEncomienda)
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar datos iniciales')
    }
  }

  // Calcular precio en tiempo real
  const calcularPrecio = () => {
    if (!configPrecios) return null
    if (!idPrecioBaseSeleccionado) return null

    const precioBaseObj = preciosBase.find(pb => pb.id.toString() === idPrecioBaseSeleccionado)
    if (!precioBaseObj) return null

    const peso = parseFloat(formData.peso) || 0
    const alto = parseFloat(formData.alto) || 0
    const ancho = parseFloat(formData.ancho) || 0
    const largo = parseFloat(formData.largo) || 0

    // Solo calcular si todos los valores son mayores a 0
    if (peso <= 0 || alto <= 0 || ancho <= 0 || largo <= 0) return null

    const volumen = alto * ancho * largo
    const precio =
      parseFloat(precioBaseObj.monto) +
      (peso * parseFloat(configPrecios.precioPorKg)) +
      (volumen * parseFloat(configPrecios.precioPorCm3))

    return Math.round(precio * 100) / 100
  }

  const precioCalculado = calcularPrecio()

  // Calculos de puntos
  const puntosDisponiblesCliente = clienteEncontrado?.puntosDisponibles || clienteEncontrado?.puntos || 0
  const puntosACanjearFinal = Math.min(puntosACanjear, puntosDisponiblesCliente)
  const descuentoPuntos = puntosACanjearFinal / configPuntos.puntosPorSolDescuento
  const descuentoFinal = precioCalculado ? Math.min(descuentoPuntos, precioCalculado) : 0
  const precioFinalConDescuento = precioCalculado ? Math.max(0, precioCalculado - descuentoFinal) : null
  const puntosGanados = precioCalculado ? Math.floor(precioCalculado / configPuntos.solesPorPunto) : 0

  // Handler para puntos a canjear
  const handlePuntosChange = (e) => {
    const value = parseInt(e.target.value) || 0
    const maxPuntos = puntosDisponiblesCliente
    setPuntosACanjear(Math.min(Math.max(0, value), maxPuntos))
  }

  const handleUsarTodosPuntos = () => {
    setPuntosACanjear(puntosDisponiblesCliente)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    // Si se cambia el origen y coincide con el destino actual, limpiar destino
    if (name === 'idPuntoOrigen' && value === formData.idPuntoDestino) {
      setFormData(prev => ({ ...prev, [name]: value, idPuntoDestino: '' }))
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handler para cambio de tipo de paquete con autocompletado de dimensiones
  const handleTipoPaqueteChange = (e) => {
    const selectedId = e.target.value
    setTipoPaqueteSeleccionadoId(selectedId)

    if (!selectedId) {
      setFormData(prev => ({ ...prev, tipoPaquete: '' }))
      return
    }

    const tipoSeleccionado = tiposPaquete.find(t => t.id.toString() === selectedId)

    if (tipoSeleccionado) {
      // Autocompletar dimensiones solo si hay valores default > 0
      const updates = {
        tipoPaquete: tipoSeleccionado.tipo_paquete
      }

      if (tipoSeleccionado.alto_default > 0) {
        updates.alto = tipoSeleccionado.alto_default.toString()
      }
      if (tipoSeleccionado.ancho_default > 0) {
        updates.ancho = tipoSeleccionado.ancho_default.toString()
      }
      if (tipoSeleccionado.largo_default > 0) {
        updates.largo = tipoSeleccionado.largo_default.toString()
      }

      setFormData(prev => ({ ...prev, ...updates }))
    }
  }

  // Opciones formateadas para el Combobox de tipos de paquete
  const tiposPaqueteOptions = tiposPaquete.map(tipo => ({
    value: tipo.id.toString(),
    label: tipo.nombre_display
  }))

  // Manejar cambio de DNI/RUC (8 o 11 numeros) y buscar cliente
  const handleDniChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11)
    setFormData(prev => ({ ...prev, remitenteDni: value }))

    // Si se limpió el DNI/RUC, limpiar cliente encontrado y nombre
    if (value.length < 8) {
      setClienteEncontrado(null)
      setPuntosACanjear(0)
      setFormData(prev => ({ ...prev, remitenteDni: value, remitenteNombre: '' }))
      return
    }

    // Buscar cliente cuando se completan 8 (DNI) o 11 (RUC) digitos
    // IMPORTANTE: Si tiene 8 digitos pero empieza con "10" o "20", es un RUC en progreso, no buscar
    const esRucEnProgreso = value.length === 8 && (value.startsWith('10') || value.startsWith('20'))
    const debeBuscar = (value.length === 8 && !esRucEnProgreso) || value.length === 11

    if (debeBuscar) {
      setBuscandoCliente(true)
      // Resetear el hook para permitir consultas repetidas
      resetDocLookup()
      try {
        // Solo buscar en BD local si es DNI (8 dígitos)
        // El endpoint /clientes/dni solo acepta DNI, no RUC
        if (value.length === 8) {
          const response = await clientesService.obtenerPorDni(value)
          if (response.cliente) {
            setClienteEncontrado(response.cliente)
            // Autocompletar nombre y teléfono (siempre sobreescribir)
            setFormData(prev => ({
              ...prev,
              remitenteNombre: response.cliente.nombreCompleto,
              remitenteTelefono: formatTelefono(response.cliente.telefono || '')
            }))
            setBuscandoCliente(false)
            return
          }
        }
        // Si es RUC (11 dígitos) o DNI no encontrado en BD local, buscar en API Peru
        setClienteEncontrado(null)
        const result = value.length === 8
          ? await consultarDni(value, true)
          : await consultarRuc(value)
        if (result) {
          // Siempre sobreescribir el nombre con el resultado de la API
          setFormData(prev => ({
            ...prev,
            remitenteNombre: result.nombre_completo || result.razon_social || result.nombre_o_razon_social || ''
          }))
        }
      } catch (error) {
        // Cliente no encontrado en BD local, buscar en API Peru como fallback
        setClienteEncontrado(null)
        const result = value.length === 8
          ? await consultarDni(value, true)
          : await consultarRuc(value)
        if (result) {
          // Siempre sobreescribir el nombre con el resultado de la API
          setFormData(prev => ({
            ...prev,
            remitenteNombre: result.nombre_completo || result.razon_social || result.nombre_o_razon_social || ''
          }))
        }
      } finally {
        setBuscandoCliente(false)
      }
    }
  }

  // Formatear telefono: 999 999 999
  const formatTelefono = (value) => {
    // Remover todo excepto numeros
    let numeros = value.replace(/\D/g, '')

    // Si el primer digito no es 9, no permitir
    if (numeros.length > 0 && numeros[0] !== '9') {
      numeros = '9' + numeros.slice(1)
    }

    // Limitar a 9 digitos
    numeros = numeros.slice(0, 9)

    // Formatear con espacios cada 3 digitos
    let formateado = ''
    for (let i = 0; i < numeros.length; i++) {
      if (i > 0 && i % 3 === 0) {
        formateado += ' '
      }
      formateado += numeros[i]
    }

    return formateado
  }

  // Manejar cambio de telefono remitente
  const handleTelefonoRemitenteChange = (e) => {
    const formateado = formatTelefono(e.target.value)
    setFormData(prev => ({ ...prev, remitenteTelefono: formateado }))
  }

  // Manejar cambio de telefono destinatario
  const handleTelefonoDestinatarioChange = (e) => {
    const formateado = formatTelefono(e.target.value)
    setFormData(prev => ({ ...prev, destinatarioTelefono: formateado }))
  }

  const validarFormulario = () => {
    const requeridos = [
      { campo: 'idPuntoOrigen', nombre: 'Punto de origen' },
      { campo: 'idPuntoDestino', nombre: 'Punto de destino' },
      { campo: 'remitenteNombre', nombre: 'Nombre del remitente' },
      { campo: 'remitenteDni', nombre: 'DNI del remitente' },
      { campo: 'remitenteTelefono', nombre: 'Telefono del remitente' },
      { campo: 'destinatarioDni', nombre: 'DNI del destinatario' },
      { campo: 'destinatarioNombre', nombre: 'Nombre del destinatario' },
      { campo: 'destinatarioTelefono', nombre: 'Telefono del destinatario' },
      { campo: 'tipoPaquete', nombre: 'Tipo de paquete' },
      { campo: 'peso', nombre: 'Peso' },
      { campo: 'alto', nombre: 'Alto' },
      { campo: 'ancho', nombre: 'Ancho' },
      { campo: 'largo', nombre: 'Largo' }
    ]

    for (const { campo, nombre } of requeridos) {
      if (!formData[campo]) {
        toast.error(`El campo "${nombre}" es requerido`)
        return false
      }
    }

    if (formData.idPuntoOrigen === formData.idPuntoDestino) {
      toast.error('El origen y destino deben ser diferentes')
      return false
    }

    // Validar DNI/RUC remitente (8 o 11 digitos)
    if (formData.remitenteDni.length !== 8 && formData.remitenteDni.length !== 11) {
      toast.error('El DNI debe tener 8 digitos o el RUC debe tener 11 digitos')
      return false
    }

    // Validar DNI/RUC destinatario (8 o 11 digitos)
    if (formData.destinatarioDni.length !== 8 && formData.destinatarioDni.length !== 11) {
      toast.error('El DNI debe tener 8 digitos o el RUC debe tener 11 digitos')
      return false
    }

    // Validar telefonos (9 digitos, formato: 999 999 999)
    const telefonoRemitente = formData.remitenteTelefono.replace(/\s/g, '')
    const telefonoDestinatario = formData.destinatarioTelefono.replace(/\s/g, '')

    if (telefonoRemitente.length !== 9 || !telefonoRemitente.startsWith('9')) {
      toast.error('El telefono del remitente debe tener 9 digitos y empezar con 9')
      return false
    }

    if (telefonoDestinatario.length !== 9 || !telefonoDestinatario.startsWith('9')) {
      toast.error('El telefono del destinatario debe tener 9 digitos y empezar con 9')
      return false
    }

    if (parseFloat(formData.peso) <= 0 || parseFloat(formData.alto) <= 0 ||
        parseFloat(formData.ancho) <= 0 || parseFloat(formData.largo) <= 0) {
      toast.error('Peso y dimensiones deben ser mayores a 0')
      return false
    }

    if (!idPrecioBaseSeleccionado) {
      toast.error('Debe seleccionar un precio base')
      return false
    }

    // Validar tipo de documento - solo si NO es pago al recojo
    if (!pagoAlRecojo) {
      if (!tipoDocumento || !['BOLETA', 'FACTURA', 'VERIFICACION'].includes(tipoDocumento)) {
        toast.error('Debe seleccionar un tipo de comprobante')
        return false
      }
    }

    // Validar datos de factura (solo si se selecciono factura y NO es pago al recojo)
    if (!pagoAlRecojo && tipoDocumento === 'FACTURA') {
      if (!clienteFactura.ruc || clienteFactura.ruc.length !== 11) {
        toast.error('El RUC debe tener 11 digitos')
        return false
      }
      if (!clienteFactura.razonSocial) {
        toast.error('La razon social es requerida para factura')
        return false
      }
    }

    // Validar clave de seguridad (debe ser 4 digitos y coincidir)
    if (claveSeguridad) {
      if (!/^\d{4}$/.test(claveSeguridad)) {
        toast.error('La clave de seguridad debe tener exactamente 4 digitos')
        return false
      }
      if (claveSeguridad !== confirmarClave) {
        toast.error('Las claves de seguridad no coinciden')
        return false
      }
    }

    return true
  }

  const handleRegistrar = async () => {
    if (!validarFormulario()) return

    try {
      setLoading(true)

      const payload = {
        idPuntoOrigen: parseInt(formData.idPuntoOrigen),
        idPuntoDestino: parseInt(formData.idPuntoDestino),
        remitente: {
          nombre: formData.remitenteNombre,
          dni: formData.remitenteDni,
          tipoDocumento: formData.remitenteDni.length === 11 ? '6' : '1',
          telefono: formData.remitenteTelefono.replace(/\s/g, '')
        },
        destinatario: {
          nombre: formData.destinatarioNombre,
          dni: formData.destinatarioDni || null,
          tipoDocumento: formData.destinatarioDni?.length === 11 ? '6' : '1',
          telefono: formData.destinatarioTelefono.replace(/\s/g, '')
        },
        paquete: {
          tipo: formData.tipoPaquete,
          descripcion: formData.descripcion || null,
          peso: parseFloat(formData.peso),
          alto: parseFloat(formData.alto),
          ancho: parseFloat(formData.ancho),
          largo: parseFloat(formData.largo)
        },
        comentario: formData.comentario.trim() || null,
        puntosACanjear: parseInt(puntosACanjear) || 0,
        // Si es pago al recojo, forzar VERIFICACION; sino usar el tipo seleccionado
        tipoDocumento: pagoAlRecojo ? 'VERIFICACION' : tipoDocumento,
        pagoAlRecojo,
        claveSeguridad: claveSeguridad || null,
        idPrecioBase: parseInt(idPrecioBaseSeleccionado)
      }

      // Datos de factura: solo si NO es pago al recojo y se selecciono factura
      if (!pagoAlRecojo && tipoDocumento === 'FACTURA') {
        payload.clienteFactura = clienteFactura
      }

      const response = await encomiendasService.registrar(payload)
      setEncomiendaRegistrada(response.encomienda)
      setComprobanteRegistrado(response.comprobante || null)
      toast.success('Encomienda registrada exitosamente')
      setStep(2)
    } catch (error) {
      console.error('Error registrando encomienda:', error)
      toast.error(error.response?.data?.error || 'Error al registrar encomienda')
    } finally {
      setLoading(false)
    }
  }

  const handlePrintGuia = () => {
    setPrintTarget('guia')
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

  const nuevaEncomienda = () => {
    setFormData({
      idPuntoOrigen: '',
      idPuntoDestino: '',
      remitenteNombre: '',
      remitenteDni: '',
      remitenteTelefono: '',
      destinatarioNombre: '',
      destinatarioDni: '',
      destinatarioTelefono: '',
      tipoPaquete: '',
      descripcion: '',
      peso: '',
      alto: '',
      ancho: '',
      largo: '',
      comentario: ''
    })
    setEncomiendaRegistrada(null)
    setComprobanteRegistrado(null)
    setClienteEncontrado(null)
    setDestinatarioEncontrado(null)
    setPuntosACanjear(0)
    setTipoDocumento('')
    setClienteFactura({ ruc: '', razonSocial: '', direccion: '' })
    setErrorBusquedaRuc('')
    setErrorBusquedaDestinatario('')
    setPagoAlRecojo(false)
    setClaveSeguridad('')
    setConfirmarClave('')
    setTipoPaqueteSeleccionadoId('')
    setStep(1)
  }

  return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate('/encomiendas')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors print:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Registro de Encomienda</h1>
              <p className="text-gray-500">Registrar nueva encomienda para envio</p>
            </div>
          </div>
        </div>

        {/* Step 1: Formulario */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Origen y Destino */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Ruta de Envio</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Punto de Origen *
                  </label>
                  <select
                    name="idPuntoOrigen"
                    value={formData.idPuntoOrigen}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Seleccione origen</option>
                    {puntos.map(punto => (
                      <option key={punto.id} value={punto.id}>
                        {punto.nombre} ({punto.ciudad})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Punto de Destino *
                  </label>
                  <select
                    name="idPuntoDestino"
                    value={formData.idPuntoDestino}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Seleccione destino</option>
                    {puntos
                      .filter(punto => punto.id.toString() !== formData.idPuntoOrigen)
                      .map(punto => (
                        <option key={punto.id} value={punto.id}>
                          {punto.nombre} ({punto.ciudad})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Remitente */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Datos del Remitente</h3>
              </div>

              {/* Busqueda de Cliente */}
              <div className="mb-4">
                <ClienteCombobox
                  label="Buscar Cliente (DNI o Nombre)"
                  value={clienteEncontrado}
                  onChange={(cliente) => {
                    setClienteEncontrado(cliente)
                    setFormData(prev => ({
                      ...prev,
                      remitenteNombre: cliente.nombreCompleto,
                      remitenteDni: cliente.documentoIdentidad,
                      remitenteTelefono: formatTelefono(cliente.telefono || '')
                    }))
                    setPuntosACanjear(0)
                  }}
                  onClear={() => {
                    setClienteEncontrado(null)
                    setFormData(prev => ({
                      ...prev,
                      remitenteNombre: '',
                      remitenteDni: '',
                      remitenteTelefono: ''
                    }))
                    setPuntosACanjear(0)
                  }}
                  placeholder="Buscar por DNI o nombre del cliente..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si el cliente no existe, complete los datos manualmente abajo
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo / Razon Social *
                  </label>
                  <input
                    type="text"
                    name="remitenteNombre"
                    value={formData.remitenteNombre}
                    onChange={handleChange}
                    placeholder="Nombre del remitente"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DNI / RUC *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="remitenteDni"
                      value={formData.remitenteDni}
                      onChange={handleDniChange}
                      placeholder="12345678 o 20123456789"
                      maxLength={11}
                      inputMode="numeric"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    {buscandoCliente && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {clienteEncontrado && !clienteEncontrado.id && formData.remitenteDni.length === 8 && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      Cliente nuevo - se registrara automaticamente
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefono *
                  </label>
                  <input
                    type="text"
                    name="remitenteTelefono"
                    value={formData.remitenteTelefono}
                    onChange={handleTelefonoRemitenteChange}
                    placeholder="999 999 999"
                    inputMode="numeric"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Seccion de Puntos - solo si hay cliente encontrado con puntos */}
              {clienteEncontrado && puntosDisponiblesCliente > 0 && (
                <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
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
            </div>

            {/* Destinatario */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Datos del Destinatario</h3>
              </div>

              {/* Busqueda de Destinatario */}
              <div className="mb-4">
                <ClienteCombobox
                  label="Buscar Destinatario (DNI o Nombre)"
                  value={destinatarioEncontrado}
                  onChange={(cliente) => {
                    setDestinatarioEncontrado(cliente)
                    setFormData(prev => ({
                      ...prev,
                      destinatarioNombre: cliente.nombreCompleto,
                      destinatarioDni: cliente.documentoIdentidad,
                      destinatarioTelefono: formatTelefono(cliente.telefono || '')
                    }))
                    setErrorBusquedaDestinatario('')
                  }}
                  onClear={() => {
                    setDestinatarioEncontrado(null)
                    setFormData(prev => ({
                      ...prev,
                      destinatarioNombre: '',
                      destinatarioDni: '',
                      destinatarioTelefono: ''
                    }))
                    setErrorBusquedaDestinatario('')
                  }}
                  placeholder="Buscar por DNI o nombre del destinatario..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si el destinatario no existe, complete los datos manualmente abajo
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DNI / RUC *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="destinatarioDni"
                      value={formData.destinatarioDni}
                      onChange={async (e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                        setErrorBusquedaDestinatario('')
                        setFormData(prev => ({
                          ...prev,
                          destinatarioDni: value,
                          destinatarioNombre: ''
                        }))
                        // Si se selecciono un cliente del combobox y cambia el DNI, limpiar seleccion
                        if (destinatarioEncontrado && value !== destinatarioEncontrado.documentoIdentidad) {
                          setDestinatarioEncontrado(null)
                        }
                        // Auto-busqueda cuando se completa el DNI (8) o RUC (11)
                        // IMPORTANTE: Si tiene 8 digitos pero empieza con "10" o "20", es un RUC en progreso
                        const esRucEnProgreso = value.length === 8 && (value.startsWith('10') || value.startsWith('20'))
                        const debeBuscar = (value.length === 8 && !esRucEnProgreso) || value.length === 11

                        if (debeBuscar) {
                          setBuscandoDestinatario(true)
                          // Resetear el hook para permitir consultas repetidas del mismo documento
                          resetDocLookup()
                          const result = value.length === 8
                            ? await consultarDni(value)
                            : await consultarRuc(value)
                          setBuscandoDestinatario(false)
                          if (result) {
                            setErrorBusquedaDestinatario('')
                            setFormData(prev => ({
                              ...prev,
                              destinatarioNombre: result.nombre_completo || result.razon_social || result.nombre_o_razon_social || '',
                              destinatarioTelefono: result.telefono ? formatTelefono(result.telefono) : prev.destinatarioTelefono
                            }))
                          } else {
                            setErrorBusquedaDestinatario(value.length === 8 ? 'DNI no encontrado. Ingrese el nombre manualmente.' : 'RUC no encontrado. Ingrese la razón social manualmente.')
                          }
                        }
                      }}
                      placeholder="12345678 o 20123456789"
                      maxLength={11}
                      inputMode="numeric"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    {buscandoDestinatario && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {errorBusquedaDestinatario && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errorBusquedaDestinatario}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo / Razon Social *
                  </label>
                  <input
                    type="text"
                    name="destinatarioNombre"
                    value={formData.destinatarioNombre}
                    onChange={handleChange}
                    placeholder="Nombre del destinatario o razon social"
                    readOnly={(formData.destinatarioDni.length === 8 || formData.destinatarioDni.length === 11) && formData.destinatarioNombre !== ''}
                    className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${(formData.destinatarioDni.length === 8 || formData.destinatarioDni.length === 11) && formData.destinatarioNombre !== '' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {(formData.destinatarioDni.length === 8 || formData.destinatarioDni.length === 11) && formData.destinatarioNombre !== '' && (
                    <p className="text-xs text-gray-500 mt-1">Autocompletado con datos del {formData.destinatarioDni.length === 11 ? 'RUC' : 'DNI'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefono *
                  </label>
                  <input
                    type="text"
                    name="destinatarioTelefono"
                    value={formData.destinatarioTelefono}
                    onChange={handleTelefonoDestinatarioChange}
                    placeholder="999 999 999"
                    inputMode="numeric"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Detalles del Paquete */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Box className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Detalles del Paquete</h3>
              </div>
              <div className="space-y-4">
                {/* Selector de Precio Base */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio Base *
                  </label>
                  {preciosBase.length === 0 ? (
                    <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                      No hay precios base configurados. Configure al menos uno en Configuracion del Sistema.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {preciosBase.map((pb) => (
                        <button
                          key={pb.id}
                          type="button"
                          onClick={() => setIdPrecioBaseSeleccionado(pb.id.toString())}
                          className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                            idPrecioBaseSeleccionado === pb.id.toString()
                              ? 'border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          {pb.nombre} — S/ {parseFloat(pb.monto).toFixed(2)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Combobox
                    label="Tipo de Paquete"
                    options={tiposPaqueteOptions}
                    value={tipoPaqueteSeleccionadoId}
                    onChange={handleTipoPaqueteChange}
                    placeholder="Buscar tipo de paquete..."
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peso (kg) *
                    </label>
                    <input
                      type="number"
                      name="peso"
                      value={formData.peso}
                      onChange={handleChange}
                      placeholder="Ej: 2.5"
                      step="0.1"
                      min="0.1"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alto (cm) *
                    </label>
                    <input
                      type="number"
                      name="alto"
                      value={formData.alto}
                      onChange={handleChange}
                      placeholder="Ej: 30"
                      step="0.1"
                      min="0.1"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ancho (cm) *
                    </label>
                    <input
                      type="number"
                      name="ancho"
                      value={formData.ancho}
                      onChange={handleChange}
                      placeholder="Ej: 20"
                      step="0.1"
                      min="0.1"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Largo (cm) *
                    </label>
                    <input
                      type="number"
                      name="largo"
                      value={formData.largo}
                      onChange={handleChange}
                      placeholder="Ej: 40"
                      step="0.1"
                      min="0.1"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripcion del Contenido
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Describa el contenido del paquete..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Comentarios (opcional) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Comentarios (Opcional)</h3>
              </div>
              <textarea
                name="comentario"
                value={formData.comentario}
                onChange={handleChange}
                placeholder="Informacion adicional sobre el envio..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Este comentario aparecera en la guia de encomienda y el comprobante de pago
              </p>
            </div>

            {/* Opcion de Pago al Recojo - SIEMPRE VISIBLE PRIMERO */}
            <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pagoAlRecojo}
                  onChange={(e) => {
                    setPagoAlRecojo(e.target.checked)
                    // Si se marca pago al recojo, limpiar tipo de documento
                    if (e.target.checked) {
                      setTipoDocumento('')
                    }
                  }}
                  className="w-6 h-6 rounded border-amber-400 text-amber-600 focus:ring-amber-500 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-gray-900">Pagar al momento del recojo</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Se emitira solo una <strong>Verificacion de Envio</strong> ahora.
                    El comprobante (Boleta/Factura) se seleccionara y emitira cuando el destinatario retire la encomienda.
                  </p>
                  {pagoAlRecojo && precioCalculado && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-300">
                      <p className="text-sm text-amber-800 font-medium">
                        El destinatario debera pagar S/ {precioFinalConDescuento?.toFixed(2) || precioCalculado?.toFixed(2)} al retirar la encomienda.
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Tipo de Comprobante - Solo visible si NO es pago al recojo */}
            {!pagoAlRecojo && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Receipt className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Tipo de Comprobante *</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'BOLETA', label: 'Boleta', icon: Receipt, desc: 'Electronica (SUNAT)' },
                    { value: 'FACTURA', label: 'Factura', icon: FileText, desc: 'Electronica (SUNAT)' },
                    { value: 'VERIFICACION', label: 'Verificacion de Envio', icon: FileText, desc: 'Documento interno' }
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

              {/* Datos adicionales para Factura */}
              {tipoDocumento === 'FACTURA' && (
                <div className="mt-4 bg-orange-50 rounded-lg p-4 border border-orange-200 space-y-3">
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
                              // Siempre consultar API para obtener razón social Y dirección fiscal
                              resetDocLookup()
                              const result = await consultarRuc(value)
                              if (result) {
                                setErrorBusquedaRuc('')
                                const direccionFiscal = result.direccion || result.direccion_completa || result.domicilio_fiscal || ''
                                setClienteFactura(prev => ({
                                  ...prev,
                                  razonSocial: result.razon_social || result.nombre_o_razon_social || '',
                                  direccion: direccionFiscal
                                }))
                              } else {
                                // Si no se encontró en API pero es el mismo RUC que el remitente, usar esos datos
                                if (value === formData.remitenteDni && formData.remitenteNombre) {
                                  setErrorBusquedaRuc('')
                                  setClienteFactura(prev => ({
                                    ...prev,
                                    razonSocial: formData.remitenteNombre,
                                    direccion: ''  // Sin dirección disponible
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

              </div>
            )}

            {/* Clave de Seguridad */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-violet-600" />
                <h3 className="font-semibold text-gray-900">Clave de Seguridad (Opcional)</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                PIN de 4 digitos que se solicitara al destinatario para retirar la encomienda.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clave (4 digitos)
                  </label>
                  <input
                    type="password"
                    value={claveSeguridad}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setClaveSeguridad(value)
                    }}
                    placeholder="****"
                    maxLength={4}
                    inputMode="numeric"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-center text-lg tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Clave
                  </label>
                  <input
                    type="password"
                    value={confirmarClave}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setConfirmarClave(value)
                    }}
                    placeholder="****"
                    maxLength={4}
                    inputMode="numeric"
                    disabled={!claveSeguridad}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-center text-lg tracking-widest ${
                      !claveSeguridad ? 'bg-gray-100 cursor-not-allowed border-gray-200' : 'border-gray-300'
                    } ${
                      confirmarClave && claveSeguridad && confirmarClave === claveSeguridad
                        ? 'border-green-500 bg-green-50'
                        : confirmarClave && claveSeguridad && confirmarClave !== claveSeguridad
                          ? 'border-red-500 bg-red-50'
                          : ''
                    }`}
                  />
                  {confirmarClave && claveSeguridad && confirmarClave !== claveSeguridad && (
                    <p className="text-xs text-red-600 mt-1">Las claves no coinciden</p>
                  )}
                  {confirmarClave && claveSeguridad && confirmarClave === claveSeguridad && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Claves coinciden
                    </p>
                  )}
                </div>
              </div>
              {claveSeguridad && (
                <div className="mt-3 p-3 bg-violet-50 rounded-lg border border-violet-200">
                  <p className="text-xs text-violet-700">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    <strong>Importante:</strong> Esta clave debe ser compartida con el destinatario para que pueda retirar la encomienda.
                  </p>
                </div>
              )}
            </div>

            {/* Precio calculado */}
            {precioCalculado !== null && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        {puntosACanjear > 0 ? 'Precio Final' : 'Precio Calculado'}
                      </p>
                      <p className="text-xs text-green-600">Basado en peso y dimensiones</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {puntosACanjear > 0 ? (
                      <>
                        <p className="text-sm text-gray-400 line-through">
                          S/ {precioCalculado.toFixed(2)}
                        </p>
                        <p className="text-xs text-yellow-600 font-medium">
                          Descuento: -S/ {descuentoFinal.toFixed(2)}
                        </p>
                        <p className="text-3xl font-bold text-green-700">
                          S/ {precioFinalConDescuento.toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <p className="text-3xl font-bold text-green-700">
                        S/ {precioCalculado.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                {clienteEncontrado && (
                  <div className="mt-3 pt-3 border-t border-green-200 flex items-center justify-between text-sm">
                    <span className="text-green-700 flex items-center gap-1">
                      <Star className="w-4 h-4" /> Puntos a ganar:
                    </span>
                    <span className="font-semibold text-yellow-600">+{puntosGanados} puntos</span>
                  </div>
                )}
              </div>
            )}

            {/* Info precio */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> El precio se calcula automaticamente basado en el peso y dimensiones del paquete.
              </p>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/encomiendas')}
              >
                Cancelar
              </Button>
              <Button
                icon={Package}
                onClick={handleRegistrar}
                loading={loading}
              >
                {loading ? 'Registrando...' : 'Registrar Encomienda'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Confirmacion */}
        {step === 2 && encomiendaRegistrada && (
          <>
            {/* Contenido visible en pantalla - NO se imprime */}
            <div className="space-y-6 no-print">
              {/* Exito */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Encomienda Registrada</h2>
                <p className="text-gray-500 mb-2">
                  Codigo de Tracking: <span className="font-mono font-bold text-gray-900">{encomiendaRegistrada.codigoTracking}</span>
                </p>
                <p className="text-sm text-gray-500">
                  El destinatario puede rastrear la encomienda con este codigo
                </p>
              </div>

              {/* Vista previa de la Guia de envio */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="text-center border-b pb-4 mb-4">
                  <h3 className="text-xl font-bold">GUIA DE ENCOMIENDA</h3>
                  <p className="text-3xl font-mono font-bold mt-2">{encomiendaRegistrada.codigoTracking}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Origen */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">ORIGEN</p>
                    <p className="font-semibold">{encomiendaRegistrada.puntoOrigen?.nombre}</p>
                    <p className="text-sm text-gray-600">{encomiendaRegistrada.puntoOrigen?.ciudad}</p>
                  </div>

                  {/* Destino */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">DESTINO</p>
                    <p className="font-semibold">{encomiendaRegistrada.puntoDestino?.nombre}</p>
                    <p className="text-sm text-gray-600">{encomiendaRegistrada.puntoDestino?.ciudad}</p>
                  </div>

                  {/* Remitente */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">REMITENTE</p>
                    <p className="font-medium">{encomiendaRegistrada.remitenteNombre}</p>
                    <p className="text-sm text-gray-600">DNI: {encomiendaRegistrada.remitenteDni}</p>
                    <p className="text-sm text-gray-600">Tel: {encomiendaRegistrada.remitenteTelefono}</p>
                  </div>

                  {/* Destinatario */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">DESTINATARIO</p>
                    <p className="font-medium">{encomiendaRegistrada.destinatarioNombre}</p>
                    {encomiendaRegistrada.destinatario_dni && (
                      <p className="text-sm text-gray-600">DNI: {encomiendaRegistrada.destinatario_dni}</p>
                    )}
                    <p className="text-sm text-gray-600">Tel: {encomiendaRegistrada.destinatarioTelefono}</p>
                  </div>
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500">TIPO</p>
                      <p className="font-medium">{encomiendaRegistrada.tipoPaquete}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">PESO</p>
                      <p className="font-medium">{encomiendaRegistrada.peso} kg</p>
                    </div>
                  </div>
                </div>

                {encomiendaRegistrada.descripcion && (
                  <div className="border-t mt-4 pt-4">
                    <p className="text-xs text-gray-500">CONTENIDO</p>
                    <p className="text-sm">{encomiendaRegistrada.descripcion}</p>
                  </div>
                )}

                <div className="border-t mt-4 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">PRECIO TOTAL</p>
                    <p className="text-2xl font-bold text-green-600">
                      S/ {parseFloat(encomiendaRegistrada.precioFinal ?? encomiendaRegistrada.precioCalculado).toFixed(2)}
                    </p>
                    <p className={`text-sm font-medium mt-1 ${encomiendaRegistrada.pagoAlRecojo ? 'text-amber-600' : 'text-green-700'}`}>
                      {encomiendaRegistrada.pagoAlRecojo ? '⏳ PAGO AL RECOJO' : '✓ PAGADO'}
                    </p>
                  </div>
                  <div>
                    {encomiendaRegistrada.qr ? (
                      <img src={encomiendaRegistrada.qr} alt="QR" className="w-72 h-72" />
                    ) : (
                      <QRGenerator value={encomiendaRegistrada.codigoTracking} size={288} />
                    )}
                  </div>
                </div>

                {/* Seccion de Puntos */}
                <div className="border-t mt-4 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-gray-900 text-sm">Programa de Puntos</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {/* Puntos acumulados del cliente */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Puntos acumulados:</span>
                      <span className="text-gray-900 font-medium">
                        {encomiendaRegistrada.puntosAcumuladosCliente ?? encomiendaRegistrada.cliente?.puntos_historicos ?? 0} pts
                      </span>
                    </div>
                    {/* Puntos ganados en esta compra */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Puntos ganados:</span>
                      <span className="text-green-600 font-semibold">
                        +{encomiendaRegistrada.puntosGanados ?? 0} pts
                      </span>
                    </div>
                    {/* Descuento por puntos usados */}
                    {encomiendaRegistrada.puntosUsados > 0 && (
                      <div className="flex justify-between items-center bg-yellow-50 -mx-2 px-2 py-1.5 rounded">
                        <span className="text-yellow-700 flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          Descuento por puntos:
                        </span>
                        <span className="text-yellow-700 font-semibold">
                          -{encomiendaRegistrada.puntosUsados} pts = S/ {encomiendaRegistrada.descuentoPuntos?.toFixed(2) ?? '0.00'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fecha de Registro */}
                <div className="border-t mt-4 pt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Registrado: <span className="font-medium text-gray-700">{formatTimestamp(encomiendaRegistrada.fechaRegistro)}</span>
                  </p>
                </div>

                {/* Politicas de Envio */}
                {politicasEncomienda && (
                  <div className="border-t mt-4 pt-4">
                    <p className="text-xs font-bold text-gray-700 mb-2 text-center uppercase">Politicas de Envio de Encomiendas</p>
                    <div className="text-[10px] text-gray-600 leading-tight space-y-0.5">
                      {politicasEncomienda.split('\n').map((linea, index) => (
                        linea.trim() && (
                          <p key={index} className="text-justify">
                            • {linea.trim()}
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Comprobante generado */}
              {comprobanteRegistrado && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900 text-sm">
                      {comprobanteRegistrado.tipoDocumento === 'FACTURA' ? 'Factura' :
                       comprobanteRegistrado.tipoDocumento === 'BOLETA' ? 'Boleta' : 'Nota de Venta'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Numero:</span>
                      <span className="text-gray-900 font-mono font-medium">{comprobanteRegistrado.numeroCompleto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total:</span>
                      <span className="text-gray-900 font-medium">S/ {parseFloat(comprobanteRegistrado.total || 0).toFixed(2)}</span>
                    </div>
                    {comprobanteRegistrado.agencia && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Agencia:</span>
                        <span className="text-gray-900 font-medium">{comprobanteRegistrado.agencia.nombre}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button
                  variant="outline"
                  icon={Printer}
                  onClick={handlePrintGuia}
                >
                  Imprimir Guia
                </Button>
                {comprobanteRegistrado && (
                  <button
                    onClick={handlePrintComprobante}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-green-300 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Imprimir Comprobante
                  </button>
                )}
                <Button onClick={nuevaEncomienda}>
                  Nueva Encomienda
                </Button>
              </div>
            </div>

            {/* Area de impresion Guia - Estilo Cruz Selvatico */}
            <div className={printTarget === 'guia' ? 'print-area' : 'hidden'} id="guia-encomienda-print">
              <div className="guia-ticket-cs">
                {/* ═══════ HEADER CON LOGO ═══════ */}
                <div className="guia-cs-header">
                  <img src="/logo.png" alt="Cruz Selvatico" className="guia-cs-logo" />
                  <div className="guia-cs-empresa-info">
                    <span>RUC: 20600812727</span>
                    <span>Cal. Ingobert Witting Nro. 270</span>
                  </div>
                  <div className="guia-cs-doc-title">Guia de Encomienda</div>
                </div>

                <div className="guia-cs-divider"></div>

                {/* ═══════ AGENCIA ═══════ */}
                <div className="guia-cs-section guia-cs-centered">
                  <span className="guia-cs-label">AGENCIA</span>
                  <span className="guia-cs-value-primary">{encomiendaRegistrada.puntoOrigen?.nombre}</span>
                  <span className="guia-cs-value-secondary">{encomiendaRegistrada.puntoOrigen?.ciudad}</span>
                </div>

                <div className="guia-cs-divider"></div>

                {/* ═══════ CODIGO ═══════ */}
                <div className="guia-cs-section guia-cs-centered">
                  <span className="guia-cs-label">CODIGO</span>
                  <span className="guia-cs-tracking">{encomiendaRegistrada.codigoTracking}</span>
                </div>

                {/* ═══════ RUTA ═══════ */}
                <div className="guia-cs-ruta">
                  <div className="guia-cs-ruta-col">
                    <span className="guia-cs-label">ORIGEN</span>
                    <span className="guia-cs-value-primary">{encomiendaRegistrada.puntoOrigen?.nombre}</span>
                  </div>
                  <div className="guia-cs-ruta-arrow">→</div>
                  <div className="guia-cs-ruta-col">
                    <span className="guia-cs-label">DESTINO</span>
                    <span className="guia-cs-value-primary">{encomiendaRegistrada.puntoDestino?.nombre}</span>
                  </div>
                </div>

                {/* ═══════ TIPO Y PESO ═══════ */}
                <div className="guia-cs-row-2col">
                  <div className="guia-cs-col">
                    <span className="guia-cs-label">TIPO PAQUETE</span>
                    <span className="guia-cs-value-bold">{encomiendaRegistrada.tipoPaquete}</span>
                  </div>
                  <div className="guia-cs-col">
                    <span className="guia-cs-label">PESO</span>
                    <span className="guia-cs-value-bold">{encomiendaRegistrada.peso} kg</span>
                  </div>
                </div>

                <div className="guia-cs-divider"></div>

                {/* ═══════ REMITENTE ═══════ */}
                <div className="guia-cs-section">
                  <span className="guia-cs-label">DATOS DEL REMITENTE</span>
                  <div className="guia-cs-datos">
                    <div className="guia-cs-dato-row">
                      <span className="guia-cs-dato-label">Nombre:</span>
                      <span className="guia-cs-dato-value">{encomiendaRegistrada.remitenteNombre}</span>
                    </div>
                    <div className="guia-cs-dato-row">
                      <span className="guia-cs-dato-label">Documento:</span>
                      <span className="guia-cs-dato-value">{encomiendaRegistrada.remitenteDni}</span>
                    </div>
                    <div className="guia-cs-dato-row">
                      <span className="guia-cs-dato-label">Telefono:</span>
                      <span className="guia-cs-dato-value">{encomiendaRegistrada.remitenteTelefono}</span>
                    </div>
                  </div>
                </div>

                <div className="guia-cs-divider"></div>

                {/* ═══════ DESTINATARIO ═══════ */}
                <div className="guia-cs-section">
                  <span className="guia-cs-label">DATOS DEL DESTINATARIO</span>
                  <div className="guia-cs-datos">
                    <div className="guia-cs-dato-row">
                      <span className="guia-cs-dato-label">Nombre:</span>
                      <span className="guia-cs-dato-value">{encomiendaRegistrada.destinatarioNombre}</span>
                    </div>
                    {encomiendaRegistrada.destinatario_dni && (
                      <div className="guia-cs-dato-row">
                        <span className="guia-cs-dato-label">Documento:</span>
                        <span className="guia-cs-dato-value">{encomiendaRegistrada.destinatario_dni}</span>
                      </div>
                    )}
                    <div className="guia-cs-dato-row">
                      <span className="guia-cs-dato-label">Telefono:</span>
                      <span className="guia-cs-dato-value">{encomiendaRegistrada.destinatarioTelefono}</span>
                    </div>
                  </div>
                </div>

                {/* Contenido (si existe) */}
                {encomiendaRegistrada.descripcion && (
                  <>
                    <div className="guia-cs-divider"></div>
                    <div className="guia-cs-section">
                      <span className="guia-cs-label">CONTENIDO</span>
                      <span className="guia-cs-contenido">{encomiendaRegistrada.descripcion}</span>
                    </div>
                  </>
                )}

                {/* Comentarios (si existen) */}
                {encomiendaRegistrada.comentario && (
                  <>
                    <div className="guia-cs-divider"></div>
                    <div className="guia-cs-section">
                      <span className="guia-cs-label">COMENTARIOS</span>
                      <span className="guia-cs-contenido">{encomiendaRegistrada.comentario}</span>
                    </div>
                  </>
                )}

                {/* ═══════ PRECIO ═══════ */}
                <div className="guia-cs-precio-box">
                  <div className="guia-cs-precio-left">
                    <span className="guia-cs-precio-label">Precio</span>
                    <span className="guia-cs-precio-label">Encomienda</span>
                  </div>
                  <div className="guia-cs-precio-right">
                    <span className="guia-cs-precio-currency">S/</span>
                    <span className="guia-cs-precio-monto">
                      {parseFloat(encomiendaRegistrada.precioFinal ?? encomiendaRegistrada.precioCalculado).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Estado de pago */}
                <div className={`guia-cs-estado ${encomiendaRegistrada.pagoAlRecojo ? 'guia-cs-estado-pendiente' : 'guia-cs-estado-pagado'}`}>
                  {encomiendaRegistrada.pagoAlRecojo ? 'PAGO AL RECOJO' : 'PAGADO'}
                </div>

                {/* ═══════ QR ═══════ */}
                <div className="guia-cs-qr-section">
                  {encomiendaRegistrada.qr ? (
                    <img src={encomiendaRegistrada.qr} alt="QR" className="guia-cs-qr" />
                  ) : (
                    <QRGenerator value={encomiendaRegistrada.codigoTracking} size={90} />
                  )}
                </div>

                <div className="guia-cs-divider"></div>

                {/* ═══════ PUNTOS ═══════ */}
                <div className="guia-cs-section">
                  <span className="guia-cs-label">PROGRAMA DE PUNTOS</span>
                  <div className="guia-cs-datos">
                    <div className="guia-cs-dato-row">
                      <span className="guia-cs-dato-label">Acumulados:</span>
                      <span className="guia-cs-dato-value">
                        {encomiendaRegistrada.puntosAcumuladosCliente ?? encomiendaRegistrada.cliente?.puntos_historicos ?? 0} pts
                      </span>
                    </div>
                    <div className="guia-cs-dato-row">
                      <span className="guia-cs-dato-label">Ganados:</span>
                      <span className="guia-cs-dato-value guia-cs-puntos-ganados">
                        +{encomiendaRegistrada.puntosGanados ?? 0} pts
                      </span>
                    </div>
                    {encomiendaRegistrada.puntosUsados > 0 && (
                      <div className="guia-cs-dato-row">
                        <span className="guia-cs-dato-label">Descuento:</span>
                        <span className="guia-cs-dato-value">
                          -{encomiendaRegistrada.puntosUsados} pts = S/ {encomiendaRegistrada.descuentoPuntos?.toFixed(2) ?? '0.00'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="guia-cs-divider"></div>

                {/* ═══════ FECHA ═══════ */}
                <div className="guia-cs-fecha">
                  Emitido: {formatTimestamp(encomiendaRegistrada.fechaRegistro)}
                </div>

                {/* ═══════ POLITICAS ═══════ */}
                {politicasEncomienda && (
                  <div className="guia-cs-politicas">
                    <div className="guia-cs-politicas-title">POLITICAS DE ENVIO DE ENCOMIENDAS</div>
                    <div className="guia-cs-politicas-content">
                      {politicasEncomienda.split('\n').map((linea, index) => (
                        linea.trim() && (
                          <p key={index}>• {linea.trim()}</p>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══════ FOOTER ═══════ */}
                <div className="guia-cs-footer">
                  <span className="guia-cs-empresa-nombre">Cruz Selvatico</span>
                  <span className="guia-cs-gracias">Gracias por su preferencia</span>
                </div>
              </div>
            </div>

            {/* Area de impresion Comprobante */}
            {comprobanteRegistrado && (
              <div className={printTarget === 'comprobante' ? 'print-area' : 'hidden'}>
                <ComprobantePrint
                  comprobante={{
                    tipoDocumento: comprobanteRegistrado.tipoDocumento || comprobanteRegistrado.tipo,
                    numeroCompleto: comprobanteRegistrado.numeroCompleto,
                    clienteNombre: comprobanteRegistrado.clienteRazonSocial || encomiendaRegistrada.remitenteNombre,
                    clienteDocumento: comprobanteRegistrado.clienteNumDoc || encomiendaRegistrada.remitenteDni,
                    clienteDireccion: comprobanteRegistrado.clienteDireccion || '',
                    total: comprobanteRegistrado.total,
                    fechaEmision: comprobanteRegistrado.fechaEmision || encomiendaRegistrada.dateTimeRegistration,
                    horaEmision: comprobanteRegistrado.horaEmision,
                    agencia: comprobanteRegistrado.agencia || encomiendaRegistrada.agencia || null,
                    ruta: {
                      origen: encomiendaRegistrada.puntoOrigen?.nombre,
                      destino: encomiendaRegistrada.puntoDestino?.nombre
                    },
                    fecha: encomiendaRegistrada.dateTimeRegistration,
                    hora: null,
                    comentario: comprobanteRegistrado.comentario || encomiendaRegistrada.comentario || null
                  }}
                  empresa={datosEmpresa}
                />
              </div>
            )}
          </>
        )}
      </div>
  )
}

export default RegistroEncomiendaPage
