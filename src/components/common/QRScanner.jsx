/**
 * QRScanner Component
 * Escaner de codigos QR con camara
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff, RefreshCw } from 'lucide-react'
import Button from './Button'

const QRScanner = ({
  onScan,
  onError,
  fps = 10,
  qrbox = 250,
  className = ''
}) => {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState(null)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [containerSize, setContainerSize] = useState({ width: 300, height: 300 })
  const scannerRef = useRef(null)
  const scanLockRef = useRef(false)
  const containerRef = useRef(null)
  const scannerContainerId = 'qr-scanner-container'

  // Calcular tamano responsivo del container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement?.clientWidth || 300
        const size = Math.min(parentWidth - 16, 400)
        setContainerSize({ width: size, height: size })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices)
          const backCamera = devices.find(
            (cam) => cam.label.toLowerCase().includes('back') || cam.label.toLowerCase().includes('trasera')
          )
          setSelectedCamera(backCamera?.id || devices[0].id)
        } else {
          setError('No se encontraron camaras disponibles')
        }
      })
      .catch((err) => {
        setError('No se pudo acceder a las camaras. Verifique los permisos.')
        console.error('Error getting cameras:', err)
      })

    return () => {
      stopScanner()
    }
  }, [])

  const getQrBoxSize = useCallback(() => {
    // El qrbox debe ser menor que el container
    const maxSize = Math.min(containerSize.width, containerSize.height) - 50
    const size = Math.min(qrbox, maxSize)
    return Math.max(size, 150) // Minimo 150px
  }, [containerSize, qrbox])

  const startScanner = async () => {
    if (!selectedCamera) {
      setError('No hay camara seleccionada')
      return
    }

    try {
      setError(null)

      // Limpiar scanner previo si existe
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop()
          }
          await scannerRef.current.clear()
        } catch (e) {
          // Ignorar errores de limpieza
        }
        scannerRef.current = null
      }

      // Verificar que el container existe en el DOM
      const containerElement = document.getElementById(scannerContainerId)
      if (!containerElement) {
        setError('Error interno: container no encontrado')
        return
      }

      // Limpiar contenido previo del container (evitar conflictos con React)
      containerElement.innerHTML = ''

      scannerRef.current = new Html5Qrcode(scannerContainerId)

      const qrBoxSize = getQrBoxSize()

      await scannerRef.current.start(
        selectedCamera,
        {
          fps,
          qrbox: { width: qrBoxSize, height: qrBoxSize },
          aspectRatio: 1.0
        },
        (decodedText) => {
          if (scanLockRef.current) return
          scanLockRef.current = true
          onScan && onScan(decodedText)
          setTimeout(() => { scanLockRef.current = false }, 3000)
        },
        () => {
          // Errores de escaneo (QR no encontrado en frame) - se ignoran
        }
      )

      setIsScanning(true)
    } catch (err) {
      console.error('Error starting scanner:', err)
      const errorMsg = err?.message || String(err)
      if (errorMsg.includes('Permission') || errorMsg.includes('NotAllowed')) {
        setError('Permiso de camara denegado. Verifique la configuracion del navegador.')
      } else if (errorMsg.includes('NotFound') || errorMsg.includes('DevicesNotFound')) {
        setError('No se encontro la camara seleccionada.')
      } else if (errorMsg.includes('NotReadable') || errorMsg.includes('TrackStartError')) {
        setError('La camara esta en uso por otra aplicacion.')
      } else {
        setError('Error al iniciar la camara. Intente con otra camara.')
      }
      onError && onError(err)
    }
  }

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        await scannerRef.current.clear()
        scannerRef.current = null
      }
    } catch (err) {
      console.error('Error stopping scanner:', err)
    }
    setIsScanning(false)
  }

  const switchCamera = async () => {
    if (cameras.length <= 1) return

    const currentIndex = cameras.findIndex((cam) => cam.id === selectedCamera)
    const nextIndex = (currentIndex + 1) % cameras.length
    const newCameraId = cameras[nextIndex].id
    setSelectedCamera(newCameraId)

    if (isScanning) {
      await stopScanner()
      // Esperar un momento para que el DOM se estabilice
      setTimeout(async () => {
        try {
          const containerElement = document.getElementById(scannerContainerId)
          if (containerElement) containerElement.innerHTML = ''

          scannerRef.current = new Html5Qrcode(scannerContainerId)
          const qrBoxSize = getQrBoxSize()

          await scannerRef.current.start(
            newCameraId,
            {
              fps,
              qrbox: { width: qrBoxSize, height: qrBoxSize },
              aspectRatio: 1.0
            },
            (decodedText) => {
              if (scanLockRef.current) return
              scanLockRef.current = true
              onScan && onScan(decodedText)
              setTimeout(() => { scanLockRef.current = false }, 3000)
            },
            () => {}
          )
          setIsScanning(true)
        } catch (err) {
          setError('Error al cambiar de camara')
          console.error('Error switching camera:', err)
        }
      }, 200)
    }
  }

  return (
    <div ref={containerRef} className={`flex flex-col items-center w-full ${className}`}>
      {/* Scanner Container */}
      <div className="relative w-full flex justify-center">
        <div
          id={scannerContainerId}
          className="overflow-hidden rounded-xl bg-gray-900"
          style={{ width: containerSize.width, height: containerSize.height }}
        />
        {/* Overlay cuando esta detenido - fuera del container del scanner */}
        {!isScanning && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-xl pointer-events-none"
            style={{ width: containerSize.width, height: containerSize.height, left: '50%', transform: 'translateX(-50%)' }}
          >
            <Camera className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-500 text-sm">Camara detenida</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm text-center max-w-xs">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="mt-4 flex items-center gap-3">
        {!isScanning ? (
          <Button
            onClick={startScanner}
            icon={Camera}
            disabled={!selectedCamera}
          >
            Iniciar Camara
          </Button>
        ) : (
          <Button
            onClick={stopScanner}
            variant="secondary"
            icon={CameraOff}
          >
            Detener
          </Button>
        )}

        {cameras.length > 1 && (
          <Button
            onClick={switchCamera}
            variant="outline"
            icon={RefreshCw}
          >
            Cambiar Camara
          </Button>
        )}
      </div>

      {/* Camera selector for multiple cameras */}
      {cameras.length > 1 && (
        <div className="mt-3">
          <select
            value={selectedCamera || ''}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
            disabled={isScanning}
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camara ${camera.id}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

export default QRScanner
