/**
 * HorarioSelector - Grid de tarjetas de horarios disponibles
 * Muestra hora, precio, capacidad. Tarjeta seleccionada con ring verde.
 */

import { Clock, Users, Check } from 'lucide-react'
import { formatearHora, formatearPrecio } from '../../features/planificador/helpers'

const HorarioSelector = ({ horarios, seleccionado, onSeleccionar }) => {
  if (!horarios || horarios.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No hay horarios disponibles para esta ruta.
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Selecciona un horario:</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {horarios.map(horario => {
          const isSelected = seleccionado?.id === horario.id
          return (
            <button
              key={horario.id}
              onClick={() => onSeleccionar(horario)}
              className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                  : 'border-gray-200 bg-white hover:border-secondary-300 hover:shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="w-4 h-4 text-primary-500" />
                <span className="text-base font-bold text-gray-900">
                  {formatearHora(horario.hora)}
                </span>
              </div>
              <p className="text-secondary-600 font-bold text-sm">
                {formatearPrecio(horario.precio)}
              </p>
              {horario.capacidad && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {horario.capacidad} asientos
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default HorarioSelector
