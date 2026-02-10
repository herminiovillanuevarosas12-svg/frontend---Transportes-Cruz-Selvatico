/**
 * Precios Base Service
 * CRUD para precios base de encomiendas
 */

import apiClient from './apiClient'

const preciosBaseService = {
  listar: async () => {
    const response = await apiClient.get('/precios-base-encomienda')
    return response.data
  },

  crear: async (data) => {
    const response = await apiClient.post('/precios-base-encomienda', data)
    return response.data
  },

  actualizar: async (id, data) => {
    const response = await apiClient.put(`/precios-base-encomienda/${id}`, data)
    return response.data
  },

  eliminar: async (id) => {
    const response = await apiClient.delete(`/precios-base-encomienda/${id}`)
    return response.data
  }
}

export default preciosBaseService
