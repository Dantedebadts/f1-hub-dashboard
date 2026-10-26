import React, { useState } from 'react';
import { Trophy, Star, Search, Shield, ChevronRight } from 'lucide-react';
import { storage } from '../services/storage';

export default function StandingsView({ drivers = [], constructors = [], onSelectDriver }) {
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers' | 'constructors'
  const [searchTerm, setSearchTerm] = useState('');
  const [favFilter, setFavFilter] = useState(false);

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFav = favFilter ? storage.isFavorite(d.id || d.code) : true;
    return matchesSearch && matchesFav;
  });

  const filteredConstructors = constructors.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const leaderPoints = activeTab === 'drivers'
    ? (drivers[0]?.points || 1)
    : (constructors[0]?.points || 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* View Header */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <Trophy size={24} color="var(--f1-gold)" />
              <h1 style={{ fontSize: '2rem', textTransform: 'uppercase', color: '#fff' }}>
                Campeonato Mundial de F1
              </h1>
            </div>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>
              Tabla oficial de posiciones, puntajes acumulados, victorias y podios de la temporada.
            </p>
          </div>

          {/* Tab Selector & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              background: 'rgba(7, 10, 16, 0.8)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                onClick={() => setActiveTab('drivers')}
                className="btn"
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: activeTab === 'drivers' ? 'var(--f1-red)' : 'transparent',
                  color: activeTab === 'drivers' ? '#fff' : 'var(--text-sub)',
                  fontSize: '0.85rem'
                }}
              >
                Pilotos
              </button>
              <button
                onClick={() => setActiveTab('constructors')}
                className="btn"
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: activeTab === 'constructors' ? 'var(--f1-red)' : 'transparent',
                  color: activeTab === 'constructors' ? '#fff' : 'var(--text-sub)',
                  fontSize: '0.85rem'
                }}
              >
                Constructores
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            position: 'relative',
            flex: '1',
            minWidth: '220px',
            maxWidth: '380px'
          }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={activeTab === 'drivers' ? "Buscar por piloto o escudería..." : "Buscar constructor..."}
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

          {activeTab === 'drivers' && (
            <button
              onClick={() => setFavFilter(!favFilter)}
              className="btn btn-glass"
              style={{
                fontSize: '0.82rem',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                color: favFilter ? 'var(--f1-gold)' : 'var(--text-sub)',
                borderColor: favFilter ? 'rgba(255, 184, 0, 0.5)' : 'var(--border-subtle)',
                background: favFilter ? 'rgba(255, 184, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)'
              }}
            >
              <Star size={14} fill={favFilter ? 'var(--f1-gold)' : 'none'} />
              <span>Solo Favoritos</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
        {activeTab === 'drivers' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  background: 'rgba(7, 10, 16, 0.8)',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  <th style={{ padding: '14px 20px', width: '70px' }}>POS</th>
                  <th style={{ padding: '14px 16px' }}>PILOTO</th>
                  <th style={{ padding: '14px 16px' }}>ESCUDERÍA</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>VICTORIAS</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>PODIOS</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>PUNTOS</th>
                  <th style={{ padding: '14px 16px', width: '80px', textAlign: 'center' }}>FAV</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver, index) => {
                  const isFav = storage.isFavorite(driver.id || driver.code);
                  return (
                    <tr
                      key={driver.id || driver.fullName}
                      onClick={() => onSelectDriver && onSelectDriver(driver)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isFav ? 'rgba(255, 184, 0, 0.03)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isFav 
                          ? 'rgba(255, 184, 0, 0.08)' 
                          : 'rgba(255, 255, 255, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isFav ? 'rgba(255, 184, 0, 0.03)' : 'transparent';
                      }}
                    >
                      {/* Position */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontFamily: 'var(--font-race)',
                          fontWeight: 900,
                          fontSize: '1.25rem',
                          color: driver.position === 1 ? 'var(--f1-gold)' : driver.position === 2 ? '#CED4DA' : driver.position === 3 ? '#CD7F32' : 'var(--text-muted)'
                        }}>
                          {driver.position}
                        </span>
                      </td>

                      {/* Driver Name & Headshot */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: `2px solid ${driver.teamColour || 'rgba(255,255,255,0.1)'}`,
                            background: '#151b28',
                            flexShrink: 0
                          }}>
                            <img
                              src={driver.headshotUrl}
                              alt={driver.fullName}
                              onError={(e) => {
                                e.currentTarget.src = 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/driver_fallback.png';
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.9rem' }}>{driver.flag}</span>
                              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{driver.fullName}</strong>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              #{driver.driverNumber} &bull; {driver.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Team */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '4px',
                            height: '18px',
                            background: driver.teamColour || '#fff',
                            borderRadius: '2px'
                          }} />
                          <span style={{ color: 'var(--text-sub)', fontSize: '0.9rem', fontWeight: 600 }}>
                            {driver.teamName}
                          </span>
                        </div>
                      </td>

                      {/* Wins */}
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-race)',
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: driver.wins > 0 ? '#fff' : 'var(--text-muted)'
                        }}>
                          {driver.wins}
                        </span>
                      </td>

                      {/* Podiums */}
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-race)',
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: driver.podiums > 0 ? '#fff' : 'var(--text-muted)'
                        }}>
                          {driver.podiums}
                        </span>
                      </td>

                      {/* Points */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <span style={{
                          fontFamily: 'var(--font-race)',
                          fontWeight: 900,
                          fontSize: '1.4rem',
                          color: 'var(--f1-cyan)'
                        }}>
                          {driver.points}
                        </span>
                      </td>

                      {/* Favorite Button */}
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            storage.toggleFavorite(driver.id || driver.code);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: isFav ? 'var(--f1-gold)' : 'var(--text-muted)',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Star size={18} fill={isFav ? 'var(--f1-gold)' : 'none'} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  background: 'rgba(7, 10, 16, 0.8)',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  <th style={{ padding: '14px 20px', width: '70px' }}>POS</th>
                  <th style={{ padding: '14px 20px' }}>ESCUDERÍA / EQUIPO</th>
                  <th style={{ padding: '14px 16px' }}>PILOTOS</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>VICTORIAS</th>
                  <th style={{ padding: '14px 16px', width: '220px' }}>COMPARATIVA</th>
                  <th style={{ padding: '14px 24px', textAlign: 'right' }}>PUNTOS</th>
                </tr>
              </thead>
              <tbody>
                {filteredConstructors.map((c) => {
                  const pct = Math.round((c.points / leaderPoints) * 100);
                  return (
                    <tr
                      key={c.teamId || c.name}
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{
                          fontFamily: 'var(--font-race)',
                          fontWeight: 900,
                          fontSize: '1.25rem',
                          color: c.position === 1 ? 'var(--f1-gold)' : c.position === 2 ? '#CED4DA' : c.position === 3 ? '#CD7F32' : 'var(--text-muted)'
                        }}>
                          {c.position}
                        </span>
                      </td>

                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            width: '6px',
                            height: '24px',
                            background: c.colour || '#E10600',
                            borderRadius: '3px'
                          }} />
                          <strong style={{ color: '#fff', fontSize: '1.05rem' }}>{c.name}</strong>
                        </div>
                      </td>

                      <td style={{ padding: '18px 16px' }}>
                        <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>
                          {c.drivers ? c.drivers.join(' & ') : '--'}
                        </span>
                      </td>

                      <td style={{ padding: '18px 16px', textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-race)', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                          {c.wins}
                        </span>
                      </td>

                      <td style={{ padding: '18px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            flex: 1,
                            height: '8px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: c.colour || 'var(--f1-red)',
                              borderRadius: 'var(--radius-full)'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '38px', textAlign: 'right' }}>
                            {pct}%
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                        <span style={{
                          fontFamily: 'var(--font-race)',
                          fontWeight: 900,
                          fontSize: '1.4rem',
                          color: 'var(--f1-gold)'
                        }}>
                          {c.points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
