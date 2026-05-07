/**
 * profiles - Catálogo dinámico de PrinterProfile.
 *
 * Cada perfil describe papel + comportamiento de la impresora para un
 * tipo de rótulo concreto. La capa de adaptadores (tspl/escpos) consume
 * el perfil y emite los comandos correspondientes — sin hardcodeo.
 *
 * Estructura PrinterProfile:
 *   id              identificador estable (compatible con localStorage)
 *   label           texto visible en selector
 *   isDefault       perfil por defecto al cargar el sistema
 *   printerKind     'ticket' | 'label' | 'hybrid'
 *   renderPreset    'compact' | 'responsive' (qué layout dibuja en canvas)
 *   paper:
 *     widthMm                 ancho físico del rollo
 *     widthDotsImprimibles    ancho útil en puntos (a 'dpi')
 *     heightMm                alto físico (null = continuo / dinámico)
 *     dpi                     resolución de la impresora
 *     mode                    'continuous' | 'gap' | 'black-mark'
 *     gapMm                   separación entre etiquetas
 *   margins                   { top, right, bottom, left } en mm
 *   finalFeedMm               avance final permitido (solo aplica a ESC/POS)
 *   cut                       { enabled }
 *   calibrate                 { onConnect } (placeholder por si se requiere)
 *   maxBlankAfterMm           umbral diagnóstico — si el avance final
 *                             supera este valor, se loggea advertencia
 *   tspl                      { includesBarcode, density, speed }
 *
 * IDs preservados desde el catálogo anterior para compatibilidad con
 * `bt_printer_format` ya guardado en localStorage de los usuarios.
 */

