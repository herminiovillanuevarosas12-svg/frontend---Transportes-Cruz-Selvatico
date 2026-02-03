/**
 * useTicketsApi Hook
 * Hook para operaciones con tickets
 */

import { useState, useCallback } from 'react'
import ticketsService from '../../services/ticketsService'
import viajesService from '../../services/viajesService'
import toast from 'react-hot-toast'

const useTicketsApi = () => {
  const [tickets, setTickets] = useState([])
  const [ticket, setTicket] = useState(null)
  const [disponibilidad, setDisponibilidad] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const listar = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await ticketsService.listar(params)
      setTickets(response.tickets || [])
      setPagination(response.pagination)
      return response
    } catch (err) {
      setError(err.response?.data?.error || 'Error al listar tickets')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const obtener = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const response = await ticketsService.obtener(id)
      setTicket(response.ticket)
      return response.ticket
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener ticket')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const obtenerPorCodigo = useCallback(async (codigo) => {
    try {
      setLoading(true)
      setError(null)
      const response = await ticketsService.obtenerPorCodigo(codigo)
      setTicket(response.ticket)
      return response.ticket
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener ticket')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const vender = useCallback(async (data) => {
    try {
      setLoading(true)
      setError(null)
      const response = await ticketsService.vender(data)
      toast.success('Pasaje vendido exitosamente')
      setTicket(response.ticket)
      return response.ticket
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al vender pasaje'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const anular = useCallback(async (id, motivo) => {
    try {
      setLoading(true)
      setError(null)
      const response = await ticketsService.anular(id, motivo)
      toast.success('Ticket anulado exitosamente')
      return response.ticket
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al anular ticket'
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
      const response = await ticketsService.imprimir(id)
      return response.ticket
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al obtener datos de impresion'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const obtenerDisponibilidad = useCallback(async (idRuta, fecha) => {
    try {
      setLoading(true)
      setError(null)
      const response = await viajesService.disponibilidad(idRuta, fecha)
      setDisponibilidad(response)
      return response
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener disponibilidad')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    tickets,
    ticket,
    disponibilidad,
    pagination,
    loading,
    error,
    listar,
    obtener,
    obtenerPorCodigo,
    vender,
    anular,
    imprimir,
    obtenerDisponibilidad
  }
}

export default useTicketsApi
