/**
 * Pestaña Buses
 * Buses que se eligen al generar el manifiesto de encomiendas; cada uno es de un tipo de carro
 */

import { useState, useEffect } from 'react'
import { Input, Select } from '../../components/common'
import { busesService } from '../../services/flotaService'
import tiposCarroService from '../../services/tiposCarroService'
import { textoSelector } from '../../utils/selector'
import toast from 'react-hot-toast'
import FlotaCrud from './FlotaCrud'

const columnas = [
  {
    key: 'numeroInterno',
    header: 'Bus',
    render: (value) => <span className="font-medium text-gray-900">{value}</span>
  },
  {
    key: 'tipoCarro',
    header: 'Tipo de vehículo',
    render: (value) => <span className="text-gray-600">{value}</span>
  },
  {
    key: 'placa',
    header: 'Placa',
    render: (value) => <span className="font-mono text-gray-700">{value}</span>
  },
  {
    key: 'marca',
    header: 'Marca',
    render: (value) => <span className="text-gray-600">{value}</span>
  },
  {
    key: 'certificadoInscripcion',
    header: 'Cert. inscripción',
    render: (value) => <span className="font-mono text-gray-700">{value}</span>
  }
]

const CamposBus = ({ form, setCampo, errores }) => {
  // Se cargan al abrir el formulario: incluye los tipos recién creados en la otra pestaña
  const [tiposCarro, setTiposCarro] = useState([])
  const [cargandoTipos, setCargandoTipos] = useState(true)

  useEffect(() => {
    tiposCarroService.listar()
      .then((response) => setTiposCarro(response.tiposCarro || []))
      .catch((error) => toast.error(error.response?.data?.error || 'Error al cargar los tipos de carro'))
      .finally(() => setCargandoTipos(false))
  }, [])

  return (
    <div className="space-y-4">
      <Select
        label="Tipo de vehículo"
        required
        value={form.idTipoCarro}
        onChange={(e) => setCampo('idTipoCarro', e.target.value)}
        options={tiposCarro.map((tipo) => ({ value: tipo.id, label: tipo.nombre }))}
        placeholder={textoSelector({
          cargando: cargandoTipos,
          cantidad: tiposCarro.length,
          seleccionar: 'Seleccione el tipo de vehículo',
          vacio: 'No hay tipos de carro registrados (pestaña Tipos de carro)'
        })}
        error={errores.idTipoCarro}
      />
      <Input
        label="Número interno del bus"
        placeholder="Ej: 0100"
        value={form.numeroInterno}
        onChange={(e) => setCampo('numeroInterno', e.target.value)}
        error={errores.numeroInterno}
        maxLength={20}
        required
      />
      <Input
        label="Placa"
        placeholder="Ej: CAY715"
        value={form.placa}
        onChange={(e) => setCampo('placa', e.target.value.toUpperCase())}
        error={errores.placa}
        maxLength={10}
        required
      />
      <Input
        label="Marca"
        placeholder="Ej: Mercedes Benz"
        value={form.marca}
        onChange={(e) => setCampo('marca', e.target.value)}
        error={errores.marca}
        maxLength={50}
        required
      />
      <Input
        label="Certificado de inscripción"
        value={form.certificadoInscripcion}
        onChange={(e) => setCampo('certificadoInscripcion', e.target.value.toUpperCase())}
        error={errores.certificadoInscripcion}
        maxLength={30}
        required
      />
    </div>
  )
}

const BusesTab = () => (
  <FlotaCrud
    descripcion="Buses que se eligen al generar el manifiesto de encomiendas."
    nombreItem="bus"
    nombrePlural="buses"
    servicio={busesService}
    claveLista="buses"
    prefijoPermiso="BUSES"
    columnas={columnas}
    formularioVacio={{ idTipoCarro: '', numeroInterno: '', placa: '', marca: '', certificadoInscripcion: '' }}
    camposRequeridos={{
      idTipoCarro: 'El tipo de vehículo es requerido',
      numeroInterno: 'El número del bus es requerido',
      placa: 'La placa es requerida',
      marca: 'La marca es requerida',
      certificadoInscripcion: 'El certificado de inscripción es requerido'
    }}
    describir={(bus) => `${bus.numeroInterno} (${bus.placa})`}
    notaEliminar="Dejará de aparecer al generar manifiestos. Los manifiestos ya emitidos no cambian."
    CamposFormulario={CamposBus}
  />
)

export default BusesTab
