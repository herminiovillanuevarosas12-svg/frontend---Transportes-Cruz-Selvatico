/**
 * Tracking Service
 * Servicio para consulta publica de encomiendas
 */

import apiClient from './apiClient'

const trackingService = {
  consultar: async (codigo) => {
    const response = await apiClient.get(`/public/tracking/${codigo}`)
    return response.data
  },

  // Codigo de 6 caracteres impreso en el ticket; puede traer simbolos (#, $, ...)
  consultarPorCodigoRastreo: async (codigo) => {
    const response = await apiClient.get(`/public/tracking/rastreo/${encodeURIComponent(codigo)}`)
    return response.data
  }
}

export default trackingService
