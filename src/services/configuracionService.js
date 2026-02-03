/**
 * Configuracion Service
 */

import apiClient from './apiClient'

const configuracionService = {
  // Configuracion general del sistema
  obtener: async () => {
    const response = await apiClient.get('/configuracion')
    return response.data
  },

  actualizar: async (data) => {
    const response = await apiClient.put('/configuracion', data)
    return response.data
  },

  // Configuracion de precios de encomienda
  obtenerPreciosEncomienda: async () => {
    const response = await apiClient.get('/configuracion/precios-encomienda')
    return response.data
  },

  actualizarPreciosEncomienda: async (data) => {
    const response = await apiClient.put('/configuracion/precios-encomienda', data)
    return response.data
  }
}

export default configuracionService
