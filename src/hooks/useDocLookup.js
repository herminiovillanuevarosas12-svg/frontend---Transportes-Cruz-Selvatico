/**
 * useDocLookup Hook
 * Hook reutilizable para auto-busqueda de DNI/RUC
 * Logica MIXTA: Para DNI busca primero en BD local (tbl_pasajeros), luego en API
 *               Para RUC va directo a la API (no hay tabla local de empresas)
 */

import { useState, useRef, useCallback } from 'react'
import consultaDocService from '../services/consultaDocService'
import clientesService from '../services/clientesService'

const useDocLookup = () => {
  const [loading, setLoading] = useState(false)
  const lastQueryRef = useRef({ tipo: null, numero: null })

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

    // Evitar consultas duplicadas
    if (lastQueryRef.current.tipo === 'DNI' && lastQueryRef.current.numero === dni) {
      return null
    }

    setLoading(true)
    lastQueryRef.current = { tipo: 'DNI', numero: dni }

    try {
      // 1. Buscar en BD local (tbl_pasajeros) primero
      if (!skipLocal) {
        try {
          const localResult = await clientesService.obtenerPorDni(dni)
          if (localResult?.cliente) {
            setLoading(false)
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
        setLoading(false)
        return {
          ...apiResult.data,
          source: apiResult.source || 'api'
        }
      }

      setLoading(false)
      return null
    } catch (error) {
      console.error('Error consultando DNI:', error)
      setLoading(false)
      return null
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

    // Evitar consultas duplicadas
    if (lastQueryRef.current.tipo === 'RUC' && lastQueryRef.current.numero === ruc) {
      return null
    }

    setLoading(true)
    lastQueryRef.current = { tipo: 'RUC', numero: ruc }

    try {
      const result = await consultaDocService.consultarRuc(ruc)
      if (result?.success && result?.data) {
        setLoading(false)
        return {
          ...result.data,
          source: result.source || 'api'
        }
      }

      setLoading(false)
      return null
    } catch (error) {
      console.error('Error consultando RUC:', error)
      setLoading(false)
      return null
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
   * Reset para limpiar estado cuando el usuario borra el campo
   */
  const reset = useCallback(() => {
    lastQueryRef.current = { tipo: null, numero: null }
    setLoading(false)
  }, [])

  return {
    loading,
    consultarDni,
    consultarRuc,
    consultarDocumento,
    reset
  }
}

export default useDocLookup
