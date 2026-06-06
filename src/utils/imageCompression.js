/**
 * Image Compression - Normalización de imágenes en el cliente
 *
 * Recodifica cualquier imagen (galería o archivo) a JPEG vía canvas,
 * redimensionando a un máximo configurable. Esto garantiza:
 * 1. Formato siempre renderizable/soportado (JPEG) — elimina HEIC/HEIF
 * 2. Payload pequeño (~100-600KB) — evita errores 400/413 y timeouts
 *
 * Si el navegador no puede decodificar el archivo (ej. HEIC en Chrome),
 * rechaza con error FORMATO_NO_SOPORTADO para mostrar un mensaje claro.
 */

// Códigos de error para manejo en la UI
export const ERRORES_IMAGEN = {
  FORMATO_INVALIDO: 'FORMATO_INVALIDO',
  TAMANO_EXCEDIDO: 'TAMANO_EXCEDIDO',
  FORMATO_NO_SOPORTADO: 'FORMATO_NO_SOPORTADO',
  ERROR_PROCESANDO: 'ERROR_PROCESANDO'
}

// Mensajes amigables por código de error
export const MENSAJES_ERROR_IMAGEN = {
  [ERRORES_IMAGEN.FORMATO_INVALIDO]: 'Por favor seleccione una imagen valida',
  [ERRORES_IMAGEN.TAMANO_EXCEDIDO]: 'La imagen no debe superar los 10MB',
  [ERRORES_IMAGEN.FORMATO_NO_SOPORTADO]:
    'Formato de imagen no soportado por el navegador (ej. HEIC). Use la camara o convierta la foto a JPG.',
  [ERRORES_IMAGEN.ERROR_PROCESANDO]: 'Error al procesar la imagen. Intente con otra foto.'
}

/**
 * Comprime y normaliza una imagen a JPEG en formato dataURL
 * @param {File} file - Archivo de imagen seleccionado
 * @param {Object} opciones
 * @param {number} opciones.maxDim - Dimensión máxima en px (default: 1600)
 * @param {number} opciones.quality - Calidad JPEG 0-1 (default: 0.8)
 * @param {number} opciones.maxSizeMB - Tamaño máximo del archivo original en MB (default: 10)
 * @returns {Promise<string>} dataURL JPEG (`data:image/jpeg;base64,...`)
 * @throws {Error} con message = código de ERRORES_IMAGEN
 */
export const comprimirImagenADataUrl = (file, opciones = {}) => {
  const { maxDim = 1600, quality = 0.8, maxSizeMB = 10 } = opciones

  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error(ERRORES_IMAGEN.FORMATO_INVALIDO))
      return
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      reject(new Error(ERRORES_IMAGEN.TAMANO_EXCEDIDO))
      return
    }

    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      try {
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
        const ctx = canvas.getContext('2d')
        // Fondo blanco para PNG con transparencia (JPEG no soporta alpha)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch (err) {
        console.error('Error recodificando imagen:', err)
        reject(new Error(ERRORES_IMAGEN.ERROR_PROCESANDO))
      }
    }

    img.onerror = () => {
      // El navegador no pudo decodificar el archivo (ej. HEIC/HEIF en Chrome)
      URL.revokeObjectURL(objectUrl)
      reject(new Error(ERRORES_IMAGEN.FORMATO_NO_SOPORTADO))
    }

    img.src = objectUrl
  })
}

/**
 * Obtiene el mensaje de error amigable para un error de comprimirImagenADataUrl
 * @param {Error} error
 * @returns {string}
 */
export const mensajeErrorImagen = (error) =>
  MENSAJES_ERROR_IMAGEN[error?.message] || MENSAJES_ERROR_IMAGEN[ERRORES_IMAGEN.ERROR_PROCESANDO]

export default comprimirImagenADataUrl
