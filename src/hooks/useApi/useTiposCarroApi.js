/**
 * useTiposCarroApi Hook
 * Hook para operaciones con tipos de carro
 */

import { useState, useCallback } from 'react'
import tiposCarroService from '../../services/tiposCarroService'
import toast from 'react-hot-toast'

const useTiposCarroApi = () => {
  const [tiposCarro, setTiposCarro] = useState([])
  const [tipoCarro, setTipoCarro] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const listar = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await tiposCarroService.listar()
      setTiposCarro(response.tiposCarro || [])
      return response.tiposCarro
    } catch (err) {
      setError(err.response?.data?.error || 'Error al listar tipos de carro')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const obtener = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const response = await tiposCarroService.obtener(id)
      setTipoCarro(response.tipoCarro)
      return response.tipoCarro
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener tipo de carro')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const crear = useCallback(async (data) => {
    try {
      setLoading(true)
      setError(null)
      const response = await tiposCarroService.crear(data)
      toast.success('Tipo de carro creado exitosamente')
      return response.tipoCarro
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al crear tipo de carro'
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
      const response = await tiposCarroService.actualizar(id, data)
      toast.success('Tipo de carro actualizado exitosamente')
      return response.tipoCarro
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al actualizar tipo de carro'
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
      await tiposCarroService.eliminar(id)
      toast.success('Tipo de carro eliminado exitosamente')
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al eliminar tipo de carro'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    tiposCarro,
    tipoCarro,
    loading,
    error,
    listar,
    obtener,
    crear,
    actualizar,
    eliminar
  }
}

export default useTiposCarroApi
