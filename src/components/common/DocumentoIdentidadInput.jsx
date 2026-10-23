/**
 * DocumentoIdentidadInput Component
 * Selector de tipo de documento (DNI, CE, RUC) + número.
 * Normaliza lo escrito según el tipo y alterna DNI/RUC por cantidad de dígitos.
 *
 * Emite onChange({ tipo, numero }) con el número ya normalizado.
 * `tipos` limita los documentos que se ofrecen (por defecto, todos).
 */

import {
  TIPOS_DOCUMENTO,
  obtenerTipoDocumento,
  normalizarDocumento,
  ajustarTipoPorNumero
} from '../../utils/documentoIdentidad'

const COLORES = {
  blue: { anillo: 'focus:ring-blue-500', spinner: 'border-blue-500' },
  purple: { anillo: 'focus:ring-purple-500', spinner: 'border-purple-500' },
  orange: { anillo: 'focus:ring-orange-500', spinner: 'border-orange-500' }
}

const DocumentoIdentidadInput = ({
  name,
  tipo,
  numero,
  onChange,
  buscando = false,
  color = 'blue',
  label = 'Documento *',
  tipos = TIPOS_DOCUMENTO
}) => {
  const colores = COLORES[color] || COLORES.blue
  const definicion = obtenerTipoDocumento(tipo)
  const claseCampo = `px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 ${colores.anillo} focus:border-transparent outline-none`

  const handleTipo = (e) => {
    const nuevoTipo = e.target.value
    onChange({ tipo: nuevoTipo, numero: normalizarDocumento(nuevoTipo, numero) })
  }

  const handleNumero = (e) => {
    const numeroLimpio = normalizarDocumento(tipo, e.target.value)
    const tipoAjustado = ajustarTipoPorNumero(tipo, numeroLimpio)
    // Solo se alterna a un tipo que este campo ofrece
    const tipoFinal = tipos.some(t => t.codigo === tipoAjustado) ? tipoAjustado : tipo
    onChange({ tipo: tipoFinal, numero: numeroLimpio })
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          name={`${name}TipoDoc`}
          value={definicion.codigo}
          onChange={handleTipo}
          aria-label="Tipo de documento"
          className={`${claseCampo} w-24 shrink-0 bg-white`}
        >
          {tipos.map(t => (
            <option key={t.codigo} value={t.codigo} title={t.nombre}>
              {t.sigla}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <input
            type="text"
            name={name}
            value={numero}
            onChange={handleNumero}
            placeholder={definicion.placeholder}
            inputMode={definicion.alfanumerico ? 'text' : 'numeric'}
            autoCapitalize="characters"
            className={`${claseCampo} w-full`}
          />
          {buscando && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className={`w-4 h-4 border-2 ${colores.spinner} border-t-transparent rounded-full animate-spin`} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentoIdentidadInput
