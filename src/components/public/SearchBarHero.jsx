/**
 * SearchBarHero - Barra de busqueda "Compra tu pasaje" estilo Movil Bus
 * Se usa flotante sobre el hero en subpaginas y en el landing
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Calendar } from 'lucide-react'
import publicService from '../../services/publicService'

const SearchBarHero = ({ className = '' }) => {
  const navigate = useNavigate()
  const [ciudades, setCiudades] = useState([])
  const [busqueda, setBusqueda] = useState({
    origen: '',
    destino: '',
    fecha: ''
  })

  useEffect(() => {
    publicService.getPuntos()
      .then(res => {
        const puntos = res.puntos || []
        const unique = [...new Set(puntos.map(p => p.ciudad))].sort()
        setCiudades(unique)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (busqueda.origen) params.set('origen', busqueda.origen)
    if (busqueda.destino) params.set('destino', busqueda.destino)
    if (busqueda.fecha) params.set('fecha', busqueda.fecha)
    navigate(`/buscar-pasajes?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 ${className}`}
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 md:p-3">
        {/* Label */}
        <span className="hidden lg:block text-sm font-bold text-primary-800 whitespace-nowrap px-3">
          Compra tu pasaje:
        </span>

        {/* Origen */}
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-medium text-gray-400 mb-0.5 md:hidden">Origen</label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={busqueda.origen}
              onChange={(e) => setBusqueda(prev => ({
                ...prev,
                origen: e.target.value,
                destino: prev.destino === e.target.value ? '' : prev.destino
              }))}
              className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">Origen</option>
              {ciudades.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Destino */}
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-medium text-gray-400 mb-0.5 md:hidden">Destino</label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-500" />
            <select
              value={busqueda.destino}
              onChange={(e) => setBusqueda(prev => ({ ...prev, destino: e.target.value }))}
              className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">Destino</option>
              {ciudades.filter(c => c !== busqueda.origen).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Fecha */}
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-medium text-gray-400 mb-0.5 md:hidden">Fecha de salida</label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={busqueda.fecha}
              onChange={(e) => setBusqueda(prev => ({ ...prev, fecha: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent cursor-pointer"
              placeholder="dd/mm/aaaa"
            />
          </div>
        </div>

        {/* Boton */}
        <button
          type="submit"
          className="px-8 py-2.5 bg-secondary-500 text-white rounded-lg text-sm font-bold hover:bg-secondary-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Search className="w-4 h-4" />
          BUSCAR
        </button>
      </div>
    </form>
  )
}

export default SearchBarHero
