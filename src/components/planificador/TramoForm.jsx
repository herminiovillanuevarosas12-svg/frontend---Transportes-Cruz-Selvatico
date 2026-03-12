/**
 * TramoForm - Formulario de un tramo individual
 * Selects origen/destino, fecha, pasajeros, y HorarioSelector
 */

import { useMemo } from 'react'
import { MapPin, Calendar, Users, Plus, ChevronDown, ChevronUp, Trash2, Check, Eye } from 'lucide-react'
import { usePlanificadorStore } from '../../features/planificador/planificadorStore'
import {
  filtrarRutasPorTramo,
  extraerHorarios,
  getCiudadesUnicas,
  formatearFecha,
  formatearHora,
  formatearPrecio,
  calcularSubtotal,
} from '../../features/planificador/helpers'
import HorarioSelector from './HorarioSelector'

const TramoForm = ({ tramo, indice, esActivo, esUltimo, totalTramos }) => {
  const {
    actualizarTramo,
    seleccionarHorario,
    confirmarTramoYAgregar,
    eliminarTramo,
    editarTramo,
    setTramoActivo,
    irAResumenFinal,
    rutasCache,
    puntosCache,
    getTramosCompletados,
  } = usePlanificadorStore()

  const ciudades = useMemo(() => getCiudadesUnicas(puntosCache), [puntosCache])

  const rutasFiltradas = useMemo(
    () => filtrarRutasPorTramo(rutasCache, tramo.origen, tramo.destino),
    [rutasCache, tramo.origen, tramo.destino]
  )

  const horarios = useMemo(
    () => extraerHorarios(rutasFiltradas),
    [rutasFiltradas]
  )

  const mostrarHorarios = tramo.origen && tramo.destino && tramo.fecha
  const puedeAgregarOtro = tramo.completado && tramo.horarioSeleccionado
  const puedeFinalizar = getTramosCompletados().length > 0

  // Tramo colapsado (completado y no activo)
  if (tramo.completado && !esActivo) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                Tramo {indice + 1}: {tramo.origen} → {tramo.destino}
              </p>
              <p className="text-xs text-gray-500">
                {formatearFecha(tramo.fecha)} · {formatearHora(tramo.horarioSeleccionado?.hora)} · {tramo.pasajeros} pax · {formatearPrecio(calcularSubtotal(tramo))}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => editarTramo(tramo.id)}
              className="p-2 text-gray-400 hover:text-secondary-500 transition-colors"
              title="Editar tramo"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {totalTramos > 1 && (
              <button
                onClick={() => eliminarTramo(tramo.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Eliminar tramo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border-2 rounded-xl shadow-sm transition-all ${
      esActivo ? 'border-secondary-300 shadow-md' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            esActivo ? 'bg-secondary-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {indice + 1}
          </div>
          <h3 className="text-sm font-bold text-gray-800">
            Tramo {indice + 1}
            {tramo.origen && tramo.destino && (
              <span className="font-normal text-gray-500"> — {tramo.origen} → {tramo.destino}</span>
            )}
          </h3>
        </div>
        {totalTramos > 1 && !tramo.completado && (
          <button
            onClick={() => eliminarTramo(tramo.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Fila 1: Origen + Destino */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-secondary-500" />
              Origen
            </label>
            <select
              value={tramo.origen}
              onChange={(e) => {
                const val = e.target.value
                actualizarTramo(tramo.id, {
                  origen: val,
                  destino: tramo.destino === val ? '' : tramo.destino,
                  horarioSeleccionado: null,
                  completado: false,
                })
              }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary-300 focus:border-secondary-400"
            >
              <option value="">Selecciona ciudad</option>
              {ciudades.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-primary-500" />
              Destino
            </label>
            <select
              value={tramo.destino}
              onChange={(e) => {
                actualizarTramo(tramo.id, {
                  destino: e.target.value,
                  horarioSeleccionado: null,
                  completado: false,
                })
              }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary-300 focus:border-secondary-400"
            >
              <option value="">Selecciona ciudad</option>
              {ciudades.filter(c => c !== tramo.origen).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila 2: Fecha + Pasajeros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1 text-secondary-500" />
              Fecha de viaje
            </label>
            <input
              type="date"
              value={tramo.fecha}
              onChange={(e) => actualizarTramo(tramo.id, {
                fecha: e.target.value,
                horarioSeleccionado: null,
                completado: false,
              })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary-300 focus:border-secondary-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              <Users className="w-3.5 h-3.5 inline mr-1 text-primary-500" />
              Pasajeros
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => actualizarTramo(tramo.id, {
                  pasajeros: Math.max(1, tramo.pasajeros - 1),
                })}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold"
                disabled={tramo.pasajeros <= 1}
              >
                −
              </button>
              <span className="flex-1 text-center text-sm font-bold text-gray-900">
                {tramo.pasajeros}
              </span>
              <button
                onClick={() => actualizarTramo(tramo.id, {
                  pasajeros: tramo.pasajeros + 1,
                })}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Horarios */}
        {mostrarHorarios && (
          <HorarioSelector
            horarios={horarios}
            seleccionado={tramo.horarioSeleccionado}
            onSeleccionar={(h) => seleccionarHorario(tramo.id, h)}
          />
        )}

        {/* Botones de accion */}
        {puedeAgregarOtro && (
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => confirmarTramoYAgregar(tramo.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-semibold text-sm hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar otro tramo
            </button>
            {puedeFinalizar && (
              <button
                onClick={irAResumenFinal}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary-500 text-white rounded-lg font-semibold text-sm hover:bg-secondary-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver resumen final
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TramoForm
