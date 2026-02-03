/**
 * Sidebar Component
 * Menu lateral premium con navegacion por permisos
 */

import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/authStore'
import {
  LayoutDashboard,
  MapPin,
  Route,
  Clock,
  Ticket,
  Package,
  Users,
  UserCheck,
  Settings,
  Scan,
  ClipboardList,
  X,
  Bus,
  Sparkles,
  FileText,
  DollarSign,
  Car,
  Image,
  Globe,
  Box
} from 'lucide-react'

// Definicion de menu con permisos
const menuItems = [
  {
    title: 'General',
    items: [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        permission: 'DASHBOARD_VER'
      },
      {
        name: 'Ingresos',
        path: '/ingresos',
        icon: DollarSign,
        permission: 'DASHBOARD_VER'
      }
    ]
  },
  {
    title: 'Administracion',
    items: [
      {
        name: 'Puntos',
        path: '/puntos',
        icon: MapPin,
        permission: 'PUNTOS_LISTAR'
      },
      {
        name: 'Rutas',
        path: '/rutas',
        icon: Route,
        permission: 'RUTAS_LISTAR'
      },
      {
        name: 'Tipos de Carro',
        path: '/tipos-carro',
        icon: Car,
        permission: 'RUTAS_LISTAR'
      },
      {
        name: 'Usuarios',
        path: '/usuarios',
        icon: Users,
        permission: 'USUARIOS_LISTAR'
      },
      {
        name: 'Clientes',
        path: '/clientes',
        icon: UserCheck,
        permission: 'CLIENTES_LISTAR'
      }
    ]
  },
  {
    title: 'Operaciones',
    items: [
      {
        name: 'Horarios',
        path: '/horarios',
        icon: Clock,
        permission: 'HORARIOS_LISTAR'
      }
    ]
  },
  {
    title: 'Ventas',
    items: [
      {
        name: 'Venta de Pasajes',
        path: '/tickets/venta',
        icon: Ticket,
        permission: 'PASAJES_VENDER'
      },
      {
        name: 'Lista de Tickets',
        path: '/tickets',
        icon: ClipboardList,
        permission: 'PASAJES_LISTAR'
      }
    ]
  },
  {
    title: 'Encomiendas',
    items: [
      {
        name: 'Nueva Encomienda',
        path: '/encomiendas/registro',
        icon: Package,
        permission: 'ENCOMIENDAS_REGISTRAR'
      },
      {
        name: 'Lista Encomiendas',
        path: '/encomiendas',
        icon: ClipboardList,
        permission: 'ENCOMIENDAS_LISTAR'
      },
      {
        name: 'Escaneo QR',
        path: '/almacen/escaneo',
        icon: Scan,
        permission: 'ENCOMIENDAS_ESCANEAR'
      },
      {
        name: 'Tipos de Paquete',
        path: '/tipos-paquete',
        icon: Box,
        permission: 'DASHBOARD_VER'
      }
    ]
  },
  {
    title: 'Facturacion',
    items: [
      {
        name: 'Facturacion Electronica',
        path: '/facturacion',
        icon: FileText,
        permission: 'FACTURACION_VER'
      }
    ]
  },
  {
    title: 'Landing Page',
    items: [
      {
        name: 'Banners y Config',
        path: '/admin/landing',
        icon: Image,
        permission: 'BANNERS_VER'
      }
    ]
  },
  {
    title: 'Sistema',
    items: [
      {
        name: 'Configuracion',
        path: '/configuracion',
        icon: Settings,
        permission: 'DASHBOARD_VER'
      }
    ]
  }
]

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { hasPermission } = useAuthStore()

  // Filtrar items del menu segun permisos
  const getVisibleMenuItems = () => {
    return menuItems
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => hasPermission(item.permission))
      }))
      .filter((section) => section.items.length > 0)
  }

  const visibleMenu = getVisibleMenuItems()

  return (
    <>
      {/* Overlay para movil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72
          bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-out
          lg:translate-x-0 lg:sticky lg:z-auto lg:h-screen lg:flex-shrink-0
          flex flex-col
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header / Logo - Cruz Selvatico */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-gray-100">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Transportes Cruz Selvatico"
              className="h-14 w-auto object-contain"
            />
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
          {visibleMenu.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-8">
              <p className="px-3 mb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  // Usar coincidencia exacta para evitar que rutas similares se activen juntas
                  // Ej: /tickets/venta NO debe activar /tickets
                  const isActive = location.pathname === item.path

                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        className={`
                          group flex items-center gap-3 px-3 py-2.5 rounded-xl
                          transition-all duration-200 text-sm font-medium
                          ${isActive
                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <div className={`
                          w-9 h-9 rounded-lg flex items-center justify-center
                          transition-all duration-200
                          ${isActive
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                          }
                        `}>
                          <Icon className="w-[18px] h-[18px]" />
                        </div>
                        <span className="flex-1">{item.name}</span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        )}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer - Cruz Selvatico */}
        <div className="p-4 border-t border-gray-100">
          <div className="px-3 py-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200/50">
            <p className="text-xs font-semibold text-primary-700">Transportes Cruz Selvatico</p>
            <p className="text-[10px] text-primary-600/70 mt-0.5">Version 1.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
