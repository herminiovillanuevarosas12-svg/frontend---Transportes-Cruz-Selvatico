/**
 * useEncomiendaApi Hook
 * Hook para operaciones con encomiendas
 */

import { useState, useCallback } from 'react'
import encomiendasService from '../../services/encomiendasService'
import toast from 'react-hot-toast'

const useEncomiendaApi = () => {
  const [encomiendas, setEncomiendas] = useState([])
  const [encomienda, setEncomienda] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const listar = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await encomiendasService.listar(params)
      setEncomiendas(response.encomiendas || [])
      setPagination(response.pagination)
      return response
    } catch (err) {
      setError(err.response?.data?.error || 'Error al listar encomiendas')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const obtener = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const response = await encomiendasService.obtener(id)
      setEncomienda(response.encomienda)
      return response.encomienda
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener encomienda')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const obtenerPorTracking = useCallback(async (codigo) => {
    try {
      setLoading(true)
      setError(null)
      const response = await encomiendasService.obtenerPorTracking(codigo)
      setEncomienda(response.encomienda)
      return response.encomienda
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener encomienda')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const registrar = useCallback(async (data) => {
    try {
      setLoading(true)
      setError(null)
      const response = await encomiendasService.registrar(data)
      toast.success('Encomienda registrada exitosamente')
      setEncomienda(response.encomienda)
      return response.encomienda
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al registrar encomienda'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const cambiarEstado = useCallback(async (id, nuevoEstado, nota = null) => {
    try {
      setLoading(true)
      setError(null)
      const response = await encomiendasService.cambiarEstado(id, nuevoEstado, nota)
      toast.success('Estado actualizado exitosamente')
      setEncomienda(response.encomienda)
      return response.encomienda
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al cambiar estado'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const retirar = useCallback(async (id, data) => {
    try {
      setLoading(true)
      setError(null)
      const response = await encomiendasService.retirar(id, data)
      toast.success('Retiro registrado exitosamente')
      setEncomienda(response.encomienda)
      return response.encomienda
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al registrar retiro'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const imprimir = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const response = await encomiendasService.imprimir(id)
      return response.encomienda
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al obtener datos de impresion'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const generarQR = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const response = await encomiendasService.generarQR(id)
      return response
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al generar QR'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    encomiendas,
    encomienda,
    pagination,
    loading,
    error,
    listar,
    obtener,
    obtenerPorTracking,
    registrar,
    cambiarEstado,
    retirar,
    imprimir,
    generarQR,
    setEncomienda
  }
}

export default useEncomiendaApi
