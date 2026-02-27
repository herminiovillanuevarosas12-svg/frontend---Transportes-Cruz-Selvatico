/**
 * DateRibbon - Cinta horizontal de seleccion de fechas estilo Movil Bus
 * Muestra 7 dias: numero grande bold + "MES." + "dia semana"
 * Seleccionado: fondo secondary-500 (rojo), resto: fondo primary-700/800
 * Props: fechaSeleccionada (string YYYY-MM-DD), onFechaChange (function)
 */

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DIAS_SEMANA_CORTO = ['dom.', 'lun.', 'mar.', 'mie.', 'jue.', 'vie.', 'sab.']
const MESES_CORTO = ['ENE.', 'FEB.', 'MAR.', 'ABR.', 'MAY.', 'JUN.', 'JUL.', 'AGO.', 'SEP.', 'OCT.', 'NOV.', 'DIC.']

const formatDateKey = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const isSameDay = (d1, d2) => {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate()
}

const DateRibbon = ({ fechaSeleccionada, onFechaChange }) => {
  const hoy = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const selectedDate = useMemo(() => {
    if (!fechaSeleccionada) return hoy
    const parts = fechaSeleccionada.split('-')
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    d.setHours(0, 0, 0, 0)
    return d
  }, [fechaSeleccionada, hoy])

  const dias = useMemo(() => {
    const arr = []
    // Empezar desde hoy o 3 dias antes de la fecha seleccionada (lo que sea mas reciente)
    const startOffset = Math.max(0, Math.floor((selectedDate - hoy) / 86400000) - 3)
    for (let i = 0; i < 7; i++) {
      const d = new Date(hoy)
      d.setDate(hoy.getDate() + startOffset + i)
      arr.push(d)
    }
    return arr
  }, [hoy, selectedDate])

  const handleClick = (dia) => {
    onFechaChange(formatDateKey(dia))
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Dias */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide flex-1 justify-center">
          {dias.map((dia) => {
            const isSelected = isSameDay(dia, selectedDate)
            const numeroDia = dia.getDate()
            const mes = MESES_CORTO[dia.getMonth()]
            const diaSemana = DIAS_SEMANA_CORTO[dia.getDay()]

            return (
              <button
                key={formatDateKey(dia)}
                onClick={() => handleClick(dia)}
                className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[4.5rem] sm:min-w-[5.5rem] py-3 sm:py-4 rounded-lg text-center transition-all duration-200 ${
                  isSelected
                    ? 'bg-secondary-500 text-white shadow-lg shadow-secondary-500/30'
                    : 'bg-primary-800 text-white/90 hover:bg-primary-700'
                }`}
              >
                <span className="text-2xl sm:text-3xl font-bold leading-none">{numeroDia}</span>
                <span className="text-[0.65rem] sm:text-xs font-semibold mt-1 uppercase tracking-wide">{mes}</span>
                <span className="text-[0.6rem] sm:text-xs font-medium opacity-75 mt-0.5">{diaSemana}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DateRibbon
