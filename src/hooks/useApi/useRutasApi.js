/**
 * useRutasApi Hook
 * Hook para operaciones con rutas
 */

import { useState, useCallback } from 'react'
import rutasService from '../../services/rutasService'
import toast from 'react-hot-toast'

const useRutasApi = () => {
  const [rutas, setRutas] = useState([])
  const [ruta, setRuta] = useState(null)
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const listar = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await rutasService.listar()
      setRutas(response.rutas || [])
      return response.rutas
    } catch (err) {
      setError(err.response?.data?.error || 'Error al listar rutas')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const obtener = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const response = await rutasService.obtener(id)
      setRuta(response.ruta)
      return response.ruta
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener ruta')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const crear = useCallback(async (data) => {
    try {
      setLoading(true)
      setError(null)
      const response = await rutasService.crear(data)
      toast.success('Ruta creada exitosamente')
      return response.ruta
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al crear ruta'
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
      const response = await rutasService.actualizar(id, data)
      toast.success('Ruta actualizada exitosamente')
      return response.ruta
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al actualizar ruta'
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
      await rutasService.eliminar(id)
      toast.success('Ruta eliminada exitosamente')
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al eliminar ruta'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Horarios
  const listarHorarios = useCallback(async (idRuta) => {
    try {
      setLoading(true)
      setError(null)
      const response = await rutasService.listarHorarios(idRuta)
      setHorarios(response.horarios || [])
      return response.horarios
    } catch (err) {
      setError(err.response?.data?.error || 'Error al listar horarios')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const crearHorario = useCallback(async (idRuta, data) => {
    try {
      setLoading(true)
      setError(null)
      const response = await rutasService.crearHorario(idRuta, data)
      toast.success('Horario creado exitosamente')
      return response.horario
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al crear horario'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    rutas,
    ruta,
    horarios,
    loading,
    error,
    listar,
    obtener,
    crear,
    actualizar,
    eliminar,
    listarHorarios,
    crearHorario
  }
}

export default useRutasApi
