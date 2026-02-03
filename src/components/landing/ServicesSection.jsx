/**
 * ServicesSection - Seccion de servicios para landing
 * Muestra los tipos de servicio disponibles en cards con iconos
 */

import { Bus, Star, Briefcase, Package } from 'lucide-react'

const servicios = [
  {
    icon: Bus,
    titulo: 'Servicio Ejecutivo',
    descripcion: 'Viaja con comodidad premium. Asientos amplios, aire acondicionado y la mejor atención a bordo.',
    color: 'primary'
  },
  {
    icon: Star,
    titulo: 'Servicio Estándar',
    descripcion: 'Calidad y puntualidad garantizada. La opción ideal para viajes frecuentes a precios accesibles.',
    color: 'emerald'
  },
  {
    icon: Briefcase,
    titulo: 'Servicio Express',
    descripcion: 'Llega más rápido a tu destino. Rutas directas sin paradas intermedias para optimizar tu tiempo.',
    color: 'amber'
  },
  {
    icon: Package,
    titulo: 'Envío de Carga',
    descripcion: 'Transportamos tus paquetes y encomiendas con seguro incluido y tracking en tiempo real.',
    color: 'sky'
  }
]

const colorClasses = {
  primary: {
    bg: 'bg-primary-100',
    icon: 'text-primary-600',
    hover: 'group-hover:bg-primary-200'
  },
  emerald: {
    bg: 'bg-emerald-100',
    icon: 'text-emerald-600',
    hover: 'group-hover:bg-emerald-200'
  },
  amber: {
    bg: 'bg-amber-100',
    icon: 'text-amber-600',
    hover: 'group-hover:bg-amber-200'
  },
  sky: {
    bg: 'bg-sky-100',
    icon: 'text-sky-600',
    hover: 'group-hover:bg-sky-200'
  }
}

const ServicesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titulo */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ofrecemos diferentes opciones de viaje para adaptarnos a tus necesidades
          </p>
        </div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {servicios.map((servicio, index) => {
            const Icon = servicio.icon
            const colors = colorClasses[servicio.color]

            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Icono */}
                <div className={`
                  w-16 h-16 rounded-xl flex items-center justify-center mb-6
                  ${colors.bg} ${colors.hover} transition-colors duration-300
                `}>
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                </div>

                {/* Contenido */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {servicio.titulo}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {servicio.descripcion}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
