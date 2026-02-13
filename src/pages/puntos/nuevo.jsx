/**
 * Nuevo Punto Page
 * Formulario para crear punto
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Select, Card } from '../../components/common'
import { usePuntosApi } from '../../hooks/useApi'
import { ArrowLeft, Save } from 'lucide-react'

const NuevoPuntoPage = () => {
  const navigate = useNavigate()
  const { crear, loading } = usePuntosApi()

  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    ciudad: '',
    direccion: ''
  })

  const [errors, setErrors] = useState({})

  const tiposOptions = [
    { value: 'AGENCIA', label: 'Agencia' },
    { value: 'TERMINAL', label: 'Terminal' }
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
      await crear(formData)
      navigate('/puntos')
    } catch (error) {
      console.error('Error creando punto:', error)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
            onClick={() => navigate('/puntos')}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nuevo Punto</h1>
            <p className="text-gray-500">Crear nueva agencia o terminal</p>
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
                Guardar Punto
              </Button>
            </div>
          </form>
        </Card>
      </div>
  )
}

export default NuevoPuntoPage
