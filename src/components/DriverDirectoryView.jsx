import React, { useState } from 'react';
import { Users, Search, Star, Filter, ArrowUpDown } from 'lucide-react';
import DriverCard from './DriverCard';
import { storage } from '../services/storage';

export default function DriverDirectoryView({ drivers = [], onSelectDriver }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavsOnly, setFilterFavsOnly] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [sortBy, setSortBy] = useState('points'); // 'points' | 'number' | 'name'

  // Extract unique teams
  const teams = ['ALL', ...new Set(drivers.map(d => d.teamName).filter(Boolean))];

  const favoritesList = storage.getFavorites();

  const filteredAndSorted = drivers
    .filter(d => {
      const matchesSearch =
        d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(d.driverNumber).includes(searchTerm);

      const isFav = storage.isFavorite(d.id || d.code);
      const matchesFav = filterFavsOnly ? isFav : true;
      const matchesTeam = selectedTeam === 'ALL' || d.teamName === selectedTeam;

      return matchesSearch && matchesFav && matchesTeam;
    })
    .sort((a, b) => {
      if (sortBy === 'points') return (b.points || 0) - (a.points || 0);
      if (sortBy === 'number') return (a.driverNumber || 0) - (b.driverNumber || 0);
      if (sortBy === 'name') return a.lastName.localeCompare(b.lastName);
      return 0;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header and Controls */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <Users size={24} color="var(--f1-cyan)" />
              <h1 style={{ fontSize: '2rem', textTransform: 'uppercase', color: '#fff' }}>
                Directorio Oficial de Pilotos
              </h1>
            </div>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>
              Grilla completa de pilotos con estadísticas en tiempo real, mejores posiciones y guardado en favoritos.
            </p>
          </div>

          {/* Quick Count Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Mostrando:</span>
            <strong style={{ color: '#fff' }}>{filteredAndSorted.length}</strong>
            <span style={{ color: 'var(--text-muted)' }}>de {drivers.length} pilotos</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '360px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar por piloto, número, escudería..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Team Filter Dropdown */}
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              style={{
                padding: '8px 12px',
                background: 'rgba(7, 10, 16, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">Todas las Escuderías</option>
              {teams.filter(t => t !== 'ALL').map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                background: 'rgba(7, 10, 16, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="points">Ordenar por: Puntos (Mayor)</option>
              <option value="number">Ordenar por: Número de Auto</option>
              <option value="name">Ordenar por: Nombre / Apellido</option>
            </select>

            {/* Favorites Filter Toggle */}
            <button
              onClick={() => setFilterFavsOnly(!filterFavsOnly)}
              className="btn btn-glass"
              style={{
                fontSize: '0.82rem',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                color: filterFavsOnly ? 'var(--f1-gold)' : 'var(--text-sub)',
                borderColor: filterFavsOnly ? 'rgba(255, 184, 0, 0.5)' : 'var(--border-subtle)',
                background: filterFavsOnly ? 'rgba(255, 184, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)'
              }}
            >
              <Star size={14} fill={filterFavsOnly ? 'var(--f1-gold)' : 'none'} />
              <span>Solo Favoritos ({favoritesList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drivers Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <Star size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>
            No se encontraron pilotos
          </h3>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.88rem' }}>
            Prueba ajustando los filtros de búsqueda o desactiva el filtro de solo favoritos.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '20px'
        }}>
          {filteredAndSorted.map((driver) => (
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
