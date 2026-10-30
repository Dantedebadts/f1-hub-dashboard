import React, { useState, useEffect } from 'react';
import { Trophy, User } from 'lucide-react';
import { f1Api } from '../services/f1Api';

export default function StandingsView({
  drivers: initialDrivers = [],
  constructors: initialConstructors = [],
  onSelectDriver
}) {
  const [activeTab, setActiveTab] = useState('drivers');
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(
    initialDrivers[0]?.season || 'current'
  );
  const [drivers, setDrivers] = useState(initialDrivers);
  const [constructors, setConstructors] = useState(initialConstructors);
  const [loadingSeason, setLoadingSeason] = useState(false);

  useEffect(() => {
    f1Api.getSeasons().then((list) => {
      if (list && list.length > 0) {
        setSeasons(list);
        if (selectedSeason === 'current') {
          setSelectedSeason(list[0]);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedSeason || selectedSeason === initialDrivers[0]?.season) {
      setDrivers(initialDrivers);
      setConstructors(initialConstructors);
      return;
    }

    let isMounted = true;
    setLoadingSeason(true);

    Promise.all([
      f1Api.getDriverStandings(selectedSeason),
      f1Api.getConstructorStandings(selectedSeason)
    ])
      .then(([dList, cList]) => {
        if (isMounted) {
          setDrivers(dList || []);
          setConstructors(cList || []);
          setLoadingSeason(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingSeason(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSeason, initialDrivers, initialConstructors]);

  const displaySeason =
    selectedSeason === 'current' ? initialDrivers[0]?.season || '' : selectedSeason;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(255, 184, 0, 0.12)',
              border: '1px solid rgba(255, 184, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Trophy size={24} color="var(--f1-gold)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
              Campeonato
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>
              Tabla oficial de pilotos y constructores de la temporada {displaySeason}
            </p>
          </div>
        </div>

        {seasons.length > 0 && (
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            style={{
              padding: '9px 16px',
              background: '#0D1628',
              border: '1px solid var(--border-hover)',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {seasons.map((yr) => (
              <option key={yr} value={yr} style={{ background: '#0B1324', color: '#fff' }}>
                Temporada {yr}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Sub-tabs Pill Switcher */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            background: '#0B1324',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <button
            onClick={() => setActiveTab('drivers')}
            style={{
              padding: '8px 26px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background:
                activeTab === 'drivers'
                  ? 'linear-gradient(90deg, #E10600 0%, #B00000 100%)'
                  : 'transparent',
              color: activeTab === 'drivers' ? '#fff' : 'var(--text-sub)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'drivers' ? '0 4px 12px rgba(225,6,0,0.35)' : 'none'
            }}
          >
            Pilotos
          </button>
          <button
            onClick={() => setActiveTab('constructors')}
            style={{
              padding: '8px 26px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background:
                activeTab === 'constructors'
                  ? 'linear-gradient(90deg, #E10600 0%, #B00000 100%)'
                  : 'transparent',
              color: activeTab === 'constructors' ? '#fff' : 'var(--text-sub)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'constructors' ? '0 4px 12px rgba(225,6,0,0.35)' : 'none'
            }}
          >
            Constructores
          </button>
        </div>
      </div>

      {/* Main Standings Table Card */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
            {activeTab === 'drivers' ? 'Campeonato de Pilotos' : 'Campeonato de Constructores'}
          </h2>
        </div>

        {loadingSeason ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
            Cargando temporada {selectedSeason}...
          </div>
        ) : activeTab === 'drivers' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-sub)',
                    fontSize: '0.78rem',
                    fontWeight: 500
                  }}
                >
                  <th style={{ padding: '12px 22px', width: '70px' }}>Pos</th>
                  <th style={{ padding: '12px 16px' }}>Piloto</th>
                  <th style={{ padding: '12px 16px' }}>Escudería</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Puntos</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Victorias</th>
                  <th style={{ padding: '12px 22px', textAlign: 'center' }}>Podios</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => {
                  const accentColor = driver.teamColour || 'var(--f1-red)';
                  return (
                    <tr
                      key={driver.id || driver.fullName}
                      onClick={() => onSelectDriver && onSelectDriver(driver)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: '10px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              width: '3px',
                              height: '26px',
                              borderRadius: '2px',
                              background: accentColor
                            }}
                          />
                          <strong style={{ color: '#fff', fontSize: '0.92rem' }}>
                            {driver.position}
                          </strong>
                        </div>
                      </td>

                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
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
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  objectPosition: 'top'
                                }}
                              />
                            ) : (
                              <User size={16} color="var(--text-muted)" />
                            )}
                          </div>
                          <span style={{ color: '#fff', fontWeight: 500, fontSize: '0.9rem' }}>
                            {driver.lastName || driver.fullName}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '18px',
                              height: '12px',
                              borderRadius: '3px',
                              background: accentColor,
                              display: 'inline-block'
                            }}
                          />
                          <span style={{ color: 'var(--text-sub)', fontSize: '0.88rem' }}>
                            {driver.teamName}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <strong style={{ color: '#fff', fontSize: '0.92rem' }}>
                          {driver.points}
                        </strong>
                      </td>

                      <td style={{ padding: '10px 16px', textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.88rem' }}>
                        {driver.wins}
                      </td>

                      <td style={{ padding: '10px 22px', textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.88rem' }}>
                        {driver.podiums}
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
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-sub)',
                    fontSize: '0.78rem',
                    fontWeight: 500
                  }}
                >
                  <th style={{ padding: '12px 22px', width: '70px' }}>Pos</th>
                  <th style={{ padding: '12px 16px' }}>Escudería</th>
                  <th style={{ padding: '12px 16px' }}>Pilotos</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Puntos</th>
                  <th style={{ padding: '12px 22px', textAlign: 'center' }}>Victorias</th>
                </tr>
              </thead>
              <tbody>
                {constructors.map((c) => {
                  const teamColor = c.colour || 'var(--f1-red)';
                  return (
                    <tr
                      key={c.teamId || c.name}
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td style={{ padding: '12px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              width: '3px',
                              height: '26px',
                              borderRadius: '2px',
                              background: teamColor
                            }}
                          />
                          <strong style={{ color: '#fff', fontSize: '0.92rem' }}>
                            {c.position}
                          </strong>
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '18px',
                              height: '12px',
                              borderRadius: '3px',
                              background: teamColor,
                              display: 'inline-block'
                            }}
                          />
                          <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{c.name}</strong>
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px', color: 'var(--text-sub)', fontSize: '0.86rem' }}>
                        {c.drivers?.length ? c.drivers.join(' & ') : '--'}
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{c.points}</strong>
                      </td>

                      <td style={{ padding: '12px 22px', textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.88rem' }}>
                        {c.wins}
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
