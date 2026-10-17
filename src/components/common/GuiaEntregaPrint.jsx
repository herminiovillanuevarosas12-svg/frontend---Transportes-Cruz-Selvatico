/**
 * GuiaEntregaPrint Component
 * Guía de entrega de encomienda - ticket térmico 80mm (estilo Cruz Selvatico).
 * Constancia de la entrega con los datos de la encomienda y, al pie,
 * el espacio de "Firma de recepción" con los datos de quien recibe.
 *
 * Props:
 *   - encomienda: datos de GET /encomiendas/:id/imprimir
 *   - entrega: { nombre, tipoDoc, numeroDoc, fecha, atendidoPor, nota, comprobante }
 */

import { formatTimestamp } from '../../utils/dateUtils'
import { obtenerTipoDocumento, siglaDocumento } from '../../utils/documentoIdentidad'

const GuiaEntregaPrint = ({ encomienda, entrega }) => {
  if (!encomienda || !entrega) return null

  const siglaReceptor = obtenerTipoDocumento(entrega.tipoDoc).sigla

  return (
    <div className="guia-ticket-cs">
      {/* ═══════ HEADER CON LOGO ═══════ */}
      <div className="guia-cs-header">
        <img src="/logo.png" alt="Cruz Selvatico" className="guia-cs-logo" />
        <div className="guia-cs-empresa-info">
          <span>RUC: 20600812727</span>
          <span>Cal. Ingobert Witting Nro. 270</span>
        </div>
        <div className="guia-cs-doc-title">Guía de Entrega de Encomienda</div>
      </div>

      <div className="guia-cs-divider"></div>

      {/* ═══════ CODIGO ═══════ */}
      <div className="guia-cs-section guia-cs-centered">
        <span className="guia-cs-label">CÓDIGO</span>
        <span className="guia-cs-tracking">{encomienda.codigo}</span>
      </div>

      {/* ═══════ RUTA ═══════ */}
      <div className="guia-cs-ruta">
        <div className="guia-cs-ruta-col">
          <span className="guia-cs-label">ORIGEN</span>
          <span className="guia-cs-value-primary">{encomienda.origen}</span>
        </div>
        <div className="guia-cs-ruta-arrow">→</div>
        <div className="guia-cs-ruta-col">
          <span className="guia-cs-label">DESTINO</span>
          <span className="guia-cs-value-primary">{encomienda.destino}</span>
        </div>
      </div>

      {/* ═══════ TIPO Y PESO ═══════ */}
      <div className="guia-cs-row-2col">
        <div className="guia-cs-col">
          <span className="guia-cs-label">TIPO PAQUETE</span>
          <span className="guia-cs-value-bold">{encomienda.paquete?.tipo}</span>
        </div>
        <div className="guia-cs-col">
          <span className="guia-cs-label">PESO</span>
          <span className="guia-cs-value-bold">{encomienda.paquete?.peso} kg</span>
        </div>
      </div>

      {encomienda.paquete?.descripcion && (
        <div className="guia-cs-section">
          <span className="guia-cs-label">CONTENIDO</span>
          <span className="guia-cs-contenido">{encomienda.paquete.descripcion}</span>
        </div>
      )}

      <div className="guia-cs-divider"></div>

      {/* ═══════ REMITENTE ═══════ */}
      <div className="guia-cs-section">
        <span className="guia-cs-label">DATOS DEL REMITENTE</span>
        <div className="guia-cs-datos">
          <div className="guia-cs-dato-row">
            <span className="guia-cs-dato-label">Nombre:</span>
            <span className="guia-cs-dato-value">{encomienda.remitente?.nombre}</span>
          </div>
          {encomienda.remitente?.dni && (
            <div className="guia-cs-dato-row">
              <span className="guia-cs-dato-label">{siglaDocumento(encomienda.remitente.dni)}:</span>
              <span className="guia-cs-dato-value">{encomienda.remitente.dni}</span>
            </div>
          )}
        </div>
      </div>

      <div className="guia-cs-divider"></div>

      {/* ═══════ DESTINATARIO ═══════ */}
      <div className="guia-cs-section">
        <span className="guia-cs-label">DATOS DEL DESTINATARIO</span>
        <div className="guia-cs-datos">
          <div className="guia-cs-dato-row">
            <span className="guia-cs-dato-label">Nombre:</span>
            <span className="guia-cs-dato-value">{encomienda.destinatario?.nombre}</span>
          </div>
          {encomienda.destinatario?.dni && (
            <div className="guia-cs-dato-row">
              <span className="guia-cs-dato-label">{siglaDocumento(encomienda.destinatario.dni)}:</span>
              <span className="guia-cs-dato-value">{encomienda.destinatario.dni}</span>
            </div>
          )}
          {encomienda.destinatario?.telefono && (
            <div className="guia-cs-dato-row">
              <span className="guia-cs-dato-label">Teléfono:</span>
              <span className="guia-cs-dato-value">{encomienda.destinatario.telefono}</span>
            </div>
          )}
        </div>
      </div>

      <div className="guia-cs-divider"></div>

      {/* ═══════ DATOS DE LA ENTREGA ═══════ */}
      <div className="guia-cs-section">
        <span className="guia-cs-label">DATOS DE LA ENTREGA</span>
        <div className="guia-cs-datos">
          <div className="guia-cs-dato-row">
            <span className="guia-cs-dato-label">Fecha:</span>
            <span className="guia-cs-dato-value">{entrega.fecha ? formatTimestamp(entrega.fecha) : ''}</span>
          </div>
          <div className="guia-cs-dato-row">
            <span className="guia-cs-dato-label">Agencia:</span>
            <span className="guia-cs-dato-value">{encomienda.destino}</span>
          </div>
          <div className="guia-cs-dato-row">
            <span className="guia-cs-dato-label">Pago:</span>
            <span className="guia-cs-dato-value">{encomienda.pagoAlRecojo ? 'Contra entrega' : 'Pagado en origen'}</span>
          </div>
          {entrega.comprobante && (
            <div className="guia-cs-dato-row">
              <span className="guia-cs-dato-label">Comprobante:</span>
              <span className="guia-cs-dato-value">{entrega.comprobante}</span>
            </div>
          )}
          {entrega.atendidoPor && (
            <div className="guia-cs-dato-row">
              <span className="guia-cs-dato-label">Entregado por:</span>
              <span className="guia-cs-dato-value">{entrega.atendidoPor}</span>
            </div>
          )}
        </div>
        {entrega.nota && (
          <span className="guia-cs-contenido">{entrega.nota}</span>
        )}
      </div>

      {/* ═══════ FIRMA DE RECEPCION ═══════ */}
      <div className="guia-cs-firma">
        <div className="guia-cs-firma-espacio"></div>
        <div className="guia-cs-firma-linea"></div>
        <span className="guia-cs-firma-titulo">Firma de recepción</span>
        <div className="guia-cs-datos">
          <div className="guia-cs-dato-row">
            <span className="guia-cs-dato-label">Nombre:</span>
            <span className="guia-cs-dato-value">{entrega.nombre}</span>
          </div>
          <div className="guia-cs-dato-row">
            <span className="guia-cs-dato-label">{siglaReceptor}:</span>
            <span className="guia-cs-dato-value">{entrega.numeroDoc}</span>
          </div>
        </div>
      </div>

      {/* ═══════ FOOTER ═══════ */}
      <div className="guia-cs-footer">
        <span className="guia-cs-empresa-nombre">Cruz Selvatico</span>
        <span className="guia-cs-gracias">Gracias por su preferencia</span>
      </div>
    </div>
  )
}

export default GuiaEntregaPrint
