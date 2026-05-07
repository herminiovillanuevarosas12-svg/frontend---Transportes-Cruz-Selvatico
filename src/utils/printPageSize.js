/**
 * printPageSize
 * Inyecta un <style> con @page size correcto antes de window.print().
 * Necesario porque @page named (CSS) es ignorado por Chrome Android,
 * que cae a "Carta" cuando no encuentra el size global.
 *
 * Acepta:
 *   - target string: 'ticket' | 'comprobante' | 'guia' | 'carta' | 'a4'
 *   - objeto { widthMm, heightMm? } para tamaños dinámicos (rótulos)
 *   - null/undefined: limpia el estilo
 */

import debugLog from './debugLog'

const STYLE_ID = 'dynamic-print-page-style'

const STATIC_SIZES = {
  rotulo: '76mm 76mm',
  ticket: '80mm auto',
  comprobante: '80mm auto',
  guia: '80mm auto',
  carta: 'Letter',
  a4: 'A4',
}

function resolveSize(target) {
  if (!target) return null
  if (typeof target === 'object') {
    const w = Number(target.widthMm)
    if (!w || !Number.isFinite(w)) return null
    const h = target.heightMm
    if (h && Number.isFinite(Number(h))) return `${w}mm ${Number(h)}mm`
    return `${w}mm auto`
  }
  return STATIC_SIZES[target] || target
}

export function setPrintPageSize(target) {
  if (typeof document === 'undefined') return
  let el = document.getElementById(STYLE_ID)
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    el.setAttribute('media', 'print')
    document.head.appendChild(el)
  }
  if (!target) {
    el.textContent = ''
    debugLog.info('print:page', 'Page size limpiado', {})
    return
  }
  const size = resolveSize(target)
  if (!size) {
    el.textContent = ''
    debugLog.warn('print:page', 'Page size inválido — ignorado', { target })
    return
  }
  el.textContent = `
@page { size: ${size} !important; margin: 0 !important; }
@page rotulo-encomienda { size: ${size} !important; margin: 0 !important; }
@page guia-encomienda { size: ${size} !important; margin: 0 !important; }
`.trim()
  debugLog.info('print:page', 'Page size aplicado', { target, size })
}

export function clearPrintPageSize() {
  setPrintPageSize(null)
}

export default { setPrintPageSize, clearPrintPageSize }
