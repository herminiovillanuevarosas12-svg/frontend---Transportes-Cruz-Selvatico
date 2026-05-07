/**
 * escpos - Adaptador ESC/POS parametrizado por PrinterProfile.
 *
 * Genera el job ESC/POS para un rótulo o test page a partir del perfil:
 *   - profile.finalFeedMm    avance final (en mm) traducido a ESC J n (n = mm × 8 a 203 dpi)
 *   - profile.cut.enabled    emite GS V 0 si está habilitado
 *
 * Las separaciones internas entre secciones (feed(1) entre QR y ruta, etc.)
 * son parte del layout y se mantienen — solo el avance FINAL es configurable.
 */

import { dotsPerMm } from './profiles'

const enc = new TextEncoder()
const ascii = (s) => enc.encode(s)

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

const stripDiacritics = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')

const cmd = {
  init: () => Uint8Array.of(0x1B, 0x40),
  alignLeft: () => Uint8Array.of(0x1B, 0x61, 0x00),
  alignCenter: () => Uint8Array.of(0x1B, 0x61, 0x01),
  bold: (on) => Uint8Array.of(0x1B, 0x45, on ? 1 : 0),
  size: (w = 1, h = 1) => Uint8Array.of(0x1D, 0x21, ((w - 1) << 4) | (h - 1)),
  feedLines: (n = 1) => {
    if (!n || n < 1) return new Uint8Array(0)
    const out = new Uint8Array(n)
    out.fill(0x0A)
    return out
  },
  // ESC J n — avance fino: n × (1/180 inch) ≈ n × 0.141 mm.
  // En la práctica de impresoras 203 dpi se usa n ≈ mm × 8 (1 dot ≈ 0.125 mm).
  fineFeed: (dots) => {
    if (!dots || dots <= 0) return new Uint8Array(0)
    const clamped = Math.min(255, Math.round(dots))
    return Uint8Array.of(0x1B, 0x4A, clamped)
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

function buildFinalFeed(profile) {
  const mm = Math.max(0, profile?.finalFeedMm || 0)
  if (mm <= 0) return new Uint8Array(0)
  const dpm = dotsPerMm(profile)
  // ESC J avanza en unidades de 1 dot a 203 dpi; saturamos a 255 con bloques.
  const totalDots = Math.round(mm * dpm)
  const blocks = []
  let remaining = totalDots
  while (remaining > 0) {
    const chunk = Math.min(255, remaining)
    blocks.push(cmd.fineFeed(chunk))
    remaining -= chunk
  }
  return concatBytes(...blocks)
}

function buildCut(profile) {
  return profile?.cut?.enabled ? cmd.cut() : new Uint8Array(0)
}

/**
 * Construye un job ESC/POS para un rótulo de encomienda.
 *
 * @param {object} args
 * @param {object} args.profile      PrinterProfile activo
 * @param {object} args.encomienda
 * @returns {{ job: Uint8Array, diagnostics: object }}
 */
export function buildESCPOSRotulo({ profile, encomienda }) {
  const codigo = stripDiacritics(encomienda?.codigo || encomienda?.codigoTracking || '-')
  const origen = stripDiacritics(encomienda?.origen || encomienda?.puntoOrigen?.nombre || '-')
  const destino = stripDiacritics(encomienda?.destino || encomienda?.puntoDestino?.nombre || '-')
  const dest = encomienda?.destinatario || {}
  const destNombre = stripDiacritics(dest.nombre || '-')
  const destTel = stripDiacritics(dest.telefono || '-')
  const destDni = stripDiacritics(dest.dni || '')

  const finalFeed = buildFinalFeed(profile)
  const cutBytes = buildCut(profile)

  const job = concatBytes(
    cmd.init(),
    cmd.alignCenter(),
    cmd.bold(true),
    cmd.size(1, 1),
    cmd.textLine('CRUZ SELVATICO'),
    cmd.bold(false),
    cmd.feedLines(1),
    cmd.size(2, 2),
    cmd.bold(true),
    cmd.textLine(codigo),
    cmd.size(1, 1),
    cmd.bold(false),
    cmd.feedLines(1),
    cmd.qr(codigo, 8),
    cmd.feedLines(1),
    cmd.bold(true),
    cmd.size(1, 2),
    cmd.textLine(`${origen} -> ${destino}`),
    cmd.size(1, 1),
    cmd.bold(false),
    cmd.feedLines(1),
    cmd.alignLeft(),
    cmd.bold(true),
    cmd.textLine('DESTINATARIO:'),
    cmd.bold(false),
    cmd.size(1, 2),
    cmd.textLine(destNombre),
    cmd.size(1, 1),
    cmd.textLine(`Tel: ${destTel}`),
    destDni ? cmd.textLine(`DNI: ${destDni}`) : new Uint8Array(0),
    finalFeed,
    cutBytes,
  )

  const diagnostics = {
    protocol: 'escpos',
    profileId: profile.id,
    paper: {
      widthMm: profile.paper.widthMm,
      heightMm: profile.paper.heightMm,
      mode: profile.paper.mode,
      dpi: profile.paper.dpi,
    },
    finalFeedMm: profile.finalFeedMm || 0,
    finalFeedBytes: finalFeed.length,
    cutEmitted: !!profile?.cut?.enabled,
    bytes: job.length,
    chunksAt60: Math.ceil(job.length / 60),
  }

  return { job, diagnostics }
}

export function buildESCPOSTestPage({ profile }) {
  const finalFeed = buildFinalFeed(profile)
  const cutBytes = buildCut(profile)
  const job = concatBytes(
    cmd.init(),
    cmd.alignCenter(),
    cmd.bold(true),
    cmd.size(2, 2),
    cmd.textLine('TEST OK'),
    cmd.size(1, 1),
    cmd.bold(false),
    cmd.textLine(new Date().toLocaleString()),
    cmd.feedLines(1),
    cmd.qr('TEST-' + Date.now(), 6),
    cmd.feedLines(1),
    cmd.bold(true),
    cmd.textLine(`Perfil: ${profile.label}`),
    cmd.bold(false),
    finalFeed,
    cutBytes,
  )
  const diagnostics = {
    protocol: 'escpos',
    profileId: profile.id,
    finalFeedMm: profile.finalFeedMm || 0,
    cutEmitted: !!profile?.cut?.enabled,
    bytes: job.length,
  }
  return { job, diagnostics }
}

export default { buildESCPOSRotulo, buildESCPOSTestPage }
