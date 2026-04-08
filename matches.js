/* matches.js - La Liga season browser */

function getCurrentSeason() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month < 7 ? `${year - 1}-${year}` : `${year}-${year + 1}`;
}

function prepareAllMatchesView() {
    const yearInput = $('#am-year-input');
    const seasonSelect = $('#am-season-select');

    if (!yearInput || !seasonSelect) return;

    if (!yearInput.value) {
        yearInput.value = String(new Date().getFullYear());
    }

    populateAllMatchesSeasons(
        parseInt(yearInput.value, 10),
        seasonSelect,
        getCurrentSeason()
    );
}

function bindAllMatchesEvents() {
    if (state.matchesEventsBound) return;
    state.matchesEventsBound = true;

    const yearInput = $('#am-year-input');
    const seasonSelect = $('#am-season-select');
    const fetchBtn = $('#am-fetch-btn');
    const statusFilter = $('#am-status-filter');
    const teamSearch = $('#am-team-search');
    const roundFilter = $('#am-round-filter');

    if (fetchBtn) {
        fetchBtn.addEventListener('click', fetchAllMatchesData);
    }

    if (yearInput) {
        yearInput.addEventListener('input', () => {
            const year = parseInt(yearInput.value, 10);
            if (year && year >= 1900 && year <= 2030) {
                populateAllMatchesSeasons(year, seasonSelect);
            } else if (seasonSelect) {
                seasonSelect.innerHTML = '<option value="">— Pick a year first —</option>';
            }
        });
    }

    if (statusFilter) statusFilter.addEventListener('change', filterAllMatches);
    if (roundFilter) roundFilter.addEventListener('change', filterAllMatches);

    if (teamSearch) {
        let timeoutId;
        teamSearch.addEventListener('input', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(filterAllMatches, 250);
        });
    }
}

function populateAllMatchesSeasons(year, selectEl, preferredSeason = getCurrentSeason()) {
    const select = selectEl || $('#am-season-select');
    if (!select || !year) return;

    const options = [
        `${year - 1}-${year}`,
        `${year}-${year + 1}`,
        `${year}`,
    ];

    const selectedSeason = options.includes(preferredSeason)
        ? preferredSeason
        : `${year}-${year + 1}`;

    select.innerHTML = `
        <option value="${options[0]}" ${selectedSeason === options[0] ? 'selected' : ''}>${options[0]}</option>
        <option value="${options[1]}" ${selectedSeason === options[1] ? 'selected' : ''}>${options[1]}</option>
        <option value="${options[2]}" ${selectedSeason === options[2] ? 'selected' : ''}>${options[2]} (calendar year)</option>
    `;
}

async function fetchAllMatchesData() {
    const seasonSelect = $('#am-season-select');
    const loadingEl = $('#am-loading');
    const listEl = $('#am-matches-list');
    const initialEl = $('#am-initial-state');
    const resultsInfo = $('#am-results-info');
    const roundFilter = $('#am-round-filter');
    const statusFilter = $('#am-status-filter');
    const teamSearch = $('#am-team-search');

    const season = seasonSelect ? seasonSelect.value : '';

    if (!season) {
        showAllMatchesError('Pick a year and season first, then try again.');
        return;
    }

    if (roundFilter) {
        roundFilter.innerHTML = '<option value="all">All rounds</option>';
    }

    if (initialEl) initialEl.style.display = 'none';
    if (loadingEl) loadingEl.style.display = '';
    if (listEl) listEl.innerHTML = '';
    if (resultsInfo) resultsInfo.style.display = 'none';

    try {
        const events = await fetchLeagueMatches(LA_LIGA_ID, season);
        state.allMatchesData = events;

        if (loadingEl) loadingEl.style.display = 'none';

        if (roundFilter && events.length > 0) {
            const rounds = [...new Set(events.map((event) => event.intRound).filter(Boolean))]
                .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

            roundFilter.innerHTML = '<option value="all">All rounds</option>' +
                rounds.map((round) => `<option value="${round}">Round ${round}</option>`).join('');
        }

        if (statusFilter) statusFilter.value = 'all';
        if (teamSearch) teamSearch.value = '';
        if (roundFilter) roundFilter.value = 'all';

        renderAllMatchesList(events, LA_LIGA_NAME, season);
    } catch (err) {
        console.error('Failed to fetch La Liga matches:', err);
        if (loadingEl) loadingEl.style.display = 'none';
        showAllMatchesError('Something went wrong loading the matches. Maybe try again in a moment?');
    }
}

