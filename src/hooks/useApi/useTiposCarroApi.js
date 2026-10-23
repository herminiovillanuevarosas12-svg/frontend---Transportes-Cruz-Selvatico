/**
 * useTiposCarroApi Hook
 * Hook para listar tipos de carro (selector de las rutas)
 */

import { useState, useCallback } from 'react'
import tiposCarroService from '../../services/tiposCarroService'

const useTiposCarroApi = () => {
  const [tiposCarro, setTiposCarro] = useState([])
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

  return {
    tiposCarro,
    loading,
    error,
    listar
  }
}

export default useTiposCarroApi
