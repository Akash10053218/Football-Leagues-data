/* api.js - API helpers scoped to Spanish La Liga */

async function fetchLaLigaDetail() {
    if (state.leagueDetail) return state.leagueDetail;

    try {
        const res = await fetch(`${BASE_URL}/lookupleague.php?id=${LA_LIGA_ID}`);
        const data = await res.json();
        const detail = data.leagues && data.leagues[0] ? data.leagues[0] : null;

        if (!detail) {
            throw new Error('La Liga details were not returned by the API.');
        }

        state.leagueDetail = detail;
        return detail;
    } catch (err) {
        console.error('Failed to fetch La Liga details:', err);
        throw err;
    }
}

async function fetchLeagueTeams(leagueName = LA_LIGA_NAME) {
    if (state.leagueTeams[leagueName]) return state.leagueTeams[leagueName];

    try {
        const res = await fetch(`${BASE_URL}/search_all_teams.php?l=${encodeURIComponent(leagueName)}`);
        const data = await res.json();
        const teams = data.teams || [];
        state.leagueTeams[leagueName] = teams;
        return teams;
    } catch (err) {
        console.error('Failed to fetch teams:', err);
        return [];
    }
}

async function fetchLeagueMatches(leagueId = LA_LIGA_ID, season) {
    if (!season) return [];

    const cacheKey = `${leagueId}_${season}`;
    if (state.leagueMatches[cacheKey]) return state.leagueMatches[cacheKey];

    try {
        const res = await fetch(`${BASE_URL}/eventsseason.php?id=${leagueId}&s=${encodeURIComponent(season)}`);
        const data = await res.json();
        const events = data.events || [];
        state.leagueMatches[cacheKey] = events;
        return events;
    } catch (err) {
        console.error('Failed to fetch matches:', err);
        return [];
    }
}
