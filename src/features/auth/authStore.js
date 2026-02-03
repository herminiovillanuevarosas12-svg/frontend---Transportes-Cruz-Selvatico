/**
 * Auth Store - Zustand
 * Manejo de estado de autenticacion
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authService from '../../services/authService'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Acciones
      login: async (correo, contrasena) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authService.login(correo, contrasena)

          set({
            user: response.usuario,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          return { success: true }
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Error al iniciar sesion'
          })

          return { success: false, error: error.response?.data?.error }
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch (error) {
          console.error('Error en logout:', error)
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
          })
        }
      },

      refreshUser: async () => {
        const { token } = get()

        if (!token) {
          set({ isAuthenticated: false })
          return
        }

        try {
          const response = await authService.me()
          set({ user: response.usuario })
        } catch (error) {
          // Token invalido o expirado
          set({
            user: null,
            token: null,
            isAuthenticated: false
          })
        }
      },

      // Verificar si el usuario tiene un permiso
      hasPermission: (codigo) => {
        const { user } = get()
        if (!user || !user.permisos) return false
        return user.permisos.some(p => p.codigo === codigo)
      },

      // Verificar si el usuario tiene alguno de los permisos
      hasAnyPermission: (codigos) => {
        const { user } = get()
        if (!user || !user.permisos) return false
        const userPermisos = user.permisos.map(p => p.codigo)
        return codigos.some(c => userPermisos.includes(c))
      },

      // Limpiar error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
