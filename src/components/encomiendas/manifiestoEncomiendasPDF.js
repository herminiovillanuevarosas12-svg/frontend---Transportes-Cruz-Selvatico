/**
 * manifiestoEncomiendasPDF - Manifiesto de encomiendas en PDF A4 horizontal
 * Cabecera con datos de la empresa y del manifiesto, resumen de pagos,
 * una fila por encomienda y firmas al pie. Mismo estilo que encomiendasListaPDF.
 */

import { jsPDF } from 'jspdf'
import { formatTimestamp } from '../../utils/dateUtils'
import { siglaDocumento } from '../../utils/documentoIdentidad'
import { loadLogo } from './encomiendasListaPDF'

// Colores corporativos (RGB)
const COLORS = {
  greenDark:    [27, 94, 32],     // #1B5E20
  greenMid:     [58, 125, 68],    // #3A7D44
  greenMain:    [74, 155, 82],    // #4A9B52
  greenPale:    [240, 249, 241],  // #F0F9F1
  redPale:      [255, 241, 240],  // #FFF1F0
  red:          [229, 57, 53],    // #E53935
  redDark:      [211, 47, 47],    // #D32F2F
  white:        [255, 255, 255],
  grayDark:     [55, 65, 81],
  grayMid:      [107, 114, 128],
  grayLight:    [229, 231, 235],
  black:        [17, 24, 39],
}

const M = 12 // margen lateral

function setColor(doc, color, type = 'text') {
  const [r, g, b] = color
  if (type === 'text') doc.setTextColor(r, g, b)
  else if (type === 'fill') doc.setFillColor(r, g, b)
  else if (type === 'draw') doc.setDrawColor(r, g, b)
}

// Las fuentes estándar de jsPDF no tienen los espacios finos que usa Intl ("p. m.")
const texto = (valor) => String(valor ?? '').replace(/[  ]/g, ' ')

// Recorta el texto al ancho disponible (mm) según la fuente activa
function ajustar(doc, valor, ancho) {
  let t = texto(valor).trim() || '-'
  if (doc.getTextWidth(t) <= ancho) return t
  while (t.length > 1 && doc.getTextWidth(`${t}..`) > ancho) t = t.slice(0, -1)
  return `${t}..`
}

const documento = (numero) => (numero ? `${siglaDocumento(numero)} ${numero}` : 'Sin documento')

const soles = (monto) => `S/ ${Number(monto || 0).toFixed(2)}`

