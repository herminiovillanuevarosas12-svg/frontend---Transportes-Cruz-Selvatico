/**
 * ResumenPanel - Panel lateral sticky con resumen de tramos
 * Desktop: sticky sidebar. Mobile: acordeon colapsable al pie.
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, MapPin, Receipt } from 'lucide-react'
import {
  formatearFecha,
  formatearHora,
  formatearPrecio,
  calcularSubtotal,
  calcularTotal,
} from '../../features/planificador/helpers'

const ResumenTramoRow = ({ tramo, indice }) => (
  <div className="py-2.5 border-b border-gray-100 last:border-0">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-gray-800 truncate">
          <span className="text-secondary-500">#{indice + 1}</span>{' '}
          {tramo.origen} → {tramo.destino}
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">
          {formatearFecha(tramo.fecha)} · {formatearHora(tramo.horarioSeleccionado?.hora)} · {tramo.pasajeros} pax
        </p>
      </div>
      <span className="text-xs font-bold text-gray-900 whitespace-nowrap">
        {formatearPrecio(calcularSubtotal(tramo))}
      </span>
    </div>
  </div>
)

const ResumenPanel = ({ tramos }) => {
  const [abierto, setAbierto] = useState(false)
  const completados = tramos.filter(t => t.completado && t.horarioSeleccionado)
  const total = calcularTotal(tramos)

  if (completados.length === 0) {
    return (
      <>
        {/* Desktop placeholder */}
        <div className="hidden lg:block bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="w-5 h-5 text-primary-500" />
            <h3 className="text-sm font-bold text-gray-800">Resumen</h3>
          </div>
          <p className="text-xs text-gray-400 text-center py-6">
            Selecciona un horario para ver el resumen de tu viaje.
          </p>
        </div>
      </>
    )
  }

  const contenido = (
    <>
      <div className="divide-y divide-gray-100">
        {completados.map((tramo, i) => (
          <ResumenTramoRow key={tramo.id} tramo={tramo} indice={i} />
        ))}
      </div>
      <div className="mt-3 pt-3 border-t-2 border-primary-100 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800">Total estimado</span>
        <span className="text-lg font-bold text-secondary-600">{formatearPrecio(total)}</span>
      </div>
      <p className="text-[10px] text-gray-400 mt-2">
        * Precios referenciales sujetos a disponibilidad
      </p>
    </>
  )

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <div className="hidden lg:block bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="w-5 h-5 text-primary-500" />
          <h3 className="text-sm font-bold text-gray-800">
            Resumen ({completados.length} tramo{completados.length !== 1 ? 's' : ''})
          </h3>
        </div>
        {contenido}
      </div>

      {/* Mobile: acordeon fijo al pie */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => setAbierto(!abierto)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-bold text-gray-800">
              {completados.length} tramo{completados.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-secondary-600">{formatearPrecio(total)}</span>
            {abierto ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>
        {abierto && (
          <div className="px-4 pb-4 max-h-60 overflow-y-auto">
            {contenido}
          </div>
        )}
      </div>
    </>
  )
}

export default ResumenPanel
