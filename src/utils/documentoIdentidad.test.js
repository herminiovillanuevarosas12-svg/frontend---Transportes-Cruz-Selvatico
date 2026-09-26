/**
 * Pruebas de documentoIdentidad
 * Ejecutar: npm test (node --test)
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  TIPOS_DOCUMENTO,
  CODIGO_DNI,
  CODIGO_CE,
  CODIGO_RUC,
  obtenerTipoDocumento,
  normalizarDocumento,
  esDocumentoValido,
  ajustarTipoPorNumero,
  detectarTipoDocumento,
  mensajeErrorDocumento,
  siglaDocumento
} from './documentoIdentidad.js'

describe('catálogo', () => {
  test('incluye DNI, carnet de extranjería y RUC con códigos SUNAT', () => {
    assert.deepEqual(TIPOS_DOCUMENTO.map(t => t.codigo), [CODIGO_DNI, CODIGO_CE, CODIGO_RUC])
    assert.equal(CODIGO_DNI, '1')
    assert.equal(CODIGO_CE, '4')
    assert.equal(CODIGO_RUC, '6')
  })

  test('obtenerTipoDocumento devuelve DNI para un código desconocido', () => {
    assert.equal(obtenerTipoDocumento('9').codigo, CODIGO_DNI)
    assert.equal(obtenerTipoDocumento(CODIGO_CE).sigla, 'CE')
  })
})

describe('normalizarDocumento', () => {
  test('con DNI o RUC deja solo dígitos y permite hasta 11 para poder escribir un RUC', () => {
    assert.equal(normalizarDocumento(CODIGO_DNI, '20-123.456789xx'), '20123456789')
    assert.equal(normalizarDocumento(CODIGO_RUC, '201234567890123'), '20123456789')
  })

  test('con carnet de extranjería deja letras y números en mayúscula hasta 12', () => {
    assert.equal(normalizarDocumento(CODIGO_CE, 'ab-001 234567'), 'AB001234567')
    assert.equal(normalizarDocumento(CODIGO_CE, 'ABCDEFGHIJKLMNO'), 'ABCDEFGHIJKL')
  })
})

describe('esDocumentoValido', () => {
  test('DNI exige exactamente 8 dígitos', () => {
    assert.equal(esDocumentoValido(CODIGO_DNI, '12345678'), true)
    assert.equal(esDocumentoValido(CODIGO_DNI, '1234567'), false)
    assert.equal(esDocumentoValido(CODIGO_DNI, '1234567A'), false)
  })

  test('RUC exige exactamente 11 dígitos', () => {
    assert.equal(esDocumentoValido(CODIGO_RUC, '20123456789'), true)
    assert.equal(esDocumentoValido(CODIGO_RUC, '2012345678'), false)
  })

  test('carnet de extranjería acepta de 9 a 12 caracteres alfanuméricos', () => {
    assert.equal(esDocumentoValido(CODIGO_CE, '001234567'), true)
    assert.equal(esDocumentoValido(CODIGO_CE, 'AB1234567890'), true)
    assert.equal(esDocumentoValido(CODIGO_CE, '12345678'), false)
    assert.equal(esDocumentoValido(CODIGO_CE, 'ABCDEFGHIJKLM'), false)
    assert.equal(esDocumentoValido(CODIGO_CE, '0012345-7'), false)
  })

  test('valores vacíos nunca son válidos', () => {
    assert.equal(esDocumentoValido(CODIGO_DNI, ''), false)
    assert.equal(esDocumentoValido(CODIGO_CE, null), false)
  })
})

describe('ajustarTipoPorNumero', () => {
  test('en modo numérico cambia a RUC al completar 11 dígitos', () => {
    assert.equal(ajustarTipoPorNumero(CODIGO_DNI, '20123456789'), CODIGO_RUC)
  })

  test('en modo numérico vuelve a DNI cuando quedan 8 dígitos o menos', () => {
    assert.equal(ajustarTipoPorNumero(CODIGO_RUC, '12345678'), CODIGO_DNI)
    assert.equal(ajustarTipoPorNumero(CODIGO_RUC, ''), CODIGO_DNI)
  })

  test('mantiene el tipo mientras el RUC está en progreso', () => {
    assert.equal(ajustarTipoPorNumero(CODIGO_DNI, '201234567'), CODIGO_DNI)
  })

  test('nunca cambia el tipo cuando es carnet de extranjería', () => {
    assert.equal(ajustarTipoPorNumero(CODIGO_CE, '20123456789'), CODIGO_CE)
  })
})

describe('detectarTipoDocumento', () => {
  test('deduce el tipo a partir de un documento ya registrado', () => {
    assert.equal(detectarTipoDocumento('12345678'), CODIGO_DNI)
    assert.equal(detectarTipoDocumento('20123456789'), CODIGO_RUC)
    assert.equal(detectarTipoDocumento('001234567'), CODIGO_CE)
    assert.equal(detectarTipoDocumento('AB1234567'), CODIGO_CE)
  })

  test('usa DNI cuando el documento no encaja con ningún tipo', () => {
    assert.equal(detectarTipoDocumento('123'), CODIGO_DNI)
    assert.equal(detectarTipoDocumento(''), CODIGO_DNI)
  })
})

describe('siglaDocumento', () => {
  test('devuelve la sigla del tipo deducido para mostrar junto al número', () => {
    assert.equal(siglaDocumento('12345678'), 'DNI')
    assert.equal(siglaDocumento('AB0012345'), 'CE')
    assert.equal(siglaDocumento('20123456789'), 'RUC')
    assert.equal(siglaDocumento(''), 'DNI')
  })
})

describe('mensajeErrorDocumento', () => {
  test('describe el tipo, el rol y la regla de formato', () => {
    const mensaje = mensajeErrorDocumento(CODIGO_CE, 'remitente')
    assert.match(mensaje, /carnet de extranjería/i)
    assert.match(mensaje, /remitente/)
    assert.match(mensaje, /9 y 12/)
    assert.match(mensajeErrorDocumento(CODIGO_DNI, 'destinatario'), /8 dígitos/)
    assert.match(mensajeErrorDocumento(CODIGO_RUC, 'destinatario'), /11 dígitos/)
  })
})
