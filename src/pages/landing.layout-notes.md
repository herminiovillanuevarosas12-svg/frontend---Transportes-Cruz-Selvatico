# Landing Page - Blueprint Visual y Componentes

> Documento generado a partir del análisis visual de referencia.
> Solo se replica la ESTRUCTURA y ESTÉTICA, no el contenido ni las imágenes.

---

## 1. ESTRUCTURA GENERAL DE LA LANDING

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER (Sticky, fondo blanco con sombra al scroll)                     │
├─────────────────────────────────────────────────────────────────────────┤
│  HERO SECTION                                                            │
│  ├── BannerCarousel (existente)                                         │
│  └── SearchForm (buscador de pasajes - existente)                       │
├─────────────────────────────────────────────────────────────────────────┤
│  SERVICES SECTION (Nuestros Servicios)                                   │
│  ├── Título de sección                                                  │
│  └── Grid 4 columnas con cards de servicios                             │
├─────────────────────────────────────────────────────────────────────────┤
│  DESTINATIONS SHOWCASE (Destinos Populares)                              │
│  ├── Título de sección                                                  │
│  └── Grid 4-5 columnas con cards de destino                             │
├─────────────────────────────────────────────────────────────────────────┤
│  ENCOMIENDA INFO (Envío de Encomiendas)                                  │
│  ├── Título de sección                                                  │
│  ├── Grid de beneficios (6 cards icono + texto)                         │
│  └── CTA para tracking                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  EXPERIENCE SECTION (Experiencia de Viaje)                               │
│  ├── Imagen grande lado izquierdo                                       │
│  └── Texto descriptivo lado derecho con bullets                         │
├─────────────────────────────────────────────────────────────────────────┤
│  GALLERY SECTION (Galería - CONFIGURABLE)                                │
│  ├── Título de sección                                                  │
│  └── Carrusel de imágenes desde admin                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  FOOTER (Mega footer con 4 columnas)                                     │
│  ├── Logo + descripción                                                 │
│  ├── Enlaces rápidos                                                    │
│  ├── Contacto                                                           │
│  └── Redes sociales                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. COMPONENTES REACT PROPUESTOS

### 2.1 ServicesSection.jsx
**Tipo:** ESTÁTICO (contenido hardcodeado)

```jsx
// Props
interface ServicesSectionProps {
  // Sin props - contenido estático
}

// Estructura interna
const servicios = [
  {
    icon: 'Bus',           // lucide-react icon
    titulo: 'Servicio Premier',
    descripcion: 'Viaja con el máximo confort...',
    color: 'primary'       // Tailwind color theme
  },
  {
    icon: 'Star',
    titulo: 'Servicio Ejecutivo',
    descripcion: 'Calidad y puntualidad...',
    color: 'secondary'
  },
  // ... más servicios
]
```

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│                    NUESTROS SERVICIOS                        │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │
│  │   [ICON]   │  │   [ICON]   │  │   [ICON]   │  │ [ICON] │ │
│  │            │  │            │  │            │  │        │ │
│  │  Premier   │  │  Ejecutivo │  │  Económico │  │ Carga  │ │
│  │            │  │            │  │            │  │        │ │
│  │ Descripción│  │ Descripción│  │ Descripción│  │ Desc.  │ │
│  │   breve    │  │   breve    │  │   breve    │  │ breve  │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Estilos:**
- Fondo: `bg-gray-50`
- Cards: `bg-white rounded-2xl shadow-md hover:shadow-lg transition`
- Iconos: Círculo con fondo de color + icono blanco
- Responsive: 1 col (mobile), 2 col (tablet), 4 col (desktop)

---

### 2.2 DestinationsShowcase.jsx
**Tipo:** ESTÁTICO (usa datos de puntos existentes)

