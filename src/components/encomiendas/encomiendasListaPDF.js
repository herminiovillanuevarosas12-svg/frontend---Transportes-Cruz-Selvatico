/**
 * encomiendasListaPDF - Exporta el listado de encomiendas a PDF A4 horizontal
 * Respeta los filtros activos del listado (se muestran en el documento)
 * Diseño branded con colores corporativos Cruz Selvatico (mismo estilo que itinerarioPDF)
 */

import { jsPDF } from 'jspdf'
import { formatDateOnly } from '../../utils/dateUtils'

// Colores corporativos (RGB)
const COLORS = {
  greenDark:    [27, 94, 32],     // #1B5E20
  greenMid:     [58, 125, 68],    // #3A7D44
  greenMain:    [74, 155, 82],    // #4A9B52
  greenPale:    [240, 249, 241],  // #F0F9F1
  red:          [229, 57, 53],    // #E53935
  redDark:      [211, 47, 47],    // #D32F2F
  white:        [255, 255, 255],
  grayDark:     [55, 65, 81],
  grayMid:      [107, 114, 128],
  grayLight:    [229, 231, 235],
  black:        [17, 24, 39],
}

const ESTADO_LABELS = {
  REGISTRADO: 'Registrado',
  EN_ALMACEN: 'En Almacen',
  EN_RUTA: 'En Ruta',
  LLEGO_A_DESTINO: 'Llego a Destino',
  RETIRADO: 'Retirado',
}

function setColor(doc, color, type = 'text') {
  const [r, g, b] = color
  if (type === 'text') doc.setTextColor(r, g, b)
  else if (type === 'fill') doc.setFillColor(r, g, b)
  else if (type === 'draw') doc.setDrawColor(r, g, b)
}

function loadLogo() {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve({
        data: canvas.toDataURL('image/png'),
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    img.onerror = () => resolve(null)
    img.src = '/logo.png'
  })
}

function truncar(texto, max) {
  if (!texto) return '-'
  return texto.length > max ? texto.substring(0, max - 1) + '..' : texto
}

/**
 * Construye la descripción legible de los filtros activos
 * @param {Object} filtros - { fechaDesde, fechaHasta, estado, codigoTracking, dni }
 * @returns {string[]} Lista de filtros activos en texto
 */
function describirFiltros(filtros = {}) {
  const partes = []
  if (filtros.codigoTracking) partes.push(`Codigo: ${filtros.codigoTracking}`)
  if (filtros.dni) partes.push(`DNI: ${filtros.dni}`)
  if (filtros.fechaDesde) partes.push(`Desde: ${formatDateOnly(filtros.fechaDesde)}`)
  if (filtros.fechaHasta) partes.push(`Hasta: ${formatDateOnly(filtros.fechaHasta)}`)
  if (filtros.estado) partes.push(`Estado: ${ESTADO_LABELS[filtros.estado] || filtros.estado}`)
  return partes
}

/**
 * Genera y descarga el PDF del listado de encomiendas
 * @param {Array} encomiendas - Registros a exportar (ya filtrados)
 * @param {Object} filtros - Filtros activos del listado
 * @param {string} nombreEmpresa - Razon social para header/footer
 */
