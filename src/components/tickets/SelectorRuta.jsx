/**
 * SelectorRuta Component
 * Selección en cascada de ruta para venta de pasajes:
 * punto de inicio → punto de fin → vehículo (tipo de carro).
 *
 * Solo ofrece combinaciones que existen como ruta activa.
 * Emite el idRuta resuelto (texto) o '' mientras la selección esté incompleta.
 */

import { useState, useEffect, useMemo } from 'react'
import {
  obtenerOrigenes,
  obtenerDestinos,
  obtenerRutasTramo,
  resolverRuta,
  descomponerRuta,
  seleccionVacia
} from '../../utils/rutasSelector'

const ANILLO_FOCO = {
  blue: 'focus:ring-blue-500',
  amber: 'focus:ring-amber-500'
}

const esMismaSeleccion = (a, b) =>
  a.idOrigen === b.idOrigen && a.idDestino === b.idDestino && a.idTipoCarro === b.idTipoCarro

// compacto: origen y destino en dos columnas y vehículo a ancho completo (para modales)
const DISPOSICION = {
  fila: { grid: 'grid grid-cols-1 md:grid-cols-3 gap-4', vehiculo: '' },
  compacto: { grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4', vehiculo: 'sm:col-span-2' }
}

const SelectorRuta = ({ rutas = [], value = '', onChange, color = 'blue', compacto = false }) => {
  const disposicion = compacto ? DISPOSICION.compacto : DISPOSICION.fila
  const [seleccion, setSeleccion] = useState(() => descomponerRuta(rutas, value))

  // Sincronizar con el valor del padre (reset externo o carga tardía de rutas)
  useEffect(() => {
    if (value) {
      const externa = descomponerRuta(rutas, value)
      setSeleccion(prev => (esMismaSeleccion(prev, externa) ? prev : externa))
    } else {
      // El padre limpió la ruta: solo se limpia si la selección estaba completa
      setSeleccion(prev => (prev.idTipoCarro ? seleccionVacia() : prev))
    }
  }, [value, rutas])

  const origenes = useMemo(() => obtenerOrigenes(rutas), [rutas])
  const destinos = useMemo(
    () => obtenerDestinos(rutas, seleccion.idOrigen),
    [rutas, seleccion.idOrigen]
  )
  const rutasTramo = useMemo(
    () => obtenerRutasTramo(rutas, seleccion.idOrigen, seleccion.idDestino),
    [rutas, seleccion.idOrigen, seleccion.idDestino]
  )

  const aplicar = (nueva) => {
    setSeleccion(nueva)
    const ruta = resolverRuta(rutas, nueva.idOrigen, nueva.idDestino, nueva.idTipoCarro)
    onChange?.(ruta ? String(ruta.id) : '', ruta)
  }

  const handleOrigen = (e) =>
    aplicar({ idOrigen: e.target.value, idDestino: '', idTipoCarro: '' })

  const handleDestino = (e) => {
    const idDestino = e.target.value
    const opciones = obtenerRutasTramo(rutas, seleccion.idOrigen, idDestino)
    // Si el tramo tiene un solo vehículo, se selecciona automáticamente
    const idTipoCarro = opciones.length === 1 ? String(opciones[0].idTipoCarro) : ''
    aplicar({ ...seleccion, idDestino, idTipoCarro })
  }

  const handleVehiculo = (e) =>
    aplicar({ ...seleccion, idTipoCarro: e.target.value })

  const claseSelect = `w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${ANILLO_FOCO[color] || ANILLO_FOCO.blue} focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`

  return (
    <div className={disposicion.grid}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Punto de inicio *
        </label>
        <select
          name="idPuntoOrigen"
          value={seleccion.idOrigen}
          onChange={handleOrigen}
          className={claseSelect}
        >
          <option value="">Seleccione punto de inicio</option>
          {origenes.map(punto => (
            <option key={punto.id} value={punto.id}>
              {punto.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Punto de fin *
        </label>
        <select
          name="idPuntoDestino"
          value={seleccion.idDestino}
          onChange={handleDestino}
          disabled={!seleccion.idOrigen}
          className={claseSelect}
        >
          <option value="">
            {seleccion.idOrigen ? 'Seleccione punto de fin' : 'Primero elija el punto de inicio'}
          </option>
          {destinos.map(punto => (
            <option key={punto.id} value={punto.id}>
              {punto.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className={disposicion.vehiculo}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vehículo *
        </label>
        <select
          name="idTipoCarro"
          value={seleccion.idTipoCarro}
          onChange={handleVehiculo}
          disabled={!seleccion.idDestino}
          className={claseSelect}
        >
          <option value="">
            {seleccion.idDestino ? 'Seleccione vehículo' : 'Primero elija el punto de fin'}
          </option>
          {rutasTramo.map(ruta => (
            <option key={ruta.id} value={ruta.idTipoCarro}>
              {ruta.tipoCarro?.nombre} - S/ {parseFloat(ruta.precioPasaje).toFixed(2)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default SelectorRuta
