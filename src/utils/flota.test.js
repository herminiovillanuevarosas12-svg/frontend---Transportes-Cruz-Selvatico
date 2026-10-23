/**
 * Pruebas de flota (pestañas del módulo Flota)
 * Ejecutar: npm test (node --test)
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { PESTANAS_FLOTA, PERMISOS_FLOTA, elegirPestana } from './flota.js'

describe('PESTANAS_FLOTA', () => {
  test('tipos de carro, conductores y buses, en ese orden', () => {
    assert.deepEqual(PESTANAS_FLOTA.map((p) => p.id), ['tipos-carro', 'conductores', 'buses'])
  })

  test('el módulo se ve con el permiso de cualquiera de sus pestañas', () => {
    assert.deepEqual(PERMISOS_FLOTA, ['RUTAS_LISTAR', 'CONDUCTORES_LISTAR', 'BUSES_LISTAR'])
  })
})

describe('elegirPestana', () => {
  const visibles = PESTANAS_FLOTA.filter((p) => p.id !== 'conductores')

  test('abre la pestaña pedida si el usuario puede verla', () => {
    assert.equal(elegirPestana('buses', visibles).id, 'buses')
  })

  test('sin pestaña pedida abre la primera visible', () => {
    assert.equal(elegirPestana(null, visibles).id, 'tipos-carro')
  })

  test('una pestaña sin permiso o inexistente abre la primera visible', () => {
    assert.equal(elegirPestana('conductores', visibles).id, 'tipos-carro')
    assert.equal(elegirPestana('otra', visibles).id, 'tipos-carro')
  })

  test('sin pestañas visibles devuelve null', () => {
    assert.equal(elegirPestana('buses', []), null)
  })
})
