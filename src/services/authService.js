/**
 * Auth Service
 * Servicios de autenticacion
 */

import apiClient from './apiClient'

const authService = {
  /**
   * Iniciar sesion
   * @param {string} correo
   * @param {string} contrasena
   * @returns {Promise<Object>} { token, usuario }
   */
  login: async (correo, contrasena) => {
    const response = await apiClient.post('/auth/login', { correo, contrasena })
    return response.data
  },

  /**
   * Cerrar sesion
   */
  logout: async () => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },

  /**
   * Obtener usuario actual
   * @returns {Promise<Object>} { usuario }
   */
  me: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  }
}

export default authService
