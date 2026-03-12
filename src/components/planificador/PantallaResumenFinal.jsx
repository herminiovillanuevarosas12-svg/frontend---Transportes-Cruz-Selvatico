/**
 * PantallaResumenFinal - Vista completa del itinerario
 * Tabla de tramos, total, botones: PDF, WhatsApp, Planificar otro, Volver a editar
 */

import { FileDown, MessageCircle, RotateCcw, ArrowLeft, MapPin, Calendar, Users, Clock } from 'lucide-react'
import { usePlanificadorStore } from '../../features/planificador/planificadorStore'
import {
  formatearFecha,
  formatearHora,
  formatearPrecio,
  calcularSubtotal,
  calcularTotal,
  generarTextoWhatsApp,
} from '../../features/planificador/helpers'
import { generarPDF } from './itinerarioPDF'

const PantallaResumenFinal = () => {
  const { tramos, volverAPlanificar, reset, configCache } = usePlanificadorStore()
  const completados = tramos.filter(t => t.completado && t.horarioSeleccionado)
  const total = calcularTotal(tramos)
  const nombreEmpresa = configCache?.nombreEmpresa || 'Transporte'
  const whatsapp = configCache?.whatsapp || ''

  const handleDescargarPDF = async () => {
    await generarPDF(tramos, nombreEmpresa)
  }

  const handleWhatsApp = () => {
    const texto = generarTextoWhatsApp(tramos, total, nombreEmpresa)
    const numero = whatsapp.replace(/\D/g, '')
    window.open(`https://wa.me/${numero}?text=${texto}`, '_blank')
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Tu itinerario de viaje
        </h2>
        <p className="text-gray-500 text-sm">
          {completados.length} tramo{completados.length !== 1 ? 's' : ''} · Cotizacion referencial
        </p>
      </div>

      {/* Tabla de tramos */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        {completados.map((tramo, i) => (
          <div
            key={tramo.id}
            className={`p-4 sm:p-5 ${i < completados.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-secondary-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 truncate">
                    {tramo.origen} → {tramo.destino}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatearFecha(tramo.fecha)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {formatearHora(tramo.horarioSeleccionado?.hora)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    {tramo.pasajeros} pasajero{tramo.pasajeros !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">
                  {formatearPrecio(tramo.horarioSeleccionado?.precio)} x {tramo.pasajeros}
                </p>
                <p className="text-lg font-bold text-secondary-600">
                  {formatearPrecio(calcularSubtotal(tramo))}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="bg-primary-50 px-4 sm:px-5 py-4 flex items-center justify-between">
          <span className="text-base font-bold text-primary-900">Total estimado</span>
          <span className="text-xl font-bold text-secondary-600">{formatearPrecio(total)}</span>
        </div>
      </div>

      {/* Nota */}
      <p className="text-xs text-gray-400 text-center mb-6">
        * Precios referenciales sujetos a disponibilidad. Contactenos para confirmar su reserva.
      </p>

      {/* Botones de accion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleDescargarPDF}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Descargar PDF
        </button>
        {whatsapp && (
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Contactar por WhatsApp
          </button>
        )}
        <button
          onClick={volverAPlanificar}
          className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a editar
        </button>
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-secondary-300 text-secondary-600 rounded-xl font-semibold text-sm hover:bg-secondary-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Planificar otro viaje
        </button>
      </div>
    </div>
  )
}

export default PantallaResumenFinal
