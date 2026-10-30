import React, { useState, useEffect } from 'react';
import { Settings, Check } from 'lucide-react';
import { COMMON_TIMEZONES } from '../services/dateUtils';
import { storage } from '../services/storage';

export default function TimezoneSelector({ onTimezoneChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefMode, setPrefMode] = useState(() => storage.getTimezonePreferenceMode());
  const [currentTimezone, setCurrentTimezone] = useState(() => storage.getTimezone());

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.detail?.key === 'f1_timezone_pref') {
        setPrefMode(storage.getTimezonePreferenceMode());
        setCurrentTimezone(storage.getTimezone());
      }
    };
    window.addEventListener('f1_storage_change', handleStorageChange);
    return () => window.removeEventListener('f1_storage_change', handleStorageChange);
  }, []);

  const handleSelect = (tzValue) => {
    storage.setTimezone(tzValue);
    setPrefMode(tzValue);
    const effective =
      tzValue === 'auto'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        : tzValue;
    setCurrentTimezone(effective);
    if (onTimezoneChange) onTimezoneChange(effective);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          background: isOpen ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
          border: 'none',
          color: 'var(--text-sub)',
          fontSize: '0.88rem',
          fontWeight: 500,
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all var(--transition-fast)'
        }}
      >
        <Settings size={17} />
        <div style={{ overflow: 'hidden' }}>
          <div>Configuración</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {currentTimezone.split('/').pop().replace(/_/g, ' ')}
          </div>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          />
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: 0,
              width: '280px',
              maxHeight: '340px',
              overflowY: 'auto',
              padding: '10px',
              zIndex: 999,
              background: '#0B1324',
              boxShadow: '0 20px 40px rgba(0,0,0,0.85)',
              border: '1px solid var(--border-hover)'
            }}
          >
            <div style={{ padding: '6px 10px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
                Zona Horaria
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Ajusta los horarios de las sesiones
              </div>
            </div>

            {COMMON_TIMEZONES.map((tz) => {
              const isSelected = prefMode === tz.value;
              return (
                <button
                  key={tz.value}
                  onClick={() => handleSelect(tz.value)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isSelected ? 'rgba(225, 6, 0, 0.18)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-sub)',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span>{tz.label}</span>
                  {isSelected && <Check size={14} color="var(--f1-red)" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
