/**
 * Card Component
 * Tarjeta reutilizable con variantes premium
 */

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  padding = true,
  hover = false,
  gradient = false,
  bordered = true,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  onClick
}) => {
  const baseClasses = `
    bg-white rounded-2xl
    transition-all duration-300 ease-out
    ${bordered ? 'border border-gray-200' : ''}
    ${hover ? 'hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 cursor-pointer' : 'shadow-sm'}
    ${gradient ? 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white border-0' : ''}
  `

  return (
    <div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
    >
      {/* Header */}
      {(title || subtitle || headerAction) && (
        <div className={`
          px-6 py-4 border-b
          ${gradient ? 'border-white/10' : 'border-gray-100'}
          flex items-start justify-between gap-4
          ${headerClassName}
        `}>
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className={`
                text-lg font-semibold truncate
                ${gradient ? 'text-white' : 'text-gray-900'}
              `}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`
                text-sm mt-0.5 truncate
                ${gradient ? 'text-white/70' : 'text-gray-500'}
              `}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className={`
        ${padding ? 'p-6' : ''}
        ${bodyClassName}
      `}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={`
          px-6 py-4 border-t rounded-b-2xl
          ${gradient ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}
          ${footerClassName}
        `}>
          {footer}
        </div>
      )}
    </div>
  )
}

// Stat Card variant for dashboard
export const StatCard = ({
  title,
  value,
  change,
  changeType = 'neutral', // 'increase' | 'decrease' | 'neutral'
  icon: Icon,
  iconColor = 'primary',
  subtitle,
  loading = false,
  className = ''
}) => {
  const iconColors = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-error-100 text-error-600',
    info: 'bg-info-100 text-info-600'
  }

  const changeColors = {
    increase: 'text-success-600 bg-success-50',
    decrease: 'text-error-600 bg-error-50',
    neutral: 'text-gray-600 bg-gray-100'
  }

  return (
    <div className={`
      bg-white rounded-2xl border border-gray-200 p-6
      shadow-sm hover:shadow-md transition-all duration-300
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">
                {value}
              </p>
            )}
            {change && (
              <span className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${changeColors[changeType]}
              `}>
                {changeType === 'increase' && '↑'}
                {changeType === 'decrease' && '↓'}
                {change}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
            ${iconColors[iconColor]}
          `}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  )
}

export default Card
