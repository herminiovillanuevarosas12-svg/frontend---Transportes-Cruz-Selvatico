/**
 * PlanificadorStepper - Stepper dinamico de N pasos
 * Cada paso = "Tramo N: Origen → Destino"
 * Visual copiado de BookingStepper
 */

import { Check } from 'lucide-react'

const PlanificadorStepper = ({ tramos, tramoActivoId }) => {
  if (!tramos || tramos.length <= 1) return null

  const indiceActivo = tramos.findIndex(t => t.id === tramoActivoId)

  return (
    <div className="w-full">
      {/* Vista desktop */}
      <div className="hidden md:flex items-center justify-between">
        {tramos.map((tramo, index) => {
          const isCompleted = tramo.completado && tramo.id !== tramoActivoId
          const isActive = tramo.id === tramoActivoId
          const label = tramo.origen && tramo.destino
            ? `${tramo.origen} → ${tramo.destino}`
            : `Tramo ${index + 1}`

          return (
            <div key={tramo.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                        ? 'bg-secondary-500 text-white ring-4 ring-secondary-100'
                        : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center max-w-[120px] truncate ${
                    isCompleted
                      ? 'text-green-600'
                      : isActive
                        ? 'text-secondary-600'
                        : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>

              {index < tramos.length - 1 && (
                <div className="flex-1 mx-3 mt-[-1.25rem]">
                  <div
                    className={`h-0.5 w-full transition-colors ${
                      tramo.completado ? 'bg-green-400' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Vista mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary-500 text-white flex items-center justify-center text-sm font-bold ring-4 ring-secondary-100">
            {indiceActivo + 1}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {tramos[indiceActivo]?.origen && tramos[indiceActivo]?.destino
                ? `${tramos[indiceActivo].origen} → ${tramos[indiceActivo].destino}`
                : `Tramo ${indiceActivo + 1}`}
            </p>
            <p className="text-xs text-gray-400">
              Tramo {indiceActivo + 1} de {tramos.length}
            </p>
          </div>
        </div>
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-secondary-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${((indiceActivo + 1) / tramos.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default PlanificadorStepper
