/**
 * Horarios Index Page
 * Gestion de horarios por ruta
 */

import { useState, useEffect } from 'react'
import { Table, Button, Modal, Card, Select, Input, StatusBadge } from '../../components/common'
import { useRutasApi } from '../../hooks/useApi'
import horariosService from '../../services/horariosService'
import { formatTimeOnly } from '../../utils/dateUtils'
import toast from 'react-hot-toast'
import { Plus, Clock, ToggleLeft, ToggleRight, Trash2, ArrowRight } from 'lucide-react'

const HorariosIndexPage = () => {
  const { rutas, listar: listarRutas } = useRutasApi()
  const [selectedRuta, setSelectedRuta] = useState('')
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [newHorario, setNewHorario] = useState('')
  const [newCapacidad, setNewCapacidad] = useState('40')
  const [rutaInfo, setRutaInfo] = useState(null)

  useEffect(() => {
    listarRutas()
  }, [listarRutas])

  useEffect(() => {
    if (selectedRuta) {
      cargarHorarios()
      const ruta = rutas.find((r) => r.id === parseInt(selectedRuta))
      setRutaInfo(ruta)
    } else {
      setHorarios([])
      setRutaInfo(null)
    }
  }, [selectedRuta, rutas])

  const cargarHorarios = async () => {
    try {
      setLoading(true)
      const response = await horariosService.listarPorRuta(selectedRuta)
      // Ordenar por hora (ignorando la fecha, solo comparando HH:MM en formato 24h)
      const horariosOrdenados = (response.horarios || []).sort((a, b) => {
        const horaA = new Date(a.horaSalida)
        const horaB = new Date(b.horaSalida)
        // Usar hora UTC porque así se almacenan los campos TIME
        const minutosA = horaA.getUTCHours() * 60 + horaA.getUTCMinutes()
        const minutosB = horaB.getUTCHours() * 60 + horaB.getUTCMinutes()
        return minutosA - minutosB
      })
      setHorarios(horariosOrdenados)
    } catch (error) {
      console.error('Error cargando horarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCrearHorario = async () => {
    if (!newHorario) {
      toast.error('Ingrese una hora valida')
      return
    }

    const capacidad = parseInt(newCapacidad) || 40
    if (capacidad <= 0) {
      toast.error('La capacidad debe ser mayor a 0')
      return
    }

    try {
      await horariosService.crear(selectedRuta, {
        horaSalida: newHorario,
        capacidadTotal: capacidad
      })
      toast.success('Horario creado exitosamente')
      setModalOpen(false)
      setNewHorario('')
      setNewCapacidad('40')
      cargarHorarios()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear horario')
    }
  }

  const handleToggle = async (id) => {
    try {
      await horariosService.toggle(id)
      toast.success('Estado actualizado')
      cargarHorarios()
    } catch (error) {
      toast.error('Error al actualizar estado')
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('Esta seguro de eliminar este horario?')) return

    try {
      await horariosService.eliminar(id)
      toast.success('Horario eliminado')
      cargarHorarios()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar horario')
    }
  }

  // Usar utilidad centralizada para formatear hora (extrae UTC hours/minutes correctamente)
  const formatTime = (timeString) => formatTimeOnly(timeString, { hour12: false })

  const rutasOptions = rutas.map((r) => ({
    value: r.id,
    label: `${r.puntoOrigen?.nombre} - ${r.puntoDestino?.nombre} (${r.tipoCarro?.nombre || 'Sin tipo'})`
  }))

  const columns = [
    {
      key: 'horaSalida',
      header: 'Hora de Salida',
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <span className="font-medium text-gray-900 text-lg">{formatTime(value)}</span>
        </div>
      )
    },
    {
      key: 'capacidadTotal',
      header: 'Capacidad',
      render: (value) => (
        <span className="text-gray-600">{value} pasajeros</span>
      )
    },
    {
      key: 'habilitado',
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
          <Button
            variant="ghost"
            size="sm"
            icon={row.habilitado ? ToggleRight : ToggleLeft}
            onClick={() => handleToggle(row.id)}
          >
            {row.habilitado ? 'Deshabilitar' : 'Habilitar'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="text-red-600 hover:bg-red-50"
            onClick={() => handleEliminar(row.id)}
          >
            Eliminar
          </Button>
        </div>
      )
    }
  ]

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horarios</h1>
          <p className="text-gray-500">Gestion de horarios por ruta</p>
        </div>

        {/* Selector de Ruta */}
        <Card>
          <div className="max-w-md">
            <Select
              label="Seleccionar Ruta"
              options={rutasOptions}
              value={selectedRuta}
              onChange={(e) => setSelectedRuta(e.target.value)}
              placeholder="Seleccione una ruta..."
            />
          </div>

          {rutaInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-center gap-4">
              <span className="font-medium text-gray-900">{rutaInfo.puntoOrigen?.nombre}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">{rutaInfo.puntoDestino?.nombre}</span>
              <span className="text-gray-500">|</span>
              <span className="text-green-600 font-semibold">S/ {parseFloat(rutaInfo.precioPasaje).toFixed(2)}</span>
            </div>
          )}
        </Card>

        {/* Horarios */}
        {selectedRuta && (
          <Card
            title="Horarios de Salida"
            headerAction={
              <Button
                size="sm"
                icon={Plus}
                onClick={() => setModalOpen(true)}
              >
                Nuevo Horario
              </Button>
            }
            padding={false}
          >
            <Table
              columns={columns}
              data={horarios}
              loading={loading}
              emptyMessage="No hay horarios configurados para esta ruta"
            />
          </Card>
        )}
      </div>

      {/* Modal Nuevo Horario */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo Horario"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearHorario}>
              Crear Horario
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Hora de Salida"
            type="time"
            value={newHorario}
            onChange={(e) => setNewHorario(e.target.value)}
            required
          />
          <Input
            label="Capacidad (Pasajeros)"
            type="number"
            min="1"
            placeholder="Ej: 40"
            value={newCapacidad}
            onChange={(e) => setNewCapacidad(e.target.value)}
            required
          />
        </div>
      </Modal>
    </>
  )
}

export default HorariosIndexPage
