/* teams.js - La Liga team grids and team detail view */

function renderTeamGrid(teams, container, emptyMessage = 'No clubs to show right now.') {
    if (!container) return;

    if (!teams || teams.length === 0) {
        container.innerHTML = `
            <p style="color:#999;grid-column:1/-1;text-align:center;padding:40px 0;">
                ${emptyMessage}
            </p>
        `;
        return;
    }

    container.innerHTML = teams.map((team) => `
        <div class="team-card" data-team-id="${team.idTeam}" id="team-card-${team.idTeam}">
            <div class="team-card-badge">
                ${team.strBadge
                    ? `<img src="${team.strBadge}" alt="${team.strTeam}" loading="lazy">`
                    : '<span style="font-size:24px">⚽</span>'
                }
            </div>
            <div class="team-card-name">${team.strTeam}</div>
            <div class="team-card-stadium">🏟️ ${team.strStadium || 'Stadium unknown'}</div>
            <div class="team-card-year">Est. ${team.intFormedYear || '—'}</div>
        </div>
    `).join('');

    container.querySelectorAll('.team-card').forEach((card) => {
        card.addEventListener('click', () => {
            const team = teams.find((item) => item.idTeam === card.dataset.teamId);
            if (team) showTeamDetail(team);
        });
    });
}

function getFilteredTeams() {
    const search = (DOM.teamSearchInput.value || '').toLowerCase().trim();
    const sortVal = DOM.teamSortSelect.value;

    const filtered = state.allTeams.filter((team) => {
        if (!search) return true;

        const haystack = [
            team.strTeam,
            team.strAlternate,
            team.strTeamAlternate,
            team.strLocation,
            team.strStadium,
            team.strKeywords,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return haystack.includes(search);
    });

    filtered.sort((a, b) => {
        const yearA = parseInt(a.intFormedYear, 10) || 0;
        const yearB = parseInt(b.intFormedYear, 10) || 0;

        switch (sortVal) {
            case 'name-asc':
                return (a.strTeam || '').localeCompare(b.strTeam || '');
            case 'name-desc':
                return (b.strTeam || '').localeCompare(a.strTeam || '');
            case 'year-asc':
                return (yearA || 9999) - (yearB || 9999);
            case 'year-desc':
                return yearB - yearA;
            default:
                return 0;
        }
    });

    return filtered;
}

function renderAllTeams() {
    if (!DOM.allTeamsGrid) return;

    const teams = getFilteredTeams();
    DOM.teamResultsCount.textContent = teams.length;

    renderTeamGrid(
        teams,
        DOM.allTeamsGrid,
        'Hmm, nothing matches your search. Try a different name or keyword.'
    );
}

function showTeamDetail(team) {
    switchView('team-detail');

    const fanarts = [
        team.strFanart1,
        team.strFanart2,
        team.strFanart3,
        team.strFanart4,
    ].filter(Boolean);

    const colors = [
        { color: team.strColour1, label: 'Primary' },
        { color: team.strColour2, label: 'Secondary' },
        { color: team.strColour3, label: 'Tertiary' },
    ].filter((entry) => entry.color);

    DOM.teamDetailContainer.innerHTML = `
        <div class="team-hero">
            ${team.strFanart1 ? `<div class="team-hero-fanart"><img src="${team.strFanart1}" alt="" loading="lazy"></div>` : ''}
            <div class="team-hero-badge">
                ${team.strBadge ? `<img src="${team.strBadge}" alt="${team.strTeam}" loading="lazy">` : '<span style="font-size:36px">⚽</span>'}
            </div>
            <div class="team-hero-info">
                <h1>${team.strTeam}</h1>
                ${team.strTeamAlternate ? `<p class="team-alt-name">${team.strTeamAlternate}</p>` : ''}
                <div class="team-info-grid">
                    ${team.strLeague ? `<div class="team-info-item"><div class="info-icon">🏆</div><div class="info-content"><div class="info-label">League</div><div class="info-value">${team.strLeague}</div></div></div>` : ''}
                    ${team.strStadium ? `<div class="team-info-item"><div class="info-icon">🏟️</div><div class="info-content"><div class="info-label">Stadium</div><div class="info-value">${team.strStadium}</div></div></div>` : ''}
                    ${team.intStadiumCapacity ? `<div class="team-info-item"><div class="info-icon">👥</div><div class="info-content"><div class="info-label">Capacity</div><div class="info-value">${parseInt(team.intStadiumCapacity, 10).toLocaleString()}</div></div></div>` : ''}
                    ${team.intFormedYear ? `<div class="team-info-item"><div class="info-icon">📅</div><div class="info-content"><div class="info-label">Founded</div><div class="info-value">${team.intFormedYear}</div></div></div>` : ''}
                    ${team.strLocation ? `<div class="team-info-item"><div class="info-icon">📍</div><div class="info-content"><div class="info-label">Location</div><div class="info-value">${team.strLocation}</div></div></div>` : ''}
                    ${team.strCountry ? `<div class="team-info-item"><div class="info-icon">🌍</div><div class="info-content"><div class="info-label">Country</div><div class="info-value">${team.strCountry}</div></div></div>` : ''}
                    ${team.strGender ? `<div class="team-info-item"><div class="info-icon">⚽</div><div class="info-content"><div class="info-label">Gender</div><div class="info-value">${team.strGender}</div></div></div>` : ''}
                    ${team.strKeywords ? `<div class="team-info-item"><div class="info-icon">🏷️</div><div class="info-content"><div class="info-label">Nicknames</div><div class="info-value">${team.strKeywords}</div></div></div>` : ''}
                </div>
                <div class="team-socials">
                    ${team.strWebsite ? `<a href="${normalizeUrl(team.strWebsite)}" target="_blank" rel="noopener noreferrer" class="social-link">🌐 Website</a>` : ''}
                    ${team.strFacebook ? `<a href="${normalizeUrl(team.strFacebook)}" target="_blank" rel="noopener noreferrer" class="social-link">📘 Facebook</a>` : ''}
                    ${team.strTwitter ? `<a href="${normalizeUrl(team.strTwitter)}" target="_blank" rel="noopener noreferrer" class="social-link">🐦 Twitter</a>` : ''}
                    ${team.strInstagram ? `<a href="${normalizeUrl(team.strInstagram)}" target="_blank" rel="noopener noreferrer" class="social-link">📸 Instagram</a>` : ''}
                    ${team.strYoutube ? `<a href="${normalizeUrl(team.strYoutube)}" target="_blank" rel="noopener noreferrer" class="social-link">▶️ YouTube</a>` : ''}
                </div>
            </div>
        </div>

        <div class="team-kit-section">
            ${team.strEquipment ? `
                <div class="team-kit-card">
                    <h3>Current Kit</h3>
                    <img src="${team.strEquipment}" alt="${team.strTeam} kit" loading="lazy">
                </div>
            ` : ''}
            <div class="team-kit-card">
                <h3>Club Colors</h3>
                ${colors.length > 0 ? `
                    <div class="team-colors" style="margin-top:12px;">
                        ${colors.map((entry) => `
                            <div
                                class="color-swatch"
                                style="background:${entry.color};width:42px;height:42px;"
                                data-label="${entry.label}"
                                title="${entry.label}: ${entry.color}">
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color:#999;font-size:13px;margin-top:12px;">No color info available for this club.</p>'}
                ${team.strLogo ? `<img src="${team.strLogo}" alt="${team.strTeam} logo" loading="lazy" style="margin-top:14px;max-height:55px;">` : ''}
            </div>
        </div>

        ${team.strDescriptionEN ? `
            <div class="team-description">
                <h2>About ${team.strTeam}</h2>
                <p>${team.strDescriptionEN}</p>
            </div>
        ` : ''}

        ${fanarts.length > 0 ? `
            <div class="team-gallery">
                <h2>Photos</h2>
                <div class="gallery-grid">
                    ${fanarts.map((img) => `<div class="gallery-item"><img src="${img}" alt="${team.strTeam}" loading="lazy"></div>`).join('')}
                    ${team.strBanner ? `<div class="gallery-item" style="grid-column:1/-1;"><img src="${team.strBanner}" alt="${team.strTeam} banner" loading="lazy"></div>` : ''}
                </div>
            </div>
        ` : ''}
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
