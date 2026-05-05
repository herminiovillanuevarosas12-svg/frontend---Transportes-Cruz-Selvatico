/**
 * bluetoothPrinter
 * Servicio Web Bluetooth genérico con dos drivers:
 *
 *   - 'tspl'   → Impresoras TSPL (TSC, EX58C, clones chinos). Texto rasterizado a BITMAP.
 *   - 'escpos' → Impresoras ESC/POS (Goojprt, MTP, Xprinter, Munbyn, YHD ESC/POS, etc.).
 *
 * Selección de protocolo:
 *   - 'auto' → autodetecta por nombre del device (default)
 *   - 'tspl' → fuerza TSPL
 *   - 'escpos' → fuerza ESC/POS
 *
 * Conexión BLE: auto-discovery del primer characteristic con write/writeWithoutResponse.
 * Compatible con cualquier impresora térmica BLE (no requiere UUID hardcoded).
 */

import debugLog from '../utils/debugLog'

const STORAGE_KEY = 'bt_printer_device'
const PROTOCOL_KEY = 'bt_printer_protocol'

// ─── BLE / GATT (config exacta para EX58C-4EE7) ───
const SERVICE_UUID = '49535343-fe7d-4ae5-8fa9-9fafd205e455'
const CHARACTERISTIC_UUID = '49535343-8841-43f4-a8d4-ecbe34729bb3'

// UUIDs comunes de impresoras térmicas BLE (TSPL + ESC/POS) — para que estén
// disponibles en optionalServices y al hacer getPrimaryServices().
const FALLBACK_SERVICE_UUIDS = [
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',  // ISSC Transparent UART (TSPL)
  '0000ff00-0000-1000-8000-00805f9b34fb',  // Goojprt / Xprinter
  '000018f0-0000-1000-8000-00805f9b34fb',  // Genérico ESC/POS
  '0000ff10-0000-1000-8000-00805f9b34fb',
  '0000ff12-0000-1000-8000-00805f9b34fb',
  '0000fee7-0000-1000-8000-00805f9b34fb',
  '0000ae00-0000-1000-8000-00805f9b34fb',
]

// ─── Transporte ───
const CHUNK_SIZE = 60
const CHUNK_DELAY_MS = 10
const POST_CONNECT_WAIT_MS = 300
const DRAIN_FINAL_MS = 200

// ─── Hardware ───
const PRINTER_WIDTH_DOTS = 384  // 48 mm imprimibles
const DOTS_PER_MM = 8           // 203 dpi

let connection = null
let selectedProtocol = (() => {
  try { return localStorage.getItem(PROTOCOL_KEY) || 'auto' } catch { return 'auto' }
})()
const listeners = new Set()

// ─── Protocolo: auto-detect por nombre del device ───
function autoDetectProtocol(deviceName) {
  if (!deviceName) return 'tspl'
  const n = String(deviceName).toUpperCase()
  // Patrones conocidos de TSPL (TSC, EX58, ZD, TDP, TTP)
  if (/EX\d|TSC|TDP|TTP|TSPL|ZD\d|XP-DT|TT04|TT07|D58/.test(n)) return 'tspl'
  // Patrones conocidos de ESC/POS (mayoría de tickets BLE chinos)
  if (/MTP|RPP|GP-58|GP-80|MP-|BT-T|GOOJPRT|XPRINTER|SEYPOS|YHD|MUNBYN|RUGTEK|EPSON|STAR|POS|PRT|RP-|HOIN/.test(n)) return 'escpos'
  // Default si no match: ESC/POS (más común en clones BLE)
  return 'escpos'
}

function getActiveProtocol() {
  if (selectedProtocol === 'auto') {
    return autoDetectProtocol(connection?.device?.name)
  }
  return selectedProtocol
}

export function getProtocol() { return selectedProtocol }
export function getEffectiveProtocol() { return getActiveProtocol() }
export function setProtocol(p) {
  if (!['auto', 'tspl', 'escpos'].includes(p)) return
  selectedProtocol = p
  try { localStorage.setItem(PROTOCOL_KEY, p) } catch {}
  debugLog.info('bt:protocol', 'Protocolo seteado', { protocol: p, effective: getActiveProtocol() })
  emit(getState())
}

