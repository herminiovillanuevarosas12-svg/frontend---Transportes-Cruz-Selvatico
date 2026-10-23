/**
 * Flota Service
 * Conductores y buses (listas que se eligen al generar el manifiesto)
 */

import apiClient from './apiClient'

/**
 * @param {string} ruta - Ruta base de la API (ej: '/conductores')
 */
const crearServicioFlota = (ruta) => ({
  listar: async () => {
    const response = await apiClient.get(ruta)
    return response.data
  },

  crear: async (data) => {
    const response = await apiClient.post(ruta, data)
    return response.data
  },

  actualizar: async (id, data) => {
    const response = await apiClient.put(`${ruta}/${id}`, data)
    return response.data
  },

  eliminar: async (id) => {
    const response = await apiClient.delete(`${ruta}/${id}`)
    return response.data
  }
})

export const conductoresService = crearServicioFlota('/conductores')
export const busesService = crearServicioFlota('/buses')
