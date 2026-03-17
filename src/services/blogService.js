/**
 * Blog Service
 * Servicio para gestion del blog (admin)
 */

import apiClient from './apiClient'

const blogService = {
  // ============================================
  // CATEGORIAS
  // ============================================

  listarCategorias: async () => {
    const response = await apiClient.get('/blog/categorias')
    return response.data
  },

  crearCategoria: async (data) => {
    const response = await apiClient.post('/blog/categorias', data)
    return response.data
  },

  actualizarCategoria: async (id, data) => {
    const response = await apiClient.put(`/blog/categorias/${id}`, data)
    return response.data
  },

  eliminarCategoria: async (id) => {
    const response = await apiClient.delete(`/blog/categorias/${id}`)
    return response.data
  },

  // ============================================
  // ARTICULOS
  // ============================================

  listarArticulos: async () => {
    const response = await apiClient.get('/blog/articulos')
    return response.data
  },

  obtenerArticulo: async (id) => {
    const response = await apiClient.get(`/blog/articulos/${id}`)
    return response.data
  },

  crearArticulo: async (formData) => {
    const response = await apiClient.post('/blog/articulos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  actualizarArticulo: async (id, formData) => {
    const response = await apiClient.put(`/blog/articulos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  eliminarArticulo: async (id) => {
    const response = await apiClient.delete(`/blog/articulos/${id}`)
    return response.data
  },

  toggleEstado: async (id) => {
    const response = await apiClient.patch(`/blog/articulos/${id}/toggle-estado`)
    return response.data
  },

  toggleDestacado: async (id) => {
    const response = await apiClient.patch(`/blog/articulos/${id}/toggle-destacado`)
    return response.data
  },

  toggleRecomendado: async (id) => {
    const response = await apiClient.patch(`/blog/articulos/${id}/toggle-recomendado`)
    return response.data
  }
}

export default blogService
