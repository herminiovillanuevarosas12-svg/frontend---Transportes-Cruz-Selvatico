/**
 * Select Component
 * Select reutilizable con validacion
 */

import { forwardRef } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'

const Select = forwardRef(({
  label,
  error,
  helperText,
  options = [],
  placeholder = 'Seleccionar...',
  fullWidth = true,
  className = '',
  required = false,
  ...props
}, ref) => {
  const baseClasses = 'block w-full rounded-lg border transition-all outline-none focus:ring-2 appearance-none bg-white'
  const normalClasses = 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-200'

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`${baseClasses} ${error ? errorClasses : normalClasses} pl-4 pr-10 py-2.5`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
