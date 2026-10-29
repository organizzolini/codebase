---
type: "Reference"
title: "External Service Integrations"
description: "Overview of all external service integrations: Ollama (local LLM for Affirmancy), SearxNG (metasearch for Affirmancy), Swiss Ephemeris (astronomical data for Caelundas), PostgreSQL (shared container for Lexico and Meanderaw), and Open WebUI (chat interface for Ollama)."
tags: ["integrations", "external-services", "ollama", "searxng", "postgres", "swiss-ephemeris", "open-webui"]
verified:
  - by: openwiki/0.7.0
    at: 2026-10-29T03:39:46.432Z
sources:
  - id: openwiki-source-b1fbe7ba8fb86efe70b945c0
    resource: repo://documentation/planning/2026-02-27-feature-affirmations-application-1.plan.md
  - id: openwiki-source-5af1e140a8c8b0f50fd8ad35
    resource: repo://infrastructure/docker/docker-compose.yml
  - id: openwiki-source-e84c9845fa1929e0b3fde349
    resource: repo://infrastructure/README.md
  - id: openwiki-source-aa414ec11f49c0bd0511815c
    resource: repo://projects/affirmancy/project.json
  - id: openwiki-source-65feee223eea8eae1972cca5
    resource: repo://projects/affirmancy/README.md
  - id: openwiki-source-e6649d4abfe6e57dbc354632
    resource: repo://projects/affirmancy/searxng.settings.yml
  - id: openwiki-source-365913b525ddd217ee2335b6
    resource: repo://projects/caelundas/caelundas-cli/README.md
generated: { by: "openwiki/0.7.0", at: "2026-10-29T03:39:46.432Z" }
---

# External Service Integrations

This page documents the external services that the codebase integrates with, including their purposes, configurations, and operational characteristics.

## Service Summary

| Service | Purpose | Used By | Local Port | Configuration |
|---------|---------|---------|------------|---------------|
| **Ollama** | Local LLM inference (`gemma4:e2b`) | Affirmancy | 11434 | `nx run affirmancy:ollama` (host-managed) |
| **PostgreSQL** | Primary datastore | Lexico, Meanderaw | 5432 | `nx run infrastructure:postgres:up` |
| **SearxNG** | Metasearch (curated engines) | Affirmancy | 8889 | `nx run infrastructure:searxng:up` + `projects/affirmancy/searxng.settings.yml` |
| **Swiss Ephemeris** | JPL DE431 astronomical data | Caelundas | N/A (local files) | `nx run caelundas-cli:download-ephemeris` |
| **Open WebUI** | Browser chat interface for Ollama | Affirmancy (manual use) | 3001 | `nx run infrastructure:open-webui:up` |

---

## Ollama — Local LLM Server

**Purpose**: Runs large language models locally for AI-powered applications (Affirmancy agent, research workflows).

| Property | Value |
|----------|-------|
| **Port** | 11434 (HTTP API) |
| **Management** | Host-managed via Homebrew (`brew services start/stop ollama`) |
| **Default model** | `gemma4:e2b` (small variant for CPU-only inference, ~2B params, 128k token context) |
| **Additional models** | `gemma4:e4b`, `gemma4:e26b` (pulled via `pull-medium`, `pull-large` targets) |
| **Volume** | `~/Library/Application Support/Ollama` (persists downloaded models) |

### Configuration

Environment variables set via Ollama defaults (not Docker-managed):

- **OLLAMA_KEEP_ALIVE=10m**: Keeps the model loaded in memory for 10 minutes after last use, avoiding repeated reloads between notebook cells or agent invocations.
- **OLLAMA_NUM_PARALLEL=1** and **OLLAMA_MAX_LOADED_MODELS=1**: Serializes requests and limits memory footprint for CPU-only inference.
- **OLLAMA_NO_CLOUD=1**: Disables Ollama's cloud telemetry and model library sync.

### Models

