/**
 * Editar Ruta Page
 * Formulario para editar ruta
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Input, Select, Card } from '../../components/common'
import { useRutasApi, useTiposCarroApi } from '../../hooks/useApi'
import { ArrowLeft, Save, ArrowRight } from 'lucide-react'

const EditarRutaPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { obtener, actualizar, loading } = useRutasApi()
  const { tiposCarro, listar: listarTiposCarro } = useTiposCarroApi()

  const [formData, setFormData] = useState({
    precioPasaje: '',
    estado: 1,
    idTipoCarro: ''
  })

  const [rutaInfo, setRutaInfo] = useState(null)
  const [errors, setErrors] = useState({})
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    listarTiposCarro()
  }, [listarTiposCarro])

  useEffect(() => {
    const cargarRuta = async () => {
      try {
        const ruta = await obtener(id)
        setRutaInfo(ruta)
        setFormData({
          precioPasaje: ruta.precioPasaje.toString(),
          estado: ruta.estado,
          idTipoCarro: ruta.idTipoCarro?.toString() || ''
        })
      } catch (error) {
        console.error('Error cargando ruta:', error)
        navigate('/rutas')
      } finally {
        setLoadingData(false)
      }
    }

    cargarRuta()
  }, [id, obtener, navigate])

  const estadoOptions = [
    { value: 1, label: 'Activo' },
    { value: 0, label: 'Inactivo' }
  ]

  // Opciones para el selector de tipo de carro
  const tiposCarroOptions = tiposCarro.map((t) => ({
    value: t.id,
    label: t.nombre
  }))

  const validate = () => {
    const newErrors = {}

    if (!formData.precioPasaje || parseFloat(formData.precioPasaje) <= 0) {
      newErrors.precioPasaje = 'El precio debe ser mayor a 0'
    }

    if (!formData.idTipoCarro) {
      newErrors.idTipoCarro = 'El tipo de carro es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await actualizar(id, {
        precioPasaje: parseFloat(formData.precioPasaje),
        estado: formData.estado,
        idTipoCarro: parseInt(formData.idTipoCarro)
      })
      navigate('/rutas')
    } catch (error) {
      console.error('Error actualizando ruta:', error)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  if (loadingData) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    )
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
            <h1 className="text-2xl font-bold text-gray-900">Editar Ruta</h1>
            <p className="text-gray-500">Modificar precio y estado</p>
          </div>
        </div>

        {/* Ruta Info */}
        <Card className="bg-gray-50">
          <div className="flex items-center justify-center gap-4 text-lg">
            <span className="font-semibold text-gray-900">{rutaInfo?.puntoOrigen?.nombre}</span>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-gray-900">{rutaInfo?.puntoDestino?.nombre}</span>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            {rutaInfo?.puntoOrigen?.ciudad} - {rutaInfo?.puntoDestino?.ciudad}
          </p>
          {rutaInfo?.tipoCarro && (
            <p className="text-center text-sm text-purple-600 mt-1 font-medium">
              Tipo actual: {rutaInfo.tipoCarro.nombre}
            </p>
          )}
        </Card>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Tipo de Carro"
              options={tiposCarroOptions}
              value={formData.idTipoCarro}
              onChange={(e) => handleChange('idTipoCarro', e.target.value)}
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

            <Select
              label="Estado"
              options={estadoOptions}
              value={formData.estado}
              onChange={(e) => handleChange('estado', parseInt(e.target.value))}
            />

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
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>
      </div>
  )
}

export default EditarRutaPage
