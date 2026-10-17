/**
 * guiaEntregaPDF - Descarga la guía de entrega de encomienda en PDF (ticket 80mm)
 * Mismo contenido que GuiaEntregaPrint: datos de la encomienda, datos de la entrega
 * y, al pie, el recuadro de "Firma de recepción" con los datos de quien recibe.
 */

import { jsPDF } from 'jspdf'
import { formatTimestamp } from '../../utils/dateUtils'
import { obtenerTipoDocumento, siglaDocumento } from '../../utils/documentoIdentidad'
import { loadLogo } from './encomiendasListaPDF'

const ANCHO = 80 // mm, ticket térmico
const M = 4 // margen lateral
const CONTENIDO = ANCHO - M * 2

// Colores del ticket Cruz Selvatico (RGB)
const COLORS = {
  green: [45, 90, 39],      // #2d5a27
  red: [196, 30, 58],       // #c41e3a
  black: [26, 26, 26],
  grayDark: [85, 85, 85],
  gray: [102, 102, 102],
  divider: [212, 165, 165], // #d4a5a5
  border: [153, 153, 153]
}

// Alto de línea en mm para un tamaño de fuente en pt
const lh = (size) => size * 0.3528 * 1.35

// Las fuentes estándar de jsPDF no tienen los espacios finos que usa Intl ("p. m.")
const texto = (valor) => String(valor ?? '').replace(/[  ]/g, ' ')

/**
 * Dibuja la guía desde y = 0 y devuelve el alto total ocupado (mm).
 * Se llama dos veces: una para medir y otra sobre la página del alto exacto.
 */