| Model | Size | Use case |
|-------|------|----------|
| `gemma4:e2b` | ~2B params | Default; interactive CPU inference, 128k token context |
| `gemma4:e4b` | ~4B params | Higher quality; pulled via `nx run affirmancy:ollama --configuration=pull-medium` |
| `gemma4:e26b` | ~26B params | Maximum quality; pulled via `nx run affirmancy:ollama --configuration=pull-large` |

### CPU-Only Inference

All models run on CPU deliberately. The small `gemma4:e2b` variant keeps generation interactive (seconds per response) without GPU acceleration. Larger models trade latency for quality.

### Health Check

```bash
curl http://localhost:11434/api/tags
```

Returns the list of locally available models.

### Nx Targets

- `nx run affirmancy:ollama --configuration=start` — Start Ollama service (via Homebrew)
- `nx run affirmancy:ollama --configuration=stop` — Stop Ollama service
- `nx run affirmancy:ollama --configuration=pull-small` — Pull default model (`gemma4:e2b`)
- `nx run affirmancy:ollama --configuration=pull-medium` — Pull `gemma4:e4b`
- `nx run affirmancy:ollama --configuration=pull-large` — Pull `gemma4:e26b`

---

## PostgreSQL — Primary Datastore

**Purpose**: Shared PostgreSQL container providing isolated databases, schemas, and roles for each database-backed project.

| Property | Value |
|----------|-------|
| **Port** | 5432 (TCP) |
| **Image** | `postgres:18-alpine` |
| **Container name** | `postgres` |
| **Volume** | `postgres_data:/var/lib/postgresql` |
| **Projects** | `lexico`, `meanderaw` |

### Configuration

Defined in `infrastructure/docker/docker-compose.yml`:

