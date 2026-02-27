/**
 * Preguntas Frecuentes - Pagina publica estilo Movil Bus
 * Ruta: /preguntas-frecuentes
 * Lista numerada con ChevronRight, CTA con gradiente oscuro y boton CONTACTO
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import publicService from '../services/publicService'
import { PageHeroBanner } from '../components/public'
import PublicLayout from '../components/layout/PublicLayout'
import { ChevronRight, Phone, Loader2, Mail } from 'lucide-react'

const PreguntasFrecuentesPage = () => {
  const [preguntas, setPreguntas] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)
  const [config, setConfig] = useState({ telefono: '' })

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        const [faqRes, configRes] = await Promise.allSettled([
          publicService.getPreguntasFrecuentes(),
          publicService.getConfigLanding(),
        ])

        if (faqRes.status === 'fulfilled') {
          const data = faqRes.value
          setPreguntas(data.preguntas || data.data || data || [])
        }

        if (configRes.status === 'fulfilled' && configRes.value.config) {
          setConfig((prev) => ({ ...prev, ...configRes.value.config }))
        }
      } catch (error) {
        console.error('Error cargando preguntas frecuentes:', error)
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  const togglePregunta = (id) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <PublicLayout>
      <PageHeroBanner
        titulo="frecuentes"
        subtitulo="Preguntas"
        showSearchBar={false}
      />

      {/* Listado de preguntas */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 border-l-4 border-secondary-500 pl-4 mb-10">
            Resuelve todas tus inquietudes
          </h2>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Cargando preguntas...</p>
            </div>
          )}

          {/* Lista numerada estilo Movil Bus */}
          {!loading && preguntas.length > 0 && (
            <div className="divide-y divide-gray-200">
              {preguntas.map((p, i) => {
                const id = p.id || i
                const isOpen = openId === id

                return (
                  <div key={id}>
                    {/* Fila de pregunta */}
                    <button
                      onClick={() => togglePregunta(id)}
                      className="flex items-center justify-between w-full py-5 text-left group"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className={`text-base font-semibold flex-shrink-0 ${
                          isOpen ? 'text-secondary-500' : 'text-gray-400'
                        }`}>
                          {i + 1}.
                        </span>
                        <span className={`text-base font-medium transition-colors ${
                          isOpen
                            ? 'text-secondary-500'
                            : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {p.pregunta}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 flex-shrink-0 ml-4 transition-transform duration-300 ${
                          isOpen
                            ? 'rotate-90 text-secondary-500'
                            : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                    </button>

                    {/* Respuesta expandible */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="pb-5 pl-10 pr-4">
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                          {p.respuesta}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Sin preguntas */}
          {!loading && preguntas.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay preguntas disponibles
              </h3>
              <p className="text-gray-500">
                Proximamente agregaremos las preguntas mas frecuentes.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA - Gradiente oscuro estilo Movil Bus */}
      <section className="relative overflow-hidden">
        {/* Fondo gradiente oscuro/morado */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900" />

        {/* Imagen lateral decorativa (persona con telefono) */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent z-10" />
          <div className="absolute inset-0 bg-primary-800/60" />
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Phone className="w-32 h-32 text-white" />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Si no encontraste lo que estas buscando
            </h2>
            <p className="text-lg text-gray-300 mb-2">
              Comunicate con nosotros al:
            </p>
            <p className="flex items-center gap-3 text-2xl lg:text-3xl font-bold text-secondary-400 mb-6">
              <Phone className="w-7 h-7" />
              {config.telefono || '(01) 000-0000'}
            </p>
            <p className="text-gray-300 mb-8">
              O escribenos a nuestro <span className="text-white font-medium">Formulario de contacto.</span>
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center justify-center px-10 py-3.5 bg-white text-gray-900 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors shadow-lg"
            >
              CONTACTO
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

export default PreguntasFrecuentesPage
