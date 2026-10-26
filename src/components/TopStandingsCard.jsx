import React, { useState } from 'react';
import { Trophy, Users, ChevronRight, Award } from 'lucide-react';

export default function TopStandingsCard({ drivers = [], constructors = [], onNavigateToStandings, onSelectDriver }) {
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers' | 'constructors'

  const topDrivers = drivers.slice(0, 5);
  const topConstructors = constructors.slice(0, 5);

  const leaderPoints = activeTab === 'drivers' 
    ? (topDrivers[0]?.points || 1) 
    : (topConstructors[0]?.points || 1);

  return (
    <div className="glass-panel" style={{ padding: '24px 28px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy size={20} color="var(--f1-gold)" />
          <h2 style={{ fontSize: '1.35rem', textTransform: 'uppercase', color: 'var(--text-main)' }}>
            Top 5 del Campeonato
          </h2>
        </div>

        {/* Tab switch between Drivers & Constructors */}
        <div style={{
          display: 'flex',
          background: 'rgba(7, 10, 16, 0.7)',
          padding: '3px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveTab('drivers')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'drivers' ? 'var(--f1-red)' : 'transparent',
              color: activeTab === 'drivers' ? '#fff' : 'var(--text-sub)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-race)'
            }}
          >
            Pilotos
          </button>
          <button
            onClick={() => setActiveTab('constructors')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'constructors' ? 'var(--f1-red)' : 'transparent',
              color: activeTab === 'constructors' ? '#fff' : 'var(--text-sub)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-race)'
            }}
          >
            Constructores
          </button>
        </div>
      </div>

      {/* Standings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activeTab === 'drivers' ? (
          topDrivers.map((driver, idx) => {
            const pct = Math.round((driver.points / leaderPoints) * 100);
            return (
              <div
                key={driver.id || driver.fullName}
                onClick={() => onSelectDriver && onSelectDriver(driver)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(14, 19, 30, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Team color accent line */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '5px',
                  background: driver.teamColour || '#E10600'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingLeft: '8px' }}>
                  <div style={{
                    fontFamily: 'var(--font-race)',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    width: '24px',
                    color: idx === 0 ? 'var(--f1-gold)' : idx === 1 ? '#CED4DA' : idx === 2 ? '#CD7F32' : 'var(--text-muted)'
                  }}>
                    {idx + 1}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{driver.flag}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                        {driver.fullName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                        {driver.teamName} &bull; #{driver.driverNumber}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontFamily: 'var(--font-race)',
                      fontWeight: 900,
                      fontSize: '1.3rem',
                      color: 'var(--f1-cyan)',
                      lineHeight: 1
                    }}>
                      {driver.points} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-sub)' }}>PTS</span>
                    </div>
                    {idx > 0 && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        -{leaderPoints - driver.points} pts
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </div>
            );
          })
        ) : (
          topConstructors.map((c, idx) => {
            const pct = Math.round((c.points / leaderPoints) * 100);
            return (
              <div
                key={c.teamId || c.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(14, 19, 30, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '5px',
                  background: c.colour || '#E10600'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingLeft: '8px' }}>
                  <div style={{
                    fontFamily: 'var(--font-race)',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    width: '24px',
                    color: idx === 0 ? 'var(--f1-gold)' : idx === 1 ? '#CED4DA' : idx === 2 ? '#CD7F32' : 'var(--text-muted)'
                  }}>
                    {idx + 1}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>
                      {c.drivers ? c.drivers.join(' & ') : ''}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'var(--font-race)',
                    fontWeight: 900,
                    fontSize: '1.3rem',
                    color: 'var(--f1-gold)',
                    lineHeight: 1
                  }}>
                    {c.points} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-sub)' }}>PTS</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {c.wins} Victorias
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={onNavigateToStandings}
        className="btn btn-glass"
        style={{
          width: '100%',
          marginTop: '18px',
          padding: '10px',
          fontSize: '0.85rem'
        }}
      >
        <span>Ver Tabla Completa del Campeonato</span>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
