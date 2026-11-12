/**
 * Modo edición de las secciones de cards de /encomiendas-info (solo SUPER_ADMIN).
 * Se carga bajo demanda (React.lazy): los visitantes no descargan este código ni @dnd-kit.
 * Cada cambio se guarda y publica al confirmarlo.
 */

import { useEffect, useRef, useState } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import toast from 'react-hot-toast'
import { AlertTriangle, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import Modal from '../../../common/Modal'
import { useAuthStore } from '../../../../features/auth/authStore'
import seccionesCardsService from '../../../../services/seccionesCardsService'
import { SeccionCardsSkeleton, ESTILO_TITULO_SECCION } from '../SeccionCards'
import SeccionEditable from './SeccionEditable'
import TextoEditable from './TextoEditable'

const aFormData = (campos) => {
  const formData = new FormData()
  Object.entries(campos).forEach(([campo, valor]) => formData.append(campo, valor))
  return formData
}

const moverPorId = (lista, { active, over }) => {
  if (!over || active.id === over.id) return null
  const desde = lista.findIndex((item) => item.id === active.id)
  const hasta = lista.findIndex((item) => item.id === over.id)
  if (desde < 0 || hasta < 0) return null
  return arrayMove(lista, desde, hasta)
}

const EditorSeccionesCards = ({ onSalir }) => {
  const [secciones, setSecciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(false)
  const [creandoSeccion, setCreandoSeccion] = useState(false)
  const [confirmacion, setConfirmacion] = useState(null)
  const [confirmando, setConfirmando] = useState(false)
  const onSalirRef = useRef(onSalir)
  onSalirRef.current = onSalir

  // Agarraderas con touch-action: none, así PointerSensor sirve para mouse y pantallas táctiles
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const notificarError = (error, mensaje) => {
    const status = error?.response?.status
    if (status === 401) {
      useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
      toast.error('Tu sesión expiró. Inicia sesión nuevamente para seguir editando.')
      onSalirRef.current()
    } else if (status === 403) {
      toast.error('No tienes permiso para editar estas secciones.')
      onSalirRef.current()
    } else {
      toast.error(error?.response?.data?.error || mensaje)
    }
  }

  // Para ediciones de texto: relanza el error para que el campo siga en edición
  const ejecutar = async (operacion, mensajeError) => {
    try {
      return await operacion()
    } catch (error) {
      notificarError(error, mensajeError)
      throw error
    }
  }

  // Si la carga falla no se ofrece editar: con la lista vacía el usuario recrearía contenido existente
  const cargar = () => {
    setCargando(true)
    setErrorCarga(false)
    seccionesCardsService
      .listarAdmin()
      .then((res) => setSecciones(res.secciones || []))
      .catch((error) => {
        setErrorCarga(true)
        notificarError(error, 'No se pudieron cargar las secciones')
      })
      .finally(() => setCargando(false))
  }

  // Carga al entrar al modo edición
  useEffect(() => {
    cargar()
  }, [])

  const actualizarSeccion = (idSeccion, transformar) =>
    setSecciones((prev) => prev.map((s) => (s.id === idSeccion ? transformar(s) : s)))

  const actualizarCardEnSeccion = (idSeccion, idCard, transformar) =>
    actualizarSeccion(idSeccion, (s) => ({
      ...s,
      cards: s.cards.map((c) => (c.id === idCard ? transformar(c) : c)),
    }))

  const pedirConfirmacion = (titulo, mensaje, accion) => setConfirmacion({ titulo, mensaje, accion })

  const confirmar = async () => {
    setConfirmando(true)
    try {
      await confirmacion.accion()
      setConfirmacion(null)
    } catch {
      // Error ya notificado; el modal queda abierto para reintentar o cancelar
    } finally {
      setConfirmando(false)
    }
  }

  const acciones = {
    renombrarSeccion: async (idSeccion, titulo) => {
      const { seccion } = await ejecutar(
        () => seccionesCardsService.renombrarSeccion(idSeccion, titulo),
        'No se pudo guardar el título'
      )
      actualizarSeccion(idSeccion, (s) => ({ ...s, titulo: seccion.titulo }))
    },

    toggleSeccion: async (seccion) => {
      try {
        const { activo } = await seccionesCardsService.toggleSeccion(seccion.id)
        actualizarSeccion(seccion.id, (s) => ({ ...s, activo }))
      } catch (error) {
        notificarError(error, 'No se pudo cambiar la visibilidad de la sección')
      }
    },

    eliminarSeccion: (seccion) => {
      const total = seccion.cards.length
      const detalle = total > 0 ? ` y sus ${total} card${total === 1 ? '' : 's'}` : ''
      pedirConfirmacion(
        'Eliminar sección',
        `Se eliminará "${seccion.titulo}"${detalle}. Esta acción no se puede deshacer.`,
        async () => {
          await ejecutar(() => seccionesCardsService.eliminarSeccion(seccion.id), 'No se pudo eliminar la sección')
          setSecciones((prev) => prev.filter((s) => s.id !== seccion.id))
          toast.success('Sección eliminada')
        }
      )
    },

    crearCard: async (idSeccion, titulo) => {
      const { card } = await ejecutar(
        () => seccionesCardsService.crearCard(aFormData({ idSeccion, titulo })),
        'No se pudo crear la card'
      )
      actualizarSeccion(idSeccion, (s) => ({ ...s, cards: [...s.cards, card] }))
    },

    guardarCard: async (card, campos) => {
      const { card: actualizada } = await ejecutar(
        () => seccionesCardsService.actualizarCard(card.id, aFormData(campos)),
        'No se pudo guardar la card'
      )
      actualizarCardEnSeccion(card.idSeccion, card.id, () => actualizada)
    },

    toggleCard: async (card) => {
      try {
        const { activo } = await seccionesCardsService.toggleCard(card.id)
        actualizarCardEnSeccion(card.idSeccion, card.id, (c) => ({ ...c, activo }))
      } catch (error) {
        notificarError(error, 'No se pudo cambiar la visibilidad de la card')
      }
    },

    eliminarCard: (card) => {
      pedirConfirmacion(
        'Eliminar card',
        `Se eliminará "${card.titulo}". Esta acción no se puede deshacer.`,
        async () => {
          await ejecutar(() => seccionesCardsService.eliminarCard(card.id), 'No se pudo eliminar la card')
          actualizarSeccion(card.idSeccion, (s) => ({ ...s, cards: s.cards.filter((c) => c.id !== card.id) }))
          toast.success('Card eliminada')
        }
      )
    },

    reordenarCards: async (idSeccion, evento) => {
      const seccion = secciones.find((s) => s.id === idSeccion)
      const nuevas = seccion && moverPorId(seccion.cards, evento)
      if (!nuevas) return
      actualizarSeccion(idSeccion, (s) => ({ ...s, cards: nuevas }))
      try {
        await seccionesCardsService.reordenarCards(idSeccion, nuevas.map((c) => c.id))
      } catch (error) {
        actualizarSeccion(idSeccion, (s) => ({ ...s, cards: seccion.cards }))
        notificarError(error, 'No se pudo guardar el orden de las cards')
      }
    },
  }

  const crearSeccion = async (titulo) => {
    const { seccion } = await ejecutar(() => seccionesCardsService.crearSeccion(titulo), 'No se pudo crear la sección')
    setSecciones((prev) => [...prev, seccion])
    setCreandoSeccion(false)
  }

  const reordenarSecciones = async (evento) => {
    const anteriores = secciones
    const nuevas = moverPorId(anteriores, evento)
    if (!nuevas) return
    setSecciones(nuevas)
    try {
      await seccionesCardsService.reordenarSecciones(nuevas.map((s) => s.id))
    } catch (error) {
      setSecciones(anteriores)
      notificarError(error, 'No se pudo guardar el orden de las secciones')
    }
  }

  if (cargando) return <SeccionCardsSkeleton />

  if (errorCarga) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="font-semibold text-red-800">No se pudieron cargar las secciones para editarlas.</p>
          <p className="text-sm text-red-700 mt-1">Revisa tu conexión y vuelve a intentarlo.</p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={cargar}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => onSalirRef.current()}
              className="px-4 py-2 rounded-xl border border-red-300 bg-white text-red-700 text-sm font-medium hover:bg-red-50"
            >
              Volver a la vista pública
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-start gap-3 rounded-xl bg-secondary-50 border border-secondary-200 px-4 py-3 text-sm text-secondary-800">
          <Pencil className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            <strong>Modo edición.</strong> Haz clic en un texto para editarlo; cada cambio se publica al guardarlo.
            Arrastra desde la agarradera para reordenar secciones y cards.
          </p>
        </div>
      </div>

      <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={reordenarSecciones}>
        <SortableContext items={secciones.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {secciones.map((seccion) => (
              <SeccionEditable key={seccion.id} seccion={seccion} acciones={acciones} sensores={sensores} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {creandoSeccion ? (
          <div className="rounded-xl border-2 border-dashed border-secondary-300 bg-white p-6">
            <TextoEditable
              valor=""
              editandoInicial
              obligatorio
              placeholder="Título de la nueva sección"
              onGuardar={crearSeccion}
              onCancelar={() => setCreandoSeccion(false)}
              className={ESTILO_TITULO_SECCION}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreandoSeccion(true)}
            className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-white py-6 flex items-center justify-center gap-2 text-gray-500 font-medium hover:border-secondary-400 hover:text-secondary-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar sección
          </button>
        )}
      </div>

      <Modal
        isOpen={!!confirmacion}
        onClose={() => !confirmando && setConfirmacion(null)}
        title={confirmacion?.titulo}
        description={confirmacion?.mensaje}
        icon={Trash2}
        iconColor="error"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfirmacion(null)}
              disabled={confirmando}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmar}
              disabled={confirmando}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {confirmando ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        }
      />
    </div>
  )
}

export default EditorSeccionesCards
