const OPENF1_BASE = 'https://api.openf1.org/v1';
const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1';
const CACHE_TTL = 1000 * 60 * 5;

const memoryCache = new Map();

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
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    memoryCache.set(url, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function matchOpenF1Driver(openF1Drivers, permNumber, code, familyName) {
  if (!Array.isArray(openF1Drivers)) return null;
  return (
    openF1Drivers.find((d) => d.driver_number === permNumber) ||
    openF1Drivers.find(
      (d) =>
        (code && d.name_acronym === code) ||
        (familyName && d.last_name?.toLowerCase() === familyName.toLowerCase())
    ) ||
    null
  );
}

function matchOpenF1TeamColor(openF1Drivers, constructorName, constructorId) {
  if (!Array.isArray(openF1Drivers)) return null;
  const normName = (constructorName || '').toLowerCase();
  const normId = (constructorId || '').toLowerCase().replace(/_/g, ' ');
  const found = openF1Drivers.find((d) => {
    const tName = (d.team_name || '').toLowerCase();
    return (
      tName &&
      (tName === normName ||
        normName.includes(tName) ||
        tName.includes(normName) ||
        (normId && tName.includes(normId)))
    );
  });
  return found?.team_colour ? `#${found.team_colour.replace('#', '')}` : null;
}

export const f1Api = {
  clearCache: () => {
    memoryCache.clear();
  },

  getSeasons: async () => {
    const data = await fetchWithTimeout(`${JOLPICA_BASE}/seasons.json?limit=100`).catch(() => null);
    const list = data?.MRData?.SeasonTable?.Seasons || [];
    return list
      .map((s) => s.season)
      .filter(Boolean)
      .reverse()
      .slice(0, 5);
  },

  getDriverStandings: async (season = 'current') => {
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
    const apiSeason =
      standingsData?.MRData?.StandingsTable?.season || '';

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

    const polesMap = {};
    const poleRaces = poleData?.MRData?.RaceTable?.Races || [];
    poleRaces.forEach((r) => {
      const dId = r.QualifyingResults?.[0]?.Driver?.driverId;
      if (dId) {
        polesMap[dId] = (polesMap[dId] || 0) + 1;
      }
    });

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
      const teamName = item.Constructors?.[0]?.name || '';

      const ofDriver = matchOpenF1Driver(
        openF1Drivers,
        permNumber,
        code,
        item.Driver?.familyName
      );

      const teamColour = ofDriver?.team_colour
        ? `#${ofDriver.team_colour.replace('#', '')}`
        : matchOpenF1TeamColor(openF1Drivers, teamName, constId);

      const winsCount = Number(item.wins) || 0;
      const podiumsCount = podiumsMap[driverId] ?? winsCount;
      const bestPos = bestFinishMap[driverId] || null;
      const qualyPos = bestQualyMap[driverId] || null;

      return {
        season: apiSeason,
        position: Number(item.position) || idx + 1,
        points: Number(item.points) || 0,
        wins: winsCount,
        podiums: podiumsCount,
        poles: polesMap[driverId] || 0,
        id: driverId,
        driverNumber: permNumber || ofDriver?.driver_number || '',
        code: code || ofDriver?.name_acronym || '',
        fullName: `${item.Driver?.givenName || ''} ${item.Driver?.familyName || ''}`.trim() || ofDriver?.full_name || '',
        firstName: item.Driver?.givenName || ofDriver?.first_name || '',
        lastName: item.Driver?.familyName || ofDriver?.last_name || '',
        teamName: teamName || ofDriver?.team_name || '',
        teamId: constId,
        teamColour,
        nationality: item.Driver?.nationality || '',
        countryCode: ofDriver?.country_code || '',
        birthDate: item.Driver?.dateOfBirth || '',
        url: item.Driver?.url || '',
        headshotUrl: ofDriver?.headshot_url || null,
        bestFinish: bestPos ? `P${bestPos}` : '--',
        bestQualy: qualyPos ? `P${qualyPos}` : '--'
      };
    });
  },

  getConstructorStandings: async (season = 'current') => {
    const [cStandingsData, dStandingsData, openF1Drivers] = await Promise.all([
      fetchWithTimeout(`${JOLPICA_BASE}/${season}/constructorStandings.json`),
      fetchWithTimeout(`${JOLPICA_BASE}/${season}/driverStandings.json`).catch(() => null),
      fetchWithTimeout(`${OPENF1_BASE}/drivers?meeting_key=latest`).catch(() => [])
    ]);

    const constructorList =
      cStandingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];

    const driversByConstructor = {};
    const colorByConstructor = {};
    const dList =
      dStandingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

    dList.forEach((d) => {
      const cId = d.Constructors?.[0]?.constructorId;
      const driverName = `${d.Driver?.givenName || ''} ${d.Driver?.familyName || ''}`.trim();
      if (cId) {
        if (!driversByConstructor[cId]) driversByConstructor[cId] = [];
        driversByConstructor[cId].push(driverName);

        if (!colorByConstructor[cId]) {
          const ofDriver = matchOpenF1Driver(
            openF1Drivers,
            Number(d.Driver?.permanentNumber),
            d.Driver?.code,
            d.Driver?.familyName
          );
          if (ofDriver?.team_colour) {
            colorByConstructor[cId] = `#${ofDriver.team_colour.replace('#', '')}`;
          }
        }
      }
    });

    return constructorList.map((item, idx) => {
      const constId = item.Constructor?.constructorId || '';
      const name = item.Constructor?.name || '';
      const colour =
        colorByConstructor[constId] ||
        matchOpenF1TeamColor(openF1Drivers, name, constId);

      return {
        position: Number(item.position) || idx + 1,
        points: Number(item.points) || 0,
        wins: Number(item.wins) || 0,
        teamId: constId,
        name,
        nationality: item.Constructor?.nationality || '',
        colour,
        drivers: driversByConstructor[constId] || []
      };
    });
  },

  getMeetings: async (season = 'current') => {
    const calendarData = await fetchWithTimeout(`${JOLPICA_BASE}/${season}.json`);
    const races = calendarData?.MRData?.RaceTable?.Races || [];
    const apiYear = calendarData?.MRData?.RaceTable?.season;

    const openF1Meetings = apiYear
      ? await fetchWithTimeout(`${OPENF1_BASE}/meetings?year=${apiYear}`).catch(() => [])
      : [];

    const now = new Date();
    const ofMeetingsList = Array.isArray(openF1Meetings) ? openF1Meetings : [];

    return races.map((r) => {
      const roundNum = Number(r.round);
      const raceIso = r.time ? `${r.date}T${r.time}` : `${r.date}T00:00:00Z`;
      const raceDateObj = new Date(raceIso);
      const isUpcoming = raceDateObj > now;

      const ofMeeting = ofMeetingsList.find((m) => {
        const mName = (m.meeting_name || '').toLowerCase();
        const rName = (r.raceName || '').toLowerCase().replace(' grand prix', '');
        const mLoc = (m.location || '').toLowerCase();
        const rLoc = (r.Circuit?.Location?.locality || '').toLowerCase();
        return (rName && mName.includes(rName)) || (rLoc && mLoc === rLoc);
      });

      const sessions = [];
      if (r.FirstPractice) {
        const start = `${r.FirstPractice.date}T${r.FirstPractice.time || '00:00:00Z'}`;
        sessions.push({ name: 'Práctica 1', type: 'practice', start });
      }
      if (r.SecondPractice) {
        const start = `${r.SecondPractice.date}T${r.SecondPractice.time || '00:00:00Z'}`;
        sessions.push({ name: 'Práctica 2', type: 'practice', start });
      }
      if (r.ThirdPractice) {
        const start = `${r.ThirdPractice.date}T${r.ThirdPractice.time || '00:00:00Z'}`;
        sessions.push({ name: 'Práctica 3', type: 'practice', start });
      }
      if (r.SprintQualifying) {
        const start = `${r.SprintQualifying.date}T${r.SprintQualifying.time || '00:00:00Z'}`;
        sessions.push({ name: 'Sprint Qualifying', type: 'qualifying', start });
      }
      if (r.Sprint) {
        const start = `${r.Sprint.date}T${r.Sprint.time || '00:00:00Z'}`;
        sessions.push({ name: 'Sprint', type: 'sprint', start });
      }
      if (r.Qualifying) {
        const start = `${r.Qualifying.date}T${r.Qualifying.time || '00:00:00Z'}`;
        sessions.push({ name: 'Clasificación', type: 'qualifying', start });
      }
      sessions.push({ name: 'Carrera', type: 'race', start: raceIso });

      return {
        id: `${r.Circuit?.circuitId || 'gp'}-${roundNum}`,
        season: r.season || apiYear || '',
        round: roundNum,
        totalRounds: races.length,
        name: r.raceName || '',
        officialName: ofMeeting?.meeting_official_name || r.raceName || '',
        circuit: r.Circuit?.circuitName || '',
        circuitType: ofMeeting?.circuit_type || '',
        city: r.Circuit?.Location?.locality || ofMeeting?.location || '',
        countryName: r.Circuit?.Location?.country || ofMeeting?.country_name || '',
        countryFlagUrl: ofMeeting?.country_flag || null,
        circuitImage: ofMeeting?.circuit_image || null,
        raceDate: raceIso,
        startDate: sessions[0]?.start || raceIso,
        isUpcoming,
        sessions,
        openF1Key: ofMeeting?.meeting_key || null
      };
    });
  },

  getNextMeeting: async (season = 'current') => {
    const list = await f1Api.getMeetings(season);
    const upcoming = list.find((m) => m.isUpcoming);
    return upcoming || list[list.length - 1] || null;
  },

  getMeetingWeather: async (openF1Key) => {
    if (!openF1Key) return null;
    try {
      const data = await fetchWithTimeout(`${OPENF1_BASE}/weather?meeting_key=${openF1Key}`);
      if (Array.isArray(data) && data.length > 0) {
        const latest = data[data.length - 1];
        return {
          airTemp: latest.air_temperature,
          trackTemp: latest.track_temperature,
          humidity: latest.humidity,
          rainfall: latest.rainfall
        };
      }
    } catch {
      return null;
    }
    return null;
  },

  getSessionResults: async (meetingOrId, sessionType = 'Race') => {
    let round = null;
    let openF1Key = null;
    let season = 'current';

    if (typeof meetingOrId === 'object' && meetingOrId !== null) {
      round = meetingOrId.round;
      openF1Key = meetingOrId.openF1Key;
      if (meetingOrId.season) season = meetingOrId.season;
    } else if (typeof meetingOrId === 'number') {
      round = meetingOrId;
    } else if (typeof meetingOrId === 'string') {
      const match = meetingOrId.match(/\d+$/);
      if (match) round = Number(match[0]);
    }

    if (!round) return [];

    try {
      const openF1Drivers = await fetchWithTimeout(`${OPENF1_BASE}/drivers?meeting_key=latest`).catch(() => []);

      if (sessionType === 'Race') {
        const data = await fetchWithTimeout(`${JOLPICA_BASE}/${season}/${round}/results.json`);
        const race = data?.MRData?.RaceTable?.Races?.[0];
        if (!race || !Array.isArray(race.Results) || race.Results.length === 0) {
          return [];
        }

        return race.Results.map((res, idx) => {
          const isWinner = res.position === '1';
          const constId = res.Constructor?.constructorId || '';
          const constName = res.Constructor?.name || '';
          const permNum = Number(res.number) || Number(res.Driver?.permanentNumber);
          const ofDriver = matchOpenF1Driver(openF1Drivers, permNum, res.Driver?.code, res.Driver?.familyName);
          const teamColour = ofDriver?.team_colour
            ? `#${ofDriver.team_colour.replace('#', '')}`
            : matchOpenF1TeamColor(openF1Drivers, constName, constId);

          const fullName = `${res.Driver?.givenName || ''} ${res.Driver?.familyName || ''}`.trim();
          const lastName = res.Driver?.familyName || fullName;

          return {
            pos: Number(res.position) || idx + 1,
            number: permNum || '',
            driver: fullName,
            lastName,
            headshotUrl: ofDriver?.headshot_url || null,
            team: constName,
            teamColour,
            time: res.Time?.time || res.status || '',
            gap: isWinner
              ? res.Time?.time || res.status || ''
              : res.Time?.time
              ? `+${res.Time.time.replace(/^\+/, '')}`
              : res.status || '',
            fastestLapTime: res.FastestLap?.Time?.time || null,
            laps: Number(res.laps) || 0,
            points: Number(res.points) || 0,
            fastestLap: res.FastestLap?.rank === '1'
          };
        });
      }

      if (sessionType === 'Qualifying') {
        const data = await fetchWithTimeout(`${JOLPICA_BASE}/${season}/${round}/qualifying.json`);
        const race = data?.MRData?.RaceTable?.Races?.[0];
        if (!race || !Array.isArray(race.QualifyingResults) || race.QualifyingResults.length === 0) {
          return [];
        }

        return race.QualifyingResults.map((res, idx) => {
          const constId = res.Constructor?.constructorId || '';
          const constName = res.Constructor?.name || '';
          const permNum = Number(res.number) || Number(res.Driver?.permanentNumber);
          const ofDriver = matchOpenF1Driver(openF1Drivers, permNum, res.Driver?.code, res.Driver?.familyName);
          const teamColour = ofDriver?.team_colour
            ? `#${ofDriver.team_colour.replace('#', '')}`
            : matchOpenF1TeamColor(openF1Drivers, constName, constId);

          const bestTime = res.Q3 || res.Q2 || res.Q1 || '--';
          const segment = res.Q3 ? 'Q3' : res.Q2 ? 'Q2' : 'Q1';
          const fullName = `${res.Driver?.givenName || ''} ${res.Driver?.familyName || ''}`.trim();
          const lastName = res.Driver?.familyName || fullName;

          return {
            pos: Number(res.position) || idx + 1,
            number: permNum || '',
            driver: fullName,
            lastName,
            headshotUrl: ofDriver?.headshot_url || null,
            team: constName,
            teamColour,
            time: bestTime,
            gap: bestTime,
            laps: segment,
            points: 0,
            fastestLap: res.position === '1'
          };
        });
      }

      if (sessionType === 'Sprint') {
        const data = await fetchWithTimeout(`${JOLPICA_BASE}/${season}/${round}/sprint.json`);
        const race = data?.MRData?.RaceTable?.Races?.[0];
        if (!race || !Array.isArray(race.SprintResults) || race.SprintResults.length === 0) {
          return [];
        }

        return race.SprintResults.map((res, idx) => {
          const isWinner = res.position === '1';
          const constId = res.Constructor?.constructorId || '';
          const constName = res.Constructor?.name || '';
          const permNum = Number(res.number) || Number(res.Driver?.permanentNumber);
          const ofDriver = matchOpenF1Driver(openF1Drivers, permNum, res.Driver?.code, res.Driver?.familyName);
          const teamColour = ofDriver?.team_colour
            ? `#${ofDriver.team_colour.replace('#', '')}`
            : matchOpenF1TeamColor(openF1Drivers, constName, constId);

          const fullName = `${res.Driver?.givenName || ''} ${res.Driver?.familyName || ''}`.trim();
          const lastName = res.Driver?.familyName || fullName;

          return {
            pos: Number(res.position) || idx + 1,
            number: permNum || '',
            driver: fullName,
            lastName,
            headshotUrl: ofDriver?.headshot_url || null,
            team: constName,
            teamColour,
            time: res.Time?.time || res.status || '',
            gap: isWinner
              ? res.Time?.time || res.status || ''
              : res.Time?.time
              ? `+${res.Time.time.replace(/^\+/, '')}`
              : res.status || '',
            laps: Number(res.laps) || 0,
            points: Number(res.points) || 0,
            fastestLap: false
          };
        });
      }

      if (sessionType.startsWith('Practice') && openF1Key) {
        const sessions = await fetchWithTimeout(
          `${OPENF1_BASE}/sessions?meeting_key=${openF1Key}&session_type=Practice`
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
              const mins = Math.floor((row.duration || 0) / 60);
              const secs = ((row.duration || 0) % 60).toFixed(3);
              const timeStr = row.duration
                ? mins > 0
                  ? `${mins}:${secs < 10 ? '0' : ''}${secs}`
                  : `${secs}s`
                : '--';

              return {
                pos: row.position,
                number: row.driver_number,
                driver: d?.full_name || `#${row.driver_number}`,
                lastName: d?.last_name || d?.full_name || `#${row.driver_number}`,
                headshotUrl: d?.headshot_url || null,
                team: d?.team_name || '',
                teamColour: d?.team_colour ? `#${d.team_colour.replace('#', '')}` : null,
                time: timeStr,
                gap:
                  row.gap_to_leader === 0
                    ? timeStr
                    : row.gap_to_leader != null
                    ? `+${Number(row.gap_to_leader).toFixed(3)}`
                    : timeStr,
                laps: row.number_of_laps || 0,
                points: 0,
                fastestLap: row.position === 1
              };
            });
          }
        }
      }
    } catch (err) {
      console.warn(`Error loading session results for round ${round} ${sessionType}:`, err.message);
    }

    return [];
  }
};
