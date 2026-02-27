const WhatsAppFloat = ({ whatsapp }) => {
  if (!whatsapp) return null

  const numero = whatsapp.replace(/[^0-9]/g, '')
  if (!numero) return null

  return (
    <a
      href={`https://wa.me/${numero}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-6 z-40 group"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />

      {/* Button */}
      <div className="relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.908 15.908 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.316 22.594c-.39 1.1-1.932 2.014-3.168 2.28-.846.18-1.95.324-5.668-1.218-4.762-1.972-7.826-6.802-8.064-7.114-.23-.312-1.932-2.572-1.932-4.904s1.222-3.478 1.656-3.956c.434-.478.948-.598 1.264-.598.316 0 .632.002.908.016.292.016.684-.11 1.07.816.39.94 1.326 3.234 1.442 3.468.116.234.194.506.038.818-.156.312-.234.506-.468.78-.234.274-.49.612-.702.822-.234.234-.478.488-.206.958.274.468 1.218 2.008 2.614 3.254 1.794 1.6 3.306 2.096 3.774 2.33.468.234.742.194 1.014-.118.274-.312 1.17-1.364 1.482-1.834.312-.468.624-.39 1.054-.234.434.156 2.726 1.286 3.194 1.52.468.234.78.35.896.546.116.194.116 1.132-.274 2.232z"/>
        </svg>
      </div>

      {/* Tooltip */}
      <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Escríbenos
      </span>
    </a>
  )
}

export default WhatsAppFloat
