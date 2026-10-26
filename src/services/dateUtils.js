// Utility functions for timezone conversions, date formatting, and countdown calculations

export const COMMON_TIMEZONES = [
  { value: 'auto', label: 'Detección Automática (Navegador)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/Bogota', label: 'Bogotá / Lima (GMT-5)' },
  { value: 'America/Santiago', label: 'Santiago de Chile (GMT-3)' },
  { value: 'America/New_York', label: 'Nueva York (EDT/EST)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (PDT/PST)' },
  { value: 'Europe/Madrid', label: 'Madrid / Barcelona (CET/CEST)' },
  { value: 'Europe/London', label: 'Londres (GMT/BST)' },
  { value: 'Europe/Rome', label: 'Roma / Milán (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokio (JST GMT+9)' },
  { value: 'Australia/Sydney', label: 'Sídney (AEST GMT+10)' },
  { value: 'UTC', label: 'Hora UTC (Tiempo Universal Coordinado)' }
];

export const formatSessionDateTime = (dateStr, timeZone = 'UTC') => {
  if (!dateStr) return { dateFormatted: '--', timeFormatted: '--', full: '--' };

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { dateFormatted: '--', timeFormatted: '--', full: '--' };

    const effectiveTz = (timeZone && timeZone !== 'auto') 
      ? timeZone 
      : (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');

    const dayName = new Intl.DateTimeFormat('es-ES', { weekday: 'short', timeZone: effectiveTz }).format(date);
    const day = new Intl.DateTimeFormat('es-ES', { day: 'numeric', timeZone: effectiveTz }).format(date);
    const month = new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: effectiveTz }).format(date);

    const timeFormatted = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: effectiveTz
    }).format(date);

    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const dateFormatted = `${capitalizedDay} ${day} ${month}`;
    const full = `${dateFormatted} - ${timeFormatted} hs`;

    return {
      dateFormatted,
      timeFormatted: `${timeFormatted} hs`,
      full,
      rawDate: date
    };
  } catch (err) {
    console.error('Date format error:', err);
    return { dateFormatted: '--', timeFormatted: '--', full: '--' };
  }
};

export const getSessionStatus = (startDateStr, endDateStr) => {
  if (!startDateStr) return 'upcoming';
  const now = new Date().getTime();
  const start = new Date(startDateStr).getTime();
  const end = endDateStr ? new Date(endDateStr).getTime() : start + (90 * 60 * 1000); // 1.5h default

  if (now > end) return 'finished';
  if (now >= start && now <= end) return 'live';
  return 'upcoming';
};

export const calculateCountdown = (targetDateStr) => {
  if (!targetDateStr) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, totalMs: 0 };
  }

  const target = new Date(targetDateStr).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, totalMs: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isPast: false, totalMs: diff };
};
