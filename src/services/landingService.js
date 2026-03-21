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
  // DESTINOS BANNER
  // ============================================

  subirBannerDestinos: async (file) => {
    const formData = new FormData()
    formData.append('imagen', file)
    const response = await apiClient.put('/landing/destinos-banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  eliminarBannerDestinos: async () => {
    const response = await apiClient.delete('/landing/destinos-banner')
    return response.data
  },

  // ============================================
  // DESTINOS PUBLICOS (CRUD)
  // ============================================

  listarDestinos: async () => {
    const response = await apiClient.get('/contenido/destinos')
    return response.data
  },

  crearDestino: async (formData) => {
    const response = await apiClient.post('/contenido/destinos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  actualizarDestino: async (id, formData) => {
    const response = await apiClient.put(`/contenido/destinos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  eliminarDestino: async (id) => {
    const response = await apiClient.delete(`/contenido/destinos/${id}`)
    return response.data
  },

  toggleDestino: async (id) => {
    const response = await apiClient.patch(`/contenido/destinos/${id}/toggle`)
    return response.data
  },

  // ============================================
  // CALENDARIO FESTIVO POR DESTINO
  // ============================================

  listarFestividadesDestino: async (idDestino) => {
    const response = await apiClient.get(`/contenido/destinos/${idDestino}/festividades`)
    return response.data
  },

  crearFestividadDestino: async (idDestino, data) => {
    const response = await apiClient.post(`/contenido/destinos/${idDestino}/festividades`, data)
    return response.data
  },

  actualizarFestividadDestino: async (id, data) => {
    const response = await apiClient.put(`/contenido/destinos/festividades/${id}`, data)
    return response.data
  },

  eliminarFestividadDestino: async (id) => {
    const response = await apiClient.delete(`/contenido/destinos/festividades/${id}`)
    return response.data
  },

  // ============================================
  // ENCOMIENDAS INFO
  // ============================================

  listarEncomiendasVentajas: async () => {
    const response = await apiClient.get('/contenido/encomiendas-ventajas')
    return response.data
  },

  crearEncomiendasVentaja: async (formData) => {
    const response = await apiClient.post('/contenido/encomiendas-ventajas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  actualizarEncomiendasVentaja: async (id, formData) => {
    const response = await apiClient.put(`/contenido/encomiendas-ventajas/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  eliminarEncomiendasVentaja: async (id) => {
    const response = await apiClient.delete(`/contenido/encomiendas-ventajas/${id}`)
    return response.data
  },

  toggleEncomiendasVentaja: async (id) => {
    const response = await apiClient.patch(`/contenido/encomiendas-ventajas/${id}/toggle`)
    return response.data
  },

  subirImagenEncomiendasHero: async (formData) => {
    const response = await apiClient.put('/landing/config/imagen-encomiendas-hero', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  eliminarImagenEncomiendasHero: async () => {
    const response = await apiClient.delete('/landing/config/imagen-encomiendas-hero')
    return response.data
  },

  subirImagenEncomiendasLanding: async (formData) => {
    const response = await apiClient.put('/landing/config/imagen-encomiendas-landing', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  eliminarImagenEncomiendasLanding: async () => {
    const response = await apiClient.delete('/landing/config/imagen-encomiendas-landing')
    return response.data
  },

  // ============================================
  // ENCOMIENDAS SECCIONES (Servicios/Flota)
  // ============================================

  listarEncomiendasSecciones: async () => {
    const response = await apiClient.get('/contenido/encomiendas-secciones')
    return response.data
  },

  crearEncomiendasSeccion: async (formData) => {
    const response = await apiClient.post('/contenido/encomiendas-secciones', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  actualizarEncomiendasSeccion: async (id, formData) => {
    const response = await apiClient.put(`/contenido/encomiendas-secciones/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  eliminarEncomiendasSeccion: async (id) => {
    const response = await apiClient.delete(`/contenido/encomiendas-secciones/${id}`)
    return response.data
  },

  toggleEncomiendasSeccion: async (id) => {
    const response = await apiClient.patch(`/contenido/encomiendas-secciones/${id}/toggle`)
    return response.data
  },

  // ============================================
  // IMAGEN FONDO EXPERIENCIA
  // ============================================

  subirImagenFondoExperiencia: async (formData) => {
    const response = await apiClient.put('/landing/config/imagen-fondo-experiencia', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  eliminarImagenFondoExperiencia: async () => {
    const response = await apiClient.delete('/landing/config/imagen-fondo-experiencia')
    return response.data
  },

  // ============================================
  // ICONOS EXPERIENCIA
  // ============================================

  listarExperienciaIconos: async () => {
    const response = await apiClient.get('/landing/experiencia-iconos')
    return response.data
  },

  crearExperienciaIcono: async (data) => {
    const response = await apiClient.post('/landing/experiencia-iconos', data)
    return response.data
  },

  actualizarExperienciaIcono: async (id, data) => {
    const response = await apiClient.put(`/landing/experiencia-iconos/${id}`, data)
    return response.data
  },

  eliminarExperienciaIcono: async (id) => {
    const response = await apiClient.delete(`/landing/experiencia-iconos/${id}`)
    return response.data
  },

  // ============================================
  // NOSOTROS
  // ============================================

  listarNosotrosValores: async () => {
    const response = await apiClient.get('/contenido/nosotros/valores')
    return response.data
  },

  actualizarNosotrosConfig: async (data) => {
    const response = await apiClient.put('/contenido/nosotros/config', data)
    return response.data
  },

  subirHeroNosotros: async (formData) => {
    const response = await apiClient.put('/contenido/nosotros/hero', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  eliminarHeroNosotros: async () => {
    const response = await apiClient.delete('/contenido/nosotros/hero')
    return response.data
  },

  crearNosotrosValor: async (formData) => {
    const response = await apiClient.post('/contenido/nosotros/valores', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  actualizarNosotrosValor: async (id, formData) => {
    const response = await apiClient.put(`/contenido/nosotros/valores/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  eliminarNosotrosValor: async (id) => {
    const response = await apiClient.delete(`/contenido/nosotros/valores/${id}`)
    return response.data
  },

  toggleNosotrosValor: async (id) => {
    const response = await apiClient.patch(`/contenido/nosotros/valores/${id}/toggle`)
    return response.data
  },

  // ============================================
  // PREGUNTAS FRECUENTES
  // ============================================

  listarPreguntasFrecuentes: async () => {
    const response = await apiClient.get('/contenido/preguntas-frecuentes')
    return response.data
  },

  crearPreguntaFrecuente: async (data) => {
    const response = await apiClient.post('/contenido/preguntas-frecuentes', data)
    return response.data
  },

  actualizarPreguntaFrecuente: async (id, data) => {
    const response = await apiClient.put(`/contenido/preguntas-frecuentes/${id}`, data)
    return response.data
  },

  eliminarPreguntaFrecuente: async (id) => {
    const response = await apiClient.delete(`/contenido/preguntas-frecuentes/${id}`)
    return response.data
  },

  togglePreguntaFrecuente: async (id) => {
    const response = await apiClient.patch(`/contenido/preguntas-frecuentes/${id}/toggle`)
    return response.data
  },

  reordenarPreguntasFrecuentes: async (ordenes) => {
    const response = await apiClient.put('/contenido/preguntas-frecuentes/reordenar', { ordenes })
    return response.data
  },

  // ============================================
  // INFO VIAJE
  // ============================================

  getInfoViajeItems: async () => {
    const response = await apiClient.get('/contenido/info-viaje-items')
    return response.data
  },

  crearInfoViajeItem: async (formData) => {
    const response = await apiClient.post('/contenido/info-viaje-items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  actualizarInfoViajeItem: async (id, formData) => {
    const response = await apiClient.put(`/contenido/info-viaje-items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  eliminarInfoViajeItem: async (id) => {
    const response = await apiClient.delete(`/contenido/info-viaje-items/${id}`)
    return response.data
  },

  toggleInfoViajeItem: async (id) => {
    const response = await apiClient.patch(`/contenido/info-viaje-items/${id}/toggle`)
    return response.data
  },

  subirHeroInfoViaje: async (formData) => {
    const response = await apiClient.put('/landing/config/imagen-info-viaje-hero', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  eliminarHeroInfoViaje: async () => {
    const response = await apiClient.delete('/landing/config/imagen-info-viaje-hero')
    return response.data
  },

  actualizarConfigInfoViaje: async (data) => {
    const response = await apiClient.put('/landing/config/info-viaje', data)
    return response.data
  }
}

export default landingService
