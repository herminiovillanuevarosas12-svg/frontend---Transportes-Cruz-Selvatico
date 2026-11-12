/**
 * Filtros del listado de encomiendas
 * Barra compacta: cada control ocupa una sola línea con su etiqueta adentro.
 * Los campos con valor se tiñen para ver de un vistazo qué filtros están activos.
 */

import { Search, User, Calendar, ArrowLeftRight, X } from 'lucide-react'

const ESTADOS = [
  { value: 'REGISTRADO', label: 'Registrado' },
  { value: 'EN_ALMACEN', label: 'En almacén' },
  { value: 'EN_RUTA', label: 'En ruta' },
  { value: 'LLEGO_A_DESTINO', label: 'Llegó a destino' },
  { value: 'RETIRADO', label: 'Retirado' }
]

/**
 * Cantidad de filtros con valor
 * @param {Object} filtros
 * @returns {number}
 */
export const contarFiltrosActivos = (filtros) =>
  Object.values(filtros).filter((valor) => valor !== '' && valor !== null && valor !== undefined).length

// Borde y fondo del contenedor según tenga valor; el anillo marca el foco del teclado.
// conFondo = false deja el fondo blanco para que cada mitad (origen / destino) se tiña por separado.
const marco = (activo, conFondo = true) => `
  h-9 rounded-lg border text-sm transition-colors
  focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100
  ${activo ? `border-primary-300 ${conFondo ? 'bg-primary-25' : 'bg-white'}` : 'border-gray-300 bg-white hover:border-gray-400'}
`

// El foco lo muestra el contenedor (focus-within): se anula el anillo global de :focus-visible del control
const sinAnilloPropio = 'focus-visible:ring-0 focus-visible:ring-offset-0'

const control = `h-full min-w-0 flex-1 bg-transparent outline-none text-sm ${sinAnilloPropio}`

// Texto gris mientras el select muestra la opción "Todos"
const colorSelect = (valor) => (valor ? 'text-gray-900 font-medium' : 'text-gray-500')

const Etiqueta = ({ children }) => (
  <span className="pl-3 pr-1 text-xs font-medium text-gray-500 whitespace-nowrap select-none">
    {children}
  </span>
)

