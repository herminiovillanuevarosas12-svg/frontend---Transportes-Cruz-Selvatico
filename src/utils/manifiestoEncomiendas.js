/**
 * Reglas de selección del manifiesto de encomiendas
 * (el backend vuelve a validar todo al generar)
 */

const aNumero = (valor) => parseFloat(valor ?? 0) || 0

const redondear = (valor) => Math.round(valor * 100) / 100

/**
 * Solo las encomiendas En ruta que aún no están en un manifiesto y,
 * si ya hay selección, que salen del mismo origen
 * @param {Object} encomienda - Fila del listado
 * @param {number|null} idOrigenFijado - Origen de la selección actual (null = sin selección)
 * @returns {boolean}
 */
export const esSeleccionableParaManifiesto = (encomienda, idOrigenFijado = null) =>
  encomienda.estadoActual === 'EN_RUTA' &&
  !encomienda.manifiesto &&
  (idOrigenFijado === null || encomienda.idPuntoOrigen === idOrigenFijado)

/**
 * Origen que fija la selección: un manifiesto tiene un solo origen
 * @param {Object[]} encomiendas - Encomiendas seleccionadas
 * @returns {number|null}
 */
export const origenDeSeleccion = (encomiendas) => encomiendas[0]?.idPuntoOrigen ?? null

/**
 * Destino compartido por toda la selección (para sugerir el destino final)
 * @param {Object[]} encomiendas - Encomiendas seleccionadas
 * @returns {number|null}
 */
export const destinoComun = (encomiendas) => {
  const destinos = new Set(encomiendas.map((e) => e.idPuntoDestino))
  return destinos.size === 1 ? [...destinos][0] : null
}

/**
 * Totales de la selección actual para la barra de generación
 * @param {Object[]} encomiendas - Encomiendas seleccionadas
 * @returns {{cantidad: number, pesoTotal: number, fleteTotal: number}}
 */
export const resumirSeleccionManifiesto = (encomiendas) => {
  const totales = encomiendas.reduce(
    (acc, e) => ({
      pesoTotal: acc.pesoTotal + aNumero(e.peso),
      fleteTotal: acc.fleteTotal + aNumero(e.precio_final ?? e.precioCalculado)
    }),
    { pesoTotal: 0, fleteTotal: 0 }
  )

  return {
    cantidad: encomiendas.length,
    pesoTotal: redondear(totales.pesoTotal),
    fleteTotal: redondear(totales.fleteTotal)
  }
}
