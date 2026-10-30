const FAVORITES_KEY = 'f1_favorites';
const TIMEZONE_KEY = 'f1_timezone_pref';

const dispatchStorageEvent = (key, value) => {
  window.dispatchEvent(new CustomEvent('f1_storage_change', { detail: { key, value } }));
};

export const storage = {
  getFavorites: () => {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isFavorite: (driverId) => {
    const list = storage.getFavorites();
    const idStr = String(driverId).toLowerCase();
    return list.some((item) => String(item).toLowerCase() === idStr);
  },

  toggleFavorite: (driverId) => {
    const list = storage.getFavorites();
    const idStr = String(driverId).toLowerCase();
    const updated = list.some((item) => String(item).toLowerCase() === idStr)
      ? list.filter((item) => String(item).toLowerCase() !== idStr)
      : [...list, idStr];

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    dispatchStorageEvent(FAVORITES_KEY, updated);
    return updated;
  },

  getTimezone: () => {
    try {
      const pref = localStorage.getItem(TIMEZONE_KEY);
      if (pref && pref !== 'auto') {
        return pref;
      }
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  },

  getTimezonePreferenceMode: () => {
    return localStorage.getItem(TIMEZONE_KEY) || 'auto';
  },

  setTimezone: (timezone) => {
    try {
      localStorage.setItem(TIMEZONE_KEY, timezone);
      dispatchStorageEvent(TIMEZONE_KEY, timezone);
    } catch (e) {
      console.error('Error saving timezone:', e);
    }
  }
};
