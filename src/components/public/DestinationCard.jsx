/**
 * DestinationCard - Card de destino con imagen overlay
 * Props: destino (objeto con: nombre, slug, imagenPath, precioDesde, subtitulo)
 */

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getUploadUrl } from '../../services/apiClient'

const DestinationCard = ({ destino }) => {
  const { nombre, slug, imagenPath, precioDesde, subtitulo } = destino
  const imageUrl = imagenPath ? getUploadUrl(imagenPath) : null

  return (
    <Link
      to={`/destinos/${slug}`}
      className="block group"
    >
      <div className="relative rounded-xl overflow-hidden h-56 md:h-64">
        {/* Imagen de fondo o gradiente fallback */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={nombre}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800" />
        )}

        {/* Overlay gradiente oscuro */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-300" />

        {/* Contenido overlay */}
        <div className="relative h-full flex flex-col justify-end p-5">
          {/* Nombre del destino */}
          <h3 className="text-xl font-bold text-white mb-1">
            {nombre}
          </h3>

          {/* Subtitulo */}
          {subtitulo && (
            <p className="text-sm text-white/70 mb-2">{subtitulo}</p>
          )}

          {/* Precio desde */}
          {precioDesde && (
            <p className="text-sm text-white/80 mb-3">
              Pasajes desde <span className="font-semibold text-secondary-400">S/{precioDesde}</span>
            </p>
          )}

          {/* Boton ver detalle */}
          <div className="flex items-center gap-2 text-xs font-semibold text-white border border-white/40 rounded-full px-4 py-1.5 w-fit group-hover:bg-white group-hover:text-primary-800 transition-all duration-300">
            VER DETALLE
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default DestinationCard
