/**
 * Date Utilities - Utilidades centralizadas para manejo de fechas en Frontend
 *
 * REGLAS DE DISEÑO:
 * 1. Backend envía fechas en UTC (ISO 8601 con "Z")
 * 2. Frontend convierte a hora local SOLO para mostrar en UI
 * 3. Al enviar al backend, convertir a UTC antes de enviar
 *
 * TIMEZONE POR DEFECTO: America/Lima (Peru)
 */

// Timezone por defecto para el sistema (Peru)
const DEFAULT_TIMEZONE = 'America/Lima';

/**
 * Detecta el timezone del navegador del usuario
 * @returns {string} Timezone del navegador (ej: "America/Lima")
 */
export const detectUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return DEFAULT_TIMEZONE;
  }
};

/**
 * Formatea una fecha/hora UTC a hora local del usuario
 * @param {string|Date} utcDate - Fecha en formato ISO UTC o Date
 * @param {Object} options - Opciones de formato
 * @param {string} options.timezone - Timezone destino (default: America/Lima)
 * @param {boolean} options.includeTime - Incluir hora (default: true)
 * @param {boolean} options.includeSeconds - Incluir segundos (default: false)
 * @param {boolean} options.hour12 - Formato 12h (default: true)
 * @returns {string} Fecha formateada en hora local
 */
export const formatInTimezone = (utcDate, options = {}) => {
  if (!utcDate) return '--/--/----';

  const {
    timezone = DEFAULT_TIMEZONE,
    includeTime = true,
    includeSeconds = false,
    hour12 = true
  } = options;

  try {
    const date = utcDate instanceof Date ? utcDate : new Date(utcDate);

    if (isNaN(date.getTime())) {
      return '--/--/----';
    }

    const formatOptions = {
      timeZone: timezone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };

    if (includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
      formatOptions.hour12 = hour12;
      if (includeSeconds) {
        formatOptions.second = '2-digit';
      }
    }

    return new Intl.DateTimeFormat('es-PE', formatOptions).format(date);
  } catch {
    return utcDate?.toString() || '--/--/----';
  }
};

/**
 * Formatea solo la fecha (sin hora) de una fecha UTC
 * Evita problemas de timezone para fechas civiles (DATE de PostgreSQL)
 * @param {string|Date} dateValue - Fecha en formato ISO o Date
 * @returns {string} Fecha formateada "DD/MM/YYYY"
 */
