/**
 * Secciones de cards de /encomiendas-info - operaciones del modo edición (solo SUPER_ADMIN).
 * skipAuthRedirect: si la sesión expira, el editor lo maneja sin sacar al usuario de la página pública.
 */

import apiClient from './apiClient'

const SIN_REDIRECCION = { skipAuthRedirect: true }
const MULTIPART = { ...SIN_REDIRECCION, headers: { 'Content-Type': 'multipart/form-data' } }

const BASE_SECCIONES = '/contenido/encomiendas-secciones-cards'
const BASE_CARDS = '/contenido/encomiendas-ventajas'

const seccionesCardsService = {
  listarAdmin: async () => {
    const response = await apiClient.get(BASE_SECCIONES, SIN_REDIRECCION)
    return response.data
  },

  crearSeccion: async (titulo) => {
    const response = await apiClient.post(BASE_SECCIONES, { titulo }, SIN_REDIRECCION)
    return response.data
  },

  renombrarSeccion: async (id, titulo) => {
    const response = await apiClient.put(`${BASE_SECCIONES}/${id}`, { titulo }, SIN_REDIRECCION)
    return response.data
  },

  toggleSeccion: async (id) => {
    const response = await apiClient.patch(`${BASE_SECCIONES}/${id}/toggle`, undefined, SIN_REDIRECCION)
    return response.data
  },

  eliminarSeccion: async (id) => {
    const response = await apiClient.delete(`${BASE_SECCIONES}/${id}`, SIN_REDIRECCION)
    return response.data
  },

  reordenarSecciones: async (ids) => {
    const response = await apiClient.put(`${BASE_SECCIONES}/orden`, { ids }, SIN_REDIRECCION)
    return response.data
  },

  crearCard: async (formData) => {
    const response = await apiClient.post(BASE_CARDS, formData, MULTIPART)
    return response.data
  },

  actualizarCard: async (id, formData) => {
    const response = await apiClient.put(`${BASE_CARDS}/${id}`, formData, MULTIPART)
    return response.data
  },

  toggleCard: async (id) => {
    const response = await apiClient.patch(`${BASE_CARDS}/${id}/toggle`, undefined, SIN_REDIRECCION)
    return response.data
  },

  eliminarCard: async (id) => {
    const response = await apiClient.delete(`${BASE_CARDS}/${id}`, SIN_REDIRECCION)
    return response.data
  },

  reordenarCards: async (idSeccion, ids) => {
    const response = await apiClient.put(`${BASE_CARDS}/orden`, { idSeccion, ids }, SIN_REDIRECCION)
    return response.data
  },
}

export default seccionesCardsService
