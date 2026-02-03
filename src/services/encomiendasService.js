/**
 * Encomiendas Service
 */

import apiClient from './apiClient'

const encomiendasService = {
  listar: async (params = {}) => {
    const response = await apiClient.get('/encomiendas', { params })
    return response.data
  },

  obtener: async (id) => {
    const response = await apiClient.get(`/encomiendas/${id}`)
    return response.data
  },

  buscarPorCodigo: async (codigo) => {
    const response = await apiClient.get(`/encomiendas/codigo/${codigo}`)
    return response.data
  },

  obtenerPorTracking: async (codigo) => {
    const response = await apiClient.get(`/encomiendas/tracking/${codigo}`)
    return response.data
  },

  registrar: async (data) => {
    const response = await apiClient.post('/encomiendas', data)
    return response.data
  },

  cambiarEstado: async (id, data) => {
    const response = await apiClient.patch(`/encomiendas/${id}/estado`, data)
    return response.data
  },

  retirar: async (id, data) => {
    const response = await apiClient.post(`/encomiendas/${id}/retirar`, data)
    return response.data
  },

  imprimir: async (id) => {
    const response = await apiClient.get(`/encomiendas/${id}/imprimir`)
    return response.data
  },

  generarQR: async (id) => {
    const response = await apiClient.get(`/encomiendas/${id}/qr`)
    return response.data
  }
}

export default encomiendasService
