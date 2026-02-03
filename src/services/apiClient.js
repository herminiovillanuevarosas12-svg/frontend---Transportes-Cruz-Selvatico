/**
 * =============================================================================
 * API Client - Configuracion de Axios
 * =============================================================================
 *
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    *** CONFIGURACION HIBRIDA ***                          ║
 * ║                                                                           ║
 * ║  DESARROLLO LOCAL:                                                        ║
 * ║    - VITE_API_URL = /api (proxy via Vite -> localhost:3001)               ║
 * ║    - El proxy de Vite redirige a http://localhost:3001                    ║
 * ║    - No hay problemas de CORS gracias al proxy                            ║
 * ║                                                                           ║
 * ║  PRODUCCION (Railway):                                                    ║
 * ║    - VITE_API_URL = URL del backend en Railway                            ║
 * ║    - Conexion directa al backend (sin proxy)                              ║
 * ║    - CORS configurado en el backend para permitir el frontend             ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import axios from 'axios'

// =============================================================================
// CONFIGURACION DE LA URL DEL API
// =============================================================================
// En desarrollo local: /api (Vite hace proxy a localhost:3001)
// En produccion: URL completa del backend en Railway
// =============================================================================
const API_URL = import.meta.env.VITE_API_URL || '/api'

// URL base para archivos estaticos (uploads)
// En desarrollo: /uploads (proxy via Vite -> localhost:3001/uploads)
// En produccion: URL del backend sin /api + /uploads
const getUploadsBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api'
  // Si es /api (desarrollo con proxy), usar /uploads directamente
  if (apiUrl === '/api') {
    return '/uploads'
  }
  // En produccion, quitar /api del final y agregar /uploads
  return apiUrl.replace(/\/api\/?$/, '/uploads')
}

export const UPLOADS_URL = getUploadsBaseUrl()

/**
 * Construye la URL correcta para un archivo de uploads
 * Maneja tanto rutas relativas como URLs completas de S3
 * @param {string} imagePath - Ruta relativa o URL completa de S3
 * @returns {string} - URL completa para acceder al archivo
 */
export const getUploadUrl = (imagePath) => {
  if (!imagePath) return ''

  // Si es una URL completa de S3, extraer solo la key y usar el proxy
  if (imagePath.includes('wasabisys.com') || imagePath.includes('s3.')) {
    try {
      const url = new URL(imagePath.startsWith('http') ? imagePath : `https://${imagePath}`)
      // El pathname es /bucket/key, necesitamos solo key
      const pathParts = url.pathname.split('/').filter(Boolean)
      // Quitar el nombre del bucket (primer elemento)
      if (pathParts.length > 1) {
        const key = pathParts.slice(1).join('/')
        return `${UPLOADS_URL}/${key}`
      }
    } catch (e) {
      // Si falla el parse, continuar con el path original
    }
  }

  // Ruta relativa normal
  const cleanPath = imagePath.replace(/^\//, '')
  return `${UPLOADS_URL}/${cleanPath}`
}

// Log para debugging (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('[API Client] *** DESARROLLO LOCAL ***')
  console.log('[API Client] API URL:', API_URL)
  console.log('[API Client] Las peticiones /api van al backend local (puerto 3001)')
}

// =============================================================================
// INSTANCIA DE AXIOS
// =============================================================================
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// =============================================================================
// INTERCEPTOR DE REQUEST - Agregar token JWT
// =============================================================================
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token del storage
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// =============================================================================
// INTERCEPTOR DE RESPONSE - Manejar errores
// =============================================================================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o invalido - limpiar storage y redirigir
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
