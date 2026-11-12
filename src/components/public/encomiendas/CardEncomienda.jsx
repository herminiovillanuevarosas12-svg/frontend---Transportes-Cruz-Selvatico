/**
 * Card de una sección de /encomiendas-info: imagen (o ícono), título y descripción.
 * El editor reutiliza el mismo marco reemplazando cada parte con su versión editable.
 */

import { getUploadUrl } from '../../../services/apiClient'
import { obtenerIconoCard } from './iconosCards'

export const CardMedia = ({ card }) => {
  if (card.imagenPath) {
    return (
      <div className="h-60 overflow-hidden">
        <img src={getUploadUrl(card.imagenPath)} alt={card.titulo} className="w-full h-full object-cover" />
      </div>
    )
  }

  const Icono = obtenerIconoCard(card.icono)
  return (
    <div className="h-60 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
      <div className="w-20 h-20 rounded-full border-2 border-secondary-500 flex items-center justify-center">
        <Icono className="w-10 h-10 text-secondary-500" />
      </div>
    </div>
  )
}

export const ESTILO_TITULO_CARD = 'text-lg font-bold text-secondary-500'
export const ESTILO_DESCRIPCION_CARD = 'text-gray-500 text-sm leading-relaxed'

const CardEncomienda = ({ card, className = '', media, titulo, descripcion }) => (
  <div className={`rounded-xl border border-gray-200 overflow-hidden bg-white ${className}`}>
    {media ?? <CardMedia card={card} />}
    <div className="p-6">
      {titulo ?? <h3 className={`${ESTILO_TITULO_CARD} mb-2`}>{card.titulo}</h3>}
      {descripcion ?? (card.descripcion && <p className={ESTILO_DESCRIPCION_CARD}>{card.descripcion}</p>)}
    </div>
  </div>
)

export default CardEncomienda
