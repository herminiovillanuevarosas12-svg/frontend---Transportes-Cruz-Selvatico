/**
 * printPageSize
 * Inyecta un <style> con @page size correcto antes de window.print().
 * Necesario porque @page named (CSS) es ignorado por Chrome Android,
 * que cae a "Carta" cuando no encuentra el size global.
 */

import debugLog from './debugLog'

const STYLE_ID = 'dynamic-print-page-style'

const SIZES = {
  rotulo: '76mm 76mm',
  ticket: '80mm auto',
  comprobante: '80mm auto',
  guia: '80mm auto',
  carta: 'Letter',
  a4: 'A4',
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
  const size = SIZES[target] || target
  // !important + override de @page named para forzar el tamaño en Android Chrome
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
