/**
 * ClienteBoletaFields Component
 * Sección "Datos del Cliente (Boleta)": tipo de documento (DNI, CE, RUC o Sin documento),
 * número con búsqueda en RENIEC (DNI) o SUNAT (RUC), nombre o razón social y dirección.
 *
 * - Sin documento: los datos se escriben a mano. El nombre es opcional (va "CLIENTES VARIOS")
 *   y solo se permite si el total no pasa de S/ 700 (SUNAT).
 * - Al aparecer (cuando se elige Boleta) y si está vacío, toma los datos de `sugerido`
 *   (pasajero, remitente o quien retira); el botón "Usar datos del ..." los vuelve a copiar.
 *
 * `value` = { tipoDoc, numDoc, razonSocial, direccion }; onChange recibe el objeto completo.
 */

import { useEffect, useRef, useState } from 'react'
import { Receipt, AlertCircle, UserCheck } from 'lucide-react'
import useDocLookup from '../../hooks/useDocLookup'
import {
  CODIGO_RUC,
  obtenerTipoDocumento,
  normalizarDocumento,
  esDocumentoValido
} from '../../utils/documentoIdentidad'
import {
  TIPOS_CLIENTE_BOLETA,
  NOMBRE_SIN_DOCUMENTO,
  MONTO_MAXIMO_SIN_DOCUMENTO,
  esSinDocumento,
  sinDocumentoPermitido
} from '../../utils/clienteBoleta'

const CLASE_CAMPO = 'w-full px-3 py-2 border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none text-sm'
const CLASE_SOLO_LECTURA = 'bg-gray-100 cursor-not-allowed'

const mismoCliente = (a, b) =>
  Boolean(a && b) && a.tipoDoc === b.tipoDoc && a.numDoc === b.numDoc && a.razonSocial === b.razonSocial

