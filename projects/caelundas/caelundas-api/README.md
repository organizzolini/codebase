## Start

The API reads the Caelundas Postgres through `CaelundasDatabaseModule` from `caelundas-db`, so the database must be running and migrated first (`nx run caelundas-db:migration:run`). Copy `.env.default` to `.env`; the `CAELUNDAS_POSTGRES_*` values there match the shared Compose Postgres.

```bash
nx run caelundas-api:start
```

The web app calls the API from another origin, so the API answers cross-origin requests, including the `OPTIONS` preflight of a GraphQL POST. `CAELUNDAS_API_CORS_ORIGINS` lists the allowed origins, comma separated; `.env.default` allows the web app's dev server on port 8967, and leaving it unset allows every origin (`*`).

## Test

```bash
nx run caelundas-api:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-graphql-application](../../../configuration/conformetry-templates/nestjs-graphql-application) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run caelundas-api:coinagerie-check:write`.

- **accept**:
- **alioth**:
- **altitude**:
- **anchor**:
- **angle**:
- **appearance**:
- **ascension**:
- **aspect**:
- **azimuth**:
- **binder**:
- **breadth**:
- **canonical**:
- **canonicalize**:
- **conjunct**:
- **constellation**:
- **db**:
- **declination**:
- **degree**:
- **designation**:
- **dubhe**:
- **early**:
- **earth**:
- **ecliptic**:
- **epoch**:
- **equinox**:
- **greenwich**:
- **harmonic**:
- **hip**:
- **horizon**:
- **ingress**:
- **instant**:
- **j2000**:
- **julian**:
- **july**:
- **latitude**:
- **longitude**:
- **lyra**:
- **magnitude**:
- **middleware**:
- **moon**:
- **negative**:
- **north**:
- **obliquity**:
- **observer**:
- **phase**:
- **planet**:
- **polar**:
- **pole**:
- **quarter**:
- **radius**:
- **reddest**:
- **retrograde**:
- **rotation**:
- **scorpius**:
- **sidereal**:
- **sky**:
- **south**:
- **southern**:
- **star**:
- **sun**:
- **temporality**:
- **trace**:
- **tuesday**:
- **unfinished**:
- **ursa**:
- **vega**:
- **visible**:
- **weekday**:
- **zodiac**:

<!-- coinagerie:end -->
