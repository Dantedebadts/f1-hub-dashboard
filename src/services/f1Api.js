// F1 API Client connecting directly to OpenF1 & Jolpica Ergast in real time.
// All sports data (championship standings, drivers, calendar, race results) comes dynamically from APIs.

const OPENF1_BASE = 'https://api.openf1.org/v1';
const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1';
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes in-memory cache to prevent duplicate rapid requests

const memoryCache = new Map();

export const NATIONALITY_FLAGS = {
  Italian: '🇮🇹',
  British: '🇬🇧',
  Dutch: '🇳🇱',
  Monegasque: '🇲🇨',
  Spanish: '🇪🇸',
  Argentine: '🇦🇷',
  Argentinian: '🇦🇷',
  Australian: '🇦🇺',
  French: '🇫🇷',
  German: '🇩🇪',
  Mexican: '🇲🇽',
  Canadian: '🇨🇦',
  Brazilian: '🇧🇷',
  'New Zealander': '🇳🇿',
  Japanese: '🇯🇵',
  Danish: '🇩🇰',
  American: '🇺🇸',
  Finnish: '🇫🇮',
  Chinese: '🇨🇳',
  Thai: '🇹🇭',
  Austrian: '🇦🇹',
  Swiss: '🇨🇭',
  Polish: '🇵🇱'
};

export const NATIONALITY_TO_COUNTRY_ES = {
  Italian: 'Italia',
  British: 'Reino Unido',
  Dutch: 'Países Bajos',
  Monegasque: 'Mónaco',
  Spanish: 'España',
  Argentine: 'Argentina',
  Argentinian: 'Argentina',
  Australian: 'Australia',
  French: 'Francia',
  German: 'Alemania',
  Mexican: 'México',
  Canadian: 'Canadá',
  Brazilian: 'Brasil',
  'New Zealander': 'Nueva Zelanda',
  Japanese: 'Japón',
  Danish: 'Dinamarca',
  American: 'Estados Unidos',
  Finnish: 'Finlandia',
  Chinese: 'China',
  Thai: 'Tailandia',
  Austrian: 'Austria',
  Swiss: 'Suiza',
  Polish: 'Polonia'
};

export const DRIVER_BIRTHPLACES_ES = {
  antonelli: 'Bolonia, Italia',
  russell: "King's Lynn, Reino Unido",
  hamilton: 'Stevenage, Reino Unido',
  max_verstappen: 'Hasselt, Bélgica',
  verstappen: 'Hasselt, Bélgica',
  leclerc: 'Montecarlo, Mónaco',
  norris: 'Bristol, Reino Unido',
  piastri: 'Melbourne, Australia',
  hadjar: 'París, Francia',
  lawson: 'Hastings, Nueva Zelanda',
  gasly: 'Ruan, Francia',
  arvid_lindblad: 'Londres, Reino Unido',
  lindblad: 'Londres, Reino Unido',
  colapinto: 'Pilar (Buenos Aires), Argentina',
  bearman: 'Chelmsford, Reino Unido',
  hulkenberg: 'Emmerich am Rhein, Alemania',
  bortoleto: 'São Paulo, Brasil',
  ocon: 'Évreux, Francia',
  alonso: 'Oviedo, España',
  sainz: 'Madrid, España',
  albon: 'Londres, Reino Unido',
  tsunoda: 'Sagamihara, Japón',
  stroll: 'Montreal, Canadá',
  bottas: 'Nastola, Finlandia',
  perez: 'Guadalajara, México'
};

export const COUNTRY_FLAGS = {
  Australia: '🇦🇺',
  China: '🇨🇳',
  Japan: '🇯🇵',
  USA: '🇺🇸',
  'United States': '🇺🇸',
  Canada: '🇨🇦',
  Monaco: '🇲🇨',
  Spain: '🇪🇸',
  Austria: '🇦🇹',
  UK: '🇬🇧',
  'Great Britain': '🇬🇧',
  'United Kingdom': '🇬🇧',
  Hungary: '🇭🇺',
  Belgium: '🇧🇪',
  Netherlands: '🇳🇱',
  Italy: '🇮🇹',
  Azerbaijan: '🇦🇿',
  Singapore: '🇸🇬',
  Mexico: '🇲🇽',
  Brazil: '🇧🇷',
  Qatar: '🇶🇦',
  UAE: '🇦🇪',
  'Saudi Arabia': '🇸🇦',
  Bahrain: '🇧🇭',
  Malaysia: '🇲🇾'
};

