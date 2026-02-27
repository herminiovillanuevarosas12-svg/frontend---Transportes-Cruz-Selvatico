/**
 * AppRoutes
 * Sistema de rutas de la aplicacion
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../features/auth/authStore'
import MainLayout from '../components/layout/MainLayout'

// Pages
import LandingPage from '../pages/landing'
import LoginPage from '../pages/login'
import DashboardPage from '../pages/dashboard'
import TrackingPage from '../pages/tracking'
import RutasInfoPage from '../pages/rutas-info'

// Puntos
import PuntosListPage from '../pages/puntos/index'
import NuevoPuntoPage from '../pages/puntos/nuevo'
import EditarPuntoPage from '../pages/puntos/editar'

// Rutas
import RutasListPage from '../pages/rutas/index'
import NuevaRutaPage from '../pages/rutas/nuevo'
import EditarRutaPage from '../pages/rutas/editar'

// Tipos de Carro
import TiposCarroPage from '../pages/tipos-carro/index'

// Tipos de Paquete
import TiposPaquetePage from '../pages/tipos-paquete/index'

// Horarios
import HorariosListPage from '../pages/horarios/index'

// Usuarios
import UsuariosListPage from '../pages/usuarios/index'
import NuevoUsuarioPage from '../pages/usuarios/nuevo'
import EditarUsuarioPage from '../pages/usuarios/editar'

// Clientes
import ClientesListPage from '../pages/clientes/index'

// Tickets
import TicketsListPage from '../pages/tickets/index'
import VentaTicketPage from '../pages/tickets/venta'
import ImprimirTicketPage from '../pages/tickets/imprimir'

// Encomiendas
import EncomiendasListPage from '../pages/encomiendas/index'
import RegistroEncomiendaPage from '../pages/encomiendas/registro'

// Almacen
import EscaneoAlmacenPage from '../pages/almacen/escaneo'
import CambioEstadoPage from '../pages/almacen/cambio-estado'
import RetiroEncomiendaPage from '../pages/almacen/retiro'

// Ingresos
import IngresosPage from '../pages/ingresos'

// Configuracion
import ConfiguracionPage from '../pages/configuracion/index'

// Facturacion
import FacturacionPage from '../pages/facturacion/index'

// Landing Admin
import LandingAdminPage from '../pages/administracion/landing'

// Paginas publicas nuevas
import DestinosPage from '../pages/destinos'
import DestinoDetallePage from '../pages/destino-detalle'
import ContactoPage from '../pages/contacto'
import EncomiendasInfoPage from '../pages/encomiendas-info'
import PreguntasFrecuentesPage from '../pages/preguntas-frecuentes'
import BuscarPasajesPage from '../pages/buscar-pasajes'
import NosotrosPage from '../pages/nosotros'
import InfoViajePage from '../pages/info-viaje'

// Definicion de rutas con sus permisos (en orden de prioridad para redirección)
const RUTAS_POR_PERMISO = [
  { path: '/dashboard', permission: 'DASHBOARD_VER' },
  { path: '/ingresos', permission: 'DASHBOARD_VER' },
  { path: '/tickets/venta', permission: 'PASAJES_VENDER' },
  { path: '/tickets', permission: 'PASAJES_LISTAR' },
  { path: '/encomiendas/registro', permission: 'ENCOMIENDAS_REGISTRAR' },
  { path: '/encomiendas', permission: 'ENCOMIENDAS_LISTAR' },
  { path: '/almacen/escaneo', permission: 'ENCOMIENDAS_ESCANEAR' },
  { path: '/facturacion', permission: 'FACTURACION_VER' },
  { path: '/puntos', permission: 'PUNTOS_LISTAR' },
  { path: '/rutas', permission: 'RUTAS_LISTAR' },
  { path: '/tipos-carro', permission: 'RUTAS_LISTAR' },
  { path: '/tipos-paquete', permission: 'DASHBOARD_VER' },
  { path: '/horarios', permission: 'HORARIOS_LISTAR' },
  { path: '/usuarios', permission: 'USUARIOS_LISTAR' },
  { path: '/clientes', permission: 'CLIENTES_LISTAR' },
  { path: '/configuracion', permission: 'DASHBOARD_VER' },
  { path: '/admin/landing', permission: 'BANNERS_VER' }
]

/**
 * Obtiene la primera ruta disponible segun los permisos del usuario
 */
