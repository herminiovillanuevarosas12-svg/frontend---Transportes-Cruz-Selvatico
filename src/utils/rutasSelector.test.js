/**
 * Pruebas de rutasSelector
 * Ejecutar: npm test (node --test)
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  obtenerOrigenes,
  obtenerDestinos,
  obtenerRutasTramo,
  resolverRuta,
  descomponerRuta
} from './rutasSelector.js'

const oxapampa = { id: 1, nombre: 'Terminal Oxapampa', ciudad: 'Oxapampa' }
const pozuzo = { id: 2, nombre: 'Terminal Pozuzo', ciudad: 'Pozuzo' }
const codo = { id: 3, nombre: 'Terminal Codo del Pozuzo', ciudad: 'Codo del Pozuzo' }

const minivan = { id: 10, nombre: 'Minivan' }
const camioneta = { id: 11, nombre: 'Camioneta' }
const combi = { id: 12, nombre: 'Combi' }

const ruta = (id, origen, destino, tipoCarro, precio) => ({
  id,
  idPuntoOrigen: origen.id,
  idPuntoDestino: destino.id,
  idTipoCarro: tipoCarro.id,
  precioPasaje: precio,
  puntoOrigen: origen,
  puntoDestino: destino,
  tipoCarro
})

const rutas = [
  ruta(1, oxapampa, pozuzo, minivan, '40.00'),
  ruta(2, pozuzo, oxapampa, minivan, '40.00'),
  ruta(3, oxapampa, codo, camioneta, '80.00'),
  ruta(4, oxapampa, pozuzo, combi, '30.00')
]

describe('obtenerOrigenes', () => {
  test('devuelve los puntos de origen sin repetir, ordenados por nombre', () => {
    const origenes = obtenerOrigenes(rutas)
    assert.deepEqual(origenes.map(p => p.id), [oxapampa.id, pozuzo.id])
  })

  test('devuelve lista vacía cuando no hay rutas', () => {
    assert.deepEqual(obtenerOrigenes([]), [])
  })
})

describe('obtenerDestinos', () => {
  test('devuelve solo los destinos alcanzables desde el origen, sin repetir y ordenados', () => {
    const destinos = obtenerDestinos(rutas, '1')
    assert.deepEqual(destinos.map(p => p.id), [codo.id, pozuzo.id])
  })

  test('devuelve lista vacía cuando no hay origen seleccionado', () => {
    assert.deepEqual(obtenerDestinos(rutas, ''), [])
  })
})

describe('obtenerRutasTramo', () => {
  test('devuelve las rutas del tramo ordenadas por nombre de vehículo', () => {
    const tramo = obtenerRutasTramo(rutas, '1', '2')
    assert.deepEqual(tramo.map(r => r.id), [4, 1])
  })

  test('devuelve lista vacía cuando falta origen o destino', () => {
    assert.deepEqual(obtenerRutasTramo(rutas, '1', ''), [])
    assert.deepEqual(obtenerRutasTramo(rutas, '', '2'), [])
  })
})

describe('resolverRuta', () => {
  test('encuentra la ruta que coincide con origen, destino y vehículo', () => {
    const encontrada = resolverRuta(rutas, '1', '2', '12')
    assert.equal(encontrada?.id, 4)
  })

  test('devuelve null cuando la selección está incompleta', () => {
    assert.equal(resolverRuta(rutas, '1', '2', ''), null)
  })

  test('devuelve null cuando la combinación no existe', () => {
    assert.equal(resolverRuta(rutas, '2', '3', '10'), null)
  })
})

describe('descomponerRuta', () => {
  test('devuelve origen, destino y vehículo de una ruta existente como texto', () => {
    assert.deepEqual(descomponerRuta(rutas, 3), {
      idOrigen: '1',
      idDestino: '3',
      idTipoCarro: '11'
    })
  })

  test('devuelve selección vacía cuando no hay ruta o no existe', () => {
    const vacia = { idOrigen: '', idDestino: '', idTipoCarro: '' }
    assert.deepEqual(descomponerRuta(rutas, ''), vacia)
    assert.deepEqual(descomponerRuta(rutas, 999), vacia)
  })
})
