/**
 * Nueva Ruta Page
 * Formulario para crear ruta
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Combobox, Card, Select } from '../../components/common'
import { useRutasApi, usePuntosApi, useTiposCarroApi } from '../../hooks/useApi'
import { ArrowLeft, Save } from 'lucide-react'

const NuevaRutaPage = () => {
  const navigate = useNavigate()
  const { crear, loading } = useRutasApi()
  const { puntos, listar: listarPuntos } = usePuntosApi()
  const { tiposCarro, listar: listarTiposCarro } = useTiposCarroApi()

  const [formData, setFormData] = useState({
    idPuntoOrigen: '',
    idPuntoDestino: '',
    idTipoCarro: '',
    precioPasaje: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    listarPuntos()
    listarTiposCarro()
  }, [listarPuntos, listarTiposCarro])

  // Opciones para el selector de origen (todos los puntos)
  const puntosOrigenOptions = puntos.map((p) => ({
    value: p.id,
    label: `${p.nombre} (${p.ciudad})`
  }))

  // Opciones para el selector de destino (excluye el punto de origen seleccionado)
  // Esto evita que el usuario seleccione el mismo punto como origen y destino
  const puntosDestinoOptions = puntos
    .filter((p) => String(p.id) !== String(formData.idPuntoOrigen))
    .map((p) => ({
      value: p.id,
      label: `${p.nombre} (${p.ciudad})`
    }))

  // Opciones para el selector de tipo de carro
  const tiposCarroOptions = tiposCarro.map((t) => ({
    value: t.id,
    label: t.nombre
  }))

  const validate = () => {
    const newErrors = {}

    if (!formData.idPuntoOrigen) {
      newErrors.idPuntoOrigen = 'El origen es requerido'
    }

    if (!formData.idPuntoDestino) {
      newErrors.idPuntoDestino = 'El destino es requerido'
    }

    if (formData.idPuntoOrigen && formData.idPuntoDestino &&
        formData.idPuntoOrigen === formData.idPuntoDestino) {
      newErrors.idPuntoDestino = 'El destino debe ser diferente al origen'
    }

    if (!formData.idTipoCarro) {
      newErrors.idTipoCarro = 'El tipo de carro es requerido'
    }

    if (!formData.precioPasaje || parseFloat(formData.precioPasaje) <= 0) {
      newErrors.precioPasaje = 'El precio debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await crear({
        idPuntoOrigen: parseInt(formData.idPuntoOrigen),
        idPuntoDestino: parseInt(formData.idPuntoDestino),
        idTipoCarro: parseInt(formData.idTipoCarro),
        precioPasaje: parseFloat(formData.precioPasaje)
      })
      navigate('/rutas')
    } catch (error) {
      console.error('Error creando ruta:', error)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Si se cambia el origen y el destino actual es igual al nuevo origen, limpiar destino
      if (field === 'idPuntoOrigen' && prev.idPuntoDestino === value) {
        newData.idPuntoDestino = ''
      }

      return newData
    })
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/rutas')}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nueva Ruta</h1>
            <p className="text-gray-500">Crear nueva ruta de transporte</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Combobox
              label="Punto de Origen"
              options={puntosOrigenOptions}
              value={formData.idPuntoOrigen}
              onChange={(e) => handleChange('idPuntoOrigen', e.target.value)}
              placeholder="Buscar punto de origen..."
              error={errors.idPuntoOrigen}
              required
            />

            <Combobox
              label="Punto de Destino"
              options={puntosDestinoOptions}
              value={formData.idPuntoDestino}
              onChange={(e) => handleChange('idPuntoDestino', e.target.value)}
              placeholder="Buscar punto de destino..."
              error={errors.idPuntoDestino}
              disabled={!formData.idPuntoOrigen}
              required
            />

            <Select
              label="Tipo de Carro"
              options={tiposCarroOptions}
              value={formData.idTipoCarro}
              onChange={(e) => handleChange('idTipoCarro', e.target.value)}
              placeholder="Seleccione un tipo de carro"
              error={errors.idTipoCarro}
              required
            />

            <Input
              label="Precio del Pasaje"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 25.00"
              value={formData.precioPasaje}
              onChange={(e) => handleChange('precioPasaje', e.target.value)}
              error={errors.precioPasaje}
              required
            />

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Para crear una ruta de ida y vuelta, debera crear dos rutas separadas.
                Puede crear multiples rutas con el mismo origen y destino pero diferente tipo de carro.
                La capacidad de pasajeros se configura por horario.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() => navigate('/rutas')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                icon={Save}
                loading={loading}
              >
                Guardar Ruta
              </Button>
            </div>
          </form>
        </Card>
      </div>
  )
}

export default NuevaRutaPage
