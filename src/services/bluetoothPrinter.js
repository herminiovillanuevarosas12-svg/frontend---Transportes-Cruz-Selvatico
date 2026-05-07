/**
 * bluetoothPrinter
 * Servicio Web Bluetooth genérico — capa fina sobre el módulo printing/.
 *
 * Responsabilidades:
 *   - Gestionar la conexión BLE (auto-discovery de characteristic writable)
 *   - Persistir y exponer el perfil de impresora activo y el protocolo
 *   - Delegar la generación de bytes al adaptador correspondiente
 *     (TSPL vs ESC/POS) y enviarlos por BLE
 *
 * El protocolo (TSPL/ESC/POS) es propiedad de la IMPRESORA (auto-detectado
 * por nombre o forzado por el usuario). El perfil (paper + comportamiento)
 * es propiedad del PAPEL/RÓTULO. Ambos son independientes y se combinan
 * en cada impresión.
 */

import debugLog from '../utils/debugLog'
import {
  PRINTER_PROFILES,
  DEFAULT_PROFILE_ID,
  getProfileById,
  toLegacyShape,
} from './printing/profiles'
import { drawRotulo, drawTestCanvas } from './printing/rotuloCanvas'
import { buildTSPLJob } from './printing/tspl'
import { buildESCPOSRotulo, buildESCPOSTestPage } from './printing/escpos'

const STORAGE_KEY = 'bt_printer_device'
const PROTOCOL_KEY = 'bt_printer_protocol'
const FORMAT_KEY = 'bt_printer_format'

// ─── BLE / GATT ───
const PRIMARY_CHARACTERISTIC_UUID = '49535343-8841-43f4-a8d4-ecbe34729bb3' // ISSC TSPL conocida

// UUIDs comunes de impresoras térmicas BLE — necesarios en optionalServices
// para que el browser permita listarlas tras requestDevice().
const FALLBACK_SERVICE_UUIDS = [
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent UART (TSPL)
  '0000ff00-0000-1000-8000-00805f9b34fb', // Goojprt / Xprinter
  '000018f0-0000-1000-8000-00805f9b34fb', // Genérico ESC/POS
  '0000ff10-0000-1000-8000-00805f9b34fb',
  '0000ff12-0000-1000-8000-00805f9b34fb',
  '0000fee7-0000-1000-8000-00805f9b34fb',
  '0000ae00-0000-1000-8000-00805f9b34fb',
]

// ─── Transporte BLE ───
const CHUNK_SIZE = 60
const CHUNK_DELAY_MS = 10
const POST_CONNECT_WAIT_MS = 300
const DRAIN_FINAL_MS = 200

let connection = null
let selectedProtocol = (() => {
  try { return localStorage.getItem(PROTOCOL_KEY) || 'auto' } catch { return 'auto' }
})()
let selectedProfileId = (() => {
  try { return localStorage.getItem(FORMAT_KEY) || DEFAULT_PROFILE_ID } catch { return DEFAULT_PROFILE_ID }
})()
const listeners = new Set()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const emit = (state) => {
  listeners.forEach((fn) => { try { fn(state) } catch {} })
}

// ─── Auto-detect protocolo por nombre del device ───
function autoDetectProtocol(deviceName) {
  if (!deviceName) return 'tspl'
  const n = String(deviceName).toUpperCase()
  if (/EX\d|TSC|TDP|TTP|TSPL|ZD\d|XP-DT|TT04|TT07|D58/.test(n)) return 'tspl'
  if (/MTP|RPP|GP-58|GP-80|MP-|BT-T|GOOJPRT|XPRINTER|SEYPOS|YHD|MUNBYN|RUGTEK|EPSON|STAR|POS|PRT|RP-|HOIN/.test(n)) return 'escpos'
  return 'escpos'
}

function getActiveProtocol() {
  if (selectedProtocol === 'auto') {
    return autoDetectProtocol(connection?.device?.name)
  }
  return selectedProtocol
}

