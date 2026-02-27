/**
 * Buscar Pasajes Page - Estilo Movil Bus
 * Pagina publica de resultados de busqueda de pasajes
 * Ruta: /buscar-pasajes
 *
 * Layout: PublicLayout > Stepper > DateRibbon > Cabecera resultados > Cards viaje
 * Sin hero banner. Fondo claro (bg-gray-50).
 */

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import publicService from '../services/publicService'
import PublicLayout from '../components/layout/PublicLayout'
import {
  BookingStepper,
  DateRibbon,
  TripResultCard,
} from '../components/public'
import { ArrowRight, Check, ChevronDown, Search, Loader2, Users } from 'lucide-react'

const BuscarPasajesPage = () => {
  const [searchParams] = useSearchParams()

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  const [rutas, setRutas] = useState([])
  const [puntos, setPuntos] = useState([])
  const [loading, setLoading] = useState(true)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    const param = searchParams.get('fecha')
    if (param) return param
    const hoy = new Date()
    const y = hoy.getFullYear()
    const m = String(hoy.getMonth() + 1).padStart(2, '0')
    const d = String(hoy.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  })
  const [ordenarPor, setOrdenarPor] = useState('hora')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const origenParam = searchParams.get('origen') || ''
  const destinoParam = searchParams.get('destino') || ''

  // ------------------------------------------------------------------
  // Cargar datos
  // ------------------------------------------------------------------
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        const [rutasRes, puntosRes] = await Promise.all([
          publicService.getRutas(),
          publicService.getPuntos(),
        ])
        setRutas(rutasRes.rutas || [])
        setPuntos(puntosRes.puntos || [])
      } catch (error) {
        console.error('Error cargando datos de busqueda:', error)
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  const getCiudadNombre = (valor) => {
    if (!valor) return ''
    const punto = puntos.find(
      (p) => String(p.id) === valor || p.ciudad?.toLowerCase() === valor.toLowerCase()
    )
    return punto?.ciudad || valor
  }

  const ciudadOrigen = getCiudadNombre(origenParam)
  const ciudadDestino = getCiudadNombre(destinoParam)

  // Filtrar rutas que coincidan con origen y destino
  const rutasFiltradas = useMemo(() => {
    if (!origenParam && !destinoParam) return rutas

    return rutas.filter((ruta) => {
      const matchOrigen = !origenParam || (
        ruta.origen?.ciudad?.toLowerCase() === origenParam.toLowerCase() ||
        String(ruta.origen?.id) === origenParam
      )
      const matchDestino = !destinoParam || (
        ruta.destino?.ciudad?.toLowerCase() === destinoParam.toLowerCase() ||
        String(ruta.destino?.id) === destinoParam
      )
      return matchOrigen && matchDestino
    })
  }, [rutas, origenParam, destinoParam])

  // Generar lista de viajes (una card por cada horario de cada ruta)
  const viajes = useMemo(() => {
    const lista = []

    rutasFiltradas.forEach((ruta) => {
      const horarios = ruta.horarios || []
      if (horarios.length === 0) {
        lista.push({
          id: `${ruta.id}-sin-horario`,
          rutaId: ruta.id,
          tipoServicio: ruta.tipoServicio || 'Ejecutivo',
          horaSalida: '--:--',
          horaLlegada: null,
          duracion: ruta.duracion || null,
          origen: ruta.origen?.ciudad || '',
          destino: ruta.destino?.ciudad || '',
          terminalOrigen: ruta.origen?.direccion || ruta.origen?.nombre || '',
          terminalDestino: ruta.destino?.direccion || ruta.destino?.nombre || '',
          precio: Number(ruta.precioPasaje || 0),
          asientosDisponibles: null,
          escalas: ruta.escalas || null,
          tipoBus: ruta.tipoBus || null,
          tipoAsiento: ruta.tipoAsiento || null,
          tags: ruta.tags || [],
        })
      } else {
        horarios.forEach((horario) => {
          lista.push({
            id: `${ruta.id}-${horario.id}`,
            rutaId: ruta.id,
            horarioId: horario.id,
            tipoServicio: ruta.tipoServicio || 'Ejecutivo',
            horaSalida: horario.hora || horario.horaSalida || '--:--',
            horaLlegada: horario.horaLlegada || null,
            duracion: ruta.duracion || null,
            origen: ruta.origen?.ciudad || '',
            destino: ruta.destino?.ciudad || '',
            terminalOrigen: ruta.origen?.direccion || ruta.origen?.nombre || '',
            terminalDestino: ruta.destino?.direccion || ruta.destino?.nombre || '',
            precio: Number(ruta.precioPasaje || 0),
            asientosDisponibles: horario.capacidadTotal || null,
            escalas: ruta.escalas || null,
            tipoBus: ruta.tipoBus || null,
            tipoAsiento: ruta.tipoAsiento || null,
            tags: ruta.tags || [],
          })
        })
      }
    })

    // Ordenar
    if (ordenarPor === 'hora') {
      lista.sort((a, b) => (a.horaSalida || '').localeCompare(b.horaSalida || ''))
    } else if (ordenarPor === 'precio') {
      lista.sort((a, b) => a.precio - b.precio)
    }

    return lista
  }, [rutasFiltradas, ordenarPor])

  // Opciones de ordenamiento
  const opcionesOrden = [
    { value: 'hora', label: 'Hora de salida' },
    { value: 'precio', label: 'Precio menor' },
  ]
  const ordenLabel = opcionesOrden.find((o) => o.value === ordenarPor)?.label || 'Seleccionar'

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <PublicLayout>
      {/* ============================================================ */}
      {/* STEPPER - 4 pasos horizontales                               */}
      {/* ============================================================ */}
      <section className="bg-white border-b border-gray-200 py-5 sm:py-6">
        <div className="max-w-5xl mx-auto px-4">
          <BookingStepper pasoActual={1} />
        </div>
      </section>

      {/* ============================================================ */}
      {/* DATE RIBBON - Barra de fechas                                */}
      {/* ============================================================ */}
      <section className="bg-primary-900 py-3 sm:py-4">
        <div className="max-w-5xl mx-auto px-4">
          <DateRibbon
            fechaSeleccionada={fechaSeleccionada}
            onFechaChange={setFechaSeleccionada}
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/* CABECERA DE RESULTADOS                                       */}
      {/* ============================================================ */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5">
          {/* Titulo */}
          <h2 className="text-base sm:text-lg font-bold text-secondary-600 mb-2">
            Elige tu viaje de ida
          </h2>

          {/* Info de busqueda + controles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Ruta y pasajeros */}
            <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
              <span>
                Salida:{' '}
                <strong className="text-gray-900">{ciudadOrigen || 'Todas'}</strong>
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>
                Destino:{' '}
                <strong className="text-gray-900">{ciudadDestino || 'Todas'}</strong>
              </span>
              <span className="hidden sm:inline text-gray-300 mx-1">|</span>
              <span className="flex items-center gap-1 text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                Pasajeros: <strong className="text-gray-900">1</strong>
              </span>
            </div>

            {/* Botones de accion */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Modificar busqueda */}
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-secondary-600 border border-secondary-300 rounded-lg px-3 sm:px-4 py-2 hover:bg-secondary-50 transition-colors uppercase tracking-wide"
              >
                <Search className="w-3.5 h-3.5" />
                Modificar busqueda
              </Link>

              {/* Dropdown ordenar */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 bg-white hover:border-gray-400 transition-colors"
                >
                  <span className="hidden sm:inline text-gray-400">Ordenado por:</span>
                  <span className="font-medium text-gray-700">{ordenLabel}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[160px]">
                    {opcionesOrden.map((opcion) => (
                      <button
                        key={opcion.value}
                        onClick={() => {
                          setOrdenarPor(opcion.value)
                          setDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          ordenarPor === opcion.value
                            ? 'bg-secondary-50 text-secondary-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opcion.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* RESULTADOS - Lista de viajes                                 */}
      {/* ============================================================ */}
      <section className="bg-gray-50 py-6 sm:py-8 lg:py-10 min-h-[400px]">
        <div className="max-w-5xl mx-auto px-4">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Buscando viajes disponibles...</p>
            </div>
          )}

          {/* Lista de cards */}
          {!loading && viajes.length > 0 && (
            <>
              {/* Contador de resultados */}
              <p className="text-xs text-gray-400 mb-4">
                {viajes.length} viaje{viajes.length !== 1 ? 's' : ''} encontrado{viajes.length !== 1 ? 's' : ''}
              </p>

              <div className="space-y-4">
                {viajes.map((viaje) => (
                  <TripResultCard
                    key={viaje.id}
                    viaje={viaje}
                    onSelect={() => {
                      // Futuro: navegar a seleccion de asientos
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Sin resultados */}
          {!loading && viajes.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-white rounded-2xl border border-gray-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No se encontraron viajes para esta ruta
              </h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                Intenta con otra fecha u otro destino. Puedes modificar la busqueda
                desde el boton superior.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-500 text-white rounded-full font-semibold text-sm hover:bg-secondary-600 transition-colors shadow-sm uppercase tracking-wide"
              >
                <Search className="w-4 h-4" />
                Nueva busqueda
              </Link>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}

export default BuscarPasajesPage
