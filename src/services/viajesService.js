/**
 * Viajes Service
 */

import apiClient from './apiClient'

const viajesService = {
  listar: async (params = {}) => {
    const response = await apiClient.get('/viajes', { params })
    return response.data
  },

  disponibilidad: async (idRuta, fecha) => {
    const response = await apiClient.get('/viajes/disponibilidad', {
      params: { idRuta, fecha }
    })
    return response.data
  }
}

export default viajesService
