import React, { useState, useEffect } from 'react';
import { X, Star, Trophy, Award, Flag, Calendar, MapPin, Zap } from 'lucide-react';
import { storage } from '../services/storage';

export default function DriverModal({ driver, onClose }) {
  if (!driver) return null;

  const [isFav, setIsFav] = useState(() => storage.isFavorite(driver.id || driver.code));

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleFavoriteToggle = () => {
    const idToToggle = driver.id || driver.code;
    const updated = storage.toggleFavorite(idToToggle);
    setIsFav(updated.some(item => String(item).toLowerCase() === String(idToToggle).toLowerCase()));
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      {/* Backdrop click to dismiss */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0 }} />

      <div
        className="glass-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(135deg, rgba(20, 26, 40, 0.98) 0%, rgba(10, 14, 22, 0.98) 100%)',
          border: `1px solid ${driver.teamColour || 'rgba(255, 255, 255, 0.2)'}`,
          boxShadow: `0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px ${driver.teamColour}30`,
          borderRadius: 'var(--radius-lg)',
          padding: '32px'
        }}
      >
        {/* Close Button */}
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
            color: 'var(--text-sub)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(225, 6, 0, 0.8)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-sub)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: 'var(--radius-full)',
            border: `3px solid ${driver.teamColour || '#E10600'}`,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.05)',
            boxShadow: `0 8px 24px ${driver.teamColour}50`,
            flexShrink: 0
          }}>
            <img
              src={driver.headshotUrl}
              alt={driver.fullName}
              onError={(e) => {
                e.currentTarget.src = 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/driver_fallback.png';
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{
                fontFamily: 'var(--font-race)',
                fontWeight: 900,
                fontSize: '1.8rem',
                color: driver.teamColour || 'var(--f1-red)'
              }}>
                #{driver.driverNumber}
              </span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-main)' }}>
                {driver.code}
              </span>
              <span style={{ fontSize: '1.2rem' }}>{driver.flag}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{driver.countryName}</span>
            </div>

            <h2 style={{ fontSize: '2rem', color: '#fff', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: '8px' }}>
              {driver.fullName}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{
                background: `${driver.teamColour}25`,
                color: driver.teamColour || '#fff',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.82rem',
                border: `1px solid ${driver.teamColour}60`
              }}>
                {driver.teamName}
              </span>

              <button
                onClick={handleFavoriteToggle}
                className="btn btn-glass"
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  color: isFav ? 'var(--f1-gold)' : 'var(--text-sub)',
                  borderColor: isFav ? 'rgba(255, 184, 0, 0.4)' : 'var(--border-subtle)',
                  background: isFav ? 'rgba(255, 184, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <Star size={14} fill={isFav ? 'var(--f1-gold)' : 'none'} />
                <span>{isFav ? 'Favorito Activo' : 'Guardar en Favoritos'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Driver Bio */}
        {driver.bio && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '24px',
            fontSize: '0.92rem',
            lineHeight: 1.6,
            color: 'var(--text-sub)'
          }}>
            {driver.bio}
          </div>
        )}

        {/* Stats Grid */}
        <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--text-sub)', letterSpacing: '0.08em', marginBottom: '12px' }}>
          Estadísticas de la Temporada
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ background: 'rgba(7, 10, 16, 0.6)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>PUNTOS TOTALES</span>
            <strong style={{ fontFamily: 'var(--font-race)', fontSize: '1.6rem', color: 'var(--f1-cyan)', fontWeight: 900 }}>
              {driver.points}
            </strong>
          </div>

          <div style={{ background: 'rgba(7, 10, 16, 0.6)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>POSICIÓN TABLA</span>
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
              {driver.poles || 0}
            </strong>
          </div>
        </div>

        {/* Additional telemetry / details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          background: 'rgba(14, 19, 30, 0.6)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>LUGAR DE NACIMIENTO</span>
            <strong style={{ color: '#fff' }}>{driver.birthPlace || 'No disponible'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>FECHA DE NACIMIENTO</span>
            <strong style={{ color: '#fff' }}>{driver.birthDate || 'No disponible'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>MEJOR CLASIFICACIÓN</span>
            <strong style={{ color: 'var(--f1-cyan)' }}>{driver.bestQualy || '--'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>MEJOR RESULTADO EN CARRERA</span>
            <strong style={{ color: 'var(--f1-gold)' }}>{driver.bestFinish || '--'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
