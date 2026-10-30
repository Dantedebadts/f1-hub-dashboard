import React, { useState, useEffect } from 'react';
import { X, Star, User, ExternalLink } from 'lucide-react';
import { storage } from '../services/storage';

export default function DriverModal({ driver, onClose }) {
  const [isFav, setIsFav] = useState(() =>
    driver ? storage.isFavorite(driver.id || driver.code) : false
  );

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!driver) return null;

  const handleFavoriteToggle = () => {
    const idToToggle = driver.id || driver.code;
    const updated = storage.toggleFavorite(idToToggle);
    setIsFav(updated.some((item) => String(item).toLowerCase() === String(idToToggle).toLowerCase()));
  };

  const accentColor = driver.teamColour || 'var(--f1-red)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div onClick={onClose} style={{ position: 'absolute', inset: 0 }} />

      <div
        className="glass-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(135deg, rgba(20, 26, 40, 0.98) 0%, rgba(10, 14, 22, 0.98) 100%)',
          border: `1px solid ${accentColor}`,
          borderRadius: 'var(--radius-lg)',
          padding: '32px'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-sub)'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '110px',
              height: '110px',
              borderRadius: 'var(--radius-full)',
              border: `3px solid ${accentColor}`,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.05)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {driver.headshotUrl ? (
              <img
                src={driver.headshotUrl}
                alt={driver.fullName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              />
            ) : (
              <User size={44} color="var(--text-muted)" />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-race)',
                  fontWeight: 900,
                  fontSize: '1.8rem',
                  color: accentColor
                }}
              >
                #{driver.driverNumber}
              </span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-main)' }}>
                {driver.code}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{driver.nationality}</span>
            </div>

            <h2 style={{ fontSize: '2rem', color: '#fff', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: '10px' }}>
              {driver.fullName}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: accentColor,
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: `1px solid ${accentColor}`
                }}
              >
                {driver.teamName}
              </span>

              <button
                onClick={handleFavoriteToggle}
                className="btn btn-glass"
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  color: isFav ? 'var(--f1-gold)' : 'var(--text-sub)'
                }}
              >
                <Star size={14} fill={isFav ? 'var(--f1-gold)' : 'none'} />
                <span>{isFav ? 'Favorito' : 'Guardar en Favoritos'}</span>
              </button>
            </div>
          </div>
        </div>

        <h4
          style={{
            textTransform: 'uppercase',
            fontSize: '0.85rem',
            color: 'var(--text-sub)',
            letterSpacing: '0.08em',
            marginBottom: '12px'
          }}
        >
          Estadísticas de la Temporada {driver.season}
        </h4>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}
        >
          <div style={{ background: 'rgba(7, 10, 16, 0.6)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>PUNTOS</span>
            <strong style={{ fontFamily: 'var(--font-race)', fontSize: '1.6rem', color: 'var(--f1-cyan)', fontWeight: 900 }}>
              {driver.points}
            </strong>
          </div>

          <div style={{ background: 'rgba(7, 10, 16, 0.6)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>POSICIÓN</span>
            <strong style={{ fontFamily: 'var(--font-race)', fontSize: '1.6rem', color: 'var(--f1-gold)', fontWeight: 900 }}>
              P{driver.position}
            </strong>
          </div>

          <div style={{ background: 'rgba(7, 10, 16, 0.6)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>VICTORIAS</span>
            <strong style={{ fontFamily: 'var(--font-race)', fontSize: '1.6rem', color: '#fff', fontWeight: 900 }}>
              {driver.wins}
            </strong>
          </div>

          <div style={{ background: 'rgba(7, 10, 16, 0.6)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>PODIOS</span>
            <strong style={{ fontFamily: 'var(--font-race)', fontSize: '1.6rem', color: '#fff', fontWeight: 900 }}>
              {driver.podiums}
            </strong>
          </div>

          <div style={{ background: 'rgba(7, 10, 16, 0.6)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>POLE POSITIONS</span>
            <strong style={{ fontFamily: 'var(--font-race)', fontSize: '1.6rem', color: 'var(--f1-cyan)', fontWeight: 900 }}>
              {driver.poles}
            </strong>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            background: 'rgba(14, 19, 30, 0.6)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem'
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>NACIONALIDAD</span>
            <strong style={{ color: '#fff' }}>{driver.nationality || '--'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>FECHA DE NACIMIENTO</span>
            <strong style={{ color: '#fff' }}>{driver.birthDate || '--'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>MEJOR CLASIFICACIÓN</span>
            <strong style={{ color: 'var(--f1-cyan)' }}>{driver.bestQualy}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>MEJOR CARRERA</span>
            <strong style={{ color: 'var(--f1-gold)' }}>{driver.bestFinish}</strong>
          </div>
        </div>

        {driver.url && (
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <a
              href={driver.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--f1-cyan)',
                fontSize: '0.82rem',
                textDecoration: 'none'
              }}
            >
              <span>Biografía en Wikipedia (API)</span>
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
