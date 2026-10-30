import React, { useState, useEffect } from 'react';
import { Search, Bell, User, RefreshCw, Flag } from 'lucide-react';
import { storage } from '../services/storage';

export default function Navbar({
  setActiveTab,
  onRefresh,
  isRefreshing,
  drivers = [],
  meetings = [],
  onSelectDriver,
  onSelectMeeting
}) {
  const [favoritesCount, setFavoritesCount] = useState(() => storage.getFavorites().length);
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.detail?.key === 'f1_favorites') {
        setFavoritesCount(e.detail.value.length);
      }
    };
    window.addEventListener('f1_storage_change', handleStorageChange);
    return () => window.removeEventListener('f1_storage_change', handleStorageChange);
  }, []);

  const q = query.trim().toLowerCase();
  const matchedDrivers = q
    ? drivers
        .filter(
          (d) =>
            d.fullName.toLowerCase().includes(q) ||
            d.teamName.toLowerCase().includes(q) ||
            d.code.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : [];

  const matchedMeetings = q
    ? meetings
        .filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.countryName.toLowerCase().includes(q) ||
            m.circuit.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  return (
    <header
      style={{
        height: '66px',
        background: '#060B16',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      {/* Left: F1 HUB Brand */}
      <div
        onClick={() => setActiveTab('dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          minWidth: '170px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'var(--font-race)',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: '1.5rem',
            color: 'var(--f1-red)',
            letterSpacing: '-0.04em'
          }}
        >
          F1
        </div>
        <span
          style={{
            fontFamily: 'var(--font-race)',
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: '0.04em',
            color: '#fff'
          }}
        >
          F1 HUB
        </span>
      </div>

      {/* Center: Global Search Input */}
      <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
        <Search
          size={16}
          color="var(--text-muted)"
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}
        />
        <input
          type="text"
          value={query}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          placeholder="Buscar pilotos, escuderías, carreras..."
          style={{
            width: '100%',
            padding: '9px 16px 9px 40px',
            background: '#0D1628',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            color: '#fff',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />

        {showDropdown && q && (matchedDrivers.length > 0 || matchedMeetings.length > 0) && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: '#0B1324',
              border: '1px solid var(--border-hover)',
              borderRadius: 'var(--radius-md)',
              padding: '8px',
              zIndex: 200,
              boxShadow: '0 20px 40px rgba(0,0,0,0.85)'
            }}
          >
            {matchedDrivers.map((d) => (
              <div
                key={d.id}
                onMouseDown={() => {
                  if (onSelectDriver) onSelectDriver(d);
                  setQuery('');
                  setShowDropdown(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.84rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '4px',
                      height: '16px',
                      borderRadius: '2px',
                      background: d.teamColour || 'var(--f1-red)'
                    }}
                  />
                  <strong style={{ color: '#fff' }}>{d.fullName}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>{d.teamName}</span>
                </div>
                <span style={{ color: 'var(--f1-cyan)', fontWeight: 700, fontSize: '0.78rem' }}>
                  {d.points} pts
                </span>
              </div>
            ))}

            {matchedMeetings.map((m) => (
              <div
                key={m.id}
                onMouseDown={() => {
                  if (onSelectMeeting) onSelectMeeting(m.id);
                  setActiveTab('results');
                  setQuery('');
                  setShowDropdown(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.84rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flag size={13} color="var(--f1-red)" />
                  <span style={{ color: '#fff' }}>{m.name}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  Round {m.round}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Sincronizar datos de la API"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-sub)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
          >
            <RefreshCw
              size={17}
              style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
            />
          </button>
        )}

        <button
          onClick={() => setActiveTab('drivers')}
          title="Ver pilotos favoritos"
          style={{
            position: 'relative',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-sub)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px'
          }}
        >
          <Bell size={18} />
          {favoritesCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: 'var(--f1-red)',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {favoritesCount}
            </span>
          )}
        </button>

        <div
          onClick={() => setActiveTab('drivers')}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            border: '1px solid var(--border-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff'
          }}
        >
          <User size={17} />
        </div>
      </div>
    </header>
  );
}
