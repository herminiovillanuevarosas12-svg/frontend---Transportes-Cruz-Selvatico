/**
 * Planificador Store - Zustand (sin persistencia)
 * Estado para el planificador de viaje multi-tramo
 */

import { create } from 'zustand'

let tramoIdCounter = 1

const crearTramoVacio = (origenSugerido = '') => ({
  id: tramoIdCounter++,
  origen: origenSugerido,
  destino: '',
  fecha: '',
  pasajeros: 1,
  horarioSeleccionado: null,
  completado: false,
})

export const usePlanificadorStore = create((set, get) => ({
  // Estado
  tramos: [crearTramoVacio()],
  tramoActivo: null, // id del tramo activo (null = el ultimo incompleto)
  fase: 'planificando', // 'planificando' | 'resumen-final'
  rutasCache: [],
  puntosCache: [],
  configCache: null,

  // Acciones
  setDatosIniciales: (rutas, puntos, config) => set({
    rutasCache: rutas,
    puntosCache: puntos,
    configCache: config,
  }),

  getTramoActivo: () => {
    const { tramos, tramoActivo } = get()
    if (tramoActivo) return tramos.find(t => t.id === tramoActivo)
    return tramos.find(t => !t.completado) || tramos[tramos.length - 1]
  },

  actualizarTramo: (tramoId, cambios) => set(state => ({
    tramos: state.tramos.map(t =>
      t.id === tramoId ? { ...t, ...cambios } : t
    ),
  })),

  seleccionarHorario: (tramoId, horario) => set(state => ({
    tramos: state.tramos.map(t =>
      t.id === tramoId ? { ...t, horarioSeleccionado: horario, completado: true } : t
    ),
  })),

  confirmarTramoYAgregar: (tramoId) => {
    const { tramos } = get()
    const tramo = tramos.find(t => t.id === tramoId)
    if (!tramo || !tramo.horarioSeleccionado) return

    const nuevoTramo = crearTramoVacio(tramo.destino)
    set(state => ({
      tramos: [
        ...state.tramos.map(t =>
          t.id === tramoId ? { ...t, completado: true } : t
        ),
        nuevoTramo,
      ],
      tramoActivo: nuevoTramo.id,
    }))
  },

  eliminarTramo: (tramoId) => set(state => {
    const nuevosTramos = state.tramos.filter(t => t.id !== tramoId)
    if (nuevosTramos.length === 0) {
      const nuevo = crearTramoVacio()
      return { tramos: [nuevo], tramoActivo: nuevo.id }
    }
    return {
      tramos: nuevosTramos,
      tramoActivo: nuevosTramos[nuevosTramos.length - 1].id,
    }
  }),

  editarTramo: (tramoId) => set(state => ({
    tramos: state.tramos.map(t =>
      t.id === tramoId ? { ...t, completado: false, horarioSeleccionado: null } : t
    ),
    tramoActivo: tramoId,
    fase: 'planificando',
  })),

  setTramoActivo: (tramoId) => set({ tramoActivo: tramoId }),

  irAResumenFinal: () => set({ fase: 'resumen-final' }),

  volverAPlanificar: () => set({ fase: 'planificando' }),

  reset: () => {
    tramoIdCounter = 1
    const nuevo = crearTramoVacio()
    set({
      tramos: [nuevo],
      tramoActivo: null,
      fase: 'planificando',
    })
  },

  getTramosCompletados: () => get().tramos.filter(t => t.completado),
}))
