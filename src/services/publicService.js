/**
 * Public Service
 * Servicio para endpoints publicos (sin autenticacion)
 */

import apiClient from './apiClient'

const publicService = {
  /**
   * Obtener rutas con horarios y precios
   */
  getRutas: async () => {
    const response = await apiClient.get('/public/rutas')
    return response.data
  },

  /**
   * Obtener puntos de cobertura
   */
  getPuntos: async () => {
    const response = await apiClient.get('/public/puntos')
    return response.data
  },

  /**
   * Consultar tracking de encomienda
   */
  consultarTracking: async (codigo) => {
    const response = await apiClient.get(`/public/tracking/${codigo}`)
    return response.data
  },

  /**
   * Obtener banners activos para landing
   */
  getBanners: async () => {
    const response = await apiClient.get('/public/landing/banners')
    return response.data
  },

  /**
   * Obtener galería de imágenes para landing
   */
  getGallery: async () => {
    const response = await apiClient.get('/public/landing/gallery')
    return response.data
  },

  /**
   * Obtener configuración de landing
   */
  getConfigLanding: async () => {
    const response = await apiClient.get('/public/landing/config')
    return response.data
  },

  /**
   * Obtener festividades activas (público)
   */
  getFestividades: async () => {
    const response = await apiClient.get('/public/festividades')
    return response.data
  }
}

export default publicService
