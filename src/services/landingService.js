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
  },

  /**
   * Subir/actualizar imagen de la sección experiencia
   * @param {FormData} formData - FormData con campo 'imagen'
   */
  subirImagenExperiencia: async (formData) => {
    const response = await apiClient.put('/landing/config/imagen-experiencia', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  /**
   * Eliminar imagen de la sección experiencia
   */
  eliminarImagenExperiencia: async () => {
    const response = await apiClient.delete('/landing/config/imagen-experiencia')
    return response.data
  },

  // ============================================
  // FESTIVIDADES
  // ============================================

  /**
   * Listar festividades (admin)
   */
  listarFestividades: async () => {
    const response = await apiClient.get('/landing/festividades')
    return response.data
  },

  /**
   * Crear festividad
   * @param {Object} data - { titulo, descripcion, idPunto, activo, orden }
   */
  crearFestividad: async (data) => {
    const response = await apiClient.post('/landing/festividades', data)
    return response.data
  },

  /**
   * Actualizar festividad
   * @param {number} id
   * @param {Object} data - { titulo, descripcion, idPunto, activo, orden }
   */
  actualizarFestividad: async (id, data) => {
    const response = await apiClient.put(`/landing/festividades/${id}`, data)
    return response.data
  },

  eliminarFestividad: async (id) => {
    const response = await apiClient.delete(`/landing/festividades/${id}`)
    return response.data
  },

  toggleFestividad: async (id) => {
    const response = await apiClient.patch(`/landing/festividades/${id}/toggle`)
    return response.data
  },

  // ============================================
  // IMÁGENES DE FESTIVIDADES
  // ============================================

  listarImagenesFestividad: async (festId) => {
    const response = await apiClient.get(`/landing/festividades/${festId}/imagenes`)
    return response.data
  },

  agregarImagenFestividad: async (festId, formData) => {
    const response = await apiClient.post(`/landing/festividades/${festId}/imagenes`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  eliminarImagenFestividad: async (imgId) => {
    const response = await apiClient.delete(`/landing/festividades/imagenes/${imgId}`)
    return response.data
  },

  reordenarImagenesFestividad: async (festId, orden) => {
    const response = await apiClient.put(`/landing/festividades/${festId}/imagenes/orden`, { orden })
    return response.data
  },

  // ============================================
  // SERVICIOS LANDING
  // ============================================

  /**
   * Listar servicios landing (admin)
   */
  listarServicios: async () => {
    const response = await apiClient.get('/landing/servicios')
    return response.data
  },

  /**
   * Actualizar servicio landing
   * @param {number} id
   * @param {Object} data - { titulo, descripcion, features, ctaTexto, ctaLink }
   */
  actualizarServicio: async (id, data) => {
    const response = await apiClient.put(`/landing/servicios/${id}`, data)
    return response.data
  }
}

export default landingService
