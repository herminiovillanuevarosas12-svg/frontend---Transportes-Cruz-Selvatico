/**
 * MainLayout Component
 * Layout principal premium del panel interno
 */

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content wrapper */}
      <div className="flex-1 min-h-screen flex flex-col w-full lg:w-[calc(100%-18rem)]">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-8 py-4 border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>Sistema de Transporte v1.0</p>
            <p>Todos los derechos reservados</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default MainLayout
