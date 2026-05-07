/**
 * tspl - Adaptador TSPL totalmente parametrizado por PrinterProfile.
 *
 * Genera el job TSPL a partir de:
 *   - profile (paper.widthMm, mode, gapMm, dpi, tspl.density/speed/includesBarcode)
 *   - canvas listo para rasterizar
 *   - encomienda (para el código del barcode nativo, si aplica)
 *
 * No emite avances finales (PRINT 1 es la finalización). El comportamiento
 * post-print depende del modo de papel:
 *   - continuous + SET TEAR OFF → no avanza
 *   - gap + SET TEAR OFF        → la impresora alinea al siguiente gap
 */

import { canvasToBitmap1bpp } from './bitmap'
import { dotsPerMm } from './profiles'

const enc = new TextEncoder()
const ascii = (s) => enc.encode(s)
const CRLF = ascii('\r\n')

const concatBytes = (...arrs) => {
  const total = arrs.reduce((a, b) => a + (b?.length || 0), 0)
  const out = new Uint8Array(total)
  let p = 0
  for (const arr of arrs) {
    if (!arr || !arr.length) continue
    out.set(arr, p)
    p += arr.length
  }
  return out
}

// Sanitiza data para BARCODE 128 (ASCII imprimible 0x20-0x7E)
const sanitizeBarcodeData = (s) =>
  String(s ?? '').replace(/[^\x20-\x7E]/g, '').slice(0, 80)

// Constantes del bloque BARCODE 128 nativo (TSPL)
const BARCODE_HEIGHT_DOTS = 50
const BARCODE_HRI_DOTS = 24
const BARCODE_GAP_DOTS = 4

function buildHeader(profile, altoMm) {
  const widthMm = profile.paper.widthMm
  const mode = profile.paper.mode
  const gapMm = Math.max(0, profile.paper.gapMm || 0)
  const density = profile?.tspl?.density ?? 10
  const speed = profile?.tspl?.speed ?? 4

  let modeLine
  if (mode === 'gap') modeLine = `GAP ${gapMm} mm,0`
  else if (mode === 'black-mark') modeLine = `BLINE ${gapMm} mm,0`
  else modeLine = 'GAP 0,0' // continuous

  const lines = [
    `SIZE ${widthMm} mm,${altoMm} mm`,
    modeLine,
    'DIRECTION 1',
    'REFERENCE 0,0',
    `DENSITY ${density}`,
    `SPEED ${speed}`,
    'OFFSET 0 mm',
    'SET TEAR OFF',
    'CLS',
  ]
  return ascii(lines.join('\r\n') + '\r\n')
}

function buildBitmapBlock(bitmap) {
  const cmd = ascii(`BITMAP 0,0,${bitmap.widthBytes},${bitmap.height},0,`)
  return concatBytes(cmd, bitmap.bytes, CRLF)
}

function buildBarcodeLine(x, y, data, height = BARCODE_HEIGHT_DOTS, hri = 1, narrow = 2, wide = 2) {
  const safe = sanitizeBarcodeData(data)
  if (!safe) return new Uint8Array(0)
  return ascii(`BARCODE ${x},${y},"128",${height},${hri},0,${narrow},${wide},"${safe}"\r\n`)
}

const buildPrint = () => ascii('PRINT 1\r\n')

/**
 * Construye un job TSPL completo a partir de un perfil + canvas.
 *
 * @param {object} args
 * @param {object} args.profile     PrinterProfile activo
 * @param {HTMLCanvasElement} args.canvas
 * @param {object} [args.encomienda] usada solo si profile.tspl.includesBarcode
 * @returns {{ job: Uint8Array, diagnostics: object }}
 */
export function buildTSPLJob({ profile, canvas, encomienda }) {
  const bitmap = canvasToBitmap1bpp(canvas)

  const wantsBarcode = !!profile?.tspl?.includesBarcode
  const codigoBarcode = wantsBarcode
    ? sanitizeBarcodeData(encomienda?.codigo || encomienda?.codigoTracking || '')
    : ''
  const barcodeBlockDots = codigoBarcode
    ? BARCODE_GAP_DOTS + BARCODE_HEIGHT_DOTS + BARCODE_HRI_DOTS
    : 0

  const dpm = dotsPerMm(profile)
  const totalDots = bitmap.height + barcodeBlockDots
  const computedMm = Math.ceil(totalDots / dpm)
  const altoMm = profile.paper.heightMm || computedMm

  const header = buildHeader(profile, altoMm)
  const bitmapBlock = buildBitmapBlock(bitmap)

  const barcodeBlock = codigoBarcode
    ? buildBarcodeLine(40, bitmap.height + BARCODE_GAP_DOTS, codigoBarcode)
    : new Uint8Array(0)

  const print = buildPrint()
  const job = concatBytes(header, bitmapBlock, barcodeBlock, print)

  const diagnostics = {
    protocol: 'tspl',
    profileId: profile.id,
    paper: {
      widthMm: profile.paper.widthMm,
      heightMm: altoMm,
      mode: profile.paper.mode,
      gapMm: profile.paper.gapMm,
      dpi: profile.paper.dpi,
    },
    bitmap: {
      widthDots: profile.paper.widthDotsImprimibles,
      heightDots: bitmap.height,
      heightMm: Math.round((bitmap.height / dpm) * 10) / 10,
      bytes: bitmap.bytes.length,
    },
    barcode: {
      enabled: !!codigoBarcode,
      data: codigoBarcode || null,
      heightDots: barcodeBlockDots,
    },
    finalFeedMm: 0, // TSPL: no se emite feed final (gap/continuo lo gestiona la impresora)
    cutEmitted: false, // TSPL no usa GS V 0
    bytes: job.length,
    chunksAt60: Math.ceil(job.length / 60),
  }

  return { job, diagnostics }
}

export default { buildTSPLJob }
