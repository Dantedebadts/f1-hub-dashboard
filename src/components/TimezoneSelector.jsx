import React, { useState, useEffect } from 'react';
import { Globe, Clock, Check } from 'lucide-react';
import { COMMON_TIMEZONES } from '../services/dateUtils';
import { storage } from '../services/storage';

export default function TimezoneSelector({ onTimezoneChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTimezone, setCurrentTimezone] = useState(storage.getTimezone());
  const [prefMode, setPrefMode] = useState(storage.getTimezonePreferenceMode());
  const [liveClock, setLiveClock] = useState('');

  // Update live clock every second for selected timezone
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = new Intl.DateTimeFormat('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: currentTimezone
        }).format(now);
        setLiveClock(timeStr);
      } catch {
        setLiveClock('--:--:--');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [currentTimezone]);

  const handleSelect = (tzValue) => {
    storage.setTimezone(tzValue);
    setPrefMode(tzValue);
    const effective = tzValue === 'auto' 
      ? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC') 
      : tzValue;
    setCurrentTimezone(effective);
    if (onTimezoneChange) onTimezoneChange(effective);
    setIsOpen(false);
  };

  const currentLabel = COMMON_TIMEZONES.find(t => t.value === prefMode)?.label || currentTimezone;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-glass"
        title="Cambiar zona horaria"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          fontSize: '0.82rem',
          borderRadius: 'var(--radius-full)'
        }}
      >
        <Globe size={15} color="var(--f1-cyan)" />
        <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {prefMode === 'auto' ? 'Auto: ' : ''}{currentTimezone.split('/').pop().replace(/_/g, ' ')}
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(0, 210, 190, 0.12)',
          color: 'var(--f1-cyan)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: 700,
          fontFamily: 'monospace'
        }}>
          <Clock size={12} />
          {liveClock || '--:--'}
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
              top: 'calc(100% + 8px)',
              right: 0,
              width: '320px',
              maxHeight: '380px',
              overflowY: 'auto',
              padding: '10px',
              zIndex: 999,
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              border: '1px solid var(--border-hover)'
            }}
          >
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Zona Horaria (localStorage)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Los horarios de carreras se ajustan a tu selección
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
                    background: isSelected ? 'rgba(225, 6, 0, 0.15)' : 'transparent',
                    color: isSelected ? '#ff4d4d' : 'var(--text-main)',
                    fontSize: '0.83rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
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