```jsx
// Props
interface DestinationsShowcaseProps {
  puntos: Punto[]  // Datos de publicService.getPuntos()
}

// Cada card muestra
interface DestinoCard {
  nombre: string       // nombre del punto
  imagen: string       // imagen genérica de la ciudad (estática)
  rutasCount: number   // cantidad de rutas que llegan
}
```

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│                   DESCUBRE NUESTROS DESTINOS                 │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ [IMAGE] │  │ [IMAGE] │  │ [IMAGE] │  │ [IMAGE] │        │
│  │         │  │         │  │         │  │         │        │
│  │ ─────── │  │ ─────── │  │ ─────── │  │ ─────── │        │
│  │ Ciudad1 │  │ Ciudad2 │  │ Ciudad3 │  │ Ciudad4 │        │
│  │ X rutas │  │ X rutas │  │ X rutas │  │ X rutas │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                              │
│                    [Ver todos los destinos]                  │
└──────────────────────────────────────────────────────────────┘
```

**Estilos:**
- Fondo sección: `bg-white`
- Cards: `rounded-xl overflow-hidden shadow-lg`
- Imagen: `aspect-[4/3] object-cover`
- Overlay gradient en imagen para texto
- Hover: scale transform + shadow increase

---

### 2.3 EncomiendaInfoSection.jsx
**Tipo:** ESTÁTICO (contenido hardcodeado)

```jsx
// Props
interface EncomiendaInfoProps {
  // Sin props - contenido estático
}

// Estructura interna - beneficios
const beneficios = [
  { icon: 'Shield', titulo: 'Seguro incluido', desc: 'Tus envíos protegidos' },
  { icon: 'Clock', titulo: 'Puntualidad', desc: 'Entrega en tiempo' },
  { icon: 'MapPin', titulo: 'Tracking', desc: 'Seguimiento en tiempo real' },
  { icon: 'Package', titulo: 'Embalaje', desc: 'Cuidamos tus paquetes' },
  { icon: 'Phone', titulo: 'Notificaciones', desc: 'Te avisamos cada paso' },
  { icon: 'DollarSign', titulo: 'Precios justos', desc: 'Tarifas competitivas' }
]
```

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│              ENVÍA TUS ENCOMIENDAS CON NOSOTROS              │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  [ICON]  │  │  [ICON]  │  │  [ICON]  │                   │
│  │ Seguro   │  │Puntualidad│  │ Tracking │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  [ICON]  │  │  [ICON]  │  │  [ICON]  │                   │
│  │ Embalaje │  │  Avisos  │  │ Precios  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                              │
│              [  RASTREAR MI ENCOMIENDA  ]                    │
└──────────────────────────────────────────────────────────────┘
```

**Estilos:**
- Fondo: Gradiente `from-primary-600 to-primary-800` o imagen de fondo
- Texto: Blanco
- Cards beneficio: `bg-white/10 backdrop-blur rounded-xl`
- Grid: 3 columnas (2 filas)
- CTA button: `bg-white text-primary-700 hover:bg-primary-50`

---

### 2.4 ExperienceSection.jsx
**Tipo:** ESTÁTICO (contenido hardcodeado)

```jsx
// Props - ninguna, todo estático
```

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────────────────────┐  ┌────────────────────────────────┐│
│  │                     │  │  HAZ DE TUS VIAJES UNA GRAN    ││
│  │                     │  │        EXPERIENCIA             ││
│  │      [IMAGEN]       │  │                                ││
│  │    (bus/interior)   │  │  ✓ Asientos reclinables        ││
│  │                     │  │  ✓ Aire acondicionado          ││
│  │                     │  │  ✓ Buses modernos              ││
│  │                     │  │  ✓ Conductores capacitados     ││
│  │                     │  │                                ││
│  │                     │  │  [  VER HORARIOS  ]            ││
│  └─────────────────────┘  └────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Estilos:**
- Layout: Flex row (reverse en mobile)
- Imagen: `rounded-2xl shadow-2xl` con aspect ratio
- Checks: Iconos verdes con texto
- Responsive: Stack vertical en mobile

---

### 2.5 GallerySection.jsx
**Tipo:** CONFIGURABLE (desde admin)

