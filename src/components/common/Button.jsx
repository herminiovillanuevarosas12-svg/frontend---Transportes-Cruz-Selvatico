/**
 * Button Component
 * Boton reutilizable con variantes y efectos premium
 */

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: `
    bg-gradient-to-b from-primary-500 to-primary-600 text-white
    hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5
    focus:ring-4 focus:ring-primary-100
    active:from-primary-700 active:to-primary-800
  `,
  secondary: `
    bg-white text-gray-700 border border-gray-300 shadow-sm
    hover:bg-gray-50 hover:border-gray-400 hover:shadow-md
    focus:ring-4 focus:ring-gray-100
    active:bg-gray-100
  `,
  success: `
    bg-gradient-to-b from-success-500 to-success-600 text-white
    hover:from-success-600 hover:to-success-700 hover:shadow-lg hover:shadow-success-500/25 hover:-translate-y-0.5
    focus:ring-4 focus:ring-success-100
    active:from-success-700 active:to-success-800
  `,
  danger: `
    bg-gradient-to-b from-error-500 to-error-600 text-white
    hover:from-error-600 hover:to-error-700 hover:shadow-lg hover:shadow-error-500/25 hover:-translate-y-0.5
    focus:ring-4 focus:ring-error-100
    active:from-error-700 active:to-error-800
  `,
  warning: `
    bg-gradient-to-b from-warning-400 to-warning-500 text-white
    hover:from-warning-500 hover:to-warning-600 hover:shadow-lg hover:shadow-warning-500/25 hover:-translate-y-0.5
    focus:ring-4 focus:ring-warning-100
    active:from-warning-600 active:to-warning-700
  `,
  outline: `
    bg-transparent text-primary-600 border-2 border-primary-200
    hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700
    focus:ring-4 focus:ring-primary-100
    active:bg-primary-100
  `,
  ghost: `
    bg-transparent text-gray-600
    hover:bg-gray-100 hover:text-gray-900
    focus:ring-4 focus:ring-gray-100
    active:bg-gray-200
  `,
  link: `
    bg-transparent text-primary-600 underline-offset-4
    hover:text-primary-700 hover:underline
    focus:ring-0
    active:text-primary-800
  `
}

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs gap-1 rounded-lg',
  sm: 'px-3.5 py-2 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-5 py-3 text-base gap-2 rounded-xl',
  xl: 'px-6 py-3.5 text-lg gap-2.5 rounded-2xl'
}

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center font-semibold
    transition-all duration-200 ease-out
    focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
    active:scale-[0.98]
  `

  const variantClasses = variants[variant] || variants.primary
  const sizeClasses = sizes[size] || sizes.md
  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`.replace(/\s+/g, ' ').trim()}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={`${size === 'xs' ? 'w-3.5 h-3.5' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0`} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={`${size === 'xs' ? 'w-3.5 h-3.5' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0`} />
          )}
        </>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
