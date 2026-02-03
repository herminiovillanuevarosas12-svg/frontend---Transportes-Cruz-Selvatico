/**
 * Usuarios Service
 */

import apiClient from './apiClient'

const usuariosService = {
  listar: async () => {
    const response = await apiClient.get('/usuarios')
    return response.data
  },

  obtener: async (id) => {
    const response = await apiClient.get(`/usuarios/${id}`)
    return response.data
  },

  crear: async (data) => {
    const response = await apiClient.post('/usuarios', data)
    return response.data
  },

  actualizar: async (id, data) => {
    const response = await apiClient.put(`/usuarios/${id}`, data)
    return response.data
  },

  toggle: async (id) => {
    const response = await apiClient.patch(`/usuarios/${id}/toggle`)
    return response.data
  },

  listarRoles: async () => {
    const response = await apiClient.get('/roles')
    return response.data
  }
}

export default usuariosService