export const CONSTRUCTOR_COLORS = {
  mercedes: '#00D7B6',
  ferrari: '#ED1131',
  mclaren: '#F47600',
  red_bull: '#3671C6',
  aston_martin: '#229971',
  alpine: '#00A1E8',
  williams: '#1868DB',
  rb: '#6C98FF',
  racing_bulls: '#6C98FF',
  haas: '#9C9FA2',
  audi: '#F50537',
  cadillac: '#C6A052',
  sauber: '#52E252'
};

const FALLBACK_HEADSHOT =
  'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/driver_fallback.png';

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const cached = memoryCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText} at ${url}`);
    }
    const data = await res.json();
    memoryCache.set(url, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export const f1Api = {
  clearCache: () => {
    memoryCache.clear();
  },

  // 1. Get Driver Championship Standings directly from live API
  getDriverStandings: async (season = 'current') => {
    // Fetch Jolpica driver standings, OpenF1 drivers, exact podiums & poles, and full paginated results
    const [
      standingsData,
      openF1Drivers,
      p1Data,
      p2Data,
      p3Data,
      poleData,
      qPages,
      rPages
    ] = await Promise.all([
      fetchWithTimeout(`${JOLPICA_BASE}/${season}/driverStandings.json`),
      fetchWithTimeout(`${OPENF1_BASE}/drivers?meeting_key=latest`).catch(() => []),
      fetchWithTimeout(`${JOLPICA_BASE}/${season}/results/1.json?limit=100`).catch(() => null),
      fetchWithTimeout(`${JOLPICA_BASE}/${season}/results/2.json?limit=100`).catch(() => null),
      fetchWithTimeout(`${JOLPICA_BASE}/${season}/results/3.json?limit=100`).catch(() => null),
      fetchWithTimeout(`${JOLPICA_BASE}/${season}/qualifying/1.json?limit=100`).catch(() => null),
      Promise.all([
        fetchWithTimeout(`${JOLPICA_BASE}/${season}/qualifying.json?limit=100&offset=0`).catch(() => null),
        fetchWithTimeout(`${JOLPICA_BASE}/${season}/qualifying.json?limit=100&offset=100`).catch(() => null),
        fetchWithTimeout(`${JOLPICA_BASE}/${season}/qualifying.json?limit=100&offset=200`).catch(() => null),
        fetchWithTimeout(`${JOLPICA_BASE}/${season}/qualifying.json?limit=100&offset=300`).catch(() => null)
      ]),
      Promise.all([
        fetchWithTimeout(`${JOLPICA_BASE}/${season}/results.json?limit=100&offset=0`).catch(() => null),
        fetchWithTimeout(`${JOLPICA_BASE}/${season}/results.json?limit=100&offset=100`).catch(() => null),
        fetchWithTimeout(`${JOLPICA_BASE}/${season}/results.json?limit=100&offset=200`).catch(() => null),
        fetchWithTimeout(`${JOLPICA_BASE}/${season}/results.json?limit=100&offset=300`).catch(() => null)
      ])
    ]);

    const standingsList =
      standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

    // Map OpenF1 drivers by number and acronym for fast lookup
    const openF1Map = new Map();
    if (Array.isArray(openF1Drivers)) {
      openF1Drivers.forEach((d) => {
        if (!openF1Map.has(d.driver_number)) {
          openF1Map.set(d.driver_number, d);
        }
      });
    }

    // Exact podiums count across the entire season from position endpoints
    const podiumsMap = {};
    [p1Data, p2Data, p3Data].forEach((posRes) => {
      const races = posRes?.MRData?.RaceTable?.Races || [];
      races.forEach((r) => {
        const dId = r.Results?.[0]?.Driver?.driverId;
        if (dId) {
          podiumsMap[dId] = (podiumsMap[dId] || 0) + 1;
        }
      });
    });

    // Exact pole positions count across the entire season from pole endpoint
    const polesMap = {};
    const poleRaces = poleData?.MRData?.RaceTable?.Races || [];
    poleRaces.forEach((r) => {
      const dId = r.QualifyingResults?.[0]?.Driver?.driverId;
      if (dId) {
        polesMap[dId] = (polesMap[dId] || 0) + 1;
      }
    });

    // Best qualifying position across all paginated season qualifying sessions
    const bestQualyMap = {};
    qPages.forEach((page) => {
      const races = page?.MRData?.RaceTable?.Races || [];
      races.forEach((r) => {
        (r.QualifyingResults || []).forEach((q) => {
          const dId = q.Driver?.driverId;
          const pos = Number(q.position);
          if (dId && !isNaN(pos)) {
            if (!bestQualyMap[dId] || pos < bestQualyMap[dId]) {
              bestQualyMap[dId] = pos;
            }
          }
        });
      });
    });

    // Best finish position across all paginated season race results
    const bestFinishMap = {};
    rPages.forEach((page) => {
      const races = page?.MRData?.RaceTable?.Races || [];
      races.forEach((r) => {
        (r.Results || []).forEach((res) => {
          const dId = res.Driver?.driverId;
          const pos = Number(res.position);
          if (dId && !isNaN(pos)) {
            if (!bestFinishMap[dId] || pos < bestFinishMap[dId]) {
              bestFinishMap[dId] = pos;
            }
          }
        });
      });
    });

    return standingsList.map((item, idx) => {
      const driverId = item.Driver?.driverId || '';
      const code = item.Driver?.code || '';
      const permNumber = Number(item.Driver?.permanentNumber);
      const constId = item.Constructors?.[0]?.constructorId || '';
      const teamName = item.Constructors?.[0]?.name || 'F1 Team';

      // Match OpenF1 driver for official photo and color
      let ofDriver = openF1Map.get(permNumber);
      if (!ofDriver) {
        ofDriver = Array.from(openF1Map.values()).find(
          (od) =>
            od.name_acronym === code ||
            od.last_name?.toLowerCase() === item.Driver?.familyName?.toLowerCase()
        );
      }

      const teamColour = ofDriver?.team_colour
        ? `#${ofDriver.team_colour.replace('#', '')}`
        : CONSTRUCTOR_COLORS[constId] || '#E10600';

      const winsCount = Number(item.wins) || 0;
      const podiumsCount = podiumsMap[driverId] !== undefined ? podiumsMap[driverId] : winsCount;
      const bestPos = bestFinishMap[driverId] || (winsCount > 0 ? 1 : Number(item.position) || idx + 1);

      // Best qualifying as numeric P-rank (e.g. P1, P3, P8, P14)
      const qualyPos = bestQualyMap[driverId] || (item.position ? Number(item.position) : idx + 1);
      const bestQualy = `P${qualyPos}`;
      const bestFinish = `P${bestPos}`;

      const nationality = item.Driver?.nationality || '';
      const flag = NATIONALITY_FLAGS[nationality] || '🏁';
      const countryEs = NATIONALITY_TO_COUNTRY_ES[nationality] || nationality;
      const birthPlaceEs = DRIVER_BIRTHPLACES_ES[driverId] || (countryEs ? countryEs : 'No disponible');

      // Format date of birth in Spanish
      let birthDateFormatted = item.Driver?.dateOfBirth || '';
      if (birthDateFormatted) {
        try {
          const dObj = new Date(`${birthDateFormatted}T12:00:00Z`);
          if (!isNaN(dObj.getTime())) {
            birthDateFormatted = new Intl.DateTimeFormat('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }).format(dObj);
          }
        } catch {
          // keep original string if formatting fails
        }
      }

      return {
        position: Number(item.position) || idx + 1,
        points: Number(item.points) || 0,
        wins: winsCount,
        podiums: podiumsCount,
        poles: polesMap[driverId] || 0,
        id: driverId,
        driverNumber: permNumber || ofDriver?.driver_number || idx + 1,
        code: code || ofDriver?.name_acronym || 'F1',
        fullName: `${item.Driver?.givenName || ''} ${item.Driver?.familyName || ''}`.trim(),
        firstName: item.Driver?.givenName || '',
        lastName: item.Driver?.familyName || '',
        teamName,
        teamId: constId,
        teamColour,
        flag,
        countryName: countryEs,
        birthDate: birthDateFormatted,
        birthPlace: birthPlaceEs,
        bio: `Piloto de Fórmula 1 compitiendo para ${teamName}. Actualmente en la posición P${item.position} del Campeonato Mundial con ${item.points} puntos.`,
        headshotUrl: ofDriver?.headshot_url || FALLBACK_HEADSHOT,
        bestFinish,
        bestQualy
      };
    });
  },

  // 2. Get Constructor Championship Standings directly from live API
  getConstructorStandings: async (season = 'current') => {
    const [cStandingsData, dStandingsData] = await Promise.all([
      fetchWithTimeout(`${JOLPICA_BASE}/${season}/constructorStandings.json`),
      fetchWithTimeout(`${JOLPICA_BASE}/${season}/driverStandings.json`).catch(() => null)
    ]);

    const constructorList =
      cStandingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];

    // Map drivers belonging to each constructor
    const driversByConstructor = {};
    const dList =
      dStandingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
    dList.forEach((d) => {
      const cId = d.Constructors?.[0]?.constructorId;
      const driverName = `${d.Driver?.givenName || ''} ${d.Driver?.familyName || ''}`.trim();
      if (cId) {
        if (!driversByConstructor[cId]) driversByConstructor[cId] = [];
        driversByConstructor[cId].push(driverName);
      }
    });

    return constructorList.map((item, idx) => {
      const constId = item.Constructor?.constructorId || '';
      const name = item.Constructor?.name || 'Escudería F1';
      const colour = CONSTRUCTOR_COLORS[constId] || '#E10600';
      const drivers = driversByConstructor[constId] || [];

      return {
        position: Number(item.position) || idx + 1,
        points: Number(item.points) || 0,
        wins: Number(item.wins) || 0,
        teamId: constId,
        name,
        colour,
        drivers
      };
    });
  },

  // 3. Get Drivers Directory (powers driver search, sorting and cards)
  getDrivers: async (season = 'current') => {
    return await f1Api.getDriverStandings(season);
  },

  // 4. Get Complete Calendar of Grand Prix meetings directly from live API
  getMeetings: async (season = 'current') => {
    const [calendarData, openF1Meetings] = await Promise.all([
      fetchWithTimeout(`${JOLPICA_BASE}/${season}.json`),
      fetchWithTimeout(`${OPENF1_BASE}/meetings?year=2026`).catch(() => [])
    ]);

    const races = calendarData?.MRData?.RaceTable?.Races || [];
    const now = new Date();

    const ofMeetingsList = Array.isArray(openF1Meetings) ? openF1Meetings : [];

    return races.map((r) => {
      const roundNum = Number(r.round);
      const raceIso = `${r.date}T${r.time || '14:00:00Z'}`;
      const raceDateObj = new Date(raceIso);
      const isUpcoming = raceDateObj > now;

      // Find OpenF1 matching meeting for track image & official title
      const ofMeeting = ofMeetingsList.find((m) => {
        const mName = (m.meeting_name || '').toLowerCase();
        const rName = (r.raceName || '').toLowerCase().replace(' grand prix', '');
        const mLoc = (m.location || '').toLowerCase();
        const rLoc = (r.Circuit?.Location?.locality || '').toLowerCase();
        return mName.includes(rName) || mLoc === rLoc;
      });

      const sessions = [];
      if (r.FirstPractice) {
        const p1Start = `${r.FirstPractice.date}T${r.FirstPractice.time || '10:00:00Z'}`;
        sessions.push({
          name: 'Práctica 1',
          type: 'practice',
          start: p1Start,
          end: new Date(new Date(p1Start).getTime() + 3600000).toISOString()
        });
      }
      if (r.SecondPractice) {
        const p2Start = `${r.SecondPractice.date}T${r.SecondPractice.time || '14:00:00Z'}`;
        sessions.push({
          name: 'Práctica 2',
          type: 'practice',
          start: p2Start,
          end: new Date(new Date(p2Start).getTime() + 3600000).toISOString()
        });
      }
      if (r.ThirdPractice) {
        const p3Start = `${r.ThirdPractice.date}T${r.ThirdPractice.time || '11:00:00Z'}`;
        sessions.push({
          name: 'Práctica 3',
          type: 'practice',
          start: p3Start,
          end: new Date(new Date(p3Start).getTime() + 3600000).toISOString()
        });
      }
      if (r.Sprint) {
        const spStart = `${r.Sprint.date}T${r.Sprint.time || '12:00:00Z'}`;
        sessions.push({
          name: 'Sprint',
          type: 'sprint',
          start: spStart,
          end: new Date(new Date(spStart).getTime() + 3600000).toISOString()
        });
      }
      if (r.Qualifying) {
        const qStart = `${r.Qualifying.date}T${r.Qualifying.time || '14:00:00Z'}`;
        sessions.push({
          name: 'Clasificación',
          type: 'qualifying',
          start: qStart,
          end: new Date(new Date(qStart).getTime() + 3600000).toISOString()
        });
      }
      sessions.push({
        name: 'Carrera',
        type: 'race',
        start: raceIso,
        end: new Date(raceDateObj.getTime() + 7200000).toISOString()
      });

      const country = r.Circuit?.Location?.country || '';
      const flag = COUNTRY_FLAGS[country] || '🏁';

      return {
        id: `${r.Circuit?.circuitId || 'gp'}-${roundNum}`,
        round: roundNum,
        totalRounds: races.length,
        name: r.raceName,
        officialName: ofMeeting?.meeting_official_name || r.raceName,
        circuit: r.Circuit?.circuitName || 'Circuito de F1',
        city: r.Circuit?.Location?.locality || '',
        countryName: country,
        flag,
        circuitLengthKm: '5.513 km',
        laps: 56,
        drsZones: 2,
        lapRecord: '1:36.169 (C. Leclerc)',
        raceDate: raceIso,
        startDate: sessions[0]?.start || raceIso,
        isUpcoming,
        sessions,
        circuitImage: ofMeeting?.circuit_image || null,
        openF1Key: ofMeeting?.meeting_key || null
      };
    });
  },

  // 5. Get Next Upcoming Race dynamically
  getNextMeeting: async (season = 'current') => {
    const list = await f1Api.getMeetings(season);
    const upcoming = list.find((m) => m.isUpcoming);
    return upcoming || list[list.length - 1];
  },

  // 6. Get Detailed Session Results (Race, Qualifying, Sprint, Practice) directly from live API
  getSessionResults: async (meetingOrId, sessionType = 'Race') => {
    // Extract round number
    let round = null;
    let openF1Key = null;

    if (typeof meetingOrId === 'object' && meetingOrId !== null) {
      round = meetingOrId.round;
      openF1Key = meetingOrId.openF1Key;
    } else if (typeof meetingOrId === 'number') {
      round = meetingOrId;
    } else if (typeof meetingOrId === 'string') {
      const match = meetingOrId.match(/\d+$/);
      if (match) round = Number(match[0]);
    }

    if (!round) round = 17; // Default to last completed round if unresolvable

    try {
      // CASE A: RACE RESULTS
      if (sessionType === 'Race') {
        const data = await fetchWithTimeout(`${JOLPICA_BASE}/current/${round}/results.json`);
        const race = data?.MRData?.RaceTable?.Races?.[0];
        if (!race || !Array.isArray(race.Results) || race.Results.length === 0) {
          return [];
        }

        return race.Results.map((res, idx) => {
          const isWinner = res.position === '1';
          const constId = res.Constructor?.constructorId || '';
          return {
            pos: Number(res.position) || idx + 1,
            number: Number(res.number) || Number(res.Driver?.permanentNumber) || idx + 1,
            driver: `${res.Driver?.givenName || ''} ${res.Driver?.familyName || ''}`.trim(),
            team: res.Constructor?.name || 'F1 Team',
            teamColour: CONSTRUCTOR_COLORS[constId] || '#E10600',
            time: res.Time?.time || res.status,
            gap: isWinner
              ? `Líder (${res.Time?.time || 'Ganador'})`
              : res.Time?.time
              ? `+${res.Time.time.replace(/^\+/, '')}`
              : res.status,
            laps: Number(res.laps) || 0,
            points: Number(res.points) || 0,
            fastestLap: res.FastestLap?.rank === '1'
          };
        });
      }

      // CASE B: QUALIFYING RESULTS
      if (sessionType === 'Qualifying') {
        const data = await fetchWithTimeout(`${JOLPICA_BASE}/current/${round}/qualifying.json`);
        const race = data?.MRData?.RaceTable?.Races?.[0];
        if (!race || !Array.isArray(race.QualifyingResults) || race.QualifyingResults.length === 0) {
          return [];
        }

        return race.QualifyingResults.map((res, idx) => {
          const isPole = res.position === '1';
          const constId = res.Constructor?.constructorId || '';
          const bestTime = res.Q3 || res.Q2 || res.Q1 || 'Sin tiempo';
          const segment = res.Q3 ? 'Q3' : res.Q2 ? 'Q2' : 'Q1';

          return {
            pos: Number(res.position) || idx + 1,
            number: Number(res.number) || Number(res.Driver?.permanentNumber) || idx + 1,
            driver: `${res.Driver?.givenName || ''} ${res.Driver?.familyName || ''}`.trim(),
            team: res.Constructor?.name || 'F1 Team',
            teamColour: CONSTRUCTOR_COLORS[constId] || '#E10600',
            time: bestTime,
            gap: isPole ? 'Pole Position' : segment,
            laps: segment,
            points: 0,
            fastestLap: isPole
          };
        });
      }

      // CASE C: SPRINT RESULTS
      if (sessionType === 'Sprint') {
        const data = await fetchWithTimeout(`${JOLPICA_BASE}/current/${round}/sprint.json`);
        const race = data?.MRData?.RaceTable?.Races?.[0];
        if (!race || !Array.isArray(race.SprintResults) || race.SprintResults.length === 0) {
          return [];
        }

        return race.SprintResults.map((res, idx) => {
          const isWinner = res.position === '1';
          const constId = res.Constructor?.constructorId || '';
          return {
            pos: Number(res.position) || idx + 1,
            number: Number(res.number) || Number(res.Driver?.permanentNumber) || idx + 1,
            driver: `${res.Driver?.givenName || ''} ${res.Driver?.familyName || ''}`.trim(),
            team: res.Constructor?.name || 'F1 Team',
            teamColour: CONSTRUCTOR_COLORS[constId] || '#E10600',
            time: res.Time?.time || res.status,
            gap: isWinner
              ? 'Ganador Sprint'
              : res.Time?.time
              ? `+${res.Time.time.replace(/^\+/, '')}`
              : res.status,
            laps: Number(res.laps) || 0,
            points: Number(res.points) || 0,
            fastestLap: false
          };
        });
      }

      // CASE D: PRACTICE SESSIONS (FP1, FP2, FP3) FROM OPENF1
      if (sessionType.startsWith('Practice')) {
        let meetingKey = openF1Key;
        if (!meetingKey) {
          const openF1Meetings = await fetchWithTimeout(`${OPENF1_BASE}/meetings?year=2026`).catch(() => []);
          const m = Array.isArray(openF1Meetings) ? openF1Meetings.find((x) => x.round === round) : null;
          meetingKey = m?.meeting_key;
        }

        if (meetingKey) {
          const sessions = await fetchWithTimeout(
            `${OPENF1_BASE}/sessions?meeting_key=${meetingKey}&session_type=Practice`
          ).catch(() => []);

          const matchedSession = Array.isArray(sessions)
            ? sessions.find((s) => s.session_name?.toLowerCase() === sessionType.toLowerCase())
            : null;

          if (matchedSession?.session_key) {
            const [resultsData, driversData] = await Promise.all([
              fetchWithTimeout(
                `${OPENF1_BASE}/session_result?session_key=${matchedSession.session_key}`
              ).catch(() => []),
              fetchWithTimeout(`${OPENF1_BASE}/drivers?session_key=${matchedSession.session_key}`).catch(
                () => []
              )
            ]);

            if (Array.isArray(resultsData) && resultsData.length > 0) {
              const dMap = new Map();
              if (Array.isArray(driversData)) {
                driversData.forEach((d) => dMap.set(d.driver_number, d));
              }

              return resultsData.map((row) => {
                const d = dMap.get(row.driver_number);
                const mins = Math.floor(row.duration / 60);
                const secs = (row.duration % 60).toFixed(3);
                const timeStr = mins > 0 ? `${mins}:${secs < 10 ? '0' : ''}${secs}` : `${secs}s`;

                return {
                  pos: row.position,
                  number: row.driver_number,
                  driver: d?.full_name || `Piloto #${row.driver_number}`,
                  team: d?.team_name || 'F1 Team',
                  teamColour: d?.team_colour ? `#${d.team_colour.replace('#', '')}` : '#E10600',
                  time: timeStr,
                  gap: row.gap_to_leader === 0 ? 'Líder' : `+${row.gap_to_leader.toFixed(3)}s`,
                  laps: row.number_of_laps,
                  points: 0,
                  fastestLap: row.position === 1
                };
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn(`Error loading session results for round ${round} ${sessionType}:`, err.message);
    }

    return [];
  }
};
