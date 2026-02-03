/**
 * Rutas Index Page
 * Listado de rutas
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import { Table, Button, Modal, StatusBadge, Card } from '../../components/common'
import { PermissionGate } from '../../features/auth'
import { useRutasApi } from '../../hooks/useApi'
import { Plus, Edit, Trash2, Route, ArrowRight, Car } from 'lucide-react'

const RutasIndexPage = () => {
  const navigate = useNavigate()
  const { rutas, loading, listar, eliminar } = useRutasApi()
  const [deleteModal, setDeleteModal] = useState({ open: false, ruta: null })

  useEffect(() => {
    listar()
  }, [listar])

  const handleDelete = async () => {
    if (!deleteModal.ruta) return

    try {
      await eliminar(deleteModal.ruta.id)
      setDeleteModal({ open: false, ruta: null })
      listar()
    } catch (error) {
      console.error('Error eliminando ruta:', error)
    }
  }

  const columns = [
    {
      key: 'ruta',
      header: 'Ruta',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Route className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{row.puntoOrigen?.nombre}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">{row.puntoDestino?.nombre}</span>
          </div>
        </div>
      )
    },
    {
      key: 'ciudades',
      header: 'Ciudades',
      render: (_, row) => (
        <span className="text-gray-600">
          {row.puntoOrigen?.ciudad} - {row.puntoDestino?.ciudad}
        </span>
      )
    },
    {
      key: 'tipoCarro',
      header: 'Tipo de Carro',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-purple-500" />
          <span className="text-gray-700 font-medium">{value?.nombre || 'Sin tipo'}</span>
        </div>
      )
    },
    {
      key: 'precioPasaje',
      header: 'Precio',
      render: (value) => (
        <span className="font-semibold text-green-600">
          S/ {parseFloat(value).toFixed(2)}
        </span>
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
              onClick={() => navigate(`/rutas/${row.id}/editar`)}
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
              onClick={() => setDeleteModal({ open: true, ruta: row })}
            >
              Eliminar
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
            <h1 className="text-2xl font-bold text-gray-900">Rutas</h1>
            <p className="text-gray-500">Gestion de rutas de transporte</p>
          </div>
          <PermissionGate permission="RUTAS_CREAR">
            <Button
              icon={Plus}
              onClick={() => navigate('/rutas/nuevo')}
            >
              Nueva Ruta
            </Button>
          </PermissionGate>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={rutas}
          loading={loading}
          emptyMessage="No hay rutas registradas"
        />
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, ruta: null })}
        title="Eliminar Ruta"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, ruta: null })}
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
          Esta seguro que desea eliminar la ruta{' '}
          <span className="font-semibold">
            {deleteModal.ruta?.puntoOrigen?.nombre} - {deleteModal.ruta?.puntoDestino?.nombre}
          </span>?
        </p>
      </Modal>
    </MainLayout>
  )
}

export default RutasIndexPage
