/**
 * Rutas Service
 */

import apiClient from './apiClient'

const rutasService = {
  listar: async () => {
    const response = await apiClient.get('/rutas')
    return response.data
  },

  obtener: async (id) => {
    const response = await apiClient.get(`/rutas/${id}`)
    return response.data
  },

  crear: async (data) => {
    const response = await apiClient.post('/rutas', data)
    return response.data
  },

  actualizar: async (id, data) => {
    const response = await apiClient.put(`/rutas/${id}`, data)
    return response.data
  },

  eliminar: async (id) => {
    const response = await apiClient.delete(`/rutas/${id}`)
    return response.data
  },

  // Horarios
  listarHorarios: async (idRuta) => {
    const response = await apiClient.get(`/rutas/${idRuta}/horarios`)
    return response.data
  },

  crearHorario: async (idRuta, data) => {
    const response = await apiClient.post(`/rutas/${idRuta}/horarios`, data)
    return response.data
  }
}

export default rutasService
