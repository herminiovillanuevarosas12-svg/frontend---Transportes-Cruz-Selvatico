/**
 * itinerarioPDF - Genera PDF A4 branded con jsPDF
 * Diseño profesional con colores corporativos Cruz Selvatico
 *
 * Paleta:
 *   Primary (Verde Selva): #1B5E20 dark, #3A7D44 mid, #4A9B52 main, #E8F5E9 light
 *   Secondary (Rojo):      #E53935 main, #D32F2F dark
 */

import { jsPDF } from 'jspdf'
import {
  formatearHora,
  formatearPrecio,
  calcularSubtotal,
  calcularTotal,
} from '../../features/planificador/helpers'

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

export async function generarPDF(tramos, nombreEmpresa) {
  const doc = new jsPDF()
  const completados = tramos.filter(t => t.completado && t.horarioSeleccionado)
  const total = calcularTotal(tramos)
  const W = doc.internal.pageSize.getWidth()   // 210
  const H = doc.internal.pageSize.getHeight()  // 297
  const M = 16 // margen lateral
  const contentW = W - M * 2

  // Cargar logo
  const logo = await loadLogo()

  // ═══════════════════════════════════════════════════════════════
  // HEADER - Banda verde oscura
  // ═══════════════════════════════════════════════════════════════
  const headerH = 42
  setColor(doc, COLORS.greenDark, 'fill')
  doc.rect(0, 0, W, headerH, 'F')

  // Franja roja decorativa bajo el header
  setColor(doc, COLORS.red, 'fill')
  doc.rect(0, headerH, W, 2.5, 'F')

  // Logo - preservar aspect ratio
  let textX = M
  if (logo) {
    const maxLogoH = 28
    const maxLogoW = 50
    const ratio = logo.width / logo.height
    let logoW, logoH

    if (ratio >= 1) {
      // Logo más ancho que alto
      logoW = Math.min(maxLogoW, maxLogoH * ratio)
      logoH = logoW / ratio
    } else {
      // Logo más alto que ancho
      logoH = maxLogoH
      logoW = logoH * ratio
    }

    const logoX = M
    const logoY = (headerH - logoH) / 2

    // Fondo blanco redondeado detrás del logo
    setColor(doc, COLORS.white, 'fill')
    doc.roundedRect(logoX - 2, logoY - 2, logoW + 4, logoH + 4, 3, 3, 'F')
    doc.addImage(logo.data, 'PNG', logoX, logoY, logoW, logoH)

    textX = logoX + logoW + 6
  }

  // Nombre empresa
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  setColor(doc, COLORS.white, 'text')
  doc.text(nombreEmpresa || 'Transporte', textX, 20)

  // Subtitulo
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 230, 201)
  doc.text('Cotizacion de Itinerario de Viaje', textX, 28)

  // Fecha
  doc.setFontSize(8)
  doc.setTextColor(165, 214, 167)
  const fechaGen = new Date().toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  doc.text(`Generado el ${fechaGen}`, textX, 35)

  let y = headerH + 2.5 + 12

  // ═══════════════════════════════════════════════════════════════
  // INFO BOX - Resumen rápido
  // ═══════════════════════════════════════════════════════════════
  setColor(doc, COLORS.greenPale, 'fill')
  doc.roundedRect(M, y, contentW, 14, 2, 2, 'F')

  setColor(doc, COLORS.greenMid, 'draw')
  doc.setLineWidth(0.3)
  doc.roundedRect(M, y, contentW, 14, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  setColor(doc, COLORS.greenDark, 'text')
  doc.text(`${completados.length} TRAMO${completados.length !== 1 ? 'S' : ''}`, M + 5, y + 6)

  doc.setFont('helvetica', 'normal')
  setColor(doc, COLORS.grayMid, 'text')
  doc.setFontSize(8)

  // Rango de fechas
  if (completados.length > 0) {
    const primeraFecha = completados[0].fecha
    const ultimaFecha = completados[completados.length - 1].fecha
    const rangoTexto = primeraFecha === ultimaFecha
      ? formatearFechaCorta(primeraFecha)
      : `${formatearFechaCorta(primeraFecha)} al ${formatearFechaCorta(ultimaFecha)}`
    doc.text(`Fechas: ${rangoTexto}`, M + 5, y + 11)
  }

  // Total en el info box
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  setColor(doc, COLORS.red, 'text')
  doc.text(formatearPrecio(total), W - M - 5, y + 9, { align: 'right' })
  doc.setFontSize(7)
  setColor(doc, COLORS.grayMid, 'text')
  doc.setFont('helvetica', 'normal')
  doc.text('TOTAL ESTIMADO', W - M - 5, y + 4, { align: 'right' })

  y += 22

  // ═══════════════════════════════════════════════════════════════
  // TABLA DE TRAMOS (sin columna Servicio)
  // ═══════════════════════════════════════════════════════════════
  const colDefs = [
    { label: '#',          x: M,          w: 12,  align: 'center' },
    { label: 'Origen',     x: M + 12,     w: 42,  align: 'left' },
    { label: 'Destino',    x: M + 54,     w: 42,  align: 'left' },
    { label: 'Fecha',      x: M + 96,     w: 30,  align: 'center' },
    { label: 'Hora',       x: M + 126,    w: 18,  align: 'center' },
    { label: 'Pax',        x: M + 144,    w: 14,  align: 'center' },
    { label: 'Subtotal',   x: M + 158,    w: 20,  align: 'right' },
  ]

  const tableX = M
  const rowH = 9
  const headerRowH = 10

  // Header de tabla - fondo verde
  setColor(doc, COLORS.greenMid, 'fill')
  doc.roundedRect(tableX, y, contentW, headerRowH, 2, 2, 'F')
  setColor(doc, COLORS.greenMid, 'fill')
  doc.rect(tableX, y + 4, contentW, headerRowH - 4, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  setColor(doc, COLORS.white, 'text')

  colDefs.forEach(col => {
    const tx = col.align === 'right' ? col.x + col.w
      : col.align === 'center' ? col.x + col.w / 2
      : col.x + 2
    doc.text(col.label, tx, y + 6.5, { align: col.align })
  })

  y += headerRowH

  // Filas de datos
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  completados.forEach((tramo, i) => {
    if (y > 265) {
      dibujarFooter(doc, W, H, nombreEmpresa)
      doc.addPage()
      y = 20
    }

    // Fondo alternado
    const bgColor = i % 2 === 0 ? COLORS.greenPale : COLORS.white
    setColor(doc, bgColor, 'fill')

    const isLast = i === completados.length - 1
    if (isLast) {
      doc.rect(tableX, y, contentW, rowH - 3, 'F')
      doc.roundedRect(tableX, y + 3, contentW, rowH - 3, 2, 2, 'F')
    } else {
      doc.rect(tableX, y, contentW, rowH, 'F')
    }

    const vals = [
      String(i + 1),
      truncar(tramo.origen, 22),
      truncar(tramo.destino, 22),
      formatearFechaCorta(tramo.fecha),
      formatearHora(tramo.horarioSeleccionado?.hora),
      String(tramo.pasajeros),
      formatearPrecio(calcularSubtotal(tramo)),
    ]

    colDefs.forEach((col, j) => {
      const tx = col.align === 'right' ? col.x + col.w
        : col.align === 'center' ? col.x + col.w / 2
        : col.x + 2

      if (j === 0) {
        doc.setFont('helvetica', 'bold')
        setColor(doc, COLORS.greenMain, 'text')
      } else if (j === vals.length - 1) {
        doc.setFont('helvetica', 'bold')
        setColor(doc, COLORS.black, 'text')
      } else {
        doc.setFont('helvetica', 'normal')
        setColor(doc, COLORS.grayDark, 'text')
      }

      doc.text(vals[j], tx, y + 6, { align: col.align })
    })

    y += rowH
  })

  // Borde de la tabla
  setColor(doc, COLORS.grayLight, 'draw')
  doc.setLineWidth(0.3)
  const tableH = headerRowH + completados.length * rowH
  doc.roundedRect(tableX, y - tableH, contentW, tableH, 2, 2, 'S')

  y += 8

  // ═══════════════════════════════════════════════════════════════
  // TOTAL - Caja roja
  // ═══════════════════════════════════════════════════════════════
  setColor(doc, COLORS.redDark, 'fill')
  doc.roundedRect(M + 0.5, y + 0.5, contentW - 1, 15.5, 3, 3, 'F')
  setColor(doc, COLORS.red, 'fill')
  doc.roundedRect(M, y, contentW, 15.5, 3, 3, 'F')

  doc.setFont('helvetica', 'bold')
  setColor(doc, COLORS.white, 'text')
  doc.setFontSize(10)
  doc.text('TOTAL ESTIMADO', M + 8, y + 10)

  doc.setFontSize(16)
  doc.text(formatearPrecio(total), W - M - 8, y + 11, { align: 'right' })

  y += 26

  // ═══════════════════════════════════════════════════════════════
  // NOTA
  // ═══════════════════════════════════════════════════════════════
  if (y > 268) {
    dibujarFooter(doc, W, H, nombreEmpresa)
    doc.addPage()
    y = 20
  }

  setColor(doc, COLORS.greenPale, 'fill')
  doc.roundedRect(M, y, contentW, 18, 2, 2, 'F')

  // Icono info (circulo verde con "i")
  setColor(doc, COLORS.greenMain, 'fill')
  doc.circle(M + 7, y + 9, 3.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  setColor(doc, COLORS.white, 'text')
  doc.text('i', M + 7, y + 10.5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  setColor(doc, COLORS.grayDark, 'text')
  doc.text(
    'Esta cotizacion es referencial y esta sujeta a disponibilidad de asientos.',
    M + 14, y + 7
  )
  doc.text(
    'Los precios pueden variar. Contactenos para confirmar su reserva.',
    M + 14, y + 13
  )

  // ═══════════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════════
  dibujarFooter(doc, W, H, nombreEmpresa)

  doc.save(`itinerario-${Date.now()}.pdf`)
}

function dibujarFooter(doc, W, H, nombreEmpresa) {
  const footerH = 12
  const footerY = H - footerH

  setColor(doc, COLORS.greenDark, 'fill')
  doc.rect(0, footerY, W, footerH, 'F')

  setColor(doc, COLORS.red, 'fill')
  doc.rect(0, footerY, W, 1.5, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(200, 230, 201)
  doc.text(
    `${nombreEmpresa || 'Transporte'} · Documento generado automaticamente · ${new Date().toLocaleDateString('es-PE')}`,
    W / 2,
    footerY + 8,
    { align: 'center' }
  )
}

function formatearFechaCorta(fechaStr) {
  if (!fechaStr) return ''
  const [y, m, d] = fechaStr.split('-')
  return `${d}/${m}/${y}`
}

function truncar(texto, max) {
  if (!texto) return '-'
  return texto.length > max ? texto.substring(0, max - 1) + '..' : texto
}
