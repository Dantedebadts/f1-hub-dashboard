import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import DriverCard from './DriverCard';
import { storage } from '../services/storage';

export default function DriverDirectoryView({ drivers = [], onSelectDriver }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [favFilterMode, setFavFilterMode] = useState('ALL');
  const [, setFavoritesList] = useState(() => storage.getFavorites());

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.detail?.key === 'f1_favorites') {
        setFavoritesList(e.detail.value);
      }
    };
    window.addEventListener('f1_storage_change', handleStorageChange);
    return () => window.removeEventListener('f1_storage_change', handleStorageChange);
  }, []);

  const teams = ['ALL', ...new Set(drivers.map((d) => d.teamName).filter(Boolean))];

  const filteredDrivers = drivers.filter((d) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      d.fullName.toLowerCase().includes(q) ||
      d.teamName.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      String(d.driverNumber).includes(q);

    const isFav = storage.isFavorite(d.id || d.code);
    const matchesFav = favFilterMode === 'FAV' ? isFav : true;
    const matchesTeam = selectedTeam === 'ALL' || d.teamName === selectedTeam;

    return matchesSearch && matchesFav && matchesTeam;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
            Directorio de Pilotos
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>
            Conoce a todos los pilotos, sus estadísticas y marca tus favoritos.
          </p>
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Buscar piloto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 36px 9px 14px',
              background: '#0D1628',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <Search
            size={15}
            color="var(--text-muted)"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          />
        </div>
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{
            padding: '8px 14px',
            background: '#0D1628',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            fontSize: '0.84rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="ALL">Todas las escuderías</option>
          {teams
            .filter((t) => t !== 'ALL')
            .map((team) => (
              <option key={team} value={team} style={{ background: '#0B1324' }}>
                {team}
              </option>
            ))}
        </select>

        <select
          value={favFilterMode}
          onChange={(e) => setFavFilterMode(e.target.value)}
          style={{
            padding: '8px 14px',
            background: '#0D1628',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            fontSize: '0.84rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="ALL" style={{ background: '#0B1324' }}>
            Todos
          </option>
          <option value="FAV" style={{ background: '#0B1324' }}>
            Favoritos
          </option>
        </select>
      </div>

      {/* Drivers 4-Column Grid */}
      {filteredDrivers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>No se encontraron pilotos</h3>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px'
          }}
        >
          {filteredDrivers.map((driver) => (
            <DriverCard
              key={driver.id || driver.fullName}
              driver={driver}
              onClick={onSelectDriver}
            />
          ))}
        </div>
      )}
    </div>
  );
}
