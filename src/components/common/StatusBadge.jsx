/**
 * StatusBadge Component
 * Badge para mostrar estados - Cruz Selvatico Colors
 */

const statusConfig = {
  // Estados de Ticket - Verde para positivos, Rojo para negativos
  EMITIDO: { label: 'Emitido', color: 'bg-primary-100 text-primary-700' },
  ANULADO: { label: 'Anulado', color: 'bg-secondary-100 text-secondary-700' },

  // Estados de Viaje
  ABIERTO: { label: 'Abierto', color: 'bg-primary-100 text-primary-700' },
  CERRADO: { label: 'Cerrado', color: 'bg-gray-100 text-gray-700' },
  CANCELADO: { label: 'Cancelado', color: 'bg-secondary-100 text-secondary-700' },

  // Estados de Encomienda
  REGISTRADO: { label: 'Registrado', color: 'bg-primary-100 text-primary-700' },
  EN_ALMACEN: { label: 'En Almacen', color: 'bg-warning-100 text-warning-700' },
  EN_RUTA: { label: 'En Ruta', color: 'bg-info-100 text-info-700' },
  LLEGO_A_DESTINO: { label: 'Llego a Destino', color: 'bg-primary-200 text-primary-800' },
  RETIRADO: { label: 'Entregado', color: 'bg-primary-100 text-primary-700' },

  // Estados genericos
  ACTIVO: { label: 'Activo', color: 'bg-primary-100 text-primary-700' },
  INACTIVO: { label: 'Inactivo', color: 'bg-gray-100 text-gray-700' },

  // Tipos de punto
  AGENCIA: { label: 'Agencia', color: 'bg-primary-100 text-primary-700' },
  TERMINAL: { label: 'Terminal', color: 'bg-primary-200 text-primary-800' },

  // Metodos de pago
  EFECTIVO: { label: 'Efectivo', color: 'bg-primary-100 text-primary-700' },
  YAPE: { label: 'Yape', color: 'bg-purple-100 text-purple-700' },
  TARJETA: { label: 'Tarjeta', color: 'bg-info-100 text-info-700' },

  // Estados de comprobantes electronicos
  PENDIENTE: { label: 'Pendiente', color: 'bg-warning-100 text-warning-700' },
  ENVIADO: { label: 'Enviado', color: 'bg-info-100 text-info-700' },
  ACEPTADO: { label: 'Aceptado', color: 'bg-primary-100 text-primary-700' },
  RECHAZADO: { label: 'Rechazado', color: 'bg-secondary-100 text-secondary-700' },

  // Estados de guias de remision
  ENVIADA: { label: 'Enviada', color: 'bg-info-100 text-info-700' },
  ACEPTADA: { label: 'Aceptada', color: 'bg-primary-100 text-primary-700' },
  RECHAZADA: { label: 'Rechazada', color: 'bg-secondary-100 text-secondary-700' },
  ANULADA: { label: 'Anulada', color: 'bg-gray-100 text-gray-700' }
}

const StatusBadge = ({ status, customLabel, className = '' }) => {
  const config = statusConfig[status] || {
    label: status,
    color: 'bg-gray-100 text-gray-700'
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}
    >
      {customLabel || config.label}
    </span>
  )
}

export default StatusBadge
