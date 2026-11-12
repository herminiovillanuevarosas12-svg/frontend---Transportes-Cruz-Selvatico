/**
 * Texto que se edita en el lugar: clic para editar, Enter (Ctrl+Enter en multilínea) o ✓ guarda,
 * Esc o ✗ cancela. Si onGuardar falla, sigue en edición para reintentar.
 */

import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'

const TextoEditable = ({
  valor,
  onGuardar,
  multilinea = false,
  obligatorio = false,
  placeholder = '',
  editandoInicial = false,
  onCancelar,
  className = '',
}) => {
  const [editando, setEditando] = useState(editandoInicial)
  const [texto, setTexto] = useState(valor || '')
  const [guardando, setGuardando] = useState(false)
  const campoRef = useRef(null)

  useEffect(() => {
    if (!editando) setTexto(valor || '')
  }, [valor, editando])

  useEffect(() => {
    if (editando) campoRef.current?.focus()
  }, [editando])

  const limpio = texto.trim()
  const invalido = obligatorio && !limpio

  const cancelar = () => {
    setTexto(valor || '')
    setEditando(false)
    onCancelar?.()
  }

  const guardar = async () => {
    if (invalido || guardando) return
    if (limpio === (valor || '').trim()) {
      setEditando(false)
      return
    }
    setGuardando(true)
    try {
      await onGuardar(limpio)
      setEditando(false)
    } catch {
      // El editor ya mostró el error; se mantiene la edición para reintentar
    } finally {
      setGuardando(false)
    }
  }

  const alPresionarTecla = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      cancelar()
    } else if (e.key === 'Enter' && (!multilinea || e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      guardar()
    }
  }

  if (!editando) {
    return (
      <button
        type="button"
        onClick={() => setEditando(true)}
        title="Clic para editar"
        className={`block w-full text-left rounded-md outline-dashed outline-2 outline-offset-4 outline-transparent hover:outline-secondary-300 transition-[outline-color] ${className}`}
      >
        {valor || <span className="italic text-gray-400 font-normal">{placeholder}</span>}
      </button>
    )
  }

  const propsCampo = {
    ref: campoRef,
    value: texto,
    onChange: (e) => setTexto(e.target.value),
    onKeyDown: alPresionarTecla,
    placeholder,
    disabled: guardando,
    className: `w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-400 ${className}`,
  }

  return (
    <div className="flex items-start gap-2">
      {multilinea ? <textarea rows={4} {...propsCampo} /> : <input type="text" {...propsCampo} />}
      <div className="flex flex-col gap-1 shrink-0">
        <button
          type="button"
          onClick={guardar}
          disabled={invalido || guardando}
          aria-label="Guardar"
          title={multilinea ? 'Guardar (Ctrl+Enter)' : 'Guardar (Enter)'}
          className="w-8 h-8 rounded-lg bg-secondary-500 text-white flex items-center justify-center hover:bg-secondary-600 disabled:opacity-40"
        >
          {guardando ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          onClick={cancelar}
          disabled={guardando}
          aria-label="Cancelar"
          title="Cancelar (Esc)"
          className="w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-500 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default TextoEditable
