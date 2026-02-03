/**
 * EncomiendaPrint Component
 * Vista de impresion de encomienda con QR
 */

import { formatTimestamp } from '../../utils/dateUtils'

const EncomiendaPrint = ({ encomienda, empresa }) => {
  if (!encomienda) return null

  // Datos de empresa (desde tbl_configuracion_sunat)
  const nombreEmpresa = empresa?.nombreComercial || empresa?.razonSocial || 'Transportes Cruz Selvatico'
  const rucEmpresa = empresa?.rucEmisor || ''
  const direccionEmpresa = empresa?.direccionFiscal || ''

  // Usar utilidad centralizada para formateo de fechas
  const formatDateTime = formatTimestamp

  return (
    <div className="bg-white p-6 max-w-sm mx-auto" id="encomienda-print">
      {/* Header */}
      <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
        <img
          src="/logo.png"
          alt={nombreEmpresa}
          className="h-12 w-auto object-contain mx-auto mb-2"
        />
        {rucEmpresa && <p className="text-xs text-gray-600 font-medium">RUC: {rucEmpresa}</p>}
        {direccionEmpresa && <p className="text-xs text-gray-500 leading-tight mb-2">{direccionEmpresa}</p>}
        <p className="text-sm text-gray-500">Comprobante de Encomienda</p>
      </div>

      {/* Agencia */}
      {encomienda.agencia && (
        <div className="text-center mb-3 pb-3 border-b border-dashed border-gray-200">
          <p className="text-xs text-gray-500">AGENCIA</p>
          <p className="text-sm font-semibold text-gray-800">{encomienda.agencia.nombre}</p>
          {encomienda.agencia.ciudad && (
            <p className="text-xs text-gray-500">{encomienda.agencia.ciudad}</p>
          )}
        </div>
      )}

      {/* QR Code */}
      {encomienda.qr && (
        <div className="flex justify-center mb-4">
          <img
            src={encomienda.qr}
            alt="QR Code"
            className="w-32 h-32"
          />
        </div>
      )}

      {/* Codigo Tracking */}
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500">CODIGO DE TRACKING</p>
        <p className="text-xl font-mono font-bold text-gray-900">{encomienda.codigo}</p>
      </div>

      {/* Ruta */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500">ORIGEN</p>
            <p className="font-semibold text-gray-900 text-sm">{encomienda.origen}</p>
          </div>
          <div className="px-2">
            <span className="text-gray-400">→</span>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500">DESTINO</p>
            <p className="font-semibold text-gray-900 text-sm">{encomienda.destino}</p>
          </div>
        </div>
      </div>

      {/* Remitente */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">REMITENTE</p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Nombre:</span>
            <span className="text-sm font-medium text-gray-900">{encomienda.remitente?.nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">DNI:</span>
            <span className="text-sm font-medium text-gray-900">{encomienda.remitente?.dni}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Telefono:</span>
            <span className="text-sm font-medium text-gray-900">{encomienda.remitente?.telefono}</span>
          </div>
        </div>
      </div>

      {/* Destinatario */}
      <div className="mb-4 border-t border-dashed border-gray-300 pt-4">
        <p className="text-xs text-gray-500 mb-2">DESTINATARIO</p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Nombre:</span>
            <span className="text-sm font-medium text-gray-900">{encomienda.destinatario?.nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Telefono:</span>
            <span className="text-sm font-medium text-gray-900">{encomienda.destinatario?.telefono}</span>
          </div>
        </div>
      </div>

      {/* Paquete */}
      <div className="mb-4 border-t border-dashed border-gray-300 pt-4">
        <p className="text-xs text-gray-500 mb-2">DATOS DEL PAQUETE</p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Tipo:</span>
            <span className="text-sm font-medium text-gray-900">{encomienda.paquete?.tipo}</span>
          </div>
          {encomienda.paquete?.descripcion && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Descripcion:</span>
              <span className="text-sm font-medium text-gray-900">{encomienda.paquete?.descripcion}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Peso:</span>
            <span className="text-sm font-medium text-gray-900">{encomienda.paquete?.peso} kg</span>
          </div>
        </div>
      </div>

      {/* Precio y Estado de Pago */}
      <div className="bg-green-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total</span>
          <span className="text-2xl font-bold text-green-600">
            S/ {parseFloat(encomienda.precio || 0).toFixed(2)}
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-green-200">
          <p className={`text-sm font-medium text-center ${encomienda.pagoAlRecojo ? 'text-amber-600' : 'text-green-700'}`}>
            {encomienda.pagoAlRecojo ? '⏳ PAGO AL RECOJO' : '✓ PAGADO'}
          </p>
        </div>
      </div>

      {/* Politicas de Envio */}
      {encomienda.politicasEncomienda && (
        <div className="mb-4 border-t border-dashed border-gray-300 pt-4">
          <p className="text-xs font-bold text-gray-700 mb-2 text-center">POLITICAS DE ENVIO DE ENCOMIENDAS</p>
          <div className="text-[9px] text-gray-600 leading-tight space-y-1">
            {encomienda.politicasEncomienda.split('\n').map((linea, index) => (
              <p key={index} className="text-justify">
                {linea.trim() && `• ${linea.trim()}`}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-500">
        <p>Registrado: {formatDateTime(encomienda.fechaRegistro)}</p>
        <p className="mt-2">Consulte el estado de su encomienda en:</p>
        <p className="font-medium text-gray-700">www.cruzselvatico.com/tracking</p>
        <p className="mt-2 font-semibold">{nombreEmpresa}</p>
        <p>Conserve este comprobante</p>
      </div>
    </div>
  )
}

export default EncomiendaPrint
