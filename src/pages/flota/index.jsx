/**
 * Flota Page
 * Tipos de carro, conductores y buses en pestañas. Cada pestaña se ve con su propio
 * permiso y la activa queda en la URL (?tab=)
 */

import { useSearchParams } from 'react-router-dom'
import { Card } from '../../components/common'
import { useAuthStore } from '../../features/auth/authStore'
import { PESTANAS_FLOTA, elegirPestana } from '../../utils/flota'
import { Bus, Car, Contact } from 'lucide-react'
import TiposCarroTab from './tipos-carro'
import ConductoresTab from './conductores'
import BusesTab from './buses'

const VISTAS = {
  'tipos-carro': { icono: Car, Contenido: TiposCarroTab },
  conductores: { icono: Contact, Contenido: ConductoresTab },
  buses: { icono: Bus, Contenido: BusesTab }
}

const FlotaPage = () => {
  const { hasPermission } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()

  const visibles = PESTANAS_FLOTA.filter((pestana) => hasPermission(pestana.permiso))
  const activa = elegirPestana(searchParams.get('tab'), visibles)
  const { Contenido } = activa ? VISTAS[activa.id] : {}

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
          <Bus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flota</h1>
          <p className="text-sm text-gray-500">Tipos de carro, conductores y buses</p>
        </div>
      </div>

      <Card padding={false}>
        <div className="border-b border-gray-200 px-6 pt-4 overflow-x-auto">
          <nav className="flex gap-1 -mb-px" aria-label="Pestañas">
            {visibles.map((pestana) => {
              const Icono = VISTAS[pestana.id].icono
              return (
                <button
                  key={pestana.id}
                  onClick={() => setSearchParams({ tab: pestana.id }, { replace: true })}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${activa?.id === pestana.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icono className="w-4 h-4" />
                  {pestana.etiqueta}
                </button>
              )
            })}
          </nav>
        </div>

        {Contenido && <Contenido />}
      </Card>
    </div>
  )
}

export default FlotaPage
