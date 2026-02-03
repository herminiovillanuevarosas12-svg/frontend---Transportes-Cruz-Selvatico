/**
 * ClienteCombobox Component
 * Combobox con busqueda asincrona para seleccionar clientes por DNI o nombre
 * Muestra puntos disponibles del cliente
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, User, Star, Loader2, UserPlus } from 'lucide-react'
import clientesService from '../../services/clientesService'

const ClienteCombobox = ({
  label,
  value, // El cliente seleccionado (objeto completo)
  onChange, // Callback cuando se selecciona un cliente
  onClear, // Callback cuando se limpia la seleccion
  placeholder = 'Buscar por DNI o nombre...',
  required = false,
  disabled = false,
  error,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState(null)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar clientes con debounce
  const buscarClientes = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setClientes([])
      return
    }

    setLoading(true)
    try {
      const response = await clientesService.buscar(term, 8)
      setClientes(response.clientes || [])
    } catch (error) {
      console.error('Error buscando clientes:', error)
      setClientes([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Manejar cambio en el input con debounce
  const handleSearchChange = (e) => {
    const term = e.target.value
    setSearchTerm(term)

    // Limpiar timer anterior
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Nuevo timer para debounce
    const timer = setTimeout(() => {
      buscarClientes(term)
    }, 300)
    setDebounceTimer(timer)
  }

  // Seleccionar cliente
  const handleSelect = (cliente) => {
    onChange(cliente)
    setIsOpen(false)
    setSearchTerm('')
    setClientes([])
  }

  // Limpiar seleccion
  const handleClear = (e) => {
    e.stopPropagation()
    if (onClear) {
      onClear()
    }
    setSearchTerm('')
    setClientes([])
  }

  // Abrir dropdown y enfocar input
  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Trigger / Display */}
      <div
        onClick={handleOpen}
        className={`
          w-full px-4 py-2.5 border rounded-lg flex items-center gap-3 min-h-[44px]
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-gray-400'}
          ${error ? 'border-red-300 focus-within:ring-red-200' : 'border-gray-300'}
          ${isOpen ? 'ring-2 ring-primary-200 border-primary-500' : ''}
          transition-all
        `}
      >
        {value ? (
          // Cliente seleccionado
          <div className="flex-1 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {value.nombreCompleto}
              </p>
              <p className="text-xs text-gray-500">
                DNI: {value.documentoIdentidad}
                {(value.puntosDisponibles > 0) && (
                  <span className="ml-2 text-yellow-600 font-medium">
                    • {value.puntosDisponibles} pts disponibles
                  </span>
                )}
              </p>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          // Placeholder
          <div className="flex-1 flex items-center gap-2 text-gray-400">
            <Search className="w-4 h-4" />
            <span className="text-sm">{placeholder}</span>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Escribe DNI o nombre..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                autoComplete="off"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 animate-spin" />
              )}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {searchTerm.length < 2 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Escribe al menos 2 caracteres</p>
                <p className="text-xs text-gray-400 mt-1">Busca por DNI o nombre</p>
              </div>
            ) : loading ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                <Loader2 className="w-6 h-6 mx-auto mb-2 text-primary-500 animate-spin" />
                <p>Buscando clientes...</p>
              </div>
            ) : clientes.length > 0 ? (
              clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  onClick={() => handleSelect(cliente)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {cliente.nombreCompleto}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>DNI: {cliente.documentoIdentidad}</span>
                        {cliente.telefono && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span>Tel: {cliente.telefono}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {(cliente.puntosDisponibles > 0 || cliente.puntos > 0) && (
                        <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3" />
                          <span className="font-medium">{cliente.puntosDisponibles || cliente.puntos} pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <UserPlus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">No se encontraron clientes</p>
                <p className="text-xs text-gray-400 mt-1">
                  Se creara automaticamente al registrar
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default ClienteCombobox
