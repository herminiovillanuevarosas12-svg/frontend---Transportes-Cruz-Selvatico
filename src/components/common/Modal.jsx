/**
 * Modal Component
 * Modal reutilizable con animaciones premium
 */

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  footer,
  closeOnOverlay = true,
  icon: HeaderIcon,
  iconColor = 'primary'
}) => {
  const modalRef = useRef(null)

  const sizes = {
    xs: 'max-w-sm',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-[calc(100vw-2rem)] mx-4'
  }

  const iconColors = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-error-100 text-error-600',
    info: 'bg-info-100 text-info-600'
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={handleOverlayClick}
      />

      {/* Modal Container */}
      <div
        className="flex min-h-full items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          className={`
            relative w-full ${sizes[size]}
            bg-white rounded-2xl shadow-2xl
            transform transition-all
            animate-scale-in
          `}
        >
          {/* Close Button - Floating */}
          {showClose && (
            <button
              onClick={onClose}
              className="
                absolute -top-3 -right-3 z-10
                w-8 h-8 rounded-full
                bg-white shadow-lg border border-gray-200
                text-gray-400 hover:text-gray-600 hover:bg-gray-50
                flex items-center justify-center
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Header */}
          {(title || HeaderIcon) && (
            <div className="px-6 pt-6 pb-4">
              {HeaderIcon && (
                <div className={`
                  w-12 h-12 rounded-xl ${iconColors[iconColor]}
                  flex items-center justify-center mb-4
                `}>
                  <HeaderIcon className="w-6 h-6" />
                </div>
              )}
              {title && (
                <h3 id="modal-title" className="text-xl font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1.5 text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Body */}
          <div className={`px-6 ${title ? 'pb-6' : 'py-6'} max-h-[60vh] overflow-y-auto`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="
              px-6 py-4
              border-t border-gray-100
              bg-gray-50 rounded-b-2xl
              flex items-center justify-end gap-3
            ">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal
