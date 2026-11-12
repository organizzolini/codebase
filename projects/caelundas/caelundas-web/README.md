## Develop

```bash
nx run caelundas-web:start
```

The app holds no data of its own: every event, facet, filter collection,
calendar window and night-sky star comes from the `caelundas-api` GraphQL
API, which reads the Caelundas Postgres. Bring those up first, then the app:

```bash
# 1. Start the local Postgres (docker compose) and create the schema
nx run caelundas-db:migration:run

# 2. Fill it with events and the night sky, as caelundas-cli's README describes
nx run caelundas-cli:download-ephemeris
cp projects/caelundas/caelundas-cli/.env.default projects/caelundas/caelundas-cli/.env
nx run caelundas-cli:start

# 3. Serve the API on port 6173, then the app
cp projects/caelundas/caelundas-api/.env.default projects/caelundas/caelundas-api/.env
nx run caelundas-api:start
```

The dev and preview servers listen on port 8967, derived from the project name
with `scripts/shell/text-to-port.sh caelundas-web` as every other application's
is, and `nx run caelundas-web:stop` frees it.

The API's address is the `VITE_CAELUNDAS_API_URL` variable, read when the app
is built or served, `http://localhost:6173/graphql` when unset. Point it at
another API before a build:

```bash
VITE_CAELUNDAS_API_URL=https://api.example.test/graphql nx run caelundas-web:build
```

The browser calls the API directly, so the API must allow this app's origin.

## Generate the API client

`src/graphql/generated/` is committed output of GraphQL Code Generator, from
the documents in `src/graphql/operations/` and the schema `caelundas-api` writes
to the gitignored `caelundas-api/src/schema.gql` each time it boots. Boot the
API once before generating. The build never needs it: it reads the committed
files.

```bash
nx run caelundas-web:codegen          # Regenerate from the API's schema
nx run caelundas-web:codegen:check    # Fail when a committed file is stale
nx run caelundas-web:codegen-watch    # Start the API and regenerate on change
```

## Test

```bash
nx run caelundas-web:vitest
```

## Night sky link parameters

The backdrop reads these from the page link; a value that does not parse falls
back to its default. The toolbar's Sky menu sets every one of them
but `sky.debug`, reading the link and writing it back as a control moves, and
removes a key set back to its default. Its Default button removes them all
but `sky.debug`. Colors are text of three or six hexadecimal digits,
with or without the `#`. Write the `#` as `%23`, for example `sky.top=%23102040`:
the router reads an all-digit value such as `123456` or `1e5` as a number,
which cannot be told from the color it was meant to be, so a number falls back
to the default.

- `sky=off` removes the backdrop.
- `sky.lat` and `sky.lon` move the observer, the north pole (90) and New
  York's longitude by default; a latitude of 0 or below draws nothing. The
  view faces north, and at the pole altitude is declination.
- `sky.vFov` sets the degrees of altitude shown, 90 by default, and
  `sky.altBottom` the altitude at the bottom edge, from -45 to 89 and 0 by
  default, so the default view, the whole sky above the horizon from the
  pole, holds the northern half of the ecliptic and the northern zodiac's
  figures as they turn past; a bottom below the horizon reaches further south. The pole
  stays a degree above the top edge, so a field of view that would show it is
  cut to fit, 89° at the defaults, and a cut of more than that degree is
  warned of once.
- `sky.pixelsPerSecond` sets the drift speed in on-screen pixels per second,
  3 by default.
- `sky.maxMag` sets the faintest magnitude drawn, and `sky.starScale`
  multiplies the dot size.
- `sky.top` and `sky.bottom` set the colors at the top and bottom of the
  background, `04060f` and `0d1533` by default.
- `sky.constellations` draws constellation figures beneath the stars: a
  comma-separated list of full names, lower case with spaces or hyphens as
  underscores, such as `ursa_major` or `canis_major`, and the words `all` and
  `zodiac` (the twelve zodiac constellations), combined as in
  `sky.constellations=zodiac,ursa_major`. Absent, it draws the zodiac's; `all`
  draws all 88, and `none`,
  or an empty value (`sky.constellations=`), draws none. A name it does not know
  is left out, with one console warning. Facing north from mid-northern
  latitudes the zodiac lies below the window, so its figures show there only
  with a lower `sky.altBottom`.
- `sky.lineColor`, `sky.lineOpacity` and `sky.lineWidth` stroke the figures:
  a color like `sky.top`'s, `ffffff` by default; an opacity from 0 to 1,
  `0.24` by default; and a width in on-screen pixels from 0 to 10, `0.8` by
  default. A number out of range is clamped, and a value that does not parse
  falls back to the default with one console warning.
- The ecliptic, the Sun's yearly path and the line the zodiac lies along, is
  drawn as a dashed path beneath the stars; `sky.ecliptic=false` hides it.
  `sky.eclipticColor`, `sky.eclipticOpacity` and `sky.eclipticWidth` stroke it
  like the figures' keys, `ffffff`, `0.12` and `1` by default. It lies within
  23.44° of the celestial equator, so it shows only where the window reaches
  that far south; the default band holds its northern half.
- `sky.debug=true` draws the zoomed-out tuning view.

## Stars and constellations

The API draws the night sky from its `stars`, `constellations` and
`constellation_lines` tables, which `caelundas-cli`'s `night-sky` command fills,
and this app shows the SVG its `nightSky` query returns. The list of all 88
constellations in the Sky menu is a constant in `night-sky.constants.ts`.

The stars are the [HYG star database](https://github.com/astronexus/HYG-Database)
v4.1, stored to magnitude 6.5 at declination -45 degrees or north, plus any
fainter star a figure joins. HYG is licensed
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) and the stored
catalog is a derived work, so it carries the same license and credit to David
Nash and the HYG contributors. The constellations and their figures come from
[d3-celestial](https://github.com/ofrohn/d3-celestial), BSD-3-Clause, Olaf
Frohn, after the IAU's constellation charts.

## 👔 Conformetry

This project was generated from the [tanstack-application](/configuration/conformetry-templates/tanstack-application) conformetry template.
