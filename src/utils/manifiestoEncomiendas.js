/**
 * Reglas de selección del manifiesto de encomiendas
 * (el backend vuelve a validar todo al generar)
 */

const aNumero = (valor) => parseFloat(valor ?? 0) || 0

const redondear = (valor) => Math.round(valor * 100) / 100

/**
 * Solo las encomiendas En ruta que aún no están en un manifiesto
 * @param {Object} encomienda - Fila del listado
 * @returns {boolean}
 */
export const esSeleccionableParaManifiesto = (encomienda) =>
  encomienda.estadoActual === 'EN_RUTA' && !encomienda.manifiesto

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
