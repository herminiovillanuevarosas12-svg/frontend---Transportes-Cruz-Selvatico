/**
 * Pruebas de utils/seccionesCards (carrusel y permisos del modo edición de /encomiendas-info)
 * Ejecutar: npm test (node --test)
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  CARDS_VISIBLES_DESKTOP,
  CLASE_GRID_DESKTOP,
  indiceCircular,
  calcularVentana,
  puedeEditarPagina,
  importarConRespaldo,
} from './seccionesCards.js'

describe('CLASE_GRID_DESKTOP', () => {
  test('la grilla de desktop sale de CARDS_VISIBLES_DESKTOP', () => {
    assert.equal(CLASE_GRID_DESKTOP, `md:grid-cols-${CARDS_VISIBLES_DESKTOP}`)
  })
})

describe('importarConRespaldo', () => {
  const Respaldo = () => null

  test('devuelve el módulo cuando la importación funciona', async () => {
    const modulo = { default: () => 'editor' }
    assert.equal(await importarConRespaldo(async () => modulo, Respaldo)(), modulo)
  })

  test('devuelve el respaldo cuando la importación falla (chunk no disponible)', async () => {
    const resultado = await importarConRespaldo(async () => { throw new Error('Failed to fetch dynamically imported module') }, Respaldo)()
    assert.equal(resultado.default, Respaldo)
  })
})

describe('indiceCircular', () => {
  test('da la vuelta hacia atrás y hacia adelante', () => {
    assert.equal(indiceCircular(-1, 5), 4)
    assert.equal(indiceCircular(5, 5), 0)
    assert.equal(indiceCircular(2, 5), 2)
  })

  test('sin elementos devuelve 0', () => {
    assert.equal(indiceCircular(3, 0), 0)
  })
})

describe('calcularVentana', () => {
  test('muestra las visibles a partir del inicio, dando la vuelta', () => {
    assert.deepEqual(calcularVentana(5, 3, 3), [3, 4, 0])
    assert.deepEqual(calcularVentana(5, 0, 3), [0, 1, 2])
  })

  test('con menos cards que visibles muestra todas en orden', () => {
    assert.deepEqual(calcularVentana(2, 1, 3), [0, 1])
    assert.deepEqual(calcularVentana(3, 2, 3), [0, 1, 2])
  })

  test('sin cards no muestra nada', () => {
    assert.deepEqual(calcularVentana(0, 0, 3), [])
  })

  test('la cantidad visible en desktop es 3', () => {
    assert.equal(CARDS_VISIBLES_DESKTOP, 3)
  })
})

describe('puedeEditarPagina', () => {
  test('solo el superadministrador puede editar', () => {
    assert.equal(puedeEditarPagina({ rol: 'SUPER_ADMIN' }), true)
    assert.equal(puedeEditarPagina({ rol: 'ADMINISTRADOR' }), false)
  })

  test('sin sesión no puede editar', () => {
    assert.equal(puedeEditarPagina(null), false)
    assert.equal(puedeEditarPagina(undefined), false)
  })
})
