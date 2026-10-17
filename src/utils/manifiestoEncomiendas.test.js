/**
 * Pruebas de manifiestoEncomiendas
 * Ejecutar: npm test (node --test)
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { esSeleccionableParaManifiesto, resumirSeleccionManifiesto } from './manifiestoEncomiendas.js'

// Fila tal como llega de GET /api/encomiendas (decimales serializados como texto)
const encomienda = (datos = {}) => ({
  id: 1,
  codigoTracking: 'ENC-00000001',
  estadoActual: 'EN_RUTA',
  peso: '1',
  precioCalculado: '10',
  precio_final: null,
  manifiesto: null,
  ...datos
})

describe('esSeleccionableParaManifiesto', () => {
  test('permite una encomienda En ruta sin manifiesto', () => {
    assert.equal(esSeleccionableParaManifiesto(encomienda()), true)
  })

  test('bloquea una encomienda que ya pertenece a un manifiesto', () => {
    assert.equal(
      esSeleccionableParaManifiesto(encomienda({ manifiesto: { id: 12, numeroCompleto: 'MAN-000012' } })),
      false
    )
  })

  test('bloquea encomiendas en cualquier otro estado', () => {
    for (const estado of ['REGISTRADO', 'EN_ALMACEN', 'LLEGO_A_DESTINO', 'RETIRADO']) {
      assert.equal(esSeleccionableParaManifiesto(encomienda({ estadoActual: estado })), false, estado)
    }
  })
})

describe('resumirSeleccionManifiesto', () => {
  test('cuenta y suma peso y flete, usando el precio final cuando existe', () => {
    assert.deepEqual(
      resumirSeleccionManifiesto([
        encomienda({ peso: '4', precioCalculado: '34.5' }),
        encomienda({ peso: '0.5', precioCalculado: '50', precio_final: '45' })
      ]),
      { cantidad: 2, pesoTotal: 4.5, fleteTotal: 79.5 }
    )
  })

  test('redondea a dos decimales', () => {
    assert.deepEqual(
      resumirSeleccionManifiesto([
        encomienda({ peso: '0.1', precioCalculado: '0.1' }),
        encomienda({ peso: '0.2', precioCalculado: '0.2' })
      ]),
      { cantidad: 2, pesoTotal: 0.3, fleteTotal: 0.3 }
    )
  })

  test('devuelve ceros para una selección vacía', () => {
    assert.deepEqual(resumirSeleccionManifiesto([]), { cantidad: 0, pesoTotal: 0, fleteTotal: 0 })
  })
})
