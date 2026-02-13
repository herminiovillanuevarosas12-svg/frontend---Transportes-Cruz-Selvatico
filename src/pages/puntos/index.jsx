/**
 * Puntos Index Page
 * Listado de puntos con CRUD
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Modal, StatusBadge, Card } from '../../components/common'
import { PermissionGate } from '../../features/auth'
import { usePuntosApi } from '../../hooks/useApi'
import { Plus, Edit, Trash2, MapPin, Search } from 'lucide-react'

const PuntosIndexPage = () => {
  const navigate = useNavigate()
  const { puntos, loading, listar, eliminar } = usePuntosApi()
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState({ open: false, punto: null })

  useEffect(() => {
    listar()
  }, [listar])

  const handleDelete = async () => {
    if (!deleteModal.punto) return

    try {
      await eliminar(deleteModal.punto.id)
      setDeleteModal({ open: false, punto: null })
      listar()
    } catch (error) {
      console.error('Error eliminando punto:', error)
    }
  }

  const filteredPuntos = puntos.filter((punto) =>
    punto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    punto.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{row.direccion || 'Sin direccion'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'ciudad',
      header: 'Ciudad',
      render: (value) => (
        <span className="text-gray-600">{value}</span>
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
          <PermissionGate permission="PUNTOS_EDITAR">
            <Button
              variant="ghost"
              size="sm"
              icon={Edit}
              onClick={() => navigate(`/puntos/${row.id}/editar`)}
            >
              Editar
            </Button>
          </PermissionGate>
          <PermissionGate permission="PUNTOS_ELIMINAR">
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              className="text-red-600 hover:bg-red-50"
              onClick={() => setDeleteModal({ open: true, punto: row })}
            >
              Eliminar
            </Button>
          </PermissionGate>
        </div>
      )
    }
  ]

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Puntos</h1>
            <p className="text-gray-500">Gestion de agencias y terminales</p>
          </div>
          <PermissionGate permission="PUNTOS_CREAR">
            <Button
              icon={Plus}
              onClick={() => navigate('/puntos/nuevo')}
            >
              Nuevo Punto
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
                placeholder="Buscar por nombre o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <Table
            columns={columns}
            data={filteredPuntos}
            loading={loading}
            emptyMessage="No hay puntos registrados"
          />
        </Card>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, punto: null })}
        title="Eliminar Punto"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, punto: null })}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Esta seguro que desea eliminar el punto{' '}
          <span className="font-semibold">{deleteModal.punto?.nombre}</span>?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Esta accion desactivara el punto y no podra ser usado en nuevas operaciones.
        </p>
      </Modal>
    </>
  )
}

export default PuntosIndexPage
