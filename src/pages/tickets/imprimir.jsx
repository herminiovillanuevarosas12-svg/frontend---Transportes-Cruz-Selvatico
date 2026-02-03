/**
 * Ticket Print Page
 * Vista de impresion de ticket
 */

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ticketsService from '../../services/ticketsService'
import facturacionService from '../../services/facturacionService'
import { TicketPrint } from '../../components/common'
import { Printer, ArrowLeft, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const TicketImprimirPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [datosEmpresa, setDatosEmpresa] = useState(null)
  const printRef = useRef()

  useEffect(() => {
    cargarTicket()
    // Cargar datos de empresa para impresión
    facturacionService.obtenerConfiguracion()
      .then(res => setDatosEmpresa(res.configuracion))
      .catch(() => {})
  }, [id])

  const cargarTicket = async () => {
    try {
      setLoading(true)
      const response = await ticketsService.imprimir(id)
      setTicket(response.ticket)
    } catch (error) {
      console.error('Error cargando ticket:', error)
      toast.error('Error al cargar ticket')
      navigate('/tickets')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader className="w-6 h-6 animate-spin" />
          <span>Cargando ticket...</span>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ticket no encontrado</p>
          <button
            onClick={() => navigate('/tickets')}
            className="text-blue-600 hover:underline"
          >
            Volver a tickets
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - No se imprime */}
      <div className="no-print bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/tickets')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-5 h-5" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Vista previa en pantalla - No se imprime */}
      <div className="no-print max-w-4xl mx-auto p-8">
        <div ref={printRef} className="bg-white rounded-xl shadow-sm">
          <TicketPrint ticket={ticket} empresa={datosEmpresa} />
        </div>
      </div>

      {/* Area de impresion - Solo visible al imprimir */}
      <div id="ticket-print-container" className="print-area">
        <TicketPrint ticket={ticket} empresa={datosEmpresa} />
      </div>
    </div>
  )
}

export default TicketImprimirPage
