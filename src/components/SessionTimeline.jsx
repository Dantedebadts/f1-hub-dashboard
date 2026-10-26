import React from 'react';
import { formatSessionDateTime, getSessionStatus } from '../services/dateUtils';
import { Clock, Calendar, CheckCircle2, PlayCircle, AlertCircle } from 'lucide-react';

export default function SessionTimeline({ sessions = [], timezone = 'UTC' }) {
  if (!sessions || sessions.length === 0) return null;

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
        <div>
          <h2 style={{
            fontSize: '1.35rem',
            textTransform: 'uppercase',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Calendar size={20} color="var(--f1-red)" />
            <span>Cronograma del Fin de Semana</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginTop: '2px' }}>
            Horarios convertidos en tiempo real a tu zona: <strong style={{ color: 'var(--f1-cyan)' }}>{timezone.split('/').pop().replace(/_/g, ' ')}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
          <span className="badge badge-upcoming" style={{ padding: '3px 8px' }}>Próxima</span>
          <span className="badge badge-live" style={{ padding: '3px 8px' }}>En Vivo</span>
          <span className="badge badge-finished" style={{ padding: '3px 8px' }}>Finalizada</span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {sessions.map((session, idx) => {
          const status = getSessionStatus(session.start, session.end);
          const formatted = formatSessionDateTime(session.start, timezone);

          let badgeClass = 'badge-upcoming';
          let badgeLabel = 'PRÓXIMA';
          let icon = <Clock size={12} />;
          let borderHighlight = 'rgba(255, 255, 255, 0.08)';

          if (status === 'finished') {
            badgeClass = 'badge-finished';
            badgeLabel = 'FINALIZADA';
            icon = <CheckCircle2 size={12} />;
          } else if (status === 'live') {
            badgeClass = 'badge-live';
            badgeLabel = 'EN VIVO';
            icon = <PlayCircle size={12} />;
            borderHighlight = 'rgba(225, 6, 0, 0.6)';
          } else if (idx === 0 || (idx > 0 && sessions[idx - 1] && getSessionStatus(sessions[idx - 1].start, sessions[idx - 1].end) === 'finished')) {
            borderHighlight = 'rgba(0, 210, 190, 0.4)';
          }

          return (
            <div
              key={session.name + idx}
              style={{
                background: status === 'live' 
                  ? 'linear-gradient(135deg, rgba(225, 6, 0, 0.12) 0%, rgba(18, 24, 38, 0.8) 100%)'
                  : 'rgba(14, 19, 30, 0.6)',
                border: `1px solid ${borderHighlight}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
                boxShadow: status === 'live' ? '0 0 20px rgba(225, 6, 0, 0.25)' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = borderHighlight;
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{
                    fontFamily: 'var(--font-race)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em'
                  }}>
                    SESIÓN 0{idx + 1}
                  </span>
                  <span className={`badge ${badgeClass}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                    {icon}
                    {badgeLabel}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.3
                }}>
                  {session.name}
                </h3>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: '3px' }}>
                  {formatted.dateFormatted}
                </div>
                <div style={{
                  fontFamily: 'var(--font-race)',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: status === 'live' ? '#ff4d4d' : 'var(--f1-cyan)',
                  letterSpacing: '0.02em'
                }}>
                  {formatted.timeFormatted}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
