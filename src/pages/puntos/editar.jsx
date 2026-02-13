/**
 * Editar Punto Page
 * Formulario para editar punto
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Input, Select, Card } from '../../components/common'
import { usePuntosApi } from '../../hooks/useApi'
import { ArrowLeft, Save } from 'lucide-react'

const EditarPuntoPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { obtener, actualizar, loading } = usePuntosApi()

  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    ciudad: '',
    direccion: '',
    estado: 1
  })

  const [errors, setErrors] = useState({})
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const cargarPunto = async () => {
      try {
        const punto = await obtener(id)
        setFormData({
          nombre: punto.nombre,
          tipo: punto.tipo,
          ciudad: punto.ciudad,
          direccion: punto.direccion || '',
          estado: punto.estado
        })
      } catch (error) {
        console.error('Error cargando punto:', error)
        navigate('/puntos')
      } finally {
        setLoadingData(false)
      }
    }

    cargarPunto()
  }, [id, obtener, navigate])

  const tiposOptions = [
    { value: 'AGENCIA', label: 'Agencia' },
    { value: 'TERMINAL', label: 'Terminal' }
  ]

  const estadoOptions = [
    { value: 1, label: 'Activo' },
    { value: 0, label: 'Inactivo' }
  ]

  const validate = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.tipo) {
      newErrors.tipo = 'El tipo es requerido'
    }

    if (!formData.ciudad.trim()) {
      newErrors.ciudad = 'La ciudad es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await actualizar(id, formData)
      navigate('/puntos')
    } catch (error) {
      console.error('Error actualizando punto:', error)
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
            onClick={() => navigate('/puntos')}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Punto</h1>
            <p className="text-gray-500">Modificar datos del punto</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nombre"
              placeholder="Ej: Terminal Central Lima"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              error={errors.nombre}
              required
            />

            <Select
              label="Tipo"
              options={tiposOptions}
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              error={errors.tipo}
              required
            />

            <Input
              label="Ciudad"
              placeholder="Ej: Lima"
              value={formData.ciudad}
              onChange={(e) => handleChange('ciudad', e.target.value)}
              error={errors.ciudad}
              required
            />

            <Input
              label="Direccion"
              placeholder="Ej: Av. Principal 123"
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              helperText="Opcional"
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
                onClick={() => navigate('/puntos')}
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

export default EditarPuntoPage
