/**
 * Tipos de Carro Page
 * Gestión de tipos de vehículo con CRUD inline
 */

import { useState, useEffect } from 'react'
import { Table, Button, Modal, StatusBadge, Card, Input } from '../../components/common'
import { PermissionGate } from '../../features/auth'
import { useTiposCarroApi } from '../../hooks/useApi'
import { Plus, Edit, Trash2, Car, Save, X } from 'lucide-react'

const TiposCarroPage = () => {
  const { tiposCarro, loading, listar, crear, actualizar, eliminar } = useTiposCarroApi()
  const [deleteModal, setDeleteModal] = useState({ open: false, tipoCarro: null })
  const [editModal, setEditModal] = useState({ open: false, tipoCarro: null })
  const [createModal, setCreateModal] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    listar()
  }, [listar])

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '' })
    setErrors({})
  }

  const handleOpenCreate = () => {
    resetForm()
    setCreateModal(true)
  }

  const handleOpenEdit = (tipoCarro) => {
    setFormData({
      nombre: tipoCarro.nombre,
      descripcion: tipoCarro.descripcion || ''
    })
    setErrors({})
    setEditModal({ open: true, tipoCarro })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async () => {
    if (!validate()) return

    try {
      setSaving(true)
      await crear({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null
      })
      setCreateModal(false)
      resetForm()
      listar()
    } catch (error) {
      console.error('Error creando tipo de carro:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!validate()) return

    try {
      setSaving(true)
      await actualizar(editModal.tipoCarro.id, {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null
      })
      setEditModal({ open: false, tipoCarro: null })
      resetForm()
      listar()
    } catch (error) {
      console.error('Error actualizando tipo de carro:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.tipoCarro) return

    try {
      await eliminar(deleteModal.tipoCarro.id)
      setDeleteModal({ open: false, tipoCarro: null })
      listar()
    } catch (error) {
      console.error('Error eliminando tipo de carro:', error)
    }
  }

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-purple-600" />
          </div>
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'descripcion',
      header: 'Descripcion',
      render: (value) => (
        <span className="text-gray-600">{value || 'Sin descripcion'}</span>
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
          <PermissionGate permission="RUTAS_EDITAR">
            <Button
              variant="ghost"
              size="sm"
              icon={Edit}
              onClick={() => handleOpenEdit(row)}
            >
              Editar
            </Button>
          </PermissionGate>
          <PermissionGate permission="RUTAS_ELIMINAR">
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              className="text-red-600 hover:bg-red-50"
              onClick={() => setDeleteModal({ open: true, tipoCarro: row })}
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
            <h1 className="text-2xl font-bold text-gray-900">Tipos de Carro</h1>
            <p className="text-gray-500">Gestiona los tipos de vehiculo para las rutas</p>
          </div>
          <PermissionGate permission="RUTAS_CREAR">
            <Button icon={Plus} onClick={handleOpenCreate}>
              Nuevo Tipo
            </Button>
          </PermissionGate>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> Los tipos de carro permiten crear multiples rutas con el mismo
            origen y destino pero diferentes precios segun el tipo de vehiculo (ej: Estandar, VIP, Ejecutivo).
          </p>
        </div>

        {/* Table */}
        <Card padding={false}>
          <Table
            columns={columns}
            data={tiposCarro}
            loading={loading}
            emptyMessage="No hay tipos de carro registrados"
          />
        </Card>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Nuevo Tipo de Carro"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModal(false)}>
              Cancelar
            </Button>
            <Button icon={Save} onClick={handleCreate} loading={saving}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Ej: VIP, Ejecutivo, Estandar"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            error={errors.nombre}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripcion
            </label>
            <textarea
              placeholder="Descripcion opcional del tipo de vehiculo"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, tipoCarro: null })}
        title="Editar Tipo de Carro"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditModal({ open: false, tipoCarro: null })}
            >
              Cancelar
            </Button>
            <Button icon={Save} onClick={handleUpdate} loading={saving}>
              Guardar Cambios
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Ej: VIP, Ejecutivo, Estandar"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            error={errors.nombre}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripcion
            </label>
            <textarea
              placeholder="Descripcion opcional del tipo de vehiculo"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, tipoCarro: null })}
        title="Eliminar Tipo de Carro"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, tipoCarro: null })}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Esta seguro que desea eliminar el tipo de carro{' '}
          <span className="font-semibold">{deleteModal.tipoCarro?.nombre}</span>?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Esta accion desactivara el tipo y no podra ser usado en nuevas rutas.
          Las rutas existentes no seran afectadas.
        </p>
      </Modal>
    </>
  )
}

export default TiposCarroPage
