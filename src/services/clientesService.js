/**
 * Clientes Service
 * Servicio para gestion de clientes con programa de fidelizacion
 */

import apiClient from './apiClient'

const clientesService = {
  listar: async (params = {}) => {
    const response = await apiClient.get('/clientes', { params })
    return response.data
  },

  /**
   * Buscar clientes para combobox/autocomplete
   * @param {string} search - Termino de busqueda (documento o nombre)
   * @param {number} limit - Limite de resultados (default 10)
   * @returns {Promise<Object>} Lista de clientes encontrados
   */
  buscar: async (search, limit = 10) => {
    const response = await apiClient.get('/clientes', {
      params: { search, limit }
    })
    return response.data
  },

  obtener: async (id) => {
    const response = await apiClient.get(`/clientes/${id}`)
    return response.data
  },

  /**
   * Obtener cliente por documento exacto (DNI, carnet de extranjeria o RUC)
   * @param {string} dni - Documento del cliente ya normalizado
   * @returns {Promise<Object>} Cliente con puntos disponibles e historicos
   */
  obtenerPorDni: async (dni) => {
    const response = await apiClient.get(`/clientes/dni/${dni}`)
    return response.data
  },

  stats: async () => {
    const response = await apiClient.get('/clientes/stats')
    return response.data
  }
}

export default clientesService
