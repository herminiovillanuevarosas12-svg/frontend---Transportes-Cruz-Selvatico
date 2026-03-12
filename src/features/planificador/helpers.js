/**
 * Helpers para el Planificador de Viaje
 * Funciones puras sin side effects
 */

/**
 * Filtra rutas que coincidan con origen y destino de un tramo
 */
export function filtrarRutasPorTramo(rutas, origen, destino) {
  if (!origen || !destino) return []
  return rutas.filter(ruta => {
    const matchOrigen = ruta.origen?.ciudad?.toLowerCase() === origen.toLowerCase()
    const matchDestino = ruta.destino?.ciudad?.toLowerCase() === destino.toLowerCase()
    return matchOrigen && matchDestino
  })
}

/**
 * Extrae horarios de las rutas filtradas para un tramo
 */
export function extraerHorarios(rutasFiltradas) {
  const horarios = []
  rutasFiltradas.forEach(ruta => {
    (ruta.horarios || []).forEach(horario => {
      horarios.push({
        id: `${ruta.id}-${horario.id}`,
        rutaId: ruta.id,
        horarioId: horario.id,
        hora: horario.hora || horario.horaSalida || '--:--',
        horaLlegada: horario.horaLlegada || null,
        precio: Number(ruta.precioPasaje || 0),
        capacidad: horario.capacidadTotal || null,
        tipoServicio: ruta.tipoServicio || 'Ejecutivo',
        duracion: ruta.duracion || null,
        origen: ruta.origen?.ciudad || '',
        destino: ruta.destino?.ciudad || '',
      })
    })
  })
  horarios.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))
  return horarios
}

/**
 * Calcula total de la cotizacion sumando precio * pasajeros de cada tramo
 */
export function calcularTotal(tramos) {
  return tramos
    .filter(t => t.completado && t.horarioSeleccionado)
    .reduce((acc, t) => acc + (t.horarioSeleccionado.precio || 0) * t.pasajeros, 0)
}

/**
 * Calcula subtotal de un tramo
 */
export function calcularSubtotal(tramo) {
  if (!tramo.horarioSeleccionado) return 0
  return (tramo.horarioSeleccionado.precio || 0) * tramo.pasajeros
}

/**
 * Formatea fecha YYYY-MM-DD a texto legible
 */
export function formatearFecha(fechaStr) {
  if (!fechaStr) return ''
  const [y, m, d] = fechaStr.split('-').map(Number)
  const fecha = new Date(y, m - 1, d)
  return fecha.toLocaleDateString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Formatea hora HH:MM:SS a HH:MM
 */
export function formatearHora(hora) {
  if (!hora || hora === '--:--') return '--:--'
  return hora.substring(0, 5)
}

/**
 * Formatea precio en soles
 */
export function formatearPrecio(monto) {
  return `S/ ${Number(monto || 0).toFixed(2)}`
}

/**
 * Genera texto preformateado para WhatsApp
 */
export function generarTextoWhatsApp(tramos, total, nombreEmpresa) {
  let texto = `Hola ${nombreEmpresa}, me interesa cotizar el siguiente itinerario:\n\n`

  tramos.filter(t => t.completado).forEach((tramo, i) => {
    const h = tramo.horarioSeleccionado
    texto += `*Tramo ${i + 1}:* ${tramo.origen} → ${tramo.destino}\n`
    texto += `Fecha: ${formatearFecha(tramo.fecha)}\n`
    texto += `Hora: ${formatearHora(h?.hora)}\n`
    texto += `Pasajeros: ${tramo.pasajeros}\n`
    texto += `Subtotal: ${formatearPrecio(calcularSubtotal(tramo))}\n\n`
  })

  texto += `*Total estimado: ${formatearPrecio(total)}*\n\n`
  texto += `Quedo atento/a a su respuesta. Gracias.`

  return encodeURIComponent(texto)
}

/**
 * Obtiene ciudades unicas desde los puntos
 */
export function getCiudadesUnicas(puntos) {
  return [...new Set(puntos.map(p => p.ciudad))].sort()
}
