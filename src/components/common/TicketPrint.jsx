/**
 * TicketPrint Component
 * Vista de impresion de ticket
 */

import { formatDateOnly, formatTimeOnly, formatTimestamp } from '../../utils/dateUtils'

const TicketPrint = ({ ticket, empresa }) => {
  if (!ticket) return null

  // Datos de empresa (desde tbl_configuracion_sunat)
  const nombreEmpresa = empresa?.nombreComercial || empresa?.razonSocial || 'Transportes Cruz Selvatico'
  const rucEmpresa = empresa?.rucEmisor || ''
  const direccionEmpresa = empresa?.direccionFiscal || ''

  // Usar utilidades centralizadas para formateo de fechas
  const formatDate = formatDateOnly
  const formatTime = formatTimeOnly
  const formatDateTime = formatTimestamp

  return (
    <div className="bg-white p-6 max-w-sm mx-auto" id="ticket-print">
      {/* Header */}
      <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
        <img
          src="/logo.png"
          alt={nombreEmpresa}
          className="h-12 w-auto object-contain mx-auto mb-2"
        />
        {rucEmpresa && <p className="text-xs text-gray-600 font-medium">RUC: {rucEmpresa}</p>}
        {direccionEmpresa && <p className="text-xs text-gray-500 leading-tight mb-2">{direccionEmpresa}</p>}
        <p className="text-sm text-gray-500">Boleto de Viaje</p>
      </div>

      {/* Agencia */}
      {ticket.agencia && (
        <div className="text-center mb-3 pb-3 border-b border-dashed border-gray-200">
          <p className="text-xs text-gray-500">AGENCIA</p>
          <p className="text-sm font-semibold text-gray-800">{ticket.agencia.nombre}</p>
          {ticket.agencia.ciudad && (
            <p className="text-xs text-gray-500">{ticket.agencia.ciudad}</p>
          )}
        </div>
      )}

      {/* Codigo */}
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500">CODIGO</p>
        <p className="text-2xl font-mono font-bold text-gray-900">{ticket.codigo}</p>
      </div>

      {/* Ruta */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500">ORIGEN</p>
            <p className="font-semibold text-gray-900">{ticket.viaje?.origen}</p>
          </div>
          <div className="px-4">
            <span className="text-gray-400">→</span>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500">DESTINO</p>
            <p className="font-semibold text-gray-900">{ticket.viaje?.destino}</p>
          </div>
        </div>
      </div>

      {/* Fecha y Hora */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">FECHA VIAJE</p>
          <p className="font-semibold text-gray-900">{formatDate(ticket.viaje?.fecha)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">HORA SALIDA</p>
          <p className="font-semibold text-gray-900">{formatTime(ticket.viaje?.hora)}</p>
        </div>
      </div>

      {/* Pasajero */}
      <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
        <p className="text-xs text-gray-500 mb-2">DATOS DEL PASAJERO</p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Nombre:</span>
            <span className="text-sm font-medium text-gray-900">{ticket.pasajero?.nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Documento:</span>
            <span className="text-sm font-medium text-gray-900">{ticket.pasajero?.documento}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Telefono:</span>
            <span className="text-sm font-medium text-gray-900">{ticket.pasajero?.telefono}</span>
          </div>
        </div>
      </div>

      {/* Comentarios */}
      {ticket.comentario && (
        <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
          <p className="text-xs text-gray-500 mb-1">COMENTARIOS</p>
          <p className="text-sm text-gray-700">{ticket.comentario}</p>
        </div>
      )}

      {/* Precio */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Precio Pasaje</span>
          <span className="text-2xl font-bold text-blue-600">
            S/ {parseFloat(ticket.viaje?.precio || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-500">
        <p>Emitido: {formatDateTime(ticket.fechaVenta)}</p>
        <p className="mt-2 font-semibold">{nombreEmpresa}</p>
        <p className="mt-1">Gracias por su preferencia</p>
        <p>Este boleto es personal e intransferible</p>
      </div>
    </div>
  )
}

export default TicketPrint
