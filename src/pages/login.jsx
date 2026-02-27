/**
 * Login Page
 * Pagina de inicio de sesion premium
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../features/auth/authStore'
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Bus,
  Package,
  MapPin,
  Shield,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'

const LoginPage = () => {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')

  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore()
  const navigate = useNavigate()

  // Redirigir si ya esta autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Limpiar error al cambiar inputs
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [correo, contrasena])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!correo || !contrasena) {
      return
    }

    const result = await login(correo, contrasena)

    if (result.success) {
      navigate('/dashboard')
    }
  }

  const features = [
    { icon: Bus, text: 'Venta de pasajes interprovinciales' },
    { icon: Package, text: 'Gestion de encomiendas con tracking' },
    { icon: MapPin, text: 'Multiples rutas y agencias' },
    { icon: Shield, text: 'Sistema seguro y confiable' }
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding Cruz Selvatico */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        {/* Decorative elements - Verde y Rojo del logo */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary-400/20 rounded-full blur-2xl" />
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo - Cruz Selvatico */}
          <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-3">
            <img
              src="/logo.png"
              alt="Transportes Cruz Selvatico"
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Gestiona tu negocio
                <br />
                de transporte
                <span className="text-secondary-300"> eficientemente</span>
              </h1>
              <p className="mt-6 text-lg text-primary-100 max-w-md leading-relaxed">
                Plataforma integral para la venta de pasajes y gestion de encomiendas con trazabilidad completa.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-white font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-primary-200 text-sm">
              Version 1.0
            </p>
            <div className="flex items-center gap-2 text-primary-200 text-sm">
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
              Sistema operativo
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo - Cruz Selvatico */}
          <div className="lg:hidden text-center mb-10">
            <img
              src="/logo.png"
              alt="Transportes Cruz Selvatico"
              className="h-14 w-auto object-contain mx-auto"
            />
          </div>

          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>

          {/* Welcome text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Bienvenido
            </h1>
            <p className="mt-2 text-gray-500">
              Ingrese sus credenciales para acceder al sistema
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 animate-fade-in">
                  <div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-error-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Error de autenticacion</p>
                    <p className="text-xs text-error-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Email */}
              <Input
                label="Correo electronico"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="usuario@ejemplo.com"
                icon={Mail}
                required
                disabled={isLoading}
              />

              {/* Password */}
              <Input
                label="Contrasena"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingrese su contrasena"
                icon={Lock}
                required
                disabled={isLoading}
              />

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Recordarme
                  </span>
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading || !correo || !contrasena}
                loading={isLoading}
                fullWidth
                size="lg"
                icon={isLoading ? undefined : ArrowRight}
                iconPosition="right"
              >
                {isLoading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
              </Button>
            </form>

          </div>

          {/* Dev Quick Login - Solo visible en desarrollo local */}
          {import.meta.env.DEV && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Acceso rapido (solo desarrollo)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Super Admin', correo: 'admin@transporte.com', pass: '123456', color: 'bg-red-500' },
                ].map((user) => (
                  <button
                    key={user.correo}
                    type="button"
                    onClick={() => { setCorreo(user.correo); setContrasena(user.pass) }}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-amber-100 hover:border-amber-300 transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full ${user.color}`} />
                    {user.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Help text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              ¿Problemas para acceder?{' '}
              <span className="text-primary-600 font-medium cursor-pointer hover:text-primary-700">
                Contacte al administrador
              </span>
            </p>
          </div>

          {/* Footer - Cruz Selvatico */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-400">
              <span className="text-primary-600 font-medium">Transportes Cruz Selvatico</span> - Venta de Pasajes y Encomiendas
              <br />
              Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