export const formatDateOnly = (dateValue) => {
  if (!dateValue) return '--/--/----';

  try {
    // Si es string ISO, extraer solo la parte de fecha para evitar conversión de TZ
    const dateStr = typeof dateValue === 'string' ? dateValue : dateValue.toISOString();
    const soloFecha = dateStr.split('T')[0]; // "2026-01-24"
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`;
  } catch {
    return dateValue?.toString() || '--/--/----';
  }
};

/**
 * Formatea solo la hora de un campo TIME de PostgreSQL o un TIMESTAMP UTC
 *
 * DETECTA AUTOMÁTICAMENTE EL TIPO:
 * - Campos TIME: se almacenan como "1970-01-01T10:00:00.000Z" (año 1970)
 *   La hora representa hora civil (Peru), se extrae directamente con getUTCHours
 * - Timestamps UTC: fechas reales como "2026-01-30T19:43:00.000Z"
 *   Se convierte a hora de Peru usando Intl.DateTimeFormat
 *
 * @param {string|Date} timeValue - Valor del campo TIME o TIMESTAMP
 * @param {Object} options - Opciones de formato
 * @param {boolean} options.hour12 - Formato 12h (default: true)
 * @returns {string} Hora formateada "HH:mm" o "hh:mm AM/PM"
 */
export const formatTimeOnly = (timeValue, options = {}) => {
  if (!timeValue) return '--:--';

  const { hour12 = true } = options;

  try {
    const date = timeValue instanceof Date ? timeValue : new Date(timeValue);

    if (isNaN(date.getTime())) {
      return '--:--';
    }

    // Detectar si es un campo TIME (año 1970) o un timestamp real
    const isTimeField = date.getUTCFullYear() === 1970;

    let hours, minutes;

    if (isTimeField) {
      // Campo TIME de PostgreSQL: extraer UTC hours/minutes directamente
      // porque la hora civil de Peru se guarda como UTC en campos TIME
      hours = date.getUTCHours();
      minutes = date.getUTCMinutes();
    } else {
      // Timestamp UTC real: convertir a hora de Peru
      const formatter = new Intl.DateTimeFormat('es-PE', {
        timeZone: DEFAULT_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const parts = formatter.formatToParts(date);
      hours = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      minutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    }

    if (hour12) {
      const period = hours >= 12 ? 'p.m.' : 'a.m.';
      const hour12Val = hours % 12 || 12;
      return `${hour12Val.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return timeValue?.toString() || '--:--';
  }
};

/**
 * Formatea un instante (timestamp con zona) para mostrar en UI
 * @param {string|Date} timestamp - Timestamp ISO UTC
 * @param {string} timezone - Timezone destino (default: America/Lima)
 * @returns {string} Fecha y hora formateadas
 */
export const formatTimestamp = (timestamp, timezone = DEFAULT_TIMEZONE) => {
  return formatInTimezone(timestamp, {
    timezone,
    includeTime: true,
    hour12: true
  });
};

/**
 * Formatea fecha y hora civiles (guardadas como DATE y TIME en PostgreSQL)
 * para mostrar en UI correctamente.
 *
 * Los campos DATE y TIME de PostgreSQL representan valores civiles de Perú,
 * NO timestamps UTC. Esta función los combina y formatea sin conversión de TZ.
 *
 * @param {string|Date} dateValue - Fecha civil (DATE de PostgreSQL)
 * @param {string|Date} timeValue - Hora civil (TIME de PostgreSQL, opcional)
 * @param {Object} options - Opciones de formato
 * @param {boolean} options.hour12 - Formato 12h (default: true)
 * @returns {string} Fecha y hora formateadas "DD/MM/YYYY, hh:mm a.m./p.m."
 */
export const formatDateTimeCivil = (dateValue, timeValue = null, options = {}) => {
  if (!dateValue) return '--/--/----';

  const { hour12 = true } = options;

  try {
    // Extraer fecha (sin conversión de TZ)
    const dateStr = typeof dateValue === 'string' ? dateValue : dateValue.toISOString();
    const soloFecha = dateStr.split('T')[0]; // "2026-01-30"
    const [year, month, day] = soloFecha.split('-');
    const fechaFormateada = `${day}/${month}/${year}`;

    // Si no hay hora, retornar solo fecha
    if (!timeValue) {
      return fechaFormateada;
    }

    // Extraer hora (los campos TIME se guardan como 1970-01-01T con hora UTC)
    const timeDate = timeValue instanceof Date ? timeValue : new Date(timeValue);
    if (isNaN(timeDate.getTime())) {
      return fechaFormateada;
    }

    // Para campos TIME, la hora se guarda como UTC en 1970-01-01
    // Extraemos directamente los componentes UTC porque representan hora civil de Perú
    const hours = timeDate.getUTCHours();
    const minutes = timeDate.getUTCMinutes();

    let horaFormateada;
    if (hour12) {
      const period = hours >= 12 ? 'p.m.' : 'a.m.';
      const hour12Val = hours % 12 || 12;
      horaFormateada = `${hour12Val.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    } else {
      horaFormateada = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    return `${fechaFormateada}, ${horaFormateada}`;
  } catch {
    return dateValue?.toString() || '--/--/----';
  }
};

/**
 * Convierte una fecha local seleccionada por el usuario a ISO UTC
 * Usar antes de enviar al backend
 * @param {string} localDateStr - Fecha en formato "YYYY-MM-DD"
 * @param {string} localTimeStr - Hora en formato "HH:mm" (opcional)
 * @param {string} timezone - Timezone de origen (default: America/Lima)
 * @returns {string} ISO 8601 con "Z"
 */
export const localToUtcIso = (localDateStr, localTimeStr = '00:00', timezone = DEFAULT_TIMEZONE) => {
  if (!localDateStr) return null;

  try {
    // Crear fecha/hora como string con timezone explícito
    const [year, month, day] = localDateStr.split('-').map(Number);
    const [hours, minutes] = localTimeStr.split(':').map(Number);

    // Crear Date usando Intl para manejar el timezone correctamente
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Crear fecha en el timezone especificado
    const localDate = new Date(year, month - 1, day, hours, minutes, 0);

    // Obtener offset del timezone
    const parts = formatter.formatToParts(localDate);
    const getPart = (type) => parts.find(p => p.type === type)?.value;

    // Retornar ISO UTC
    return localDate.toISOString();
  } catch (error) {
    console.error('Error convirtiendo fecha local a UTC:', error);
    return null;
  }
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (hora local)
 * @returns {string} Fecha actual "YYYY-MM-DD"
 */
export const getTodayDateString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Obtiene la fecha actual en Peru en formato YYYY-MM-DD
 * @returns {string} Fecha actual en Peru "YYYY-MM-DD"
 */
export const getTodayInPeru = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: DEFAULT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now);
};

/**
 * Verifica si una fecha (YYYY-MM-DD) es anterior a hoy en Peru
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @returns {boolean}
 */
export const isBeforeToday = (dateStr) => {
  const todayPeru = getTodayInPeru();
  return dateStr < todayPeru;
};

/**
 * Objeto con headers para enviar al backend (para observabilidad)
 * @returns {Object} Headers con timezone del cliente
 */
export const getTimezoneHeaders = () => {
  const tz = detectUserTimezone();
  const offset = new Date().getTimezoneOffset();

  return {
    'X-Client-Timezone': tz,
    'X-Client-Offset': offset.toString()
  };
};

export default {
  detectUserTimezone,
  formatInTimezone,
  formatDateOnly,
  formatTimeOnly,
  formatTimestamp,
  formatDateTimeCivil,
  localToUtcIso,
  getTodayDateString,
  getTodayInPeru,
  isBeforeToday,
  getTimezoneHeaders,
  DEFAULT_TIMEZONE
};
