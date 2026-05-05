/**
 * printDiagnostics
 * Listeners globales del subsistema de impresión del navegador.
 * Reporta a debugLog cuándo el navegador entra/sale del modo print y
 * el tiempo transcurrido (sirve para detectar si el SO recibió el trabajo).
 */

import debugLog from './debugLog'

let installed = false

export const installPrintDiagnostics = () => {
  if (installed || typeof window === 'undefined') return
  installed = true

  let beforeAt = 0

  const onBefore = () => {
    beforeAt = performance.now()
    debugLog.info('print:event', 'beforeprint disparado', {
      ua: navigator.userAgent,
      hasOpener: !!window.opener,
      docTitle: document.title,
      bodyW: document.body?.offsetWidth,
      bodyH: document.body?.offsetHeight,
      scrollY: window.scrollY,
    })
  }

  const onAfter = () => {
    const dt = beforeAt ? Math.round(performance.now() - beforeAt) : null
    debugLog.info('print:event', 'afterprint disparado', {
      msInPrint: dt,
      hint: dt !== null && dt < 100 ? 'cancelado o sin diálogo' : 'flujo normal',
    })
    beforeAt = 0
  }

  window.addEventListener('beforeprint', onBefore)
  window.addEventListener('afterprint', onAfter)

  // Cambios de matchMedia('print') = entró/salió de modo render print
  const mq = window.matchMedia?.('print')
  if (mq) {
    const onChange = (e) => {
      debugLog.info('print:media', `matchMedia('print') = ${e.matches}`, {
        matches: e.matches,
      })
    }
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else if (mq.addListener) mq.addListener(onChange)
  }

  debugLog.info('print:setup', 'Listeners de impresión instalados', {
    hasMatchMedia: !!mq,
    onLine: navigator.onLine,
  })
}

export default installPrintDiagnostics
