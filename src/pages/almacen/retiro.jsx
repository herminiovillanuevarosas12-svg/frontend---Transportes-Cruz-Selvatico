/**
 * Retiro de Encomienda Page
 * Registro de retiro con DNI y foto de evidencia
 */

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, ComprobantePrint } from '../../components/common'
import encomiendasService from '../../services/encomiendasService'
import facturacionService from '../../services/facturacionService'
import useDocLookup from '../../hooks/useDocLookup'
import {
  Package,
  ArrowLeft,
  User,
  Camera,
  Check,
  AlertCircle,
  Loader,
  FileText,
  MapPin,
  Phone,
  X,
  Lock,
  DollarSign,
  Receipt,
  Building2,
  ImagePlus,
  Printer
} from 'lucide-react'
import toast from 'react-hot-toast'

const RetiroEncomiendaPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  const [encomienda, setEncomienda] = useState(null)
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)

  // Datos del retiro
  const [dniRetira, setDniRetira] = useState('')
  const [nombreRetira, setNombreRetira] = useState('')
  const [fotoEvidencia, setFotoEvidencia] = useState(null)
  const [showCamera, setShowCamera] = useState(false)

  // Hook para auto-busqueda de DNI/RUC
  const { loading: buscandoDoc, consultarDni, consultarRuc, reset: resetDocLookup } = useDocLookup()

  // Clave de seguridad
  const [claveIngresada, setClaveIngresada] = useState('')
  const [claveValidada, setClaveValidada] = useState(false)
  const [errorClave, setErrorClave] = useState('')

  // Comprobante generado al retirar (para pago al recojo)
  const [comprobanteRetiro, setComprobanteRetiro] = useState(null)
  const [retiroCompletado, setRetiroCompletado] = useState(false)
  const [printTarget, setPrintTarget] = useState(null)

  // Tipo de comprobante para pago al recojo
  const [tipoComprobanteRetiro, setTipoComprobanteRetiro] = useState('')
  const [clienteFacturaRetiro, setClienteFacturaRetiro] = useState({
    ruc: '',
    razonSocial: '',
    direccion: ''
  })
  const [errorBusquedaRuc, setErrorBusquedaRuc] = useState('')

  // Datos de empresa para impresion
  const [datosEmpresa, setDatosEmpresa] = useState(null)

  useEffect(() => {
    cargarDatosEmpresa()
  }, [])

  const cargarDatosEmpresa = async () => {
    try {
      const configRes = await facturacionService.obtenerConfiguracion()
      if (configRes?.configuracion) {
        setDatosEmpresa(configRes.configuracion)
      }
    } catch (error) {
      console.error('Error cargando datos empresa:', error)
    }
  }

  useEffect(() => {
    cargarEncomienda()
    return () => {
      // Limpiar stream de camara al desmontar
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [id])

  const cargarEncomienda = async () => {
    try {
      setLoading(true)
      const response = await encomiendasService.obtener(id)
      const enc = response.encomienda || response

      if (enc.estadoActual !== 'LLEGO_A_DESTINO') {
        toast.error('La encomienda no esta lista para retiro')
        navigate('/almacen/escaneo')
        return
      }

      setEncomienda(enc)
      // Pre-llenar con nombre del destinatario
      setNombreRetira(enc.destinatarioNombre || '')
      // Si la encomienda no tiene clave de seguridad, marcar como validada automaticamente
      if (!enc.tieneClaveSeguridad) {
        setClaveValidada(true)
      }
    } catch (error) {
      console.error('Error cargando encomienda:', error)
      toast.error('Error al cargar encomienda')
      navigate('/almacen/escaneo')
    } finally {
      setLoading(false)
    }
  }

  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setShowCamera(true)
    } catch (error) {
      console.error('Error accediendo a camara:', error)
      toast.error('No se pudo acceder a la camara')
    }
  }

  const capturarFoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setFotoEvidencia(dataUrl)

    // Detener camara
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    setShowCamera(false)
  }

  const cancelarCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    setShowCamera(false)
  }

  const eliminarFoto = () => {
    setFotoEvidencia(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor seleccione una imagen valida')
      return
    }

    // Validar tamano (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setFotoEvidencia(event.target.result)
    }
    reader.onerror = () => {
      toast.error('Error al leer la imagen')
    }
    reader.readAsDataURL(file)
  }

  const validarFormulario = () => {
    if (!dniRetira || dniRetira.length !== 8) {
      toast.error('Ingrese un DNI valido (8 digitos)')
      return false
    }
    if (!nombreRetira.trim()) {
      toast.error('Ingrese el nombre de quien retira')
      return false
    }
    if (!fotoEvidencia) {
      toast.error('Debe tomar una foto de evidencia')
      return false
    }
    // Validar clave de seguridad si la encomienda tiene una
    if (encomienda?.tieneClaveSeguridad && !claveValidada) {
      toast.error('Debe ingresar la clave de seguridad correcta')
      return false
    }
    // Validar tipo de comprobante si es pago al recojo
    if (encomienda?.pagoAlRecojo) {
      if (!tipoComprobanteRetiro || !['BOLETA', 'FACTURA', 'VERIFICACION'].includes(tipoComprobanteRetiro)) {
        toast.error('Debe seleccionar un tipo de comprobante')
        return false
      }
      // Validar datos de factura
      if (tipoComprobanteRetiro === 'FACTURA') {
        if (!clienteFacturaRetiro.ruc || clienteFacturaRetiro.ruc.length !== 11) {
          toast.error('El RUC debe tener 11 digitos')
          return false
        }
        if (!clienteFacturaRetiro.razonSocial) {
          toast.error('La razon social es requerida para factura')
          return false
        }
      }
    }
    return true
  }

  const handleRegistrarRetiro = async () => {
    if (!validarFormulario()) return

    try {
      setProcesando(true)

      // Preparar payload
      const payload = {
        dniRetiro: dniRetira,
        fotoBase64: fotoEvidencia,
        nota: `Retiro por: ${nombreRetira}`,
        claveIngresada: encomienda?.tieneClaveSeguridad ? claveIngresada : null
      }

      // Si es pago al recojo, agregar datos del comprobante
      if (encomienda?.pagoAlRecojo) {
        payload.tipoComprobante = tipoComprobanteRetiro
        if (tipoComprobanteRetiro === 'FACTURA') {
          payload.clienteFactura = clienteFacturaRetiro
        }
      }

      const response = await encomiendasService.retirar(encomienda.id, payload)

      toast.success('Retiro registrado exitosamente')
      setRetiroCompletado(true)

      // Si hay comprobante generado (pago al recojo), guardarlo para mostrar e imprimir
      if (response.comprobante) {
        setComprobanteRetiro(response.comprobante)
        toast.success(`${response.comprobante.tipoDocumento === 'BOLETA' ? 'Boleta' : 'Factura'} emitida: ${response.comprobante.numeroCompleto}`)

        // Imprimir comprobante automaticamente despues de un breve delay
        setTimeout(() => {
          setPrintTarget('comprobante')
          setTimeout(() => {
            window.print()
            setPrintTarget(null)
          }, 100)
        }, 500)
      } else {
        // Si no hay comprobante (VERIFICACION), redirigir despues de un momento
        setTimeout(() => {
          navigate('/almacen/escaneo')
        }, 1500)
      }
    } catch (error) {
      console.error('Error registrando retiro:', error)
      toast.error(error.response?.data?.error || 'Error al registrar retiro')
    } finally {
      setProcesando(false)
    }
  }

  // Funcion para imprimir comprobante manualmente
  const handlePrintComprobante = () => {
    setPrintTarget('comprobante')
    setTimeout(() => {
      window.print()
      setPrintTarget(null)
    }, 100)
  }

  // Validar clave de seguridad
  const handleValidarClave = (valor) => {
    setClaveIngresada(valor)
    setErrorClave('')

    // Si tiene 4 digitos, validar contra la encomienda
    // Nota: La validacion real se hace en el backend, aqui solo es visual
    if (valor.length === 4) {
      // Marcamos como validada para permitir el envio
      // El backend hara la validacion real
      setClaveValidada(true)
    } else {
      setClaveValidada(false)
    }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader className="w-6 h-6 animate-spin" />
            <span>Cargando...</span>
          </div>
        </div>
    )
  }

  if (!encomienda) {
    return (
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
    )
  }

  return (
    <>
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
          <h1 className="text-2xl font-bold text-gray-900">Registro de Retiro</h1>
          <p className="text-gray-500">Verificar identidad y registrar evidencia</p>
        </div>

        {/* Info de Encomienda */}
        <Card className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-sm text-gray-500">Codigo</span>
              <p className="text-xl font-mono font-bold text-gray-900">
                {encomienda.codigoTracking}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Listo para Retiro
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-500">Descripcion</span>
              <p className="text-gray-900">{encomienda.descripcion || encomienda.tipoPaquete}</p>
            </div>
            <div>
              <span className="text-gray-500">Peso</span>
              <p className="text-gray-900">{encomienda.peso} kg</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800">
              {encomienda.puntoOrigen?.nombre} → {encomienda.puntoDestino?.nombre}
            </span>
          </div>

          {/* Indicador de Pago al Recojo */}
          {encomienda.pagoAlRecojo && (
            <div className="mt-4 flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Pago al Recojo</p>
                  <p className="text-xs text-amber-600">El comprobante se emitira al confirmar el retiro</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-amber-600">Total a pagar</p>
                <p className="text-2xl font-bold text-amber-700">
                  S/ {parseFloat(encomienda.precioFinal || 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Indicador de Clave de Seguridad */}
          {encomienda.tieneClaveSeguridad && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-violet-50 rounded-lg border border-violet-200">
              <Lock className="w-4 h-4 text-violet-600" />
              <span className="text-sm text-violet-800 font-medium">
                Esta encomienda requiere clave de seguridad para el retiro
              </span>
            </div>
          )}
        </Card>

        {/* Selector de Tipo de Comprobante - Solo para pago al recojo y antes de completar */}
        {encomienda.pagoAlRecojo && !retiroCompletado && (
          <Card className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Tipo de Comprobante a Emitir *
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Seleccione el tipo de comprobante que se emitira al confirmar el retiro.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { value: 'BOLETA', label: 'Boleta', icon: Receipt, desc: 'Electronica (SUNAT)' },
                { value: 'FACTURA', label: 'Factura', icon: FileText, desc: 'Electronica (SUNAT)' },
                { value: 'VERIFICACION', label: 'Verificacion', icon: FileText, desc: 'Documento interno' }
              ].map(tipo => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setTipoComprobanteRetiro(tipo.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    tipoComprobanteRetiro === tipo.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <tipo.icon className={`w-5 h-5 mx-auto mb-1 ${
                    tipoComprobanteRetiro === tipo.value ? 'text-indigo-600' : 'text-gray-500'
                  }`} />
                  <span className={`block text-sm font-medium ${
                    tipoComprobanteRetiro === tipo.value ? 'text-indigo-700' : 'text-gray-700'
                  }`}>{tipo.label}</span>
                  <span className="block text-[10px] text-gray-400 mt-0.5">{tipo.desc}</span>
                </button>
              ))}
            </div>

            {/* Datos adicionales para Factura */}
            {tipoComprobanteRetiro === 'FACTURA' && (
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
                        value={clienteFacturaRetiro.ruc}
                        onChange={async (e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                          setErrorBusquedaRuc('')
                          setClienteFacturaRetiro(prev => ({
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
                              setClienteFacturaRetiro(prev => ({
                                ...prev,
                                razonSocial: result.razon_social || result.nombre_o_razon_social || '',
                                direccion: result.direccion || result.domicilio_fiscal || ''
                              }))
                            } else {
                              setErrorBusquedaRuc('RUC no encontrado. Verifique que el numero sea correcto.')
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
                      value={clienteFacturaRetiro.razonSocial}
                      readOnly
                      placeholder="Se autocompleta con el RUC"
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none text-sm bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Direccion Fiscal</label>
                    <input
                      type="text"
                      value={clienteFacturaRetiro.direccion}
                      readOnly
                      placeholder="Se autocompleta con el RUC"
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none text-sm bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Destinatario Original */}
        <Card className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Destinatario Registrado
          </h3>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">{encomienda.destinatarioNombre}</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {encomienda.destinatarioTelefono}
              </span>
            </div>
          </div>
        </Card>

        {/* Clave de Seguridad - Ocultar cuando retiro completado */}
        {encomienda.tieneClaveSeguridad && !retiroCompletado && (
          <Card className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-violet-600" />
              Clave de Seguridad
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Ingrese la clave de 4 digitos proporcionada por el remitente para autorizar el retiro.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clave (4 digitos) *
                </label>
                <input
                  type="password"
                  value={claveIngresada}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                    handleValidarClave(value)
                  }}
                  placeholder="****"
                  maxLength={4}
                  inputMode="numeric"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-center text-2xl tracking-[0.5em] font-mono ${
                    claveIngresada.length === 4 && claveValidada
                      ? 'border-green-500 bg-green-50'
                      : claveIngresada.length === 4 && !claveValidada
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                  }`}
                />
              </div>
              {claveIngresada.length === 4 && claveValidada && (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <Check className="w-4 h-4" />
                  Clave de 4 digitos ingresada - se verificara al confirmar
                </div>
              )}
              {errorClave && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errorClave}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Formulario de Retiro - Ocultar cuando retiro completado */}
        {!retiroCompletado && (
          <Card className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Datos de Quien Retira
            </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI de quien retira *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={dniRetira}
                  onChange={async (e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8)
                    setDniRetira(value)
                    // Auto-busqueda cuando se completa el DNI
                    if (value.length === 8) {
                      const result = await consultarDni(value)
                      if (result) {
                        setNombreRetira(result.nombre_completo || '')
                      }
                    }
                  }}
                  placeholder="Ingrese DNI (8 digitos)"
                  maxLength={8}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {buscandoDoc && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={nombreRetira}
                onChange={(e) => setNombreRetira(e.target.value)}
                placeholder="Nombre de quien retira"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Nota informativa */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Verifique que la persona que retira tenga autorizacion del destinatario.
              </p>
            </div>
          </div>
          </Card>
        )}

        {/* Foto de Evidencia - Ocultar cuando retiro completado */}
        {!retiroCompletado && (
          <Card className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Foto de Evidencia *
            </h3>

          {!showCamera && !fotoEvidencia && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Tome una foto del documento de identidad y la persona que retira
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button icon={Camera} onClick={iniciarCamara}>
                  Abrir Camara
                </Button>
                <Button
                  variant="outline"
                  icon={ImagePlus}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Subir de Galeria
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {showCamera && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  icon={X}
                  onClick={cancelarCamara}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  icon={Camera}
                  onClick={capturarFoto}
                  className="flex-1"
                >
                  Capturar
                </Button>
              </div>
            </div>
          )}

          {fotoEvidencia && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={fotoEvidencia}
                  alt="Evidencia"
                  className="w-full rounded-xl"
                />
                <button
                  onClick={eliminarFoto}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Check className="w-4 h-4" />
                Foto capturada correctamente
              </div>
            </div>
          )}

          {/* Canvas oculto para captura */}
          <canvas ref={canvasRef} className="hidden" />
          </Card>
        )}

        {/* Botones de accion */}
        {!retiroCompletado && (
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/almacen/escaneo')}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              icon={Check}
              onClick={handleRegistrarRetiro}
              disabled={
                procesando ||
                !dniRetira ||
                !nombreRetira ||
                !fotoEvidencia ||
                (encomienda?.tieneClaveSeguridad && !claveValidada) ||
                (encomienda?.pagoAlRecojo && !tipoComprobanteRetiro) ||
                (encomienda?.pagoAlRecojo && tipoComprobanteRetiro === 'FACTURA' && (!clienteFacturaRetiro.ruc || clienteFacturaRetiro.ruc.length !== 11 || !clienteFacturaRetiro.razonSocial))
              }
              className="flex-1"
            >
              {procesando ? 'Procesando...' : 'Confirmar Retiro'}
            </Button>
          </div>
        )}

        {/* Retiro completado sin comprobante electronico (VERIFICACION) */}
        {retiroCompletado && !comprobanteRetiro && (
          <Card className="mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Retiro Completado</h2>
              <p className="text-gray-500 mb-4">La encomienda ha sido entregada exitosamente</p>
              <p className="text-sm text-gray-400">Redirigiendo...</p>
            </div>
          </Card>
        )}

        {/* Comprobante generado (para pago al recojo con BOLETA o FACTURA) */}
        {comprobanteRetiro && (
          <Card className="mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Retiro Completado</h2>
              <p className="text-gray-500 mb-4">Se ha generado el comprobante de pago</p>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-4">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    {comprobanteRetiro.tipoDocumento === 'BOLETA' ? 'Boleta' : 'Factura'} Electronica
                  </span>
                </div>
                <p className="text-2xl font-mono font-bold text-green-700">
                  {comprobanteRetiro.numeroCompleto}
                </p>
                <p className="text-lg font-semibold text-green-600 mt-2">
                  Total: S/ {parseFloat(comprobanteRetiro.total || 0).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  icon={Printer}
                  onClick={handlePrintComprobante}
                  className="flex-1"
                >
                  Reimprimir
                </Button>
                <Button
                  onClick={() => navigate('/almacen/escaneo')}
                  className="flex-1"
                >
                  Volver al Escaneo
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Area de impresion del comprobante */}
      {comprobanteRetiro && (
        <div className={printTarget === 'comprobante' ? 'print-area' : 'hidden'}>
          <ComprobantePrint
            comprobante={{
              tipoDocumento: comprobanteRetiro.tipoDocumento,
              numeroCompleto: comprobanteRetiro.numeroCompleto,
              clienteNombre: tipoComprobanteRetiro === 'FACTURA'
                ? clienteFacturaRetiro.razonSocial
                : encomienda?.destinatarioNombre,
              clienteDocumento: tipoComprobanteRetiro === 'FACTURA'
                ? clienteFacturaRetiro.ruc
                : dniRetira,
              clienteDireccion: tipoComprobanteRetiro === 'FACTURA'
                ? clienteFacturaRetiro.direccion
                : '',
              total: comprobanteRetiro.total,
              fechaEmision: new Date().toISOString(),
              ruta: {
                origen: encomienda?.puntoOrigen?.nombre,
                destino: encomienda?.puntoDestino?.nombre
              },
              fecha: new Date().toISOString(),
              hora: null
            }}
            empresa={datosEmpresa}
          />
        </div>
      )}
    </>
  )
}

export default RetiroEncomiendaPage
