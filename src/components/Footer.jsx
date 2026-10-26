import React from 'react';
import { Flag, Radio, Heart, ExternalLink } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer style={{
      marginTop: '60px',
      borderTop: '1px solid var(--border-subtle)',
      background: 'rgba(7, 9, 14, 0.95)',
      padding: '40px 24px 30px 24px'
    }}>
      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '32px',
        marginBottom: '32px'
      }}>
        {/* Brand Col */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              background: 'var(--f1-red)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-race)',
              fontWeight: 900,
              fontSize: '1rem',
              color: '#fff'
            }}>
              F1 HUB
            </div>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Dashboard de Carreras
            </span>
          </div>

          <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: '380px' }}>
            Plataforma 100% Front-End en React.js para fanáticos de la Fórmula 1. Horarios automáticos ajustados a tu país, tablas de posiciones en vivo y gestión local con localStorage.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', fontSize: '0.78rem', color: 'var(--f1-cyan)' }}>
            <Radio size={14} />
            <span>Conectado a OpenF1 & Jolpica Ergast API</span>
          </div>
        </div>

        {/* Quick Nav Col */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
            Secciones de la App
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <li>
              <button
                onClick={() => onNavigate('dashboard')}
                style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--f1-red)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-sub)'}
              >
                &bull; Dashboard & Próxima Carrera
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('standings')}
                style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--f1-red)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-sub)'}
              >
                &bull; Campeonato de Pilotos y Constructores
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('results')}
                style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--f1-red)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-sub)'}
              >
                &bull; Resultados por Gran Premio & Sesión
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('drivers')}
                style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--f1-red)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-sub)'}
              >
                &bull; Directorio de Pilotos & Favoritos
              </button>
            </li>
          </ul>
        </div>

        {/* Local Storage Info Col */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
            Almacenamiento Local (localStorage)
          </h4>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            lineHeight: 1.6,
            color: 'var(--text-sub)'
          }}>
            <div><strong style={{ color: 'var(--f1-cyan)' }}>f1_favorites:</strong> Pilotos marcados con la estrella.</div>
            <div><strong style={{ color: 'var(--f1-cyan)' }}>f1_timezone_pref:</strong> Configuración horaria elegida.</div>
            <div><strong style={{ color: 'var(--f1-cyan)' }}>f1_race_comments:</strong> Notas y reseñas comunitarias.</div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          F1 Hub Dashboard &bull; Desarrollado para fanáticos de la Fórmula 1.
        </div>
        <div>
          Datos oficiales provistos por OpenF1 & Jolpica. Este proyecto no está asociado con Formula One Management ni FIA.
        </div>
      </div>
    </footer>
  );
}
