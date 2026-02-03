/**
 * usePagination Hook
 * Hook para manejar paginacion
 */

import { useState, useCallback } from 'react'

const usePagination = (initialPage = 1, initialLimit = 20) => {
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0
  })

  const setPage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }))
  }, [])

  const setLimit = useCallback((limit) => {
    setPagination((prev) => ({ ...prev, page: 1, limit }))
  }, [])

  const updateFromResponse = useCallback((response) => {
    if (response?.pagination) {
      setPagination(response.pagination)
    }
  }, [])

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      setPage(pagination.page + 1)
    }
  }, [pagination.page, pagination.totalPages, setPage])

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      setPage(pagination.page - 1)
    }
  }, [pagination.page, setPage])

  const reset = useCallback(() => {
    setPagination({
      page: initialPage,
      limit: initialLimit,
      total: 0,
      totalPages: 0
    })
  }, [initialPage, initialLimit])

  return {
    pagination,
    setPage,
    setLimit,
    updateFromResponse,
    nextPage,
    prevPage,
    reset,
    hasNextPage: pagination.page < pagination.totalPages,
    hasPrevPage: pagination.page > 1
  }
}

export default usePagination
