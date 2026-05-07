/**
 * rotuloCanvas - Layouts de rótulo dibujados en <canvas>.
 *
 * Dos presets:
 *   - 'compact'      tamaños pixel-perfect tunados para 384 dots (default 76x76).
 *                    Conserva el rendering original que ya imprime correctamente.
 *   - 'responsive'   escalado proporcional al ancho del perfil. Modos:
 *                      tiny  (W < 350 dots o alto fijo < 280) — esencial
 *                      small (W < 500 dots o alto fijo < 400) — esencial + ruta
 *                      full                                    — completo
 *
 * El canvas devuelto:
 *   - Para 'compact': altura recortada al contenido + alineada a múltiplo de 8 dots
 *   - Para 'responsive' con heightMm fijo: altura = heightMm × dotsPerMm
 *   - Para 'responsive' continuo: altura recortada al contenido
 */

import debugLog from '../../utils/debugLog'
import { dotsPerMm } from './profiles'

const stripDiacritics = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    if (!src) return reject(new Error('src vacío'))
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(new Error('Imagen no pudo cargarse: ' + String(e)))
    img.src = src
  })

// ─────────────────────────────────────────────────────────────────────────
// Preset 'compact' — pixel-perfect 384 dots (preserva default 76x76 actual)
// ─────────────────────────────────────────────────────────────────────────

async function drawRotuloCompact(encomienda, profile) {
  const W = profile.paper.widthDotsImprimibles
  const MAX_H = 700
  const PAD = 2

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = MAX_H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, W, MAX_H)
  ctx.fillStyle = '#000000'
  ctx.strokeStyle = '#000000'
  ctx.imageSmoothingEnabled = false
  ctx.textBaseline = 'top'

  let y = PAD

  // Empresa
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('CRUZ SELVATICO', W / 2, y)
  y += 20

  // Caja del código
  const codigo = stripDiacritics(encomienda?.codigo || encomienda?.codigoTracking || '-')
  const boxX = 24
  const boxW = W - 48
  const boxH = 42
  ctx.lineWidth = 2
  ctx.strokeRect(boxX, y, boxW, boxH)
  ctx.font = 'bold 10px sans-serif'
  ctx.fillText('CODIGO', W / 2, y + 3)
  ctx.font = 'bold 24px sans-serif'
  ctx.fillText(codigo, W / 2, y + 14)
  y += boxH + 4

  // QR
  let qrLoaded = false
  if (encomienda?.qr) {
    try {
      const img = await loadImage(encomienda.qr)
      const qrSize = 170
      const qrX = (W - qrSize) / 2
      ctx.drawImage(img, qrX, y, qrSize, qrSize)
      y += qrSize + 4
      qrLoaded = true
    } catch (err) {
      debugLog.warn('print:render', 'QR no se pudo cargar (compact)', { err: String(err) })
    }
  }
  if (!qrLoaded) y += 2

  // Ruta DE → PARA
  const origen = stripDiacritics(encomienda?.origen || encomienda?.puntoOrigen?.nombre || '-')
  const destino = stripDiacritics(encomienda?.destino || encomienda?.puntoDestino?.nombre || '-')

  ctx.font = 'bold 10px sans-serif'
  ctx.fillText('DE', W / 4, y)
  ctx.fillText('PARA', (W * 3) / 4, y)
  y += 11
  ctx.font = 'bold 16px sans-serif'
  ctx.fillText(origen, W / 4, y)
  ctx.fillText(destino, (W * 3) / 4, y)
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText('→', W / 2, y - 1)
  y += 20

  // Línea divisoria punteada
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.setLineDash([4, 3])
  ctx.moveTo(16, y)
  ctx.lineTo(W - 16, y)
  ctx.stroke()
  ctx.setLineDash([])
  y += 4

  // Destinatario
  const dest = encomienda?.destinatario || {}
  const destNombre = stripDiacritics(dest.nombre || '-')
  const destTel = stripDiacritics(dest.telefono || '-')
  const destDni = stripDiacritics(dest.dni || '')

  ctx.font = 'bold 10px sans-serif'
  ctx.fillText('DESTINATARIO', W / 2, y)
  y += 11
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText(destNombre, W / 2, y)
  y += 20
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`Tel: ${destTel}`, W / 2, y)
  y += 13
  if (destDni) {
    ctx.fillText(`DNI: ${destDni}`, W / 2, y)
    y += 13
  }

  // Recortar EXACTO al contenido, alineado a múltiplo de 8 dots
  const finalH = Math.min(Math.ceil(y / 8) * 8, MAX_H)

  const trimmed = document.createElement('canvas')
  trimmed.width = W
  trimmed.height = finalH
  const tctx = trimmed.getContext('2d')
  tctx.fillStyle = '#FFFFFF'
  tctx.fillRect(0, 0, W, finalH)
  tctx.drawImage(canvas, 0, 0)

  return trimmed
}