const emit = (state) => {
  listeners.forEach((fn) => { try { fn(state) } catch {} })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ──────────────────────────────────────────────────────────────────────────
// API pública: estado / suscripción
// ──────────────────────────────────────────────────────────────────────────

export function subscribe(fn) {
  listeners.add(fn)
  fn(getState())
  return () => listeners.delete(fn)
}

export function getState() {
  return {
    isAvailable: typeof navigator !== 'undefined' && !!navigator.bluetooth,
    isConnected: !!(connection && connection.device?.gatt?.connected),
    deviceName: connection?.device?.name || null,
    deviceId: connection?.device?.id || null,
    serviceUuid: connection?.service?.uuid || null,
    characteristicUuid: connection?.characteristic?.uuid || null,
    protocol: selectedProtocol,
    effectiveProtocol: getActiveProtocol(),
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Conexión
// ──────────────────────────────────────────────────────────────────────────

export async function requestAndConnect() {
  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth no disponible. Use Chrome o Edge en Android/Windows con HTTPS.')
  }

  debugLog.info('bt:connect', 'Solicitando dispositivo BT', { service: SERVICE_UUID })

  let device
  try {
    device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: FALLBACK_SERVICE_UUIDS,
    })
  } catch (err) {
    debugLog.error('bt:connect', 'requestDevice cancelado o fallido', { err: String(err) })
    throw err
  }

  debugLog.info('bt:connect', 'Dispositivo seleccionado', {
    name: device.name,
    id: device.id,
  })

  device.addEventListener('gattserverdisconnected', () => {
    debugLog.warn('bt:connect', 'GATT desconectado', { name: device.name })
    connection = null
    emit(getState())
  })

  return await connectToDevice(device)
}

async function connectToDevice(device) {
  debugLog.info('bt:connect', 'Conectando GATT...', { name: device.name })
  const t0 = performance.now()
  const server = await device.gatt.connect()
  debugLog.info('bt:connect', 'GATT conectado, esperando estabilización', {
    ms: Math.round(performance.now() - t0),
    waitMs: POST_CONNECT_WAIT_MS,
  })
  await sleep(POST_CONNECT_WAIT_MS)

  // 1) Listar TODOS los services y characteristics
  const services = await server.getPrimaryServices()
  debugLog.info('bt:connect', 'Services primarios disponibles', {
    count: services.length,
    uuids: services.map((s) => s.uuid),
  })

  // 2) Recolectar todas las characteristics writable de todos los services
  const writableChars = []
  for (const svc of services) {
    let chars
    try { chars = await svc.getCharacteristics() } catch { continue }
    for (const c of chars) {
      const w = c.properties.write
      const wnr = c.properties.writeWithoutResponse
      debugLog.info('bt:connect', 'characteristic detectada', {
        service: svc.uuid,
        char: c.uuid,
        write: w,
        writeWithoutResponse: wnr,
        notify: c.properties.notify,
      })
      if (w || wnr) writableChars.push({ service: svc, characteristic: c })
    }
  }

  if (writableChars.length === 0) {
    throw new Error('La impresora no expone ninguna characteristic writable')
  }

  // 3) Priorizar la "buena conocida" (ISSC TSPL: 49535343-8841-...). Si no, primera writable.
  let chosen = writableChars.find(
    (x) => x.characteristic.uuid.toLowerCase() === CHARACTERISTIC_UUID.toLowerCase()
  ) || writableChars[0]

  connection = { device, server, service: chosen.service, characteristic: chosen.characteristic }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: device.id, name: device.name }))
  } catch {}

  emit(getState())

  debugLog.info('bt:connect', '=== Conexión BT lista ===', {
    name: device.name,
    service: chosen.service.uuid,
    characteristic: chosen.characteristic.uuid,
    write: chosen.characteristic.properties.write,
    writeWithoutResponse: chosen.characteristic.properties.writeWithoutResponse,
    selectedProtocol,
    effectiveProtocol: getActiveProtocol(),
    autoDetected: selectedProtocol === 'auto' ? autoDetectProtocol(device.name) : null,
  })

  return getState()
}

