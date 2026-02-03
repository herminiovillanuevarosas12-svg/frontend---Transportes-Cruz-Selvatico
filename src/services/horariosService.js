/**
 * Horarios Service
 */

import apiClient from './apiClient'

const horariosService = {
  listarPorRuta: async (idRuta) => {
    const response = await apiClient.get(`/rutas/${idRuta}/horarios`)
    return response.data
  },

  crear: async (idRuta, data) => {
    const response = await apiClient.post(`/rutas/${idRuta}/horarios`, data)
    return response.data
  },

  actualizar: async (id, data) => {
    const response = await apiClient.put(`/horarios/${id}`, data)
    return response.data
  },

  toggle: async (id) => {
    const response = await apiClient.patch(`/horarios/${id}/toggle`)
    return response.data
  },

  eliminar: async (id) => {
    const response = await apiClient.delete(`/horarios/${id}`)
    return response.data
  }
}

export default horariosService
