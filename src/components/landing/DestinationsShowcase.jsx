/**
 * DestinationsShowcase - Seccion de destinos populares
 * Muestra los puntos de destino disponibles con imagenes y conteo de rutas
 */

import { useNavigate } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'

// Imagenes placeholder para destinos (usando colores de fondo como fallback)
const destinoImagenes = {
  default: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  selva: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=300&fit=crop',
  costa: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
  sierra: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
  ciudad: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'
}

// Mapeo de ciudades conocidas a tipo de imagen
const ciudadTipoImagen = {
  'tarapoto': 'selva',
  'moyobamba': 'selva',
  'yurimaguas': 'selva',
  'iquitos': 'selva',
  'lima': 'ciudad',
  'chiclayo': 'costa',
  'piura': 'costa',
  'trujillo': 'costa',
  'cajamarca': 'sierra',
  'chachapoyas': 'sierra'
}

const getImagenDestino = (nombrePunto) => {
  const nombreLower = nombrePunto?.toLowerCase() || ''

  for (const [ciudad, tipo] of Object.entries(ciudadTipoImagen)) {
    if (nombreLower.includes(ciudad)) {
      return destinoImagenes[tipo]
    }
  }

  return destinoImagenes.default
}

const DestinationsShowcase = ({ puntos = [], rutas = [] }) => {
  const navigate = useNavigate()

  // Calcular cantidad de rutas por punto de destino
  const puntosConRutas = puntos.slice(0, 8).map(punto => {
    const rutasCount = rutas.filter(
      r => r.id_punto_destino === punto.id || r.id_punto_origen === punto.id
    ).length

    return {
      ...punto,
      rutasCount,
      imagen: getImagenDestino(punto.nombre)
    }
  })

  const handleVerDestino = (punto) => {
    navigate(`/rutas-info?destino=${punto.id}`)
  }

  const handleVerTodos = () => {
    navigate('/rutas-info')
  }

  if (puntosConRutas.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titulo */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Descubre Nuestros Destinos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conectamos las principales ciudades del norte y oriente del Peru
          </p>
        </div>

        {/* Grid de destinos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {puntosConRutas.map((punto) => (
            <div
              key={punto.id}
              onClick={() => handleVerDestino(punto)}
              className="group cursor-pointer relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Imagen de fondo */}
              <div className="aspect-[4/3] relative">
                <img
                  src={punto.imagen}
                  alt={punto.nombre}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = destinoImagenes.default
                  }}
                />

                {/* Overlay gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Contenido sobre imagen */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 text-white/80 text-sm mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>{punto.rutasCount} {punto.rutasCount === 1 ? 'ruta' : 'rutas'}</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    {punto.nombre}
                  </h3>
                </div>

                {/* Indicador hover */}
                <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Boton ver todos */}
        <div className="text-center mt-10">
          <button
            onClick={handleVerTodos}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-lg shadow-primary-600/25"
          >
            Ver todos los destinos
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default DestinationsShowcase