const FiltrosEncomiendas = ({ filtros, puntos = [], onChange, onIntercambiarRuta, onLimpiar }) => {
  const activos = contarFiltrosActivos(filtros)
  const hayRuta = Boolean(filtros.idPuntoOrigen || filtros.idPuntoDestino)
  const hayFechas = Boolean(filtros.fechaDesde || filtros.fechaHasta)

  const opcionesPuntos = puntos.map((punto) => (
    <option key={punto.id} value={punto.id}>{punto.nombre}</option>
  ))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-2.5">
      {/* Búsqueda por código */}
      <label className={`${marco(Boolean(filtros.codigoTracking))} flex items-center xl:col-span-3`}>
        <Search className="w-4 h-4 ml-3 mr-2 text-gray-400 shrink-0" aria-hidden="true" />
        <input
          type="text"
          name="codigoTracking"
          value={filtros.codigoTracking}
          onChange={onChange}
          placeholder="Código de rastreo"
          aria-label="Código de rastreo"
          className={`${control} pr-3 text-gray-900 placeholder:text-gray-400`}
        />
      </label>

      {/* Búsqueda por documento */}
      <label className={`${marco(Boolean(filtros.dni))} flex items-center xl:col-span-3`}>
        <User className="w-4 h-4 ml-3 mr-2 text-gray-400 shrink-0" aria-hidden="true" />
        <input
          type="text"
          name="dni"
          value={filtros.dni}
          onChange={onChange}
          placeholder="Doc. remitente o destinatario"
          aria-label="Documento del remitente o del destinatario"
          maxLength={12}
          className={`${control} pr-3 text-gray-900 placeholder:text-gray-400`}
        />
      </label>

      {/* Estado */}
      <label className={`${marco(Boolean(filtros.estado))} flex items-center xl:col-span-2`}>
        <Etiqueta>Estado</Etiqueta>
        <select
          name="estado"
          value={filtros.estado}
          onChange={onChange}
          className={`${control} pr-2 cursor-pointer ${colorSelect(filtros.estado)}`}
        >
          <option value="">Todos</option>
          {ESTADOS.map((estado) => (
            <option key={estado.value} value={estado.value}>{estado.label}</option>
          ))}
        </select>
      </label>

      {/* Rango de fechas de registro */}
      <div className={`${marco(hayFechas)} flex items-center xl:col-span-4`}>
        <Calendar className="w-4 h-4 ml-3 mr-1 text-gray-400 shrink-0" aria-hidden="true" />
        <label className="flex-1 min-w-0 h-full flex">
          <span className="sr-only">Fecha desde</span>
          <input
            type="date"
            name="fechaDesde"
            value={filtros.fechaDesde}
            onChange={onChange}
            max={filtros.fechaHasta || undefined}
            title="Desde"
            className={`${control} px-1.5 ${filtros.fechaDesde ? 'text-gray-900' : 'text-gray-500'}`}
          />
        </label>
        <span className="text-gray-400 px-0.5" aria-hidden="true">–</span>
        <label className="flex-1 min-w-0 h-full flex">
          <span className="sr-only">Fecha hasta</span>
          <input
            type="date"
            name="fechaHasta"
            value={filtros.fechaHasta}
            onChange={onChange}
            min={filtros.fechaDesde || undefined}
            title="Hasta"
            className={`${control} px-1.5 pr-2 ${filtros.fechaHasta ? 'text-gray-900' : 'text-gray-500'}`}
          />
        </label>
      </div>

      {/* Ruta: origen ⇄ destino */}
      <div
        className={`${marco(hayRuta, false)} flex items-stretch overflow-hidden md:col-span-2 xl:col-span-6`}
        role="group"
        aria-label="Ruta"
      >
        <label className={`flex items-center flex-1 min-w-0 ${filtros.idPuntoOrigen ? 'bg-primary-25' : ''}`}>
          <Etiqueta>Origen</Etiqueta>
          <select
            name="idPuntoOrigen"
            value={filtros.idPuntoOrigen}
            onChange={onChange}
            className={`${control} pr-2 cursor-pointer ${colorSelect(filtros.idPuntoOrigen)}`}
          >
            <option value="">Todos</option>
            {opcionesPuntos}
          </select>
        </label>
        <button
          type="button"
          onClick={onIntercambiarRuta}
          disabled={!hayRuta}
          title="Invertir la ruta"
          aria-label="Invertir origen y destino"
          className={`shrink-0 px-2.5 border-x border-gray-200 text-gray-400 transition-colors
            hover:text-primary-700 hover:bg-primary-50 focus-visible:outline-none focus-visible:bg-primary-50
            focus-visible:text-primary-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-400
            ${sinAnilloPropio}`}
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>
        <label className={`flex items-center flex-1 min-w-0 ${filtros.idPuntoDestino ? 'bg-primary-25' : ''}`}>
          <Etiqueta>Destino</Etiqueta>
          <select
            name="idPuntoDestino"
            value={filtros.idPuntoDestino}
            onChange={onChange}
            className={`${control} pr-2 cursor-pointer ${colorSelect(filtros.idPuntoDestino)}`}
          >
            <option value="">Todos</option>
            {opcionesPuntos}
          </select>
        </label>
      </div>

      {/* Limpiar: solo cuando hay algo que limpiar */}
      {activos > 0 && (
        <div className="flex items-center justify-end md:col-span-2 xl:col-span-6">
          <button
            type="button"
            onClick={onLimpiar}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-gray-600
              transition-colors hover:text-gray-900 hover:bg-gray-100
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Limpiar filtros ({activos})
          </button>
        </div>
      )}
    </div>
  )
}

export default FiltrosEncomiendas
