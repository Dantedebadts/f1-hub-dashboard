import React, { useState, useEffect } from 'react';
import { calculateCountdown } from '../services/dateUtils';
import { Flag } from 'lucide-react';

export default function Countdown({ meeting }) {
  const [countdown, setCountdown] = useState(() =>
    calculateCountdown(meeting?.raceDate || meeting?.startDate)
  );

  useEffect(() => {
    const updateCountdown = () => {
      const target = meeting?.raceDate || meeting?.startDate;
      setCountdown(calculateCountdown(target));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [meeting]);

  if (!meeting) return null;

  const units = [
    { label: 'Días', value: countdown.days },
    { label: 'Horas', value: countdown.hours },
    { label: 'Min', value: countdown.minutes },
    { label: 'Seg', value: countdown.seconds }
  ];

  return (
    <div
      className="glass-panel"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '28px 32px',
        background:
          'radial-gradient(circle at 72% 80%, rgba(225, 6, 0, 0.28) 0%, transparent 55%), radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.14) 0%, transparent 60%), linear-gradient(135deg, #0B1528 0%, #070D1A 100%)',
        border: '1px solid rgba(148, 163, 184, 0.16)'
      }}
    >
      {meeting.circuitImage && (
        <img
          src={meeting.circuitImage}
          alt=""
          style={{
            position: 'absolute',
            right: '30%',
            bottom: '-15px',
            height: '160px',
            opacity: 0.12,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 0 12px rgba(225,6,0,0.6))'
          }}
        />
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px'
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              background: 'var(--f1-red)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}
          >
            PRÓXIMO GRAN PREMIO
          </span>

          <h1
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.15,
              marginBottom: '4px'
            }}
          >
            {meeting.name}
          </h1>

          <div
            style={{
              color: 'var(--text-sub)',
              fontSize: '0.95rem',
              marginBottom: '14px'
            }}
          >
            {meeting.circuit}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {meeting.countryFlagUrl ? (
              <img
                src={meeting.countryFlagUrl}
                alt={meeting.countryName}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              />
            ) : (
              <Flag size={18} color="var(--f1-red)" />
            )}
            <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 500 }}>
              {meeting.countryName}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {units.map((unit) => (
            <div
              key={unit.label}
              style={{
                background: 'rgba(9, 16, 31, 0.82)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '10px',
                minWidth: '68px',
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.45)'
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-race)',
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  lineHeight: 1,
                  color: '#fff',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {String(unit.value).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--f1-cyan)',
                  marginTop: '6px',
                  fontWeight: 500
                }}
              >
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
