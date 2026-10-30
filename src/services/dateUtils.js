export const COMMON_TIMEZONES = [
  { value: 'auto', label: 'Detección Automática (Navegador)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (-03:00)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (-03:00)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (-06:00)' },
  { value: 'America/Bogota', label: 'Bogotá / Lima (-05:00)' },
  { value: 'America/Santiago', label: 'Santiago de Chile (-03:00)' },
  { value: 'America/New_York', label: 'Nueva York (EDT/EST)' },
  { value: 'Europe/Madrid', label: 'Madrid / Barcelona (CET/CEST)' },
  { value: 'Europe/London', label: 'Londres (GMT/BST)' },
  { value: 'UTC', label: 'UTC (00:00)' }
];

export const formatSessionDateTime = (dateStr, timeZone = 'UTC') => {
  if (!dateStr) return { shortDate: '--', shortTime: '--', dateFormatted: '--', timeFormatted: '--', full: '--' };

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { shortDate: '--', shortTime: '--', dateFormatted: '--', timeFormatted: '--', full: '--' };
    }

    const effectiveTz =
      timeZone && timeZone !== 'auto'
        ? timeZone
        : Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    const dayName = new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      timeZone: effectiveTz
    })
      .format(date)
      .replace('.', '');
    const day = new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      timeZone: effectiveTz
    }).format(date);
    const monthNum = new Intl.DateTimeFormat('es-ES', {
      month: '2-digit',
      timeZone: effectiveTz
    }).format(date);
    const monthShort = new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      timeZone: effectiveTz
    }).format(date);

    const shortTime = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: effectiveTz
    }).format(date);

    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const shortDate = `${capitalizedDay} ${day}/${monthNum}`;
    const dateFormatted = `${capitalizedDay} ${day} ${monthShort}`;
    const full = `${dateFormatted} - ${shortTime} hs`;

    return {
      shortDate,
      shortTime,
      dateFormatted,
      timeFormatted: `${shortTime} hs`,
      full,
      rawDate: date
    };
  } catch {
    return { shortDate: '--', shortTime: '--', dateFormatted: '--', timeFormatted: '--', full: '--' };
  }
};

export const getSessionStatus = (startDateStr, endDateStr) => {
  if (!startDateStr) return 'upcoming';
  const now = new Date().getTime();
  const start = new Date(startDateStr).getTime();
  const end = endDateStr ? new Date(endDateStr).getTime() : start + 90 * 60 * 1000;

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
