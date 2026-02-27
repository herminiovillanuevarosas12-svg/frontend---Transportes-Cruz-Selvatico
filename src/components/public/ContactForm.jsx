/**
 * ContactForm - Formulario de contacto con toggle pasajero/empresa
 * Props: onSubmit (async function), loading (boolean)
 */

import { useState } from 'react'
import { Send, User, Building2 } from 'lucide-react'

const INITIAL_STATE = {
  tipo: 'pasajero',
  nombre: '',
  email: '',
  telefono: '',
  asunto: '',
  mensaje: '',
  empresa: '',
  ruc: '',
}

const ContactForm = ({ onSubmit, loading = false }) => {
  const [form, setForm] = useState({ ...INITIAL_STATE })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.nombre.trim()) newErrors.nombre = true
    if (!form.email.trim()) newErrors.email = true
    if (!form.telefono.trim()) newErrors.telefono = true
    if (!form.asunto.trim()) newErrors.asunto = true
    if (!form.mensaje.trim()) newErrors.mensaje = true
    return newErrors
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

    try {
      await onSubmit(form)
      setForm({ ...INITIAL_STATE })
      setSubmitted(false)
    } catch {
      // Error manejado por el padre
    }
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 ${
      submitted && errors[field]
        ? 'border-red-400 bg-red-50'
        : 'border-gray-300 bg-white hover:border-gray-400'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Toggle Pasajero / Empresa */}
      <div className="flex items-center gap-3 justify-center">
        <button
          type="button"
          onClick={() => handleChange('tipo', 'pasajero')}
          className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
            form.tipo === 'pasajero'
              ? 'bg-secondary-500 text-white shadow-lg shadow-secondary-500/25'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <User className="w-4 h-4" />
          SOY PASAJERO
        </button>
        <button
          type="button"
          onClick={() => handleChange('tipo', 'empresa')}
          className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
            form.tipo === 'empresa'
              ? 'bg-secondary-500 text-white shadow-lg shadow-secondary-500/25'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          SOY EMPRESA
        </button>
      </div>

      {/* Grid de campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Tu nombre completo"
            className={inputClass('nombre')}
          />
        </div>

        {/* Telefono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Telefono <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={form.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            placeholder="999 999 999"
            className={inputClass('telefono')}
          />
        </div>

        {/* Correo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Correo electronico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="correo@ejemplo.com"
            className={inputClass('email')}
          />
        </div>

        {/* Asunto */}
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

        {/* Campos empresa (condicional) */}
        {form.tipo === 'empresa' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Empresa
              </label>
              <input
                type="text"
                value={form.empresa}
                onChange={(e) => handleChange('empresa', e.target.value)}
                placeholder="Nombre de la empresa"
                className={inputClass('empresa')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                RUC
              </label>
              <input
                type="text"
                value={form.ruc}
                onChange={(e) => handleChange('ruc', e.target.value)}
                placeholder="20XXXXXXXXX"
                maxLength={11}
                className={inputClass('ruc')}
              />
            </div>
          </>
        )}

        {/* Mensaje - full width */}
        <div className="md:col-span-2">
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
      </div>

      {/* Boton enviar */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-secondary-500 text-white rounded-lg px-8 py-3 font-semibold text-sm hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-secondary-500/25"
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
  )
}

export default ContactForm
