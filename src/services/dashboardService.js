/**
 * Dashboard Service
 */

import apiClient from './apiClient'

const dashboardService = {
  ventasHoy: async () => {
    const response = await apiClient.get('/dashboard/ventas-hoy')
    return response.data
  },

  encomiendasHoy: async () => {
    const response = await apiClient.get('/dashboard/encomiendas-hoy')
    return response.data
  },

  encomiendasEntregadas: async (fechaInicio, fechaFin) => {
    const params = {}
    if (fechaInicio) params.fechaInicio = fechaInicio
    if (fechaFin) params.fechaFin = fechaFin
    const response = await apiClient.get('/dashboard/encomiendas-entregadas', { params })
    return response.data
  },

  rutasMasUsadas: async (fechaInicio, fechaFin, limit = 10) => {
    const params = { limit }
    if (fechaInicio) params.fechaInicio = fechaInicio
    if (fechaFin) params.fechaFin = fechaFin
    const response = await apiClient.get('/dashboard/rutas-mas-usadas', { params })
    return response.data
  },

  puntosOrigen: async (tipo = 'ambos', limit = 10) => {
    const response = await apiClient.get('/dashboard/puntos-origen', {
      params: { tipo, limit }
    })
    return response.data
  },

  puntosDestino: async (tipo = 'ambos', limit = 10) => {
    const response = await apiClient.get('/dashboard/puntos-destino', {
      params: { tipo, limit }
    })
    return response.data
  },

  ingresoDia: async (fechaInicio, fechaFin) => {
    const params = {}
    if (fechaInicio) params.fechaInicio = fechaInicio
    if (fechaFin) params.fechaFin = fechaFin
    const response = await apiClient.get('/dashboard/ingreso-dia', { params })
    return response.data
  },

  ingresoPasajes: async (fechaInicio, fechaFin) => {
    const params = {}
    if (fechaInicio) params.fechaInicio = fechaInicio
    if (fechaFin) params.fechaFin = fechaFin
    const response = await apiClient.get('/dashboard/ingreso-pasajes', { params })
    return response.data
  },

  ingresoEncomiendas: async (fechaInicio, fechaFin) => {
    const params = {}
    if (fechaInicio) params.fechaInicio = fechaInicio
    if (fechaFin) params.fechaFin = fechaFin
    const response = await apiClient.get('/dashboard/ingreso-encomiendas', { params })
    return response.data
  },

  resumenCompleto: async () => {
    // Carga todo el dashboard en paralelo
    const [ventas, encomiendas, entregadas, rutas, origen, destino] = await Promise.all([
      dashboardService.ventasHoy(),
      dashboardService.encomiendasHoy(),
      dashboardService.encomiendasEntregadas(),
      dashboardService.rutasMasUsadas(),
      dashboardService.puntosOrigen(),
      dashboardService.puntosDestino()
    ])

    return {
      ventasHoy: ventas.ventasHoy || 0,
      encomiendasHoy: encomiendas.encomiendasHoy || 0,
      encomiendasEntregadas: entregadas.encomiendasEntregadas || 0,
      rutasMasUsadas: rutas.rutasMasUsadas || [],
      puntosOrigen: origen.puntosOrigen || {},
      puntosDestino: destino.puntosDestino || {}
    }
  }
}

export default dashboardService
