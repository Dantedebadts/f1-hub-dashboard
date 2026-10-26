import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Countdown from './components/Countdown';
import SessionTimeline from './components/SessionTimeline';
import TopStandingsCard from './components/TopStandingsCard';
import StandingsView from './components/StandingsView';
import RaceResultsView from './components/RaceResultsView';
import DriverDirectoryView from './components/DriverDirectoryView';
import DriverModal from './components/DriverModal';
import DriverCard from './components/DriverCard';
import Footer from './components/Footer';
import { f1Api } from './services/f1Api';
import { storage } from './services/storage';
import { Star, AlertCircle, RefreshCw, Sparkles, Award } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timezone, setTimezone] = useState(() => storage.getTimezone());
  const [drivers, setDrivers] = useState([]);
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [nextMeeting, setNextMeeting] = useState(null);
  const [selectedDriverModal, setSelectedDriverModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoritesList, setFavoritesList] = useState(() => storage.getFavorites());

  // Listen to storage events to sync favorites across the entire UI
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.detail?.key === 'f1_favorites') {
        setFavoritesList(e.detail.value);
      }
      if (e.detail?.key === 'f1_timezone_pref') {
        setTimezone(storage.getTimezone());
      }
    };
    window.addEventListener('f1_storage_change', handleStorageChange);
    return () => window.removeEventListener('f1_storage_change', handleStorageChange);
  }, []);

  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Initial and refresh data loading directly from OpenF1 & Jolpica
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
      console.error('Error fetching live F1 data from APIs:', err);
      setError('No se pudo conectar con las APIs de OpenF1 / Jolpica. Por favor verifica tu conexión e intenta nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter favorite drivers for dashboard quick-access row
  const favoriteDrivers = drivers.filter(d => storage.isFavorite(d.id || d.code));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Motorsport Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        timezone={timezone}
        setTimezone={setTimezone}
        onRefresh={() => loadData(true)}
        isRefreshing={refreshing}
      />

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        maxWidth: '1380px',
        width: '100%',
        margin: '0 auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px'
      }}>
        {error && (
          <div className="glass-panel" style={{
            padding: '16px 20px',
            border: '1px solid rgba(225, 6, 0, 0.4)',
            background: 'rgba(225, 6, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} color="var(--f1-red)" />
              <span style={{ fontSize: '0.9rem', color: '#fff' }}>{error}</span>
            </div>
            <button
              onClick={() => loadData(true)}
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            gap: '16px'
          }}>
            <RefreshCw size={36} color="var(--f1-red)" className="spin-animation" style={{ animation: 'spin 1.2s linear infinite' }} />
            <div style={{ fontFamily: 'var(--font-race)', fontSize: '1.2rem', color: '#fff' }}>
              Consultando APIs Oficiales de Fórmula 1 en Vivo...
            </div>
            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        ) : (
          <>
            {/* VIEW 1: DASHBOARD / INICIO */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {/* Hero: Live Countdown to next GP */}
                <Countdown
                  meeting={nextMeeting}
                  timezone={timezone}
                  onExploreSchedule={() => {
                    const el = document.getElementById('session-timeline-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                {/* Quick Favorites Section */}
                {favoriteDrivers.length > 0 && (
                  <div className="glass-panel" style={{ padding: '22px 26px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star size={18} color="var(--f1-gold)" fill="var(--f1-gold)" />
                        <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', color: '#fff' }}>
                          Tus Pilotos Favoritos
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('drivers')}
                        className="btn btn-glass"
                        style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                      >
                        Administrar en Directorio
                      </button>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '16px'
                    }}>
                      {favoriteDrivers.map((driver) => (
                        <DriverCard
                          key={driver.id || driver.fullName}
                          driver={driver}
                          onClick={setSelectedDriverModal}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid: Schedule Timeline on Left & Top 5 Standings on Right */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                  gap: '24px'
                }}>
                  <div id="session-timeline-section">
                    <SessionTimeline
                      sessions={nextMeeting?.sessions || []}
                      timezone={timezone}
                    />
                  </div>

                  <div>
                    <TopStandingsCard
                      drivers={driverStandings}
                      constructors={constructorStandings}
                      onNavigateToStandings={() => setActiveTab('standings')}
                      onSelectDriver={setSelectedDriverModal}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: CAMPEONATO (STANDINGS) */}
            {activeTab === 'standings' && (
              <StandingsView
                drivers={driverStandings}
                constructors={constructorStandings}
                onSelectDriver={setSelectedDriverModal}
              />
            )}

            {/* VIEW 3: RESULTADOS POR GRAN PREMIO & FAN CORNER */}
            {activeTab === 'results' && (
              <RaceResultsView
                meetings={meetings}
                onSelectDriver={setSelectedDriverModal}
              />
            )}

            {/* VIEW 4: DIRECTORIO DE PILOTOS & FAVORITOS */}
            {activeTab === 'drivers' && (
              <DriverDirectoryView
                drivers={drivers}
                onSelectDriver={setSelectedDriverModal}
              />
            )}
          </>
        )}
      </main>

      {/* Driver In-Depth Detail Modal */}
      {selectedDriverModal && (
        <DriverModal
          driver={selectedDriverModal}
          onClose={() => setSelectedDriverModal(null)}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />
    </div>
  );
}
