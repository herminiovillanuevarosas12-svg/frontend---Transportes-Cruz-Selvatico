/**
 * DebugConsole
 * Panel flotante SIEMPRE visible para inspeccionar logs en dispositivos sin DevTools.
 * Click en el botón "DEBUG" para abrir/cerrar el panel.
 */

import { useEffect, useRef, useState } from 'react'
import debugLog from '../../utils/debugLog'

const LEVEL_COLORS = {
  info: '#22d3ee',
  warn: '#facc15',
  error: '#f87171',
}

const formatTime = (ts) => {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss}.${ms}`
}

export default function DebugConsole() {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState(() => debugLog.getAll())
  const [filter, setFilter] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    const unsub = debugLog.subscribe((evt) => {
      if (evt.type === 'entry') {
        setEntries((prev) => [...prev, evt.entry])
      } else if (evt.type === 'clear') {
        setEntries([])
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [entries.length, open])

  const hasError = entries.some((e) => e.level === 'error' && Date.now() - e.ts < 30000)
  const hasWarn = entries.some((e) => e.level === 'warn' && Date.now() - e.ts < 30000)

  const filtered = filter
    ? entries.filter((e) => {
        const q = filter.toLowerCase()
        return (
          e.tag.toLowerCase().includes(q) ||
          e.message.toLowerCase().includes(q) ||
          (e.data && JSON.stringify(e.data).toLowerCase().includes(q))
        )
      })
    : entries

  const copyAll = async () => {
    const text = entries
      .map((e) => `${formatTime(e.ts)} [${e.level.toUpperCase()}] [${e.tag}] ${e.message}${e.data ? ' ' + JSON.stringify(e.data) : ''}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      debugLog.info('debug-console', 'Logs copiados al portapapeles', { lines: entries.length })
    } catch (err) {
      debugLog.error('debug-console', 'Error copiando logs', { err: String(err) })
    }
  }

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        right: 8,
        bottom: 8,
        zIndex: 2147483647,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }}
    >
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: hasError ? '#7f1d1d' : (hasWarn ? '#78350f' : '#0f172a'),
            color: hasError ? '#fecaca' : (hasWarn ? '#fde68a' : '#22d3ee'),
            border: '1px solid ' + (hasError ? '#dc2626' : '#1e293b'),
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 11,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            opacity: 0.92,
            fontWeight: 700,
          }}
          title="Abrir consola de debug"
        >
          DEBUG ({entries.length})
        </button>
      )}

      {open && (
        <div
          style={{
            width: 'min(420px, 96vw)',
            height: 'min(60vh, 480px)',
            background: '#0f172a',
            color: '#e2e8f0',
            border: '1px solid #1e293b',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 8px',
              borderBottom: '1px solid #1e293b',
            }}
          >
            <strong style={{ fontSize: 12, color: '#22d3ee' }}>DEBUG ({entries.length})</strong>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="filtrar..."
              style={{
                flex: 1,
                background: '#020617',
                border: '1px solid #1e293b',
                color: '#e2e8f0',
                padding: '3px 6px',
                fontSize: 11,
                borderRadius: 4,
                minWidth: 0,
              }}
            />
            <button
              onClick={copyAll}
              style={{ ...btn, background: '#0369a1' }}
              title="Copiar todos los logs"
            >
              Copiar
            </button>
            <button
              onClick={() => debugLog.clear()}
              style={btn}
              title="Limpiar"
            >
              Clear
            </button>
            <button
              onClick={() => setOpen(false)}
              style={btn}
              title="Cerrar"
            >
              ×
            </button>
          </div>

          <div
            ref={listRef}
            style={{
              flex: 1,
              overflow: 'auto',
              padding: 6,
              fontSize: 10.5,
              lineHeight: 1.4,
            }}
          >
            {filtered.length === 0 && (
              <div style={{ color: '#64748b', textAlign: 'center', marginTop: 20 }}>
                sin logs todavía
              </div>
            )}
            {filtered.map((e) => (
              <div key={e.id} style={{ borderBottom: '1px dashed #1e293b', padding: '3px 0' }}>
                <div>
                  <span style={{ color: '#64748b' }}>{formatTime(e.ts)}</span>
                  {' '}
                  <span style={{ color: LEVEL_COLORS[e.level] || '#e2e8f0', fontWeight: 700 }}>
                    [{e.tag}]
                  </span>
                  {' '}
                  <span>{e.message}</span>
                </div>
                {e.data !== undefined && (
                  <div style={{ color: '#94a3b8', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginLeft: 8 }}>
                    {JSON.stringify(e.data, null, 0)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              padding: '4px 8px',
              borderTop: '1px solid #1e293b',
              fontSize: 10,
              color: '#64748b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{entries.length} logs · {filtered.length} mostrados</span>
            <span style={{ color: '#475569' }}>v1</span>
          </div>
        </div>
      )}
    </div>
  )
}

const btn = {
  background: '#1e293b',
  color: '#e2e8f0',
  border: '1px solid #334155',
  padding: '3px 8px',
  fontSize: 11,
  borderRadius: 4,
  cursor: 'pointer',
}