export const PRINTER_PROFILES = [
  {
    id: '76x76',
    label: '76 × 76 mm — Rótulo compacto (default)',
    isDefault: true,
    printerKind: 'hybrid',
    renderPreset: 'compact',
    paper: {
      widthMm: 58,
      widthDotsImprimibles: 384,
      heightMm: null,
      dpi: 203,
      mode: 'continuous',
      gapMm: 0,
    },
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    finalFeedMm: 0,
    cut: { enabled: false },
    calibrate: { onConnect: false },
    maxBlankAfterMm: 6,
    tspl: { includesBarcode: true, density: 10, speed: 4 },
  },
  {
    id: '80mm',
    label: '80 mm continuo — Tickets POS',
    printerKind: 'ticket',
    renderPreset: 'responsive',
    paper: {
      widthMm: 80,
      widthDotsImprimibles: 576,
      heightMm: null,
      dpi: 203,
      mode: 'continuous',
      gapMm: 0,
    },
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    finalFeedMm: 8,
    cut: { enabled: true },
    calibrate: { onConnect: false },
    maxBlankAfterMm: 14,
    tspl: { includesBarcode: false, density: 10, speed: 4 },
  },
  {
    id: '58mm',
    label: '58 mm continuo — POS portátil',
    printerKind: 'ticket',
    renderPreset: 'responsive',
    paper: {
      widthMm: 58,
      widthDotsImprimibles: 384,
      heightMm: null,
      dpi: 203,
      mode: 'continuous',
      gapMm: 0,
    },
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    finalFeedMm: 8,
    cut: { enabled: true },
    calibrate: { onConnect: false },
    maxBlankAfterMm: 14,
    tspl: { includesBarcode: false, density: 10, speed: 4 },
  },
  {
    id: '100x150',
    label: '100 × 150 mm — Paquetería estándar',
    printerKind: 'label',
    renderPreset: 'responsive',
    paper: {
      widthMm: 100,
      widthDotsImprimibles: 832,
      heightMm: 150,
      dpi: 203,
      mode: 'gap',
      gapMm: 3,
    },
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    finalFeedMm: 0,
    cut: { enabled: false },
    calibrate: { onConnect: false },
    maxBlankAfterMm: 4,
    tspl: { includesBarcode: false, density: 10, speed: 4 },
  },
  {
    id: '100x70',
    label: '100 × 70 mm — Envío mediano',
    printerKind: 'label',
    renderPreset: 'responsive',
    paper: {
      widthMm: 100,
      widthDotsImprimibles: 832,
      heightMm: 70,
      dpi: 203,
      mode: 'gap',
      gapMm: 3,
    },
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    finalFeedMm: 0,
    cut: { enabled: false },
    calibrate: { onConnect: false },
    maxBlankAfterMm: 4,
    tspl: { includesBarcode: false, density: 10, speed: 4 },
  },
  {
    id: '60x40',
    label: '60 × 40 mm — Inventario',
    printerKind: 'label',
    renderPreset: 'responsive',
    paper: {
      widthMm: 60,
      widthDotsImprimibles: 480,
      heightMm: 40,
      dpi: 203,
      mode: 'gap',
      gapMm: 2,
    },
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    finalFeedMm: 0,
    cut: { enabled: false },
    calibrate: { onConnect: false },
    maxBlankAfterMm: 3,
    tspl: { includesBarcode: false, density: 10, speed: 4 },
  },
  {
    id: '50x30',
    label: '50 × 30 mm — Códigos retail',
    printerKind: 'label',
    renderPreset: 'responsive',
    paper: {
      widthMm: 50,
      widthDotsImprimibles: 400,
      heightMm: 30,
      dpi: 203,
      mode: 'gap',
      gapMm: 2,
    },
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    finalFeedMm: 0,
    cut: { enabled: false },
    calibrate: { onConnect: false },
    maxBlankAfterMm: 3,
    tspl: { includesBarcode: false, density: 10, speed: 4 },
  },
  {
    id: '40x60',
    label: '40 × 60 mm — Logística vertical',
    printerKind: 'label',
    renderPreset: 'responsive',
    paper: {
      widthMm: 40,
      widthDotsImprimibles: 320,
      heightMm: 60,
      dpi: 203,
      mode: 'gap',
      gapMm: 2,
    },
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    finalFeedMm: 0,
    cut: { enabled: false },
    calibrate: { onConnect: false },
    maxBlankAfterMm: 3,
    tspl: { includesBarcode: false, density: 10, speed: 4 },
  },
  {
    id: '40x30',
    label: '40 × 30 mm — Precios',
    printerKind: 'label',
    renderPreset: 'responsive',
    paper: {
      widthMm: 40,
      widthDotsImprimibles: 320,
      heightMm: 30,
      dpi: 203,
      mode: 'gap',
      gapMm: 2,
    },
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    finalFeedMm: 0,
    cut: { enabled: false },
    calibrate: { onConnect: false },
    maxBlankAfterMm: 2,
    tspl: { includesBarcode: false, density: 10, speed: 4 },
  },
]

export const DEFAULT_PROFILE_ID =
  PRINTER_PROFILES.find((p) => p.isDefault)?.id || PRINTER_PROFILES[0]?.id || '76x76'

const PROFILES_BY_ID = PRINTER_PROFILES.reduce((acc, p) => {
  acc[p.id] = p
  return acc
}, {})

export function getProfileById(id) {
  return PROFILES_BY_ID[id] || PROFILES_BY_ID[DEFAULT_PROFILE_ID]
}

export function dotsPerMm(profile) {
  const dpi = profile?.paper?.dpi || 203
  // Convención TSPL térmica estándar: 203 dpi = 8 dots/mm exactos.
  // Para otros DPI, deriva matemáticamente desde 25.4 mm/inch.
  if (dpi === 203) return 8
  if (dpi === 300) return 300 / 25.4
  return dpi / 25.4
}

/**
 * Vista compacta del perfil para componentes de UI legacy que esperaban
 * la forma de PRINT_FORMATS antiguo. NO usar para lógica de impresión.
 */
export function toLegacyShape(profile) {
  if (!profile) return null
  return {
    id: profile.id,
    label: profile.label,
    widthMm: profile.paper.widthMm,
    widthDots: profile.paper.widthDotsImprimibles,
    heightMm: profile.paper.heightMm,
    isLabel: profile.paper.mode !== 'continuous',
    isDefault: !!profile.isDefault,
  }
}

export default { PRINTER_PROFILES, DEFAULT_PROFILE_ID, getProfileById, dotsPerMm, toLegacyShape }
