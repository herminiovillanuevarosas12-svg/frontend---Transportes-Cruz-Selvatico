/**
 * Pruebas de utils/consultaDoc
 * Ejecutar: npm test (node --test)
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { mensajeFalloServicioConsulta, MENSAJE_SIN_CONEXION } from './consultaDoc.js'

const errorHttp = (status, data) => ({ response: { status, data } })

describe('mensajeFalloServicioConsulta', () => {
  test('cuota agotada devuelve el mensaje del backend', () => {
    const mensaje = 'Se agotó el límite de consultas de DNI/RUC del plan de API Perú. Ingrese los datos manualmente.'
    assert.equal(
      mensajeFalloServicioConsulta(errorHttp(429, { success: false, codigo: 'CUOTA_AGOTADA', error: mensaje })),
      mensaje
    )
  })

  test('token inválido o API caída (503) devuelven el mensaje del backend', () => {
    assert.equal(
      mensajeFalloServicioConsulta(errorHttp(503, { codigo: 'TOKEN_INVALIDO', error: 'Token inválido' })),
      'Token inválido'
    )
    assert.equal(
      mensajeFalloServicioConsulta(errorHttp(503, { codigo: 'SERVICIO_NO_DISPONIBLE', error: 'API caída' })),
      'API caída'
    )
  })

  test('documento no encontrado no es un fallo del servicio', () => {
    assert.equal(mensajeFalloServicioConsulta(errorHttp(404, { codigo: 'NO_ENCONTRADO', error: 'x' })), null)
  })

  test('404 de un backend sin `codigo` se sigue tratando como no encontrado', () => {
    assert.equal(mensajeFalloServicioConsulta(errorHttp(404, { success: false, error: 'x' })), null)
  })

  test('400 por formato inválido no es un fallo del servicio', () => {
    assert.equal(mensajeFalloServicioConsulta(errorHttp(400, { error: 'DNI inválido' })), null)
  })

  test('error 500 del backend es un fallo del servicio con mensaje genérico si no trae texto', () => {
    const mensaje = mensajeFalloServicioConsulta(errorHttp(500, {}))
    assert.match(mensaje, /no está disponible/)
    assert.match(mensaje, /escriba los datos a mano/i)
    assert.match(mensaje, /avise al administrador/i)
  })

  test('sin respuesta del backend (red caída) avisa que no hay conexión y qué hacer', () => {
    assert.equal(mensajeFalloServicioConsulta(new Error('Network Error')), MENSAJE_SIN_CONEXION)
    assert.match(MENSAJE_SIN_CONEXION, /revise su conexión a internet/i)
    assert.match(MENSAJE_SIN_CONEXION, /escriba los datos a mano/i)
  })
})
