/**
 * Tickets Service
 */

import apiClient from './apiClient'

const ticketsService = {
  listar: async (params = {}) => {
    const response = await apiClient.get('/tickets', { params })
    return response.data
  },

  obtener: async (id) => {
    const response = await apiClient.get(`/tickets/${id}`)
    return response.data
  },

  obtenerPorCodigo: async (codigo) => {
    const response = await apiClient.get(`/tickets/codigo/${codigo}`)
    return response.data
  },

  vender: async (data) => {
    const response = await apiClient.post('/tickets', data)
    return response.data
  },

  /**
   * Venta instantanea - sin horario predefinido
   * La hora de venta es la hora actual del momento
   */
  venderInstantaneo: async (data) => {
    const response = await apiClient.post('/tickets/instantanea', data)
    return response.data
  },

  anular: async (id, motivo) => {
    const response = await apiClient.post(`/tickets/${id}/anular`, { motivo })
    return response.data
  },

  imprimir: async (id) => {
    const response = await apiClient.get(`/tickets/${id}/imprimir`)
    return response.data
  }
}

export default ticketsService