const getDefaultRoute = (hasPermission) => {
  for (const ruta of RUTAS_POR_PERMISO) {
    if (hasPermission(ruta.permission)) {
      return ruta.path
    }
  }
  return '/login' // Fallback si no tiene ningun permiso
}

/**
 * ProtectedRoute
 * Ruta protegida que requiere autenticacion
 */
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, hasPermission } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Redirigir a la primera ruta disponible, no siempre al dashboard
    const defaultRoute = getDefaultRoute(hasPermission)
    return <Navigate to={defaultRoute} replace />
  }

  return children
}

/**
 * PublicRoute
 * Ruta publica que redirige si esta autenticado
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, hasPermission } = useAuthStore()

  if (isAuthenticated) {
    // Redirigir a la primera ruta disponible segun permisos
    const defaultRoute = getDefaultRoute(hasPermission)
    return <Navigate to={defaultRoute} replace />
  }

  return children
}

/**
 * DefaultRedirect
 * Componente para redirigir al modulo por defecto del usuario
 */
const DefaultRedirect = () => {
  const { isAuthenticated, hasPermission } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const defaultRoute = getDefaultRoute(hasPermission)
  return <Navigate to={defaultRoute} replace />
}

/**
 * SmartLandingRoute
 * Redirige a usuarios autenticados a su modulo por defecto
 * Muestra landing a usuarios no autenticados
 */
