/**
 * Documento de identidad
 * Catálogo SUNAT (tabla 06) de los tipos de documento que usa el sistema
 * y reglas de formato para normalizar, validar y deducir el tipo del número.
 *
 * Los códigos viajan tal cual al backend, a tbl_pasajeros.tipo_documento
 * y a los comprobantes electrónicos.
 */

export const CODIGO_DNI = '1'
export const CODIGO_CE = '4'
export const CODIGO_RUC = '6'

export const TIPOS_DOCUMENTO = Object.freeze([
  {
    codigo: CODIGO_DNI,
    sigla: 'DNI',
    nombre: 'DNI',
    minimo: 8,
    maximo: 8,
    alfanumerico: false,
    placeholder: '12345678',
    consultaApi: true
  },
  {
    codigo: CODIGO_CE,
    sigla: 'CE',
    nombre: 'Carnet de extranjería',
    minimo: 9,
    maximo: 12,
    alfanumerico: true,
    placeholder: 'Ej: 001234567',
    consultaApi: false
  },
  {
    codigo: CODIGO_RUC,
    sigla: 'RUC',
    nombre: 'RUC',
    minimo: 11,
    maximo: 11,
    alfanumerico: false,
    placeholder: '20123456789',
    consultaApi: true
  }
])

const TIPOS_NUMERICOS = TIPOS_DOCUMENTO.filter(t => !t.alfanumerico)
const MAXIMO_NUMERICO = Math.max(...TIPOS_NUMERICOS.map(t => t.maximo))

// Para deducir el tipo se prueban primero los numéricos (DNI, RUC) porque
// el patrón alfanumérico del CE también acepta un número de 11 dígitos.
const ORDEN_DETECCION = [...TIPOS_NUMERICOS, ...TIPOS_DOCUMENTO.filter(t => t.alfanumerico)]

const buscarTipo = (codigo) => TIPOS_DOCUMENTO.find(t => t.codigo === String(codigo))

const patronDe = (tipo) =>
  new RegExp(`^${tipo.alfanumerico ? '[A-Z0-9]' : '\\d'}{${tipo.minimo},${tipo.maximo}}$`)

/**
 * Definición del tipo; si el código no existe devuelve DNI.
 */
export const obtenerTipoDocumento = (codigo) => buscarTipo(codigo) || TIPOS_DOCUMENTO[0]

/**
 * Limpia lo que escribe el usuario según el tipo.
 * DNI y RUC comparten modo numérico (hasta 11 dígitos) para poder escribir un RUC
 * sin cambiar el selector; CE acepta letras y números en mayúscula.
 */
export const normalizarDocumento = (codigo, valor = '') => {
  const tipo = obtenerTipoDocumento(codigo)
  const texto = String(valor ?? '')
  if (tipo.alfanumerico) {
    return texto.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, tipo.maximo)
  }
  return texto.replace(/\D/g, '').slice(0, MAXIMO_NUMERICO)
}

export const esDocumentoValido = (codigo, numero) => {
  if (!numero) return false
  const tipo = buscarTipo(codigo)
  if (!tipo) return false
  return patronDe(tipo).test(String(numero))
}

/**
 * En modo numérico alterna entre DNI y RUC según la cantidad de dígitos.
 * El carnet de extranjería nunca cambia solo.
 */
export const ajustarTipoPorNumero = (codigo, numero = '') => {
  const tipo = obtenerTipoDocumento(codigo)
  if (tipo.alfanumerico) return tipo.codigo
  if (esDocumentoValido(CODIGO_RUC, numero)) return CODIGO_RUC
  if (numero.length <= obtenerTipoDocumento(CODIGO_DNI).maximo) return CODIGO_DNI
  return tipo.codigo
}

/**
 * Deduce el tipo de un documento ya registrado (por ejemplo, un cliente elegido
 * del buscador). Si no encaja con ninguno, se asume DNI.
 */
export const detectarTipoDocumento = (numero = '') => {
  const tipo = ORDEN_DETECCION.find(t => esDocumentoValido(t.codigo, numero))
  return tipo ? tipo.codigo : CODIGO_DNI
}

/**
 * Sigla (DNI, CE, RUC) deducida del número, para mostrarla junto a un documento ya registrado.
 */
export const siglaDocumento = (numero) => obtenerTipoDocumento(detectarTipoDocumento(numero)).sigla

export const mensajeErrorDocumento = (codigo, rol) => {
  const tipo = obtenerTipoDocumento(codigo)
  const regla = tipo.minimo === tipo.maximo
    ? `${tipo.maximo} ${tipo.alfanumerico ? 'caracteres' : 'dígitos'}`
    : `entre ${tipo.minimo} y ${tipo.maximo} caracteres alfanuméricos`
  return `El ${tipo.nombre} del ${rol} debe tener ${regla}`
}
