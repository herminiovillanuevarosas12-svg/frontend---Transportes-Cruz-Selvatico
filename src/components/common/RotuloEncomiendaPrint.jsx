/**
 * RotuloEncomiendaPrint
 * Etiqueta adhesiva 76x76mm para ticketera Luxur.
 * Solo datos operativos de entrega: codigo, QR, ruta y destinatario.
 */

import QRGenerator from './QRGenerator'

const RotuloEncomiendaPrint = ({ encomienda }) => {
  if (!encomienda) return null

  const destinatarioNombre = encomienda.destinatario?.nombre || '-'
  const destinatarioDni = encomienda.destinatario?.dni || ''
  const destinatarioTel = encomienda.destinatario?.telefono || '-'

  return (
    <div className="rotulo-ad" id="rotulo-encomienda">
      <div className="rotulo-ad-header">
        <span className="rotulo-ad-empresa">CRUZ SELVATICO</span>
      </div>

      <div className="rotulo-ad-codigo-box">
        <span className="rotulo-ad-codigo-label">CODIGO</span>
        <span className="rotulo-ad-codigo">{encomienda.codigo}</span>
      </div>

      <div className="rotulo-ad-qr-wrap">
        {encomienda.qr ? (
          <img src={encomienda.qr} alt="QR" className="rotulo-ad-qr" />
        ) : (
          <QRGenerator value={encomienda.codigo} size={150} />
        )}
      </div>

      <div className="rotulo-ad-ruta">
        <div className="rotulo-ad-ruta-col">
          <span className="rotulo-ad-ruta-label">DE</span>
          <span className="rotulo-ad-ruta-valor">{encomienda.origen}</span>
        </div>
        <span className="rotulo-ad-ruta-arrow">&rarr;</span>
        <div className="rotulo-ad-ruta-col">
          <span className="rotulo-ad-ruta-label">PARA</span>
          <span className="rotulo-ad-ruta-valor">{encomienda.destino}</span>
        </div>
      </div>

      <div className="rotulo-ad-divider" />

      <div className="rotulo-ad-dest">
        <div className="rotulo-ad-dest-label">DESTINATARIO</div>
        <div className="rotulo-ad-dest-nombre">{destinatarioNombre}</div>
        <div className="rotulo-ad-dest-info">
          <div className="rotulo-ad-dest-row">
            <span className="rotulo-ad-k">Tel:</span>{destinatarioTel}
          </div>
          {destinatarioDni && (
            <div className="rotulo-ad-dest-row">
              <span className="rotulo-ad-k">DNI:</span>{destinatarioDni}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RotuloEncomiendaPrint