function dibujarCabecera(doc, W, logo, manifiesto) {
  const headerH = 30
  const { empresa } = manifiesto

  setColor(doc, COLORS.greenDark, 'fill')
  doc.rect(0, 0, W, headerH, 'F')
  setColor(doc, COLORS.red, 'fill')
  doc.rect(0, headerH, W, 2, 'F')

  // Logo - preservar aspect ratio
  let textX = M
  if (logo) {
    const maxLogoH = 20
    const maxLogoW = 38
    const ratio = logo.width / logo.height
    const logoW = ratio >= 1 ? Math.min(maxLogoW, maxLogoH * ratio) : maxLogoH * ratio
    const logoH = ratio >= 1 ? logoW / ratio : maxLogoH
    const logoY = (headerH - logoH) / 2
    setColor(doc, COLORS.white, 'fill')
    doc.roundedRect(M - 2, logoY - 2, logoW + 4, logoH + 4, 3, 3, 'F')
    doc.addImage(logo.data, 'PNG', M, logoY, logoW, logoH)
    textX = M + logoW + 6
  }

  // Bloque derecho: datos del manifiesto
  const derechaX = W - M
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  setColor(doc, COLORS.white, 'text')
  doc.text('MANIFIESTO DE ENCOMIENDAS', derechaX, 11, { align: 'right' })
  doc.setFontSize(12)
  doc.text(`N° ${manifiesto.numeroCompleto}`, derechaX, 18, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(200, 230, 201)
  doc.text(
    texto(`${formatTimestamp(manifiesto.fechaEmision)}  ·  Generado por: ${manifiesto.usuarioEmision}`),
    derechaX, 25, { align: 'right' }
  )

  // Bloque izquierdo: empresa (la razón social larga baja de tamaño antes de recortarse)
  const anchoEmpresa = derechaX - 92 - textX
  const razonSocial = empresa?.razonSocial || 'Transporte'
  doc.setFont('helvetica', 'bold')
  setColor(doc, COLORS.white, 'text')
  const tamano = [13, 11, 9.5].find((size) => {
    doc.setFontSize(size)
    return doc.getTextWidth(texto(razonSocial)) <= anchoEmpresa
  }) || 9.5
  doc.setFontSize(tamano)
  doc.text(ajustar(doc, razonSocial, anchoEmpresa), textX, 13)

  const datos = [
    empresa?.ruc ? `RUC ${empresa.ruc}` : null,
    empresa?.direccion,
    empresa?.telefono ? `Tel. ${empresa.telefono}` : null
  ].filter(Boolean).join('  ·  ')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(200, 230, 201)
  if (datos) doc.text(ajustar(doc, datos, anchoEmpresa), textX, 20)

  return headerH + 2
}

function dibujarResumen(doc, y, contentW, resumen) {
  const gap = 4
  const boxH = 15
  const boxW = (contentW - gap * 4) / 5
  const cajas = [
    { label: 'ENCOMIENDAS', valor: String(resumen.cantidad) },
    { label: 'PESO TOTAL', valor: `${resumen.pesoTotal.toFixed(2)} kg` },
    { label: 'FLETE TOTAL', valor: soles(resumen.fleteTotal) },
    { label: 'PAGADO', valor: `${resumen.pagado.cantidad}  ·  ${soles(resumen.pagado.monto)}` },
    { label: 'POR COBRAR EN DESTINO', valor: `${resumen.porCobrar.cantidad}  ·  ${soles(resumen.porCobrar.monto)}`, alerta: true },
  ]

  cajas.forEach((caja, i) => {
    const x = M + i * (boxW + gap)
    setColor(doc, caja.alerta ? COLORS.redPale : COLORS.greenPale, 'fill')
    doc.roundedRect(x, y, boxW, boxH, 2, 2, 'F')
    setColor(doc, caja.alerta ? COLORS.red : COLORS.greenMid, 'draw')
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, boxW, boxH, 2, 2, 'S')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    setColor(doc, COLORS.grayMid, 'text')
    doc.text(caja.label, x + 4, y + 5.5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    setColor(doc, caja.alerta ? COLORS.redDark : COLORS.greenDark, 'text')
    doc.text(caja.valor, x + 4, y + 12)
  })

  return y + boxH
}

function dibujarFooter(doc, W, H, manifiesto) {
  const footerH = 10
  const footerY = H - footerH

  setColor(doc, COLORS.greenDark, 'fill')
  doc.rect(0, footerY, W, footerH, 'F')
  setColor(doc, COLORS.red, 'fill')
  doc.rect(0, footerY, W, 1.2, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(200, 230, 201)
  doc.text(
    texto(`${manifiesto.empresa?.razonSocial || 'Transporte'} · Manifiesto ${manifiesto.numeroCompleto} · Documento generado automaticamente`),
    W / 2,
    footerY + 6.5,
    { align: 'center' }
  )
}

function numerarPaginas(doc, W, H) {
  const totalPaginas = doc.getNumberOfPages()
  for (let p = 1; p <= totalPaginas; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(200, 230, 201)
    doc.text(`Pag. ${p} de ${totalPaginas}`, W - 12, H - 3.5, { align: 'right' })
  }
}

/**
 * Genera y descarga el PDF del manifiesto
 * @param {Object} manifiesto - Respuesta de GET /api/encomiendas/manifiestos/:id
 */
export async function generarManifiestoPDF(manifiesto) {
  const doc = new jsPDF({ orientation: 'landscape' })
  const W = doc.internal.pageSize.getWidth()   // 297
  const H = doc.internal.pageSize.getHeight()  // 210
  const contentW = W - M * 2

  const logo = await loadLogo()

  let y = dibujarCabecera(doc, W, logo, manifiesto) + 6
  y = dibujarResumen(doc, y, contentW, manifiesto.resumen) + 6

  // ═══════════════════════════════════════════════════════════════
  // TABLA DE ENCOMIENDAS
  // ═══════════════════════════════════════════════════════════════
  const anchos = [8, 34, 48, 50, 40, 38, 16, 18, 21] // suman el ancho útil (273 mm)
  const etiquetas = ['#', 'Codigo', 'Remitente', 'Destinatario (doc. / tel.)', 'Destino / Origen', 'Tipo / Descripcion', 'Peso', 'Flete', 'Pago']
  const alineaciones = ['center', 'left', 'left', 'left', 'left', 'left', 'right', 'right', 'center']
  let x = M
  const colDefs = anchos.map((w, i) => {
    const col = { label: etiquetas[i], x, w, align: alineaciones[i] }
    x += w
    return col
  })
  const posX = (col) => (col.align === 'right' ? col.x + col.w - 2
    : col.align === 'center' ? col.x + col.w / 2
    : col.x + 2)

  const rowH = 10
  const headerRowH = 9
  const maxY = H - 20 // limite antes del footer

  const dibujarHeaderTabla = () => {
    setColor(doc, COLORS.greenMid, 'fill')
    doc.roundedRect(M, y, contentW, headerRowH, 2, 2, 'F')
    doc.rect(M, y + 4, contentW, headerRowH - 4, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    setColor(doc, COLORS.white, 'text')
    colDefs.forEach((col) => doc.text(col.label, posX(col), y + 6, { align: col.align }))
    y += headerRowH
  }

  dibujarHeaderTabla()

  manifiesto.encomiendas.forEach((enc, i) => {
    if (y + rowH > maxY) {
      dibujarFooter(doc, W, H, manifiesto)
      doc.addPage()
      y = 14
      dibujarHeaderTabla()
    }

    setColor(doc, i % 2 === 0 ? COLORS.greenPale : COLORS.white, 'fill')
    doc.rect(M, y, contentW, rowH, 'F')

    // Cada celda: línea principal y, opcionalmente, una secundaria más pequeña
    const celdas = [
      { principal: String(enc.numeroItem), estilo: 'numero' },
      { principal: enc.codigoTracking },
      { principal: enc.remitenteNombre, secundaria: documento(enc.remitenteDni) },
      {
        principal: enc.destinatarioNombre,
        secundaria: [documento(enc.destinatarioDni), enc.destinatarioTelefono].filter(Boolean).join(' · ')
      },
      { principal: enc.puntoDestino, secundaria: `Origen: ${enc.puntoOrigen}` },
      { principal: enc.tipoPaquete, secundaria: enc.descripcion || 'Sin descripcion' },
      { principal: `${Number(enc.peso).toFixed(2)} kg` },
      { principal: soles(enc.flete), estilo: 'monto' },
      { principal: enc.pagoAlRecojo ? 'POR COBRAR' : 'PAGADO', estilo: enc.pagoAlRecojo ? 'porCobrar' : 'pagado' },
    ]

    celdas.forEach((celda, j) => {
      const col = colDefs[j]
      const ancho = col.w - 4

      doc.setFontSize(celda.estilo === 'porCobrar' || celda.estilo === 'pagado' ? 6.5 : 7.5)
      if (celda.estilo === 'numero') {
        doc.setFont('helvetica', 'bold')
        setColor(doc, COLORS.greenMain, 'text')
      } else if (celda.estilo === 'monto') {
        doc.setFont('helvetica', 'bold')
        setColor(doc, COLORS.black, 'text')
      } else if (celda.estilo === 'pagado') {
        doc.setFont('helvetica', 'bold')
        setColor(doc, COLORS.greenDark, 'text')
      } else if (celda.estilo === 'porCobrar') {
        doc.setFont('helvetica', 'bold')
        setColor(doc, COLORS.redDark, 'text')
      } else {
        doc.setFont('helvetica', 'normal')
        setColor(doc, COLORS.grayDark, 'text')
      }

      if (celda.secundaria) {
        doc.text(ajustar(doc, celda.principal, ancho), posX(col), y + 4.3, { align: col.align })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        setColor(doc, COLORS.grayMid, 'text')
        doc.text(ajustar(doc, celda.secundaria, ancho), posX(col), y + 8, { align: col.align })
      } else {
        doc.text(ajustar(doc, celda.principal, ancho), posX(col), y + 6.2, { align: col.align })
      }
    })

    y += rowH
  })

  // Borde inferior de la tabla
  setColor(doc, COLORS.grayLight, 'draw')
  doc.setLineWidth(0.3)
  doc.line(M, y, M + contentW, y)

  // ═══════════════════════════════════════════════════════════════
  // FIRMAS
  // ═══════════════════════════════════════════════════════════════
  const firmasH = 30
  if (y + firmasH > maxY) {
    dibujarFooter(doc, W, H, manifiesto)
    doc.addPage()
    y = 14
  }

  const lineaY = y + 24
  const anchoFirma = 80
  setColor(doc, COLORS.grayMid, 'draw')
  doc.setLineWidth(0.3)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  setColor(doc, COLORS.grayMid, 'text')
  ;[{ centro: W / 4, label: 'Despachado por' }, { centro: (W * 3) / 4, label: 'Recibido por (conductor)' }].forEach((firma) => {
    doc.line(firma.centro - anchoFirma / 2, lineaY, firma.centro + anchoFirma / 2, lineaY)
    doc.text(firma.label, firma.centro, lineaY + 4.5, { align: 'center' })
  })

  dibujarFooter(doc, W, H, manifiesto)
  numerarPaginas(doc, W, H)

  doc.save(`manifiesto-${manifiesto.numeroCompleto}.pdf`)
}

export default generarManifiestoPDF
