/* leagueDetail.js - La Liga overview helpers */

function createLeagueLinksMarkup(detail) {
    if (!detail) return '';

    const links = [
        detail.strWebsite ? `<a href="${normalizeUrl(detail.strWebsite)}" target="_blank" rel="noopener noreferrer" class="social-link">🌐 Website</a>` : '',
        detail.strFacebook ? `<a href="${normalizeUrl(detail.strFacebook)}" target="_blank" rel="noopener noreferrer" class="social-link">📘 Facebook</a>` : '',
        detail.strTwitter ? `<a href="${normalizeUrl(detail.strTwitter)}" target="_blank" rel="noopener noreferrer" class="social-link">🐦 Twitter</a>` : '',
        detail.strInstagram ? `<a href="${normalizeUrl(detail.strInstagram)}" target="_blank" rel="noopener noreferrer" class="social-link">📸 Instagram</a>` : '',
        detail.strYoutube ? `<a href="${normalizeUrl(detail.strYoutube)}" target="_blank" rel="noopener noreferrer" class="social-link">▶️ YouTube</a>` : '',
    ].filter(Boolean);

    if (links.length === 0) return '';

    return `
        <div class="league-description" style="margin-bottom:18px;">
            <h2>Official Links</h2>
            <div class="team-socials" style="margin-top:10px;">
                ${links.join('')}
            </div>
        </div>
    `;
}

function createLeagueOverviewMarkup(detail, teamCount) {
    const leagueName = detail.strLeague || LA_LIGA_NAME;
    const banner = detail.strFanart1 || detail.strBanner || '';
    const badge = detail.strBadge || detail.strLogo || '';
    const trophy = detail.strTrophy || '';
    const description = detail.strDescriptionEN || `${leagueName} is Spain's top professional football competition, featuring 20 teams battling it out each season.`;
    const currentSeason = detail.strCurrentSeason || getCurrentSeason();

    return `
        <div id="league-detail-container">
            <div class="league-hero-banner">
                ${banner ? `<img src="${banner}" alt="${leagueName}" loading="lazy">` : ''}
                <div class="banner-overlay"></div>
                <div class="league-hero-info">
                    <div class="league-hero-badge">
                        ${badge ? `<img src="${badge}" alt="${leagueName}" loading="lazy">` : '<span style="font-size:22px">🏆</span>'}
                    </div>
                    <div class="league-hero-text">
                        <h1>${leagueName}</h1>
                        <p>${detail.strCountry || 'Spain'}${detail.strGender ? ` · ${detail.strGender}` : ''}</p>
                    </div>
                </div>
            </div>

            <div class="league-stats">
                <div class="stat-card">
                    <div class="stat-value">${teamCount || '20'}</div>
                    <div class="stat-label">Clubs</div>
                </div>
                ${detail.intFormedYear ? `
                    <div class="stat-card">
                        <div class="stat-value">${detail.intFormedYear}</div>
                        <div class="stat-label">Founded</div>
                    </div>
                ` : ''}
                <div class="stat-card">
                    <div class="stat-value">${currentSeason}</div>
                    <div class="stat-label">Current Season</div>
                </div>
                ${detail.strCountry ? `
                    <div class="stat-card">
                        <div class="stat-value">${detail.strCountry}</div>
                        <div class="stat-label">Country</div>
                    </div>
                ` : ''}
                ${detail.strGender ? `
                    <div class="stat-card">
                        <div class="stat-value">${detail.strGender}</div>
                        <div class="stat-label">Division</div>
                    </div>
                ` : ''}
                ${trophy ? `
                    <div class="stat-card">
                        <div class="stat-value">
                            <img src="${trophy}" alt="${leagueName} trophy" style="height:38px;object-fit:contain;">
                        </div>
                        <div class="stat-label">Trophy</div>
                    </div>
                ` : ''}
            </div>

            <div class="league-description">
                <h2>About ${leagueName}</h2>
                <p>${description}</p>
            </div>

            ${createLeagueLinksMarkup(detail)}

            <div class="league-description">
                <h2>Jump right in</h2>
                <p class="league-overview-note">
                    Check out club profiles, browse stadiums, or dig into fixtures from any season.
                </p>
                <div class="home-actions">
                    <button class="fetch-btn overview-action-btn" id="overview-teams-btn">Browse all teams</button>
                    <button class="fetch-btn overview-action-btn" id="overview-matches-btn">See matches</button>
                </div>
            </div>

            <div class="league-teams-section">
                <h2>A few clubs to start with</h2>
                <div class="teams-grid" id="featured-teams-grid"></div>
            </div>
        </div>
    `;
}
