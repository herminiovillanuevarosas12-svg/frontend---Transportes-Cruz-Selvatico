/**
 * Consulta Documento Service
 * Servicio para consultas de DNI y RUC via apiperu.dev
 */

import apiClient from './apiClient'

const consultaDocService = {
  /**
   * Consultar datos de persona por DNI
   * @param {string} dni - DNI de 8 digitos
   * @returns {Promise<Object>} { success, data: { numero, nombre_completo, nombres, apellido_paterno, apellido_materno }, source }
   */
  consultarDni: async (dni) => {
    const response = await apiClient.get(`/consulta-doc/dni/${dni}`)
    return response.data
  },

  /**
   * Consultar datos de empresa por RUC
   * @param {string} ruc - RUC de 11 digitos
   * @returns {Promise<Object>} { success, data: { ruc, razon_social, nombre_comercial, estado, condicion, domicilio, ubigeo }, source }
   */
  consultarRuc: async (ruc) => {
    const response = await apiClient.get(`/consulta-doc/ruc/${ruc}`)
    return response.data
  }
}

export default consultaDocService