// ─── API: protocolo ───
export function getProtocol() { return selectedProtocol }
export function getEffectiveProtocol() { return getActiveProtocol() }
export function setProtocol(p) {
  if (!['auto', 'tspl', 'escpos'].includes(p)) return
  selectedProtocol = p
  try { localStorage.setItem(PROTOCOL_KEY, p) } catch {}
  debugLog.info('bt:protocol', 'Protocolo seteado', { protocol: p, effective: getActiveProtocol() })
  emit(getState())
}

// ─── API: perfil (mantiene nombres "format" para compatibilidad de consumidores) ───
export function getFormat() { return selectedProfileId }
export function getFormatObject() {
  return toLegacyShape(getProfileById(selectedProfileId))
}
export function getActiveProfile() {
  return getProfileById(selectedProfileId)
}
export function setFormat(id) {
  const p = getProfileById(id)
  if (!p) return
  selectedProfileId = p.id
  try { localStorage.setItem(FORMAT_KEY, p.id) } catch {}
  debugLog.info('bt:format', 'Perfil seteado', {
    id: p.id,
    widthMm: p.paper.widthMm,
    heightMm: p.paper.heightMm,
    mode: p.paper.mode,
  })
  emit(getState())
}

// ─── Estado / suscripción ───
export function subscribe(fn) {
  listeners.add(fn)
  fn(getState())
  return () => listeners.delete(fn)
}

export function getState() {
  const profile = getActiveProfile()
  return {
    isAvailable: typeof navigator !== 'undefined' && !!navigator.bluetooth,
    isConnected: !!(connection && connection.device?.gatt?.connected),
    deviceName: connection?.device?.name || null,
    deviceId: connection?.device?.id || null,
    serviceUuid: connection?.service?.uuid || null,
    characteristicUuid: connection?.characteristic?.uuid || null,
    protocol: selectedProtocol,
    effectiveProtocol: getActiveProtocol(),
    formatId: profile.id,
    formatLabel: profile.label,
    formatWidthMm: profile.paper.widthMm,
    formatHeightMm: profile.paper.heightMm,
    formatMode: profile.paper.mode,
    printerKind: profile.printerKind,
  }
}

