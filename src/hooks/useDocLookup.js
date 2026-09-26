/**
 * useDocLookup Hook
 * Hook reutilizable para auto-busqueda de DNI/RUC
 * Logica MIXTA: Para DNI busca primero en BD local (tbl_pasajeros), luego en API
 *               Para RUC va directo a la API (no hay tabla local de empresas)
 *
 * No bloquea consultas repetidas: el backend cachea las respuestas de API Peru
 * (tbl_cache_consulta_doc), asi que volver a escribir el mismo documento vuelve a
 * autocompletar el nombre sin gastar cuota.
 *
 * consultarDocumentoDiferido(): espera a que el usuario deje de escribir antes de
 * consultar. Evita consultar como DNI los 8 primeros digitos de un RUC sin depender
 * de prefijos (existen DNIs reales que empiezan en 10 y 20).
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import consultaDocService from '../services/consultaDocService'
import clientesService from '../services/clientesService'

export const DELAY_CONSULTA_DIFERIDA_MS = 600

const useDocLookup = () => {
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)
  const resolverPendienteRef = useRef(null)

  /**
   * Cancela una consulta diferida en espera (resuelve su promesa con undefined)
   */
  const cancelarDiferida = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (resolverPendienteRef.current) {
      resolverPendienteRef.current(undefined)
      resolverPendienteRef.current = null
    }
  }, [])

  // Al desmontar, no dejar consultas programadas
  useEffect(() => cancelarDiferida, [cancelarDiferida])

  /**
   * Consultar DNI con logica mixta (BD local primero, API despues)
   * @param {string} dni - DNI de 8 digitos
   * @param {boolean} skipLocal - Si es true, salta la busqueda local y va directo a API
   * @returns {Object|null} { nombre_completo, nombres, apellido_paterno, apellido_materno, source } o null si error
   */
  const consultarDni = useCallback(async (dni, skipLocal = false) => {
    // Validar formato
    if (!dni || !/^\d{8}$/.test(dni)) {
      return null
    }

    setLoading(true)

    try {
      // 1. Buscar en BD local (tbl_pasajeros) primero
      if (!skipLocal) {
        try {
          const localResult = await clientesService.obtenerPorDni(dni)
          if (localResult?.cliente) {
            return {
              nombre_completo: localResult.cliente.nombreCompleto,
              telefono: localResult.cliente.telefono,
              source: 'local'
            }
          }
        } catch {
          // No encontrado en local, continuar con API
        }
      }

      // 2. Buscar en API Peru
      const apiResult = await consultaDocService.consultarDni(dni)
      if (apiResult?.success && apiResult?.data) {
        return {
          ...apiResult.data,
          source: apiResult.source || 'api'
        }
      }

      return null
    } catch (error) {
      console.error('Error consultando DNI:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Consultar RUC (directo a API, no hay BD local de empresas)
   * @param {string} ruc - RUC de 11 digitos
   * @returns {Object|null} { ruc, razon_social, nombre_comercial, estado, condicion, domicilio, ubigeo, source } o null si error
   */
  const consultarRuc = useCallback(async (ruc) => {
    // Validar formato
    if (!ruc || !/^\d{11}$/.test(ruc)) {
      return null
    }

    setLoading(true)

    try {
      const result = await consultaDocService.consultarRuc(ruc)
      if (result?.success && result?.data) {
        return {
          ...result.data,
          source: result.source || 'api'
        }
      }

      return null
    } catch (error) {
      console.error('Error consultando RUC:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Consultar documento generico (detecta automaticamente si es DNI o RUC)
   * @param {string} numero - Numero de documento (8 o 11 digitos)
   * @param {boolean} skipLocal - Si es true, salta la busqueda local para DNI
   * @returns {Object|null} { nombre_completo, razon_social, tipoDoc, source } o null si error
   */
  const consultarDocumento = useCallback(async (numero, skipLocal = false) => {
    if (!numero) return null

    const soloNumeros = numero.replace(/\D/g, '')

    if (soloNumeros.length === 8) {
      // Es DNI
      const result = await consultarDni(soloNumeros, skipLocal)
      return result ? { ...result, tipoDoc: '1' } : null
    } else if (soloNumeros.length === 11) {
      // Es RUC
      const result = await consultarRuc(soloNumeros)
      return result ? {
        nombre_completo: result.razon_social || result.nombre_o_razon_social,
        razon_social: result.razon_social || result.nombre_o_razon_social,
        direccion: result.direccion || result.direccion_completa || result.domicilio_fiscal,
        tipoDoc: '6',
        source: result.source
      } : null
    }

    return null
  }, [consultarDni, consultarRuc])

  /**
   * Consultar documento cuando el usuario deja de escribir.
   * Cada llamada cancela la anterior: si el usuario sigue tecleando de 8 a 11 digitos,
   * la consulta como DNI nunca se dispara.
   * @param {string} numero - Numero de documento (8 o 11 digitos)
   * @param {Object} opciones - { skipLocal, delayMs }
   * @returns {Promise<Object|null|undefined>} resultado, null si no se encontro, undefined si fue cancelada
   */
  const consultarDocumentoDiferido = useCallback((numero, { skipLocal = false, delayMs = DELAY_CONSULTA_DIFERIDA_MS } = {}) => {
    cancelarDiferida()
    return new Promise((resolve) => {
      resolverPendienteRef.current = resolve
      timerRef.current = setTimeout(async () => {
        timerRef.current = null
        resolverPendienteRef.current = null
        resolve(await consultarDocumento(numero, skipLocal))
      }, delayMs)
    })
  }, [cancelarDiferida, consultarDocumento])

  /**
   * Reset: cancela consultas diferidas pendientes y limpia el estado de carga
   */
  const reset = useCallback(() => {
    cancelarDiferida()
    setLoading(false)
  }, [cancelarDiferida])

  return {
    loading,
    consultarDni,
    consultarRuc,
    consultarDocumento,
    consultarDocumentoDiferido,
    reset
  }
}

export default useDocLookup