export async function disconnect() {
  if (connection?.device?.gatt?.connected) {
    try { connection.device.gatt.disconnect() } catch {}
  }
  connection = null
  emit(getState())
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
  debugLog.info('bt:connect', 'Desconectado por usuario', {})
}

// ──────────────────────────────────────────────────────────────────────────
// Escritura BLE en chunks (intermedios sin respuesta, final con respuesta)
// ──────────────────────────────────────────────────────────────────────────

async function writeRaw(bytes) {
  if (!connection?.characteristic) throw new Error('Impresora BT no conectada')
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  const ch = connection.characteristic
  const total = data.length

  let offset = 0
  while (offset < total) {
    const end = Math.min(offset + CHUNK_SIZE, total)
    const slice = data.slice(offset, end)
    const isLast = end >= total
    try {
      if (isLast) {
        if (ch.writeValueWithResponse) {
          await ch.writeValueWithResponse(slice)
        } else {
          await ch.writeValue(slice)
        }
      } else {
        if (ch.writeValueWithoutResponse) {
          await ch.writeValueWithoutResponse(slice)
        } else {
          await ch.writeValue(slice)
        }
      }
    } catch (err) {
      debugLog.error('bt:write', 'Error escribiendo chunk', {
        offset,
        chunkLen: slice.length,
        isLast,
        err: String(err),
      })
      throw err
    }
    offset = end
    if (!isLast && CHUNK_DELAY_MS > 0) await sleep(CHUNK_DELAY_MS)
  }

  await sleep(DRAIN_FINAL_MS)
  return total
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers TSPL
// ──────────────────────────────────────────────────────────────────────────

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

const enc = new TextEncoder()
const ascii = (s) => enc.encode(s)
const CRLF = ascii('\r\n')

// Sanitiza data para BARCODE 128 (ASCII imprimible 0x20-0x7E)
const sanitizeBarcodeData = (s) =>
  String(s ?? '').replace(/[^\x20-\x7E]/g, '').slice(0, 80)

// Strip diacritics para texto rasterizado (la impresora no rasteriza,
// el canvas sí soporta UTF-8 — esto es solo defensivo si se mostrara feo)
const stripDiacritics = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')

// ──────────────────────────────────────────────────────────────────────────
// Carga de imagen → Promise<HTMLImageElement>
// ──────────────────────────────────────────────────────────────────────────

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    if (!src) return reject(new Error('src vacío'))
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(new Error('Imagen no pudo cargarse: ' + String(e)))
    img.src = src
  })

// ──────────────────────────────────────────────────────────────────────────
// Rasterizador: Canvas → bitmap TSPL (1 bit/pixel, 0=negro, 1=blanco)
// ──────────────────────────────────────────────────────────────────────────

function canvasToTSPLBitmap(canvas) {
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  const widthBytes = Math.ceil(w / 8)
  const out = new Uint8Array(widthBytes * h).fill(0xFF) // todo blanco
  const img = ctx.getImageData(0, 0, w, h).data

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4
      const r = img[idx]
      const g = img[idx + 1]
      const b = img[idx + 2]
      const a = img[idx + 3]
      const luma = a === 0 ? 255 : (0.299 * r + 0.587 * g + 0.114 * b)
      if (luma < 128) {
        // Pixel oscuro → bit = 0 (imprime negro)
        const byteIdx = y * widthBytes + (x >> 3)
        const bitIdx = 7 - (x & 7) // MSB first
        out[byteIdx] &= ~(1 << bitIdx)
      }
    }
  }
  return { bytes: out, widthBytes, height: h }
}

// ──────────────────────────────────────────────────────────────────────────
// Layout del rótulo en canvas (384 dots wide)
// ──────────────────────────────────────────────────────────────────────────

