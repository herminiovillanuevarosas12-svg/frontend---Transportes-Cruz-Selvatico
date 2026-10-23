/**
 * Pruebas de selector
 * Ejecutar: npm test (node --test)
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { textoSelector } from './selector.js'

describe('textoSelector', () => {
  const textos = { seleccionar: 'Seleccione el conductor', vacio: 'No hay conductores registrados' }

  test('mientras carga lo indica', () => {
    assert.equal(textoSelector({ cargando: true, cantidad: 0, ...textos }), 'Cargando...')
  })

  test('con opciones invita a elegir', () => {
    assert.equal(textoSelector({ cargando: false, cantidad: 2, ...textos }), 'Seleccione el conductor')
  })

  test('sin opciones avisa que la lista está vacía', () => {
    assert.equal(textoSelector({ cargando: false, cantidad: 0, ...textos }), 'No hay conductores registrados')
  })
})
