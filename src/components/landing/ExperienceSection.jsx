/**
 * ExperienceSection - Sección "Haz de tus viajes una gran experiencia"
 * Diseño estilo Movil Bus: full-width con imagen de fondo, overlay oscuro,
 * texto superpuesto, iconos circulares dinámicos y botón VER SERVICIOS (lleva a rutas)
 */

import { Link } from 'react-router-dom'
import * as LucideIcons from 'lucide-react'

const DEFAULTS = {
  titulo: 'Haz de tus viajes una gran experiencia con seguridad y comodidad',
  ctaTexto: 'VER SERVICIOS',
  ctaLink: '/rutas-info'
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&h=700&fit=crop'

const DEFAULT_ICONOS = [
  { id: 1, nombreIcono: 'Armchair', etiqueta: 'Asientos reclinables' },
  { id: 2, nombreIcono: 'Thermometer', etiqueta: 'Aire acondicionado' },
  { id: 3, nombreIcono: 'Wifi', etiqueta: 'Streaming a bordo' }
]

/**
 * Resuelve un nombre de icono Lucide a su componente React
 */
const getIconComponent = (iconName) => {
  if (!iconName) return LucideIcons.Circle
  const Icon = LucideIcons[iconName]
  return Icon || LucideIcons.Circle
}

const ExperienceSection = ({ imagenUrl, config = {}, iconos = [] }) => {
  const src = imagenUrl || FALLBACK_IMAGE
  const displayIconos = iconos.length > 0 ? iconos : DEFAULT_ICONOS

  // Textos configurables
  const titulo = config.experienciaTitulo || DEFAULTS.titulo
  const ctaTexto = config.experienciaCtaTexto || DEFAULTS.ctaTexto
  const rawCtaLink = config.experienciaCtaLink
  const ctaLink = (rawCtaLink && rawCtaLink !== '/nuestros-servicios') ? rawCtaLink : DEFAULTS.ctaLink

  // Separar título en líneas: primera línea cursiva pequeña, resto bold grande
  // Formato: "Haz de tus viajes una gran|experiencia con|seguridad y|comodidad"
  // Si tiene pipes, los usa. Si no, divide automáticamente
  const tituloPartes = titulo.includes('|')
    ? titulo.split('|').map(t => t.trim())
    : [titulo]
  const lineaCursiva = tituloPartes[0] || ''
  const lineasBold = tituloPartes.slice(1)

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Imagen de fondo */}
      <img
        src={src}
        alt="Interior de bus moderno"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          if (e.target.src !== FALLBACK_IMAGE) {
            e.target.onerror = null
            e.target.src = FALLBACK_IMAGE
          }
        }}
      />

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />

      {/* Contenido superpuesto */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl">
            {/* Título */}
            {lineasBold.length > 0 ? (
              <>
                <p className="text-white/90 text-lg md:text-xl italic mb-1">
                  {lineaCursiva}
                </p>
                {lineasBold.map((linea, i) => (
                  <h2 key={i} className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {linea}
                  </h2>
                ))}
              </>
            ) : (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {lineaCursiva}
              </h2>
            )}

            {/* Iconos circulares con barra vertical decorativa */}
            {displayIconos.length > 0 && (
              <div className="flex items-center gap-4 mt-8">
                {/* Barra vertical decorativa */}
                <div className="w-1 h-12 bg-primary-500 rounded-full flex-shrink-0" />

                {/* Iconos */}
                <div className="flex items-center gap-3">
                  {displayIconos.map((icono) => {
                    const IconComp = getIconComponent(icono.nombreIcono)
                    return (
                      <div
                        key={icono.id}
                        className="w-11 h-11 md:w-12 md:h-12 rounded-full border-2 border-white/60 bg-white/10 backdrop-blur-sm flex items-center justify-center group cursor-default"
                        title={icono.etiqueta || ''}
                      >
                        <IconComp className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Botón CTA */}
            <div className="mt-8">
              <Link
                to={ctaLink}
                className="inline-flex items-center gap-2 px-7 py-3 border-2 border-white text-white rounded-lg font-bold uppercase text-sm tracking-wide hover:bg-white hover:text-primary-800 transition-all duration-300"
              >
                {ctaTexto}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExperienceSection
