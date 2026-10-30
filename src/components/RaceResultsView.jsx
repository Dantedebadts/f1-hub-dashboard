import React, { useState, useEffect } from 'react';
import { Flag, Calendar, Sun, CloudRain, User } from 'lucide-react';
import { f1Api } from '../services/f1Api';

export default function RaceResultsView({ meetings = [], initialMeetingId = '' }) {
  const completedMeetings = meetings.filter((m) => !m.isUpcoming);
  const defaultMeeting = completedMeetings[completedMeetings.length - 1] || meetings[0];

  const [selectedMeetingId, setSelectedMeetingId] = useState(
    initialMeetingId || defaultMeeting?.id || ''
  );
  const [selectedSession, setSelectedSession] = useState('Race');
  const [results, setResults] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialMeetingId && meetings.some((m) => m.id === initialMeetingId)) {
      setSelectedMeetingId(initialMeetingId);
      return;
    }
    if (meetings.length > 0 && (!selectedMeetingId || !meetings.some((m) => m.id === selectedMeetingId))) {
      const completed = meetings.filter((m) => !m.isUpcoming);
      const latest = completed[completed.length - 1] || meetings[0];
      if (latest) {
        setSelectedMeetingId(latest.id);
      }
    }
  }, [meetings, selectedMeetingId, initialMeetingId]);

  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId) || defaultMeeting;

  useEffect(() => {
    if (!selectedMeeting) return;
    let isMounted = true;
    setLoading(true);

    Promise.all([
      f1Api.getSessionResults(selectedMeeting, selectedSession),
      f1Api.getMeetingWeather(selectedMeeting.openF1Key)
    ])
      .then(([res, wData]) => {
        if (isMounted) {
          setResults(res || []);
          setWeather(wData || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setResults([]);
          setWeather(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMeeting, selectedSession]);

  const sessionOptions = [
    { id: 'Practice 1', label: 'Práctica 1' },
    { id: 'Practice 2', label: 'Práctica 2' },
    { id: 'Practice 3', label: 'Práctica 3' },
    { id: 'Qualifying', label: 'Clasificación' },
    { id: 'Race', label: 'Carrera', isRace: true }
  ];

  const activeSessionLabel =
    sessionOptions.find((s) => s.id === selectedSession)?.label || selectedSession;

  const topThreeTimes = results.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Flag size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
            Resultados por Gran Premio
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>
            Revisa los resultados de cada sesión y carrera de la temporada.
          </p>
        </div>
      </div>

      {/* GP Selector Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            style={{
              minWidth: '250px',
              padding: '10px 14px',
              background: '#0D1628',
              border: '1px solid var(--border-hover)',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {meetings.map((m) => (
              <option key={m.id} value={m.id} style={{ background: '#0B1324', color: '#fff' }}>
                {m.name} {m.season}
              </option>
            ))}
          </select>

          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: '#0D1628',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-sub)'
            }}
          >
            <Calendar size={17} />
          </div>
        </div>

        {selectedMeeting && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {selectedMeeting.countryFlagUrl && (
                <img
                  src={selectedMeeting.countryFlagUrl}
                  alt={selectedMeeting.countryName}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                />
              )}
              <div>
                <div style={{ color: '#fff', fontSize: '0.86rem', fontWeight: 600 }}>
                  {selectedMeeting.city || selectedMeeting.countryName}
                </div>
                <div style={{ color: 'var(--text-sub)', fontSize: '0.76rem' }}>
                  {selectedMeeting.circuit}
                </div>
              </div>
            </div>

            {selectedMeeting.circuitImage && (
              <img
                src={selectedMeeting.circuitImage}
                alt={selectedMeeting.circuit}
                style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
              />
            )}
          </div>
        )}
      </div>

      {/* Session Tabs Bar */}
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          gap: '6px',
          background: '#0B1324',
          padding: '5px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          alignSelf: 'flex-start'
        }}
      >
        {sessionOptions.map((s) => {
          const isSelected = selectedSession === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSession(s.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: isSelected
                  ? 'linear-gradient(90deg, #E10600 0%, #B00000 100%)'
                  : 'transparent',
                color: isSelected ? '#fff' : 'var(--text-sub)',
                fontSize: '0.84rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                boxShadow: isSelected ? '0 4px 12px rgba(225,6,0,0.35)' : 'none'
              }}
            >
              {s.isRace && <Flag size={14} />}
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2-Column Main Content Grid */}
      <div className="results-layout-grid">
        {/* Left Column: Results Table */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div
            style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              {activeSessionLabel} - Resultados
            </h2>
          </div>

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
                  <th style={{ padding: '12px 20px', width: '68px' }}>Pos</th>
                  <th style={{ padding: '12px 14px' }}>Piloto</th>
                  <th style={{ padding: '12px 14px' }}>Escudería</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Tiempo / Dif.</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ padding: '42px 24px', textAlign: 'center', color: 'var(--text-sub)' }}
                    >
                      {loading
                        ? 'Cargando tiempos oficiales de la API...'
                        : 'No hay resultados registrados en la API para esta sesión.'}
                    </td>
                  </tr>
                ) : (
                  results.map((row, idx) => {
                    const accentColor = row.teamColour || 'var(--f1-red)';
                    return (
                      <tr
                        key={row.number || idx}
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      >
                        <td style={{ padding: '10px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span
                              style={{
                                width: '3px',
                                height: '24px',
                                borderRadius: '2px',
                                background: accentColor
                              }}
                            />
                            <strong style={{ color: '#fff', fontSize: '0.9rem' }}>
                              {row.pos}
                            </strong>
                          </div>
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '30px',
                                height: '30px',
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
                              {row.headshotUrl ? (
                                <img
                                  src={row.headshotUrl}
                                  alt={row.driver}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'top'
                                  }}
                                />
                              ) : (
                                <User size={14} color="var(--text-muted)" />
                              )}
                            </div>
                            <span style={{ color: '#fff', fontWeight: 500, fontSize: '0.88rem' }}>
                              {row.lastName || row.driver}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '16px',
                                height: '11px',
                                borderRadius: '3px',
                                background: accentColor,
                                display: 'inline-block'
                              }}
                            />
                            <span style={{ color: 'var(--text-sub)', fontSize: '0.84rem' }}>
                              {row.team}
                            </span>
                          </div>
                        </td>

                        <td
                          style={{
                            padding: '10px 20px',
                            textAlign: 'right',
                            fontFamily: 'var(--font-race)',
                            fontSize: '0.88rem',
                            color: row.pos === 1 ? '#fff' : 'var(--text-sub)',
                            fontWeight: row.pos === 1 ? 700 : 500,
                            fontVariantNumeric: 'tabular-nums'
                          }}
                        >
                          {row.gap}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Circuit Info & Best Times */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedMeeting && (
            <div className="glass-panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                {selectedMeeting.countryFlagUrl && (
                  <img
                    src={selectedMeeting.countryFlagUrl}
                    alt={selectedMeeting.countryName}
                    style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                )}
                <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                  {selectedMeeting.city || selectedMeeting.countryName}
                </strong>
              </div>

              {selectedMeeting.circuitImage && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #101C35 0%, #091020 100%)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <img
                    src={selectedMeeting.circuitImage}
                    alt={selectedMeeting.circuit}
                    style={{ maxHeight: '110px', width: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: weather ? '14px' : '0' }}>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
                  {selectedMeeting.circuit}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '2px' }}>
                  {selectedMeeting.officialName}
                </div>
              </div>

              {weather && (
                <div
                  style={{
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  {weather.rainfall ? (
                    <CloudRain size={26} color="var(--f1-cyan)" />
                  ) : (
                    <Sun size={26} color="var(--f1-gold)" />
                  )}
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Clima (API)</div>
                    <strong style={{ fontSize: '1.1rem', color: '#fff' }}>
                      {weather.airTemp}°C
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                      Pista: {weather.trackTemp}°C &bull; Humedad: {weather.humidity}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Best Times Card */}
          <div className="glass-panel" style={{ padding: '18px' }}>
            <h3
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '12px',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              Mejores tiempos ({activeSessionLabel})
            </h3>

            {topThreeTimes.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Sin tiempos registrados
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topThreeTimes.map((item, i) => (
                  <div
                    key={item.number || i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ color: 'var(--text-sub)', width: '14px' }}>{i + 1}</strong>
                      <span style={{ color: '#fff', fontWeight: 500 }}>
                        {item.lastName || item.driver}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-race)',
                        color: 'var(--text-sub)',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {item.fastestLapTime || item.gap}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
