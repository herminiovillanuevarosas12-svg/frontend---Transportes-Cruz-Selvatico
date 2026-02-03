/**
 * useConfigTiposPaqueteApi Hook
 * Hook para operaciones con configuraciones de tipos de paquete
 */

import { useState, useCallback } from 'react'
import configTiposPaqueteService from '../../services/configTiposPaqueteService'
import toast from 'react-hot-toast'

const useConfigTiposPaqueteApi = () => {
  const [configuraciones, setConfiguraciones] = useState([])
  const [configuracion, setConfiguracion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const listar = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await configTiposPaqueteService.listar()
      setConfiguraciones(response.configuraciones || [])
      return response.configuraciones
    } catch (err) {
      setError(err.response?.data?.error || 'Error al listar configuraciones')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const listarActivos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await configTiposPaqueteService.listarActivos()
      setConfiguraciones(response.configuraciones || [])
      return response.configuraciones
    } catch (err) {
      setError(err.response?.data?.error || 'Error al listar configuraciones')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const obtener = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const response = await configTiposPaqueteService.obtener(id)
      setConfiguracion(response.configuracion)
      return response.configuracion
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener configuración')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const crear = useCallback(async (data) => {
    try {
      setLoading(true)
      setError(null)
      const response = await configTiposPaqueteService.crear(data)
      toast.success('Configuración creada exitosamente')
      return response.configuracion
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al crear configuración'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const actualizar = useCallback(async (id, data) => {
    try {
      setLoading(true)
      setError(null)
      const response = await configTiposPaqueteService.actualizar(id, data)
      toast.success('Configuración actualizada exitosamente')
      return response.configuracion
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al actualizar configuración'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminar = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      await configTiposPaqueteService.eliminar(id)
      toast.success('Configuración eliminada exitosamente')
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al eliminar configuración'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    configuraciones,
    configuracion,
    loading,
    error,
    listar,
    listarActivos,
    obtener,
    crear,
    actualizar,
    eliminar
  }
}

export default useConfigTiposPaqueteApi