const SmartLandingRoute = ({ children }) => {
  const { isAuthenticated, hasPermission } = useAuthStore()

  if (isAuthenticated) {
    const defaultRoute = getDefaultRoute(hasPermission)
    return <Navigate to={defaultRoute} replace />
  }

  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas publicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route path="/tracking" element={<TrackingPage />} />
      <Route path="/tracking/:codigo" element={<TrackingPage />} />
      <Route path="/rutas-info" element={<RutasInfoPage />} />
      <Route path="/destinos" element={<DestinosPage />} />
      <Route path="/destinos/:slug" element={<DestinoDetallePage />} />
      <Route path="/contacto" element={<ContactoPage />} />
      <Route path="/encomiendas-info" element={<EncomiendasInfoPage />} />
      <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentesPage />} />
      <Route path="/buscar-pasajes" element={<BuscarPasajesPage />} />
      <Route path="/nosotros" element={<NosotrosPage />} />
      <Route path="/info-viaje" element={<InfoViajePage />} />

      {/* Ruta por defecto para usuarios autenticados */}
      <Route
        path="/inicio"
        element={<DefaultRedirect />}
      />

      {/* Rutas protegidas con layout compartido (Sidebar + Header persisten) */}
      <Route element={<MainLayout />}>
        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute requiredPermission="DASHBOARD_VER"><DashboardPage /></ProtectedRoute>} />

        {/* Puntos */}
        <Route path="/puntos" element={<ProtectedRoute requiredPermission="PUNTOS_LISTAR"><PuntosListPage /></ProtectedRoute>} />
        <Route path="/puntos/nuevo" element={<ProtectedRoute requiredPermission="PUNTOS_CREAR"><NuevoPuntoPage /></ProtectedRoute>} />
        <Route path="/puntos/:id/editar" element={<ProtectedRoute requiredPermission="PUNTOS_EDITAR"><EditarPuntoPage /></ProtectedRoute>} />

        {/* Rutas */}
        <Route path="/rutas" element={<ProtectedRoute requiredPermission="RUTAS_LISTAR"><RutasListPage /></ProtectedRoute>} />
        <Route path="/rutas/nuevo" element={<ProtectedRoute requiredPermission="RUTAS_CREAR"><NuevaRutaPage /></ProtectedRoute>} />
        <Route path="/rutas/:id/editar" element={<ProtectedRoute requiredPermission="RUTAS_EDITAR"><EditarRutaPage /></ProtectedRoute>} />

        {/* Tipos de Carro */}
        <Route path="/tipos-carro" element={<ProtectedRoute requiredPermission="RUTAS_LISTAR"><TiposCarroPage /></ProtectedRoute>} />

        {/* Tipos de Paquete */}
        <Route path="/tipos-paquete" element={<ProtectedRoute requiredPermission="DASHBOARD_VER"><TiposPaquetePage /></ProtectedRoute>} />

        {/* Horarios */}
        <Route path="/horarios" element={<ProtectedRoute requiredPermission="HORARIOS_LISTAR"><HorariosListPage /></ProtectedRoute>} />

        {/* Usuarios */}
        <Route path="/usuarios" element={<ProtectedRoute requiredPermission="USUARIOS_LISTAR"><UsuariosListPage /></ProtectedRoute>} />
        <Route path="/usuarios/nuevo" element={<ProtectedRoute requiredPermission="USUARIOS_CREAR"><NuevoUsuarioPage /></ProtectedRoute>} />
        <Route path="/usuarios/:id/editar" element={<ProtectedRoute requiredPermission="USUARIOS_EDITAR"><EditarUsuarioPage /></ProtectedRoute>} />

        {/* Clientes */}
        <Route path="/clientes" element={<ProtectedRoute requiredPermission="CLIENTES_LISTAR"><ClientesListPage /></ProtectedRoute>} />

        {/* Tickets */}
        <Route path="/tickets" element={<ProtectedRoute requiredPermission="PASAJES_LISTAR"><TicketsListPage /></ProtectedRoute>} />
        <Route path="/tickets/venta" element={<ProtectedRoute requiredPermission="PASAJES_VENDER"><VentaTicketPage /></ProtectedRoute>} />
        <Route path="/tickets/:id/imprimir" element={<ProtectedRoute requiredPermission="PASAJES_LISTAR"><ImprimirTicketPage /></ProtectedRoute>} />

        {/* Encomiendas */}
        <Route path="/encomiendas" element={<ProtectedRoute requiredPermission="ENCOMIENDAS_LISTAR"><EncomiendasListPage /></ProtectedRoute>} />
        <Route path="/encomiendas/registro" element={<ProtectedRoute requiredPermission="ENCOMIENDAS_REGISTRAR"><RegistroEncomiendaPage /></ProtectedRoute>} />

        {/* Almacen */}
        <Route path="/almacen/escaneo" element={<ProtectedRoute requiredPermission="ENCOMIENDAS_ESCANEAR"><EscaneoAlmacenPage /></ProtectedRoute>} />
        <Route path="/almacen/cambio-estado/:id" element={<ProtectedRoute requiredPermission="ENCOMIENDAS_CAMBIAR_ESTADO"><CambioEstadoPage /></ProtectedRoute>} />
        <Route path="/almacen/retiro/:id" element={<ProtectedRoute requiredPermission="ENCOMIENDAS_RETIRAR"><RetiroEncomiendaPage /></ProtectedRoute>} />

        {/* Ingresos */}
        <Route path="/ingresos" element={<ProtectedRoute requiredPermission="DASHBOARD_VER"><IngresosPage /></ProtectedRoute>} />

        {/* Facturacion */}
        <Route path="/facturacion" element={<ProtectedRoute requiredPermission="FACTURACION_VER"><FacturacionPage /></ProtectedRoute>} />

        {/* Configuracion */}
        <Route path="/configuracion" element={<ProtectedRoute requiredPermission="DASHBOARD_VER"><ConfiguracionPage /></ProtectedRoute>} />

        {/* Landing Admin */}
        <Route path="/admin/landing" element={<ProtectedRoute requiredPermission="BANNERS_VER"><LandingAdminPage /></ProtectedRoute>} />
      </Route>

      {/* Landing Page - Redirige a modulo por defecto si esta autenticado */}
      <Route
        path="/"
        element={
          <SmartLandingRoute>
            <LandingPage />
          </SmartLandingRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
