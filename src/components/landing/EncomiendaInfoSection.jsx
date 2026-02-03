/**
 * EncomiendaInfoSection - Seccion informativa de encomiendas
 * Muestra beneficios del servicio de encomiendas con CTA para tracking
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Clock,
  MapPin,
  Package,
  Bell,
  DollarSign,
  Search,
  ArrowRight
} from 'lucide-react'

const beneficios = [
  {
    icon: Shield,
    titulo: 'Seguro Incluido',
    descripcion: 'Todos tus envios estan protegidos'
  },
  {
    icon: Clock,
    titulo: 'Puntualidad',
    descripcion: 'Cumplimos con los tiempos de entrega'
  },
  {
    icon: MapPin,
    titulo: 'Tracking en Vivo',
    descripcion: 'Sigue tu envio en tiempo real'
  },
  {
    icon: Package,
    titulo: 'Cuidado Especial',
    descripcion: 'Manipulamos con cuidado tu carga'
  },
  {
    icon: Bell,
    titulo: 'Notificaciones',
    descripcion: 'Te avisamos cada cambio de estado'
  },
  {
    icon: DollarSign,
    titulo: 'Precios Justos',
    descripcion: 'Tarifas competitivas del mercado'
  }
]

const EncomiendaInfoSection = () => {
  const navigate = useNavigate()
  const [codigoTracking, setCodigoTracking] = useState('')

  const handleTracking = (e) => {
    e.preventDefault()
    if (codigoTracking.trim()) {
      navigate(`/tracking/${codigoTracking.trim()}`)
    }
  }

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900" />

      {/* Patron decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Titulo */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Envia tus Encomiendas con Nosotros
          </h2>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            Servicio confiable de envio de paquetes, sobres y carga a todos nuestros destinos
          </p>
        </div>

        {/* Grid de beneficios */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {beneficios.map((beneficio, index) => {
            const Icon = beneficio.icon

            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-5 md:p-6 border border-white/20 hover:bg-white/20 transition-colors duration-300"
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {beneficio.titulo}
                </h3>
                <p className="text-sm text-primary-100">
                  {beneficio.descripcion}
                </p>
              </div>
            )
          })}
        </div>

        {/* Seccion de tracking */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              Rastrea tu Encomienda
            </h3>
            <p className="text-primary-100">
              Ingresa el codigo de tu envio para ver su estado actual
            </p>
          </div>

          <form onSubmit={handleTracking} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={codigoTracking}
                onChange={(e) => setCodigoTracking(e.target.value)}
                placeholder="ENC-XXXXXXXX-XXXXX"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-0 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-300 transition-shadow"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors duration-200 shadow-lg"
            >
              Rastrear
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default EncomiendaInfoSection
