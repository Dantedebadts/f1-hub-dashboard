import React, { useState, useEffect } from 'react';
import { Flag, Trophy, Clock, Star, MessageSquare, Send, CheckCircle, Flame } from 'lucide-react';
import { storage } from '../services/storage';
import { f1Api } from '../services/f1Api';

export default function RaceResultsView({ meetings = [], onSelectDriver }) {
  // Find latest completed meeting or first meeting
  const completedMeetings = meetings.filter(m => !m.isUpcoming);
  const defaultMeeting = completedMeetings[completedMeetings.length - 1] || meetings[0];

  const [selectedMeetingId, setSelectedMeetingId] = useState(defaultMeeting?.id || '');
  const [selectedSession, setSelectedSession] = useState('Race');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Community Comments state (localStorage)
  const [comments, setComments] = useState([]);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Synchronize selectedMeetingId when meetings finish loading
  useEffect(() => {
    if (meetings.length > 0 && (!selectedMeetingId || !meetings.some(m => m.id === selectedMeetingId))) {
      const completed = meetings.filter(m => !m.isUpcoming);
      const latest = completed[completed.length - 1] || meetings[0];
      if (latest) {
        setSelectedMeetingId(latest.id);
      }
    }
  }, [meetings, selectedMeetingId]);

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId) || defaultMeeting;

  // Load session results whenever meeting or session changes
  useEffect(() => {
    if (!selectedMeeting) return;
    let isMounted = true;
    setLoading(true);

    f1Api.getSessionResults(selectedMeeting, selectedSession)
      .then(res => {
        if (isMounted) {
          setResults(res || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Error fetching live session results:', err);
        if (isMounted) {
          setResults([]);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [selectedMeeting, selectedSession]);

  // Load comments for the selected meeting
  useEffect(() => {
    if (selectedMeetingId) {
      setComments(storage.getComments(selectedMeetingId));
    }
  }, [selectedMeetingId]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedMeetingId) return;

    const newComment = storage.addComment(selectedMeetingId, {
      author: authorName.trim() || 'Fanático F1',
      rating,
      text: commentText
    });

    if (newComment) {
      setComments([newComment, ...comments]);
      setCommentText('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    }
  };

  const sessionOptions = [
    { id: 'Race', label: 'Carrera (Gran Premio)' },
    { id: 'Qualifying', label: 'Clasificación' },
    { id: 'Sprint', label: 'Sprint' },
    { id: 'Practice 1', label: 'Práctica 1 (FP1)' },
    { id: 'Practice 2', label: 'Práctica 2 (FP2)' },
    { id: 'Practice 3', label: 'Práctica 3 (FP3)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & GP Selector */}
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
              <Flag size={24} color="var(--f1-red)" />
              <h1 style={{ fontSize: '2rem', textTransform: 'uppercase', color: '#fff' }}>
                Resultados por Gran Premio
              </h1>
            </div>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>
              Consulta las tablas oficiales de tiempos de cada sesión del fin de semana de carrera.
            </p>
          </div>

          {/* GP Selector Dropdown */}
          <div style={{ minWidth: '280px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
              Seleccionar Gran Premio:
            </label>
            <select
              value={selectedMeetingId}
              onChange={(e) => setSelectedMeetingId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(7, 10, 16, 0.85)',
                border: '1px solid var(--border-hover)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {meetings.map((m) => (
                <option key={m.id} value={m.id} style={{ background: '#0b0f17', color: '#fff' }}>
                  Round {m.round}: {m.name} ({m.countryName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected GP Info Banner */}
        {selectedMeeting && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.1) 0%, rgba(18, 24, 38, 0.6) 100%)',
            border: '1px solid rgba(225, 6, 0, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.6rem' }}>{selectedMeeting.flag}</span>
              <div>
                <strong style={{ fontSize: '1.15rem', color: '#fff' }}>{selectedMeeting.officialName}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                  {selectedMeeting.circuit} &bull; {selectedMeeting.city} &bull; {selectedMeeting.circuitLengthKm}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>VUELTAS</span>
                <strong style={{ color: '#fff' }}>{selectedMeeting.laps}</strong>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '16px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>RÉCORD</span>
                <strong style={{ color: 'var(--f1-gold)' }}>{selectedMeeting.lapRecord}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Session Switcher Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingTop: '18px',
          marginTop: '16px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {sessionOptions.map((s) => {
            const isSelected = selectedSession === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSession(s.id)}
                className="btn"
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? '1px solid var(--f1-red)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--f1-red)' : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#fff' : 'var(--text-sub)',
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(7, 10, 16, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--f1-cyan)" />
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', color: '#fff' }}>
              Tiempos Oficiales &bull; {selectedSession}
            </h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {results.length} pilotos registrados
          </span>
        </div>

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
                <th style={{ padding: '12px 20px', width: '60px' }}>POS</th>
                <th style={{ padding: '12px 14px', width: '60px' }}>NO</th>
                <th style={{ padding: '12px 16px' }}>PILOTO</th>
                <th style={{ padding: '12px 16px' }}>ESCUDERÍA</th>
                <th style={{ padding: '12px 16px' }}>TIEMPO / DETALLE</th>
                <th style={{ padding: '12px 16px' }}>DIFERENCIA (GAP)</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>VUELTAS</th>
                {selectedSession === 'Race' && (
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>PUNTOS</th>
                )}
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={selectedSession === 'Race' ? 8 : 7} style={{ padding: '42px 24px', textAlign: 'center', color: 'var(--text-sub)' }}>
                    {loading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <Clock size={24} color="var(--f1-cyan)" style={{ animation: 'spin 1.5s linear infinite' }} />
                        <span>Consultando telemetría oficial de la API...</span>
                      </div>
                    ) : selectedMeeting?.isUpcoming ? (
                      <div style={{ maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
                        <strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>
                          Sesión aún no disputada
                        </strong>
                        <span>
                          El {selectedMeeting.name} se disputará próximamente ({new Date(selectedMeeting.raceDate).toLocaleDateString()}). Los tiempos oficiales se sincronizarán en vivo directamente desde la API apenas concluya la sesión.
                        </span>
                      </div>
                    ) : (
                      <span>
                        No hay tiempos registrados en la API para la sesión "{selectedSession}" en este Gran Premio.
                      </span>
                    )}
                  </td>
                </tr>
              ) : (
                results.map((row, idx) => (
                  <tr
                    key={row.number || idx}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)'
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontFamily: 'var(--font-race)',
                        fontWeight: 900,
                        fontSize: '1.15rem',
                        color: row.pos === 1 ? 'var(--f1-gold)' : row.pos === 2 ? '#CED4DA' : row.pos === 3 ? '#CD7F32' : 'var(--text-muted)'
                      }}>
                        {row.pos}
                      </span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={{
                        fontFamily: 'var(--font-race)',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: 'var(--text-sub)'
                      }}>
                        #{row.number}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{row.driver}</strong>
                        {row.fastestLap && (
                          <span
                            title="Vuelta más rápida de la carrera (+1 punto)"
                            style={{
                              background: 'rgba(139, 92, 246, 0.2)',
                              color: '#C084FC',
                              border: '1px solid rgba(139, 92, 246, 0.4)',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Flame size={10} /> FL
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '3px', height: '14px', background: row.teamColour || '#E10600', borderRadius: '2px' }} />
                        <span style={{ color: 'var(--text-sub)', fontSize: '0.88rem' }}>{row.team}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '0.92rem',
                        color: row.pos === 1 ? 'var(--f1-cyan)' : 'var(--text-main)',
                        fontWeight: 600
                      }}>
                        {row.time}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>
                        {row.gap}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {row.laps}
                      </span>
                    </td>

                    {selectedSession === 'Race' && (
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <span style={{
                          fontFamily: 'var(--font-race)',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          color: row.points > 0 ? 'var(--f1-gold)' : 'var(--text-muted)'
                        }}>
                          {row.points > 0 ? `+${row.points}` : '0'}
                        </span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fan Corner: LocalStorage Race Reviews & Comments */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <MessageSquare size={22} color="var(--f1-cyan)" />
          <h2 style={{ fontSize: '1.4rem', textTransform: 'uppercase', color: '#fff' }}>
            Comunidad y Calificaciones del Gran Premio
          </h2>
        </div>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Deja tus notas, opiniones y calificación sobre este Gran Premio. Se guardan localmente en tu navegador (localStorage).
        </p>

        {/* Form to submit review */}
        <form onSubmit={handleAddComment} style={{
          background: 'rgba(7, 10, 16, 0.65)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '14px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                Tu Nombre o Apodo:
              </label>
              <input
                type="text"
                placeholder="Ej. Dante (Fan Williams)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                Calificación de la Carrera:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: star <= rating ? 'var(--f1-gold)' : 'var(--text-muted)',
                      padding: '4px',
                      transition: 'transform 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Star size={22} fill={star <= rating ? 'var(--f1-gold)' : 'none'} />
                  </button>
                ))}
                <span style={{ fontSize: '0.85rem', color: 'var(--f1-gold)', fontWeight: 700, marginLeft: '6px' }}>
                  {rating} / 5
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
              Tu Comentario o Análisis del Gran Premio:
            </label>
            <textarea
              rows={3}
              placeholder="¿Qué te pareció la estrategia, los adelantamientos o el rendimiento de tus pilotos favoritos?"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {commentSuccess ? (
              <span style={{ color: 'var(--f1-green)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> ¡Comentario guardado exitosamente en tu navegador!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!commentText.trim()}
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              <Send size={14} />
              <span>Publicar Comentario</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>
              Aún no hay comentarios para este Gran Premio. ¡Sé el primero en dejar tu opinión!
            </div>
          ) : (
            comments.map((cmt) => (
              <div
                key={cmt.id}
                style={{
                  background: 'rgba(14, 19, 30, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{cmt.author}</strong>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          color="var(--f1-gold)"
                          fill={s <= cmt.rating ? 'var(--f1-gold)' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(cmt.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {cmt.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
