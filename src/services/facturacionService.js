/**
 * Facturación Service
 * Servicio para comunicación con API de facturación electrónica
 */

import apiClient from './apiClient'

const facturacionService = {
  // =============================================================================
  // MÉTRICAS
  // =============================================================================

  /**
   * Obtener métricas de facturación
   */
  obtenerMetricas: async () => {
    const response = await apiClient.get('/facturacion/metricas')
    return response.data
  },

  // =============================================================================
  // COMPROBANTES (FACTURAS Y BOLETAS)
  // =============================================================================

  /**
   * Listar comprobantes con filtros
   * @param {Object} params - tipoComprobante, fechaDesde, fechaHasta, estado, clienteNumDoc, page, limit
   */
  listarComprobantes: async (params = {}) => {
    const response = await apiClient.get('/facturacion/comprobantes', { params })
    return response.data
  },

  /**
   * Obtener comprobante por ID
   */
  obtenerComprobante: async (id) => {
    const response = await apiClient.get(`/facturacion/comprobantes/${id}`)
    return response.data
  },

  /**
   * Emitir comprobante manual
   * @param {Object} data - { tipoComprobante, serie, cliente, items }
   */
  emitirComprobante: async (data) => {
    const response = await apiClient.post('/facturacion/comprobantes', data)
    return response.data
  },

  /**
   * Emitir comprobante desde ticket
   * @param {number} ticketId - ID del ticket
   * @param {Object} data - { tipoComprobante, serie, cliente }
   */
  emitirDesdeTicket: async (ticketId, data) => {
    const response = await apiClient.post(`/facturacion/emitir/ticket/${ticketId}`, data)
    return response.data
  },

  /**
   * Emitir comprobante desde encomienda
   * @param {number} encomiendaId - ID de la encomienda
   * @param {Object} data - { tipoComprobante, serie, cliente }
   */
  emitirDesdeEncomienda: async (encomiendaId, data) => {
    const response = await apiClient.post(`/facturacion/emitir/encomienda/${encomiendaId}`, data)
    return response.data
  },

  /**
   * Anular comprobante
   * @param {number} id - ID del comprobante
   * @param {string} motivo - Motivo de anulación
   */
  anularComprobante: async (id, motivo) => {
    const response = await apiClient.post(`/facturacion/comprobantes/${id}/anular`, { motivo })
    return response.data
  },

  // =============================================================================
  // GUÍAS DE REMISIÓN
  // =============================================================================

  /**
   * Listar guías de remisión con filtros
   * @param {Object} params - fechaDesde, fechaHasta, estado, destinatarioNumDoc, page, limit
   */
  listarGuias: async (params = {}) => {
    const response = await apiClient.get('/facturacion/guias', { params })
    return response.data
  },

  /**
   * Obtener guía de remisión por ID
   */
  obtenerGuia: async (id) => {
    const response = await apiClient.get(`/facturacion/guias/${id}`)
    return response.data
  },

  /**
   * Emitir guía de remisión manual
   */
  emitirGuia: async (data) => {
    const response = await apiClient.post('/facturacion/guias', data)
    return response.data
  },

  /**
   * Emitir guía de remisión desde encomienda
   * @param {number} encomiendaId - ID de la encomienda
   * @param {Object} data - Datos de la guía
   */
  emitirGuiaDesdeEncomienda: async (encomiendaId, data) => {
    const response = await apiClient.post(`/facturacion/guias/encomienda/${encomiendaId}`, data)
    return response.data
  },

  /**
   * Anular guía de remisión
   * @param {number} id - ID de la guía
   * @param {string} motivo - Motivo de anulación
   */
  anularGuia: async (id, motivo) => {
    const response = await apiClient.post(`/facturacion/guias/${id}/anular`, { motivo })
    return response.data
  },

  // =============================================================================
  // CONFIGURACIÓN
  // =============================================================================

  /**
   * Obtener configuración SUNAT
   */
  obtenerConfiguracion: async () => {
    const response = await apiClient.get('/facturacion/configuracion')
    return response.data
  },

  /**
   * Actualizar configuración SUNAT
   */
  actualizarConfiguracion: async (data) => {
    const response = await apiClient.put('/facturacion/configuracion', data)
    return response.data
  },

  /**
   * Obtener series disponibles
   */
  obtenerSeries: async () => {
    const response = await apiClient.get('/facturacion/series')
    return response.data
  }
}

export default facturacionService
