/**
 * =============================================================================
 * Vite Configuration - Sistema de Transporte Frontend
 * =============================================================================
 *
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    *** CONFIGURACION HIBRIDA ***                          ║
 * ║                                                                           ║
 * ║  DESARROLLO LOCAL:                                                        ║
 * ║    - Puerto: 5173                                                         ║
 * ║    - Proxy: /api -> http://localhost:3001 (backend local)                 ║
 * ║    - Hot Module Replacement activo                                        ║
 * ║                                                                           ║
 * ║  PRODUCCION (Railway):                                                    ║
 * ║    - Se construye con "vite build"                                        ║
 * ║    - VITE_API_URL apunta al backend de Railway                            ║
 * ║    - No se usa proxy (conexion directa al backend)                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ==========================================================================
  // CONFIGURACION DEL SERVIDOR DE DESARROLLO
  // ==========================================================================
  server: {
    // Puerto del frontend en desarrollo local
    port: 5173,

    // =======================================================================
    // PROXY - Solo se usa en DESARROLLO LOCAL
    // =======================================================================
    // Redirige las peticiones /api al backend local (puerto 3001)
    // Esto evita problemas de CORS durante el desarrollo
    // En produccion (Railway), el frontend se conecta directamente al backend
    // =======================================================================
    proxy: {
      '/api': {
        target: 'http://localhost:3001',  // Backend local
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3001',  // Archivos estaticos del backend
        changeOrigin: true
      }
    }
  },

  // ==========================================================================
  // CONFIGURACION DE BUILD (para produccion)
  // ==========================================================================
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
