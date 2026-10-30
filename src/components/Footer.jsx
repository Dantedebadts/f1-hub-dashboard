import React from 'react';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            fontFamily: 'var(--font-race)',
            fontWeight: 900,
            fontStyle: 'italic',
            color: 'var(--f1-red)',
            fontSize: '0.95rem'
          }}
        >
          F1
        </span>
        <span>|</span>
        <span>Más que una carrera, una pasión.</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '18px', height: '4px', borderRadius: '2px', background: '#00D2BE' }} />
        <span style={{ width: '18px', height: '4px', borderRadius: '2px', background: '#E10600' }} />
        <span style={{ width: '18px', height: '4px', borderRadius: '2px', background: '#38BDF8' }} />
      </div>
    </footer>
  );
}
