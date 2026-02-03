/**
 * Nuevo Usuario Page
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import { Button, Input, Select, Card } from '../../components/common'
import { usePuntosApi } from '../../hooks/useApi'
import usuariosService from '../../services/usuariosService'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'

const NuevoUsuarioPage = () => {
  const navigate = useNavigate()
  const { puntos, listar: listarPuntos } = usePuntosApi()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [roles, setRoles] = useState([])

  const [formData, setFormData] = useState({
    nombres: '',
    correo: '',
    contrasena: '',
    idRol: '',
    idPunto: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    listarPuntos()
    cargarRoles()
  }, [listarPuntos])

  const cargarRoles = async () => {
    try {
      const response = await usuariosService.listarRoles()
      setRoles(response.roles || [])
    } catch (error) {
      console.error('Error cargando roles:', error)
      toast.error('Error al cargar roles')
    }
  }

  const rolesOptions = roles.map((rol) => ({
    value: rol.id.toString(),
    label: rol.label
  }))

  const puntosOptions = puntos.map((p) => ({
    value: p.id.toString(),
    label: `${p.nombre} (${p.ciudad})`
  }))

  const validate = () => {
    const newErrors = {}

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'El nombre es requerido'
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El correo no es valido'
    }

    if (!formData.contrasena) {
      newErrors.contrasena = 'La contrasena es requerida'
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'La contrasena debe tener al menos 6 caracteres'
    }

    if (!formData.idRol) {
      newErrors.idRol = 'El rol es requerido'
    }

    // Punto requerido para roles que no son Super Admin
    const rolSeleccionado = roles.find(r => r.id.toString() === formData.idRol)
    const esSuperAdmin = rolSeleccionado?.nombre === 'SUPER_ADMIN'
    if (formData.idRol && !esSuperAdmin && !formData.idPunto) {
      newErrors.idPunto = 'El punto es requerido para este rol'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)
      await usuariosService.crear({
        nombres: formData.nombres,
        correo: formData.correo,
        contrasena: formData.contrasena,
        idRol: parseInt(formData.idRol),
        idPunto: formData.idPunto ? parseInt(formData.idPunto) : null
      })
      toast.success('Usuario creado exitosamente')
      navigate('/usuarios')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/usuarios')}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nuevo Usuario</h1>
            <p className="text-gray-500">Crear nuevo usuario del sistema</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nombre Completo"
              placeholder="Ej: Juan Perez"
              value={formData.nombres}
              onChange={(e) => handleChange('nombres', e.target.value)}
              error={errors.nombres}
              required
            />

            <Input
              label="Correo Electronico"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={formData.correo}
              onChange={(e) => handleChange('correo', e.target.value)}
              error={errors.correo}
              required
            />

            <div className="relative">
              <Input
                label="Contrasena"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimo 6 caracteres"
                value={formData.contrasena}
                onChange={(e) => handleChange('contrasena', e.target.value)}
                error={errors.contrasena}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Select
              label="Rol"
              options={rolesOptions}
              value={formData.idRol}
              onChange={(e) => handleChange('idRol', e.target.value)}
              error={errors.idRol}
              required
            />

            {formData.idRol && roles.find(r => r.id.toString() === formData.idRol)?.nombre !== 'SUPER_ADMIN' && (
              <Select
                label="Punto Asignado"
                options={puntosOptions}
                value={formData.idPunto}
                onChange={(e) => handleChange('idPunto', e.target.value)}
                error={errors.idPunto}
                helperText="El usuario operara solo en este punto"
                required
              />
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() => navigate('/usuarios')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                icon={Save}
                loading={loading}
              >
                Guardar Usuario
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}

export default NuevoUsuarioPage
