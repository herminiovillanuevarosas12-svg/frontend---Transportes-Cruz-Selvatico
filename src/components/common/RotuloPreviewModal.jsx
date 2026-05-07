/**
 * RotuloPreviewModal
 * Modal de previsualización del rótulo antes de imprimir.
 * Permite seleccionar el formato y muestra el canvas exacto que se enviará a la impresora BT.
 */

import { useEffect, useRef, useState } from 'react'
import { Printer, Loader2 } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import bluetoothPrinter from '../../services/bluetoothPrinter'
import { PRINTER_PROFILES } from '../../services/printing/profiles'

const PREVIEW_MAX_WIDTH = 320

export default function RotuloPreviewModal({ isOpen, onClose, encomienda, onPrint, btConnected, deviceName }) {
  const [formatId, setFormatId] = useState(() => bluetoothPrinter.getFormat())
  const [rendering, setRendering] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [error, setError] = useState(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })
  const containerRef = useRef(null)

  // Sincronizar formato local con el global cuando se abre
  useEffect(() => {
    if (isOpen) {
      setFormatId(bluetoothPrinter.getFormat())
      setError(null)
    }
  }, [isOpen])

  // Re-renderizar el preview cuando cambia formato o se abre
  useEffect(() => {
    if (!isOpen || !encomienda) return
    let cancelled = false
    setRendering(true)
    setError(null)

    bluetoothPrinter
      .renderPreviewCanvas(encomienda, formatId)
      .then((canvas) => {
        if (cancelled || !containerRef.current) return
        containerRef.current.innerHTML = ''
        const ratio = Math.min(1, PREVIEW_MAX_WIDTH / canvas.width)
        const dispW = Math.round(canvas.width * ratio)
        const dispH = Math.round(canvas.height * ratio)
        canvas.style.width = dispW + 'px'
        canvas.style.height = dispH + 'px'
        canvas.style.imageRendering = 'pixelated'
        canvas.style.display = 'block'
        canvas.style.margin = '0 auto'
        containerRef.current.appendChild(canvas)
        setDims({ w: canvas.width, h: canvas.height })
        setRendering(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Error generando preview')
        setRendering(false)
      })

    return () => { cancelled = true }
  }, [isOpen, encomienda, formatId])

  const handleFormatChange = (e) => {
    const id = e.target.value
    setFormatId(id)
    bluetoothPrinter.setFormat(id)
  }

  const handleImprimir = async () => {
    if (!onPrint) return
    setPrinting(true)
    setError(null)
    try {
      await onPrint()
      onClose()
    } catch (err) {
      setError(err?.message || 'Error al imprimir')
    } finally {
      setPrinting(false)
    }
  }

  const profile = PRINTER_PROFILES.find((p) => p.id === formatId) || PRINTER_PROFILES[0]
  const fmt = {
    widthMm: profile.paper.widthMm,
    heightMm: profile.paper.heightMm,
    widthDots: profile.paper.widthDotsImprimibles,
    isLabel: profile.paper.mode !== 'continuous',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vista previa del rótulo"
      description={btConnected
        ? `Se enviará a impresora Bluetooth: ${deviceName || ''}`
        : 'Sin impresora Bluetooth conectada — se usará impresión del sistema'}
      size="md"
      icon={Printer}
      iconColor={btConnected ? 'success' : 'warning'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={printing}>
            Cancelar
          </Button>
          <Button
            icon={printing ? Loader2 : Printer}
            onClick={handleImprimir}
            disabled={rendering || printing || !encomienda}
          >
            {printing ? 'Imprimiendo...' : 'Imprimir rótulo'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Formato de impresión
          </label>
          <select
            value={formatId}
            onChange={handleFormatChange}
            disabled={printing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none"
          >
            {PRINTER_PROFILES.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
          <div className="mt-1 text-xs text-gray-500">
            Papel: {fmt.widthMm}mm{fmt.heightMm ? ` × ${fmt.heightMm}mm` : ' continuo'} · {fmt.isLabel ? 'Adhesiva' : 'Rollo'} · {fmt.widthDots} dots útiles
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Vista previa {dims.w ? `(${dims.w}×${dims.h} dots)` : ''}
          </label>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex items-center justify-center min-h-[180px]">
            {rendering && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando preview...
              </div>
            )}
            {error && !rendering && (
              <div className="text-error-600 text-sm">{error}</div>
            )}
            <div
              ref={containerRef}
              style={{ display: rendering || error ? 'none' : 'block' }}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
