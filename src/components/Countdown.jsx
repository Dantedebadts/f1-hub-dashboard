import React, { useState, useEffect } from 'react';
import { calculateCountdown, formatSessionDateTime } from '../services/dateUtils';
import { Timer, MapPin, Gauge, Flag, ChevronRight } from 'lucide-react';

export default function Countdown({ meeting, timezone, onExploreSchedule }) {
  const [countdown, setCountdown] = useState(() => calculateCountdown(meeting?.raceDate || meeting?.startDate));

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

  const targetDateFormatted = formatSessionDateTime(meeting.raceDate, timezone);

  const units = [
    { label: 'DÍAS', value: countdown.days },
    { label: 'HORAS', value: countdown.hours },
    { label: 'MINUTOS', value: countdown.minutes },
    { label: 'SEGUNDOS', value: countdown.seconds }
  ];

  return (
    <div className="glass-panel" style={{
      position: 'relative',
      overflow: 'hidden',
      padding: '32px 36px',
      border: '1px solid rgba(225, 6, 0, 0.25)',
      background: 'linear-gradient(135deg, rgba(22, 28, 44, 0.85) 0%, rgba(12, 16, 26, 0.95) 100%)',
      boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(225, 6, 0, 0.12)'
    }}>
      {/* Decorative background speed lines and glow */}
      <div style={{
        position: 'absolute',
        top: -60,
        right: -60,
        width: 260,
        height: 260,
        background: 'radial-gradient(circle, rgba(225, 6, 0, 0.2) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px',
        alignItems: 'center'
      }}>
        {/* Left Column: GP Title and Circuit Specs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span className="badge badge-upcoming" style={{ fontSize: '0.8rem', padding: '5px 12px' }}>
              <Flag size={13} />
              ROUND {meeting.round} / 24 &bull; PRÓXIMO GRAN PREMIO
            </span>
            <span style={{ fontSize: '1.4rem' }}>{meeting.flag}</span>
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            lineHeight: 1.1,
            color: '#fff',
            textTransform: 'uppercase',
            marginBottom: '10px',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            {meeting.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-sub)', fontSize: '0.95rem', marginBottom: '18px' }}>
            <MapPin size={17} color="var(--f1-cyan)" />
            <span>{meeting.circuit} &bull; {meeting.city}</span>
          </div>

          {/* Quick Circuit Specs Pill */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>LONGITUD</span>
              <strong style={{ color: 'var(--text-main)' }}>{meeting.circuitLengthKm}</strong>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>VUELTAS</span>
              <strong style={{ color: 'var(--text-main)' }}>{meeting.laps} Laps</strong>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>ZONAS DRS</span>
              <strong style={{ color: 'var(--f1-cyan)' }}>{meeting.drsZones} Zonas</strong>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>RÉCORD DE VUELTA</span>
              <strong style={{ color: 'var(--f1-gold)' }}>{meeting.lapRecord}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Live Countdown Digits */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(7, 10, 16, 0.65)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--f1-cyan)',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '16px'
          }}>
            <Timer size={16} />
            <span>Cuenta Regresiva para la Carrera</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            width: '100%',
            maxWidth: '460px'
          }}>
            {units.map((unit) => (
              <div
                key={unit.label}
                style={{
                  background: 'linear-gradient(180deg, #1b2333 0%, #111722 100%)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                  position: 'relative'
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-race)',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  lineHeight: 1,
                  color: '#ffffff',
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--text-sub)',
                  marginTop: '8px'
                }}>
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '460px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.82rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Hora local ({timezone.split('/').pop().replace(/_/g, ' ')}):
            </span>
            <strong style={{ color: 'var(--text-main)' }}>
              {targetDateFormatted.full}
            </strong>
          </div>

          {onExploreSchedule && (
            <button
              onClick={onExploreSchedule}
              className="btn btn-primary"
              style={{
                width: '100%',
                maxWidth: '460px',
                marginTop: '16px',
                padding: '10px 16px',
                fontSize: '0.85rem'
              }}
            >
              <span>Ver Horarios del Fin de Semana</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
