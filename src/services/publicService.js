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
  },

  getExperienciaIconos: async () => {
    const response = await apiClient.get('/public/experiencia-iconos')
    return response.data
  },

  getDestinosImagenes: async () => {
    const response = await apiClient.get('/public/destinos-imagenes')
    return response.data
  },

  getDestinosBanner: async () => {
    const response = await apiClient.get('/public/destinos-banner')
    return response.data
  },

  // Destinos publicos
  getDestinos: async (params = {}) => {
    const response = await apiClient.get('/public/destinos', { params })
    return response.data
  },

  getDestino: async (slug) => {
    const response = await apiClient.get(`/public/destinos/${slug}`)
    return response.data
  },

  // Preguntas frecuentes
  getPreguntasFrecuentes: async () => {
    const response = await apiClient.get('/public/preguntas-frecuentes')
    return response.data
  },

  // Promociones
  getPromociones: async () => {
    const response = await apiClient.get('/public/promociones')
    return response.data
  },

  // Contacto
  enviarContacto: async (datos) => {
    const response = await apiClient.post('/public/contacto', datos)
    return response.data
  },

  // Encomiendas ventajas
  getEncomiendasVentajas: async () => {
    const response = await apiClient.get('/public/encomiendas-ventajas')
    return response.data
  },

  // Nosotros
  getNosotros: async () => {
    const response = await apiClient.get('/public/nosotros')
    return response.data
  },

  // Paginas de contenido
  getPagina: async (slug) => {
    const response = await apiClient.get(`/public/paginas/${slug}`)
    return response.data
  }
}

export default publicService
