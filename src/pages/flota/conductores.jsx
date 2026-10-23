/**
 * Pestaña Conductores
 * Conductores que se eligen al generar el manifiesto de encomiendas
 */

import { Input, DocumentoIdentidadInput } from '../../components/common'
import { conductoresService } from '../../services/flotaService'
import { CODIGO_DNI, CODIGO_CE, TIPOS_DOCUMENTO, siglaDocumento } from '../../utils/documentoIdentidad'
import FlotaCrud from './FlotaCrud'

// El conductor es una persona: DNI o carnet de extranjería
const TIPOS_DOCUMENTO_CONDUCTOR = TIPOS_DOCUMENTO.filter((t) => [CODIGO_DNI, CODIGO_CE].includes(t.codigo))

const columnas = [
  {
    key: 'nombreCompleto',
    header: 'Conductor',
    render: (value) => <span className="font-medium text-gray-900">{value}</span>
  },
  {
    key: 'numeroDocumento',
    header: 'Documento',
    render: (value) => <span className="text-gray-600">{siglaDocumento(value)} {value}</span>
  },
  {
    key: 'licencia',
    header: 'Licencia',
    render: (value) => <span className="font-mono text-gray-700">{value}</span>
  }
]

const CamposConductor = ({ form, setCampo, errores }) => (
  <div className="space-y-4">
    <div>
      <DocumentoIdentidadInput
        name="conductor"
        tipo={form.tipoDocumento}
        numero={form.numeroDocumento}
        tipos={TIPOS_DOCUMENTO_CONDUCTOR}
        onChange={({ tipo, numero }) => {
          setCampo('tipoDocumento', tipo)
          setCampo('numeroDocumento', numero)
        }}
      />
      {errores.numeroDocumento && <p className="text-sm text-red-600 mt-1">{errores.numeroDocumento}</p>}
    </div>
    <Input
      label="Nombres"
      value={form.nombres}
      onChange={(e) => setCampo('nombres', e.target.value)}
      error={errores.nombres}
      maxLength={150}
      required
    />
    <Input
      label="Apellidos"
      value={form.apellidos}
      onChange={(e) => setCampo('apellidos', e.target.value)}
      error={errores.apellidos}
      maxLength={150}
      required
    />
    <Input
      label="Licencia de conducir"
      value={form.licencia}
      onChange={(e) => setCampo('licencia', e.target.value.toUpperCase())}
      error={errores.licencia}
      maxLength={20}
      required
    />
  </div>
)

const ConductoresTab = () => (
  <FlotaCrud
    descripcion="Conductores que se eligen al generar el manifiesto de encomiendas."
    nombreItem="conductor"
    nombrePlural="conductores"
    servicio={conductoresService}
    claveLista="conductores"
    prefijoPermiso="CONDUCTORES"
    columnas={columnas}
    formularioVacio={{ tipoDocumento: CODIGO_DNI, numeroDocumento: '', nombres: '', apellidos: '', licencia: '' }}
    camposRequeridos={{
      numeroDocumento: 'El documento es requerido',
      nombres: 'Los nombres son requeridos',
      apellidos: 'Los apellidos son requeridos',
      licencia: 'La licencia es requerida'
    }}
    describir={(conductor) => conductor.nombreCompleto}
    notaEliminar="Dejará de aparecer al generar manifiestos. Los manifiestos ya emitidos no cambian."
    CamposFormulario={CamposConductor}
  />
)

export default ConductoresTab
