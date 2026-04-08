/* app.js - Main app setup for the La Liga-only experience */

const API_KEY = '3';
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

const LA_LIGA_ID = '4335';
const LA_LIGA_NAME = 'Spanish La Liga';

const state = {
    leagueDetail: null,
    leagueTeams: {},
    leagueMatches: {},
    allTeams: [],
    currentView: 'home',
    currentSeasonMatches: [],
    allMatchesData: [],
    matchesEventsBound: false,
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

let DOM = {};

function normalizeUrl(value) {
    if (!value) return '';
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

document.addEventListener('DOMContentLoaded', () => {
    DOM = {
        loadingOverlay: $('#loading-overlay'),
        homeView: $('#home-view'),
        teamsView: $('#teams-view'),
        teamDetailView: $('#team-detail-view'),
        allMatchesView: $('#all-matches-view'),
        leagueOverviewContainer: $('#league-overview-container'),
        allTeamsGrid: $('#all-teams-grid'),
        teamSearchInput: $('#team-search-input'),
        clearTeamSearch: $('#clear-team-search'),
        teamSortSelect: $('#team-sort-select'),
        teamResultsCount: $('#team-results-count'),
        btnBackTeam: $('#btn-back-team'),
        teamDetailContainer: $('#team-detail-container'),
        logoHome: $('#logo-home'),
        navHome: $('#nav-home'),
        navTeams: $('#nav-teams'),
        navMatches: $('#nav-matches'),
        themeToggle: $('#theme-toggle'),
    };

    loadSavedTheme();
    bindEvents();
    loadLaLiga();
});

async function loadLaLiga() {
    try {
        const [detail, teams] = await Promise.all([
            fetchLaLigaDetail(),
            fetchLeagueTeams(LA_LIGA_NAME),
        ]);

        state.leagueDetail = detail;
        state.allTeams = teams;

        renderHomeOverview();
        DOM.loadingOverlay.classList.add('hidden');
    } catch (err) {
        console.error('Failed to load La Liga data:', err);
        DOM.loadingOverlay.classList.add('hidden');
        DOM.leagueOverviewContainer.innerHTML = `
            <p style="color:#999;text-align:center;padding:60px 0;">
                Something went wrong loading the data. Try refreshing the page.
            </p>
        `;
    }
}

function switchView(view) {
    state.currentView = view;

    DOM.homeView.classList.remove('active');
    DOM.teamsView.classList.remove('active');
    DOM.teamDetailView.classList.remove('active');
    DOM.allMatchesView.classList.remove('active');

    $$('.nav-link').forEach((link) => link.classList.remove('active'));

    switch (view) {
        case 'home':
            DOM.homeView.classList.add('active');
            DOM.navHome.classList.add('active');
            break;
        case 'teams':
            DOM.teamsView.classList.add('active');
            DOM.navTeams.classList.add('active');
            break;
        case 'team-detail':
            DOM.teamDetailView.classList.add('active');
            break;
        case 'all-matches':
            DOM.allMatchesView.classList.add('active');
            DOM.navMatches.classList.add('active');
            break;
    }
}

function bindEvents() {
    let teamSearchTimeout;

    DOM.teamSearchInput.addEventListener('input', () => {
        clearTimeout(teamSearchTimeout);
        DOM.clearTeamSearch.style.display = DOM.teamSearchInput.value ? 'block' : 'none';
        teamSearchTimeout = setTimeout(() => renderAllTeams(), 250);
    });

    DOM.clearTeamSearch.addEventListener('click', () => {
        DOM.teamSearchInput.value = '';
        DOM.clearTeamSearch.style.display = 'none';
        renderAllTeams();
    });

    DOM.teamSortSelect.addEventListener('change', renderAllTeams);

    DOM.logoHome.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('home');
        renderHomeOverview();
    });

    DOM.navHome.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('home');
        renderHomeOverview();
    });

    DOM.navTeams.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('teams');
        renderAllTeams();
    });

    DOM.navMatches.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('all-matches');
        prepareAllMatchesView();
        bindAllMatchesEvents();
    });

    DOM.btnBackTeam.addEventListener('click', () => {
        switchView('teams');
        renderAllTeams();
    });

    DOM.themeToggle.addEventListener('click', toggleTheme);
}
