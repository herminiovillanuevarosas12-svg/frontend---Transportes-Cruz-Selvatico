/**
 * QRGenerator Component
 * Generador de codigos QR
 */

import { QRCodeSVG } from 'qrcode.react'

const QRGenerator = ({
  value,
  size = 200,
  level = 'M',
  includeMargin = true,
  bgColor = '#ffffff',
  fgColor = '#000000',
  className = ''
}) => {
  if (!value) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-400 text-sm">Sin codigo</span>
      </div>
    )
  }

  return (
    <div className={`inline-block p-2 bg-white rounded-lg shadow-sm ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        includeMargin={includeMargin}
        bgColor={bgColor}
        fgColor={fgColor}
      />
    </div>
  )
}

export default QRGenerator
