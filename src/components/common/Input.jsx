/**
 * Input Component
 * Input reutilizable con validacion y efectos premium
 */

import { forwardRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(({
  label,
  error,
  success,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
  type = 'text',
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const baseInputClasses = `
    block w-full rounded-xl border bg-white text-gray-900
    transition-all duration-200 ease-out
    placeholder:text-gray-400
    focus:outline-none
  `

  const stateClasses = error
    ? 'border-error-300 focus:border-error-500 focus:ring-4 focus:ring-error-100'
    : success
    ? 'border-success-300 focus:border-success-500 focus:ring-4 focus:ring-success-100'
    : 'border-gray-300 hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'

  const disabledClasses = disabled
    ? 'bg-gray-50 text-gray-500 cursor-not-allowed hover:border-gray-300'
    : ''

  const paddingClasses = `
    ${Icon && iconPosition === 'left' ? 'pl-11' : 'pl-4'}
    ${(Icon && iconPosition === 'right') || isPassword ? 'pr-11' : 'pr-4'}
    py-3
  `

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative group">
        {/* Left Icon */}
        {Icon && iconPosition === 'left' && (
          <div className={`
            absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none
            transition-colors duration-200
            ${isFocused ? 'text-primary-500' : error ? 'text-error-400' : 'text-gray-400'}
          `}>
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            ${baseInputClasses}
            ${stateClasses}
            ${disabledClasses}
            ${paddingClasses}
          `.replace(/\s+/g, ' ').trim()}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        ) : Icon && iconPosition === 'right' ? (
          <div className={`
            absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none
            transition-colors duration-200
            ${isFocused ? 'text-primary-500' : error ? 'text-error-400' : 'text-gray-400'}
          `}>
            <Icon className="w-5 h-5" />
          </div>
        ) : null}

        {/* Success/Error indicator on the right */}
        {(error || success) && !isPassword && !(Icon && iconPosition === 'right') && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {error ? (
              <AlertCircle className="w-5 h-5 text-error-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-success-500" />
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {error && (
        <p className="mt-2 text-sm text-error-600 flex items-center gap-1.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
      {success && !error && (
        <p className="mt-2 text-sm text-success-600 flex items-center gap-1.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {success}
        </p>
      )}
      {helperText && !error && !success && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
