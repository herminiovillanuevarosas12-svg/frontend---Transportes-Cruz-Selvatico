/**
 * Card en modo edición: mismo diseño que la pública, con textos editables en el lugar,
 * imagen o ícono, ocultar/mostrar, eliminar y agarradera para arrastrar.
 */

import { useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Eye, EyeOff, GripVertical, ImagePlus, Trash2, XCircle } from 'lucide-react'
import CardEncomienda, { CardMedia, ESTILO_DESCRIPCION_CARD, ESTILO_TITULO_CARD } from '../CardEncomienda'
import { ICONOS_CARDS } from '../iconosCards'
import { FORMATOS_IMAGEN_CARD } from '../../../../utils/seccionesCards'
import TextoEditable from './TextoEditable'

export const EtiquetaOculta = () => (
  <span className="px-2 py-0.5 rounded-full bg-gray-800/80 text-white text-xs font-medium">Oculta</span>
)

const BOTON_BARRA = 'px-2.5 py-1.5 rounded-lg bg-white/95 text-gray-700 text-xs font-medium shadow hover:bg-white flex items-center gap-1.5 disabled:opacity-50'
const BOTON_ICONO = 'w-8 h-8 rounded-lg bg-white/95 shadow flex items-center justify-center hover:bg-white'

const MediaEditable = ({ card, acciones }) => {
  const inputRef = useRef(null)
  const [ocupado, setOcupado] = useState(false)

  const guardar = async (campos) => {
    setOcupado(true)
    try {
      await acciones.guardarCard(card, campos)
    } catch {
      // Error ya notificado por el editor
    } finally {
      setOcupado(false)
    }
  }

  const alElegirArchivo = (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (archivo) guardar({ imagen: archivo })
  }

  return (
    <div className="relative">
      <CardMedia card={card} />
      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-center gap-2">
        <button type="button" disabled={ocupado} onClick={() => inputRef.current?.click()} className={BOTON_BARRA}>
          <ImagePlus className="w-3.5 h-3.5" />
          {card.imagenPath ? 'Cambiar imagen' : 'Subir imagen'}
        </button>
        {card.imagenPath ? (
          <button type="button" disabled={ocupado} onClick={() => guardar({ quitarImagen: 'true' })} className={BOTON_BARRA}>
            <XCircle className="w-3.5 h-3.5" />
            Quitar imagen
          </button>
        ) : (
          <select
            value={card.icono || ICONOS_CARDS[0].key}
            disabled={ocupado}
            onChange={(e) => guardar({ icono: e.target.value })}
            aria-label="Ícono de la card"
            className="px-2 py-1.5 rounded-lg bg-white/95 text-gray-700 text-xs font-medium shadow border-0 focus:ring-2 focus:ring-secondary-400"
          >
            {ICONOS_CARDS.map(({ key, label }) => (
              <option key={key} value={key}>Ícono: {label}</option>
            ))}
          </select>
        )}
      </div>
      {ocupado && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-secondary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <input ref={inputRef} type="file" accept={FORMATOS_IMAGEN_CARD} onChange={alElegirArchivo} className="hidden" />
    </div>
  )
}

const CardEditable = ({ card, acciones }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative ${isDragging ? 'z-20 shadow-2xl' : ''}`}
    >
      <CardEncomienda
        card={card}
        className={card.activo ? '' : 'opacity-50'}
        media={<MediaEditable card={card} acciones={acciones} />}
        titulo={
          <div className="mb-2">
            <TextoEditable
              valor={card.titulo}
              obligatorio
              placeholder="Título de la card"
              onGuardar={(titulo) => acciones.guardarCard(card, { titulo })}
              className={ESTILO_TITULO_CARD}
            />
          </div>
        }
        descripcion={
          <TextoEditable
            valor={card.descripcion}
            multilinea
            placeholder="Agregar descripción"
            onGuardar={(descripcion) => acciones.guardarCard(card, { descripcion })}
            className={ESTILO_DESCRIPCION_CARD}
          />
        }
      />

      {/* Barra de acciones (fuera del contenido atenuado) */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Arrastrar card"
            title="Arrastrar para reordenar"
            className={`${BOTON_ICONO} cursor-grab active:cursor-grabbing touch-none text-gray-600`}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          {!card.activo && <EtiquetaOculta />}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => acciones.toggleCard(card)}
            aria-label={card.activo ? 'Ocultar card' : 'Mostrar card'}
            title={card.activo ? 'Ocultar' : 'Mostrar'}
            className={`${BOTON_ICONO} ${card.activo ? 'text-green-600' : 'text-gray-400'}`}
          >
            {card.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => acciones.eliminarCard(card)}
            aria-label="Eliminar card"
            title="Eliminar"
            className={`${BOTON_ICONO} text-red-600`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CardEditable