// ─────────────────────────────────────────────────────────────────────────
// Preset 'responsive' — escalado proporcional al ancho del perfil
// ─────────────────────────────────────────────────────────────────────────

async function drawRotuloResponsive(encomienda, profile) {
  const W = profile.paper.widthDotsImprimibles
  const isFixedHeight = !!profile.paper.heightMm
  const dpm = dotsPerMm(profile)
  const targetH = isFixedHeight ? Math.round(profile.paper.heightMm * dpm) : 700

  const codigo = stripDiacritics(encomienda?.codigo || encomienda?.codigoTracking || '-')
  const origen = stripDiacritics(encomienda?.origen || encomienda?.puntoOrigen?.nombre || '-')
  const destino = stripDiacritics(encomienda?.destino || encomienda?.puntoDestino?.nombre || '-')
  const dest = encomienda?.destinatario || {}
  const destNombre = stripDiacritics(dest.nombre || '-')
  const destTel = stripDiacritics(dest.telefono || '-')
  const destDni = stripDiacritics(dest.dni || '')

  const tiny = W < 350 || (isFixedHeight && targetH < 280)
  const small = !tiny && (W < 500 || (isFixedHeight && targetH < 400))
  const full = !tiny && !small

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#FFF'
  ctx.fillRect(0, 0, W, targetH)
  ctx.fillStyle = '#000'
  ctx.imageSmoothingEnabled = false
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'

  const fEmpresa = Math.max(12, Math.round(W * 0.055))
  const fLabel = Math.max(9, Math.round(W * 0.027))
  const fCodigo = Math.max(18, Math.round(W * 0.075))
  const fRuta = Math.max(12, Math.round(W * 0.045))
  const fNombre = Math.max(14, Math.round(W * 0.055))
  const fTel = Math.max(11, Math.round(W * 0.035))

  let y = Math.round(W * 0.02)
  const PAD = Math.round(W * 0.02)

  if (!tiny) {
    ctx.font = `bold ${fEmpresa}px sans-serif`
    ctx.fillText('CRUZ SELVATICO', W / 2, y)
    y += fEmpresa + 4
  }

  const boxX = Math.round(W * 0.05)
  const boxW = W - boxX * 2
  const boxH = fCodigo + (tiny ? 6 : 12)
  ctx.lineWidth = 2
  ctx.strokeRect(boxX, y, boxW, boxH)
  if (!tiny) {
    ctx.font = `bold ${fLabel}px sans-serif`
    ctx.fillText('CODIGO', W / 2, y + 2)
  }
  ctx.font = `bold ${fCodigo}px sans-serif`
  ctx.fillText(codigo, W / 2, y + (tiny ? 2 : fLabel + 2))
  y += boxH + 4

  let qrLoaded = false
  if (encomienda?.qr) {
    try {
      const img = await loadImage(encomienda.qr)
      const qrSize = tiny
        ? Math.min(W - 40, targetH - y - 20)
        : Math.round(W * 0.5)
      const qrX = (W - qrSize) / 2
      ctx.drawImage(img, qrX, y, qrSize, qrSize)
      y += qrSize + 4
      qrLoaded = true
    } catch (err) {
      debugLog.warn('print:render', 'QR no se pudo cargar (responsive)', { err: String(err) })
    }
  }
  if (!qrLoaded) y += 4

  if (!tiny) {
    ctx.font = `bold ${fLabel}px sans-serif`
    ctx.fillText('DE', W / 4, y)
    ctx.fillText('PARA', (W * 3) / 4, y)
    y += fLabel + 2
    ctx.font = `bold ${fRuta}px sans-serif`
    ctx.fillText(origen, W / 4, y)
    ctx.fillText(destino, (W * 3) / 4, y)
    ctx.font = `bold ${Math.round(fRuta * 1.1)}px sans-serif`
    ctx.fillText('→', W / 2, y - 1)
    y += fRuta + 6
  }

  if (full) {
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.setLineDash([4, 3])
    ctx.moveTo(boxX, y)
    ctx.lineTo(W - boxX, y)
    ctx.stroke()
    ctx.setLineDash([])
    y += 4
    ctx.font = `bold ${fLabel}px sans-serif`
    ctx.fillText('DESTINATARIO', W / 2, y)
    y += fLabel + 2
    ctx.font = `bold ${fNombre}px sans-serif`
    ctx.fillText(destNombre, W / 2, y)
    y += fNombre + 4
    ctx.font = `bold ${fTel}px sans-serif`
    ctx.fillText(`Tel: ${destTel}`, W / 2, y)
    y += fTel + 2
    if (destDni) {
      ctx.fillText(`DNI: ${destDni}`, W / 2, y)
      y += fTel + 2
    }
  }

  y += PAD

  // Recortar al alto usado, o respetar heightMm si el perfil lo fija
  let finalH
  if (isFixedHeight) {
    finalH = targetH
  } else {
    finalH = Math.min(Math.ceil(y / 8) * 8, targetH)
  }

  const trimmed = document.createElement('canvas')
  trimmed.width = W
  trimmed.height = finalH
  const tctx = trimmed.getContext('2d')
  tctx.fillStyle = '#FFF'
  tctx.fillRect(0, 0, W, finalH)
  tctx.drawImage(canvas, 0, 0)

  return trimmed
}

