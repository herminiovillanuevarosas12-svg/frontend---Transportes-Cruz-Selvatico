/**
 * ExperienceSection - Seccion de experiencia de viaje
 * Layout de 2 columnas con imagen configurable y contenido dinámico desde admin
 */

import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'

const DEFAULTS = {
  titulo: 'Haz de tus Viajes una Gran Experiencia',
  descripcion: 'En cada viaje nos esforzamos por brindarte el mejor servicio. Nuestras unidades cuentan con todas las comodidades para que llegues a tu destino relajado y satisfecho.',
  badgeNumero: '+10',
  badgeTexto: 'Años de experiencia',
  features: [
    'Asientos reclinables y espaciosos',
    'Aire acondicionado en todas las unidades',
    'Buses modernos y bien mantenidos',
    'Conductores profesionales capacitados',
    'Servicio a bordo de calidad',
    'Paradas estratégicas en ruta'
  ]
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop'

const ExperienceSection = ({ imagenUrl, config = {} }) => {
  const navigate = useNavigate()
  const src = imagenUrl || FALLBACK_IMAGE

  const titulo = config.experienciaTitulo || DEFAULTS.titulo
  const descripcion = config.experienciaDescripcion || DEFAULTS.descripcion
  const badgeNumero = config.experienciaBadgeNumero || DEFAULTS.badgeNumero
  const badgeTexto = config.experienciaBadgeTexto || DEFAULTS.badgeTexto
  const features = config.experienciaFeatures
    ? config.experienciaFeatures.split('|').filter(f => f.trim())
    : DEFAULTS.features

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Imagen */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={src}
                alt="Interior de bus moderno"
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (e.target.src !== FALLBACK_IMAGE) {
                    e.target.onerror = null
                    e.target.src = FALLBACK_IMAGE
                  }
                }}
              />
            </div>

            {/* Badge decorativo */}
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-primary-600 text-white px-6 py-4 rounded-xl shadow-xl">
              <div className="text-2xl md:text-3xl font-bold">{badgeNumero}</div>
              <div className="text-sm text-primary-100">{badgeTexto}</div>
            </div>

            {/* Elemento decorativo */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary-100 rounded-full -z-10" />
          </div>

          {/* Contenido */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {titulo}
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              {descripcion}
            </p>

            {/* Lista de caracteristicas */}
            <ul className="space-y-4 mb-8">
              {features.map((caracteristica, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-gray-700">{caracteristica}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={() => navigate('/rutas-info')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-lg shadow-primary-600/25"
            >
              Ver Rutas y Horarios
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExperienceSection
