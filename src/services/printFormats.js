/**
 * printFormats
 * Catálogo de formatos de impresión térmica disponibles para el rótulo.
 * El formato '76x76' es el DEFAULT y conserva el comportamiento original
 * (no se altera lo que ya funciona). El resto son formatos adicionales.
 *
 * Campos:
 *   id          identificador interno
 *   label       texto en el selector
 *   widthMm     ancho del papel (lo que se manda a SIZE en TSPL)
 *   widthDots   ancho útil imprimible típico para ese papel a 203 dpi
 *   heightMm    altura fija de etiqueta. null = altura dinámica (rollo continuo)
 *   isLabel     true si es etiqueta con gap; false si es rollo continuo
 *   isDefault   true para el formato actual (no tocar)
 */

export const PRINT_FORMATS = [
  {
    id: '76x76',
    label: '76 × 76 mm — Rótulo compacto (default)',
    widthMm: 58,
    widthDots: 384,
    heightMm: null,
    isLabel: true,
    isDefault: true,
  },
  {
    id: '80mm',
    label: '80 mm continuo — Tickets POS',
    widthMm: 80,
    widthDots: 576,
    heightMm: null,
    isLabel: false,
  },
  {
    id: '58mm',
    label: '58 mm continuo — POS portátil',
    widthMm: 58,
    widthDots: 384,
    heightMm: null,
    isLabel: false,
  },
  {
    id: '100x150',
    label: '100 × 150 mm — Paquetería estándar',
    widthMm: 100,
    widthDots: 832,
    heightMm: 150,
    isLabel: true,
  },
  {
    id: '100x70',
    label: '100 × 70 mm — Envío mediano',
    widthMm: 100,
    widthDots: 832,
    heightMm: 70,
    isLabel: true,
  },
  {
    id: '60x40',
    label: '60 × 40 mm — Inventario',
    widthMm: 60,
    widthDots: 480,
    heightMm: 40,
    isLabel: true,
  },
  {
    id: '50x30',
    label: '50 × 30 mm — Códigos retail',
    widthMm: 50,
    widthDots: 400,
    heightMm: 30,
    isLabel: true,
  },
  {
    id: '40x60',
    label: '40 × 60 mm — Logística vertical',
    widthMm: 40,
    widthDots: 320,
    heightMm: 60,
    isLabel: true,
  },
  {
    id: '40x30',
    label: '40 × 30 mm — Precios',
    widthMm: 40,
    widthDots: 320,
    heightMm: 30,
    isLabel: true,
  },
]

export const FORMATS_BY_ID = PRINT_FORMATS.reduce((acc, f) => {
  acc[f.id] = f
  return acc
}, {})

export const DEFAULT_FORMAT_ID = '76x76'

export function getFormatById(id) {
  return FORMATS_BY_ID[id] || FORMATS_BY_ID[DEFAULT_FORMAT_ID]
}

export default { PRINT_FORMATS, FORMATS_BY_ID, DEFAULT_FORMAT_ID, getFormatById }
