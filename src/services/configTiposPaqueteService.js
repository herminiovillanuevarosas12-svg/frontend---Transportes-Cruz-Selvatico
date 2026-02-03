/**
 * Config Tipos Paquete Service
 */

import apiClient from './apiClient'

const configTiposPaqueteService = {
  listar: async () => {
    const response = await apiClient.get('/config-tipos-paquete')
    return response.data
  },

  listarActivos: async () => {
    const response = await apiClient.get('/config-tipos-paquete/activos')
    return response.data
  },

  obtener: async (id) => {
    const response = await apiClient.get(`/config-tipos-paquete/${id}`)
    return response.data
  },

  crear: async (data) => {
    const response = await apiClient.post('/config-tipos-paquete', data)
    return response.data
  },

  actualizar: async (id, data) => {
    const response = await apiClient.put(`/config-tipos-paquete/${id}`, data)
    return response.data
  },

  eliminar: async (id) => {
    const response = await apiClient.delete(`/config-tipos-paquete/${id}`)
    return response.data
  }
}

export default configTiposPaqueteService
