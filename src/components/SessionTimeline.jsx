import React from 'react';
import { formatSessionDateTime } from '../services/dateUtils';
import { Clock, ArrowRight } from 'lucide-react';

export default function SessionTimeline({ sessions = [], timezone = 'UTC', onViewAll }) {
  if (!sessions || sessions.length === 0) return null;

  const tzLabel = timezone.split('/').pop().replace(/_/g, ' ');

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
          <Clock size={17} color="var(--f1-cyan)" />
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
            Horarios{' '}
            <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-sub)' }}>
              (hora local: {tzLabel})
            </span>
          </span>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
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
            <span>Ver todos</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {sessions.map((session, idx) => {
          const formatted = formatSessionDateTime(session.start, timezone);
          const isLast = idx === sessions.length - 1;

          return (
            <div
              key={session.name + idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr 0.7fr',
                alignItems: 'center',
                padding: '11px 4px',
                borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                fontSize: '0.86rem'
              }}
            >
              <span style={{ color: 'var(--text-sub)' }}>{formatted.shortDate}</span>
              <span style={{ color: '#fff', fontWeight: 500 }}>{session.name}</span>
              <span
                style={{
                  color: '#fff',
                  fontWeight: 700,
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {formatted.shortTime}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