const ClienteBoletaFields = ({ value, onChange, total, sugerido = null, etiquetaSugerido = 'pasajero' }) => {
  const { loading: buscando, consultarDocumento, obtenerErrorServicio, reset: resetLookup } = useDocLookup()
  const [aviso, setAviso] = useState('')
  // Número vigente: descarta respuestas de búsquedas de un número que ya se cambió
  const numeroVigenteRef = useRef(value.numDoc)

  // Al mostrarse vacío, partir de los datos de la persona del flujo
  useEffect(() => {
    const vacio = !value.numDoc && !value.razonSocial && !esSinDocumento(value.tipoDoc)
    if (vacio && sugerido) {
      numeroVigenteRef.current = sugerido.numDoc
      onChange(sugerido)
    }
    // Solo al montar: después, el usuario decide con el botón "Usar datos del ..."
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sinDocumento = esSinDocumento(value.tipoDoc)
  const esRuc = value.tipoDoc === CODIGO_RUC
  const definicion = sinDocumento ? null : obtenerTipoDocumento(value.tipoDoc)
  const sinDocumentoBloqueado = !sinDocumentoPermitido(total)

  const handleTipo = (tipoDoc) => {
    if (tipoDoc === value.tipoDoc) return
    resetLookup()
    setAviso('')
    numeroVigenteRef.current = ''
    onChange({ tipoDoc, numDoc: '', razonSocial: '', direccion: '' })
  }

  const handleNumero = async (e) => {
    const tipoDoc = value.tipoDoc
    const numDoc = normalizarDocumento(tipoDoc, e.target.value).slice(0, definicion.maximo)
    numeroVigenteRef.current = numDoc
    setAviso('')

    // DNI y RUC se autocompletan: al cambiar el número se descartan los datos anteriores.
    // El carnet de extranjería no tiene consulta: se conserva lo escrito a mano.
    onChange(definicion.consultaApi
      ? { tipoDoc, numDoc, razonSocial: '', direccion: '' }
      : { ...value, numDoc })

    if (!definicion.consultaApi || !esDocumentoValido(tipoDoc, numDoc)) return

    const resultado = await consultarDocumento(numDoc, false, tipoDoc)
    if (numeroVigenteRef.current !== numDoc) return // se siguió escribiendo

    if (resultado) {
      onChange({
        tipoDoc,
        numDoc,
        razonSocial: resultado.razon_social || resultado.nombre_completo || '',
        direccion: resultado.direccion || ''
      })
    } else {
      setAviso(obtenerErrorServicio() || (tipoDoc === CODIGO_RUC
        ? 'RUC no encontrado en SUNAT. Verifique que el número sea correcto.'
        : 'DNI no encontrado. Escriba el nombre manualmente.'))
    }
  }

  const usarSugerido = () => {
    resetLookup()
    setAviso('')
    numeroVigenteRef.current = sugerido.numDoc
    onChange(sugerido)
  }

  return (
    <div className="bg-sky-50 rounded-lg p-4 border border-sky-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-medium text-sky-800">Datos del Cliente (Boleta)</span>
        </div>
        {sugerido && !mismoCliente(sugerido, value) && (
          <button
            type="button"
            onClick={usarSugerido}
            className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-900 underline"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Usar datos del {etiquetaSugerido}
          </button>
        )}
      </div>

      {/* Tipo de documento */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Tipo de documento del cliente">
        {TIPOS_CLIENTE_BOLETA.map(tipo => {
          const activo = value.tipoDoc === tipo.codigo
          const bloqueado = esSinDocumento(tipo.codigo) && sinDocumentoBloqueado && !activo
          return (
            <button
              key={tipo.codigo}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => handleTipo(tipo.codigo)}
              disabled={bloqueado}
              title={bloqueado ? `Solo para boletas de hasta S/ ${MONTO_MAXIMO_SIN_DOCUMENTO}` : tipo.nombre}
              className={`px-2 py-2 rounded-lg border-2 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                activo
                  ? 'border-sky-500 bg-white text-sky-700'
                  : 'border-sky-100 bg-white/60 text-gray-600 hover:border-sky-300'
              }`}
            >
              {tipo.sigla}
            </button>
          )
        })}
      </div>

      {sinDocumento && sinDocumentoBloqueado && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          El total supera S/ {MONTO_MAXIMO_SIN_DOCUMENTO}: SUNAT exige identificar al cliente con DNI, CE o RUC.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Número de documento (no aplica sin documento) */}
        {!sinDocumento && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">{definicion.nombre} *</label>
            <div className="relative">
              <input
                type="text"
                value={value.numDoc}
                onChange={handleNumero}
                placeholder={definicion.placeholder}
                maxLength={definicion.maximo}
                inputMode={definicion.alfanumerico ? 'text' : 'numeric'}
                autoCapitalize="characters"
                className={CLASE_CAMPO}
              />
              {buscando && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {aviso ? (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {aviso}
              </p>
            ) : definicion.consultaApi && (
              <p className="text-xs text-gray-500 mt-1">
                Se busca en {esRuc ? 'SUNAT' : 'RENIEC'} al completar el número
              </p>
            )}
          </div>
        )}

        {/* Nombre o razón social */}
        <div className={sinDocumento ? 'md:col-span-2' : ''}>
          <label className="block text-xs text-gray-600 mb-1">
            {esRuc ? 'Razón Social *' : sinDocumento ? 'Nombre (opcional)' : 'Nombre Completo *'}
          </label>
          <input
            type="text"
            value={value.razonSocial}
            onChange={(e) => onChange({ ...value, razonSocial: e.target.value })}
            readOnly={esRuc}
            placeholder={esRuc ? 'Se autocompleta con el RUC' : sinDocumento ? NOMBRE_SIN_DOCUMENTO : 'Nombre del cliente'}
            maxLength={200}
            className={`${CLASE_CAMPO} ${esRuc ? CLASE_SOLO_LECTURA : ''}`}
          />
          {sinDocumento && (
            <p className="text-xs text-gray-500 mt-1">
              Si lo deja vacío, la boleta sale a nombre de {NOMBRE_SIN_DOCUMENTO}. Solo para boletas de hasta S/ {MONTO_MAXIMO_SIN_DOCUMENTO}.
            </p>
          )}
        </div>

        {/* Dirección (opcional en boletas) */}
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">
            {esRuc ? 'Dirección Fiscal' : 'Dirección (opcional)'}
          </label>
          <input
            type="text"
            value={value.direccion}
            onChange={(e) => onChange({ ...value, direccion: e.target.value })}
            readOnly={esRuc}
            placeholder={esRuc ? 'Se autocompleta con el RUC' : 'Dirección del cliente'}
            maxLength={300}
            className={`${CLASE_CAMPO} ${esRuc ? CLASE_SOLO_LECTURA : ''}`}
          />
        </div>
      </div>
    </div>
  )
}

export default ClienteBoletaFields
