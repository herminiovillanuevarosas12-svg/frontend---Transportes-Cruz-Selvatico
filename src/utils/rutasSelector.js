/**
 * Rutas Selector Utils
 * Lógica pura para la selección en cascada de rutas:
 * punto de inicio → punto de fin → vehículo (tipo de carro).
 *
 * Trabaja sobre la lista de rutas activas que devuelve GET /api/rutas,
 * por lo que solo ofrece combinaciones que existen como ruta.
 */

const SELECCION_VACIA = Object.freeze({ idOrigen: '', idDestino: '', idTipoCarro: '' })

const mismoId = (a, b) => String(a) === String(b)

const ordenarPorNombre = (items) =>
  [...items].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'))

const unicosPorId = (items) => {
  const vistos = new Map()
  items.forEach(item => {
    if (item && !vistos.has(item.id)) vistos.set(item.id, item)
  })
  return [...vistos.values()]
}

/**
 * Puntos que son origen de al menos una ruta.
 */
export const obtenerOrigenes = (rutas = []) =>
  ordenarPorNombre(unicosPorId(rutas.map(r => r.puntoOrigen)))

/**
 * Puntos de fin alcanzables desde el origen indicado.
 */
export const obtenerDestinos = (rutas = [], idOrigen) => {
  if (!idOrigen) return []
  const destinos = rutas
    .filter(r => mismoId(r.idPuntoOrigen, idOrigen))
    .map(r => r.puntoDestino)
  return ordenarPorNombre(unicosPorId(destinos))
}

/**
 * Rutas (una por vehículo) que cubren el tramo origen → destino,
 * ordenadas por nombre de vehículo.
 */
export const obtenerRutasTramo = (rutas = [], idOrigen, idDestino) => {
  if (!idOrigen || !idDestino) return []
  return rutas
    .filter(r => mismoId(r.idPuntoOrigen, idOrigen) && mismoId(r.idPuntoDestino, idDestino))
    .sort((a, b) => (a.tipoCarro?.nombre || '').localeCompare(b.tipoCarro?.nombre || '', 'es'))
}

/**
 * Ruta que coincide con la tripleta origen, destino y vehículo, o null.
 */
export const resolverRuta = (rutas = [], idOrigen, idDestino, idTipoCarro) => {
  if (!idTipoCarro) return null
  return obtenerRutasTramo(rutas, idOrigen, idDestino)
    .find(r => mismoId(r.idTipoCarro, idTipoCarro)) || null
}

/**
 * Descompone un idRuta en su selección { idOrigen, idDestino, idTipoCarro } (como texto).
 * Devuelve selección vacía si no hay id o la ruta no existe.
 */
export const descomponerRuta = (rutas = [], idRuta) => {
  if (!idRuta) return { ...SELECCION_VACIA }
  const ruta = rutas.find(r => mismoId(r.id, idRuta))
  if (!ruta) return { ...SELECCION_VACIA }
  return {
    idOrigen: String(ruta.idPuntoOrigen),
    idDestino: String(ruta.idPuntoDestino),
    idTipoCarro: String(ruta.idTipoCarro)
  }
}

export const seleccionVacia = () => ({ ...SELECCION_VACIA })
