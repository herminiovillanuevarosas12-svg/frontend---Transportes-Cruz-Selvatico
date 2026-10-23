/**
 * FlotaCrud
 * Tabla + modal de crear/editar + confirmación de eliminar, compartida por las
 * pestañas del módulo Flota. Cada pestaña define sus columnas y campos.
 */

import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Modal } from '../../components/common'
import { PermissionGate } from '../../features/auth'
import { Plus, Edit, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * @param {Object} props
 * @param {string} props.descripcion - Para qué sirve la lista
 * @param {string} props.nombreItem - Ej: 'conductor'
 * @param {string} props.nombrePlural - Ej: 'conductores'
 * @param {Object} props.servicio - { listar, crear, actualizar, eliminar }
 * @param {string} props.claveLista - Clave de la lista en la respuesta del listado
 * @param {string} props.prefijoPermiso - RUTAS | CONDUCTORES | BUSES
 * @param {Object[]} props.columnas - Columnas de la tabla (sin acciones)
 * @param {Object} props.formularioVacio - Valores iniciales del formulario
 * @param {Object<string, string>} props.camposRequeridos - campo -> mensaje si falta
 * @param {Function} props.describir - item -> texto para confirmar la eliminación
 * @param {string} props.notaEliminar - Qué pasa al eliminar
 * @param {Function} props.CamposFormulario - Componente ({ form, setCampo, errores })
 */
const FlotaCrud = ({
  descripcion,
  nombreItem,
  nombrePlural,
  servicio,
  claveLista,
  prefijoPermiso,
  columnas,
  formularioVacio,
  camposRequeridos,
  describir,
  notaEliminar,
  CamposFormulario
}) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  // editando: null = modal cerrado, {} = nuevo, item = edición
  const [editando, setEditando] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [form, setForm] = useState(formularioVacio)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  const listar = useCallback(async () => {
    try {
      setLoading(true)
      const response = await servicio.listar()
      setItems(response[claveLista] || [])
    } catch (error) {
      toast.error(error.response?.data?.error || `Error al listar ${nombrePlural}`)
    } finally {
      setLoading(false)
    }
  }, [servicio, claveLista, nombrePlural])

  useEffect(() => {
    listar()
  }, [listar])

  const abrirFormulario = (item = {}) => {
    setForm(Object.fromEntries(Object.keys(formularioVacio).map((campo) => [campo, item[campo] ?? formularioVacio[campo]])))
    setErrores({})
    setEditando(item)
  }

  const setCampo = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }))

  const validar = () => {
    const nuevosErrores = Object.fromEntries(
      Object.entries(camposRequeridos).filter(([campo]) => !String(form[campo] ?? '').trim())
    )
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const guardar = async () => {
    if (!validar()) return

    try {
      setGuardando(true)
      const { mensaje } = editando.id
        ? await servicio.actualizar(editando.id, form)
        : await servicio.crear(form)
      toast.success(mensaje)
      setEditando(null)
      listar()
    } catch (error) {
      toast.error(error.response?.data?.error || `Error al guardar el ${nombreItem}`)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    try {
      const { mensaje } = await servicio.eliminar(eliminando.id)
      toast.success(mensaje)
      setEliminando(null)
      listar()
    } catch (error) {
      toast.error(error.response?.data?.error || `Error al eliminar el ${nombreItem}`)
    }
  }

  const columnasTabla = [
    ...columnas,
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <PermissionGate permission={`${prefijoPermiso}_EDITAR`}>
            <Button variant="ghost" size="sm" icon={Edit} onClick={() => abrirFormulario(row)}>
              Editar
            </Button>
          </PermissionGate>
          <PermissionGate permission={`${prefijoPermiso}_ELIMINAR`}>
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              className="text-red-600 hover:bg-red-50"
              onClick={() => setEliminando(row)}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-b border-gray-200">
        <p className="text-sm text-gray-500">{descripcion}</p>
        <PermissionGate permission={`${prefijoPermiso}_CREAR`}>
          <Button icon={Plus} onClick={() => abrirFormulario()} className="shrink-0 whitespace-nowrap">
            Nuevo {nombreItem}
          </Button>
        </PermissionGate>
      </div>

      <Table
        columns={columnasTabla}
        data={items}
        loading={loading}
        emptyMessage={`No hay ${nombrePlural} registrados`}
      />

      <Modal
        isOpen={editando !== null}
        onClose={() => setEditando(null)}
        title={editando?.id ? `Editar ${nombreItem}` : `Nuevo ${nombreItem}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditando(null)}>
              Cancelar
            </Button>
            <Button icon={Save} onClick={guardar} loading={guardando}>
              Guardar
            </Button>
          </>
        }
      >
        <CamposFormulario form={form} setCampo={setCampo} errores={errores} />
      </Modal>

      <Modal
        isOpen={eliminando !== null}
        onClose={() => setEliminando(null)}
        title={`Eliminar ${nombreItem}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEliminando(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={eliminar}>
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          ¿Desea eliminar el {nombreItem}{' '}
          <span className="font-semibold">{eliminando && describir(eliminando)}</span>?
        </p>
        <p className="text-sm text-gray-500 mt-2">{notaEliminar}</p>
      </Modal>
    </>
  )
}

export default FlotaCrud
