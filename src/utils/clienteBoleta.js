/**
 * Cliente de la boleta
 * Tipos de documento que se pueden elegir en la sección "Datos del cliente" de una boleta
 * (DNI, carnet de extranjería, RUC o sin documento) y reglas para validarla y enviarla.
 *
 * Mismas reglas que el backend (utils/clienteComprobante.js).
 */

import {
  TIPOS_DOCUMENTO,
  CODIGO_DNI,
  esDocumentoValido,
  detectarTipoDocumento
} from './documentoIdentidad.js'

// Tabla "TIPOS DE CLIENTE" de KEYFACIL: "- VARIOS - VENTAS MENORES A S/.700.00 Y OTROS"
export const CODIGO_SIN_DOCUMENTO = '-'
// Número que guarda el backend para una boleta sin documento
export const NUMERO_SIN_DOCUMENTO = '-'
export const NOMBRE_SIN_DOCUMENTO = 'CLIENTES VARIOS'
// SUNAT: si el total de la boleta supera S/ 700 se debe identificar al cliente
export const MONTO_MAXIMO_SIN_DOCUMENTO = 700

export const TIPOS_CLIENTE_BOLETA = Object.freeze([
  ...TIPOS_DOCUMENTO.map(({ codigo, sigla, nombre }) => ({ codigo, sigla, nombre })),
  { codigo: CODIGO_SIN_DOCUMENTO, sigla: 'Sin documento', nombre: 'Sin documento' }
])

export const esSinDocumento = (tipoDoc) => tipoDoc === CODIGO_SIN_DOCUMENTO

export const clienteBoletaVacio = () => ({ tipoDoc: CODIGO_DNI, numDoc: '', razonSocial: '', direccion: '' })

/**
 * Sin documento solo se permite hasta S/ 700 (total con IGV).
 */
export const sinDocumentoPermitido = (total) => !(Number(total) > MONTO_MAXIMO_SIN_DOCUMENTO)

/**
 * Persona del flujo (pasajero, remitente, quien retira) convertida en cliente de boleta.
 * Devuelve null si sus datos no alcanzan para emitir la boleta.
 * @param {{ tipoDoc?: string, numDoc?: string, nombre?: string }} persona
 */
export const clienteBoletaDesdePersona = ({ tipoDoc, numDoc, nombre } = {}) => {
  const numero = String(numDoc || '').trim()
  const tipo = tipoDoc || detectarTipoDocumento(numero)
  const razonSocial = String(nombre || '').trim()
  if (!esDocumentoValido(tipo, numero) || !razonSocial) return null
  return { tipoDoc: tipo, numDoc: numero, razonSocial, direccion: '' }
}

/**
 * ¿Se puede emitir la boleta con estos datos?
 * Sin documento: el nombre es opcional (va "CLIENTES VARIOS") pero el total no puede pasar de S/ 700.
 */
export const esClienteBoletaValido = (cliente, total) => {
  if (!cliente) return false
  if (esSinDocumento(cliente.tipoDoc)) return sinDocumentoPermitido(total)
  return esDocumentoValido(cliente.tipoDoc, cliente.numDoc) && Boolean(String(cliente.razonSocial || '').trim())
}

/**
 * Datos que se envían al backend como `clienteBoleta`.
 */
export const clienteBoletaParaEnvio = (cliente) => {
  const razonSocial = String(cliente.razonSocial || '').replace(/\s+/g, ' ').trim()
  const direccion = String(cliente.direccion || '').replace(/\s+/g, ' ').trim()
  if (esSinDocumento(cliente.tipoDoc)) {
    return {
      tipoDoc: CODIGO_SIN_DOCUMENTO,
      numDoc: NUMERO_SIN_DOCUMENTO,
      razonSocial: razonSocial || NOMBRE_SIN_DOCUMENTO,
      direccion
    }
  }
  return { tipoDoc: cliente.tipoDoc, numDoc: cliente.numDoc, razonSocial, direccion }
}