export async function generarListaEncomiendasPDF(encomiendas, filtros = {}, nombreEmpresa = 'Cruz Selvatico') {
  const doc = new jsPDF({ orientation: 'landscape' })
  const W = doc.internal.pageSize.getWidth()   // 297
  const H = doc.internal.pageSize.getHeight()  // 210
  const M = 12 // margen lateral
  const contentW = W - M * 2

  const logo = await loadLogo()
  const filtrosActivos = describirFiltros(filtros)
  const totalFlete = encomiendas.reduce((sum, e) => sum + parseFloat(e.precioCalculado || 0), 0)

  // ═══════════════════════════════════════════════════════════════
  // HEADER - Banda verde oscura
  // ═══════════════════════════════════════════════════════════════
  const headerH = 30
  setColor(doc, COLORS.greenDark, 'fill')
  doc.rect(0, 0, W, headerH, 'F')

  // Franja roja decorativa bajo el header
  setColor(doc, COLORS.red, 'fill')
  doc.rect(0, headerH, W, 2, 'F')

  // Logo - preservar aspect ratio
  let textX = M
  if (logo) {
    const maxLogoH = 20
    const maxLogoW = 38
    const ratio = logo.width / logo.height
    let logoW, logoH
    if (ratio >= 1) {
      logoW = Math.min(maxLogoW, maxLogoH * ratio)
      logoH = logoW / ratio
    } else {
      logoH = maxLogoH
      logoW = logoH * ratio
    }
    const logoX = M
    const logoY = (headerH - logoH) / 2
    setColor(doc, COLORS.white, 'fill')
    doc.roundedRect(logoX - 2, logoY - 2, logoW + 4, logoH + 4, 3, 3, 'F')
    doc.addImage(logo.data, 'PNG', logoX, logoY, logoW, logoH)
    textX = logoX + logoW + 6
  }

  // Nombre empresa
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  setColor(doc, COLORS.white, 'text')
  doc.text(nombreEmpresa || 'Transporte', textX, 13)

  // Subtitulo
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 230, 201)
  doc.text('Listado de Encomiendas', textX, 20)

  // Fecha de generacion
  doc.setFontSize(7.5)
  doc.setTextColor(165, 214, 167)
  const fechaGen = new Date().toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  doc.text(`Generado el ${fechaGen}`, textX, 26)

  let y = headerH + 2 + 8

  // ═══════════════════════════════════════════════════════════════
  // INFO BOX - Total de registros + filtros aplicados
  // ═══════════════════════════════════════════════════════════════
  const infoBoxH = filtrosActivos.length > 0 ? 16 : 12
  setColor(doc, COLORS.greenPale, 'fill')
  doc.roundedRect(M, y, contentW, infoBoxH, 2, 2, 'F')
  setColor(doc, COLORS.greenMid, 'draw')
  doc.setLineWidth(0.3)
  doc.roundedRect(M, y, contentW, infoBoxH, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  setColor(doc, COLORS.greenDark, 'text')
  doc.text(`${encomiendas.length} ENCOMIENDA${encomiendas.length !== 1 ? 'S' : ''}`, M + 5, y + 6)

  if (filtrosActivos.length > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    setColor(doc, COLORS.grayMid, 'text')
    doc.text(`Filtros aplicados: ${filtrosActivos.join('  ·  ')}`, M + 5, y + 12)
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    setColor(doc, COLORS.grayMid, 'text')
    doc.text('Sin filtros (todos los registros)', M + 5, y + 10.5)
  }

  // Total flete en el info box
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  setColor(doc, COLORS.red, 'text')
  doc.text(`S/ ${totalFlete.toFixed(2)}`, W - M - 5, y + infoBoxH / 2 + 3.5, { align: 'right' })
  doc.setFontSize(7)
  setColor(doc, COLORS.grayMid, 'text')
  doc.setFont('helvetica', 'normal')
  doc.text('TOTAL FLETE', W - M - 5, y + infoBoxH / 2 - 2, { align: 'right' })

  y += infoBoxH + 6

  // ═══════════════════════════════════════════════════════════════
  // TABLA DE ENCOMIENDAS
  // ═══════════════════════════════════════════════════════════════
  const colDefs = [
    { label: '#',            x: M,        w: 9,  align: 'center' },
    { label: 'Codigo',       x: M + 9,    w: 32, align: 'left' },
    { label: 'Remitente',    x: M + 41,   w: 46, align: 'left' },
    { label: 'Destinatario', x: M + 87,   w: 46, align: 'left' },
    { label: 'Ruta',         x: M + 133,  w: 50, align: 'left' },
    { label: 'Descripcion',  x: M + 183,  w: 40, align: 'left' },
    { label: 'Flete',        x: M + 223,  w: 18, align: 'right' },
    { label: 'Estado',       x: M + 241,  w: 22, align: 'center' },
    { label: 'Fecha',        x: M + 263,  w: 10, align: 'center' },
  ]
  // Ajustar ultima columna al ancho disponible
  colDefs[colDefs.length - 1].w = contentW - (colDefs[colDefs.length - 1].x - M)

  const rowH = 8
  const headerRowH = 9
  const maxY = H - 20 // limite antes del footer

  const dibujarHeaderTabla = () => {
    setColor(doc, COLORS.greenMid, 'fill')
    doc.roundedRect(M, y, contentW, headerRowH, 2, 2, 'F')
    doc.rect(M, y + 4, contentW, headerRowH - 4, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    setColor(doc, COLORS.white, 'text')
    colDefs.forEach(col => {
      const tx = col.align === 'right' ? col.x + col.w
        : col.align === 'center' ? col.x + col.w / 2
        : col.x + 2
      doc.text(col.label, tx, y + 6, { align: col.align })
    })
    y += headerRowH
  }

  dibujarHeaderTabla()

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)

  encomiendas.forEach((enc, i) => {
    if (y + rowH > maxY) {
      dibujarFooter(doc, W, H, nombreEmpresa)
      doc.addPage()
      y = 14
      dibujarHeaderTabla()
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
    }

    // Fondo alternado
    const bgColor = i % 2 === 0 ? COLORS.greenPale : COLORS.white
    setColor(doc, bgColor, 'fill')
    doc.rect(M, y, contentW, rowH, 'F')

    const ruta = `${enc.puntoOrigen?.nombre || '?'} - ${enc.puntoDestino?.nombre || '?'}`
    const vals = [
      String(i + 1),
      truncar(enc.codigoTracking, 18),
      truncar(enc.remitenteNombre, 28),
      truncar(enc.destinatarioNombre, 28),
      truncar(ruta, 30),
      truncar(enc.descripcion, 24),
      `S/ ${parseFloat(enc.precioCalculado || 0).toFixed(2)}`,
      ESTADO_LABELS[enc.estadoActual] || enc.estadoActual || '-',
      enc.dateTimeRegistration ? formatDateOnly(enc.dateTimeRegistration) : '-',
    ]

    colDefs.forEach((col, j) => {
      const tx = col.align === 'right' ? col.x + col.w
        : col.align === 'center' ? col.x + col.w / 2
        : col.x + 2

      if (j === 0) {
        doc.setFont('helvetica', 'bold')
        setColor(doc, COLORS.greenMain, 'text')
      } else if (col.label === 'Flete') {
        doc.setFont('helvetica', 'bold')
        setColor(doc, COLORS.black, 'text')
      } else {
        doc.setFont('helvetica', 'normal')
        setColor(doc, COLORS.grayDark, 'text')
      }

      doc.text(vals[j], tx, y + 5.3, { align: col.align })
    })

    y += rowH
  })

  // Borde inferior de la tabla
  setColor(doc, COLORS.grayLight, 'draw')
  doc.setLineWidth(0.3)
  doc.line(M, y, M + contentW, y)

  y += 6

  // ═══════════════════════════════════════════════════════════════
  // TOTAL - Caja roja
  // ═══════════════════════════════════════════════════════════════
  if (y + 14 > maxY) {
    dibujarFooter(doc, W, H, nombreEmpresa)
    doc.addPage()
    y = 14
  }

  setColor(doc, COLORS.redDark, 'fill')
  doc.roundedRect(M + 0.5, y + 0.5, contentW - 1, 12.5, 3, 3, 'F')
  setColor(doc, COLORS.red, 'fill')
  doc.roundedRect(M, y, contentW, 12.5, 3, 3, 'F')

  doc.setFont('helvetica', 'bold')
  setColor(doc, COLORS.white, 'text')
  doc.setFontSize(9)
  doc.text(`TOTAL FLETE (${encomiendas.length} registros)`, M + 8, y + 8)

  doc.setFontSize(13)
  doc.text(`S/ ${totalFlete.toFixed(2)}`, W - M - 8, y + 8.5, { align: 'right' })

  // ═══════════════════════════════════════════════════════════════
  // FOOTER (en todas las paginas, con numeracion)
  // ═══════════════════════════════════════════════════════════════
  dibujarFooter(doc, W, H, nombreEmpresa)
  numerarPaginas(doc, W, H)

  const fechaArchivo = new Date().toISOString().split('T')[0]
  doc.save(`encomiendas-${fechaArchivo}.pdf`)
}

function dibujarFooter(doc, W, H, nombreEmpresa) {
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
    `${nombreEmpresa || 'Transporte'} · Documento generado automaticamente · ${new Date().toLocaleDateString('es-PE')}`,
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

export default generarListaEncomiendasPDF
