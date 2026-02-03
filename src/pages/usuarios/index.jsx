/**
 * Usuarios Index Page
 * Listado de usuarios
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import { Table, Button, Modal, StatusBadge, Card } from '../../components/common'
import { PermissionGate } from '../../features/auth'
import usuariosService from '../../services/usuariosService'
import toast from 'react-hot-toast'
import { Plus, Edit, User, ToggleLeft, ToggleRight, Search, MapPin } from 'lucide-react'

const UsuariosIndexPage = () => {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      const response = await usuariosService.listar()
      setUsuarios(response.usuarios || [])
    } catch (error) {
      console.error('Error cargando usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id) => {
    try {
      await usuariosService.toggle(id)
      toast.success('Estado actualizado')
      cargarUsuarios()
    } catch (error) {
      toast.error('Error al actualizar estado')
    }
  }

  const getRolLabel = (rolNombre) => {
    const roles = {
      'SUPER_ADMIN': 'Super Admin',
      'ADMINISTRADOR': 'Administrador',
      'PUNTO_VENTA': 'Punto Venta',
      'ALMACEN': 'Almacen'
    }
    return roles[rolNombre] || rolNombre
  }

  const filteredUsuarios = usuarios.filter((u) =>
    u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.correo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    {
      key: 'nombres',
      header: 'Usuario',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{row.correo}</p>
          </div>
        </div>
      )
    },
    {
      key: 'rol',
      header: 'Rol',
      render: (value) => (
        <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
          {getRolLabel(value?.nombre)}
        </span>
      )
    },
    {
      key: 'punto',
      header: 'Punto Asignado',
      render: (value) => value ? (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{value.nombre}</span>
        </div>
      ) : (
        <span className="text-gray-400">Sin asignar</span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (value) => (
        <StatusBadge status={value === 1 ? 'ACTIVO' : 'INACTIVO'} />
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <PermissionGate permission="USUARIOS_EDITAR">
            <Button
              variant="ghost"
              size="sm"
              icon={Edit}
              onClick={() => navigate(`/usuarios/${row.id}/editar`)}
            >
              Editar
            </Button>
          </PermissionGate>
          <PermissionGate permission="USUARIOS_EDITAR">
            <Button
              variant="ghost"
              size="sm"
              icon={row.estado === 1 ? ToggleRight : ToggleLeft}
              onClick={() => handleToggle(row.id)}
            >
              {row.estado === 1 ? 'Desactivar' : 'Activar'}
            </Button>
          </PermissionGate>
        </div>
      )
    }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-500">Gestion de usuarios del sistema</p>
          </div>
          <PermissionGate permission="USUARIOS_CREAR">
            <Button
              icon={Plus}
              onClick={() => navigate('/usuarios/nuevo')}
            >
              Nuevo Usuario
            </Button>
          </PermissionGate>
        </div>

        {/* Search */}
        <Card padding={false}>
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <Table
            columns={columns}
            data={filteredUsuarios}
            loading={loading}
            emptyMessage="No hay usuarios registrados"
          />
        </Card>
      </div>
    </MainLayout>
  )
}

export default UsuariosIndexPage
