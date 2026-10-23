/**
 * Selector
 * Utilidades para los Select que se llenan con una lista del backend
 */

/**
 * Texto de la opción vacía: avisa mientras carga y si la lista no tiene registros
 * (p. ej. aún no hay conductores)
 * @param {Object} params - { cargando, cantidad, seleccionar, vacio }
 * @returns {string}
 */
export const textoSelector = ({ cargando, cantidad, seleccionar, vacio }) => {
  if (cargando) return 'Cargando...'
  return cantidad > 0 ? seleccionar : vacio
}