function dibujarGuia(doc, logo, encomienda, entrega) {
  let y = M

  const fuente = (size, estilo = 'normal', color = COLORS.black) => {
    doc.setFont('helvetica', estilo)
    doc.setFontSize(size)
    doc.setTextColor(...color)
  }

  const centrado = (valor, size, estilo = 'normal', color = COLORS.black) => {
    fuente(size, estilo, color)
    doc.splitTextToSize(texto(valor), CONTENIDO).forEach(linea => {
      y += lh(size)
      doc.text(linea, ANCHO / 2, y, { align: 'center' })
    })
  }

  const divisor = () => {
    y += 2.5
    doc.setDrawColor(...COLORS.divider)
    doc.setLineWidth(0.25)
    doc.setLineDashPattern([1, 0.8], 0)
    doc.line(M, y, ANCHO - M, y)
    doc.setLineDashPattern([], 0)
    y += 1
  }

  const etiqueta = (valor) => {
    fuente(6.5, 'normal', COLORS.gray)
    y += lh(6.5) + 0.8
    doc.text(valor, M, y)
  }

  // Fila "Etiqueta: valor" con el valor alineado a la derecha (y partido si no entra)
  const fila = (label, valor, pad = 0) => {
    const x0 = M + pad
    const x1 = ANCHO - M - pad
    fuente(7.5, 'normal', COLORS.grayDark)
    const anchoLabel = doc.getTextWidth(label)
    y += lh(7.5)
    doc.text(label, x0, y)
    fuente(7.5, 'bold', COLORS.black)
    doc.splitTextToSize(texto(valor), x1 - x0 - anchoLabel - 3).forEach((linea, i) => {
      if (i > 0) y += lh(7.5)
      doc.text(linea, x1, y, { align: 'right' })
    })
  }

  // Dos columnas con etiqueta y valor; con `flecha` dibuja "→" entre ambas (ruta)
  const dosColumnas = (izq, der, { size = 9, color = COLORS.black, centrar = false, flecha = false } = {}) => {
    const separacion = flecha ? 8 : 4
    const anchoCol = (CONTENIDO - separacion) / 2
    const columnas = [
      { ...izq, x: centrar ? M + anchoCol / 2 : M },
      { ...der, x: centrar ? ANCHO - M - anchoCol / 2 : M + anchoCol + separacion }
    ]
    const align = centrar ? 'center' : 'left'
    const inicio = y + 1

    let fin = inicio
    columnas.forEach(col => {
      let yc = inicio + lh(6.5)
      fuente(6.5, 'normal', COLORS.gray)
      doc.text(col.label, col.x, yc, { align })
      fuente(size, 'bold', color)
      doc.splitTextToSize(texto(col.valor), anchoCol).forEach(linea => {
        yc += lh(size)
        doc.text(linea, col.x, yc, { align })
      })
      fin = Math.max(fin, yc)
    })

    if (flecha) {
      const cx = ANCHO / 2
      const cy = inicio + (fin - inicio) / 2 + 0.5
      doc.setDrawColor(...COLORS.gray)
      doc.setLineWidth(0.3)
      doc.line(cx - 2.5, cy, cx + 2.5, cy)
      doc.line(cx + 2.5, cy, cx + 1.2, cy - 1)
      doc.line(cx + 2.5, cy, cx + 1.2, cy + 1)
    }
    y = fin
  }

  // ═══════ HEADER CON LOGO ═══════
  if (logo) {
    const ratio = logo.width / logo.height
    let logoW = 24
    let logoH = logoW / ratio
    if (logoH > 14) {
      logoH = 14
      logoW = logoH * ratio
    }
    doc.addImage(logo.data, 'PNG', (ANCHO - logoW) / 2, y, logoW, logoH)
    y += logoH
  }
  centrado('RUC: 20600812727', 7, 'normal', COLORS.grayDark)
  centrado('Cal. Ingobert Witting Nro. 270', 7, 'normal', COLORS.grayDark)
  y += 1
  centrado('Guía de Entrega de Encomienda', 10.5, 'bold')

  divisor()

  // ═══════ CODIGO ═══════
  centrado('CÓDIGO', 6.5, 'normal', COLORS.gray)
  centrado(encomienda.codigo, 12, 'bold')

  // ═══════ RUTA ═══════
  dosColumnas(
    { label: 'ORIGEN', valor: encomienda.origen },
    { label: 'DESTINO', valor: encomienda.destino },
    { size: 9, color: COLORS.green, centrar: true, flecha: true }
  )

  // ═══════ TIPO Y PESO ═══════
  dosColumnas(
    { label: 'TIPO PAQUETE', valor: encomienda.paquete?.tipo },
    { label: 'PESO', valor: `${encomienda.paquete?.peso ?? ''} kg` }
  )

  if (encomienda.paquete?.descripcion) {
    etiqueta('CONTENIDO')
    fuente(7.5, 'italic', COLORS.black)
    doc.splitTextToSize(texto(encomienda.paquete.descripcion), CONTENIDO).forEach(linea => {
      y += lh(7.5)
      doc.text(linea, M, y)
    })
  }

  divisor()

  // ═══════ REMITENTE ═══════
  etiqueta('DATOS DEL REMITENTE')
  fila('Nombre:', encomienda.remitente?.nombre)
  if (encomienda.remitente?.dni) {
    fila(`${siglaDocumento(encomienda.remitente.dni)}:`, encomienda.remitente.dni)
  }

  divisor()

  // ═══════ DESTINATARIO ═══════
  etiqueta('DATOS DEL DESTINATARIO')
  fila('Nombre:', encomienda.destinatario?.nombre)
  if (encomienda.destinatario?.dni) {
    fila(`${siglaDocumento(encomienda.destinatario.dni)}:`, encomienda.destinatario.dni)
  }
  if (encomienda.destinatario?.telefono) {
    fila('Teléfono:', encomienda.destinatario.telefono)
  }

  divisor()

  // ═══════ DATOS DE LA ENTREGA ═══════
  etiqueta('DATOS DE LA ENTREGA')
  fila('Fecha:', entrega.fecha ? formatTimestamp(entrega.fecha) : '')
  fila('Agencia:', encomienda.destino)
  fila('Pago:', encomienda.pagoAlRecojo ? 'Contra entrega' : 'Pagado en origen')
  if (entrega.comprobante) fila('Comprobante:', entrega.comprobante)
  if (entrega.atendidoPor) fila('Entregado por:', entrega.atendidoPor)
  if (entrega.nota) {
    fuente(7.5, 'italic', COLORS.black)
    doc.splitTextToSize(texto(entrega.nota), CONTENIDO).forEach(linea => {
      y += lh(7.5)
      doc.text(linea, M, y)
    })
  }

  // ═══════ FIRMA DE RECEPCION ═══════
  y += 4
  const inicioFirma = y
  y += 20 // espacio para firmar
  doc.setDrawColor(...COLORS.black)
  doc.setLineWidth(0.3)
  doc.line(M + 8, y, ANCHO - M - 8, y)
  centrado('Firma de recepción', 8.5, 'bold')
  y += 0.5
  fila('Nombre:', entrega.nombre, 2)
  fila(`${obtenerTipoDocumento(entrega.tipoDoc).sigla}:`, entrega.numeroDoc, 2)
  y += 2
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.25)
  doc.roundedRect(M, inicioFirma, CONTENIDO, y - inicioFirma, 1, 1, 'S')

  // ═══════ FOOTER ═══════
  y += 1
  divisor()
  centrado('Cruz Selvatico', 9.5, 'bold', COLORS.red)
  centrado('Gracias por su preferencia', 7.5, 'normal', COLORS.gray)

  return y + M
}

/**
 * Genera y descarga la guía de entrega en PDF
 * @param {Object} encomienda - Datos de GET /encomiendas/:id/imprimir
 * @param {Object} entrega - { nombre, tipoDoc, numeroDoc, fecha, atendidoPor, nota, comprobante }
 */
export async function generarGuiaEntregaPDF(encomienda, entrega) {
  const logo = await loadLogo()

  // Primera pasada solo para medir: la página mide exactamente lo que ocupa el ticket
  const alto = dibujarGuia(new jsPDF({ unit: 'mm', format: [ANCHO, 600] }), logo, encomienda, entrega)

  const doc = new jsPDF({ unit: 'mm', format: [ANCHO, alto] })
  dibujarGuia(doc, logo, encomienda, entrega)
  doc.save(`guia-entrega-${encomienda.codigo}.pdf`)
}

export default generarGuiaEntregaPDF
