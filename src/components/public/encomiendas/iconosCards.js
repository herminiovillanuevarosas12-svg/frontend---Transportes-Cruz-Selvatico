/**
 * Íconos disponibles para las cards de /encomiendas-info
 * (se muestran cuando la card no tiene imagen). Única fuente para la vista pública y el editor.
 */

import {
  Package,
  Truck,
  Globe,
  Shield,
  MapPin,
  Search,
  Clock,
  Zap,
  Heart,
  Star,
  Eye,
} from 'lucide-react'

// El primero es el ícono por defecto
export const ICONOS_CARDS = [
  { key: 'Package', Icono: Package, label: 'Paquete' },
  { key: 'Truck', Icono: Truck, label: 'Camión' },
  { key: 'Globe', Icono: Globe, label: 'Global' },
  { key: 'Shield', Icono: Shield, label: 'Seguridad' },
  { key: 'MapPin', Icono: MapPin, label: 'Ubicación' },
  { key: 'Search', Icono: Search, label: 'Búsqueda' },
  { key: 'Clock', Icono: Clock, label: 'Reloj' },
  { key: 'Zap', Icono: Zap, label: 'Rápido' },
  { key: 'Heart', Icono: Heart, label: 'Corazón' },
  { key: 'Star', Icono: Star, label: 'Estrella' },
  { key: 'Eye', Icono: Eye, label: 'Ojo' },
]

const ICONOS_POR_KEY = Object.fromEntries(ICONOS_CARDS.map(({ key, Icono }) => [key, Icono]))

/** Componente del ícono guardado en la card, o el ícono por defecto */
export const obtenerIconoCard = (key) => ICONOS_POR_KEY[key] || ICONOS_CARDS[0].Icono
