/**
 * Contacto - Pagina publica de contacto estilo Movil Bus
 * Ruta: /contacto
 * Layout: dos columnas intro, toggle pasajero/empresa, formulario 2x2, atencion al cliente
 */

import { useState, useEffect } from 'react'
import publicService from '../services/publicService'
import { PageHeroBanner } from '../components/public'
import PublicLayout from '../components/layout/PublicLayout'
import { Phone, MapPin, Mail, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const DESTINATARIOS = [
  'Atencion al cliente',
  'Ventas corporativas',
  'Encomiendas',
  'Recursos humanos',
  'Administracion',
  'Otro',
]

const INITIAL_FORM = {
  tipo: 'pasajero',
  nombre: '',
  telefono: '',
  email: '',
  asunto: '',
  enviar_a: '',
  mensaje: '',
}

const Contacto = () => {
  const [form, setForm] = useState({ ...INITIAL_FORM })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [config, setConfig] = useState({
    telefono: '',
    direccion: '',
    emailContacto: '',
  })

  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const res = await publicService.getConfigLanding()
        if (res.config) {
          setConfig((prev) => ({ ...prev, ...res.config }))
        }
      } catch {
        // Usa datos por defecto
      }
    }
    cargarConfig()
  }, [])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = true
    if (!form.telefono.trim()) e.telefono = true
    if (!form.email.trim()) e.email = true
    if (!form.asunto.trim()) e.asunto = true
    if (!form.enviar_a) e.enviar_a = true
    if (!form.mensaje.trim()) e.mensaje = true
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await publicService.enviarContacto(form)
      toast.success('Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.')
      setEnviado(true)
    } catch (err) {
      const mensaje =
        err?.response?.data?.message || err?.response?.data?.error || 'Error al enviar el mensaje. Intenta nuevamente.'
      toast.error(mensaje)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 ${
      submitted && errors[field]
        ? 'border-red-400 bg-red-50'
        : 'border-gray-300 bg-white hover:border-gray-400'
    }`

  const contactCards = [
    {
      icon: Phone,
      titulo: 'Central telefonica',
      detalle: config.telefono || '(Sin informacion)',
      href: config.telefono ? `tel:${config.telefono.replace(/\s/g, '')}` : null,
    },
    {
      icon: MapPin,
      titulo: 'Oficina principal',
      detalle: config.direccion || '(Sin informacion)',
      href: null,
    },
    {
      icon: Mail,
      titulo: 'Correo electronico',
      detalle: config.emailContacto || '(Sin informacion)',
      href: config.emailContacto ? `mailto:${config.emailContacto}` : null,
    },
  ]

  return (
    <PublicLayout>
      <PageHeroBanner
        titulo="Contactanos"
        showSearchBar={false}
      />

      <section className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
        {/* Dos columnas de intro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Izquierda: texto + telefono */}
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Ayudarte es nuestra prioridad
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Si tienes alguna consulta, sugerencia o necesitas informacion sobre nuestros servicios,
              no dudes en comunicarte con nosotros. Estaremos encantados de atenderte.
            </p>
            {config.telefono && (
              <a
                href={`tel:${config.telefono.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-3 text-gray-800 hover:text-secondary-500 transition-colors"
              >
                <div className="w-10 h-10 rounded-full border-2 border-secondary-500 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-secondary-500" />
                </div>
                <span className="text-lg font-semibold">{config.telefono}</span>
              </a>
            )}
          </div>

          {/* Derecha: texto naranja */}
          <div className="flex items-center">
            <p className="text-secondary-500 text-lg lg:text-xl font-semibold leading-relaxed">
              Por favor completa el formulario y te responderemos a la brevedad:
            </p>
          </div>
        </div>

        {/* Formulario */}
        {enviado ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl mb-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Mensaje enviado con exito
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Gracias por comunicarte con nosotros. Nuestro equipo revisara tu mensaje y te contactara pronto.
            </p>
            <button
              type="button"
              onClick={() => {
                setEnviado(false)
                setForm({ ...INITIAL_FORM })
                setSubmitted(false)
              }}
              className="bg-secondary-500 text-white rounded-lg px-6 py-3 font-semibold text-sm hover:bg-secondary-600 transition-colors"
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mb-16">
            {/* Toggle SOY PASAJERO / SOY EMPRESA */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <button
                type="button"
                onClick={() => handleChange('tipo', 'pasajero')}
                className={`px-8 py-2.5 rounded-md text-sm font-bold uppercase tracking-wide transition-all ${
                  form.tipo === 'pasajero'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-secondary-500 border-2 border-secondary-500 hover:bg-secondary-50'
                }`}
              >
                SOY PASAJERO
              </button>
              <button
                type="button"
                onClick={() => handleChange('tipo', 'empresa')}
                className={`px-8 py-2.5 rounded-md text-sm font-bold uppercase tracking-wide transition-all ${
                  form.tipo === 'empresa'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-secondary-500 border-2 border-secondary-500 hover:bg-secondary-50'
                }`}
              >
                SOY EMPRESA
              </button>
            </div>

            {/* Grid 2x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nombres y apellidos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                  className={inputClass('nombre')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Celular <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  placeholder="999 999 999"
                  className={inputClass('telefono')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className={inputClass('email')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Asunto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.asunto}
                  onChange={(e) => handleChange('asunto', e.target.value)}
                  placeholder="Motivo de tu mensaje"
                  className={inputClass('asunto')}
                />
              </div>
            </div>

            {/* Enviar a - full width */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Enviar a <span className="text-red-500">*</span>
              </label>
              <select
                value={form.enviar_a}
                onChange={(e) => handleChange('enviar_a', e.target.value)}
                className={inputClass('enviar_a') + ' appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23667085%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")] bg-no-repeat bg-[right_12px_center] bg-[length:20px]'}
              >
                <option value="">Selecciona un area</option>
                {DESTINATARIOS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Mensaje - full width */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mensaje <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.mensaje}
                onChange={(e) => handleChange('mensaje', e.target.value)}
                placeholder="Escribe tu mensaje aqui..."
                rows={5}
                className={inputClass('mensaje') + ' resize-none'}
              />
            </div>

            {/* Boton ENVIAR alineado a la derecha */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-secondary-500 text-white rounded-lg px-10 py-3 font-bold text-sm uppercase tracking-wide hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-secondary-500/25"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    ENVIAR
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Seccion Atencion al cliente */}
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 border-l-4 border-secondary-500 pl-4 mb-10">
            Atencion al cliente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactCards.map((card) => {
              const Icon = card.icon
              const content = (
                <div className="flex flex-col items-center text-center p-8 rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
                  <div className="w-16 h-16 rounded-full border-2 border-secondary-500 flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-secondary-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{card.titulo}</h3>
                  <p className="text-gray-500 text-sm">{card.detalle}</p>
                </div>
              )

              if (card.href) {
                return (
                  <a key={card.titulo} href={card.href} className="block">
                    {content}
                  </a>
                )
              }

              return <div key={card.titulo}>{content}</div>
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

export default Contacto
