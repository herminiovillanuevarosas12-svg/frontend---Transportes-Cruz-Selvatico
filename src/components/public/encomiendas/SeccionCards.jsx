/**
 * Sección de cards de /encomiendas-info (vista pública).
 * Desktop: hasta CARDS_VISIBLES_DESKTOP a la vez, con flechas si hay más.
 * Celular: una card a la vez con flechas e indicadores.
 */

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CardEncomienda from './CardEncomienda'
import {
  CARDS_VISIBLES_DESKTOP,
  CLASE_GRID_DESKTOP,
  calcularVentana,
  indiceCircular,
} from '../../../utils/seccionesCards'

export const ESTILO_TITULO_SECCION = 'text-2xl lg:text-3xl font-bold text-gray-900 border-l-4 border-secondary-500 pl-4'

const BotonFlecha = ({ onClick, label, children }) => (
  <button
    onClick={onClick}
    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 hover:border-secondary-500 hover:text-secondary-500 transition-colors"
    aria-label={label}
  >
    {children}
  </button>
)

// Flechas: en desktop solo si hay más cards que las visibles; en celular si hay más de una
const clasesFlechas = (total) => {
  if (total > CARDS_VISIBLES_DESKTOP) return 'flex'
  if (total > 1) return 'flex md:hidden'
  return 'hidden'
}

const SeccionCards = ({ seccion }) => {
  const [indice, setIndice] = useState(0)
  const { cards } = seccion
  const total = cards.length
  const actual = indiceCircular(indice, total)
  const ventanaDesktop = calcularVentana(total, actual, CARDS_VISIBLES_DESKTOP)

  const mover = (paso) => setIndice(indiceCircular(actual + paso, total))

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 mb-10">
          <h2 className={ESTILO_TITULO_SECCION}>{seccion.titulo}</h2>
          <div className={`items-center gap-2 ${clasesFlechas(total)}`}>
            <BotonFlecha onClick={() => mover(-1)} label="Anterior">
              <ChevronLeft className="w-5 h-5" />
            </BotonFlecha>
            <BotonFlecha onClick={() => mover(1)} label="Siguiente">
              <ChevronRight className="w-5 h-5" />
            </BotonFlecha>
          </div>
        </div>

        {/* Desktop */}
        <div className={`hidden md:grid ${CLASE_GRID_DESKTOP} gap-8`}>
          {ventanaDesktop.map((i) => (
            <CardEncomienda
              key={cards[i].id}
              card={cards[i]}
              className="hover:shadow-lg transition-all duration-300"
            />
          ))}
        </div>

        {/* Celular */}
        <div className="md:hidden">
          <CardEncomienda key={cards[actual].id} card={cards[actual]} className="animate-fade-in" />
          {total > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {cards.map((card, i) => (
                <button
                  key={card.id}
                  onClick={() => setIndice(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === actual ? 'bg-secondary-500 w-6' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`${seccion.titulo} ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export const SeccionCardsSkeleton = () => (
  <section className="bg-white py-16 lg:py-20">
    <div className="max-w-7xl mx-auto px-4">
      <div className="h-8 w-64 bg-gray-200 rounded mb-10 animate-pulse" />
      <div className={`grid grid-cols-1 ${CLASE_GRID_DESKTOP} gap-8`}>
        {Array.from({ length: CARDS_VISIBLES_DESKTOP }, (_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-6 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default SeccionCards
