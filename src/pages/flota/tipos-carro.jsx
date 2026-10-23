/**
 * Pestaña Tipos de carro
 * Tipos de vehículo de las rutas (precio por tipo) y de los buses
 */

import { Input, StatusBadge } from '../../components/common'
import tiposCarroService from '../../services/tiposCarroService'
import { Car } from 'lucide-react'
import FlotaCrud from './FlotaCrud'

const columnas = [
  {
    key: 'nombre',
    header: 'Nombre',
    render: (value) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Car className="w-5 h-5 text-purple-600" />
        </div>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
    )
  },
  {
    key: 'descripcion',
    header: 'Descripción',
    render: (value) => <span className="text-gray-600">{value || 'Sin descripción'}</span>
  },
  {
    key: 'estado',
    header: 'Estado',
    render: (value) => <StatusBadge status={value === 1 ? 'ACTIVO' : 'INACTIVO'} />
  }
]

const CamposTipoCarro = ({ form, setCampo, errores }) => (
  <div className="space-y-4">
    <Input
      label="Nombre"
      placeholder="Ej: VIP, Ejecutivo, Estándar"
      value={form.nombre}
      onChange={(e) => setCampo('nombre', e.target.value)}
      error={errores.nombre}
      required
    />
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Descripción
      </label>
      <textarea
        placeholder="Descripción opcional del tipo de vehículo"
        value={form.descripcion}
        onChange={(e) => setCampo('descripcion', e.target.value)}
        rows={3}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
      />
    </div>
  </div>
)

const TiposCarroTab = () => (
  <FlotaCrud
    descripcion="Cada bus es de un tipo, y las rutas pueden tener precios distintos por tipo de vehículo para el mismo origen y destino (ej: Estándar, VIP, Ejecutivo)."
    nombreItem="tipo de carro"
    nombrePlural="tipos de carro"
    servicio={tiposCarroService}
    claveLista="tiposCarro"
    prefijoPermiso="RUTAS"
    columnas={columnas}
    formularioVacio={{ nombre: '', descripcion: '' }}
    camposRequeridos={{ nombre: 'El nombre es requerido' }}
    describir={(tipoCarro) => tipoCarro.nombre}
    notaEliminar="No podrá usarse en nuevas rutas ni buses. No se puede eliminar mientras tenga rutas o buses activos."
    CamposFormulario={CamposTipoCarro}
  />
)

export default TiposCarroTab
