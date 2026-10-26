import React, { useState, useEffect } from 'react';
import { Flag, Trophy, Calendar, Users, Star, Radio, RefreshCw } from 'lucide-react';
import TimezoneSelector from './TimezoneSelector';
import { storage } from '../services/storage';

export default function Navbar({ activeTab, setActiveTab, timezone, setTimezone, onRefresh, isRefreshing }) {
  const [favoritesCount, setFavoritesCount] = useState(storage.getFavorites().length);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.detail?.key === 'f1_favorites') {
        setFavoritesCount(e.detail.value.length);
      }
    };
    window.addEventListener('f1_storage_change', handleStorageChange);
    return () => window.removeEventListener('f1_storage_change', handleStorageChange);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'standings', label: 'Campeonato', icon: Trophy },
    { id: 'results', label: 'Resultados GP', icon: Flag },
    { id: 'drivers', label: 'Directorio Pilotos', icon: Users }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 9, 14, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #e10600 0%, #990000 100%)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-race)',
            fontWeight: 900,
            fontSize: '1.25rem',
            letterSpacing: '0.05em',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 15px rgba(225, 6, 0, 0.4)'
          }}>
            <span>F1</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 700 }}>HUB</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontFamily: 'var(--font-race)',
              fontWeight: 800,
              fontSize: '1.05rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-main)'
            }}>
              Grand Prix Dashboard
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-sub)' }}>
              <Radio size={12} color="#10B981" />
              <span>Datos en Tiempo Real &bull; OpenF1</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(18, 24, 38, 0.6)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #e10600 0%, #b30000 100%)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-sub)',
                  fontFamily: 'var(--font-race)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isActive ? '0 4px 14px rgba(225, 6, 0, 0.35)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-sub)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Refresh, Favorites Counter & Timezone */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn btn-glass"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                color: 'var(--text-sub)'
              }}
              title="Actualizar datos oficiales desde las APIs"
            >
              <RefreshCw
                size={13}
                color="var(--f1-cyan)"
                style={{
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                }}
              />
              <span style={{ fontSize: '0.78rem' }}>{isRefreshing ? 'Sincronizando...' : 'Actualizar'}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('drivers')}
            className="btn btn-glass"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              color: favoritesCount > 0 ? 'var(--f1-gold)' : 'var(--text-sub)',
              borderColor: favoritesCount > 0 ? 'rgba(255, 184, 0, 0.3)' : 'var(--border-subtle)'
            }}
            title="Ver pilotos favoritos en el Directorio"
          >
            <Star size={14} fill={favoritesCount > 0 ? 'var(--f1-gold)' : 'none'} />
            <span>Favoritos</span>
            <span style={{
              background: favoritesCount > 0 ? 'var(--f1-gold)' : 'rgba(255, 255, 255, 0.1)',
              color: favoritesCount > 0 ? '#000' : 'var(--text-sub)',
              borderRadius: 'var(--radius-full)',
              padding: '1px 7px',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              {favoritesCount}
            </span>
          </button>

          <TimezoneSelector onTimezoneChange={setTimezone} />
        </div>
      </div>
    </header>
  );
}