async function drawRotuloCanvas(encomienda) {
  const W = PRINTER_WIDTH_DOTS // 384
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
      debugLog.warn('bt:render', 'QR no se pudo cargar, omitiendo', { err: String(err) })
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

  // Línea divisoria
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

  // Recortar EXACTO al contenido, alineado a múltiplo de 8 (1 mm)
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

// ──────────────────────────────────────────────────────────────────────────
// Construcción del job TSPL
// ──────────────────────────────────────────────────────────────────────────

function buildTSPLHeader(altoMm) {
  const lines = [
    `SIZE 58 mm,${altoMm} mm`,
    'GAP 0,0',
    'DIRECTION 1',
    'REFERENCE 0,0',
    'DENSITY 10',
    'SPEED 4',
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

function buildBarcodeLine(x, y, data, height = 70, hri = 1, narrow = 2, wide = 2) {
  const safe = sanitizeBarcodeData(data)
  if (!safe) return new Uint8Array(0)
  return ascii(`BARCODE ${x},${y},"128",${height},${hri},0,${narrow},${wide},"${safe}"\r\n`)
}

const buildPrintFooter = () => ascii('PRINT 1\r\n')

// ──────────────────────────────────────────────────────────────────────────
// Driver TSPL: imprimir rótulo (rasterizado a BITMAP)
// ──────────────────────────────────────────────────────────────────────────

async function printRotuloTSPL(encomienda) {
  if (!connection?.characteristic) throw new Error('Impresora BT no conectada')

  debugLog.info('bt:print', '=== INICIO printRotulo (TSPL) ===', {
    codigo: encomienda?.codigo,
    device: connection.device?.name,
  })

  // 1) Render canvas
  const tCanvas = performance.now()
  const canvas = await drawRotuloCanvas(encomienda)
  debugLog.info('bt:render', 'Canvas listo', {
    width: canvas.width,
    height: canvas.height,
    ms: Math.round(performance.now() - tCanvas),
  })

  // 2) Rasterizar a bitmap TSPL
  const tRaster = performance.now()
  const bitmap = canvasToTSPLBitmap(canvas)
  debugLog.info('bt:render', 'Bitmap rasterizado', {
    widthBytes: bitmap.widthBytes,
    height: bitmap.height,
    bytes: bitmap.bytes.length,
    ms: Math.round(performance.now() - tRaster),
  })

  // 3) Calcular altura total en mm AJUSTADA AL CONTENIDO (sin margen extra)
  // El bitmap ya viene alineado a múltiplo de 8 dots = 1mm exacto.
  // El barcode añade 50 dots (6mm) + HRI ~24 dots (3mm) ≈ 9mm.
  const BARCODE_HEIGHT_DOTS = 50
  const BARCODE_HRI_DOTS = 24
  const BARCODE_GAP_DOTS = 4

  const bitmapMm = bitmap.height / DOTS_PER_MM
  const barcodeBlockDots = BARCODE_GAP_DOTS + BARCODE_HEIGHT_DOTS + BARCODE_HRI_DOTS
  const codigoBarcode = sanitizeBarcodeData(encomienda?.codigo || encomienda?.codigoTracking || '')
  const totalDots = bitmap.height + (codigoBarcode ? barcodeBlockDots : 0)
  const altoTotalMm = Math.ceil(totalDots / DOTS_PER_MM)

  // 4) Ensamblar job TSPL
  const header = buildTSPLHeader(altoTotalMm)
  const bitmapBlock = buildBitmapBlock(bitmap)

  const barcodeY = bitmap.height + BARCODE_GAP_DOTS
  const barcodeBlock = codigoBarcode
    ? buildBarcodeLine(40, barcodeY, codigoBarcode, BARCODE_HEIGHT_DOTS, 1, 2, 2)
    : new Uint8Array(0)

  const footer = buildPrintFooter()
  const job = concatBytes(header, bitmapBlock, barcodeBlock, footer)

  debugLog.info('bt:print', 'Job TSPL ensamblado', {
    bitmapDots: bitmap.height,
    bitmapMm: Math.round(bitmapMm * 10) / 10,
    barcodeDots: codigoBarcode ? barcodeBlockDots : 0,
    altoTotalMm,
    headerBytes: header.length,
    bitmapBlockBytes: bitmapBlock.length,
    barcodeBytes: barcodeBlock.length,
    footerBytes: footer.length,
    totalBytes: job.length,
    chunks: Math.ceil(job.length / CHUNK_SIZE),
    barcodeData: codigoBarcode || null,
  })

  // 5) Enviar por BLE
  const tSend = performance.now()
  await writeRaw(job)
  debugLog.info('bt:print', '=== Job enviado a impresora ===', {
    ms: Math.round(performance.now() - tSend),
    bytes: job.length,
  })
}

// ──────────────────────────────────────────────────────────────────────────
// Driver TSPL: test page
// ──────────────────────────────────────────────────────────────────────────

async function printTestPageTSPL() {
  if (!connection?.characteristic) throw new Error('Impresora BT no conectada')

  const canvas = document.createElement('canvas')
  canvas.width = PRINTER_WIDTH_DOTS
  canvas.height = 96
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#FFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#000'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'
  ctx.font = 'bold 28px sans-serif'
  ctx.fillText('TEST OK', canvas.width / 2, 8)
  ctx.font = '14px sans-serif'
  ctx.fillText(new Date().toLocaleString(), canvas.width / 2, 48)
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('Impresora TSPL conectada', canvas.width / 2, 70)

  const bitmap = canvasToTSPLBitmap(canvas)
  const bitmapMm = Math.ceil(bitmap.height / DOTS_PER_MM)
  const altoTotalMm = bitmapMm + 4

  const job = concatBytes(
    buildTSPLHeader(altoTotalMm),
    buildBitmapBlock(bitmap),
    buildPrintFooter(),
  )

  debugLog.info('bt:print', 'Test page TSPL ensamblada', { altoMm: altoTotalMm, bytes: job.length })
  await writeRaw(job)
  debugLog.info('bt:print', 'Test page TSPL enviada', {})
}

// ──────────────────────────────────────────────────────────────────────────
// Driver ESC/POS: comandos nativos (sin rasterizado)
// La mayoría de impresoras BLE de 58/80mm chinas son ESC/POS y traen fonts en ROM.
// ──────────────────────────────────────────────────────────────────────────

const escposCmd = {
  init: () => Uint8Array.of(0x1B, 0x40),
  alignLeft: () => Uint8Array.of(0x1B, 0x61, 0x00),
  alignCenter: () => Uint8Array.of(0x1B, 0x61, 0x01),
  bold: (on) => Uint8Array.of(0x1B, 0x45, on ? 1 : 0),
  // GS ! n: bits 0-3 alto, 4-7 ancho. (w-1)<<4 | (h-1)
  size: (w = 1, h = 1) => Uint8Array.of(0x1D, 0x21, ((w - 1) << 4) | (h - 1)),
  feed: (n = 1) => {
    const out = new Uint8Array(n)
    out.fill(0x0A)
    return out
  },
  cut: () => Uint8Array.of(0x1D, 0x56, 0x00),
  textLine: (s) => concatBytes(ascii(stripDiacritics(s)), Uint8Array.of(0x0A)),
  // QR ESC/POS nativo (GS ( k). size 1..16
  qr: (data, size = 8, errorLevel = 0x31) => {
    const bytes = ascii(String(data ?? ''))
    const len = bytes.length + 3
    const pL = len & 0xff
    const pH = (len >> 8) & 0xff
    return concatBytes(
      Uint8Array.of(0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00),
      Uint8Array.of(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, size),
      Uint8Array.of(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, errorLevel),
      concatBytes(Uint8Array.of(0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30), bytes),
      Uint8Array.of(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30),
    )
  },
}

async function printRotuloESCPOS(encomienda) {
  if (!connection?.characteristic) throw new Error('Impresora BT no conectada')

  const codigo = stripDiacritics(encomienda?.codigo || encomienda?.codigoTracking || '-')
  const origen = stripDiacritics(encomienda?.origen || encomienda?.puntoOrigen?.nombre || '-')
  const destino = stripDiacritics(encomienda?.destino || encomienda?.puntoDestino?.nombre || '-')
  const dest = encomienda?.destinatario || {}
  const destNombre = stripDiacritics(dest.nombre || '-')
  const destTel = stripDiacritics(dest.telefono || '-')
  const destDni = stripDiacritics(dest.dni || '')

  debugLog.info('bt:print', '=== INICIO printRotulo (ESC/POS) ===', {
    codigo,
    device: connection.device?.name,
  })

  const job = concatBytes(
    escposCmd.init(),
    escposCmd.alignCenter(),
    escposCmd.bold(true),
    escposCmd.size(1, 1),
    escposCmd.textLine('CRUZ SELVATICO'),
    escposCmd.bold(false),
    escposCmd.feed(1),
    escposCmd.size(2, 2),
    escposCmd.bold(true),
    escposCmd.textLine(codigo),
    escposCmd.size(1, 1),
    escposCmd.bold(false),
    escposCmd.feed(1),
    escposCmd.qr(codigo, 8),
    escposCmd.feed(1),
    escposCmd.bold(true),
    escposCmd.size(1, 2),
    escposCmd.textLine(`${origen} -> ${destino}`),
    escposCmd.size(1, 1),
    escposCmd.bold(false),
    escposCmd.feed(1),
    escposCmd.alignLeft(),
    escposCmd.bold(true),
    escposCmd.textLine('DESTINATARIO:'),
    escposCmd.bold(false),
    escposCmd.size(1, 2),
    escposCmd.textLine(destNombre),
    escposCmd.size(1, 1),
    escposCmd.textLine(`Tel: ${destTel}`),
    destDni ? escposCmd.textLine(`DNI: ${destDni}`) : new Uint8Array(0),
    escposCmd.feed(3),
    escposCmd.cut(),
  )

  debugLog.info('bt:print', 'Job ESC/POS ensamblado', {
    bytes: job.length,
    chunks: Math.ceil(job.length / CHUNK_SIZE),
  })

  await writeRaw(job)
  debugLog.info('bt:print', '=== Job ESC/POS enviado ===', { bytes: job.length })
}

async function printTestPageESCPOS() {
  if (!connection?.characteristic) throw new Error('Impresora BT no conectada')
  const job = concatBytes(
    escposCmd.init(),
    escposCmd.alignCenter(),
    escposCmd.bold(true),
    escposCmd.size(2, 2),
    escposCmd.textLine('TEST OK'),
    escposCmd.size(1, 1),
    escposCmd.bold(false),
    escposCmd.textLine(new Date().toLocaleString()),
    escposCmd.feed(1),
    escposCmd.qr('TEST-' + Date.now(), 6),
    escposCmd.feed(1),
    escposCmd.bold(true),
    escposCmd.textLine('Impresora ESC/POS conectada'),
    escposCmd.bold(false),
    escposCmd.feed(3),
    escposCmd.cut(),
  )
  debugLog.info('bt:print', 'Test page ESC/POS ensamblada', { bytes: job.length })
  await writeRaw(job)
  debugLog.info('bt:print', 'Test page ESC/POS enviada', {})
}

// ──────────────────────────────────────────────────────────────────────────
// API pública: dispatcher según protocolo activo
// ──────────────────────────────────────────────────────────────────────────

export async function printRotulo(encomienda) {
  const proto = getActiveProtocol()
  debugLog.info('bt:print', 'Dispatcher printRotulo', {
    selected: selectedProtocol,
    effective: proto,
    deviceName: connection?.device?.name,
  })
  if (proto === 'escpos') return printRotuloESCPOS(encomienda)
  return printRotuloTSPL(encomienda)
}

export async function printTestPage() {
  const proto = getActiveProtocol()
  debugLog.info('bt:print', 'Dispatcher printTestPage', { effective: proto })
  if (proto === 'escpos') return printTestPageESCPOS()
  return printTestPageTSPL()
}

// ──────────────────────────────────────────────────────────────────────────
// Re-conexión silenciosa
// ──────────────────────────────────────────────────────────────────────────

export async function tryReconnect() {
  if (!navigator.bluetooth?.getDevices) return null
  let stored
  try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { stored = null }
  if (!stored?.id) return null
  try {
    const devices = await navigator.bluetooth.getDevices()
    const device = devices.find((d) => d.id === stored.id)
    if (!device) {
      debugLog.info('bt:reconnect', 'Dispositivo previo no presente', { id: stored.id })
      return null
    }
    debugLog.info('bt:reconnect', 'Reconectando dispositivo previo...', { name: device.name })
    return await connectToDevice(device)
  } catch (err) {
    debugLog.warn('bt:reconnect', 'Re-conexión silenciosa falló', { err: String(err) })
    return null
  }
}

export default {
  subscribe,
  getState,
  getProtocol,
  getEffectiveProtocol,
  setProtocol,
  requestAndConnect,
  disconnect,
  printRotulo,
  printTestPage,
  tryReconnect,
}
