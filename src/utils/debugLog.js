/**
 * debugLog
 * Bus de eventos para logs de debug. Permite que <DebugConsole /> se suscriba
 * y muestre logs en pantalla en dispositivos sin DevTools (móviles).
 */

const STORAGE_KEY = 'debug_console_enabled'
const MAX_ENTRIES = 500

const listeners = new Set()
const entries = []
let seq = 0

const isEnabled = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

const setEnabled = (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, val ? '1' : '0')
  } catch {}
  emit({ type: 'config', enabled: !!val })
}

const emit = (evt) => {
  listeners.forEach((fn) => {
    try { fn(evt) } catch {}
  })
}

const push = (level, tag, message, data) => {
  const entry = {
    id: ++seq,
    ts: Date.now(),
    level,
    tag: tag || 'app',
    message: String(message ?? ''),
    data: safeClone(data),
  }
  entries.push(entry)
  if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES)
  emit({ type: 'entry', entry })
  // Espejo en consola normal
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  try { fn(`[${entry.tag}] ${entry.message}`, data ?? '') } catch {}
  return entry
}

const safeClone = (v) => {
  if (v === undefined) return undefined
  try {
    return JSON.parse(JSON.stringify(v, (_k, val) => {
      if (val instanceof Error) return { name: val.name, message: val.message, stack: val.stack }
      if (typeof val === 'function') return `[Function ${val.name || 'anon'}]`
      if (val instanceof HTMLElement) {
        return {
          tag: val.tagName,
          id: val.id,
          class: val.className,
          children: val.children?.length,
          rectW: Math.round(val.getBoundingClientRect?.().width || 0),
          rectH: Math.round(val.getBoundingClientRect?.().height || 0),
        }
      }
      return val
    }))
  } catch (e) {
    return { _serializeError: String(e) }
  }
}

const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

const clear = () => {
  entries.length = 0
  emit({ type: 'clear' })
}

const getAll = () => entries.slice()

export const debugLog = {
  log: (tag, msg, data) => push('info', tag, msg, data),
  info: (tag, msg, data) => push('info', tag, msg, data),
  warn: (tag, msg, data) => push('warn', tag, msg, data),
  error: (tag, msg, data) => push('error', tag, msg, data),
  subscribe,
  getAll,
  clear,
  isEnabled,
  setEnabled,
}

export default debugLog
