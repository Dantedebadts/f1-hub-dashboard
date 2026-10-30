import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Countdown from './components/Countdown';
import SessionTimeline from './components/SessionTimeline';
import TopStandingsCard from './components/TopStandingsCard';
import StandingsView from './components/StandingsView';
import RaceResultsView from './components/RaceResultsView';
import DriverDirectoryView from './components/DriverDirectoryView';
import DriverModal from './components/DriverModal';
import TimezoneSelector from './components/TimezoneSelector';
import Footer from './components/Footer';
import { f1Api } from './services/f1Api';
import { storage } from './services/storage';
import {
  Home,
  Trophy,
  Flag,
  Users,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timezone, setTimezone] = useState(() => storage.getTimezone());
  const [drivers, setDrivers] = useState([]);
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [nextMeeting, setNextMeeting] = useState(null);
  const [selectedDriverModal, setSelectedDriverModal] = useState(null);
  const [selectedMeetingForResults, setSelectedMeetingForResults] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.detail?.key === 'f1_timezone_pref') {
        setTimezone(storage.getTimezone());
      }
    };
    window.addEventListener('f1_storage_change', handleStorageChange);
    return () => window.removeEventListener('f1_storage_change', handleStorageChange);
  }, []);

  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
        f1Api.clearCache();
      } else {
        setLoading(true);
      }
      setError(null);

      const [dStandings, cStandings, calendar, upcoming] = await Promise.all([
        f1Api.getDriverStandings(),
        f1Api.getConstructorStandings(),
        f1Api.getMeetings(),
        f1Api.getNextMeeting()
      ]);

      setDrivers(dStandings);
      setDriverStandings(dStandings);
      setConstructorStandings(cStandings);
      setMeetings(calendar);
      setNextMeeting(upcoming);
    } catch (err) {
      console.error('Error fetching F1 data:', err);
      setError('No se pudo conectar con la API de Fórmula 1. Verifica tu conexión e intenta nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'standings', label: 'Campeonato', icon: Trophy },
    { id: 'results', label: 'Resultados', icon: Flag },
    { id: 'drivers', label: 'Pilotos', icon: Users }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-shell)'
      }}
    >
      <Navbar
        setActiveTab={setActiveTab}
        onRefresh={() => loadData(true)}
        isRefreshing={refreshing}
        drivers={drivers}
        meetings={meetings}
        onSelectDriver={setSelectedDriverModal}
        onSelectMeeting={(mId) => setSelectedMeetingForResults(mId)}
      />

      <div className="app-layout">
        {/* Left Sidebar Navigation */}
        <aside
          style={{
            background: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border-subtle)',
            padding: '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '24px'
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive
                      ? 'linear-gradient(90deg, #E10600 0%, #9E0400 100%)'
                      : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-sub)',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: isActive ? '0 4px 16px rgba(225, 6, 0, 0.35)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <TimezoneSelector onTimezoneChange={setTimezone} />
          </div>
        </aside>

        {/* Main Content Area */}
        <main
          style={{
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '1240px',
            width: '100%',
            margin: '0 auto'
          }}
        >
          {error && (
            <div
              className="glass-panel"
              style={{
                padding: '14px 18px',
                border: '1px solid rgba(225, 6, 0, 0.4)',
                background: 'rgba(225, 6, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={18} color="var(--f1-red)" />
                <span style={{ fontSize: '0.88rem', color: '#fff' }}>{error}</span>
              </div>
              <button
                onClick={() => loadData(true)}
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
              >
                Reintentar
              </button>
            </div>
          )}

          {loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '420px',
                gap: '14px'
              }}
            >
              <RefreshCw
                size={34}
                color="var(--f1-red)"
                style={{ animation: 'spin 1.2s linear infinite' }}
              />
              <div style={{ fontFamily: 'var(--font-race)', fontSize: '1.1rem', color: '#fff' }}>
                Sincronizando datos en tiempo real desde la API...
              </div>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {/* VIEW 1: INICIO */}
              {activeTab === 'dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Countdown meeting={nextMeeting} />

                  <div className="dashboard-mid-grid">
                    <SessionTimeline
                      sessions={nextMeeting?.sessions || []}
                      timezone={timezone}
                      onViewAll={() => setActiveTab('results')}
                    />

                    <TopStandingsCard
                      drivers={driverStandings}
                      onNavigateToStandings={() => setActiveTab('standings')}
                      onSelectDriver={setSelectedDriverModal}
                    />
                  </div>

                  {/* Bottom Real-Time Info Banner matching reference UI */}
                  <div
                    className="glass-panel"
                    style={{
                      padding: '18px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '18px',
                      background:
                        'radial-gradient(circle at 80% 50%, rgba(225, 6, 0, 0.18) 0%, transparent 55%), linear-gradient(90deg, rgba(11, 19, 36, 0.95) 0%, rgba(15, 25, 48, 0.9) 100%)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {nextMeeting?.countryFlagUrl ? (
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            padding: '3px',
                            border: '2px solid var(--f1-red)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <img
                            src={nextMeeting.countryFlagUrl}
                            alt={nextMeeting.countryName}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      ) : (
                        <Flag size={28} color="var(--f1-red)" />
                      )}

                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                          La F1, en tiempo real
                        </h3>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-sub)', maxWidth: '420px' }}>
                          Tiempos, posiciones y toda la info del campeonato, en un solo lugar.
                        </p>
                      </div>
                    </div>

                    {nextMeeting?.circuitImage && (
                      <img
                        src={nextMeeting.circuitImage}
                        alt={nextMeeting.circuit}
                        style={{
                          height: '62px',
                          width: 'auto',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))'
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 2: CAMPEONATO */}
              {activeTab === 'standings' && (
                <StandingsView
                  drivers={driverStandings}
                  constructors={constructorStandings}
                  onSelectDriver={setSelectedDriverModal}
                />
              )}

              {/* VIEW 3: RESULTADOS */}
              {activeTab === 'results' && (
                <RaceResultsView
                  meetings={meetings}
                  initialMeetingId={selectedMeetingForResults}
                />
              )}

              {/* VIEW 4: PILOTOS */}
              {activeTab === 'drivers' && (
                <DriverDirectoryView
                  drivers={drivers}
                  onSelectDriver={setSelectedDriverModal}
                />
              )}
            </>
          )}

          <Footer />
        </main>
      </div>

      {selectedDriverModal && (
        <DriverModal
          driver={selectedDriverModal}
          onClose={() => setSelectedDriverModal(null)}
        />
      )}
    </div>
  );
}
