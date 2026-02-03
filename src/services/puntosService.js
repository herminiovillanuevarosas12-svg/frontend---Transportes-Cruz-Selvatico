/**
 * Puntos Service
 */

import apiClient from './apiClient'

const puntosService = {
  listar: async () => {
    const response = await apiClient.get('/puntos')
    return response.data
  },

  obtener: async (id) => {
    const response = await apiClient.get(`/puntos/${id}`)
    return response.data
  },

  crear: async (data) => {
    const response = await apiClient.post('/puntos', data)
    return response.data
  },

  actualizar: async (id, data) => {
    const response = await apiClient.put(`/puntos/${id}`, data)
    return response.data
  },

  eliminar: async (id) => {
    const response = await apiClient.delete(`/puntos/${id}`)
    return response.data
  }
}

export default puntosService
