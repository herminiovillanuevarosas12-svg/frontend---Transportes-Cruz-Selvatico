/**
 * Planificar Viaje Page - Planificador multi-tramo
 * Ruta: /planificar-viaje
 *
 * Layout 2 columnas (desktop): izq=formularios, der=resumen sticky
 * Mobile: resumen como acordeon al pie
 */

import { useState, useEffect } from 'react'
import { Loader2, Route } from 'lucide-react'
import publicService from '../services/publicService'
import PublicLayout from '../components/layout/PublicLayout'
import { usePlanificadorStore } from '../features/planificador/planificadorStore'
import TramoForm from '../components/planificador/TramoForm'
import PlanificadorStepper from '../components/planificador/PlanificadorStepper'
import ResumenPanel from '../components/planificador/ResumenPanel'
import PantallaResumenFinal from '../components/planificador/PantallaResumenFinal'

const PlanificarViajePage = () => {
  const [loading, setLoading] = useState(true)
  const {
    tramos,
    fase,
    setDatosIniciales,
    getTramoActivo,
    reset,
  } = usePlanificadorStore()

  // Cargar datos al montar
  useEffect(() => {
    const cargar = async () => {
      try {
        const [rutasRes, puntosRes, configRes] = await Promise.all([
          publicService.getRutas(),
          publicService.getPuntos(),
          publicService.getConfigLanding().catch(() => ({ config: {} })),
        ])
        setDatosIniciales(
          rutasRes.rutas || [],
          puntosRes.puntos || [],
          configRes.config || {}
        )
      } catch (error) {
        console.error('Error cargando datos del planificador:', error)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [setDatosIniciales])

  // Reset al desmontar
  useEffect(() => {
    return () => reset()
  }, [reset])

  const tramoActivo = getTramoActivo()

  return (
    <PublicLayout>
      {/* Hero minimalista */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-900 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Route className="w-6 h-6 text-secondary-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Planifica tu viaje
            </h1>
          </div>
          <p className="text-primary-200 text-sm max-w-lg mx-auto">
            Arma tu itinerario con multiples tramos, cotiza el total y descarga tu plan de viaje.
          </p>
        </div>
      </section>

      {/* Stepper */}
      {fase === 'planificando' && tramos.length > 1 && (
        <section className="bg-white border-b border-gray-200 py-5">
          <div className="max-w-5xl mx-auto px-4">
            <PlanificadorStepper tramos={tramos} tramoActivoId={tramoActivo?.id} />
          </div>
        </section>
      )}

      {/* Contenido principal */}
      <section className="bg-gray-50 py-6 sm:py-8 min-h-[500px]">
        <div className="max-w-5xl mx-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Cargando datos...</p>
            </div>
          ) : fase === 'resumen-final' ? (
            <PantallaResumenFinal />
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Columna izquierda: formularios */}
              <div className="flex-1 space-y-4 lg:pb-32">
                {tramos.map((tramo, i) => (
                  <TramoForm
                    key={tramo.id}
                    tramo={tramo}
                    indice={i}
                    esActivo={tramoActivo?.id === tramo.id}
                    esUltimo={i === tramos.length - 1}
                    totalTramos={tramos.length}
                  />
                ))}
              </div>

              {/* Columna derecha: resumen sticky */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="lg:sticky lg:top-36">
                  <ResumenPanel tramos={tramos} />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}

export default PlanificarViajePage
