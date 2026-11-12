/**
 * Utilidades de las secciones de cards de /encomiendas-info
 * (carrusel de cards y acceso al modo edición).
 */

import { ROL_SUPER_ADMIN } from '../features/auth/roles.js'

// Cards visibles a la vez en desktop; en celular se ve una
export const CARDS_VISIBLES_DESKTOP = 3

// Tailwind necesita las clases completas escritas en el código: se elige según la constante
const CLASES_GRID_DESKTOP = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
}
export const CLASE_GRID_DESKTOP = CLASES_GRID_DESKTOP[CARDS_VISIBLES_DESKTOP]

/**
 * Para React.lazy: si el chunk no se puede descargar (p. ej. tras un nuevo deploy),
 * resuelve al componente de respaldo en vez de dejar la página en blanco.
 */
export const importarConRespaldo = (importar, Respaldo) => () =>
  importar().catch(() => ({ default: Respaldo }))

// /encomiendas-info?editar=1 abre la página en modo edición (solo superadmin)
export const PARAM_MODO_EDICION = 'editar'
export const URL_EDITAR_SECCIONES_CARDS = `/encomiendas-info?${PARAM_MODO_EDICION}=1`

// Formatos que acepta el backend para las imágenes de las cards
export const FORMATOS_IMAGEN_CARD = 'image/jpeg,image/png,image/gif,image/webp'

/** Índice dentro de [0, total) dando la vuelta en ambos sentidos */
export const indiceCircular = (indice, total) => {
  if (total <= 0) return 0
  return ((indice % total) + total) % total
}

/**
 * Índices de las cards visibles en el carrusel a partir de `inicio`.
 * Si hay `visibles` cards o menos, se muestran todas en su orden.
 */
export const calcularVentana = (total, inicio, visibles) => {
  if (total <= visibles) {
    return Array.from({ length: total }, (_, i) => i)
  }
  return Array.from({ length: visibles }, (_, i) => indiceCircular(inicio + i, total))
}

/** Solo el superadministrador edita las secciones desde la página pública */
export const puedeEditarPagina = (user) => user?.rol === ROL_SUPER_ADMIN
