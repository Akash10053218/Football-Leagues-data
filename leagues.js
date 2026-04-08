/* leagues.js - Home overview rendering for the La Liga-only app */

function renderHomeOverview() {
    if (!DOM.leagueOverviewContainer) return;

    if (!state.leagueDetail) {
        DOM.leagueOverviewContainer.innerHTML = `
            <p style="color:#999;text-align:center;padding:60px 0;">
                Couldn't load the La Liga overview right now. Maybe try refreshing?
            </p>
        `;
        return;
    }

    DOM.leagueOverviewContainer.innerHTML = createLeagueOverviewMarkup(
        state.leagueDetail,
        state.allTeams.length
    );

    const featuredTeams = [...state.allTeams]
        .sort((a, b) => (a.strTeam || '').localeCompare(b.strTeam || ''))
        .slice(0, 6);

    const featuredGrid = $('#featured-teams-grid');
    if (featuredGrid) {
        renderTeamGrid(
            featuredTeams,
            featuredGrid,
            'No clubs to show here yet.'
        );
    }

    const teamsBtn = $('#overview-teams-btn');
    if (teamsBtn) {
        teamsBtn.addEventListener('click', () => {
            switchView('teams');
            renderAllTeams();
        });
    }

    const matchesBtn = $('#overview-matches-btn');
    if (matchesBtn) {
        matchesBtn.addEventListener('click', () => {
            switchView('all-matches');
            prepareAllMatchesView();
            bindAllMatchesEvents();
        });
    }
}
