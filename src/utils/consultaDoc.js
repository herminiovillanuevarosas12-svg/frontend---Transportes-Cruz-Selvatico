/**
 * Errores de la consulta de DNI/RUC (/consulta-doc)
 *
 * El backend responde 404 solo cuando el documento no existe. Cuota de API Perú
 * agotada (429), token inválido o API caída (503) son fallos del servicio: el
 * buscador no debe decir "DNI no encontrado" en esos casos.
 */

export const MENSAJE_SIN_CONEXION = 'No hay conexión con el servidor. Revise su conexión a internet y vuelva a intentar, o escriba los datos a mano para continuar.'
const MENSAJE_SERVICIO_GENERICO = 'La búsqueda de DNI/RUC no está disponible. Escriba los datos a mano para continuar y, si el problema sigue, avise al administrador.'

// Tiempo en pantalla del aviso: el mensaje tiene dos indicaciones y debe poder leerse
export const DURACION_TOAST_FALLO_MS = 10000

/**
 * Mensaje para el usuario cuando la consulta falló por el servicio
 * @param {Object} error - Error de axios
 * @returns {string|null} Mensaje, o null si el documento simplemente no se encontró
 */
export const mensajeFalloServicioConsulta = (error) => {
  const response = error?.response
  if (!response) return MENSAJE_SIN_CONEXION

  const { status, data } = response
  if (data?.codigo === 'NO_ENCONTRADO' || status === 404 || status === 400) return null

  return data?.error || MENSAJE_SERVICIO_GENERICO
}
