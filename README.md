# Football Leagues Data — SportsMonks API Fetcher

A small project to fetch and store football leagues data from the SportsMonks API. This repository centralizes scripts and documentation for retrieving league metadata, seasons, teams, and related entities so you can build analytics, dashboards, or local caches for downstream use.

## What this project does

- Fetches league-level data from the SportsMonks API for all supported leagues.
- Saves or streams the responses for further processing (import into a database, analytics pipeline, or static JSON files).
- Provides examples and guidance for handling pagination, rate limits, retries, and caching.

## Quick contract

- Inputs: SPORTS_MONKS_API_KEY (string environment variable). Optional parameters: list of league IDs, target season IDs, output format (JSON/CSV), and concurrency limits.
- Outputs: JSON (or CSV) files containing league metadata, seasons, teams, and optionally fixtures/standings.
- Error modes: network failures, API rate limits (HTTP 429), invalid/missing API key (HTTP 401/403), and partial results when some requests fail.
- Success criteria: all requested leagues fetched and stored locally (or streamed) with a recorded timestamp and source URL.

## Prerequisites

- A SportsMonks API key. Sign up at https://sportsmonks.com/ and get an API key with permissions to access the football endpoints you need.
- Git and a terminal (macOS, Linux, Windows WSL).
- Optional: Node.js or Python if you plan to use the example scripts below.

## Configuration

Set your SportsMonks API key in the environment before running scripts. Example (zsh / bash):

```bash
export SPORTS_MONKS_API_KEY="your_api_key_here"
```

Keep your key secret. Do not commit it to source control.

## Usage examples

Below are minimal examples showing how to call the SportsMonks leagues endpoints directly and with a small retry pattern. Adjust the endpoint path and query params to match the SportsMonks API plan you have.

### 1) Curl (quick test)

```bash
# List leagues (example)
curl -s "https://soccer.sportsmonks.com/api/v2.0/leagues?api_token=$SPORTS_MONKS_API_KEY" | jq .
```

### 2) Python example (requests)

```python
# fetch_leagues.py
import os
import requests

API_KEY = os.getenv('SPORTS_MONKS_API_KEY')
BASE = 'https://soccer.sportsmonks.com/api/v2.0'

def fetch_leagues():
    url = f"{BASE}/leagues?api_token={API_KEY}"
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    print(data)

if __name__ == '__main__':
    fetch_leagues()
```

### 3) Node.js example (axios)

```js
// fetchLeagues.js
const axios = require('axios');
const apiKey = process.env.SPORTS_MONKS_API_KEY;
const BASE = 'https://soccer.sportsmonks.com/api/v2.0';

async function fetchLeagues(){
  const url = `${BASE}/leagues?api_token=${apiKey}`;
  const res = await axios.get(url, { timeout: 15000 });
  console.log(JSON.stringify(res.data, null, 2));
}

fetchLeagues().catch(e => { console.error(e.message); process.exit(1); });
```

## Suggested workflow for "all leagues" fetch

1. Fetch the top-level `leagues` list.
2. For each league, optionally fetch `seasons`, `teams`, and any other child resources you need.
3. Respect the SportsMonks rate limits — insert delays or use a token bucket concurrency limiter.
4. Save results with a clear file naming scheme and include timestamp and request URL in metadata.

Example output file structure (recommended):
```
data/
  leagues.json                   # full list of leagues
  leagues/<league_id>/
    league.json                  # detailed league metadata
    seasons.json                 # seasons for the league
    teams.json                   # teams participating in the league
    fixtures.json                # optional: fixtures for a season
```

## Data shapes (example)

A league item typically looks like (simplified):

```json
{
  "data": {
    "id": 271,
    "name": "English Premier League",
    "country_name": "England",
    "country_id": 11,
    "current_season_id": 8473,
    "logo_path": "https://.../logo.png"
  }
}
```

Refer to the SportsMonks API docs for the canonical response schema for each endpoint.

## Rate limits, retries, and error handling

- Implement exponential backoff and jitter for retries on HTTP 429 and 5xx errors.
- Respect the API plan's request-per-minute quota; add concurrency limits.
- For long-running fetches, checkpoint progress (e.g., record which league IDs are completed) so you can resume.
- Log full request/response metadata in debug mode (avoid logging API keys).

## Caching and storage

- For frequently requested endpoints that change rarely (league metadata), cache results and refresh periodically (daily/weekly depending on your needs).
- Use lightweight on-disk JSON for small projects, or a simple database (SQLite/Postgres) for structured queries and joins.

## Testing and quality gates

- Add unit tests for small helper functions (URL builders, pagination handling, backoff logic).
- Add an integration smoke test that runs a single request against the SportsMonks sandbox or your account and asserts the response contains expected fields.
- Lint and type-check any scripts (ESLint/TypeScript for Node; flake8/mypy for Python).

## Next steps / enhancements

- Add example scripts that write to SQLite / Postgres.
- Support incremental updates (only fetch new/changed fixtures using timestamps or webhooks).
- Implement a small CLI with flags for concurrency, target leagues, and output format.

## Contributing

Contributions are welcome. Please open issues for feature requests or bugs and submit PRs with clear descriptions and tests where appropriate.

## License

Include your chosen license here (e.g., MIT). If you don't want to pick one yet, add a short note: "All rights reserved by repository owner." 

## Contact

If you need help, open an issue in this repository or contact the maintainer.
