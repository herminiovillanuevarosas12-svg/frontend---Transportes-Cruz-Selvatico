/**
 * Landing Service
 * Servicio para gestión de banners y configuración de landing (admin)
 */

import apiClient from './apiClient'

const landingService = {
  /**
   * Listar banners o imágenes de galería (admin)
   * @param {string} tipo - 'banner' o 'gallery' (opcional)
   */
  listarBanners: async (tipo = null) => {
    const params = tipo ? { tipo } : {}
    const response = await apiClient.get('/landing/banners', { params })
    return response.data
  },

  /**
   * Crear banner
   * @param {FormData|Object} data - Datos del banner
   */
  crearBanner: async (data) => {
    // Si es FormData, enviar como multipart
    if (data instanceof FormData) {
      const response = await apiClient.post('/landing/banners', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    }
    // Si es objeto con base64
    const response = await apiClient.post('/landing/banners', data)
    return response.data
  },

  /**
   * Actualizar banner
   * @param {number} id - ID del banner
   * @param {FormData|Object} data - Datos actualizados
   */
  actualizarBanner: async (id, data) => {
    // Si es FormData, enviar como multipart
    if (data instanceof FormData) {
      const response = await apiClient.put(`/landing/banners/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    }
    // Si es objeto con base64
    const response = await apiClient.put(`/landing/banners/${id}`, data)
    return response.data
  },

  /**
   * Eliminar banner
   * @param {number} id - ID del banner
   */
  eliminarBanner: async (id) => {
    const response = await apiClient.delete(`/landing/banners/${id}`)
    return response.data
  },

  /**
   * Reordenar banners
   * @param {Array<{id: number, orden: number}>} ordenes - Array de órdenes
   */
  reordenarBanners: async (ordenes) => {
    const response = await apiClient.put('/landing/banners/reorder', { ordenes })
    return response.data
  },

  /**
   * Obtener configuración de landing (admin)
   */
  getConfigLanding: async () => {
    const response = await apiClient.get('/landing/config')
    return response.data
  },

  /**
   * Actualizar configuración de landing
   * @param {Object} config - Datos de configuración
   */
  actualizarConfigLanding: async (config) => {
    const response = await apiClient.put('/landing/config', config)
    return response.data
  }
}

export default landingService