- **POSTGRES_PROJECTS**: `lexico meanderaw` — each project gets a `<project>_username` role, `<project>_development` database, and `<project>` schema
- **env_file**: `../../.env` — admin credentials (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`)
- **Init script**: Inline config `postgres-databases` creates roles/databases/schemas when volume is empty

### Database-per-Project Pattern

Each project in `POSTGRES_PROJECTS` receives:
- Role: `<project>_username` (password: `<project>_password`)
- Database: `<project>_development` (owned by role)
- Schema: `<project>` (owned by role, inside the database)

<!-- openwiki: broken internal link [../architecture/adr/0022-give-every-database-project-its-own-database-schema-and-role.md] file "../architecture/adr/0022-give-every-database-project-its-own-database-schema-and-role.md" does not exist. Fix the href or restore the target, then delete this comment. -->
The Meanderaw project follows the same pattern. See [ADR 0022](../architecture/adr/0022-give-every-database-project-its-own-database-schema-and-role.md) for the architectural decision.

### Adding a Project to an Existing Volume

```bash
nx run infrastructure:postgres:up
docker exec -e POSTGRES_PROJECTS=<project> postgres sh /docker-entrypoint-initdb.d/databases.sh
```

The script stops at the first object that already exists, so name only the projects the volume lacks. Never use `infrastructure:postgres:recreate` for this — it deletes the volume and all data.

### Nx Targets

- `nx run infrastructure:postgres:up` — Start PostgreSQL
- `nx run infrastructure:postgres:down` — Stop PostgreSQL
- `nx run infrastructure:postgres:recreate` — Remove volume and restart (destructive)

### Health Check

```bash
pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}
```

Runs every 10s with 5s timeout, 5 retries.

---

## SearxNG — Self-Hosted Metasearch

**Purpose**: Aggregates results from curated search engines for the Affirmancy research agent. No API keys required; runs entirely self-hosted.

| Property | Value |
|----------|-------|
| **Port** | 8889 (maps to container port 8080) |
| **Image** | `searxng/searxng:latest` |
| **Container name** | `searxng` |
| **Settings file** | `projects/affirmancy/searxng.settings.yml` (mounted read-only) |

### Configuration Highlights

The settings file (`projects/affirmancy/searxng.settings.yml`) uses `use_default_settings: true` to inherit SearxNG defaults, overriding only what's needed:

#### General
- **Instance name**: `Affirmancy SearxNG`
- **Debug**: `false`
- **Rate limiter**: Disabled (`limiter: false`) — only queried by the LangGraph agent, not end users
- **Public instance**: `false` — disables "join public instance" banner

#### Search Behavior
- **Safe search**: `0` (off) — spiritual/occult content often misclassified by content filters
- **Autocomplete**: Disabled — queries generated by agent, not typed by humans
- **Formats**: `html` (browser UI) and `json` (agent consumption)
- **Engine ban times**: Reduced for faster recovery during development (e.g., `ban_time_on_fail: 5s`, `max_ban_time_on_fail: 30s`)

#### Hostnames Plugin — Result Ranking

Custom `hostnames` plugin boosts trusted sources for spiritual/occult research:

| Priority | Example Domains | Purpose |
|----------|----------------|---------|
| **High** | `sacred-texts.com`, `hermetic.com`, `biddytarot.com`, `astro.com`, `cafeastrology.com`, `chabad.org`, `sefaria.org`, `wikipedia.org` | Primary/secondary source archives across tarot, astrology, kabbalah, chakras, runes, gemstones |
| **Low** | `tarostarot.com`, `wikihow.com`, `quora.com`, `horoscope.com`, `dictionary.com` | Thin/SEO content deprioritized |
| **Remove** | `zhihu.com`, `pinterest.com`, `etsy.com`, `amazon.com`, `health.clevelandclinic.org` | Non-English farms, image-only, affiliate/marketplace, medical sites |

#### Engine Configuration

Engines organized in tiers by weight (higher = preferred in deduplication):

| Tier | Engines | Weight | Notes |
|------|---------|--------|-------|
| **1** | `wikisource`, `openlibrary` | 2.0 | Primary source texts (public domain occult books) |
| **2** | `wikipedia`, `startpage` | 1.5 | Encyclopedic/high-trust web; Startpage proxies Google without CAPTCHAs |
| **3** | `reddit` | 1.2 | Practitioner communities (r/tarot, r/astrology, etc.) |
| **4** | `duckduckgo`, `brave`, `bing` | 1.0 / 0.9 / 0.7 | General web; DDG baseline, Brave independent index, Bing widest but commercial |
| **Disabled** | `google`, `wikidata` | — | Google redundant with Startpage; Wikidata returns structured JSON-LD, not prose |

#### Timeouts

```yaml
outgoing:
  request_timeout: 8.0      # default 2.0 — too low, causes engine timeouts
  max_request_timeout: 15.0