```jsx
// Props
interface GallerySectionProps {
  imagenes: GalleryImage[]  // Desde API
}

interface GalleryImage {
  id: number
  imagen_path: string
  titulo?: string
  orden: number
}
```

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│                       NUESTRA GALERÍA                        │
│                                                              │
│  ◄  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ►  │
│     │         │  │         │  │         │  │         │      │
│     │ [IMG 1] │  │ [IMG 2] │  │ [IMG 3] │  │ [IMG 4] │      │
│     │         │  │         │  │         │  │         │      │
│     └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
│                                                              │
│                      ● ○ ○ ○ ○                               │
└──────────────────────────────────────────────────────────────┘
```

**Estilos:**
- Carrusel con scroll horizontal
- Flechas de navegación en los lados
- Indicadores de posición abajo
- Imágenes: `rounded-xl shadow-lg`
- Auto-scroll opcional (configurable)

**Backend:**
- Reusar/extender `tbl_landing_banners` con campo `tipo` ('banner' | 'gallery')
- O crear tabla separada `tbl_landing_gallery` (más limpio)

---

## 3. MAPEO ESTÁTICO vs CONFIGURABLE

| Sección | Tipo | Fuente de datos |
|---------|------|-----------------|
| Header | Estático | - |
| BannerCarousel | Configurable | `tbl_landing_banners` (existente) |
| SearchForm | Estático | `publicService.getPuntos()` |
| ServicesSection | Estático | Hardcodeado |
| DestinationsShowcase | Semi-estático | `publicService.getPuntos()` + imágenes estáticas |
| EncomiendaInfoSection | Estático | Hardcodeado |
| ExperienceSection | Estático | Hardcodeado + imagen estática |
| GallerySection | **Configurable** | Nueva tabla o extensión |
| Footer | Semi-dinámico | `tbl_configuracion_sistema` |

---

## 4. ESTRUCTURA DE ARCHIVOS A CREAR

```
Frontend---Transporte---Herminio/src/
├── components/
│   └── landing/
│       ├── ServicesSection.jsx        [NUEVO]
│       ├── DestinationsShowcase.jsx   [NUEVO]
│       ├── EncomiendaInfoSection.jsx  [NUEVO]
│       ├── ExperienceSection.jsx      [NUEVO]
│       └── GallerySection.jsx         [NUEVO]
└── pages/
    └── landing.jsx                    [MODIFICAR]
```

---

## 5. PALETA DE COLORES Y ESTILOS

Siguiendo el sistema existente de Tailwind:

```css
/* Colores principales (ya definidos en tailwind.config) */
primary: verde corporativo
secondary: tonos complementarios

/* Fondos de sección alternados */
Section 1: bg-white
Section 2: bg-gray-50
Section 3: bg-gradient-primary (o imagen)
Section 4: bg-white
Section 5: bg-gray-50

/* Espaciado de secciones */
padding-y: py-16 md:py-24

/* Títulos de sección */
font-size: text-3xl md:text-4xl
font-weight: font-bold
margin-bottom: mb-12
text-align: text-center
```

---

## 6. RESPONSIVE BREAKPOINTS

```
Mobile (< 640px):
- 1 columna para grids
- Stack vertical para layouts 2-col
- Padding reducido

Tablet (640px - 1024px):
- 2 columnas para grids
- Layout original con menos espacio

Desktop (> 1024px):
- 3-4 columnas para grids
- Layout completo con espaciado generoso
```

---

## 7. ORDEN DE IMPLEMENTACIÓN

1. **ServicesSection** - Grid simple con cards
2. **DestinationsShowcase** - Cards con imágenes estáticas
3. **EncomiendaInfoSection** - Grid de beneficios + CTA
4. **ExperienceSection** - Layout 2 columnas
5. **GallerySection** - Carrusel (requiere backend)
6. **Integrar todo en landing.jsx**
7. **Cleanup** - Eliminar código obsoleto

---

## 8. NOTAS IMPORTANTES

- **NO copiar** imágenes, logos ni contenido textual de la referencia
- **NO copiar** funcionalidad específica (compra online, etc.)
- Solo replicar **estructura visual** y **disposición de elementos**
- Usar **imágenes placeholder** o genéricas de Unsplash/Pexels
- Mantener la **identidad visual** de Cruz Selvatico
- El contenido textual debe ser **original** y relevante para el negocio
