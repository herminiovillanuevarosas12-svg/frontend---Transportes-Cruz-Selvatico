/**
 * TripResultCard - Card de resultado de viaje estilo Movil Bus
 * Fila horizontal: servicio | origen hora | flecha duracion | destino hora | precio + boton
 * Barra inferior con features (escalas, tipo bus)
 * Props: viaje (objeto), onSelect (function)
 */

import { Clock, ArrowRight, Check, Bus } from 'lucide-react'

const TripResultCard = ({ viaje, onSelect }) => {
  const {
    tipoServicio,
    horaSalida,
    horaLlegada,
    duracion,
    origen,
    destino,
    terminalOrigen,
    terminalDestino,
    precio,
    asientosDisponibles,
  } = viaje

  const handleSelect = () => {
    if (onSelect) onSelect(viaje)
  }

  // Generar features para la barra inferior
  const features = []
  if (viaje.escalas) {
    features.push(`${viaje.escalas} escala${viaje.escalas > 1 ? 's' : ''}`)
  }
  if (viaje.tipoBus) {
    features.push(viaje.tipoBus)
  }
  if (viaje.tags && viaje.tags.length > 0) {
    features.push(...viaje.tags)
  }

  const formatPrecio = (val) => {
    if (typeof val === 'number') return `S/${val % 1 === 0 ? val : val.toFixed(2)}`
    return `S/${val}`
  }

  const formatHora = (hora) => {
    if (!hora || hora === '--:--') return '--:--'
    // Solo mostrar HH:MM hr
    const parts = hora.split(':')
    if (parts.length >= 2) return `${parts[0]}:${parts[1]} hr`
    return `${hora} hr`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200">
      {/* Contenido principal */}
      <div className="p-4 sm:p-5 md:p-6">
        {/* Layout desktop: fila horizontal */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-0">

          {/* Servicio (izquierda) */}
          <div className="lg:w-[160px] xl:w-[180px] flex-shrink-0 lg:pr-4">
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              {tipoServicio || 'Ejecutivo'}
            </h3>
            {viaje.subtipo && (
              <p className="text-xs text-gray-500 mt-1">{viaje.subtipo}</p>
            )}
            {viaje.tipoAsiento && (
              <p className="text-xs text-gray-400 mt-1">{viaje.tipoAsiento}</p>
            )}
          </div>

          {/* Ruta: origen -> destino (centro) */}
          <div className="flex-1 flex items-center gap-2 sm:gap-4 lg:gap-6">
            {/* Origen */}
            <div className="flex-1 text-center lg:text-left">
              <p className="text-xs sm:text-sm font-semibold text-secondary-600 uppercase tracking-wide">
                {origen}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mt-0.5">
                {formatHora(horaSalida)}
              </p>
              {terminalOrigen && (
                <p className="text-[0.65rem] sm:text-xs text-gray-400 mt-1 leading-tight line-clamp-2">
                  {terminalOrigen}
                </p>
              )}
            </div>

            {/* Flecha con duracion */}
            <div className="flex flex-col items-center gap-1 px-1 sm:px-3 flex-shrink-0">
              {duracion && (
                <span className="text-[0.65rem] sm:text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {duracion}
                </span>
              )}
              <div className="flex items-center">
                <div className="w-6 sm:w-10 md:w-14 h-px bg-gray-300" />
                <ArrowRight className="w-4 h-4 text-gray-400 mx-0.5" />
                <div className="w-6 sm:w-10 md:w-14 h-px bg-gray-300" />
              </div>
            </div>

            {/* Destino */}
            <div className="flex-1 text-center lg:text-right">
              <p className="text-xs sm:text-sm font-semibold text-secondary-600 uppercase tracking-wide">
                {destino}
              </p>
              {terminalDestino && (
                <p className="text-[0.65rem] sm:text-xs text-gray-400 mt-1 leading-tight line-clamp-2">
                  {terminalDestino}
                </p>
              )}
            </div>
          </div>

          {/* Precio (derecha) */}
          <div className="lg:w-[180px] xl:w-[200px] flex-shrink-0 flex flex-col items-center lg:items-end gap-1 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-5 xl:pl-6">
            <div className="text-center lg:text-right">
              <p className="text-xs text-gray-400 font-medium">Desde:</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {formatPrecio(precio)}
              </p>
            </div>
            {asientosDisponibles != null && (
              <p className="text-[0.65rem] sm:text-xs text-gray-400 font-medium">
                {asientosDisponibles} asientos disponibles
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Barra inferior con features */}
      {features.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-100 px-4 sm:px-5 md:px-6 py-2.5">
          <div className="flex flex-wrap items-center gap-4">
            {features.map((feature, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 text-xs text-gray-600 font-medium"
              >
                <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TripResultCard
