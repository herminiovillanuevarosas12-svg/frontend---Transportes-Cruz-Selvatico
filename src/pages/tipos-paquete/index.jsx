/**
 * Tipos de Paquete Page
 * Gestión de configuraciones de tipos de paquete con CRUD inline
 */

import { useState, useEffect } from 'react'
import { Table, Button, Modal, StatusBadge, Card, Input } from '../../components/common'
import { PermissionGate } from '../../features/auth'
import { useConfigTiposPaqueteApi } from '../../hooks/useApi'
import { Plus, Edit, Trash2, Package, Save, Box } from 'lucide-react'

const TiposPaquetePage = () => {
  const { configuraciones, loading, listar, crear, actualizar, eliminar } = useConfigTiposPaqueteApi()
  const [deleteModal, setDeleteModal] = useState({ open: false, config: null })
  const [editModal, setEditModal] = useState({ open: false, config: null })
  const [createModal, setCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    tipo_paquete: '',
    talla: '',
    nombre_display: '',
    alto_default: '',
    ancho_default: '',
    largo_default: '',
    orden: ''
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    listar()
  }, [listar])

  const resetForm = () => {
    setFormData({
      tipo_paquete: '',
      talla: '',
      nombre_display: '',
      alto_default: '',
      ancho_default: '',
      largo_default: '',
      orden: ''
    })
    setErrors({})
  }

  const handleOpenCreate = () => {
    resetForm()
    setCreateModal(true)
  }

  const handleOpenEdit = (config) => {
    setFormData({
      tipo_paquete: config.tipo_paquete || '',
      talla: config.talla || '',
      nombre_display: config.nombre_display || '',
      alto_default: config.alto_default?.toString() || '',
      ancho_default: config.ancho_default?.toString() || '',
      largo_default: config.largo_default?.toString() || '',
      orden: config.orden?.toString() || ''
    })
    setErrors({})
    setEditModal({ open: true, config })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.tipo_paquete.trim()) {
      newErrors.tipo_paquete = 'El tipo de paquete es requerido'
    }
    if (!formData.nombre_display.trim()) {
      newErrors.nombre_display = 'El nombre display es requerido'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async () => {
    if (!validate()) return

    try {
      setSaving(true)
      await crear({
        tipo_paquete: formData.tipo_paquete.trim().toUpperCase(),
        talla: formData.talla.trim().toUpperCase() || null,
        nombre_display: formData.nombre_display.trim(),
        alto_default: parseFloat(formData.alto_default) || 0,
        ancho_default: parseFloat(formData.ancho_default) || 0,
        largo_default: parseFloat(formData.largo_default) || 0,
        orden: parseInt(formData.orden) || 0
      })
      setCreateModal(false)
      resetForm()
      listar()
    } catch (error) {
      console.error('Error creando configuración:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!validate()) return

    try {
      setSaving(true)
      await actualizar(editModal.config.id, {
        tipo_paquete: formData.tipo_paquete.trim().toUpperCase(),
        talla: formData.talla.trim().toUpperCase() || null,
        nombre_display: formData.nombre_display.trim(),
        alto_default: parseFloat(formData.alto_default) || 0,
        ancho_default: parseFloat(formData.ancho_default) || 0,
        largo_default: parseFloat(formData.largo_default) || 0,
        orden: parseInt(formData.orden) || 0
      })
      setEditModal({ open: false, config: null })
      resetForm()
      listar()
    } catch (error) {
      console.error('Error actualizando configuración:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.config) return

    try {
      await eliminar(deleteModal.config.id)
      setDeleteModal({ open: false, config: null })
      listar()
    } catch (error) {
      console.error('Error eliminando configuración:', error)
    }
  }

  const columns = [
    {
      key: 'nombre_display',
      header: 'Nombre',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <span className="font-medium text-gray-900">{value}</span>
            <div className="text-xs text-gray-500">
              {row.tipo_paquete}{row.talla ? ` - ${row.talla}` : ''}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'dimensiones',
      header: 'Dimensiones (A×An×L cm)',
      render: (_, row) => (
        <span className="text-gray-600 font-mono text-sm">
          {row.alto_default} × {row.ancho_default} × {row.largo_default}
        </span>
      )
    },
    {
      key: 'orden',
      header: 'Orden',
      render: (value) => (
        <span className="text-gray-600">{value}</span>
      )
    },
    {
      key: 'activo',
      header: 'Estado',
      render: (value) => (
        <StatusBadge status={value ? 'ACTIVO' : 'INACTIVO'} />
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <PermissionGate permission="DASHBOARD_VER">
            <Button
              variant="ghost"
              size="sm"
              icon={Edit}
              onClick={() => handleOpenEdit(row)}
            >
              Editar
            </Button>
          </PermissionGate>
          <PermissionGate permission="DASHBOARD_VER">
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              className="text-red-600 hover:bg-red-50"
              onClick={() => setDeleteModal({ open: true, config: row })}
            >
              Eliminar
            </Button>
          </PermissionGate>
        </div>
      )
    }
  ]

  // JSX del formulario (inline para evitar re-renders)
  const formFieldsJSX = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tipo de Paquete"
          placeholder="Ej: CAJA, SOBRE, BOLSA"
          value={formData.tipo_paquete}
          onChange={(e) => setFormData(prev => ({ ...prev, tipo_paquete: e.target.value.toUpperCase() }))}
          error={errors.tipo_paquete}
          required
        />
        <Input
          label="Talla (opcional)"
          placeholder="Ej: S, M, L, XL"
          value={formData.talla}
          onChange={(e) => setFormData(prev => ({ ...prev, talla: e.target.value.toUpperCase() }))}
        />
      </div>
      <Input
        label="Nombre Display"
        placeholder="Ej: Caja Mediana"
        value={formData.nombre_display}
        onChange={(e) => setFormData(prev => ({ ...prev, nombre_display: e.target.value }))}
        error={errors.nombre_display}
        required
      />
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Alto (cm)"
          type="number"
          placeholder="30"
          value={formData.alto_default}
          onChange={(e) => setFormData(prev => ({ ...prev, alto_default: e.target.value }))}
        />
        <Input
          label="Ancho (cm)"
          type="number"
          placeholder="25"
          value={formData.ancho_default}
          onChange={(e) => setFormData(prev => ({ ...prev, ancho_default: e.target.value }))}
        />
        <Input
          label="Largo (cm)"
          type="number"
          placeholder="25"
          value={formData.largo_default}
          onChange={(e) => setFormData(prev => ({ ...prev, largo_default: e.target.value }))}
        />
      </div>
      <Input
        label="Orden"
        type="number"
        placeholder="0"
        value={formData.orden}
        onChange={(e) => setFormData(prev => ({ ...prev, orden: e.target.value }))}
      />
    </div>
  )

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tipos de Paquete</h1>
            <p className="text-gray-500">Gestiona las configuraciones de tipos de paquete para encomiendas</p>
          </div>
          <PermissionGate permission="DASHBOARD_VER">
            <Button icon={Plus} onClick={handleOpenCreate}>
              Nueva Configuración
            </Button>
          </PermissionGate>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> Las configuraciones de tipos de paquete permiten predefinir dimensiones
            (alto, ancho, largo) que se autocompletan al registrar una encomienda. El peso siempre se
            ingresa manualmente. Los valores autocompletados son editables.
          </p>
        </div>

        {/* Table */}
        <Card padding={false}>
          <Table
            columns={columns}
            data={configuraciones}
            loading={loading}
            emptyMessage="No hay configuraciones de tipos de paquete registradas"
          />
        </Card>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Nueva Configuración de Tipo de Paquete"
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
        {formFieldsJSX}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, config: null })}
        title="Editar Configuración de Tipo de Paquete"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditModal({ open: false, config: null })}
            >
              Cancelar
            </Button>
            <Button icon={Save} onClick={handleUpdate} loading={saving}>
              Guardar Cambios
            </Button>
          </>
        }
      >
        {formFieldsJSX}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, config: null })}
        title="Eliminar Configuración"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, config: null })}
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
          ¿Está seguro que desea eliminar la configuración{' '}
          <span className="font-semibold">{deleteModal.config?.nombre_display}</span>?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Esta acción desactivará la configuración y no aparecerá en el registro de encomiendas.
        </p>
      </Modal>
    </>
  )
}

export default TiposPaquetePage
