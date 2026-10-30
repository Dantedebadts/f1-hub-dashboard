import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, User } from 'lucide-react';
import { storage } from '../services/storage';

export default function DriverCard({ driver, onClick }) {
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
    setIsFav(
      updated.some((item) => String(item).toLowerCase() === String(idToToggle).toLowerCase())
    );
  };

  const accentColor = driver.teamColour || '#E10600';

  return (
    <div
      onClick={() => onClick && onClick(driver)}
      className="glass-panel"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        background: '#0A1222',
        border: isFav
          ? '1px solid rgba(255, 184, 0, 0.45)'
          : `1px solid ${accentColor}44`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {/* Top Portrait Banner with Team Color Gradient */}
      <div
        style={{
          position: 'relative',
          height: '155px',
          background: `radial-gradient(circle at 50% 35%, ${accentColor}75 0%, #0A1222 90%)`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <button
          onClick={handleFavoriteClick}
          title={isFav ? 'Quitar de favoritos' : 'Marcar como favorito'}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 3,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: isFav ? 'var(--f1-gold)' : 'rgba(255, 255, 255, 0.75)',
            padding: '4px'
          }}
        >
          <Star size={19} fill={isFav ? 'var(--f1-gold)' : 'none'} />
        </button>

        {driver.headshotUrl ? (
          <img
            src={driver.headshotUrl}
            alt={driver.fullName}
            style={{
              height: '140px',
              width: 'auto',
              objectFit: 'contain',
              objectPosition: 'bottom'
            }}
          />
        ) : (
          <div style={{ paddingBottom: '28px' }}>
            <User size={54} color="rgba(255,255,255,0.4)" />
          </div>
        )}

        <span
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '12px',
            background: accentColor,
            color: '#fff',
            fontSize: '0.64rem',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: '4px',
            letterSpacing: '0.04em'
          }}
        >
          {driver.code}
        </span>
      </div>

      {/* Bottom Driver Details */}
      <div
        style={{
          padding: '14px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <strong
            style={{
              fontFamily: 'var(--font-race)',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#fff'
            }}
          >
            {driver.driverNumber}
          </strong>
          <span
            style={{
              fontSize: '0.96rem',
              fontWeight: 600,
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {driver.fullName}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: accentColor,
              flexShrink: 0
            }}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{driver.teamName}</span>
        </div>

        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '6px'
          }}
        >
          {driver.points} pts
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick(driver);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-sub)',
            fontSize: '0.78rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <span>Ver detalles</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