```

Higher timeouts accommodate slow engines; LLM tolerates latency better than human UI.

### Nx Targets

- `nx run infrastructure:searxng:up` — Start SearxNG
- `nx run infrastructure:searxng:down` — Stop SearxNG
- `nx run infrastructure:searxng:open` — Open in browser

### Health Check

```bash
wget -qO- http://localhost:8080/
```

Runs every 30s with 10s timeout, 3 retries, 15s start period.

---

## Swiss Ephemeris — Astronomical Data

**Purpose**: Provides high-precision planetary positions for Caelundas (astrological calendar/ephemeris generation).

| Property | Value |
|----------|-------|
| **Library** | `sweph` (Swiss Ephemeris) |
| **Data source** | JPL DE431 ephemeris files |
| **Data location** | `projects/caelundas/caelundas-cli/data/ephemeris/` (not committed to git) |
| **Date range** | 1900-01-01 to 2100-12-31 |
| **Network calls** | None — fully offline computation |

### Data Files

The JPL DE431 binary ephemeris files (`.se1`, `.se2`, etc.) are downloaded once:

```bash
nx run caelundas-cli:download-ephemeris
```

This places files in `projects/caelundas/caelundas-cli/data/ephemeris/`.

### Behavior

- **No network calls at runtime**: All positions computed locally from downloaded files.
- **No API keys or rate limits**: Completely self-contained.
- **Missing data handling**: If any required ephemeris file is missing, the CLI refuses to start and names the missing command. Without the files, the library falls back to a less precise built-in ephemeris (Moshier), which is not acceptable for production use.

### Supported Calculations

- Planetary positions (Sun, Moon, planets, Chiron, Lilith, four asteroids, lunar nodes/apogee)
- Aspects (major, minor, harmonic, compound)
- Moon phases (8 phases, exact instant + span)
- Eclipses (solar/lunar: begin, maximum, end)
- Retrogrades (stations and periods)
- Ingresses (sign, decan, peak)
- Solar cycle events (solstices, equinoxes, cross-quarters, hexadecans, perihelion/aphelion)
- Lunar apsides (apogee/perigee)
- Daily cycles (sunrise, sunset, zenith/nadir, moonrise/moonset)
- Twilights (civil, nautical, astronomical dawn/dusk)

---

## Open WebUI — Browser Chat Interface

**Purpose**: Provides a browser-based chat interface for interacting with the local Ollama server. Useful for manual testing, prompt iteration, and exploring model capabilities outside the Affirmancy pipeline.

| Property | Value |
|----------|-------|
| **Port** | 3001 (maps to container port 8080) |
| **Image** | `ghcr.io/open-webui/open-webui:main` |
| **Container name** | `open-webui` |
| **Volume** | `open-webui_data:/app/backend/data` |

### Configuration

Defined in `infrastructure/docker/docker-compose.yml`:

- **OLLAMA_BASE_URL**: `http://host.docker.internal:11434` — connects to host-managed Ollama
- **ENABLE_WEBSOCKET_SUPPORT**: `false`
- **Health check**: `curl -f http://localhost:8080/health` every 30s, 10s timeout, 5 retries, 60s start period

### Nx Targets

- `nx run infrastructure:open-webui:up` — Start Open WebUI
- `nx run infrastructure:open-webui:down` — Stop Open WebUI
- `nx run infrastructure:open-webui:open` — Open in browser at `http://localhost:3001`

---

## Operational Notes

### Local Development

Start all local services:

```bash
nx run infrastructure:postgres:up
nx run infrastructure:searxng:up
nx run infrastructure:open-webui:up
# Ollama started via affirmancy project targets
nx run affirmancy:ollama --configuration=start
```

### Port Summary

| Service | Host Port | Container Port | Protocol |
|---------|-----------|----------------|----------|
| Ollama | 11434 | N/A (host) | HTTP |
| Open WebUI | 3001 | 8080 | HTTP |
| SearxNG | 8889 | 8080 | HTTP |
| PostgreSQL | 5432 | 5432 | TCP |

### Troubleshooting

| Issue | Resolution |
|-------|------------|
| Ollama model not found | Run `nx run affirmancy:ollama --configuration=pull-small` (or `pull-medium`/`pull-large`) |
| SearxNG engine failing | Check `docker logs searxng`; engine ban times auto-recover (5s–30s) |
| Open WebUI can't reach Ollama | Verify `OLLAMA_BASE_URL=http://host.docker.internal:11434` in compose |
| Swiss Ephemeris missing files | Run `nx run caelundas-cli:download-ephemeris` |
| Postgres project missing | Run `docker exec -e POSTGRES_PROJECTS=<project> postgres sh /docker-entrypoint-initdb.d/databases.sh` |

---

## Related Pages

- [Infrastructure Architecture](../architecture/infrastructure.md) — Kubernetes/Terraform deployment
- [Affirmancy Domain](../domain/affirmancy.md) — Affirmation generation application
- [Caelundas Domain](../domain/caelundas.md) — Astrological calendar/ephemeris
- [Release Workflow](../workflows/release.md) — Automated release process
- [Database Management](../operations/database-management.md) — Migration and export/import workflows
- [Local Development](../operations/local-development.md) — Development environment setup
