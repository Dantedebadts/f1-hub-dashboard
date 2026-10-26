import React, { useState, useEffect } from 'react';
import { Star, Trophy, Award, Zap, ChevronRight } from 'lucide-react';
import { storage } from '../services/storage';

export default function DriverCard({ driver, onClick, onFavoriteToggled }) {
  const [isFav, setIsFav] = useState(() => storage.isFavorite(driver.id || driver.code));

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.detail?.key === 'f1_favorites') {
        setIsFav(storage.isFavorite(driver.id || driver.code));
      }
    };
    window.addEventListener('f1_storage_change', handleStorageChange);
    return () => window.removeEventListener('f1_storage_change', handleStorageChange);
  }, [driver]);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    const idToToggle = driver.id || driver.code;
    const updated = storage.toggleFavorite(idToToggle);
    setIsFav(updated.some(item => String(item).toLowerCase() === String(idToToggle).toLowerCase()));
    if (onFavoriteToggled) onFavoriteToggled(idToToggle);
  };

  return (
    <div
      onClick={() => onClick && onClick(driver)}
      className="glass-panel"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
        border: isFav ? '1px solid rgba(255, 184, 0, 0.4)' : '1px solid var(--border-subtle)',
        boxShadow: isFav ? '0 10px 25px rgba(255, 184, 0, 0.12)' : 'var(--shadow-card)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = isFav 
          ? '0 16px 35px rgba(255, 184, 0, 0.2)' 
          : '0 16px 35px rgba(0, 0, 0, 0.6)';
        e.currentTarget.style.borderColor = driver.teamColour || 'rgba(255, 255, 255, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = isFav 
          ? '0 10px 25px rgba(255, 184, 0, 0.12)' 
          : 'var(--shadow-card)';
        e.currentTarget.style.borderColor = isFav ? 'rgba(255, 184, 0, 0.4)' : 'var(--border-subtle)';
      }}
    >
      {/* Top Stripe with Team Color */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: driver.teamColour || '#E10600'
      }} />

      {/* Header: Driver Number & Favorite Toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'var(--font-race)',
            fontSize: '2rem',
            fontWeight: 900,
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: 1
          }}>
            #{driver.driverNumber}
          </span>
          <span style={{
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-race)',
            fontWeight: 800,
            fontSize: '0.8rem',
            color: 'var(--text-sub)'
          }}>
            {driver.code}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          title={isFav ? "Quitar de favoritos" : "Marcar como favorito"}
          style={{
            background: isFav ? 'rgba(255, 184, 0, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            border: isFav ? '1px solid rgba(255, 184, 0, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-full)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: isFav ? 'var(--f1-gold)' : 'var(--text-sub)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Star size={18} fill={isFav ? 'var(--f1-gold)' : 'none'} />
        </button>
      </div>

      {/* Driver Portrait & Team Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        margin: '10px 0 16px 0'
      }}>
        <div style={{
          position: 'relative',
          width: '90px',
          height: '90px',
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.5) 100%)',
          border: `2px solid ${driver.teamColour || 'rgba(255, 255, 255, 0.15)'}`,
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: `0 4px 16px ${driver.teamColour}40`
        }}>
          <img
            src={driver.headshotUrl}
            alt={driver.fullName}
            onError={(e) => {
              e.currentTarget.src = 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/driver_fallback.png';
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top'
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ fontSize: '1rem' }}>{driver.flag}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {driver.countryName}
            </span>
          </div>

          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.2
          }}>
            {driver.fullName}
          </h3>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: driver.teamColour || 'var(--text-sub)',
            fontWeight: 700,
            marginTop: '4px'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: driver.teamColour || '#E10600' }} />
            <span>{driver.teamName}</span>
          </div>
        </div>
      </div>

      {/* Season Stats Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        background: 'rgba(7, 10, 16, 0.55)',
        padding: '12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '14px'
      }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
            Puntos 2024
          </span>
          <strong style={{
            fontFamily: 'var(--font-race)',
            fontSize: '1.25rem',
            color: 'var(--f1-cyan)',
            fontWeight: 900
          }}>
            {driver.points} PTS
          </strong>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
            Posición General
          </span>
          <strong style={{
            fontFamily: 'var(--font-race)',
            fontSize: '1.25rem',
            color: driver.position <= 3 ? 'var(--f1-gold)' : 'var(--text-main)',
            fontWeight: 900
          }}>
            P{driver.position}
          </strong>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
            Mejor Clasificación
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
            {driver.bestQualy || '--'}
          </span>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
            Mejor Carrera
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
            {driver.bestFinish || '--'}
          </span>
        </div>
      </div>

      {/* Bottom Action: Recent finishes & click to details */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '8px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.78rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Últimas:</span>
          {driver.recentResults && driver.recentResults.slice(0, 4).map((res, i) => (
            <span
              key={i}
              style={{
                background: res === 'P1' ? 'var(--f1-gold)' : res.startsWith('P1') || res.startsWith('P2') || res.startsWith('P3') ? 'rgba(0, 210, 190, 0.2)' : 'rgba(255,255,255,0.06)',
                color: res === 'P1' ? '#000' : '#fff',
                padding: '1px 5px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 700
              }}
            >
              {res}
            </span>
          ))}
        </div>

        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          color: 'var(--f1-red)',
          fontWeight: 700
        }}>
          Ficha <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
}
