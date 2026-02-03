/**
 * Tipos de Carro Service
 */

import apiClient from './apiClient'

const tiposCarroService = {
  listar: async () => {
    const response = await apiClient.get('/tipos-carro')
    return response.data
  },

  obtener: async (id) => {
    const response = await apiClient.get(`/tipos-carro/${id}`)
    return response.data
  },

  crear: async (data) => {
    const response = await apiClient.post('/tipos-carro', data)
    return response.data
  },

  actualizar: async (id, data) => {
    const response = await apiClient.put(`/tipos-carro/${id}`, data)
    return response.data
  },

  eliminar: async (id) => {
    const response = await apiClient.delete(`/tipos-carro/${id}`)
    return response.data
  }
}

export default tiposCarroService
