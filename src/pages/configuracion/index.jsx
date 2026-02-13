/**
 * Configuracion Page
 * Gestion de precios y configuraciones del sistema
 */

import { useState, useEffect } from 'react'
import { Card, Button } from '../../components/common'
import configuracionService from '../../services/configuracionService'
import preciosBaseService from '../../services/preciosBaseService'
import {
  Settings,
  DollarSign,
  Save,
  RefreshCw,
  AlertCircle,
  Check,
  Building,
  Truck,
  Package,
  Star,
  Gift,
  Calculator,
  Box,
  Ruler,
  ScrollText,
  Plus,
  Pencil,
  Trash2,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

const ConfiguracionIndexPage = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingEncomienda, setSavingEncomienda] = useState(false)
  const [configuracion, setConfiguracion] = useState(null)
  const [formData, setFormData] = useState({
    // Precios base
    precioBasePasaje: '',
    precioBaseEncomiendaKg: '',
    // Empresa
    nombreEmpresa: '',
    ruc: '',
    direccion: '',
    telefono: '',
    // Otros
    tiempoReservaMinutos: '',
    capacidadDefaultBus: '',
    // Programa de Puntos
    solesPorPunto: '',
    puntosPorSolDescuento: '',
    // Politicas de encomienda
    politicasEncomienda: ''
  })

  // Estado para precios de encomienda (tabla separada)
  const [preciosEncomienda, setPreciosEncomienda] = useState({
    precioPorKg: '2.50',
    precioPorCm3: '0.001'
  })
  const [preciosEncomiendaExiste, setPreciosEncomiendaExiste] = useState(false)

  // Estado para precios base (lista)
  const [preciosBase, setPreciosBase] = useState([])
  const [loadingPreciosBase, setLoadingPreciosBase] = useState(false)
  const [mostrarFormPrecioBase, setMostrarFormPrecioBase] = useState(false)
  const [editandoPrecioBase, setEditandoPrecioBase] = useState(null)
  const [formPrecioBase, setFormPrecioBase] = useState({ nombre: '', monto: '' })
  const [savingPrecioBase, setSavingPrecioBase] = useState(false)

  // Estado para simulador de cotizacion
  const [simulador, setSimulador] = useState({
    peso: '2',
    alto: '10',
    ancho: '15',
    largo: '25',
    precioBaseSimulador: '0'
  })

  useEffect(() => {
    cargarConfiguracion()
    cargarPreciosEncomienda()
    cargarPreciosBase()
  }, [])

  const cargarConfiguracion = async () => {
    try {
      setLoading(true)
      const response = await configuracionService.obtener()
      const config = response.configuracion || response

      setConfiguracion(config)
      setFormData({
        precioBasePasaje: config.precioBasePasaje || '',
        precioBaseEncomiendaKg: config.precioBaseEncomiendaKg || '',
        nombreEmpresa: config.nombreEmpresa || '',
        ruc: config.ruc || '',
        direccion: config.direccion || '',
        telefono: config.telefono || '',
        tiempoReservaMinutos: config.tiempoReservaMinutos || '',
        capacidadDefaultBus: config.capacidadDefaultBus || '',
        solesPorPunto: config.solesPorPunto || '10',
        puntosPorSolDescuento: config.puntosPorSolDescuento || '10',
        politicasEncomienda: config.politicasEncomienda || ''
      })
    } catch (error) {
      console.error('Error cargando configuracion:', error)
      // Si no existe configuracion, inicializar con valores por defecto
      setFormData({
        precioBasePasaje: '25.00',
        precioBaseEncomiendaKg: '5.00',
        nombreEmpresa: 'Transportes Herminio',
        ruc: '',
        direccion: '',
        telefono: '',
        tiempoReservaMinutos: '30',
        capacidadDefaultBus: '40',
        solesPorPunto: '10',
        puntosPorSolDescuento: '10',
        politicasEncomienda: `El remitente será responsable de la veracidad de los datos brindados.
La empresa no se responsabiliza por deterioro debido al mal embalado ni por descomposición de artículos susceptibles.
Plazo para retirar su encomienda: 48 horas desde que llegó. Caso contrario será evacuado al almacén por 15 días (si es perecible 3 días). Se dará por abandono y será desechable sin lugar a reclamo.
Todo producto ilegal o prohibido será puesto a disposición de las autoridades competentes.
El pago por pérdida de un envío se hará de acuerdo a la ley de ferrocarriles (art. 8): diez veces el valor del flete pagado.
La clave de seguridad es personal y privada para el recojo de sus envíos.
Recibido sin verificación de contenido.`
      })
    } finally {
      setLoading(false)
    }
  }

  // Cargar precios de encomienda (tabla separada)
  const cargarPreciosEncomienda = async () => {
    try {
      const response = await configuracionService.obtenerPreciosEncomienda()
      const config = response.configuracion
      if (config) {
        setPreciosEncomienda({
          precioPorKg: config.precioPorKg?.toString() || '2.50',
          precioPorCm3: config.precioPorCm3?.toString() || '0.001'
        })
        setPreciosEncomiendaExiste(true)
      }
    } catch (error) {
      console.log('No hay configuracion de precios de encomienda, usando valores por defecto')
      setPreciosEncomiendaExiste(false)
    }
  }

  // Cargar precios base
  const cargarPreciosBase = async () => {
    try {
      setLoadingPreciosBase(true)
      const response = await preciosBaseService.listar()
      const lista = response.preciosBase || []
      setPreciosBase(lista)
      // Auto-seleccionar el primero en el simulador si hay
      if (lista.length > 0 && parseFloat(simulador.precioBaseSimulador) === 0) {
        setSimulador(prev => ({ ...prev, precioBaseSimulador: lista[0].monto?.toString() || '0' }))
      }
    } catch (error) {
      console.error('Error cargando precios base:', error)
    } finally {
      setLoadingPreciosBase(false)
    }
  }

  // CRUD precios base
  const handleGuardarPrecioBase = async () => {
    if (!formPrecioBase.nombre.trim()) {
      toast.error('Ingrese un nombre para el precio base')
      return
    }
    if (!formPrecioBase.monto || parseFloat(formPrecioBase.monto) < 0) {
      toast.error('Ingrese un monto valido')
      return
    }

    try {
      setSavingPrecioBase(true)
      if (editandoPrecioBase) {
        await preciosBaseService.actualizar(editandoPrecioBase.id, {
          nombre: formPrecioBase.nombre.trim(),
          monto: parseFloat(formPrecioBase.monto)
        })
        toast.success('Precio base actualizado')
      } else {
        await preciosBaseService.crear({
          nombre: formPrecioBase.nombre.trim(),
          monto: parseFloat(formPrecioBase.monto)
        })
        toast.success('Precio base creado')
      }
      setMostrarFormPrecioBase(false)
      setEditandoPrecioBase(null)
      setFormPrecioBase({ nombre: '', monto: '' })
      cargarPreciosBase()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar precio base')
    } finally {
      setSavingPrecioBase(false)
    }
  }

  const handleEditarPrecioBase = (pb) => {
    setEditandoPrecioBase(pb)
    setFormPrecioBase({ nombre: pb.nombre, monto: pb.monto?.toString() || '' })
    setMostrarFormPrecioBase(true)
  }

  const handleEliminarPrecioBase = async (pb) => {
    if (!confirm(`¿Eliminar el precio base "${pb.nombre}"?`)) return
    try {
      await preciosBaseService.eliminar(pb.id)
      toast.success('Precio base eliminado')
      cargarPreciosBase()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar precio base')
    }
  }

  const handleCancelarFormPrecioBase = () => {
    setMostrarFormPrecioBase(false)
    setEditandoPrecioBase(null)
    setFormPrecioBase({ nombre: '', monto: '' })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Manejar cambios en precios de encomienda
  const handlePreciosEncomiendaChange = (e) => {
    const { name, value } = e.target
    setPreciosEncomienda(prev => ({ ...prev, [name]: value }))
  }

  // Manejar cambios en simulador
  const handleSimuladorChange = (e) => {
    const { name, value } = e.target
    setSimulador(prev => ({ ...prev, [name]: value }))
  }

  // Calcular precio en el simulador
  const calcularPrecioSimulador = () => {
    const tarifa = parseFloat(simulador.precioBaseSimulador) || 0
    const precioKg = parseFloat(preciosEncomienda.precioPorKg) || 0
    const precioCm3 = parseFloat(preciosEncomienda.precioPorCm3) || 0

    const peso = parseFloat(simulador.peso) || 0
    const alto = parseFloat(simulador.alto) || 0
    const ancho = parseFloat(simulador.ancho) || 0
    const largo = parseFloat(simulador.largo) || 0

    const volumen = alto * ancho * largo
    const precio = tarifa + (peso * precioKg) + (volumen * precioCm3)

    return {
      volumen,
      precio: Math.round(precio * 100) / 100,
      desglose: {
        tarifa,
        costoPeso: Math.round(peso * precioKg * 100) / 100,
        costoVolumen: Math.round(volumen * precioCm3 * 100) / 100
      }
    }
  }

  const handleGuardar = async () => {
    try {
      setSaving(true)

      const payload = {
        ...formData,
        precioBasePasaje: parseFloat(formData.precioBasePasaje) || 0,
        precioBaseEncomiendaKg: parseFloat(formData.precioBaseEncomiendaKg) || 0,
        tiempoReservaMinutos: parseInt(formData.tiempoReservaMinutos) || 30,
        capacidadDefaultBus: parseInt(formData.capacidadDefaultBus) || 40,
        solesPorPunto: parseFloat(formData.solesPorPunto) || 10,
        puntosPorSolDescuento: parseFloat(formData.puntosPorSolDescuento) || 10,
        politicasEncomienda: formData.politicasEncomienda || ''
      }

      await configuracionService.actualizar(payload)
      toast.success('Configuracion guardada correctamente')
      cargarConfiguracion()
    } catch (error) {
      console.error('Error guardando configuracion:', error)
      toast.error(error.response?.data?.error || 'Error al guardar configuracion')
    } finally {
      setSaving(false)
    }
  }

  // Guardar precios de encomienda (peso y volumen)
  const handleGuardarPreciosEncomienda = async () => {
    try {
      setSavingEncomienda(true)

      const payload = {
        tarifaBase: 0,
        precioPorKg: parseFloat(preciosEncomienda.precioPorKg) || 0,
        precioPorCm3: parseFloat(preciosEncomienda.precioPorCm3) || 0
      }

      // Validaciones
      if (payload.precioPorKg < 0 || payload.precioPorCm3 < 0) {
        toast.error('Los precios no pueden ser negativos')
        return
      }

      await configuracionService.actualizarPreciosEncomienda(payload)
      toast.success('Precios de encomienda guardados correctamente')
      setPreciosEncomiendaExiste(true)
      cargarPreciosEncomienda()
    } catch (error) {
      console.error('Error guardando precios de encomienda:', error)
      toast.error(error.response?.data?.error || 'Error al guardar precios de encomienda')
    } finally {
      setSavingEncomienda(false)
    }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-gray-600">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Cargando configuracion...</span>
          </div>
        </div>
    )
  }

  return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-7 h-7" />
            Configuracion del Sistema
          </h1>
          <p className="text-gray-500">Gestionar precios y datos de la empresa</p>
        </div>

        <div className="space-y-6">
          {/* Datos de la Empresa */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Datos de la Empresa</h3>
                <p className="text-sm text-gray-500">Informacion que aparece en tickets y guias</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  name="nombreEmpresa"
                  value={formData.nombreEmpresa}
                  onChange={handleChange}
                  placeholder="Ej: Transportes Herminio S.A.C."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RUC
                </label>
                <input
                  type="text"
                  name="ruc"
                  value={formData.ruc}
                  onChange={handleChange}
                  placeholder="Ej: 20123456789"
                  maxLength={11}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direccion
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Direccion de la empresa"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 01-1234567"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </Card>

          {/* Precios de Pasajes */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Precios de Pasajes</h3>
                <p className="text-sm text-gray-500">Configurar precio base para pasajes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Base por Pasaje (S/)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="precioBasePasaje"
                    value={formData.precioBasePasaje}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Este precio se usa como referencia. El precio final se configura por ruta.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidad Default del Bus
                </label>
                <input
                  type="number"
                  name="capacidadDefaultBus"
                  value={formData.capacidadDefaultBus}
                  onChange={handleChange}
                  placeholder="40"
                  min="1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Capacidad de asientos por defecto para nuevos viajes.
                </p>
              </div>
            </div>
          </Card>

          {/* Precios de Encomiendas - COTIZACION */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Cotizacion de Encomiendas</h3>
                  <p className="text-sm text-gray-500">Formula: Precio Base + (Peso x Precio/Kg) + (Volumen x Precio/cm³)</p>
                </div>
              </div>
              {!preciosEncomiendaExiste && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  Sin configurar
                </span>
              )}
            </div>

            {/* Precios Base */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Precios Base</label>
                <button
                  onClick={() => {
                    setEditandoPrecioBase(null)
                    setFormPrecioBase({ nombre: '', monto: '' })
                    setMostrarFormPrecioBase(true)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>

              {/* Formulario inline para crear/editar */}
              {mostrarFormPrecioBase && (
                <div className="flex items-end gap-3 mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-purple-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={formPrecioBase.nombre}
                      onChange={(e) => setFormPrecioBase(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Ej: Economico, Express..."
                      className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none bg-white"
                      autoFocus
                    />
                  </div>
                  <div className="w-36">
                    <label className="block text-xs font-medium text-purple-700 mb-1">Monto (S/)</label>
                    <input
                      type="number"
                      value={formPrecioBase.monto}
                      onChange={(e) => setFormPrecioBase(prev => ({ ...prev, monto: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none bg-white"
                    />
                  </div>
                  <button
                    onClick={handleGuardarPrecioBase}
                    disabled={savingPrecioBase}
                    className="px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    {savingPrecioBase ? '...' : 'Guardar'}
                  </button>
                  <button
                    onClick={handleCancelarFormPrecioBase}
                    className="px-3 py-2 text-gray-500 text-sm rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Lista de precios base */}
              {preciosBase.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  No hay precios base creados. Agregue al menos uno para poder registrar encomiendas.
                </div>
              ) : (
                <div className="space-y-2">
                  {preciosBase.map((pb) => (
                    <div key={pb.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{pb.nombre}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-purple-700">S/ {parseFloat(pb.monto).toFixed(2)}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditarPrecioBase(pb)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEliminarPrecioBase(pb)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campos de precio por peso y volumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio por Kg (S/)
                </label>
                <div className="relative">
                  <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="precioPorKg"
                    value={preciosEncomienda.precioPorKg}
                    onChange={handlePreciosEncomiendaChange}
                    placeholder="2.50"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Se multiplica por el peso del paquete
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio por cm³ (S/)
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="precioPorCm3"
                    value={preciosEncomienda.precioPorCm3}
                    onChange={handlePreciosEncomiendaChange}
                    placeholder="0.001"
                    min="0"
                    step="0.0001"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Se multiplica por alto x ancho x largo
                </p>
              </div>
            </div>

            {/* Simulador de cotizacion */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">Simulador de Cotizacion</h4>
                <span className="text-xs text-purple-600 ml-auto">Vista previa en tiempo real</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-purple-700 mb-1">Precio Base</label>
                  <select
                    value={simulador.precioBaseSimulador}
                    onChange={(e) => setSimulador(prev => ({ ...prev, precioBaseSimulador: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none bg-white"
                  >
                    {preciosBase.length === 0 && <option value="0">Sin precios base</option>}
                    {preciosBase.map((pb) => (
                      <option key={pb.id} value={pb.monto}>{pb.nombre} (S/ {parseFloat(pb.monto).toFixed(2)})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-700 mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    name="peso"
                    value={simulador.peso}
                    onChange={handleSimuladorChange}
                    min="0.1"
                    step="0.1"
                    className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-700 mb-1">Alto (cm)</label>
                  <input
                    type="number"
                    name="alto"
                    value={simulador.alto}
                    onChange={handleSimuladorChange}
                    min="1"
                    step="1"
                    className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-700 mb-1">Ancho (cm)</label>
                  <input
                    type="number"
                    name="ancho"
                    value={simulador.ancho}
                    onChange={handleSimuladorChange}
                    min="1"
                    step="1"
                    className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-700 mb-1">Largo (cm)</label>
                  <input
                    type="number"
                    name="largo"
                    value={simulador.largo}
                    onChange={handleSimuladorChange}
                    min="1"
                    step="1"
                    className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none bg-white"
                  />
                </div>
              </div>

              {/* Resultado del simulador */}
              {(() => {
                const resultado = calcularPrecioSimulador()
                return (
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          Volumen: <span className="font-medium">{resultado.volumen.toLocaleString()} cm³</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          = S/ {resultado.desglose.tarifa.toFixed(2)} (base)
                          + S/ {resultado.desglose.costoPeso.toFixed(2)} (peso)
                          + S/ {resultado.desglose.costoVolumen.toFixed(2)} (volumen)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Precio calculado</p>
                        <p className="text-2xl font-bold text-purple-700">
                          S/ {resultado.precio.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Boton guardar precios encomienda */}
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
              <Button
                icon={Save}
                onClick={handleGuardarPreciosEncomienda}
                disabled={savingEncomienda}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {savingEncomienda ? 'Guardando...' : 'Guardar Precios por Peso/Volumen'}
              </Button>
            </div>
          </Card>

          {/* Otros ajustes */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Otros Ajustes</h3>
                <p className="text-sm text-gray-500">Configuraciones adicionales del sistema</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de Reserva (minutos)
                </label>
                <input
                  type="number"
                  name="tiempoReservaMinutos"
                  value={formData.tiempoReservaMinutos}
                  onChange={handleChange}
                  placeholder="30"
                  min="1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tiempo que se mantiene reservado un cupo antes de expirar.
                </p>
              </div>
            </div>
          </Card>

          {/* Programa de Puntos */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Programa de Puntos</h3>
                <p className="text-sm text-gray-500">Configurar acumulacion y canje de puntos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Soles por Punto (Acumulacion)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="solesPorPunto"
                    value={formData.solesPorPunto}
                    onChange={handleChange}
                    placeholder="10.00"
                    min="0.01"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Por cada S/ {formData.solesPorPunto || '10'} gastados, el cliente gana 1 punto
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puntos por Sol de Descuento (Canje)
                </label>
                <div className="relative">
                  <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="puntosPorSolDescuento"
                    value={formData.puntosPorSolDescuento}
                    onChange={handleChange}
                    placeholder="10"
                    min="0.01"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.puntosPorSolDescuento || '10'} puntos = S/ 1.00 de descuento
                </p>
              </div>
            </div>

            {/* Preview de equivalencias */}
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800 mb-2">Ejemplo con esta configuracion:</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-yellow-700">
                <div>
                  <p>Pasaje de S/ 35.00:</p>
                  <p className="font-semibold">Gana {Math.floor(35 / (parseFloat(formData.solesPorPunto) || 10))} puntos</p>
                </div>
                <div>
                  <p>Cliente con 100 puntos:</p>
                  <p className="font-semibold">Puede obtener S/ {(100 / (parseFloat(formData.puntosPorSolDescuento) || 10)).toFixed(2)} de descuento</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Politicas de Encomienda */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ScrollText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Politicas de Envio de Encomiendas</h3>
                <p className="text-sm text-gray-500">Texto que aparece impreso en el ticket de encomienda</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Politicas (una por linea)
              </label>
              <textarea
                name="politicasEncomienda"
                value={formData.politicasEncomienda}
                onChange={handleChange}
                rows={10}
                placeholder="Ingrese las politicas de envio, una por linea..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-y font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Cada linea se mostrara como un punto separado en el ticket de encomienda impreso.
              </p>
            </div>

            {/* Preview */}
            {formData.politicasEncomienda && (
              <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs font-bold text-orange-800 mb-2">Vista previa en ticket:</p>
                <div className="text-[10px] text-gray-700 space-y-1 bg-white p-3 rounded border border-orange-100">
                  {formData.politicasEncomienda.split('\n').map((linea, index) => (
                    linea.trim() && (
                      <p key={index} className="leading-tight">
                        • {linea.trim()}
                      </p>
                    )
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Nota importante</p>
              <p>Los precios base son referenciales. Los precios finales de pasajes y encomiendas se configuran individualmente en cada ruta.</p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={cargarConfiguracion}
            >
              Recargar
            </Button>
            <Button
              icon={Save}
              onClick={handleGuardar}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>
  )
}

export default ConfiguracionIndexPage
