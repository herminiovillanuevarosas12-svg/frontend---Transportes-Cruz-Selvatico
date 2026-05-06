/**
 * debugLog
 * Wrapper minimalista que redirige a console del navegador.
 * Útil para inspeccionar el flujo de impresión BT desde DevTools.
 */

const fmt = (tag, msg) => `[${tag}] ${msg}`

export const debugLog = {
  log: (tag, msg, data) => console.log(fmt(tag, msg), data ?? ''),
  info: (tag, msg, data) => console.log(fmt(tag, msg), data ?? ''),
  warn: (tag, msg, data) => console.warn(fmt(tag, msg), data ?? ''),
  error: (tag, msg, data) => console.error(fmt(tag, msg), data ?? ''),
}

export default debugLog
