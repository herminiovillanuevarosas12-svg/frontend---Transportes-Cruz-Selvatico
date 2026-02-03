/**
 * usePuntosApi Hook
 * Hook para operaciones con puntos
 */

import { useState, useCallback } from 'react'
import puntosService from '../../services/puntosService'
import toast from 'react-hot-toast'

const usePuntosApi = () => {
  const [puntos, setPuntos] = useState([])
  const [punto, setPunto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const listar = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await puntosService.listar()
      setPuntos(response.puntos || [])
      return response.puntos
    } catch (err) {
      setError(err.response?.data?.error || 'Error al listar puntos')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const obtener = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const response = await puntosService.obtener(id)
      setPunto(response.punto)
      return response.punto
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener punto')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const crear = useCallback(async (data) => {
    try {
      setLoading(true)
      setError(null)
      const response = await puntosService.crear(data)
      toast.success('Punto creado exitosamente')
      return response.punto
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al crear punto'
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
      const response = await puntosService.actualizar(id, data)
      toast.success('Punto actualizado exitosamente')
      return response.punto
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al actualizar punto'
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
      await puntosService.eliminar(id)
      toast.success('Punto eliminado exitosamente')
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al eliminar punto'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    puntos,
    punto,
    loading,
    error,
    listar,
    obtener,
    crear,
    actualizar,
    eliminar
  }
}

export default usePuntosApi
