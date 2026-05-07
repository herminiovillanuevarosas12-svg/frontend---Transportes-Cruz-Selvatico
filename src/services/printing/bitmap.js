/**
 * bitmap - Raster Canvas → bitmap monocromo 1 bit/pixel.
 * Convención TSPL: 0 = imprime negro, 1 = papel blanco. MSB first.
 */

export function canvasToBitmap1bpp(canvas) {
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
        const byteIdx = y * widthBytes + (x >> 3)
        const bitIdx = 7 - (x & 7)
        out[byteIdx] &= ~(1 << bitIdx)
      }
    }
  }
  return { bytes: out, widthBytes, height: h }
}

export default { canvasToBitmap1bpp }
