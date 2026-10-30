import React from 'react';
import { Trophy, ArrowRight, User } from 'lucide-react';

export default function TopStandingsCard({
  drivers = [],
  onNavigateToStandings,
  onSelectDriver
}) {
  const topDrivers = drivers.slice(0, 5);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '18px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={17} color="var(--f1-gold)" />
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
            Top 5 del Campeonato (Pilotos)
          </span>
        </div>

        <button
          onClick={onNavigateToStandings}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--f1-cyan)',
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <span>Ver tabla completa</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {topDrivers.map((driver, idx) => {
          const isLast = idx === topDrivers.length - 1;
          const accentColor = driver.teamColour || 'var(--f1-red)';

          return (
            <div
              key={driver.id || driver.fullName}
              onClick={() => onSelectDriver && onSelectDriver(driver)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 4px',
                borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '3px',
                    height: '24px',
                    borderRadius: '2px',
                    background: accentColor
                  }}
                />
                <span
                  style={{
                    width: '16px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: '#fff'
                  }}
                >
                  {idx + 1}
                </span>

                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#111C33',
                    border: `1.5px solid ${accentColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {driver.headshotUrl ? (
                    <img
                      src={driver.headshotUrl}
                      alt={driver.fullName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                    />
                  ) : (
                    <User size={16} color="var(--text-muted)" />
                  )}
                </div>

                <span style={{ color: '#fff', fontWeight: 500, fontSize: '0.88rem' }}>
                  {driver.lastName || driver.fullName}
                </span>
              </div>

              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>
                {driver.points} pts
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
