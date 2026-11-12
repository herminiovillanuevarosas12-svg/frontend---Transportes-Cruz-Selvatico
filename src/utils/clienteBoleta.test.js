/**
 * Pruebas de utils/clienteBoleta
 * Ejecutar: npm test (node --test)
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  CODIGO_SIN_DOCUMENTO,
  NUMERO_SIN_DOCUMENTO,
  NOMBRE_SIN_DOCUMENTO,
  TIPOS_CLIENTE_BOLETA,
  sinDocumentoPermitido,
  clienteBoletaDesdePersona,
  esClienteBoletaValido,
  clienteBoletaParaEnvio
} from './clienteBoleta.js'

describe('TIPOS_CLIENTE_BOLETA', () => {
  test('ofrece DNI, CE, RUC y Sin documento', () => {
    assert.deepEqual(TIPOS_CLIENTE_BOLETA.map(t => t.codigo), ['1', '4', '6', '-'])
  })
})

describe('sinDocumentoPermitido', () => {
  test('hasta S/ 700 inclusive', () => {
    assert.equal(sinDocumentoPermitido(700), true)
    assert.equal(sinDocumentoPermitido('35.00'), true)
    assert.equal(sinDocumentoPermitido(700.01), false)
  })
})

describe('clienteBoletaDesdePersona', () => {
  test('convierte al pasajero con documento y nombre válidos', () => {
    assert.deepEqual(
      clienteBoletaDesdePersona({ tipoDoc: '1', numDoc: '12345678', nombre: ' JUAN PEREZ ' }),
      { tipoDoc: '1', numDoc: '12345678', razonSocial: 'JUAN PEREZ', direccion: '' }
    )
  })

  test('deduce el tipo si no viene', () => {
    assert.equal(clienteBoletaDesdePersona({ numDoc: '20609654547', nombre: 'EMPRESA' }).tipoDoc, '6')
  })

  test('devuelve null si faltan datos', () => {
    assert.equal(clienteBoletaDesdePersona({ tipoDoc: '1', numDoc: '1234', nombre: 'JUAN' }), null)
    assert.equal(clienteBoletaDesdePersona({ tipoDoc: '1', numDoc: '12345678', nombre: '  ' }), null)
    assert.equal(clienteBoletaDesdePersona(), null)
  })
})

describe('esClienteBoletaValido', () => {
  test('con documento exige número válido y nombre', () => {
    assert.equal(esClienteBoletaValido({ tipoDoc: '1', numDoc: '12345678', razonSocial: 'JUAN' }, 50), true)
    assert.equal(esClienteBoletaValido({ tipoDoc: '1', numDoc: '12345678', razonSocial: '' }, 50), false)
    assert.equal(esClienteBoletaValido({ tipoDoc: '6', numDoc: '2060965454', razonSocial: 'X' }, 50), false)
  })

  test('sin documento: nombre opcional, total hasta S/ 700', () => {
    const sinDoc = { tipoDoc: CODIGO_SIN_DOCUMENTO, numDoc: '', razonSocial: '' }
    assert.equal(esClienteBoletaValido(sinDoc, 120), true)
    assert.equal(esClienteBoletaValido(sinDoc, 750), false)
  })

  test('sin cliente no es válido', () => {
    assert.equal(esClienteBoletaValido(null, 10), false)
  })
})

describe('clienteBoletaParaEnvio', () => {
  test('sin documento envía guion y CLIENTES VARIOS si no hay nombre', () => {
    assert.deepEqual(
      clienteBoletaParaEnvio({ tipoDoc: '-', numDoc: '999', razonSocial: '  ', direccion: '' }),
      { tipoDoc: '-', numDoc: NUMERO_SIN_DOCUMENTO, razonSocial: NOMBRE_SIN_DOCUMENTO, direccion: '' }
    )
  })

  test('sin documento conserva el nombre escrito', () => {
    assert.equal(clienteBoletaParaEnvio({ tipoDoc: '-', razonSocial: ' Maria  Lopez ' }).razonSocial, 'Maria Lopez')
  })

  test('con documento limpia espacios', () => {
    assert.deepEqual(
      clienteBoletaParaEnvio({ tipoDoc: '1', numDoc: '12345678', razonSocial: ' JUAN  PEREZ ', direccion: ' Jr. Lima ' }),
      { tipoDoc: '1', numDoc: '12345678', razonSocial: 'JUAN PEREZ', direccion: 'Jr. Lima' }
    )
  })
})