// ─────────────────────────────────────────────────────────────────────────
// Preset 'compact' simple — test page (TEST OK + fecha)
// ─────────────────────────────────────────────────────────────────────────

export function drawTestCanvas(profile) {
  const W = profile.paper.widthDotsImprimibles
  const isFixedHeight = !!profile.paper.heightMm
  const dpm = dotsPerMm(profile)
  const targetH = isFixedHeight ? Math.round(profile.paper.heightMm * dpm) : 96

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#FFF'
  ctx.fillRect(0, 0, W, targetH)
  ctx.fillStyle = '#000'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'
  ctx.font = 'bold 28px sans-serif'
  ctx.fillText('TEST OK', W / 2, 8)
  ctx.font = '14px sans-serif'
  ctx.fillText(new Date().toLocaleString(), W / 2, 48)
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`Perfil: ${profile.label}`, W / 2, 70)

  if (isFixedHeight) return canvas
  // Para continuo, recortar al contenido (alineado a múltiplo de 8 dots)
  const finalH = Math.ceil(72 / 8) * 8
  const trimmed = document.createElement('canvas')
  trimmed.width = W
  trimmed.height = finalH
  const tctx = trimmed.getContext('2d')
  tctx.fillStyle = '#FFF'
  tctx.fillRect(0, 0, W, finalH)
  tctx.drawImage(canvas, 0, 0)
  return trimmed
}

// ─────────────────────────────────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────────────────────────────────

export async function drawRotulo(encomienda, profile) {
  if (profile?.renderPreset === 'compact') {
    return drawRotuloCompact(encomienda, profile)
  }
  return drawRotuloResponsive(encomienda, profile)
}

export default { drawRotulo, drawTestCanvas }
