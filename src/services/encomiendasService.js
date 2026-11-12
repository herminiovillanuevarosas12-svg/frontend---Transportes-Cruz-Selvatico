/**
 * Encomiendas Service
 */

import apiClient from './apiClient'

const encomiendasService = {
  listar: async (params = {}) => {
    const response = await apiClient.get('/encomiendas', { params })
    return response.data
  },

  /**
   * Todas las encomiendas que coinciden con los filtros, recorriendo todas las páginas
   * @param {Object} params - Filtros del listado (sin page ni limit)
   * @returns {Promise<Object[]>} Tope de seguridad: 10 000 registros
   */
  listarTodas: async (params = {}) => {
    const limit = 500
    const maxPaginas = 20
    let page = 1
    let totalPages = 1
    let todas = []
    do {
      const data = await encomiendasService.listar({ ...params, page, limit })
      todas = todas.concat(data.encomiendas || [])
      totalPages = data.pagination?.totalPages || 1
      page++
    } while (page <= totalPages && page <= maxPaginas)
    return todas
  },

  obtener: async (id) => {
    const response = await apiClient.get(`/encomiendas/${id}`)
    return response.data
  },

  buscarPorCodigo: async (codigo) => {
    const response = await apiClient.get(`/encomiendas/codigo/${codigo}`)
    return response.data
  },

  buscarPorDni: async (dni) => {
    const response = await apiClient.get(`/encomiendas/dni/${dni}`)
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
  },

  // datos: { idsEncomiendas, idPuntoDestino, fechaSalida, horaSalida, idConductor, idBus }
  generarManifiesto: async (datos) => {
    const response = await apiClient.post('/encomiendas/manifiestos', datos)
    return response.data
  },

  listarManifiestos: async (params = {}) => {
    const response = await apiClient.get('/encomiendas/manifiestos', { params })
    return response.data
  },

  obtenerManifiesto: async (id) => {
    const response = await apiClient.get(`/encomiendas/manifiestos/${id}`)
    return response.data
  }
}

export default encomiendasService
