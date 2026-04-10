/**
 * ComprobantePrint Component
 * Vista de impresion de comprobante de pago (Boleta, Factura o Nota de Venta interna)
 */

import { formatDateOnly, formatTimeOnly, formatDateTimeCivil } from '../../utils/dateUtils'

const TITULOS = {
  BOLETA: 'BOLETA DE VENTA',
  FACTURA: 'FACTURA',
  VERIFICACION: 'NOTA DE VENTA'
}

const SUBTITULOS = {
  BOLETA: 'Comprobante de Pago',
  FACTURA: 'Comprobante de Pago',
  VERIFICACION: 'Documento Interno'
}

const ComprobantePrint = ({ comprobante, empresa, encomiendaDetalle }) => {
  if (!comprobante) return null

  const tipo = comprobante.tipoDocumento || 'VERIFICACION'

  // Datos de empresa (desde tbl_configuracion_sunat)
  const nombreEmpresa = empresa?.nombreComercial || empresa?.razonSocial || 'Transportes Cruz Selvatico'
  const razonSocialEmpresa = empresa?.razonSocial || 'EMPRESA DE TURISMO & SERVICIOS MULTIPLES CRUZ SELVATICO S.A.C.'
  const rucEmpresa = empresa?.rucEmisor || ''
  const direccionEmpresa = empresa?.direccionFiscal || ''

  // Usar utilidades centralizadas para formateo de fechas
  const formatDate = formatDateOnly
  const formatTime = formatTimeOnly

  return (
    <div className="bg-white p-6 max-w-sm mx-auto" id="comprobante-print">
      {/* Header */}
      <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
        <img
          src="/logo.png"
          alt={nombreEmpresa}
          className="h-12 w-auto object-contain mx-auto mb-2"
        />
        <p className="text-xs font-bold text-gray-800">{nombreEmpresa}</p>
        {(tipo === 'BOLETA' || tipo === 'FACTURA') && (
          <p className="text-xs text-gray-600 leading-tight">Razon Social: {razonSocialEmpresa}</p>
        )}
        {rucEmpresa && <p className="text-xs text-gray-600 font-medium">RUC: {rucEmpresa}</p>}
        {direccionEmpresa && <p className="text-xs text-gray-500 leading-tight mb-2">{direccionEmpresa}</p>}
        <p className="text-sm font-bold text-gray-900">{TITULOS[tipo] || 'COMPROBANTE'}</p>
        <p className="text-xs text-gray-500">{SUBTITULOS[tipo] || 'Comprobante de Pago'}</p>
      </div>

      {/* Agencia */}
      {comprobante.agencia && (
        <div className="text-center mb-3 pb-3 border-b border-dashed border-gray-200">
          <p className="text-xs text-gray-500">AGENCIA</p>
          <p className="text-sm font-semibold text-gray-800">{comprobante.agencia.nombre}</p>
          {comprobante.agencia.ciudad && (
            <p className="text-xs text-gray-500">{comprobante.agencia.ciudad}</p>
          )}
          {comprobante.agencia.direccion && (
            <p className="text-xs text-gray-500">{comprobante.agencia.direccion}</p>
          )}
        </div>
      )}

      {/* Numero de Comprobante */}
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500">N° COMPROBANTE</p>
        <p className="text-xl font-mono font-bold text-gray-900">{comprobante.numeroCompleto}</p>
      </div>

      {/* Datos del Cliente */}
      <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
        <p className="text-xs text-gray-500 mb-2">DATOS DEL CLIENTE</p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">
              {tipo === 'FACTURA' ? 'Razon Social:' : 'Nombre:'}
            </span>
            <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
              {comprobante.clienteNombre}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">
              {tipo === 'FACTURA' ? 'RUC:' : 'DNI:'}
            </span>
            <span className="text-sm font-medium text-gray-900">{comprobante.clienteDocumento}</span>
          </div>
          {tipo === 'FACTURA' && comprobante.clienteDireccion && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Direccion:</span>
              <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
                {comprobante.clienteDireccion}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Detalle del Servicio */}
      <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
        <p className="text-xs text-gray-500 mb-2">DETALLE</p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Servicio:</span>
            <span className="text-sm font-medium text-gray-900">
              {comprobante.hora ? 'Pasaje Interprovincial' : 'Envio de Encomienda'}
            </span>
          </div>
          {comprobante.ruta && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Ruta:</span>
              <span className="text-sm font-medium text-gray-900">
                {comprobante.ruta.origen} - {comprobante.ruta.destino}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Fecha:</span>
            <span className="text-sm font-medium text-gray-900">{formatDate(comprobante.fecha)}</span>
          </div>
          {comprobante.hora && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Hora:</span>
              <span className="text-sm font-medium text-gray-900">{formatTime(comprobante.hora)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Detalle del Envio de Encomienda */}
      {encomiendaDetalle && (
        <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
          <p className="text-xs text-gray-500 mb-2">DETALLE DEL ENVIO</p>
          <div className="space-y-1">
            {encomiendaDetalle.tipoPaquete && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tipo Paquete:</span>
                <span className="text-sm font-medium text-gray-900">{encomiendaDetalle.tipoPaquete}</span>
              </div>
            )}
            {encomiendaDetalle.descripcion && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Contenido:</span>
                <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{encomiendaDetalle.descripcion}</span>
              </div>
            )}
            {encomiendaDetalle.peso && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Peso:</span>
                <span className="text-sm font-medium text-gray-900">{parseFloat(encomiendaDetalle.peso).toFixed(2)} kg</span>
              </div>
            )}
            {(encomiendaDetalle.alto || encomiendaDetalle.ancho || encomiendaDetalle.largo) && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Dimensiones:</span>
                <span className="text-sm font-medium text-gray-900">
                  {parseFloat(encomiendaDetalle.alto).toFixed(0)} x {parseFloat(encomiendaDetalle.ancho).toFixed(0)} x {parseFloat(encomiendaDetalle.largo).toFixed(0)} cm
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comentarios */}
      {comprobante.comentario && (
        <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
          <p className="text-xs text-gray-500 mb-1">COMENTARIOS</p>
          <p className="text-sm text-gray-700">{comprobante.comentario}</p>
        </div>
      )}

      {/* Totales con desglose */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
        {parseFloat(comprobante.igv || 0) > 0 ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">
                S/ {parseFloat(comprobante.subtotal || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IGV</span>
              <span className="font-medium text-gray-900">
                S/ {parseFloat(comprobante.igv || 0).toFixed(2)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Op. Exonerada</span>
            <span className="font-medium text-gray-900">
              S/ {parseFloat(comprobante.subtotal || comprobante.total || 0).toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center border-t border-gray-200 pt-2">
          <span className="text-gray-600 font-medium">TOTAL</span>
          <span className="text-2xl font-bold text-gray-900">
            S/ {parseFloat(comprobante.total || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-500">
        <p>Emitido: {formatDateTimeCivil(comprobante.fechaEmision, comprobante.horaEmision)}</p>
        <p className="mt-2 font-semibold">{nombreEmpresa}</p>
        {tipo === 'VERIFICACION' ? (
          <p className="mt-1 italic">Documento interno - No tiene validez tributaria</p>
        ) : (
          <>
            <p className="mt-1">Comprobante de pago electronico</p>
            {parseFloat(comprobante.igv || 0) === 0 && (
              <p className="mt-1 text-xs font-medium">Operacion exonerada del IGV</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ComprobantePrint
