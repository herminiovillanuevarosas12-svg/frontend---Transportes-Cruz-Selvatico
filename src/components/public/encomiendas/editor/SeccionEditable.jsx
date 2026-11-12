/**
 * Sección en modo edición: título editable, ocultar/mostrar, eliminar, arrastrar,
 * y sus cards reordenables (solo dentro de la sección).
 */

import { useState } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Eye, EyeOff, GripVertical, Info, Plus, Trash2 } from 'lucide-react'
import { ESTILO_TITULO_SECCION } from '../SeccionCards'
import { ESTILO_TITULO_CARD } from '../CardEncomienda'
import { CLASE_GRID_DESKTOP } from '../../../../utils/seccionesCards'
import CardEditable, { EtiquetaOculta } from './CardEditable'
import TextoEditable from './TextoEditable'

const BOTON_SECCION = 'w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-secondary-500 transition-colors'

const avisoVisibilidad = (seccion) => {
  if (!seccion.activo) return 'Sección oculta: no se muestra al público.'
  if (!seccion.cards.some((card) => card.activo)) {
    return 'No se muestra al público hasta que tenga al menos una card visible.'
  }
  return null
}

const SeccionEditable = ({ seccion, acciones, sensores }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: seccion.id })
  const [creandoCard, setCreandoCard] = useState(false)
  const aviso = avisoVisibilidad(seccion)

  const crearCard = async (titulo) => {
    await acciones.crearCard(seccion.id, titulo)
    setCreandoCard(false)
  }

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative bg-white py-12 lg:py-16 border-y-2 border-dashed border-secondary-200 ${isDragging ? 'z-30 shadow-2xl' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Arrastrar sección"
            title="Arrastrar para reordenar la sección"
            className={`${BOTON_SECCION} cursor-grab active:cursor-grabbing touch-none text-gray-500 shrink-0`}
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <div className={`flex-1 min-w-0 ${seccion.activo ? '' : 'opacity-50'}`}>
            <TextoEditable
              valor={seccion.titulo}
              obligatorio
              placeholder="Título de la sección"
              onGuardar={(titulo) => acciones.renombrarSeccion(seccion.id, titulo)}
              className={ESTILO_TITULO_SECCION}
            />
          </div>
          {!seccion.activo && <EtiquetaOculta />}
          <button
            type="button"
            onClick={() => acciones.toggleSeccion(seccion)}
            aria-label={seccion.activo ? 'Ocultar sección' : 'Mostrar sección'}
            title={seccion.activo ? 'Ocultar sección' : 'Mostrar sección'}
            className={`${BOTON_SECCION} shrink-0 ${seccion.activo ? 'text-green-600' : 'text-gray-400'}`}
          >
            {seccion.activo ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={() => acciones.eliminarSeccion(seccion)}
            aria-label="Eliminar sección"
            title="Eliminar sección"
            className={`${BOTON_SECCION} shrink-0 text-red-600 hover:border-red-500`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {aviso && (
          <p className="mb-6 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Info className="w-4 h-4 shrink-0" />
            {aviso}
          </p>
        )}

        <DndContext
          sensors={sensores}
          collisionDetection={closestCenter}
          onDragEnd={(evento) => acciones.reordenarCards(seccion.id, evento)}
        >
          <SortableContext items={seccion.cards.map((card) => card.id)} strategy={rectSortingStrategy}>
            <div className={`grid grid-cols-1 ${CLASE_GRID_DESKTOP} gap-8 mt-6`}>
              {seccion.cards.map((card) => (
                <CardEditable key={card.id} card={card} acciones={acciones} />
              ))}

              {creandoCard ? (
                <div className="rounded-xl border-2 border-dashed border-secondary-300 p-6 flex flex-col justify-center min-h-[12rem]">
                  <TextoEditable
                    valor=""
                    editandoInicial
                    obligatorio
                    placeholder="Título de la nueva card"
                    onGuardar={crearCard}
                    onCancelar={() => setCreandoCard(false)}
                    className={ESTILO_TITULO_CARD}
                  />
                  <p className="mt-3 text-xs text-gray-400">Después podrás agregar la descripción y la imagen.</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreandoCard(true)}
                  className="rounded-xl border-2 border-dashed border-gray-300 min-h-[12rem] flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-secondary-400 hover:text-secondary-500 transition-colors"
                >
                  <Plus className="w-8 h-8" />
                  <span className="font-medium">Agregar card</span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </section>
  )
}

export default SeccionEditable
