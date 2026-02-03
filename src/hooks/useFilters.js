/**
 * useFilters Hook
 * Hook para manejar filtros de busqueda
 */

import { useState, useCallback, useMemo } from 'react'

const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters)

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const setMultipleFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters
    }))
  }, [])

  const clearFilter = useCallback((key) => {
    setFilters((prev) => {
      const { [key]: removed, ...rest } = prev
      return rest
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const hasFilters = useMemo(() => {
    return Object.keys(filters).some((key) => {
      const value = filters[key]
      return value !== undefined && value !== null && value !== ''
    })
  }, [filters])

  // Obtener solo filtros con valor (para enviar a API)
  const activeFilters = useMemo(() => {
    return Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value
      }
      return acc
    }, {})
  }, [filters])

  return {
    filters,
    activeFilters,
    setFilter,
    setMultipleFilters,
    clearFilter,
    clearAllFilters,
    hasFilters
  }
}

export default useFilters