// ─── Conexión BLE ───
export async function requestAndConnect() {
  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth no disponible. Use Chrome o Edge en Android/Windows con HTTPS.')
  }
  debugLog.info('bt:connect', 'Solicitando dispositivo BT', {})

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

  debugLog.info('bt:connect', 'Dispositivo seleccionado', { name: device.name, id: device.id })

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

  const services = await server.getPrimaryServices()
  debugLog.info('bt:connect', 'Services primarios disponibles', {
    count: services.length,
    uuids: services.map((s) => s.uuid),
  })

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

  const chosen = writableChars.find(
    (x) => x.characteristic.uuid.toLowerCase() === PRIMARY_CHARACTERISTIC_UUID.toLowerCase()
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

// ─── Escritura BLE en chunks ───
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
        if (ch.writeValueWithResponse) await ch.writeValueWithResponse(slice)
        else await ch.writeValue(slice)
      } else {
        if (ch.writeValueWithoutResponse) await ch.writeValueWithoutResponse(slice)
        else await ch.writeValue(slice)
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

// ─── Diagnóstico de espacio en blanco posterior ───
function logBlankSpaceDiagnostic(profile, diagnostics) {
  const max = profile.maxBlankAfterMm ?? 0
  const final = diagnostics.finalFeedMm ?? 0
  if (final > max) {
    debugLog.warn('bt:diagnostic', 'Avance final excede umbral del perfil', {
      profileId: profile.id,
      finalFeedMm: final,
      maxBlankAfterMm: max,
      hint: 'Bajar profile.finalFeedMm o desactivar profile.cut.enabled si el papel es etiqueta.',
    })
  }
}

// ─── Diagnóstico calibración física ───
function logCalibrationHint(profile, diagnostics) {
  // Si el código no emitió feed/cut excesivo y el papel es etiqueta con gap,
  // el papel sobrante restante (si lo hay) es responsabilidad del sensor físico.
  const codeOK = diagnostics.finalFeedMm === 0 && !diagnostics.cutEmitted
  if (codeOK && profile.paper.mode === 'gap') {
    debugLog.info('bt:diagnostic', 'Código no emite feed/cut adicional', {
      profileId: profile.id,
      hint: 'Si la impresora aún jala papel en blanco, calibrar sensor de gap físicamente.',
    })
  }
}

// ─── Imprimir rótulo ───
export async function printRotulo(encomienda) {
  if (!connection?.characteristic) throw new Error('Impresora BT no conectada')
  const profile = getActiveProfile()
  const protocol = getActiveProtocol()

  debugLog.info('bt:print', '=== INICIO printRotulo ===', {
    profileId: profile.id,
    protocol,
    device: connection.device?.name,
    codigo: encomienda?.codigo,
  })

  let job
  let diagnostics

  if (protocol === 'escpos') {
    const built = buildESCPOSRotulo({ profile, encomienda })
    job = built.job
    diagnostics = built.diagnostics
  } else {
    const tCanvas = performance.now()
    const canvas = await drawRotulo(encomienda, profile)
    debugLog.info('bt:render', 'Canvas listo', {
      width: canvas.width,
      height: canvas.height,
      ms: Math.round(performance.now() - tCanvas),
    })
    const built = buildTSPLJob({ profile, canvas, encomienda })
    job = built.job
    diagnostics = built.diagnostics
  }

  debugLog.info('bt:print', 'Job ensamblado', diagnostics)

  // Diagnósticos pre-envío (solo logs, no rompe el flujo)
  try { logBlankSpaceDiagnostic(profile, diagnostics) } catch {}
  try { logCalibrationHint(profile, diagnostics) } catch {}

  const tSend = performance.now()
  await writeRaw(job)
  debugLog.info('bt:print', '=== Job enviado ===', {
    ms: Math.round(performance.now() - tSend),
    bytes: job.length,
  })
}

// ─── Test page ───
export async function printTestPage() {
  if (!connection?.characteristic) throw new Error('Impresora BT no conectada')
  const profile = getActiveProfile()
  const protocol = getActiveProtocol()

  debugLog.info('bt:print', 'Dispatcher printTestPage', {
    profileId: profile.id,
    protocol,
  })

  let job
  let diagnostics

  if (protocol === 'escpos') {
    const built = buildESCPOSTestPage({ profile })
    job = built.job
    diagnostics = built.diagnostics
  } else {
    const canvas = drawTestCanvas(profile)
    const built = buildTSPLJob({ profile, canvas, encomienda: null })
    job = built.job
    diagnostics = built.diagnostics
  }

  debugLog.info('bt:print', 'Test page ensamblada', diagnostics)
  await writeRaw(job)
  debugLog.info('bt:print', 'Test page enviada', { bytes: job.length })
}

// ─── Preview (canvas para UI, sin tocar impresora) ───
export async function renderPreviewCanvas(encomienda, formatId) {
  const profile = formatId ? getProfileById(formatId) : getActiveProfile()
  return drawRotulo(encomienda, profile)
}

// ─── Re-conexión silenciosa al volver a la app ───
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

// ─── Catálogo de perfiles para UI (selector) ───
export { PRINTER_PROFILES }

export default {
  subscribe,
  getState,
  getProtocol,
  getEffectiveProtocol,
  setProtocol,
  getFormat,
  getFormatObject,
  getActiveProfile,
  setFormat,
  requestAndConnect,
  disconnect,
  printRotulo,
  printTestPage,
  tryReconnect,
  renderPreviewCanvas,
}
