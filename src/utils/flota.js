/**
 * Flota
 * Pestañas del módulo Flota (tipos de carro, conductores y buses) y el permiso de cada una
 */

export const PESTANAS_FLOTA = [
  { id: 'tipos-carro', etiqueta: 'Tipos de carro', permiso: 'RUTAS_LISTAR' },
  { id: 'conductores', etiqueta: 'Conductores', permiso: 'CONDUCTORES_LISTAR' },
  { id: 'buses', etiqueta: 'Buses', permiso: 'BUSES_LISTAR' }
]

// Basta con uno para ver el módulo
export const PERMISOS_FLOTA = PESTANAS_FLOTA.map((pestana) => pestana.permiso)

/**
 * Pestaña a mostrar: la pedida si el usuario puede verla; si no, la primera visible
 * @param {string|null} idSolicitado - Ej: el parámetro ?tab= de la URL
 * @param {Object[]} visibles - Pestañas que el usuario puede ver
 * @returns {Object|null}
 */
export const elegirPestana = (idSolicitado, visibles) =>
  visibles.find((pestana) => pestana.id === idSolicitado) ?? visibles[0] ?? null
