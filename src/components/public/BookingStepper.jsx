/**
 * BookingStepper - Stepper visual de 4 pasos para el flujo de reserva
 * Props: pasoActual (1-4)
 */

import { Check } from 'lucide-react'

const PASOS = [
  { numero: 1, label: 'Destino y fecha' },
  { numero: 2, label: 'Selecciona asientos' },
  { numero: 3, label: 'Registra tus datos' },
  { numero: 4, label: 'Realiza el pago' },
]

const BookingStepper = ({ pasoActual = 1 }) => {
  return (
    <div className="w-full">
      {/* Vista desktop: todos los pasos */}
      <div className="hidden md:flex items-center justify-between">
        {PASOS.map((paso, index) => {
          const isCompleted = paso.numero < pasoActual
          const isActive = paso.numero === pasoActual
          const isFuture = paso.numero > pasoActual

          return (
            <div key={paso.numero} className="flex items-center flex-1 last:flex-none">
              {/* Paso */}
              <div className="flex flex-col items-center">
                {/* Circulo */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isCompleted
                      ? 'bg-primary-600 text-white'
                      : isActive
                        ? 'bg-secondary-500 text-white ring-4 ring-secondary-100'
                        : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    paso.numero
                  )}
                </div>
                {/* Label */}
                <span
                  className={`mt-2 text-xs font-medium text-center whitespace-nowrap ${
                    isCompleted
                      ? 'text-primary-600'
                      : isActive
                        ? 'text-secondary-600'
                        : 'text-gray-400'
                  }`}
                >
                  {paso.label}
                </span>
              </div>

              {/* Linea conectora (no despues del ultimo) */}
              {index < PASOS.length - 1 && (
                <div className="flex-1 mx-3 mt-[-1.25rem]">
                  <div
                    className={`h-0.5 w-full transition-colors ${
                      paso.numero < pasoActual
                        ? 'bg-primary-500'
                        : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Vista mobile: solo paso actual */}
      <div className="md:hidden">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary-500 text-white flex items-center justify-center text-sm font-bold ring-4 ring-secondary-100">
            {pasoActual}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {PASOS[pasoActual - 1]?.label}
            </p>
            <p className="text-xs text-gray-400">
              Paso {pasoActual} de {PASOS.length}
            </p>
          </div>
        </div>
        {/* Barra de progreso mobile */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-secondary-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(pasoActual / PASOS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default BookingStepper
