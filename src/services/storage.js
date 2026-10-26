// Storage service for F1 Hub Dashboard
// Manages local state persistence in localStorage according to document specifications

const FAVORITES_KEY = 'f1_favorites';
const TIMEZONE_KEY = 'f1_timezone_pref';
const COMMENTS_KEY = 'f1_race_comments';

// Event dispatch for cross-component reactive updates
const dispatchStorageEvent = (key, value) => {
  window.dispatchEvent(new CustomEvent('f1_storage_change', { detail: { key, value } }));
};

export const storage = {
  // --- FAVORITES ---
  getFavorites: () => {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      if (!data) return [];
      return JSON.parse(data) || [];
    } catch (e) {
      console.error('Error reading favorites from localStorage:', e);
      return [];
    }
  },

  isFavorite: (driverId) => {
    const list = storage.getFavorites();
    const idStr = String(driverId).toLowerCase();
    return list.some(item => String(item).toLowerCase() === idStr);
  },

  toggleFavorite: (driverId) => {
    const list = storage.getFavorites();
    const idStr = String(driverId).toLowerCase();
    let updated;
    if (list.some(item => String(item).toLowerCase() === idStr)) {
      updated = list.filter(item => String(item).toLowerCase() !== idStr);
    } else {
      updated = [...list, idStr];
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    dispatchStorageEvent(FAVORITES_KEY, updated);
    return updated;
  },

  // --- TIMEZONE PREFERENCE ---
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
      console.error('Error saving timezone to localStorage:', e);
    }
  },

  // --- RACE COMMENTS & RATINGS ---
  getComments: (raceId) => {
    try {
      const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
      return allComments[raceId] || [
        {
          id: 'demo-1',
          author: 'Martín (F1 Fan)',
          rating: 5,
          text: '¡Carrera emocionante de principio a fin! Gran remontada y estrategia de neumáticos perfecta.',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          id: 'demo-2',
          author: 'Lucía GP',
          rating: 4,
          text: 'Las paradas en boxes definieron el podio. Excelente ritmo de carrera.',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
        }
      ];
    } catch (e) {
      console.error('Error reading comments:', e);
      return [];
    }
  },

  addComment: (raceId, { author, rating, text }) => {
    try {
      const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
      const raceComments = allComments[raceId] || [];
      const newComment = {
        id: 'cmt_' + Date.now(),
        author: author || 'Fanático F1',
        rating: Number(rating) || 5,
        text: text.trim(),
        timestamp: new Date().toISOString()
      };
      allComments[raceId] = [newComment, ...raceComments];
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
      dispatchStorageEvent(COMMENTS_KEY, allComments);
      return newComment;
    } catch (e) {
      console.error('Error adding comment:', e);
      return null;
    }
  }
};