function filterAllMatches() {
    const events = state.allMatchesData || [];
    const statusVal = ($('#am-status-filter') || {}).value || 'all';
    const teamVal = (($('#am-team-search') || {}).value || '').toLowerCase().trim();
    const roundVal = (($('#am-round-filter') || {}).value || 'all');

    let filtered = events;

    if (statusVal === 'finished') {
        filtered = filtered.filter((event) => event.strStatus === 'Match Finished');
    } else if (statusVal === 'upcoming') {
        filtered = filtered.filter((event) => event.strStatus !== 'Match Finished');
    }

    if (teamVal) {
        filtered = filtered.filter((event) =>
            (event.strHomeTeam || '').toLowerCase().includes(teamVal) ||
            (event.strAwayTeam || '').toLowerCase().includes(teamVal) ||
            (event.strEvent || '').toLowerCase().includes(teamVal)
        );
    }

    if (roundVal !== 'all') {
        filtered = filtered.filter((event) => String(event.intRound) === roundVal);
    }

    renderAllMatchesList(filtered, LA_LIGA_NAME, '', true);
}

function renderAllMatchesList(events, leagueName, season, isFilter = false) {
    const listEl = $('#am-matches-list');
    const resultsInfo = $('#am-results-info');
    const countEl = $('#am-results-count');

    if (!listEl) return;

    if (resultsInfo) resultsInfo.style.display = '';
    if (countEl) countEl.textContent = events.length;

    if (events.length === 0) {
        listEl.innerHTML = `
            <div class="am-empty-state">
                <span class="am-empty-icon">⚽</span>
                <p>${isFilter ? 'No matches match those filters. Try adjusting your search.' : `No matches found for ${leagueName}${season ? ` (${season})` : ''}. Try a different season.`}</p>
            </div>
        `;
        return;
    }

    const groupedByDate = {};
    events.forEach((event) => {
        const key = event.dateEvent || 'Unknown Date';
        if (!groupedByDate[key]) groupedByDate[key] = [];
        groupedByDate[key].push(event);
    });

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => a.localeCompare(b));

    listEl.innerHTML = sortedDates.map((date) => `
        <div class="am-date-group">
            <div class="am-date-header">${formatMatchDate(date)}</div>
            ${groupedByDate[date].map((event) => renderMatchCard(event)).join('')}
        </div>
    `).join('');
}

function renderMatchCard(event) {
    const date = event.dateEvent || '';
    const time = event.strTime ? event.strTime.substring(0, 5) : '';
    const round = event.intRound ? `Round ${event.intRound}` : '';
    const venue = event.strVenue || '';
    const status = event.strStatus || '';
    const homeScore = event.intHomeScore;
    const awayScore = event.intAwayScore;
    const hasScore = homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined;
    const videoLink = event.strVideo || '';

    const statusClass = status === 'Match Finished'
        ? 'status-finished'
        : status === 'Not Started'
            ? 'status-upcoming'
            : 'status-live';

    return `
        <div class="match-card" id="match-${event.idEvent}">
            <div class="match-card-header">
                <span class="match-date">${formatMatchDate(date)}${time ? ` · ${time}` : ''}</span>
                <div class="match-header-right">
                    ${videoLink ? `<a href="${videoLink}" target="_blank" rel="noopener noreferrer" class="match-video-link" title="Watch highlights">▶️</a>` : ''}
                    ${round ? `<span class="match-round">${round}</span>` : ''}
                </div>
            </div>
            <div class="match-card-body">
                <div class="match-team home">
                    ${event.strHomeTeamBadge ? `<img src="${event.strHomeTeamBadge}" alt="${event.strHomeTeam}" class="match-team-badge">` : ''}
                    <span class="match-team-name">${event.strHomeTeam || 'Home'}</span>
                </div>
                <div class="match-score-box">
                    ${hasScore ? `<span class="match-score">${homeScore} – ${awayScore}</span>` : '<span class="match-vs">vs</span>'}
                    <span class="match-status ${statusClass}">${status}</span>
                </div>
                <div class="match-team away">
                    ${event.strAwayTeamBadge ? `<img src="${event.strAwayTeamBadge}" alt="${event.strAwayTeam}" class="match-team-badge">` : ''}
                    <span class="match-team-name">${event.strAwayTeam || 'Away'}</span>
                </div>
            </div>
            ${venue ? `<div class="match-card-footer">🏟️ ${venue}</div>` : ''}
        </div>
    `;
}

function formatMatchDate(dateStr) {
    if (!dateStr) return '';

    try {
        const date = new Date(`${dateStr}T00:00:00`);
        return date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function showAllMatchesError(message) {
    const listEl = $('#am-matches-list');
    const initialEl = $('#am-initial-state');
    const resultsInfo = $('#am-results-info');

    if (initialEl) initialEl.style.display = 'none';
    if (resultsInfo) resultsInfo.style.display = 'none';

    if (listEl) {
        listEl.innerHTML = `
            <div class="am-empty-state">
                <span class="am-empty-icon">😕</span>
                <p>${message}</p>
            </div>
        `;
    }
}
