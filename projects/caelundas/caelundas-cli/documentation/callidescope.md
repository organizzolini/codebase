<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/caelundas/caelundas-cli`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 1055 |
| Files | 188 |
| Calls traced | 1343 |
| Call stacks | 106 |
| Deepest stack | 15 |
| Stacks through recursion | 0 |
| Unfollowable calls | 38 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 16 |
| `maximumBreadth` | 12 |

### Call stacks (depth)

**1. `CaelundasCommand.run`** — depth ≥ 15 · decorated-method

```text
🚀 CaelundasCommand.run(): Promise<void> [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.command.ts:55]
   ↳ Runs the calendar pipeline: detect, store, then render the stored range to ICS and JSON files.
  └─> PerfectiveService.detect(input: Input, options?: PerfectiveOptions): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/perfective/perfective.service.ts:241]
     ↳ Detects all perfective (instantaneous) astronomical events within the given date range.
    └─> PerfectiveService.detectDayEvents(…): { events: DetectedCalendarEvent[]; previousAspectBodies: AspectBodies[]; } [projects/caelundas/caelundas-cli/src/modules/perfective/perfective.service.ts:62]
       ↳ Sweeps one day minute-by-minute, aggregating perfective events and rolling aspect state forward.
      └─> PerfectiveService.detectMinuteEvents(…): { aspectBodies: AspectBodies[]; events: DetectedCalendarEvent[]; } [projects/caelundas/caelundas-cli/src/modules/perfective/perfective.service.ts:109]
         ↳ Detects all minute-level event families and returns both events and updated aspect-body state.
        └─> PerfectiveService.detectObservationalEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/perfective/perfective.service.ts:132]
           ↳ Detects local observational phenomena such as eclipses, crossings, twilights, and rises/sets.
          └─> EclipsesService.detect(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipses.service.ts:72]
             ↳ Detects solar and lunar eclipse events at a specific minute.
            └─> EclipseCalculationService.getTopocentricEventsForDetect(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-calculation.service.ts:273]
               ↳ Computes the observer's eclipse events: the geocentric lunar type and maximum, with the observer's own solar type from…
              └─> EclipseTopocentricService.getTopocentricEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:342]
                 ↳ The observer's eclipse events at a minute, read from the sky only during a global eclipse; solar types are local, lunar…
                └─> EclipseTopocentricService.continueSolarOccurrence(…): SolarEclipseType | null [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:135]
                   ↳ Carries the observer's solar eclipse into `minute`, keeping its type while visible; null when no minute is visible.
                  └─> EclipseTopocentricService.getFirstLocalSolarEclipseType(…): SolarEclipseType [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:201]
                     ↳ The local type of a solar eclipse first seen at `minute`, from its closest visible approach; partial when none can be…
                    └─> EclipseTopocentricService.getClosestVisibleApproach(…): ClosestApproach | null [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:163]
                       ↳ The Moon's closest approach to the Sun over the visible run of minutes starting near `minute`; null when none is…
                      └─> EclipseGeometryService.getTopocentricSample(…): TopocentricSample | null [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:330]
                         ↳ The observer's Sun and Moon at one minute, or null when the minute lies past the end of either body's horizon ephemeris.
                        └─> EclipseGeometryService.getTopocentricDisc(ephemeris: AzimuthElevationEphemeris, minuteIso: string): TopocentricDisc [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:128]
                           ↳ Reads one body's topocentric disc at one minute from its horizon ephemeris.
                          └─> EclipseGeometryService.field(…): number [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:132]
                            └─> EphemerisService.getAzimuthElevationFromEphemeris(…): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:176]
                               ↳ Extracts one field of a horizon position: azimuth, elevation, ecliptic latitude or longitude, or semidiameter; throws…
```

**2. `PhasesService.detect`** — depth 9 · orphan-root

```text
🚀 PhasesService.detect(args: DetectPlanetaryEventsArguments): DetectedCalendarEvent[] ⚠ deprecated [projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/phases.service.ts:51]
   ↳ Detects planetary phase events at a minute for Venus, Mercury, and Mars.
  └─> PhasesService.getMartianPhaseEvents(args: MartianPhaseEventArguments): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/phases.service.ts:137]
     ↳ Produces Martian phase events for one minute using precomputed phase parameters.
    └─> MartianPhaseService.getMartianPhaseEvents(args: MartianPhaseEventArguments): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/martian/martian-phase.service.ts:182]
       ↳ Produces Martian phase events for one minute using precomputed phase parameters.
      └─> MartianPhaseService.detectMartianPhases(parameters: PhaseParameters, minute: Moment): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/martian/martian-phase.service.ts:60]
         ↳ Detects martian phases.
        └─> PhaseCalculationService.isMorningRise(args: RiseSetLongitudeArguments): boolean [projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:330]
           ↳ Determines whether planet rises in morning.
          └─> PhaseCalculationService.isMorning(args: CurrentLongitudeArguments): boolean [projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:323]
             ↳ Determines whether planet is in morning position (western).
            └─> PhaseCalculationService.isWestern(args: CurrentLongitudeArguments): boolean [projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:396]
               ↳ Determines whether planet is west of sun, by the wrapped signed elongation.
              └─> PhaseCalculationService.getSignedElongation(args: CurrentLongitudeArguments): number [projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:82]
                 ↳ Signed elongation of the planet from the Sun in (−180°, 180°]: positive east, negative west, wrapped across 0° Aries.
                └─> MathService.normalizeDegrees(degrees: number): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:138]
                   ↳ Normalizes an angle in degrees to [0, 360).
```

**3. `NightSkyCommand.run`** — depth 8 · decorated-method

```text
🚀 NightSkyCommand.run(_passedParameters: string[], options?: NightSkyCommandOptions): Promise<void> [projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.command.ts:91]
   ↳ Ingests the three files.
  └─> NightSkyService.ingest(files: NightSkyFiles): Promise<NightSkyRows> [projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.service.ts:87]
     ↳ Reads the three files, builds the rows and replaces the tables' rows with them, returning what was written.
    └─> buildNightSkyRows(sources: NightSkySources): NightSkyRows [projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:36]
       ↳ Builds the night sky's rows from the three files: stars as bright as the eye sees, plus any fainter one a figure joins.
      └─> traceConstellationLines(text: string, index: StarIndex): ConstellationLineRow[] [projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:141]
         ↳ Reads figures as segments between catalog stars by Hipparcos number, dropping ends with no matching star and duplicate…
        └─> map(…)(vertex: [number, number]): CatalogStar | undefined [projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:149]
          └─> findStar(index: StarIndex, vertex: readonly [number, number]): CatalogStar | undefined [projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:54]
             ↳ The catalog star a vertex of a figure lies on, within the tolerance, or nothing.
            └─> map(…)(star: CatalogStar): { separation: number; star: CatalogStar; } [projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:63]
              └─> measureSeparation(star: CatalogStar, [longitude, latitude]: readonly [number, number]): number [projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:180]
                 ↳ The degrees between a star and a vertex, along the sky, close enough for the small separations matching compares.
```

<details>
<summary>103 more call stacks</summary>

**4. `MajorAspectsService.detect`** — depth ≥ 8 · orphan-root

```text
🚀 MajorAspectsService.detect(…): DetectedCalendarEvent | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:149]
  └─> MajorAspectsService.detectAspectForBodyPair(args: DetectAspectForBodyPairArguments): DetectedCalendarEvent | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:63]
     ↳ Detects aspect for body pair.
    └─> MajorAspectsService.buildMajorAspectEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:128]
       ↳ Builds the major aspect event for two bodies; throws when none is within orb.
      └─> MajorAspectEventService.buildMajorAspectEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-event.service.ts:119]
         ↳ Resolves and builds a typed major-aspect event for two body longitudes.
        └─> MajorAspectEventService.getMajorAspect(args: { longitudeBody1: number; longitudeBody2: number; }): MajorAspect | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-event.service.ts:154]
           ↳ Returns the first in-orb major aspect for two longitudes.
          └─> AspectsUtilitiesService.isAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:326]
             ↳ Returns `true` when the angular separation between two bodies falls within the configured orb for the given aspect.
            └─> MathService.getAngle(longitude1: Longitude, longitude2: Longitude): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:57]
               ↳ Shortest angular distance between two longitudes, in [0, 180]; wraps around 0°/360°.
              └─> MathService.normalizeDegrees(degrees: number): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:138]
                 ↳ Normalizes an angle in degrees to [0, 360).
```

**5. `TripleAspectsService.detectProgressive`** — depth 8 · orphan-root

```text
🚀 TripleAspectsService.detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects.service.ts:111]
   ↳ Builds duration events by pairing forming/dissolving events per triple-aspect group key.
  └─> TripleAspectsComposerService.pairProgressiveGroup(groupEvents: DetectedCalendarEvent[]): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:347]
     ↳ Pairs one triple-aspect group's boundaries into spans, one per occurrence.
    └─> TripleAspectsComposerService.flatMap(…)(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:357]
      └─> TripleAspectsComposerService.buildProgressiveEvent(…): DetectedCalendarEvent | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:204]
         ↳ Builds one triple-aspect duration event from a forming/dissolving pair.
        └─> TripleAspectsComposerService.buildProgressiveBodiesMeta(…): ProgressiveBodiesMeta | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:54]
           ↳ Builds progressive bodies meta.
          └─> TripleAspectsComposerService.resolveProgressiveMeta(…): ProgressiveBodiesMeta | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:154]
             ↳ Resolves progressive meta.
            └─> TripleAspectsComposerService.resolveTripleBody(displayName: string): Body | undefined [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:193]
               ↳ Inverts a display name to a body tracked by triple aspects.
              └─> bodyFromDisplayName(displayName: string): Body | undefined [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:161]
                 ↳ Inverts {@link bodyDisplayName}: returns the body a display name belongs to, or `undefined` when the name is not a…
```

**6. `EphemerisService.getAzimuthElevationEphemerisByBody`** — depth ≥ 7 · orphan-root

```text
🚀 EphemerisService.getAzimuthElevationEphemerisByBody(…): Record<"lunar apogee" | "lunar perigee" | "north lunar node" | "south lunar node" | "ceres" | "chiron" | "juno" | "lilith" | "pallas" | "vesta" | "jupiter" | "mars" | "mercury" | ... 6 more ... | "venus", AzimuthElevationEphemeris> [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:147]
   ↳ Computes minute-by-minute horizontal coordinates (azimuth, apparent elevation) for the requested bodies at the…
  └─> EphemerisHorizonService.computeAzimuthElevationForBody(…): AzimuthElevationEphemeris [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/horizon/ephemeris-horizon.service.ts:43]
     ↳ Minute-by-minute azimuth and apparent elevation for a body at the observer's location; azimuth runs clockwise from…
    └─> EphemerisHorizonService.computeAzimuthElevationForMinute(…): HorizonPosition [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/horizon/ephemeris-horizon.service.ts:70]
       ↳ Horizontal coordinates for a body at one moment, with parallax applied; Swiss Ephemeris measures azimuth from South, so…
      └─> EphemerisCoordinateService.getTopocentricBodyCoordinates(…): { distance: number; latitude: number; longitude: number; } [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:216]
         ↳ Apparent ecliptic position from sea level rather than Earth's center; `set_topo` is global state, so it is set on every…
        └─> EphemerisCoordinateService.computeBodyCoordinates(…): { distance: number; distanceSpeed: number; latitude: number; longitude: number; } [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:45]
           ↳ Computes body ecliptic coordinates (longitude, latitude, distance) with the given flags.
          └─> assertSwissEphemerisResult(result: { error: string; flag: number; }, subject: SwissEphemerisSubject): void [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.utilities.ts:13]
             ↳ Throws unless a `calc` or `pheno_ut` result came from the Swiss Ephemeris files; a built-in fallback throws…
            └─> EphemerisUnavailableError.constructor(…): EphemerisUnavailableError [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.constants.ts:86]
```

**7. `IngressesService.buildDecanIngressEvent`** — depth 7 · orphan-root

```text
🚀 IngressesService.buildDecanIngressEvent(args: { body: Body; date: Moment; longitude: number; }): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:86]
   ↳ Delegates decan-ingress event construction to the composer service.
  └─> IngressesComposerService.buildDecanIngressEvent(args: { body: Body; date: Moment; longitude: number; }): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:94]
     ↳ Creates a decan ingress event: a body crossing into one of the three 10° decans, each with a sub-ruler and symbol.
    └─> IngressesComposerService.buildDecanIngressEventObject(args: { body: Body; date: Moment; longitude: number; }): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:110]
       ↳ Builds the decan ingress payload without logging side effects.
      └─> IngressesComposerService.resolveDecan(longitude: number): Decan [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:413]
         ↳ Converts numeric decan to the validated `Decan` union and throws on invalid values.
        └─> IngressesComposerService.getDecan(longitude: number): number [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:289]
           ↳ Maps longitude to decan number (1-3) relative to the current sign start degree.
          └─> IngressesComposerService.getSign(longitude: number): Sign [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:76]
             ↳ Maps an ecliptic longitude to its containing zodiac sign range.
            └─> IngressesComposerService.find(…)(…): boolean [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:79]
```

**8. `MinorAspectsComposerService.processAspectGroup`** — depth 7 · orphan-root

```text
🚀 MinorAspectsComposerService.processAspectGroup(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:217]
   ↳ Processes aspect group.
  └─> MinorAspectsComposerService.map(…)(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:235]
    └─> MinorAspectsComposerService.getMinorAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:190]
       ↳ Creates one minor-aspect duration event from a matched forming/dissolving pair.
      └─> MinorAspectsComposerService.extractAspectComponents(tags: string[]): ExtractAspectComponentsResult [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:145]
         ↳ Extracts aspect components.
        └─> MinorAspectsComposerService.filter(…)(c: string): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:147]
          └─> MinorAspectsComposerService.map(…)(b: string): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:148]
            └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
               ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**9. `EphemerisService.getCoordinateEphemerisByBody`** — depth ≥ 6 · orphan-root

```text
🚀 EphemerisService.getCoordinateEphemerisByBody(…): Record<"lunar apogee" | "lunar perigee" | "north lunar node" | "south lunar node" | "ceres" | "chiron" | "juno" | "lilith" | "pallas" | "vesta" | "jupiter" | "mars" | "mercury" | ... 6 more ... | "venus", CoordinateEphemeris> [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:191]
   ↳ Computes minute-by-minute ecliptic coordinates for all requested bodies.
  └─> EphemerisCoordinateService.computeNodeBodyMinutes(args: { body: Node; end: Moment; start: Moment; }): CoordinateEphemeris [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:176]
     ↳ Computes minute-by-minute coordinates for a node (lunar/solar nodes and lunar perigee).
    └─> EphemerisCoordinateService.computeNodeCoordinate(…): { latitude: number; longitude: number; } [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:93]
       ↳ Computes node coordinate (lunar node or perigee). Dispatches to the appropriate computation based on node type.
      └─> EphemerisCoordinateService.computeRegularNodeCoordinate(…): { latitude: number; longitude: number; } [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:108]
         ↳ Computes regular lunar/solar node ecliptic coordinates. Adjusts south lunar node longitude by 180°.
        └─> assertSwissEphemerisResult(result: { error: string; flag: number; }, subject: SwissEphemerisSubject): void [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.utilities.ts:13]
           ↳ Throws unless a `calc` or `pheno_ut` result came from the Swiss Ephemeris files; a built-in fallback throws…
          └─> EphemerisUnavailableError.constructor(…): EphemerisUnavailableError [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.constants.ts:86]
```

**10. `AspectsUtilitiesService.getValue`** — depth 6 · orphan-root

```text
🚀 AspectsUtilitiesService.getValue({ body1, body2 }: { body1: Body; body2: Body; }): AspectBodies | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:285]
  └─> AspectsUtilitiesService.find(…)(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:289]
    └─> AspectsUtilitiesService.every(…)(instant: "next" | "previous" | "current"): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:290]
      └─> AspectsUtilitiesService.isAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:326]
         ↳ Returns `true` when the angular separation between two bodies falls within the configured orb for the given aspect.
        └─> MathService.getAngle(longitude1: Longitude, longitude2: Longitude): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:57]
           ↳ Shortest angular distance between two longitudes, in [0, 180]; wraps around 0°/360°.
          └─> MathService.normalizeDegrees(degrees: number): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:138]
             ↳ Normalizes an angle in degrees to [0, 360).
```

**11. `AspectsUtilitiesService.anonymous`** — depth 6 · orphan-root

```text
🚀 AspectsUtilitiesService.anonymous(longitudes: LongitudesWindow): "forming" | "perfective" | "dissolving" | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:310]
  └─> AspectsUtilitiesService.getAspectPhase(…): "forming" | "perfective" | "dissolving" | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:160]
     ↳ Resolves whether the aspect is entering, exacting, or leaving orb at the current minute.
    └─> AspectsUtilitiesService.isPerfective(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:200]
       ↳ Checks whether the aspect becomes exact between the previous and current minute.
      └─> AspectsUtilitiesService.isSignedOffsetSignChange(args: { aspectAngle: number; longitudes: LongitudesWindow; }): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:232]
         ↳ Detects perfection when the signed offset from the aspect angle changes sign, rejecting the jump across the ±180° wrap,…
        └─> AspectsUtilitiesService.getSignedOffset(…): number [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:186]
           ↳ Signed offset of body 1 from body 2 relative to an aspect angle, wrapped to [−180°, 180°).
          └─> MathService.normalizeDegrees(degrees: number): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:138]
             ↳ Normalizes an angle in degrees to [0, 360).
```

**12. `MajorAspectProgressiveService.getProgressiveEvent`** — depth ≥ 6 · orphan-root

```text
🚀 MajorAspectProgressiveService.getProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:98]
  └─> MajorAspectProgressiveService.getMajorAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:46]
     ↳ Builds one progressive duration event from a forming/dissolving pair.
    └─> ProgressiveAspectService.createSimpleAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:174]
       ↳ Create a single progressive event for a simple aspect (major, minor, or specialty).
      └─> ProgressiveAspectService.extractTypedAspectParts(…): TypedAspectParts<TAspect, TBody> [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:223]
         ↳ Extract typed body/aspect values from event tags using aspect/body registries.
        └─> ProgressiveAspectService.map(…)(body: TBody): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:236]
          └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
             ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**13. `MajorAspectProgressiveService.getProgressiveEvent`** — depth ≥ 6 · orphan-root

```text
🚀 MajorAspectProgressiveService.getProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:124]
  └─> MajorAspectProgressiveService.getMajorAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:46]
     ↳ Builds one progressive duration event from a forming/dissolving pair.
    └─> ProgressiveAspectService.createSimpleAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:174]
       ↳ Create a single progressive event for a simple aspect (major, minor, or specialty).
      └─> ProgressiveAspectService.extractTypedAspectParts(…): TypedAspectParts<TAspect, TBody> [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:223]
         ↳ Extract typed body/aspect values from event tags using aspect/body registries.
        └─> ProgressiveAspectService.map(…)(body: TBody): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:236]
          └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
             ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**14. `MinorAspectsProgressiveService.getProgressiveEvent`** — depth ≥ 6 · orphan-root

```text
🚀 MinorAspectsProgressiveService.getProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:80]
  └─> MinorAspectsProgressiveService.getMinorAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:96]
     ↳ Creates one minor-aspect duration event from a matched forming/dissolving pair.
    └─> ProgressiveAspectService.createSimpleAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:174]
       ↳ Create a single progressive event for a simple aspect (major, minor, or specialty).
      └─> ProgressiveAspectService.extractTypedAspectParts(…): TypedAspectParts<TAspect, TBody> [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:223]
         ↳ Extract typed body/aspect values from event tags using aspect/body registries.
        └─> ProgressiveAspectService.map(…)(body: TBody): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:236]
          └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
             ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**15. `MinorAspectsProgressiveService.getProgressiveEvent`** — depth ≥ 6 · orphan-root

```text
🚀 MinorAspectsProgressiveService.getProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:124]
  └─> MinorAspectsProgressiveService.getMinorAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:96]
     ↳ Creates one minor-aspect duration event from a matched forming/dissolving pair.
    └─> ProgressiveAspectService.createSimpleAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:174]
       ↳ Create a single progressive event for a simple aspect (major, minor, or specialty).
      └─> ProgressiveAspectService.extractTypedAspectParts(…): TypedAspectParts<TAspect, TBody> [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:223]
         ↳ Extract typed body/aspect values from event tags using aspect/body registries.
        └─> ProgressiveAspectService.map(…)(body: TBody): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:236]
          └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
             ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**16. `MinorAspectsService.detect`** — depth ≥ 6 · orphan-root

```text
🚀 MinorAspectsService.detect(…): DetectedCalendarEvent | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:167]
  └─> MinorAspectsService.detectBodyPairAspect(args: DetectBodyPairAspectArguments): DetectedCalendarEvent | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:64]
     ↳ Detects a minor-aspect event for one body pair at a specific minute window.
    └─> MinorAspectsEventService.getLongitudesWindowForBody(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-event.service.ts:72]
       ↳ Returns previous/current/next longitudes for one body at minute resolution.
      └─> AspectCalculationSupportService.getLongitudesWindowForBody(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-calculation-support.service.ts:82]
         ↳ Returns previous/current/next longitudes for one body from a body-keyed ephemeris map.
        └─> EphemerisService.getLongitudesWindow(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:374]
           ↳ Ecliptic longitudes at the previous, current and next minute, in one call; throws when any timestamp is missing.
          └─> EphemerisService.getCoordinateFromEphemeris(…): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:234]
             ↳ Safely extracts coordinate data (longitude or latitude) from ephemeris at a timestamp.
```

**17. `QuadrupleAspectsComposerService.checkPatternExists`** — depth ≥ 6 · orphan-root

```text
🚀 QuadrupleAspectsComposerService.checkPatternExists(edges: AspectBodies[]): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-composer.service.ts:243]
  └─> QuadrupleAspectsBaseService.checkGrandCrossPattern(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:98]
     ↳ Checks grand cross pattern.
    └─> QuadrupleAspectsBaseService.verifyGrandCrossSquares(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:405]
       ↳ Verifies grand cross squares.
      └─> QuadrupleAspectsBaseService.haveAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:337]
         ↳ Returns `true` when an undirected body pair has the requested aspect in the edge set.
        └─> AspectGraphService.haveAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:70]
           ↳ Returns `true` when an undirected body pair has the requested aspect in the edge set.
          └─> AspectGraphService.some(…)(edge: AspectBodies): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:78]
```

**18. `QuadrupleAspectsService.detectProgressive`** — depth 6 · orphan-root

```text
🚀 QuadrupleAspectsService.detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects.service.ts:59]
   ↳ Pairs forming and dissolving events per body quartet into progressive events spanning the active period.
  └─> QuadrupleAspectsService.groupBy(…)(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects.service.ts:66]
    └─> QuadrupleAspectsBaseService.makeProgressiveGroupKey(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:349]
       ↳ Makes progressive group key.
      └─> QuadrupleAspectsBaseService.filter(…)(tag: string): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:351]
        └─> QuadrupleAspectsBaseService.map(…)(…): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:353]
          └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
             ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**19. `QuintupleAspectsService.detectProgressive`** — depth 6 · orphan-root

```text
🚀 QuintupleAspectsService.detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects.service.ts:50]
   ↳ Converts instantaneous quintuple events into progressive events spanning the active period, pairing forming and…
  └─> QuintupleAspectsComposerService.groupQuintupleEventsByKey(events: DetectedCalendarEvent[]): Record<string, DetectedCalendarEvent[]> [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:314]
     ↳ Groups quintuple events by key.
    └─> QuintupleAspectsComposerService.groupBy(…)(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:321]
      └─> QuintupleAspectsComposerService.filter(…)(tag: string): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:322]
        └─> QuintupleAspectsComposerService.map(…)(…): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:323]
          └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
             ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**20. `SextupleAspectsService.checkPatternExists`** — depth 6 · orphan-root

```text
🚀 SextupleAspectsService.checkPatternExists(edges: AspectBodies[]): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects.service.ts:86]
  └─> SextupleAspectsComposerService.findHexagramPattern(bodies: Body[], edges: AspectBodies[]): Body[] | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:268]
     ↳ Checks whether 6 bodies form a hexagram: two interlocking Grand Trines plus sextiles.
    └─> SextupleAspectsComposerService.findValidHexagonArrangement(…): ("lunar apogee" | "lunar perigee" | "north lunar node" | "south lunar node" | "ceres" | "chiron" | "juno" | "lilith" | "pallas" | "vesta" | "jupiter" | "mars" | "mercury" | ... 6 more ... | "venus")[] | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:291]
       ↳ Finds valid hexagon arrangement.
      └─> SextupleAspectsComposerService.tryHexagonArrangement(…): ("lunar apogee" | "lunar perigee" | "north lunar node" | "south lunar node" | "ceres" | "chiron" | "juno" | "lilith" | "pallas" | "vesta" | "jupiter" | "mars" | "mercury" | ... 6 more ... | "venus")[] | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:448]
         ↳ Tries to hexagon arrangement.
        └─> SextupleAspectsComposerService.tryArrangementForPair(…): ("lunar apogee" | "lunar perigee" | "north lunar node" | "south lunar node" | "ceres" | "chiron" | "juno" | "lilith" | "pallas" | "vesta" | "jupiter" | "mars" | "mercury" | ... 6 more ... | "venus")[] | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:414]
           ↳ Tries to arrangement for pair.
          └─> SextupleAspectsComposerService.find(…)(x: number): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:425]
```

**21. `SextupleAspectsService.detectProgressive`** — depth 6 · orphan-root

```text
🚀 SextupleAspectsService.detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects.service.ts:128]
   ↳ Converts instantaneous sextuple events into progressive events spanning the active period, pairing forming and…
  └─> SextupleAspectsComposerService.groupSextupleEventsByKey(events: DetectedCalendarEvent[]): Record<string, DetectedCalendarEvent[]> [projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:376]
     ↳ Groups sextuple events by key.
    └─> SextupleAspectsComposerService.groupBy(…)(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:383]
      └─> SextupleAspectsComposerService.filter(…)(tag: string): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:384]
        └─> SextupleAspectsComposerService.map(…)(…): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:385]
          └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
             ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**22. `SpecialtyAspectsProgressiveService.getProgressiveEvent`** — depth ≥ 6 · orphan-root

```text
🚀 SpecialtyAspectsProgressiveService.getProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:43]
  └─> SpecialtyAspectsProgressiveService.getSpecialtyAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:85]
     ↳ Creates one specialty-aspect duration event from a forming/dissolving pair.
    └─> ProgressiveAspectService.createSimpleAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:174]
       ↳ Create a single progressive event for a simple aspect (major, minor, or specialty).
      └─> ProgressiveAspectService.extractTypedAspectParts(…): TypedAspectParts<TAspect, TBody> [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:223]
         ↳ Extract typed body/aspect values from event tags using aspect/body registries.
        └─> ProgressiveAspectService.map(…)(body: TBody): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:236]
          └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
             ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**23. `SpecialtyAspectsProgressiveService.getProgressiveEvent`** — depth ≥ 6 · orphan-root

```text
🚀 SpecialtyAspectsProgressiveService.getProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:113]
  └─> SpecialtyAspectsProgressiveService.getSpecialtyAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:85]
     ↳ Creates one specialty-aspect duration event from a forming/dissolving pair.
    └─> ProgressiveAspectService.createSimpleAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:174]
       ↳ Create a single progressive event for a simple aspect (major, minor, or specialty).
      └─> ProgressiveAspectService.extractTypedAspectParts(…): TypedAspectParts<TAspect, TBody> [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:223]
         ↳ Extract typed body/aspect values from event tags using aspect/body registries.
        └─> ProgressiveAspectService.map(…)(body: TBody): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:236]
          └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
             ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**24. `SpecialtyAspectsService.detect`** — depth ≥ 6 · orphan-root

```text
🚀 SpecialtyAspectsService.detect(…): DetectedCalendarEvent | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:190]
  └─> SpecialtyAspectsService.detectBodyPairEvent(…): DetectedCalendarEvent | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:64]
     ↳ Detects a specialty-aspect event for one body pair using three-point longitude sampling.
    └─> SpecialtyAspectsService.detectBodyPairLongitudes(…): LongitudesWindow [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:101]
       ↳ Reads previous/current/next longitudes for a body pair from coordinate ephemerides.
      └─> SpecialtyAspectsEventService.getBodyLongitudesWindow(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-event.service.ts:72]
         ↳ Returns previous/current/next longitudes for one body at minute resolution.
        └─> EphemerisService.getLongitudesWindow(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:374]
           ↳ Ecliptic longitudes at the previous, current and next minute, in one call; throws when any timestamp is missing.
          └─> EphemerisService.getCoordinateFromEphemeris(…): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:234]
             ↳ Safely extracts coordinate data (longitude or latitude) from ephemeris at a timestamp.
```

**25. `StelliumService.detectProgressive`** — depth 6 · orphan-root

```text
🚀 StelliumService.detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:276]
   ↳ Converts instantaneous stellium events into progressive events spanning each stellium's active period.
  └─> StelliumService.groupBy(…)(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:281]
    └─> StelliumService.stelliumGroupKey(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:240]
       ↳ Handles stellium group key.
      └─> StelliumService.filter(…)(tag: string): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:242]
        └─> StelliumService.map(…)(…): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:243]
          └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
             ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**26. `EphemerisService.getDistanceEphemerisByBody`** — depth ≥ 5 · orphan-root

```text
🚀 EphemerisService.getDistanceEphemerisByBody(…): Record<"lunar apogee" | "lunar perigee" | "north lunar node" | "south lunar node" | "ceres" | "chiron" | "juno" | "lilith" | "pallas" | "vesta" | "jupiter" | "mars" | "mercury" | ... 6 more ... | "venus", DistanceEphemeris> [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:249]
   ↳ Computes minute-by-minute geocentric distance for the requested bodies.
  └─> EphemerisCoordinateService.computeDistanceForBody(…): DistanceEphemeris [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:152]
     ↳ Geocentric distance for a body per minute, in AU from calc() data[2]; throws when calc fails.
    └─> EphemerisCoordinateService.computeBodyCoordinates(…): { distance: number; distanceSpeed: number; latitude: number; longitude: number; } [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:45]
       ↳ Computes body ecliptic coordinates (longitude, latitude, distance) with the given flags.
      └─> assertSwissEphemerisResult(result: { error: string; flag: number; }, subject: SwissEphemerisSubject): void [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.utilities.ts:13]
         ↳ Throws unless a `calc` or `pheno_ut` result came from the Swiss Ephemeris files; a built-in fallback throws…
        └─> EphemerisUnavailableError.constructor(…): EphemerisUnavailableError [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.constants.ts:86]
```

**27. `MajorAspectProgressiveService.castAspectPartsToTypes`** — depth ≥ 5 · orphan-root

```text
🚀 MajorAspectProgressiveService.castAspectPartsToTypes(…): { aspect: "conjunct" | "opposite" | "sextile" | "square" | "trine"; body1: "lunar apogee" | "lunar perigee" | "north lunar node" | "south lunar node" | "ceres" | "chiron" | "juno" | ... 12 more ... | "venus"; body2: "lunar apogee" | ... 18 more ... | "venus"; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:66]
   ↳ Backward-compatible wrapper retained for existing unit tests.
  └─> ProgressiveAspectService.extractTypedAspectPartsOrThrow(…): TypedAspectParts<TAspect, TBody> [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:275]
     ↳ Typed extraction wrapper with a normalized error message for compatibility call sites.
    └─> ProgressiveAspectService.extractTypedAspectParts(…): TypedAspectParts<TAspect, TBody> [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:223]
       ↳ Extract typed body/aspect values from event tags using aspect/body registries.
      └─> ProgressiveAspectService.map(…)(body: TBody): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:236]
        └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
           ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**28. `MajorAspectProgressiveService.getAspectGroupKey`** — depth 5 · orphan-root

```text
🚀 MajorAspectProgressiveService.getAspectGroupKey(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:97]
  └─> MajorAspectProgressiveService.getAspectGroupKey(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:35]
     ↳ Builds a stable grouping key from sorted bodies plus major-aspect label.
    └─> ProgressiveAspectService.buildAspectGroupKeyFromTags(…): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:34]
       ↳ Create a stable group key from sorted body labels and aspect label.
      └─> ProgressiveAspectService.map(…)(body: string): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:43]
        └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
           ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**29. `MajorAspectsService.getLongitudesWindow`** — depth 5 · orphan-root

```text
🚀 MajorAspectsService.getLongitudesWindow(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:164]
  └─> MajorAspectsService.getLongitudesWindowForBody(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:112]
     ↳ Derives longitudes window for body.
    └─> AspectCalculationSupportService.getLongitudesWindowForBody(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-calculation-support.service.ts:82]
       ↳ Returns previous/current/next longitudes for one body from a body-keyed ephemeris map.
      └─> EphemerisService.getLongitudesWindow(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:374]
         ↳ Ecliptic longitudes at the previous, current and next minute, in one call; throws when any timestamp is missing.
        └─> EphemerisService.getCoordinateFromEphemeris(…): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:234]
           ↳ Safely extracts coordinate data (longitude or latitude) from ephemeris at a timestamp.
```

**30. `MajorAspectsService.detectProgressive`** — depth ≥ 5 · orphan-root

```text
🚀 MajorAspectsService.detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:176]
   ↳ Builds duration events by pairing forming and dissolving events per body-pair/aspect key.
  └─> MajorAspectProgressiveService.detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:92]
     ↳ Builds progressive major-aspect events from detected minute-level events.
    └─> ProgressiveAspectService.buildSimpleAspectFamilyProgressiveEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:134]
       ↳ Builds progressive events for one simple-aspect family, optionally constrained to one precomputed group key.
      └─> ProgressiveAspectService.buildProgressiveAspectEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:61]
         ↳ Build progressive duration events for an aspect tag by pairing Forming/Dissolving boundaries.
        └─> ProgressiveAspectService.filter(…)(event: DetectedCalendarEvent): boolean [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:83]
```

**31. `MajorAspectsService.getMajorAspect`** — depth 5 · orphan-root

```text
🚀 MajorAspectsService.getMajorAspect(…): "conjunct" | "opposite" | "sextile" | "square" | "trine" | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:183]
   ↳ Returns the first major aspect between two bodies, or `null` if none is within orb.
  └─> MajorAspectEventService.getMajorAspect(args: { longitudeBody1: number; longitudeBody2: number; }): MajorAspect | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-event.service.ts:154]
     ↳ Returns the first in-orb major aspect for two longitudes.
    └─> AspectsUtilitiesService.isAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:326]
       ↳ Returns `true` when the angular separation between two bodies falls within the configured orb for the given aspect.
      └─> MathService.getAngle(longitude1: Longitude, longitude2: Longitude): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:57]
         ↳ Shortest angular distance between two longitudes, in [0, 180]; wraps around 0°/360°.
        └─> MathService.normalizeDegrees(degrees: number): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:138]
           ↳ Normalizes an angle in degrees to [0, 360).
```

**32. `mapClasses`** — depth ≥ 5 · orphan-root

```text
🚀 mapClasses(…): Readonly<Record<string, readonly TagPath[]>> [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:17]
   ↳ Maps each class under `parent`, and each name in it, to its node; names are title-cased.
  └─> flatMap(…)(…): [[string, readonly TagPath[]], ...[string, readonly TagPath[]][]] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:22]
    └─> mapEach(names: readonly string[], toPath: (name: string) => TagPath): TagMap [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:38]
       ↳ A map from each name to the one node `toPath` puts it at.
      └─> map(…)(name: string): [string, readonly TagPath[]] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:43]
        └─> one(path: TagPath): readonly TagPath[] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:116]
           ↳ A raw tag that stands for exactly one node.
```

**33. `MinorAspectsProgressiveService.castAspectComponentsToTypes`** — depth ≥ 5 · orphan-root

```text
🚀 MinorAspectsProgressiveService.castAspectComponentsToTypes(…): { aspect: "quincunx" | "semisextile" | "semisquare" | "sesquiquadrate"; body1: "lunar apogee" | "lunar perigee" | "north lunar node" | "south lunar node" | "ceres" | "chiron" | ... 13 more ... | "venus"; body2: "lunar apogee" | ... 18 more ... | "venus"; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:48]
   ↳ Backward-compatible wrapper retained for existing unit tests.
  └─> ProgressiveAspectService.extractTypedAspectPartsOrThrow(…): TypedAspectParts<TAspect, TBody> [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:275]
     ↳ Typed extraction wrapper with a normalized error message for compatibility call sites.
    └─> ProgressiveAspectService.extractTypedAspectParts(…): TypedAspectParts<TAspect, TBody> [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:223]
       ↳ Extract typed body/aspect values from event tags using aspect/body registries.
      └─> ProgressiveAspectService.map(…)(body: TBody): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:236]
        └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
           ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**34. `MinorAspectsProgressiveService.getAspectGroupKey`** — depth 5 · orphan-root

```text
🚀 MinorAspectsProgressiveService.getAspectGroupKey(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:79]
  └─> MinorAspectsProgressiveService.buildGroupKey(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:37]
     ↳ Builds a stable grouping key from sorted bodies plus aspect name for pairing.
    └─> ProgressiveAspectService.buildAspectGroupKeyFromTags(…): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:34]
       ↳ Create a stable group key from sorted body labels and aspect label.
      └─> ProgressiveAspectService.map(…)(body: string): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:43]
        └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
           ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**35. `MinorAspectsService.getLongitudesWindow`** — depth 5 · orphan-root

```text
🚀 MinorAspectsService.getLongitudesWindow(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:181]
  └─> MinorAspectsEventService.getLongitudesWindowForBody(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-event.service.ts:72]
     ↳ Returns previous/current/next longitudes for one body at minute resolution.
    └─> AspectCalculationSupportService.getLongitudesWindowForBody(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-calculation-support.service.ts:82]
       ↳ Returns previous/current/next longitudes for one body from a body-keyed ephemeris map.
      └─> EphemerisService.getLongitudesWindow(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:374]
         ↳ Ecliptic longitudes at the previous, current and next minute, in one call; throws when any timestamp is missing.
        └─> EphemerisService.getCoordinateFromEphemeris(…): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:234]
           ↳ Safely extracts coordinate data (longitude or latitude) from ephemeris at a timestamp.
```

**36. `MinorAspectsService.detectProgressive`** — depth ≥ 5 · orphan-root

```text
🚀 MinorAspectsService.detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:194]
   ↳ Pairs forming and dissolving minor aspect events into duration events spanning each aspect's full time in orb.
  └─> MinorAspectsProgressiveService.detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:74]
     ↳ Builds progressive minor-aspect events from detected minute-level events.
    └─> ProgressiveAspectService.buildSimpleAspectFamilyProgressiveEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:134]
       ↳ Builds progressive events for one simple-aspect family, optionally constrained to one precomputed group key.
      └─> ProgressiveAspectService.buildProgressiveAspectEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:61]
         ↳ Build progressive duration events for an aspect tag by pairing Forming/Dissolving boundaries.
        └─> ProgressiveAspectService.filter(…)(event: DetectedCalendarEvent): boolean [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:83]
```

**37. `QuadrupleAspectsComposerService.checkPatternExists`** — depth 5 · orphan-root

```text
🚀 QuadrupleAspectsComposerService.checkPatternExists(edges: AspectBodies[]): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-composer.service.ts:296]
  └─> QuadrupleAspectsBaseService.checkKitePattern(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:134]
     ↳ Checks kite pattern.
    └─> QuadrupleAspectsBaseService.haveAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:337]
       ↳ Returns `true` when an undirected body pair has the requested aspect in the edge set.
      └─> AspectGraphService.haveAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:70]
         ↳ Returns `true` when an undirected body pair has the requested aspect in the edge set.
        └─> AspectGraphService.some(…)(edge: AspectBodies): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:78]
```

**38. `SpecialtyAspectsProgressiveService.getAspectGroupKey`** — depth 5 · orphan-root

```text
🚀 SpecialtyAspectsProgressiveService.getAspectGroupKey(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:42]
  └─> SpecialtyAspectsProgressiveService.specialtyAspectGroupKey(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:129]
     ↳ Builds a stable grouping key from sorted bodies plus specialty-aspect label.
    └─> ProgressiveAspectService.buildAspectGroupKeyFromTags(…): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:34]
       ↳ Create a stable group key from sorted body labels and aspect label.
      └─> ProgressiveAspectService.map(…)(body: string): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:43]
        └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
           ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**39. `SpecialtyAspectsProgressiveService.extractTypedAspectValues`** — depth ≥ 5 · orphan-root

```text
🚀 SpecialtyAspectsProgressiveService.extractTypedAspectValues(…): { aspect: "biquintile" | "decile" | "novile" | "quintile" | "septile" | "tredecile" | "undecile"; body1: "lunar apogee" | "lunar perigee" | "north lunar node" | "south lunar node" | ... 15 more ... | "venus"; body2: "lunar apogee" | ... 18 more ... | "venus"; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:59]
   ↳ Backward-compatible wrapper retained for existing unit tests.
  └─> ProgressiveAspectService.extractTypedAspectPartsOrThrow(…): TypedAspectParts<TAspect, TBody> [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:275]
     ↳ Typed extraction wrapper with a normalized error message for compatibility call sites.
    └─> ProgressiveAspectService.extractTypedAspectParts(…): TypedAspectParts<TAspect, TBody> [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:223]
       ↳ Extract typed body/aspect values from event tags using aspect/body registries.
      └─> ProgressiveAspectService.map(…)(body: TBody): string [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:236]
        └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
           ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**40. `SpecialtyAspectsService.detectProgressive`** — depth ≥ 5 · orphan-root

```text
🚀 SpecialtyAspectsService.detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:216]
   ↳ Converts instantaneous specialty aspect events into progressive events spanning each aspect's active period.
  └─> SpecialtyAspectsProgressiveService.detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:37]
     ↳ Builds progressive specialty-aspect events from detected minute-level events.
    └─> ProgressiveAspectService.buildSimpleAspectFamilyProgressiveEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:134]
       ↳ Builds progressive events for one simple-aspect family, optionally constrained to one precomputed group key.
      └─> ProgressiveAspectService.buildProgressiveAspectEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:61]
         ↳ Build progressive duration events for an aspect tag by pairing Forming/Dissolving boundaries.
        └─> ProgressiveAspectService.filter(…)(event: DetectedCalendarEvent): boolean [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:83]
```

**41. `TripleAspectsDetectorService.checkPatternExists`** — depth 5 · orphan-root

```text
🚀 TripleAspectsDetectorService.checkPatternExists(edges: AspectBodies[]): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:69]
  └─> TripleAspectsDetectorService.isGrandTrine(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:233]
     ↳ Determines whether grand trine.
    └─> TripleAspectsComposerService.haveAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:335]
       ↳ Returns `true` when an undirected body pair has the requested aspect in the edge set.
      └─> AspectGraphService.haveAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:70]
         ↳ Returns `true` when an undirected body pair has the requested aspect in the edge set.
        └─> AspectGraphService.some(…)(edge: AspectBodies): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:78]
```

**42. `TripleAspectsDetectorService.checkPatternExists`** — depth 5 · orphan-root

```text
🚀 TripleAspectsDetectorService.checkPatternExists(edges: AspectBodies[]): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:119]
  └─> TripleAspectsDetectorService.isTSquare(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:265]
     ↳ Determines whether the current edge set forms a t square pattern.
    └─> TripleAspectsComposerService.haveAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:335]
       ↳ Returns `true` when an undirected body pair has the requested aspect in the edge set.
      └─> AspectGraphService.haveAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:70]
         ↳ Returns `true` when an undirected body pair has the requested aspect in the edge set.
        └─> AspectGraphService.some(…)(edge: AspectBodies): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:78]
```

**43. `TripleAspectsDetectorService.checkPatternExists`** — depth 5 · orphan-root

```text
🚀 TripleAspectsDetectorService.checkPatternExists(edges: AspectBodies[]): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:170]
  └─> TripleAspectsDetectorService.isYod(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:297]
     ↳ Determines whether yod.
    └─> TripleAspectsComposerService.haveAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:335]
       ↳ Returns `true` when an undirected body pair has the requested aspect in the edge set.
      └─> AspectGraphService.haveAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:70]
         ↳ Returns `true` when an undirected body pair has the requested aspect in the edge set.
        └─> AspectGraphService.some(…)(edge: AspectBodies): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:78]
```

**44. `SpecialtyAspectsComposerService.getSpecialtyAspectProgressiveEvent`** — depth 5 · orphan-root

```text
🚀 SpecialtyAspectsComposerService.getSpecialtyAspectProgressiveEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:158]
   ↳ Creates one specialty-aspect duration event from a forming/dissolving pair.
  └─> SpecialtyAspectsComposerService.extractAspectBodiesFromTags(…): { aspectCapitalized: string; body1Capitalized: string; body2Capitalized: string; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:86]
     ↳ Extracts aspect bodies from tags.
    └─> SpecialtyAspectsComposerService.filter(…)(tag: string): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:92]
      └─> SpecialtyAspectsComposerService.map(…)(…): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:93]
        └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
           ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**45. `EphemerisService.getIlluminationEphemerisByBody`** — depth ≥ 4 · orphan-root

```text
🚀 EphemerisService.getIlluminationEphemerisByBody(…): Record<"lunar apogee" | "lunar perigee" | "north lunar node" | "south lunar node" | "ceres" | "chiron" | "juno" | "lilith" | "pallas" | "vesta" | "jupiter" | "mars" | "mercury" | ... 6 more ... | "venus", IlluminationEphemeris> [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:331]
   ↳ Computes per-body illumination series for the requested range.
  └─> EphemerisPhenomenaService.computeIlluminationForBody(…): IlluminationEphemeris [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/phenomena/ephemeris-phenomena.service.ts:46]
     ↳ Minute-by-minute illumination (0-100), apparent magnitude and phase angle for requested bodies; throws when pheno_ut…
    └─> assertSwissEphemerisResult(result: { error: string; flag: number; }, subject: SwissEphemerisSubject): void [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.utilities.ts:13]
       ↳ Throws unless a `calc` or `pheno_ut` result came from the Swiss Ephemeris files; a built-in fallback throws…
      └─> EphemerisUnavailableError.constructor(…): EphemerisUnavailableError [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.constants.ts:86]
```

**46. `MajorAspectProgressiveService.pairProgressiveEvents`** — depth 4 · orphan-root

```text
🚀 MajorAspectProgressiveService.pairProgressiveEvents(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:100]
  └─> ProgressiveUtilitiesService.pairProgressiveEvents(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:96]
     ↳ Pairs each beginning with the earliest unused ending no later than the next beginning; unpaired events are dropped and…
    └─> ProgressiveUtilitiesService.pairInStartOrder(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:33]
       ↳ Walks both lists in start order, pairing each beginning with the first ending at or after it unless the next beginning…
      └─> ProgressiveUtilitiesService.byStart(first: DetectedCalendarEvent, second: DetectedCalendarEvent): number [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:37]
```

**47. `MajorAspectProgressiveService.processAspectGroup`** — depth ≥ 4 · orphan-root

```text
🚀 MajorAspectProgressiveService.processAspectGroup(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:114]
   ↳ Pairs forming and dissolving events for one grouped body-pair/aspect key.
  └─> ProgressiveAspectService.buildSimpleAspectFamilyProgressiveEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:134]
     ↳ Builds progressive events for one simple-aspect family, optionally constrained to one precomputed group key.
    └─> ProgressiveAspectService.buildProgressiveAspectEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:61]
       ↳ Build progressive duration events for an aspect tag by pairing Forming/Dissolving boundaries.
      └─> ProgressiveAspectService.filter(…)(event: DetectedCalendarEvent): boolean [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:83]
```

**48. `MajorAspectProgressiveService.pairProgressiveEvents`** — depth 4 · orphan-root

```text
🚀 MajorAspectProgressiveService.pairProgressiveEvents(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:126]
  └─> ProgressiveUtilitiesService.pairProgressiveEvents(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:96]
     ↳ Pairs each beginning with the earliest unused ending no later than the next beginning; unpaired events are dropped and…
    └─> ProgressiveUtilitiesService.pairInStartOrder(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:33]
       ↳ Walks both lists in start order, pairing each beginning with the first ending at or after it unless the next beginning…
      └─> ProgressiveUtilitiesService.byStart(first: DetectedCalendarEvent, second: DetectedCalendarEvent): number [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:37]
```

**49. `map(…)`** — depth ≥ 4 · orphan-root

```text
🚀 map(…)(name: string): [string, TagMap] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.constants.ts:235]
  └─> mapEach(names: readonly string[], toPath: (name: string) => TagPath): TagMap [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:38]
     ↳ A map from each name to the one node `toPath` puts it at.
    └─> map(…)(name: string): [string, readonly TagPath[]] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:43]
      └─> one(path: TagPath): readonly TagPath[] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:116]
         ↳ A raw tag that stands for exactly one node.
```

**50. `IngressesService.buildPeakIngressEvent`** — depth 4 · orphan-root

```text
🚀 IngressesService.buildPeakIngressEvent(args: { body: Body; date: Moment; longitude: number; }): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:98]
   ↳ Creates a peak ingress event when a body reaches the 15° midpoint of its current sign, the peak expression of its…
  └─> IngressesComposerService.buildPeakIngressEvent(args: { body: Body; date: Moment; longitude: number; }): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:141]
     ↳ Creates a peak ingress event when a body reaches the 15° midpoint of its current sign, the peak expression of its…
    └─> IngressesComposerService.getSign(longitude: number): Sign [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:76]
       ↳ Maps an ecliptic longitude to its containing zodiac sign range.
      └─> IngressesComposerService.find(…)(…): boolean [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:79]
```

**51. `IngressesService.buildSignIngressEvent`** — depth 4 · orphan-root

```text
🚀 IngressesService.buildSignIngressEvent(args: { body: Body; date: Moment; longitude: number; }): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:111]
   ↳ Creates a zodiac sign ingress calendar event.
  └─> IngressesComposerService.buildSignIngressEvent(args: { body: Body; date: Moment; longitude: number; }): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:204]
     ↳ Creates a zodiac sign ingress calendar event.
    └─> IngressesComposerService.getSign(longitude: number): Sign [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:76]
       ↳ Maps an ecliptic longitude to its containing zodiac sign range.
      └─> IngressesComposerService.find(…)(…): boolean [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:79]
```

**52. `MinorAspectsEventService.isMatchingAspect`** — depth 4 · orphan-root

```text
🚀 MinorAspectsEventService.isMatchingAspect(aspect: "quincunx" | "semisextile" | "semisquare" | "sesquiquadrate"): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-event.service.ts:93]
  └─> AspectsUtilitiesService.isAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:326]
     ↳ Returns `true` when the angular separation between two bodies falls within the configured orb for the given aspect.
    └─> MathService.getAngle(longitude1: Longitude, longitude2: Longitude): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:57]
       ↳ Shortest angular distance between two longitudes, in [0, 180]; wraps around 0°/360°.
      └─> MathService.normalizeDegrees(degrees: number): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:138]
         ↳ Normalizes an angle in degrees to [0, 360).
```

**53. `MinorAspectsProgressiveService.pairProgressiveEvents`** — depth 4 · orphan-root

```text
🚀 MinorAspectsProgressiveService.pairProgressiveEvents(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:82]
  └─> ProgressiveUtilitiesService.pairProgressiveEvents(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:96]
     ↳ Pairs each beginning with the earliest unused ending no later than the next beginning; unpaired events are dropped and…
    └─> ProgressiveUtilitiesService.pairInStartOrder(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:33]
       ↳ Walks both lists in start order, pairing each beginning with the first ending at or after it unless the next beginning…
      └─> ProgressiveUtilitiesService.byStart(first: DetectedCalendarEvent, second: DetectedCalendarEvent): number [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:37]
```

**54. `MinorAspectsProgressiveService.processAspectGroup`** — depth ≥ 4 · orphan-root

```text
🚀 MinorAspectsProgressiveService.processAspectGroup(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:114]
   ↳ Pairs forming and dissolving events for one grouped body-pair/aspect key.
  └─> ProgressiveAspectService.buildSimpleAspectFamilyProgressiveEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:134]
     ↳ Builds progressive events for one simple-aspect family, optionally constrained to one precomputed group key.
    └─> ProgressiveAspectService.buildProgressiveAspectEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:61]
       ↳ Build progressive duration events for an aspect tag by pairing Forming/Dissolving boundaries.
      └─> ProgressiveAspectService.filter(…)(event: DetectedCalendarEvent): boolean [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:83]
```

**55. `MinorAspectsProgressiveService.pairProgressiveEvents`** — depth 4 · orphan-root

```text
🚀 MinorAspectsProgressiveService.pairProgressiveEvents(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:126]
  └─> ProgressiveUtilitiesService.pairProgressiveEvents(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:96]
     ↳ Pairs each beginning with the earliest unused ending no later than the next beginning; unpaired events are dropped and…
    └─> ProgressiveUtilitiesService.pairInStartOrder(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:33]
       ↳ Walks both lists in start order, pairing each beginning with the first ending at or after it unless the next beginning…
      └─> ProgressiveUtilitiesService.byStart(first: DetectedCalendarEvent, second: DetectedCalendarEvent): number [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:37]
```

**56. `QuintupleAspectsComposerService.checkPatternExists`** — depth 4 · orphan-root

```text
🚀 QuintupleAspectsComposerService.checkPatternExists(edges: AspectBodies[]): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:358]
  └─> QuintupleAspectsComposerService.findPentagramPattern(bodies: Body[], edges: AspectBodies[]): Body[] | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:251]
     ↳ Checks whether 5 bodies form a pentagram: each connects to exactly two others by quintile aspects.
    └─> QuintupleAspectsComposerService.traversePentagramPath(connections: Map<Body, Set<Body>>, bodies: Body[]): Body[] | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:379]
       ↳ Traverses pentagram path.
      └─> QuintupleAspectsComposerService.find(…)(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:390]
```

**57. `SpecialtyAspectsEventService.isMatchingAspect`** — depth 4 · orphan-root

```text
🚀 SpecialtyAspectsEventService.isMatchingAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-event.service.ts:98]
  └─> AspectsUtilitiesService.isAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:326]
     ↳ Returns `true` when the angular separation between two bodies falls within the configured orb for the given aspect.
    └─> MathService.getAngle(longitude1: Longitude, longitude2: Longitude): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:57]
       ↳ Shortest angular distance between two longitudes, in [0, 180]; wraps around 0°/360°.
      └─> MathService.normalizeDegrees(degrees: number): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:138]
         ↳ Normalizes an angle in degrees to [0, 360).
```

**58. `SpecialtyAspectsProgressiveService.pairProgressiveEvents`** — depth 4 · orphan-root

```text
🚀 SpecialtyAspectsProgressiveService.pairProgressiveEvents(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:45]
  └─> ProgressiveUtilitiesService.pairProgressiveEvents(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:96]
     ↳ Pairs each beginning with the earliest unused ending no later than the next beginning; unpaired events are dropped and…
    └─> ProgressiveUtilitiesService.pairInStartOrder(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:33]
       ↳ Walks both lists in start order, pairing each beginning with the first ending at or after it unless the next beginning…
      └─> ProgressiveUtilitiesService.byStart(first: DetectedCalendarEvent, second: DetectedCalendarEvent): number [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:37]
```

**59. `SpecialtyAspectsProgressiveService.processAspectGroup`** — depth ≥ 4 · orphan-root

```text
🚀 SpecialtyAspectsProgressiveService.processAspectGroup(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:103]
   ↳ Pairs forming and dissolving events for one grouped body-pair/aspect key.
  └─> ProgressiveAspectService.buildSimpleAspectFamilyProgressiveEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:134]
     ↳ Builds progressive events for one simple-aspect family, optionally constrained to one precomputed group key.
    └─> ProgressiveAspectService.buildProgressiveAspectEvents(…): DetectedCalendarEvent[] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:61]
       ↳ Build progressive duration events for an aspect tag by pairing Forming/Dissolving boundaries.
      └─> ProgressiveAspectService.filter(…)(event: DetectedCalendarEvent): boolean [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:83]
```

**60. `SpecialtyAspectsProgressiveService.pairProgressiveEvents`** — depth 4 · orphan-root

```text
🚀 SpecialtyAspectsProgressiveService.pairProgressiveEvents(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:115]
  └─> ProgressiveUtilitiesService.pairProgressiveEvents(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:96]
     ↳ Pairs each beginning with the earliest unused ending no later than the next beginning; unpaired events are dropped and…
    └─> ProgressiveUtilitiesService.pairInStartOrder(…): [DetectedCalendarEvent, DetectedCalendarEvent][] [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:33]
       ↳ Walks both lists in start order, pairing each beginning with the first ending at or after it unless the next beginning…
      └─> ProgressiveUtilitiesService.byStart(first: DetectedCalendarEvent, second: DetectedCalendarEvent): number [projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:37]
```

**61. `SpecialtyAspectsService.getLongitudesWindow`** — depth 4 · orphan-root

```text
🚀 SpecialtyAspectsService.getLongitudesWindow(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:203]
  └─> SpecialtyAspectsEventService.getBodyLongitudesWindow(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-event.service.ts:72]
     ↳ Returns previous/current/next longitudes for one body at minute resolution.
    └─> EphemerisService.getLongitudesWindow(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:374]
       ↳ Ecliptic longitudes at the previous, current and next minute, in one call; throws when any timestamp is missing.
      └─> EphemerisService.getCoordinateFromEphemeris(…): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:234]
         ↳ Safely extracts coordinate data (longitude or latitude) from ephemeris at a timestamp.
```

**62. `MinorAspectsComposerService.buildGroupKey`** — depth 4 · orphan-root

```text
🚀 MinorAspectsComposerService.buildGroupKey(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:99]
   ↳ Builds a stable grouping key from sorted bodies plus aspect name for pairing.
  └─> MinorAspectsComposerService.filter(…)(tag: string): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:101]
    └─> MinorAspectsComposerService.map(…)(…): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:103]
      └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
         ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**63. `MinorAspectsComposerService.getLongitudesWindowForBody`** — depth 4 · orphan-root

```text
🚀 MinorAspectsComposerService.getLongitudesWindowForBody(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:177]
   ↳ Returns previous/current/next longitudes for one body at minute resolution.
  └─> AspectCalculationSupportService.getLongitudesWindowForBody(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-calculation-support.service.ts:82]
     ↳ Returns previous/current/next longitudes for one body from a body-keyed ephemeris map.
    └─> EphemerisService.getLongitudesWindow(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:374]
       ↳ Ecliptic longitudes at the previous, current and next minute, in one call; throws when any timestamp is missing.
      └─> EphemerisService.getCoordinateFromEphemeris(…): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:234]
         ↳ Safely extracts coordinate data (longitude or latitude) from ephemeris at a timestamp.
```

**64. `SpecialtyAspectsComposerService.specialtyAspectGroupKey`** — depth 4 · orphan-root

```text
🚀 SpecialtyAspectsComposerService.specialtyAspectGroupKey(event: DetectedCalendarEvent): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:225]
   ↳ Builds a stable grouping key from sorted bodies plus specialty-aspect label.
  └─> SpecialtyAspectsComposerService.filter(…)(tag: string): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:227]
    └─> SpecialtyAspectsComposerService.map(…)(…): string [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:228]
      └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
         ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**65. `EphemerisDownloadCommand.run`** — depth 3 · decorated-method

```text
🚀 EphemerisDownloadCommand.run(): Promise<void> [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/ephemeris-download/ephemeris-download.command.ts:42]
   ↳ Downloads the data files.
  └─> EphemerisDownloadService.download(): Promise<void> [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/ephemeris-download/ephemeris-download.service.ts:68]
     ↳ Downloads every data file that is not already present.
    └─> resolveEphemerisDirectory(): string [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/ephemeris-download/ephemeris-download.utilities.ts:49]
       ↳ The absolute directory the data files live in, from the working directory.
```

**66. `EphemerisService.constructor`** — depth 3 · orphan-root

```text
🚀 EphemerisService.constructor(…): EphemerisService [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:43]
  └─> initializeSwissEphemeris(): void [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.constants.ts:102]
     ↳ Points the Swiss Ephemeris at its data files at startup.
    └─> resolveEphemerisDirectory(): string [projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/ephemeris-download/ephemeris-download.utilities.ts:49]
       ↳ The absolute directory the data files live in, from the working directory.
```

**67. `DailyCyclesService.buildLunarNadirEvent`** — depth ≥ 3 · orphan-root

```text
🚀 DailyCyclesService.buildLunarNadirEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:80]
   ↳ Creates a lunar nadir calendar event.
  └─> DailyCyclesBuilderService.buildLunarNadirEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:79]
     ↳ Creates the lunar nadir event at the Moon's lowest point below the horizon (anti-culmination).
    └─> CalendarService.buildInstantEvent(args: BuildInstantEventArguments): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:258]
       ↳ Builds a one-minute-point event where start and end are the same timestamp.
```

**68. `DailyCyclesService.buildLunarZenithEvent`** — depth ≥ 3 · orphan-root

```text
🚀 DailyCyclesService.buildLunarZenithEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:87]
   ↳ Creates a lunar zenith (culmination) calendar event.
  └─> DailyCyclesBuilderService.buildLunarZenithEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:97]
     ↳ Creates the lunar zenith event, the Moon's highest point above the horizon (meridian transit).
    └─> CalendarService.buildInstantEvent(args: BuildInstantEventArguments): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:258]
       ↳ Builds a one-minute-point event where start and end are the same timestamp.
```

**69. `DailyCyclesService.buildMoonriseEvent`** — depth ≥ 3 · orphan-root

```text
🚀 DailyCyclesService.buildMoonriseEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:94]
   ↳ Creates a moonrise calendar event.
  └─> DailyCyclesBuilderService.buildMoonriseEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:115]
     ↳ Creates the moonrise event, when the Moon's upper limb appears above the horizon, allowing for its ~16 arcminute radius.
    └─> CalendarService.buildInstantEvent(args: BuildInstantEventArguments): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:258]
       ↳ Builds a one-minute-point event where start and end are the same timestamp.
```

**70. `DailyCyclesService.buildMoonsetEvent`** — depth ≥ 3 · orphan-root

```text
🚀 DailyCyclesService.buildMoonsetEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:101]
   ↳ Creates a moonset calendar event.
  └─> DailyCyclesBuilderService.buildMoonsetEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:133]
     ↳ Creates the moonset event, when the Moon's upper limb dips below the horizon, allowing for its radius.
    └─> CalendarService.buildInstantEvent(args: BuildInstantEventArguments): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:258]
       ↳ Builds a one-minute-point event where start and end are the same timestamp.
```

**71. `DailyCyclesService.buildSolarNadirEvent`** — depth ≥ 3 · orphan-root

```text
🚀 DailyCyclesService.buildSolarNadirEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:108]
   ↳ Creates a formatted calendar event for solar nadir (solar midnight).
  └─> DailyCyclesBuilderService.buildSolarNadirEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:151]
     ↳ Creates the solar nadir event: solar midnight, the Sun's lowest point below the horizon.
    └─> CalendarService.buildInstantEvent(args: BuildInstantEventArguments): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:258]
       ↳ Builds a one-minute-point event where start and end are the same timestamp.
```

**72. `DailyCyclesService.buildSolarZenithEvent`** — depth ≥ 3 · orphan-root

```text
🚀 DailyCyclesService.buildSolarZenithEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:115]
   ↳ Creates a formatted calendar event for solar zenith (solar noon).
  └─> DailyCyclesBuilderService.buildSolarZenithEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:169]
     ↳ Creates the solar zenith event: solar noon, the Sun's highest point in the sky.
    └─> CalendarService.buildInstantEvent(args: BuildInstantEventArguments): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:258]
       ↳ Builds a one-minute-point event where start and end are the same timestamp.
```

**73. `DailyCyclesService.buildSunriseEvent`** — depth ≥ 3 · orphan-root

```text
🚀 DailyCyclesService.buildSunriseEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:122]
   ↳ Creates a formatted calendar event for sunrise.
  └─> DailyCyclesBuilderService.buildSunriseEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:187]
     ↳ Creates the sunrise event, when the Sun's center crosses the geometric horizon upward (no refraction).
    └─> CalendarService.buildInstantEvent(args: BuildInstantEventArguments): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:258]
       ↳ Builds a one-minute-point event where start and end are the same timestamp.
```

**74. `DailyCyclesService.buildSunsetEvent`** — depth ≥ 3 · orphan-root

```text
🚀 DailyCyclesService.buildSunsetEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:129]
   ↳ Creates a formatted calendar event for sunset.
  └─> DailyCyclesBuilderService.buildSunsetEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:205]
     ↳ Creates the sunset event, when the Sun's center crosses the geometric horizon downward (no refraction).
    └─> CalendarService.buildInstantEvent(args: BuildInstantEventArguments): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:258]
       ↳ Builds a one-minute-point event where start and end are the same timestamp.
```

**75. `EclipsesService.buildLunarEclipseEvent`** — depth 3 · orphan-root

```text
🚀 EclipsesService.buildLunarEclipseEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipses.service.ts:48]
   ↳ Creates a lunar eclipse calendar event.
  └─> EclipseEventService.buildLunarEclipseEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipse-event.service.ts:149]
     ↳ Creates a lunar eclipse calendar event.
    └─> EclipseEventService.buildEclipseEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipse-event.service.ts:57]
       ↳ Builds one eclipse contact event, titled with its type, body and phase, for example "🌐🌙🐉▶️ Total Lunar Eclipse…
```

**76. `EclipsesService.buildSolarEclipseEvent`** — depth 3 · orphan-root

```text
🚀 EclipsesService.buildSolarEclipseEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipses.service.ts:60]
   ↳ Creates a solar eclipse calendar event.
  └─> EclipseEventService.buildSolarEclipseEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipse-event.service.ts:161]
     ↳ Creates a solar eclipse calendar event.
    └─> EclipseEventService.buildEclipseEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipse-event.service.ts:57]
       ↳ Builds one eclipse contact event, titled with its type, body and phase, for example "🌐🌙🐉▶️ Total Lunar Eclipse…
```

**77. `TwilightsService.buildAstronomicalDawnEvent`** — depth 3 · orphan-root

```text
🚀 TwilightsService.buildAstronomicalDawnEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:61]
   ↳ Creates an astronomical dawn calendar event. Marks when the sky begins to lighten (Sun at -18° elevation).
  └─> TwilightsBuilderService.buildAstronomicalDawnEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:58]
     ↳ Builds the instant when Sun crosses -18 degrees upward.
    └─> TwilightsBuilderService.buildTransitionEvent(date: Moment, description: string, emoji: string): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:32]
       ↳ Creates a timestamped twilight transition event and logs the detected boundary.
```

**78. `TwilightsService.buildAstronomicalDuskEvent`** — depth 3 · orphan-root

```text
🚀 TwilightsService.buildAstronomicalDuskEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:71]
   ↳ Creates an astronomical dusk calendar event.
  └─> TwilightsBuilderService.buildAstronomicalDuskEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:65]
     ↳ Builds the instant when Sun crosses -18 degrees downward.
    └─> TwilightsBuilderService.buildTransitionEvent(date: Moment, description: string, emoji: string): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:32]
       ↳ Creates a timestamped twilight transition event and logs the detected boundary.
```

**79. `TwilightsService.buildCivilDawnEvent`** — depth 3 · orphan-root

```text
🚀 TwilightsService.buildCivilDawnEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:81]
   ↳ Creates a civil dawn calendar event.
  └─> TwilightsBuilderService.buildCivilDawnEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:72]
     ↳ Builds the instant when Sun crosses -6 degrees upward.
    └─> TwilightsBuilderService.buildTransitionEvent(date: Moment, description: string, emoji: string): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:32]
       ↳ Creates a timestamped twilight transition event and logs the detected boundary.
```

**80. `TwilightsService.buildCivilDuskEvent`** — depth 3 · orphan-root

```text
🚀 TwilightsService.buildCivilDuskEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:91]
   ↳ Creates a civil dusk calendar event.
  └─> TwilightsBuilderService.buildCivilDuskEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:79]
     ↳ Builds the instant when Sun crosses -6 degrees downward.
    └─> TwilightsBuilderService.buildTransitionEvent(date: Moment, description: string, emoji: string): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:32]
       ↳ Creates a timestamped twilight transition event and logs the detected boundary.
```

**81. `TwilightsService.buildNauticalDawnEvent`** — depth 3 · orphan-root

```text
🚀 TwilightsService.buildNauticalDawnEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:101]
   ↳ Creates a nautical dawn calendar event. Marks when the horizon becomes visible at sea (Sun at −12° elevation).
  └─> TwilightsBuilderService.buildNauticalDawnEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:86]
     ↳ Builds the instant when Sun crosses -12 degrees upward.
    └─> TwilightsBuilderService.buildTransitionEvent(date: Moment, description: string, emoji: string): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:32]
       ↳ Creates a timestamped twilight transition event and logs the detected boundary.
```

**82. `TwilightsService.buildNauticalDuskEvent`** — depth 3 · orphan-root

```text
🚀 TwilightsService.buildNauticalDuskEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:111]
   ↳ Creates a nautical dusk calendar event. Marks when the sea horizon becomes indistinguishable (Sun at −12° elevation).
  └─> TwilightsBuilderService.buildNauticalDuskEvent(date: Moment): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:93]
     ↳ Builds the instant when Sun crosses -12 degrees downward.
    └─> TwilightsBuilderService.buildTransitionEvent(date: Moment, description: string, emoji: string): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:32]
       ↳ Creates a timestamped twilight transition event and logs the detected boundary.
```

**83. `SpecialtyAspectsComposerService.getBodyLongitudesWindow`** — depth 3 · orphan-root

```text
🚀 SpecialtyAspectsComposerService.getBodyLongitudesWindow(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:140]
   ↳ Returns previous/current/next longitudes for one body at minute resolution.
  └─> EphemerisService.getLongitudesWindow(…): { current: number; next: number; previous: number; } [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:374]
     ↳ Ecliptic longitudes at the previous, current and next minute, in one call; throws when any timestamp is missing.
    └─> EphemerisService.getCoordinateFromEphemeris(…): number [projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:234]
       ↳ Safely extracts coordinate data (longitude or latitude) from ephemeris at a timestamp.
```

**84. `map(…)`** — depth 2 · orphan-root

```text
🚀 map(…)(…): [string, "lunar apogee" | "lunar perigee" | "north lunar node" | "south lunar node" | "ceres" | "chiron" | "juno" | "lilith" | "pallas" | "vesta" | "jupiter" | "mars" | "mercury" | ... 6 more ... | "venus"] [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:295]
  └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
     ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**85. `MajorAspectsService.constructor`** — depth 2 · orphan-root

```text
🚀 MajorAspectsService.constructor(…): MajorAspectsService [projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:37]
  └─> AspectsUtilitiesService.getIsAspect(aspectsToDetect: Aspect[]): (args: LongitudesWindow) => AspectPhase | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:307]
     ↳ Returns a phase detector for the aspects, reading three minutes; conjunctions and oppositions are perfective on a…
```

**86. `mapNone`** — depth 2 · orphan-root

```text
🚀 mapNone(names: readonly string[]): TagMap [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:51]
   ↳ A map from each name to no node at all, as it classifies nothing.
  └─> map(…)(name: string): [string, readonly TagPath[]] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:53]
```

**87. `mapPlanetaryPhases`** — depth 2 · orphan-root

```text
🚀 mapPlanetaryPhases(…): Readonly<Record<string, readonly TagPath[]>> [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:60]
   ↳ Raw tags of one planet's phase events, keyed by the marker tag such as `Venusian`; phases take their stage from…
  └─> map(…)(phase: string): [string, readonly TagPath[]] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:72]
```

**88. `map(…)`** — depth 2 · orphan-root

```text
🚀 map(…)(…): string [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.constants.ts:52]
  └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
     ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**89. `map(…)`** — depth 2 · orphan-root

```text
🚀 map(…)(…): [string, readonly TagPath[]] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.constants.ts:107]
  └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
     ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

**90. `map(…)`** — depth 2 · orphan-root

```text
🚀 map(…)(…): [string, readonly TagPath[]] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.constants.ts:116]
  └─> signPaths(sign: Sign): readonly TagPath[] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:124]
     ↳ The nodes a sign stands for: the sign itself, and beside it, as roots of their own, the element, modality and polarity…
```

**91. `map(…)`** — depth 2 · orphan-root

```text
🚀 map(…)(…): [string, readonly TagPath[]] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.constants.ts:150]
  └─> natureAndHarmonicPaths([nature, harmonic]: readonly [string, number]): readonly TagPath[] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:105]
     ↳ The nodes an aspect's nature and harmonic stand for, as roots of their own.
```

**92. `map(…)`** — depth 2 · orphan-root

```text
🚀 map(…)(…): [string, readonly TagPath[]] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.constants.ts:166]
  └─> natureAndHarmonicPaths([nature, harmonic]: readonly [string, number]): readonly TagPath[] [projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:105]
     ↳ The nodes an aspect's nature and harmonic stand for, as roots of their own.
```

**93. `IngressesService.getSign`** — depth 2 · orphan-root

```text
🚀 IngressesService.getSign(longitude: number): Sign [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:67]
   ↳ Determines which zodiac sign corresponds to an ecliptic longitude.
  └─> IngressesService.find(…)(…): boolean [projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:70]
```

**94. `TwilightsComposerService.builder`** — depth 2 · orphan-root

```text
🚀 TwilightsComposerService.builder(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-composer.service.ts:40]
  └─> TwilightsBuilderService.getAstronomicalTwilightMorningDurationEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:120]
     ↳ Builds morning astronomical-twilight interval from transition boundaries.
```

**95. `TwilightsComposerService.builder`** — depth 2 · orphan-root

```text
🚀 TwilightsComposerService.builder(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-composer.service.ts:50]
  └─> TwilightsBuilderService.getNauticalTwilightMorningDurationEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:176]
     ↳ Builds morning nautical-twilight interval from transition boundaries.
```

**96. `TwilightsComposerService.builder`** — depth 2 · orphan-root

```text
🚀 TwilightsComposerService.builder(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-composer.service.ts:80]
  └─> TwilightsBuilderService.getDaylightDurationEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:140]
     ↳ Builds daylight interval between civil dawn and civil dusk boundaries.
```

**97. `TwilightsComposerService.builder`** — depth 2 · orphan-root

```text
🚀 TwilightsComposerService.builder(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-composer.service.ts:90]
  └─> TwilightsBuilderService.getNauticalTwilightEveningDurationEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:156]
     ↳ Builds evening nautical-twilight interval from transition boundaries.
```

**98. `TwilightsComposerService.builder`** — depth 2 · orphan-root

```text
🚀 TwilightsComposerService.builder(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-composer.service.ts:100]
  └─> TwilightsBuilderService.getAstronomicalTwilightEveningDurationEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:100]
     ↳ Builds evening astronomical-twilight interval from transition boundaries.
```

**99. `TwilightsService.builder`** — depth 2 · orphan-root

```text
🚀 TwilightsService.builder(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:171]
  └─> TwilightsBuilderService.getNightDurationEvent(…): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:196]
     ↳ Builds night interval spanning from astronomical dusk to next astronomical dawn.
```

**100. `MinorAspectsService.constructor`** — depth 2 · orphan-root

```text
🚀 MinorAspectsService.constructor(…): MinorAspectsService [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:41]
  └─> AspectsUtilitiesService.getIsAspect(aspectsToDetect: Aspect[]): (args: LongitudesWindow) => AspectPhase | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:307]
     ↳ Returns a phase detector for the aspects, reading three minutes; conjunctions and oppositions are perfective on a…
```

**101. `QuadrupleAspectsService.getOtherBody`** — depth 2 · orphan-root

```text
🚀 QuadrupleAspectsService.getOtherBody(edge: AspectBodies, body: Body): Body | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects.service.ts:84]
   ↳ Returns the other body in an aspect edge relative to the given body.
  └─> QuadrupleAspectsBaseService.getOtherBody(edge: AspectBodies, body: Body): Body | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:266]
     ↳ Returns the other body in an aspect edge relative to the given body.
```

**102. `SpecialtyAspectsService.constructor`** — depth 2 · orphan-root

```text
🚀 SpecialtyAspectsService.constructor(…): SpecialtyAspectsService [projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:41]
  └─> AspectsUtilitiesService.getIsAspect(aspectsToDetect: Aspect[]): (args: LongitudesWindow) => AspectPhase | null [projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:307]
     ↳ Returns a phase detector for the aspects, reading three minutes; conjunctions and oppositions are perfective on a…
```

**103. `TripleAspectsService.findBodiesWithAspectTo`** — depth 2 · orphan-root

```text
🚀 TripleAspectsService.findBodiesWithAspectTo(body: Body, aspectType: Aspect, edges: AspectBodies[]): Body[] [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects.service.ts:36]
   ↳ Backward-compatible static utility retained for existing unit tests.
  └─> TripleAspectsService.map(…)(…): "lunar apogee" | "lunar perigee" | "north lunar node" | "south lunar node" | "ceres" | "chiron" | "juno" | "lilith" | "pallas" | "vesta" | "jupiter" | "mars" | "mercury" | "moon" | ... 5 more ... | "venus" [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects.service.ts:47]
```

**104. `TripleAspectsService.groupAspectsByType`** — depth ≥ 2 · orphan-root

```text
🚀 TripleAspectsService.groupAspectsByType<T extends AspectBodies>(edges: T[]): Map<Aspect, T[]> [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects.service.ts:55]
   ↳ Backward-compatible static utility retained for existing unit tests.
  └─> TripleAspectsService.groupByToMap(…)(…): "biquintile" | "decile" | "novile" | "quintile" | "septile" | "tredecile" | "undecile" | "quincunx" | "semisextile" | "semisquare" | "sesquiquadrate" | "conjunct" | "opposite" | "sextile" | "square" | "trine" [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects.service.ts:58]
```

**105. `TripleAspectsService.haveAspect`** — depth 2 · orphan-root

```text
🚀 TripleAspectsService.haveAspect(…): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects.service.ts:64]
   ↳ Backward-compatible static utility retained for existing unit tests.
  └─> TripleAspectsService.some(…)(edge: AspectBodies): boolean [projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects.service.ts:72]
```

**106. `MinorAspectsComposerService.assembleMinorAspectEvent`** — depth 2 · orphan-root

```text
🚀 MinorAspectsComposerService.assembleMinorAspectEvent(args: AssembleMinorAspectEventArguments): DetectedCalendarEvent [projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:60]
   ↳ Assembles minor aspect event.
  └─> bodyDisplayName(body: string): string [projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:153]
     ↳ Names a body as every summary, description, and tag does, via lodash start case; invert with {@link…
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `TwilightsDetectorService.buildTwilightTransitionEvents` | 12 | `TwilightsDetectorService.isAstronomicalDawn`, `TwilightsBuilderService.buildAstronomicalDawnEvent`, `TwilightsDetectorService.isNauticalDawn`, `TwilightsBuilderService.buildNauticalDawnEvent`, `TwilightsDetectorService.isCivilDawn`, `TwilightsBuilderService.buildCivilDawnEvent`, `TwilightsDetectorService.isCivilDusk`, `TwilightsBuilderService.buildCivilDuskEvent`, `TwilightsDetectorService.isNauticalDusk`, `TwilightsBuilderService.buildNauticalDuskEvent`, `TwilightsDetectorService.isAstronomicalDusk`, `TwilightsBuilderService.buildAstronomicalDuskEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-detector.service.ts:41` |
| `DailyCyclesService.getDailyLunarCycleEvents` | 10 | `DailyCyclesBuilderService.getElevationWindow`, `DailyCyclesBuilderService.getHorizonClearanceWindow`, `DailyCyclesBuilderService.isRise`, `DailyCyclesBuilderService.buildMoonriseEvent`, `MathService.isMaximum`, `DailyCyclesBuilderService.buildLunarZenithEvent`, `DailyCyclesBuilderService.isSet`, `DailyCyclesBuilderService.buildMoonsetEvent`, `MathService.isMinimum`, `DailyCyclesBuilderService.buildLunarNadirEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:155` |
| `DailyCyclesService.getDailySolarCycleEvents` | 10 | `DailyCyclesBuilderService.getElevationWindow`, `DailyCyclesBuilderService.getHorizonClearanceWindow`, `DailyCyclesBuilderService.isRise`, `DailyCyclesBuilderService.buildSunriseEvent`, `MathService.isMaximum`, `DailyCyclesBuilderService.buildSolarZenithEvent`, `DailyCyclesBuilderService.isSet`, `DailyCyclesBuilderService.buildSunsetEvent`, `MathService.isMinimum`, `DailyCyclesBuilderService.buildSolarNadirEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:200` |

<details>
<summary>647 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `EphemerisService.getCoordinateEphemerisByBody` | 9 | `EphemerisConstantsService.isNode`, `EphemerisService.getConstantsService`, `EphemerisCoordinateService.computeNodeBodyMinutes`, `EphemerisService.getCoordinateService`, `EphemerisTimeService.generateMinutes`, `EphemerisService.getTimeService`, `EphemerisTimeService.dateToJulianDays`, `EphemerisCoordinateService.computeBodyCoordinate`, `typedFromEntries` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:191` |
| `EclipseTopocentricService.getTopocentricEvents` | 9 | `EclipseTopocentricService.isInProgressGeocentrically(…)`, `EclipseTopocentricService.isInProgressGeocentrically`, `EclipseTopocentricService.isInProgressGeocentrically(…)`, `EclipseGeometryService.getAllTopocentricSamples`, `EclipseTopocentricService.getSolarTopocentricPhases`, `EclipseTopocentricService.continueSolarOccurrence`, `EclipseTopocentricService.getLunarTopocentricPhases`, `EclipseTopocentricService.map(…)`, `EclipseTopocentricService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:342` |
| `CaelundasCommand.run` | 9 | `EphemerisService.verifyFiles`, `InputService.parse`, `PerfectiveService.detect`, `ProgressiveService.detect`, `CaelundasCommand.toSorted(…)`, `CalendarEventsService.upsert`, `CalendarEventsService.findInRange`, `CalendarService.write`, `CalendarService.writeJson` | `projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.command.ts:55` |
| `AnnualSolarCycleEventsService.getAutumnEvents` | 8 | `AnnualSolarCycleEventsService.isAutumnalEquinox`, `AnnualSolarCycleEventsService.buildAutumnalEquinoxEvent`, `AnnualSolarCycleEventsService.isNinthHexadecan`, `AnnualSolarCycleEventsService.buildNinthHexadecanEvent`, `AnnualSolarCycleEventsService.isSamhain`, `AnnualSolarCycleEventsService.buildSamhainEvent`, `AnnualSolarCycleEventsService.isEleventhHexadecan`, `AnnualSolarCycleEventsService.buildEleventhHexadecanEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:60` |
| `AnnualSolarCycleEventsService.getSpringEvents` | 8 | `AnnualSolarCycleEventsService.isVernalEquinox`, `AnnualSolarCycleEventsService.buildVernalEquinoxEvent`, `AnnualSolarCycleEventsService.isFirstHexadecan`, `AnnualSolarCycleEventsService.buildFirstHexadecanEvent`, `AnnualSolarCycleEventsService.isBeltane`, `AnnualSolarCycleEventsService.buildBeltaneEvent`, `AnnualSolarCycleEventsService.isThirdHexadecan`, `AnnualSolarCycleEventsService.buildThirdHexadecanEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:81` |
| `AnnualSolarCycleEventsService.getSummerEvents` | 8 | `AnnualSolarCycleEventsService.isSummerSolstice`, `AnnualSolarCycleEventsService.buildSummerSolsticeEvent`, `AnnualSolarCycleEventsService.isFifthHexadecan`, `AnnualSolarCycleEventsService.buildFifthHexadecanEvent`, `AnnualSolarCycleEventsService.isLammas`, `AnnualSolarCycleEventsService.buildLammasEvent`, `AnnualSolarCycleEventsService.isSeventhHexadecan`, `AnnualSolarCycleEventsService.buildSeventhHexadecanEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:102` |
| `AnnualSolarCycleEventsService.getWinterEvents` | 8 | `AnnualSolarCycleEventsService.isWinterSolstice`, `AnnualSolarCycleEventsService.buildWinterSolsticeEvent`, `AnnualSolarCycleEventsService.isThirteenthHexadecan`, `AnnualSolarCycleEventsService.buildThirteenthHexadecanEvent`, `AnnualSolarCycleEventsService.isImbolc`, `AnnualSolarCycleEventsService.buildImbolcEvent`, `AnnualSolarCycleEventsService.isFifteenthHexadecan`, `AnnualSolarCycleEventsService.buildFifteenthHexadecanEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:123` |
| `PerfectiveService.detectOrbitalEvents` | 8 | `RetrogradesService.detect`, `IngressesService.detect`, `MonthlyLunarCycleService.detect`, `MonthlyLunarCycleService.detectApsides`, `AnnualSolarCycleService.detect`, `PhasesService.getMartianPhaseEvents`, `PhasesService.getMercurianPhaseEvents`, `PhasesService.getVenusianPhaseEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/perfective.service.ts:171` |
| `ProgressiveService.detect` | 8 | `AspectsService.detectProgressive`, `RetrogradesService.detectProgressive`, `EclipsesService.detectProgressive`, `IngressesService.detectProgressive`, `MonthlyLunarCycleService.detectProgressive`, `TwilightsService.detectProgressive`, `PhasesService.detectProgressive`, `AnnualSolarCycleService.detectProgressive` | `projects/caelundas/caelundas-cli/src/modules/progressive/progressive.service.ts:47` |
| `CalendarEventsService.transaction(…)` | 7 | `TagsService.resolve`, `CalendarEventsService.flatMap(…)`, `CalendarEventsService.writeRows`, `CalendarEventsService.map(…)`, `CalendarEventsService.replaceTagLinks`, `CalendarEventsService.toTagLinks`, `CaelundasDatabaseService.refreshReadModel` | `projects/caelundas/caelundas-cli/src/modules/calendar-events/calendar-events.service.ts:338` |
| `PhasesService.detectProgressive` | 7 | `PhasesService.filter(…)`, `PhasesService.filter(…)`, `VenusianPhaseService.getVenusianPhaseProgressiveEvents`, `PhasesService.filter(…)`, `MercurianPhaseService.getMercurianPhaseProgressiveEvents`, `PhasesService.filter(…)`, `MartianPhaseService.getMartianPhaseProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/phases.service.ts:87` |
| `classifyEvent` | 6 | `flatMap(…)`, `pruneAncestorPaths`, `flatMap(…)`, `ingressPaths`, `eclipsePaths`, `isInstant` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.utilities.ts:16` |
| `dignityPaths` | 6 | `find(…)`, `map(…)`, `find(…)`, `map(…)`, `isSign`, `find(…)` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.utilities.ts:49` |
| `AspectsService.detectCompositeAspects` | 6 | `QuadrupleAspectsService.detect`, `QuintupleAspectsService.detect`, `SextupleAspectsService.detect`, `StelliumService.detect`, `TripleAspectsService.detect`, `AspectsService.compoundEventKey` | `projects/caelundas/caelundas-cli/src/modules/aspects/aspects.service.ts:81` |
| `EclipseClassificationService.getSolarEclipseType` | 6 | `EclipseClassificationService.isInProgress(…)`, `EclipseClassificationService.isInProgress`, `EclipseClassificationService.getClosestApproach(…)`, `EclipseClassificationService.getClosestApproach`, `EclipseClassificationService.getGamma`, `EclipseClassificationService.getUmbralRadius` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-classification.service.ts:192` |
| `EclipseCalculationService.getGeocentricEvents` | 6 | `EclipseCalculationService.getSolarEclipsePhases`, `EclipseCalculationService.getLunarEclipsePhases`, `EclipseCalculationService.continueOccurrence`, `EclipseClassificationService.getSolarEclipseType`, `EclipseClassificationService.getLunarEclipseType`, `EclipseCalculationService.buildGeocentricEclipseEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-calculation.service.ts:171` |
| `RetrogradesService.detectBodyStations` | 6 | `EphemerisService.getCoordinateFromEphemeris`, `RetrogradesService.getPreviousLongitudes`, `RetrogradesService.getNextLongitudes`, `RetrogradesService.isRetrograde`, `RetrogradesService.buildRetrogradeEvent`, `RetrogradesService.isDirect` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:59` |
| `RetrogradesService.detectProgressive` | 6 | `RetrogradesService.filter(…)`, `bodyDisplayName`, `RetrogradesService.filter(…)`, `RetrogradesService.filter(…)`, `ProgressiveUtilitiesService.pairProgressiveEvents`, `RetrogradesService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:276` |
| `buildNightSkyRows` | 6 | `parseStarCatalog`, `traceConstellationLines`, `indexStars`, `flatMap(…)`, `parseConstellations`, `filter(…)` | `projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:36` |
| `EphemerisAggregationService.processNonNodeBodyMinute` | 5 | `EphemerisTimeService.dateToJulianDays`, `EphemerisCoordinateService.getBodyCoordinatesWithDistance`, `EphemerisConstantsService.isHorizonBody`, `EphemerisHorizonService.computeAzimuthElevationForMinute`, `EphemerisPhenomenaService.computePhenoForMinute` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/aggregation/ephemeris-aggregation.service.ts:102` |
| `EphemerisService.computeAllEphemerides` | 5 | `EphemerisService.getAggregationService`, `EphemerisAggregationService.buildEphemerisFeatureSets`, `EphemerisAggregationService.buildEphemerisEntries`, `EphemerisAggregationService.accumulateBodyEphemeris`, `EphemerisAggregationService.entriesToEphemerides` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:98` |
| `ProgressiveAspectService.buildProgressiveAspectEvents` | 5 | `ProgressiveAspectService.filter(…)`, `ProgressiveAspectService.groupBy(…)`, `ProgressiveAspectService.filter(…)`, `ProgressiveAspectService.filter(…)`, `ProgressiveAspectService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:61` |
| `AnnualSolarCycleService.detectProgressive` | 5 | `AnnualSolarCycleService.filter(…)`, `AnnualSolarCycleService.filter(…)`, `AnnualSolarCycleService.filter(…)`, `AnnualSolarCycleService.getAdvancingProgressiveEvents`, `AnnualSolarCycleService.getRetreatingProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle.service.ts:165` |
| `EclipseEventService.getProgressiveEventsForFrame` | 5 | `EclipseEventService.filter(…)`, `EclipseEventService.filter(…)`, `EclipseEventService.filter(…)`, `ProgressiveUtilitiesService.pairProgressiveEvents`, `EclipseEventService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipse-event.service.ts:118` |
| `EclipseClassificationService.getLunarEclipseType` | 5 | `EclipseClassificationService.isInProgress(…)`, `EclipseClassificationService.isInProgress`, `EclipseClassificationService.getClosestApproach(…)`, `EclipseClassificationService.getClosestApproach`, `EclipseGeometryService.getDiscAngles` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-classification.service.ts:153` |
| `MartianPhaseService.detectMartianPhases` | 5 | `PhaseCalculationService.isMorningRise`, `PhaseCalculationService.isMorningSet`, `PhaseCalculationService.isEveningRise`, `PhaseCalculationService.isEveningSet`, `MartianPhaseService.buildMartianPhaseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/martian/martian-phase.service.ts:60` |
| `MercurianPhaseService.detectMercurianEveningPhases` | 5 | `PhaseCalculationService.isEveningRise`, `PhaseCalculationService.isEasternElongation`, `PhaseCalculationService.isEasternBrightest`, `PhaseCalculationService.isEveningSet`, `MercurianPhaseService.buildMercurianPhaseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/mercurian/mercurian-phase.service.ts:60` |
| `MercurianPhaseService.detectMercurianMorningPhases` | 5 | `PhaseCalculationService.isMorningRise`, `PhaseCalculationService.isWesternBrightest`, `PhaseCalculationService.isWesternElongation`, `PhaseCalculationService.isMorningSet`, `MercurianPhaseService.buildMercurianPhaseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/mercurian/mercurian-phase.service.ts:90` |
| `VenusianPhaseService.detectVenusianEveningPhases` | 5 | `PhaseCalculationService.isEveningRise`, `PhaseCalculationService.isEasternElongation`, `PhaseCalculationService.isEasternBrightest`, `PhaseCalculationService.isEveningSet`, `VenusianPhaseService.buildVenusianPhaseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/venusian/venusian-phase.service.ts:60` |
| `VenusianPhaseService.detectVenusianMorningPhases` | 5 | `PhaseCalculationService.isMorningRise`, `PhaseCalculationService.isWesternBrightest`, `PhaseCalculationService.isWesternElongation`, `PhaseCalculationService.isMorningSet`, `VenusianPhaseService.buildVenusianPhaseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/venusian/venusian-phase.service.ts:88` |
| `TwilightsService.detectProgressive` | 5 | `TwilightsService.filter(…)`, `TwilightsService.getEventsByTag`, `TwilightsComposerService.buildDawnProgressiveEvents`, `TwilightsComposerService.buildDuskProgressiveEvents`, `TwilightsComposerService.pairAndBuild` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:141` |
| `SextupleAspectsService.composeHexagrams` | 5 | `SextupleAspectsComposerService.groupAspectsByType`, `SextupleAspectsService.pruneHexagramCandidates`, `SextupleAspectsComposerService.collectTrineBodies`, `SextupleAspectsService.processHexagramCombinations`, `MathService.getCombinations` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects.service.ts:36` |
| `StelliumService.composeStelliums` | 5 | `StelliumService.findStelliumsByKey`, `StelliumService.map(…)`, `StelliumService.missingFrom`, `StelliumService.map(…)`, `StelliumService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:81` |
| `StelliumService.extendCliques` | 5 | `StelliumService.maxBy(…)`, `StelliumService.neighborsOf`, `StelliumService.filter(…)`, `StelliumService.filter(…)`, `StelliumService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:144` |
| `TripleAspectsDetectorService.composeGrandTrines` | 5 | `AspectGraphService.unionAspectBodies`, `TripleAspectsDetectorService.groupAspectsByType`, `AspectGraphService.canonicalBodyOrder`, `TripleAspectsDetectorService.getUniqueBodyTriplets`, `TripleAspectsDetectorService.checkGrandTrineTriplet` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:331` |
| `TripleAspectsDetectorService.composeTSquares` | 5 | `AspectGraphService.unionAspectBodies`, `TripleAspectsDetectorService.groupAspectsByType`, `TripleAspectsDetectorService.canonicalPair`, `TripleAspectsComposerService.findBodiesWithAspectTo`, `TripleAspectsDetectorService.checkTSquareFocalBody` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:377` |
| `TripleAspectsDetectorService.composeYods` | 5 | `AspectGraphService.unionAspectBodies`, `TripleAspectsDetectorService.groupAspectsByType`, `TripleAspectsDetectorService.canonicalPair`, `TripleAspectsComposerService.findBodiesWithAspectTo`, `TripleAspectsDetectorService.checkYodApexBody` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:432` |
| `EphemerisPhenomenaService.computeIlluminationForBody` | 4 | `EphemerisConstantsService.getSwissEphemerisConstantForBody`, `EphemerisTimeService.generateMinutes`, `EphemerisTimeService.dateToJulianDays`, `assertSwissEphemerisResult` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/phenomena/ephemeris-phenomena.service.ts:46` |
| `EphemerisAggregationService.accumulateBodyEphemeris` | 4 | `EphemerisConstantsService.isNode`, `EphemerisCoordinateService.computeNodeBodyMinutes`, `EphemerisConstantsService.getSwissEphemerisConstantForBody`, `EphemerisAggregationService.computeNonNodeBodyMinutes` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/aggregation/ephemeris-aggregation.service.ts:156` |
| `ProgressiveAspectService.buildAspectGroupKeyFromTags` | 4 | `ProgressiveAspectService.map(…)`, `ProgressiveAspectService.map(…)`, `ProgressiveAspectService.filter(…)`, `ProgressiveAspectService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:34` |
| `ProgressiveAspectService.extractTypedAspectParts` | 4 | `ProgressiveAspectService.map(…)`, `ProgressiveAspectService.map(…)`, `ProgressiveAspectService.filter(…)`, `ProgressiveAspectService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:223` |
| `flatMap(…)` | 4 | `one`, `mapEach(…)`, `mapEach`, `map(…)` | `projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:22` |
| `pruneAncestorPaths` | 4 | `map(…)`, `map(…)`, `toSorted(…)`, `filter(…)` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.utilities.ts:149` |
| `CalendarEventsService.findInRange` | 4 | `CalendarEventsService.formatCoordinate`, `CalendarEventsService.findTagNames`, `CalendarEventsService.map(…)`, `CalendarEventsService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/calendar-events/calendar-events.service.ts:204` |
| `CalendarEventsService.upsert` | 4 | `CalendarEventsService.tidyText`, `CalendarEventsService.calendarEventKey`, `classifyEvent`, `CalendarEventsService.transaction(…)` | `projects/caelundas/caelundas-cli/src/modules/calendar-events/calendar-events.service.ts:313` |
| `CalendarService.buildTimezoneContent` | 4 | `CalendarService.flatMap(…)`, `CalendarService.buildObservance`, `CalendarService.map(…)`, `CalendarService.findTransitions` | `projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:77` |
| `AnnualSolarCycleService.getSolarApsisEvents` | 4 | `AnnualSolarCycleService.getSolarDistanceSpeeds`, `AnnualSolarCycleService.getNearestApsisMinute`, `AnnualSolarCycleEventsService.buildAphelionEvent`, `AnnualSolarCycleEventsService.buildPerihelionEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle.service.ts:220` |
| `EclipseTopocentricService.getClosestVisibleApproach` | 4 | `EclipseGeometryService.getTopocentricSample`, `EclipseGeometryService.getTopocentricSolarContactGeometry`, `EclipseTopocentricService.getVisibilityMargin`, `EclipseTopocentricService.getClosestApproach` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:163` |
| `EclipseTopocentricService.getSolarTopocentricPhases` | 4 | `EclipseGeometryService.getTopocentricSolarContactGeometry`, `EclipseTopocentricService.getVisiblePhases`, `EclipseTopocentricService.getVisibilityMargin`, `MathService.isMinimum` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:303` |
| `EclipseCalculationService.getContactPhases` | 4 | `MathService.crossesUpwardNearCurrent`, `EclipseCalculationService.values(…)`, `EclipseCalculationService.values`, `EclipseCalculationService.values(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-calculation.service.ts:116` |
| `EclipseCalculationService.getSolarEclipsePhases` | 4 | `EclipseGeometryService.getSolarContactGeometry`, `MathService.isMinimum`, `EclipseClassificationService.getSolarGamma`, `EclipseCalculationService.getContactPhases` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-calculation.service.ts:250` |
| `IngressesComposerService.buildDecanIngressEventObject` | 4 | `IngressesComposerService.getSign`, `IngressesComposerService.resolveDecan`, `bodyDisplayName`, `capitalize` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:110` |
| `IngressesService.getDecanIngressEvents` | 4 | `IngressesComposerService.getLongitudes`, `IngressesComposerService.isSignIngress`, `IngressesComposerService.isDecanIngress`, `IngressesComposerService.buildDecanIngressEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:178` |
| `PerfectiveService.detectDayEvents` | 4 | `EphemerisService.getEphemerides`, `AspectsService.seed`, `DatetimeService.generateMinutes`, `PerfectiveService.detectMinuteEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/perfective.service.ts:62` |
| `QuadrupleAspectsBaseService.checkGrandCrossPattern` | 4 | `QuadrupleAspectsBaseService.groupAspectsByType`, `QuadrupleAspectsBaseService.haveAspect`, `QuadrupleAspectsBaseService.buildGrandCrossOppositeMap`, `QuadrupleAspectsBaseService.verifyGrandCrossSquares` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:98` |
| `QuadrupleAspectsComposerService.composeKites` | 4 | `AspectGraphService.unionAspectBodies`, `QuadrupleAspectsBaseService.groupAspectsByType`, `QuadrupleAspectsBaseService.findGrandTrines`, `QuadrupleAspectsComposerService.collectKiteEventsForGrandTrine` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-composer.service.ts:181` |
| `QuadrupleAspectsComposerService.tryBuildGrandCross` | 4 | `AspectGraphService.canonicalBodyOrder`, `QuadrupleAspectsBaseService.buildGrandCrossOppositeMap`, `QuadrupleAspectsBaseService.verifyGrandCrossSquares`, `QuadrupleAspectsComposerService.resolveGrandCrossEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-composer.service.ts:329` |
| `QuadrupleAspectsComposerService.tryBuildKite` | 4 | `QuadrupleAspectsComposerService.involvesBody`, `QuadrupleAspectsBaseService.getOtherBody`, `QuadrupleAspectsBaseService.haveAspect`, `QuadrupleAspectsComposerService.resolveKiteEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-composer.service.ts:375` |
| `QuintupleAspectsComposerService.composePentagrams` | 4 | `QuintupleAspectsComposerService.groupAspectsByType`, `QuintupleAspectsComposerService.collectQuintileBodies`, `QuintupleAspectsComposerService.processPentagramCombinations`, `MathService.getCombinations` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:208` |
| `SextupleAspectsComposerService.tryArrangementForPair` | 4 | `SextupleAspectsComposerService.find(…)`, `SextupleAspectsComposerService.find(…)`, `SextupleAspectsComposerService.filter(…)`, `SextupleAspectsComposerService.checkHexagonSextiles` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:414` |
| `StelliumService.findStelliumCliques` | 4 | `StelliumService.buildConjunctionNeighbors`, `StelliumService.extendCliques`, `StelliumService.map(…)`, `StelliumService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:182` |
| `StelliumService.findStelliumsByKey` | 4 | `StelliumService.groupAspectsByType`, `AspectGraphService.unionAspectBodies`, `StelliumService.map(…)`, `StelliumService.findStelliumCliques` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:200` |
| `StelliumService.detectProgressive` | 4 | `StelliumService.filter(…)`, `StelliumService.groupBy(…)`, `ProgressiveUtilitiesService.pairCompoundBoundaries`, `StelliumService.buildProgressiveStelliumEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:276` |
| `TripleAspectsComposerService.buildProgressiveBodiesMeta` | 4 | `TripleAspectsComposerService.map(…)`, `TripleAspectsComposerService.filter(…)`, `TripleAspectsComposerService.resolveAspectType`, `TripleAspectsComposerService.resolveProgressiveMeta` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:54` |
| `findStar` | 4 | `toBand`, `flatMap(…)`, `toSorted(…)`, `map(…)` | `projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:54` |
| `MinorAspectsComposerService.processAspectGroup` | 4 | `MinorAspectsComposerService.filter(…)`, `MinorAspectsComposerService.filter(…)`, `ProgressiveUtilitiesService.pairProgressiveEvents`, `MinorAspectsComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:217` |
| `EphemerisCoordinateService.computeDistanceForBody` | 3 | `EphemerisTimeService.generateMinutes`, `EphemerisTimeService.dateToJulianDays`, `EphemerisCoordinateService.computeBodyCoordinates` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:152` |
| `EphemerisCoordinateService.computeNodeBodyMinutes` | 3 | `EphemerisTimeService.generateMinutes`, `EphemerisTimeService.dateToJulianDays`, `EphemerisCoordinateService.computeNodeCoordinate` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:176` |
| `EphemerisHorizonService.computeAzimuthElevationForBody` | 3 | `EphemerisTimeService.generateMinutes`, `EphemerisTimeService.dateToJulianDays`, `EphemerisHorizonService.computeAzimuthElevationForMinute` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/horizon/ephemeris-horizon.service.ts:43` |
| `EphemerisService.getAzimuthElevationEphemerisByBody` | 3 | `EphemerisHorizonService.computeAzimuthElevationForBody`, `EphemerisService.getHorizonService`, `typedFromEntries` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:147` |
| `EphemerisService.getDistanceEphemerisByBody` | 3 | `EphemerisCoordinateService.computeDistanceForBody`, `EphemerisService.getCoordinateService`, `typedFromEntries` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:249` |
| `EphemerisService.getIlluminationEphemerisByBody` | 3 | `EphemerisPhenomenaService.computeIlluminationForBody`, `EphemerisService.getPhenomenaService`, `typedFromEntries` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:331` |
| `ProgressiveUtilitiesService.pairCompoundBoundaries` | 3 | `ProgressiveUtilitiesService.filter(…)`, `ProgressiveUtilitiesService.pairProgressiveEvents`, `ProgressiveUtilitiesService.boundariesFor` | `projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:73` |
| `MajorAspectsService.detectAspectForBodyPair` | 3 | `MajorAspectsService.getLongitudesWindowForBody`, `MajorAspectsService.detectPhaseFromWindows`, `MajorAspectsService.buildMajorAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:63` |
| `TagsService.resolve` | 3 | `TagsService.map(…)`, `tagPathKey`, `TagsService.ensurePath` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.service.ts:63` |
| `CalendarService.buildEventContent` | 3 | `CalendarService.generateUid`, `CalendarService.formatEventTime`, `CalendarService.buildEventProperties` | `projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:209` |
| `CalendarService.buildFileContent` | 3 | `CalendarService.buildTimezoneContent`, `CalendarService.map(…)`, `CalendarService.toContentLines` | `projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:230` |
| `AspectsService.detectSimpleAspects` | 3 | `MajorAspectsService.detect`, `MinorAspectsService.detect`, `SpecialtyAspectsService.detect` | `projects/caelundas/caelundas-cli/src/modules/aspects/aspects.service.ts:104` |
| `AspectsService.parseSimpleAspectEvent` | 3 | `AspectsService.map(…)`, `AspectsService.extractEventBodies`, `AspectsService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/aspects.service.ts:142` |
| `AspectsService.computeAspectBodies` | 3 | `AspectsService.map(…)`, `AspectsService.map(…)`, `AspectsService.applyEventToMap` | `projects/caelundas/caelundas-cli/src/modules/aspects/aspects.service.ts:171` |
| `AspectsService.detect` | 3 | `AspectsService.detectSimpleAspects`, `AspectsService.computeAspectBodies`, `AspectsService.detectCompositeAspects` | `projects/caelundas/caelundas-cli/src/modules/aspects/aspects.service.ts:192` |
| `AspectsService.flatMap(…)` | 3 | `MajorAspectsService.detectActive`, `MinorAspectsService.detectActive`, `SpecialtyAspectsService.detectActive` | `projects/caelundas/caelundas-cli/src/modules/aspects/aspects.service.ts:247` |
| `AnnualSolarCycleService.getAnnualSolarCycleEvents` | 3 | `EphemerisService.getCoordinateFromEphemeris`, `AnnualSolarCycleEventsService.getVernalToAutumnalEvents`, `AnnualSolarCycleEventsService.getAutumnalToVernalEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle.service.ts:185` |
| `EclipseGeometryService.getLunarContactGeometry` | 3 | `EclipseGeometryService.getDiscAngles`, `EclipseGeometryService.getAngularSeparation`, `EclipseGeometryService.getAntisolarPoint` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:270` |
| `EclipseGeometryService.getSolarContactGeometry` | 3 | `EclipseGeometryService.getDiscAngles`, `EclipseGeometryService.getAngularSeparation`, `EclipseGeometryService.getSunPosition` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:296` |
| `EclipseCalculationService.getLunarEclipsePhases` | 3 | `EclipseGeometryService.getLunarContactGeometry`, `MathService.isMinimum`, `EclipseCalculationService.getContactPhases` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-calculation.service.ts:227` |
| `EclipsesService.detect` | 3 | `EclipseCalculationService.getAllEclipseCoordinates`, `EclipseCalculationService.getGeocentricEvents`, `EclipseCalculationService.getTopocentricEventsForDetect` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipses.service.ts:72` |
| `IngressesComposerService.buildPeakIngressEvent` | 3 | `IngressesComposerService.getSign`, `bodyDisplayName`, `capitalize` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:141` |
| `IngressesComposerService.extractSignAndBodyFromTags` | 3 | `IngressesComposerService.find(…)`, `bodyFromDisplayName`, `isSign` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:242` |
| `IngressesService.detect` | 3 | `IngressesService.getSignIngressEvents`, `IngressesService.getDecanIngressEvents`, `IngressesService.getPeakIngressEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:123` |
| `IngressesService.detectProgressive` | 3 | `IngressesComposerService.filterSignIngressEvents`, `IngressesComposerService.groupSignIngressEventsByBody`, `IngressesComposerService.buildProgressiveSpansForBody` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:142` |
| `IngressesService.getPeakIngressEvents` | 3 | `IngressesComposerService.getLongitudes`, `IngressesComposerService.isPeakIngress`, `IngressesComposerService.buildPeakIngressEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:232` |
| `IngressesService.getSignIngressEvents` | 3 | `IngressesComposerService.getLongitudes`, `IngressesComposerService.isSignIngress`, `IngressesComposerService.buildSignIngressEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:282` |
| `LunarApsidesService.detect` | 3 | `LunarApsidesService.getRadialSpeed`, `LunarApsidesService.isApsis`, `LunarApsidesService.buildApsisEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/lunar-apsides.service.ts:125` |
| `MonthlyLunarCycleService.extractLunarPhaseFromTags` | 3 | `MonthlyLunarCycleService.map(…)`, `MonthlyLunarCycleService.find(…)`, `isLunarPhase` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service.ts:50` |
| `MonthlyLunarCycleService.detectProgressive` | 3 | `MonthlyLunarCycleService.filter(…)`, `MonthlyLunarCycleService.sortBy(…)`, `MonthlyLunarCycleService.getMonthlyLunarCycleProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service.ts:235` |
| `PhaseCalculationService.gatherCurrentEphemeris` | 3 | `PhaseCalculationService.gatherPositions`, `EphemerisService.getMagnitudeFromEphemeris`, `EphemerisService.getPhaseAngleFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:112` |
| `PhaseCalculationService.gatherPhaseParameters` | 3 | `PhaseCalculationService.gatherCurrentEphemeris`, `PhaseCalculationService.gatherMarginEphemeris`, `PhaseCalculationService.gatherPositions` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:181` |
| `MartianPhaseService.getMartianEveningProgressiveEvents` | 3 | `ProgressiveUtilitiesService.pairProgressiveEvents`, `PhaseCalculationService.filterByTag`, `MartianPhaseService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/martian/martian-phase.service.ts:150` |
| `MartianPhaseService.getMartianMorningProgressiveEvents` | 3 | `ProgressiveUtilitiesService.pairProgressiveEvents`, `PhaseCalculationService.filterByTag`, `MartianPhaseService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/martian/martian-phase.service.ts:166` |
| `MercurianPhaseService.getMercurianEveningProgressiveEvents` | 3 | `ProgressiveUtilitiesService.pairProgressiveEvents`, `PhaseCalculationService.filterByTag`, `MercurianPhaseService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/mercurian/mercurian-phase.service.ts:156` |
| `MercurianPhaseService.getMercurianMorningProgressiveEvents` | 3 | `ProgressiveUtilitiesService.pairProgressiveEvents`, `PhaseCalculationService.filterByTag`, `MercurianPhaseService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/mercurian/mercurian-phase.service.ts:172` |
| `MercurianPhaseService.getMercurianPhaseEvents` | 3 | `PhaseCalculationService.gatherPhaseParameters`, `MercurianPhaseService.detectMercurianMorningPhases`, `MercurianPhaseService.detectMercurianEveningPhases` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/mercurian/mercurian-phase.service.ts:188` |
| `VenusianPhaseService.getVenusianEveningProgressiveEvents` | 3 | `ProgressiveUtilitiesService.pairProgressiveEvents`, `PhaseCalculationService.filterByTag`, `VenusianPhaseService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/venusian/venusian-phase.service.ts:167` |
| `VenusianPhaseService.getVenusianMorningProgressiveEvents` | 3 | `ProgressiveUtilitiesService.pairProgressiveEvents`, `PhaseCalculationService.filterByTag`, `VenusianPhaseService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/venusian/venusian-phase.service.ts:183` |
| `VenusianPhaseService.getVenusianPhaseEvents` | 3 | `PhaseCalculationService.gatherPhaseParameters`, `VenusianPhaseService.detectVenusianMorningPhases`, `VenusianPhaseService.detectVenusianEveningPhases` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/venusian/venusian-phase.service.ts:199` |
| `PhasesService.detect` | 3 | `PhasesService.getMartianPhaseEvents`, `PhasesService.getMercurianPhaseEvents`, `PhasesService.getVenusianPhaseEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/phases.service.ts:51` |
| `PerfectiveService.detectMinuteEvents` | 3 | `AspectsService.detect`, `PerfectiveService.detectObservationalEvents`, `PerfectiveService.detectOrbitalEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/perfective.service.ts:109` |
| `PerfectiveService.detectObservationalEvents` | 3 | `EclipsesService.detect`, `DailyCyclesService.detect`, `TwilightsService.detect` | `projects/caelundas/caelundas-cli/src/modules/perfective/perfective.service.ts:132` |
| `MinorAspectsService.detectBodyPairAspect` | 3 | `MinorAspectsEventService.getLongitudesWindowForBody`, `MinorAspectsService.detectPhaseFromWindows`, `MinorAspectsService.buildMinorAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:64` |
| `QuadrupleAspectsBaseService.getQuadrupleAspectEvent` | 3 | `bodyDisplayName`, `QuadrupleAspectsBaseService.buildQuadrupleAspectDescription`, `QuadrupleAspectsBaseService.makeQuadrupleAspectTags` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:279` |
| `QuadrupleAspectsComposerService.collectProgressiveEventsFromGroup` | 3 | `QuadrupleAspectsBaseService.makeProgressiveGroupKey`, `ProgressiveUtilitiesService.pairCompoundBoundaries`, `QuadrupleAspectsBaseService.buildProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-composer.service.ts:114` |
| `QuadrupleAspectsComposerService.composeGrandCrosses` | 3 | `AspectGraphService.unionAspectBodies`, `QuadrupleAspectsBaseService.groupAspectsByType`, `QuadrupleAspectsComposerService.collectGrandCrossesForOpp1` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-composer.service.ts:141` |
| `QuadrupleAspectsService.detectProgressive` | 3 | `QuadrupleAspectsService.filter(…)`, `QuadrupleAspectsService.groupBy(…)`, `QuadrupleAspectsComposerService.collectProgressiveEventsFromGroup` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects.service.ts:59` |
| `QuintupleAspectsComposerService.findPentagramPattern` | 3 | `QuintupleAspectsComposerService.buildQuintileConnections`, `QuintupleAspectsComposerService.traversePentagramPath`, `QuintupleAspectsComposerService.countUniqueQuintilePairs` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:251` |
| `QuintupleAspectsComposerService.getQuintupleAspectEvent` | 3 | `QuintupleAspectsComposerService.map(…)`, `QuintupleAspectsComposerService.map(…)`, `QuintupleAspectsComposerService.buildQuintupleEventFromParameters` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:274` |
| `QuintupleAspectsComposerService.processPentagramCombinations` | 3 | `QuintupleAspectsComposerService.findPentagramPattern`, `AspectCalculationSupportService.determineCompoundPhaseFromSnapshots`, `QuintupleAspectsComposerService.buildPentagramEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:335` |
| `QuintupleAspectsService.detectProgressive` | 3 | `QuintupleAspectsComposerService.groupQuintupleEventsByKey`, `ProgressiveUtilitiesService.pairCompoundBoundaries`, `QuintupleAspectsComposerService.buildProgressiveQuintupleEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects.service.ts:50` |
| `SextupleAspectsComposerService.buildAspectConnectionMaps` | 3 | `SextupleAspectsComposerService.map(…)`, `SextupleAspectsComposerService.map(…)`, `SextupleAspectsComposerService.addConnection` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:64` |
| `SextupleAspectsComposerService.findHexagramPattern` | 3 | `SextupleAspectsComposerService.buildAspectConnectionMaps`, `SextupleAspectsComposerService.findGrandTrinePairs`, `SextupleAspectsComposerService.findValidHexagonArrangement` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:268` |
| `SextupleAspectsComposerService.getSextupleAspectEvent` | 3 | `SextupleAspectsComposerService.map(…)`, `SextupleAspectsComposerService.map(…)`, `SextupleAspectsComposerService.buildSextupleEventFromParameters` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:335` |
| `SextupleAspectsService.processHexagramCombinations` | 3 | `SextupleAspectsComposerService.findHexagramPattern`, `AspectCalculationSupportService.determineCompoundPhaseFromSnapshots`, `SextupleAspectsComposerService.buildHexagramEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects.service.ts:62` |
| `SextupleAspectsService.detectProgressive` | 3 | `SextupleAspectsComposerService.groupSextupleEventsByKey`, `ProgressiveUtilitiesService.pairCompoundBoundaries`, `SextupleAspectsComposerService.buildProgressiveSextupleEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects.service.ts:128` |
| `TripleAspectsComposerService.buildTripleAspectEvent` | 3 | `bodyDisplayName`, `TripleAspectsComposerService.buildTripleAspectDescription`, `TripleAspectsComposerService.buildTripleAspectTags` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:242` |
| `TripleAspectsComposerService.getProgressiveGroupKey` | 3 | `TripleAspectsComposerService.map(…)`, `TripleAspectsComposerService.filter(…)`, `TripleAspectsComposerService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:315` |
| `TripleAspectsComposerService.pairProgressiveGroup` | 3 | `TripleAspectsComposerService.getProgressiveGroupKey`, `ProgressiveUtilitiesService.pairCompoundBoundaries`, `TripleAspectsComposerService.flatMap(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:347` |
| `TripleAspectsDetectorService.checkGrandTrineTriplet` | 3 | `TripleAspectsDetectorService.isGrandTrine`, `AspectCalculationSupportService.determineCompoundPhaseFromSnapshots`, `TripleAspectsComposerService.buildTripleAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:44` |
| `TripleAspectsDetectorService.checkTSquareFocalBody` | 3 | `TripleAspectsDetectorService.isTSquare`, `AspectCalculationSupportService.determineCompoundPhaseFromSnapshots`, `TripleAspectsComposerService.buildTripleAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:94` |
| `TripleAspectsDetectorService.checkYodApexBody` | 3 | `TripleAspectsDetectorService.isYod`, `AspectCalculationSupportService.determineCompoundPhaseFromSnapshots`, `TripleAspectsComposerService.buildTripleAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:145` |
| `TripleAspectsService.detect` | 3 | `TripleAspectsDetectorService.composeTSquares`, `TripleAspectsDetectorService.composeYods`, `TripleAspectsDetectorService.composeGrandTrines` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects.service.ts:82` |
| `TripleAspectsService.detectProgressive` | 3 | `TripleAspectsService.filter(…)`, `TripleAspectsService.groupBy(…)`, `TripleAspectsComposerService.pairProgressiveGroup` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects.service.ts:111` |
| `parseStarCatalog` | 3 | `splitCsvLine`, `map(…)`, `flatMap(…)` | `projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:114` |
| `flatMap(…)` | 3 | `splitCsvLine`, `readCatalogStar`, `map(…)` | `projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:125` |
| `EphemerisDownloadService.download` | 3 | `resolveEphemerisDirectory`, `isEphemerisFilePresent`, `EphemerisDownloadService.fetchFile` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/ephemeris-download/ephemeris-download.service.ts:68` |
| `MinorAspectsComposerService.extractAspectComponents` | 3 | `MinorAspectsComposerService.filter(…)`, `MinorAspectsComposerService.find(…)`, `MinorAspectsComposerService.castAspectComponentsToTypes` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:145` |
| `assertEphemerisFilesPresent` | 2 | `findMissingEphemerisFiles`, `EphemerisFilesMissingError.constructor` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/ephemeris-download/ephemeris-download.utilities.ts:20` |
| `EphemerisCoordinateService.computeBodyCoordinates` | 2 | `EphemerisConstantsService.getSwissEphemerisConstantForBody`, `assertSwissEphemerisResult` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:45` |
| `EphemerisCoordinateService.computeNodeCoordinate` | 2 | `EphemerisCoordinateService.computeLunarPerigeeCoordinate`, `EphemerisCoordinateService.computeRegularNodeCoordinate` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:93` |
| `EphemerisCoordinateService.computeRegularNodeCoordinate` | 2 | `assertSwissEphemerisResult`, `MathService.normalizeDegrees` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:108` |
| `EphemerisHorizonService.computeAzimuthElevationForMinute` | 2 | `EphemerisCoordinateService.getTopocentricBodyCoordinates`, `EphemerisHorizonService.computeSemidiameter` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/horizon/ephemeris-horizon.service.ts:70` |
| `EphemerisAggregationService.computeNonNodeBodyMinutes` | 2 | `EphemerisTimeService.generateMinutes`, `EphemerisAggregationService.processNonNodeBodyMinute` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/aggregation/ephemeris-aggregation.service.ts:54` |
| `AspectsUtilitiesService.isPerfective` | 2 | `AspectsUtilitiesService.isSignedOffsetSignChange`, `AspectsUtilitiesService.isPerfectiveByUnsignedAngle` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:200` |
| `AspectsUtilitiesService.getActiveAspectBodies` | 2 | `AspectsUtilitiesService.map(…)`, `AspectsUtilitiesService.scanUniqueBodyPairs` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:263` |
| `AspectsUtilitiesService.anonymous` | 2 | `AspectsUtilitiesService.computeAngles`, `AspectsUtilitiesService.getAspectPhase` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:310` |
| `MajorAspectEventService.buildMajorAspectEvent` | 2 | `MajorAspectEventService.getMajorAspect`, `MajorAspectEventService.assembleMajorAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-event.service.ts:119` |
| `ProgressiveUtilitiesService.boundariesFor` | 2 | `ProgressiveUtilitiesService.uniqBy(…)`, `ProgressiveUtilitiesService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:77` |
| `map(…)` | 2 | `mapEach(…)`, `mapEach` | `projects/caelundas/caelundas-cli/src/modules/tags/tag-map.constants.ts:235` |
| `ingressPaths` | 2 | `ingressKind`, `dignityPaths` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.utilities.ts:113` |
| `mapRawTag` | 2 | `filter(…)`, `flatMap(…)` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.utilities.ts:135` |
| `CalendarEventsService.writeRows` | 2 | `CalendarEventsService.mapWrittenIds`, `CalendarEventsService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/calendar-events/calendar-events.service.ts:157` |
| `AspectsService.applyEventToMap` | 2 | `AspectsService.parseSimpleAspectEvent`, `AspectsService.makeKey` | `projects/caelundas/caelundas-cli/src/modules/aspects/aspects.service.ts:56` |
| `AspectsService.seed` | 2 | `AspectsService.flatMap(…)`, `AspectsService.detectCompositeAspects` | `projects/caelundas/caelundas-cli/src/modules/aspects/aspects.service.ts:242` |
| `AnnualSolarCycleEventsService.getAutumnalToVernalEvents` | 2 | `AnnualSolarCycleEventsService.getAutumnEvents`, `AnnualSolarCycleEventsService.getWinterEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:335` |
| `AnnualSolarCycleEventsService.getVernalToAutumnalEvents` | 2 | `AnnualSolarCycleEventsService.getSpringEvents`, `AnnualSolarCycleEventsService.getSummerEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:346` |
| `AnnualSolarCycleService.getAdvancingProgressiveEvents` | 2 | `ProgressiveUtilitiesService.pairProgressiveEvents`, `AnnualSolarCycleService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle.service.ts:58` |
| `AnnualSolarCycleService.getRetreatingProgressiveEvents` | 2 | `ProgressiveUtilitiesService.pairProgressiveEvents`, `AnnualSolarCycleService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle.service.ts:87` |
| `AnnualSolarCycleService.detect` | 2 | `AnnualSolarCycleService.getAnnualSolarCycleEvents`, `AnnualSolarCycleService.getSolarApsisEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle.service.ts:154` |
| `DailyCyclesService.detect` | 2 | `DailyCyclesService.getDailySolarCycleEvents`, `DailyCyclesService.getDailyLunarCycleEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:136` |
| `EclipseEventService.detectProgressive` | 2 | `EclipseEventService.filter(…)`, `EclipseEventService.getProgressiveEventsForFrame` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipse-event.service.ts:173` |
| `EclipseGeometryService.getEclipseCoordinates` | 2 | `EphemerisService.getDistanceFromEphemeris`, `EclipseGeometryService.coordinate` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:89` |
| `EclipseTopocentricService.continueSolarOccurrence` | 2 | `EclipseTopocentricService.some(…)`, `EclipseTopocentricService.getFirstLocalSolarEclipseType` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:135` |
| `EclipseTopocentricService.getFirstLocalSolarEclipseType` | 2 | `EclipseTopocentricService.getClosestVisibleApproach`, `EclipseTopocentricService.getLocalSolarEclipseType` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:201` |
| `EclipseTopocentricService.getSolarVisibilityMargin` | 2 | `EclipseTopocentricService.getVisibilityMargin`, `EclipseGeometryService.getTopocentricSolarContactGeometry` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:220` |
| `EclipseTopocentricService.getLunarTopocentricPhases` | 2 | `EclipseTopocentricService.getVisiblePhases`, `EclipseTopocentricService.margin` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:274` |
| `EclipseTopocentricService.margin` | 2 | `EclipseTopocentricService.getVisibilityMargin`, `EclipseGeometryService.getLunarContactGeometry` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:280` |
| `EclipseClassificationService.getSolarGamma` | 2 | `EclipseClassificationService.getGamma`, `EclipseGeometryService.getSolarContactGeometry` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-classification.service.ts:241` |
| `EclipseCalculationService.buildGeocentricEclipseEvents` | 2 | `EclipseCalculationService.map(…)`, `EclipseCalculationService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-calculation.service.ts:87` |
| `IngressesComposerService.getSign` | 2 | `IngressesComposerService.find(…)`, `objectEntries` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:76` |
| `IngressesComposerService.buildProgressiveSpansForBody` | 2 | `IngressesComposerService.sortBy(…)`, `IngressesComposerService.getSignIngressDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:180` |
| `IngressesComposerService.buildSignIngressEvent` | 2 | `IngressesComposerService.getSign`, `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:204` |
| `IngressesComposerService.resolveDecan` | 2 | `IngressesComposerService.getDecan`, `isDecan` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:413` |
| `IngressesService.getSign` | 2 | `IngressesService.find(…)`, `objectEntries` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:67` |
| `MonthlyLunarCycleService.getLunarPhases` | 2 | `MonthlyLunarCycleService.getElongationWindow`, `MonthlyLunarCycleService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service.ts:117` |
| `MonthlyLunarCycleService.detect` | 2 | `MonthlyLunarCycleService.map(…)`, `MonthlyLunarCycleService.getLunarPhases` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service.ts:212` |
| `PhaseCalculationService.isEasternBrightest` | 2 | `PhaseCalculationService.isEastern`, `PhaseCalculationService.isBrightest` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:268` |
| `PhaseCalculationService.isEasternElongation` | 2 | `PhaseCalculationService.isElongation`, `PhaseCalculationService.isEastern` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:275` |
| `PhaseCalculationService.isElongation` | 2 | `MathService.isMaximum`, `PhaseCalculationService.getElongationAngle` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:282` |
| `PhaseCalculationService.isEveningRise` | 2 | `PhaseCalculationService.isEvening`, `PhaseCalculationService.isRise` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:309` |
| `PhaseCalculationService.isEveningSet` | 2 | `PhaseCalculationService.isEvening`, `PhaseCalculationService.isSet` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:316` |
| `PhaseCalculationService.isMorningRise` | 2 | `PhaseCalculationService.isMorning`, `PhaseCalculationService.isRise` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:330` |
| `PhaseCalculationService.isMorningSet` | 2 | `PhaseCalculationService.isMorning`, `PhaseCalculationService.isSet` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:337` |
| `PhaseCalculationService.isWesternBrightest` | 2 | `PhaseCalculationService.isWestern`, `PhaseCalculationService.isBrightest` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:403` |
| `PhaseCalculationService.isWesternElongation` | 2 | `PhaseCalculationService.isElongation`, `PhaseCalculationService.isWestern` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:410` |
| `MartianPhaseService.getMartianPhaseEvents` | 2 | `PhaseCalculationService.gatherPhaseParameters`, `MartianPhaseService.detectMartianPhases` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/martian/martian-phase.service.ts:182` |
| `MartianPhaseService.getMartianPhaseProgressiveEvents` | 2 | `MartianPhaseService.getMartianMorningProgressiveEvents`, `MartianPhaseService.getMartianEveningProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/martian/martian-phase.service.ts:205` |
| `MercurianPhaseService.getMercurianPhaseProgressiveEvents` | 2 | `MercurianPhaseService.getMercurianMorningProgressiveEvents`, `MercurianPhaseService.getMercurianEveningProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/mercurian/mercurian-phase.service.ts:214` |
| `VenusianPhaseService.getVenusianPhaseProgressiveEvents` | 2 | `VenusianPhaseService.getVenusianMorningProgressiveEvents`, `VenusianPhaseService.getVenusianEveningProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/venusian/venusian-phase.service.ts:225` |
| `RetrogradesService.isDirect` | 2 | `RetrogradesService.every(…)`, `RetrogradesService.every(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:155` |
| `RetrogradesService.isRetrograde` | 2 | `RetrogradesService.every(…)`, `RetrogradesService.every(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:185` |
| `RetrogradesService.buildRetrogradeEvent` | 2 | `bodyDisplayName`, `capitalize` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:217` |
| `TwilightsComposerService.pairAndBuild` | 2 | `ProgressiveUtilitiesService.pairProgressiveEvents`, `TwilightsComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-composer.service.ts:114` |
| `TwilightsService.detect` | 2 | `TwilightsDetectorService.getSunElevations`, `TwilightsDetectorService.buildTwilightTransitionEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:118` |
| `PerfectiveService.detect` | 2 | `DatetimeService.generateDates`, `PerfectiveService.detectDayEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/perfective.service.ts:241` |
| `AspectGraphService.findBodiesWithAspectTo` | 2 | `AspectGraphService.map(…)`, `AspectGraphService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:44` |
| `AspectGraphService.groupAspectsByType` | 2 | `AspectGraphService.groupByToMap(…)`, `groupByToMap` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:63` |
| `AspectEventFormattingService.assembleSimpleAspectEvent` | 2 | `bodyDisplayName`, `AspectEventFormattingService.resolveAspectPhaseDetails` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/formatting/aspect-event-formatting.service.ts:66` |
| `AspectEventFormattingService.buildProgressiveCompoundEvent` | 2 | `AspectEventFormattingService.spanTitle`, `AspectEventFormattingService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/formatting/aspect-event-formatting.service.ts:123` |
| `MinorAspectsService.buildMinorAspectEvent` | 2 | `MinorAspectsService.getMinorAspect`, `MinorAspectsEventService.assembleMinorAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:126` |
| `QuadrupleAspectsBaseService.buildProgressiveEvent` | 2 | `QuadrupleAspectsBaseService.filter(…)`, `AspectEventFormattingService.spanTitle` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:60` |
| `QuadrupleAspectsBaseService.findGrandTrines` | 2 | `QuadrupleAspectsBaseService.checkTrineTriple`, `AspectGraphService.canonicalBodyOrder` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:230` |
| `QuadrupleAspectsBaseService.makeProgressiveGroupKey` | 2 | `QuadrupleAspectsBaseService.filter(…)`, `QuadrupleAspectsBaseService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:349` |
| `QuadrupleAspectsBaseService.verifyGrandCrossSquares` | 2 | `QuadrupleAspectsBaseService.filter(…)`, `QuadrupleAspectsBaseService.haveAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:405` |
| `QuadrupleAspectsComposerService.collectKiteEventsForGrandTrine` | 2 | `QuadrupleAspectsComposerService.filter(…)`, `QuadrupleAspectsComposerService.tryBuildKite` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-composer.service.ts:77` |
| `QuadrupleAspectsComposerService.resolveGrandCrossEvent` | 2 | `AspectCalculationSupportService.determineCompoundPhaseFromSnapshots`, `QuadrupleAspectsBaseService.getQuadrupleAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-composer.service.ts:232` |
| `QuadrupleAspectsComposerService.resolveKiteEvent` | 2 | `AspectCalculationSupportService.determineCompoundPhaseFromSnapshots`, `QuadrupleAspectsBaseService.getQuadrupleAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-composer.service.ts:274` |
| `QuadrupleAspectsService.detect` | 2 | `QuadrupleAspectsComposerService.composeGrandCrosses`, `QuadrupleAspectsComposerService.composeKites` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects.service.ts:36` |
| `QuintupleAspectsComposerService.buildQuintupleEventFromParameters` | 2 | `QuintupleAspectsComposerService.buildQuintupleAspectSummary`, `QuintupleAspectsComposerService.buildQuintupleAspectTags` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:158` |
| `QuintupleAspectsComposerService.countUniqueQuintilePairs` | 2 | `QuintupleAspectsComposerService.map(…)`, `QuintupleAspectsComposerService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:227` |
| `QuintupleAspectsComposerService.groupAspectsByType` | 2 | `QuintupleAspectsComposerService.groupByToMap(…)`, `groupByToMap` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:307` |
| `QuintupleAspectsComposerService.groupQuintupleEventsByKey` | 2 | `QuintupleAspectsComposerService.filter(…)`, `QuintupleAspectsComposerService.groupBy(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:314` |
| `QuintupleAspectsComposerService.groupBy(…)` | 2 | `QuintupleAspectsComposerService.filter(…)`, `QuintupleAspectsComposerService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:321` |
| `SextupleAspectsComposerService.buildSextupleEventFromParameters` | 2 | `SextupleAspectsComposerService.buildSextupleAspectSummary`, `SextupleAspectsComposerService.buildSextupleAspectTags` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:173` |
| `SextupleAspectsComposerService.findGrandTrinePairs` | 2 | `SextupleAspectsComposerService.getGrandTrineNeighbors`, `SextupleAspectsComposerService.forEach(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:241` |
| `SextupleAspectsComposerService.groupAspectsByType` | 2 | `SextupleAspectsComposerService.groupByToMap(…)`, `groupByToMap` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:369` |
| `SextupleAspectsComposerService.groupSextupleEventsByKey` | 2 | `SextupleAspectsComposerService.filter(…)`, `SextupleAspectsComposerService.groupBy(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:376` |
| `SextupleAspectsComposerService.groupBy(…)` | 2 | `SextupleAspectsComposerService.filter(…)`, `SextupleAspectsComposerService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:383` |
| `SextupleAspectsService.pruneHexagramCandidates` | 2 | `SextupleAspectsService.map(…)`, `SextupleAspectsService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects.service.ts:154` |
| `SpecialtyAspectsService.detectBodyPairEvent` | 2 | `SpecialtyAspectsService.detectBodyPairLongitudes`, `SpecialtyAspectsService.buildSpecialtyAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:64` |
| `SpecialtyAspectsService.buildSpecialtyAspectEvent` | 2 | `SpecialtyAspectsService.getSpecialtyAspect`, `SpecialtyAspectsEventService.assembleSpecialtyAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:147` |
| `StelliumService.createStelliumEvent` | 2 | `StelliumService.map(…)`, `StelliumService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:105` |
| `StelliumService.missingFrom` | 2 | `StelliumService.map(…)`, `StelliumService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:228` |
| `StelliumService.stelliumGroupKey` | 2 | `StelliumService.filter(…)`, `StelliumService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:240` |
| `TripleAspectsComposerService.flatMap(…)` | 2 | `TripleAspectsComposerService.find(…)`, `TripleAspectsComposerService.buildProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:357` |
| `TripleAspectsService.findBodiesWithAspectTo` | 2 | `TripleAspectsService.map(…)`, `TripleAspectsService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects.service.ts:36` |
| `TripleAspectsService.groupAspectsByType` | 2 | `TripleAspectsService.groupByToMap(…)`, `groupByToMap` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects.service.ts:55` |
| `traceConstellationLines` | 2 | `map(…)`, `toSorted(…)` | `projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:141` |
| `readCatalogStar` | 2 | `some(…)`, `roundStar` | `projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:200` |
| `NightSkyService.ingest` | 2 | `buildNightSkyRows`, `NightSkyService.transaction(…)` | `projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.service.ts:87` |
| `NightSkyCommand.run` | 2 | `NightSkyService.ingest`, `NightSkyCommand.requireFiles` | `projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.command.ts:91` |
| `MinorAspectsComposerService.assembleMinorAspectEvent` | 2 | `bodyDisplayName`, `MinorAspectsComposerService.resolvePhaseDetails` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:60` |
| `MinorAspectsComposerService.buildGroupKey` | 2 | `MinorAspectsComposerService.filter(…)`, `MinorAspectsComposerService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:99` |
| `MinorAspectsComposerService.castAspectComponentsToTypes` | 2 | `isMinorAspect`, `isBody` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:119` |
| `SpecialtyAspectsComposerService.extractAspectBodiesFromTags` | 2 | `SpecialtyAspectsComposerService.filter(…)`, `SpecialtyAspectsComposerService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:86` |
| `SpecialtyAspectsComposerService.extractTypedAspectValues` | 2 | `isSpecialtyAspect`, `isBody` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:114` |
| `SpecialtyAspectsComposerService.getSpecialtyAspectProgressiveEvent` | 2 | `SpecialtyAspectsComposerService.extractAspectBodiesFromTags`, `SpecialtyAspectsComposerService.extractTypedAspectValues` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:158` |
| `SpecialtyAspectsComposerService.specialtyAspectGroupKey` | 2 | `SpecialtyAspectsComposerService.filter(…)`, `SpecialtyAspectsComposerService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:225` |
| `map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/caelundas/caelundas.types.ts:295` |
| `findMissingEphemerisFiles` | 1 | `filter(…)` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/ephemeris-download/ephemeris-download.utilities.ts:31` |
| `filter(…)` | 1 | `isEphemerisFilePresent` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/ephemeris-download/ephemeris-download.utilities.ts:35` |
| `initializeSwissEphemeris` | 1 | `resolveEphemerisDirectory` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.constants.ts:102` |
| `assertSwissEphemerisResult` | 1 | `EphemerisUnavailableError.constructor` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.utilities.ts:13` |
| `MathService.getAngle` | 1 | `MathService.normalizeDegrees` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:57` |
| `MathService.getCombinations` | 1 | `MathService.combine` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/math/math.service.ts:93` |
| `EphemerisCoordinateService.computeLunarPerigeeCoordinate` | 1 | `MathService.normalizeDegrees` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:70` |
| `EphemerisCoordinateService.computeBodyCoordinate` | 1 | `EphemerisCoordinateService.getBodyCoordinatesWithDistance` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:137` |
| `EphemerisCoordinateService.getBodyCoordinatesWithDistance` | 1 | `EphemerisCoordinateService.computeBodyCoordinates` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:200` |
| `EphemerisCoordinateService.getTopocentricBodyCoordinates` | 1 | `EphemerisCoordinateService.computeBodyCoordinates` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/coordinates/ephemeris-coordinate.service.ts:216` |
| `EphemerisPhenomenaService.computePhenoForBodyMinute` | 1 | `assertSwissEphemerisResult` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/phenomena/ephemeris-phenomena.service.ts:81` |
| `EphemerisPhenomenaService.computePhenoForMinute` | 1 | `EphemerisPhenomenaService.computePhenoForBodyMinute` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/phenomena/ephemeris-phenomena.service.ts:115` |
| `EphemerisAggregationService.entriesToEphemerides` | 1 | `typedFromEntries` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/aggregation/ephemeris-aggregation.service.ts:239` |
| `EphemerisService.constructor` | 1 | `initializeSwissEphemeris` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:43` |
| `EphemerisService.getEphemerides` | 1 | `EphemerisService.computeAllEphemerides` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:304` |
| `EphemerisService.getLongitudesWindow` | 1 | `EphemerisService.getCoordinateFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:374` |
| `EphemerisService.verifyFiles` | 1 | `assertEphemerisFilesPresent` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/ephemeris.service.ts:438` |
| `AspectCalculationSupportService.determineCompoundPhaseFromSnapshots` | 1 | `AspectCalculationSupportService.filterByBodies` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-calculation-support.service.ts:40` |
| `AspectCalculationSupportService.filterByBodies` | 1 | `AspectCalculationSupportService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-calculation-support.service.ts:55` |
| `AspectCalculationSupportService.getLongitudesWindowForBody` | 1 | `EphemerisService.getLongitudesWindow` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-calculation-support.service.ts:82` |
| `AspectsUtilitiesService.scanUniqueBodyPairsAtMinute` | 1 | `AspectsUtilitiesService.scanUniqueBodyPairs` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:99` |
| `AspectsUtilitiesService.computeAngles` | 1 | `MathService.getAngle` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:131` |
| `AspectsUtilitiesService.getAspectPhase` | 1 | `AspectsUtilitiesService.isPerfective` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:160` |
| `AspectsUtilitiesService.getSignedOffset` | 1 | `MathService.normalizeDegrees` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:186` |
| `AspectsUtilitiesService.isSignedOffsetSignChange` | 1 | `AspectsUtilitiesService.getSignedOffset` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:232` |
| `AspectsUtilitiesService.getValue` | 1 | `AspectsUtilitiesService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:285` |
| `AspectsUtilitiesService.find(…)` | 1 | `AspectsUtilitiesService.every(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:289` |
| `AspectsUtilitiesService.every(…)` | 1 | `AspectsUtilitiesService.isAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:290` |
| `AspectsUtilitiesService.isAspect` | 1 | `MathService.getAngle` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/utilities/aspects-utilities.service.ts:326` |
| `MajorAspectEventService.assembleMajorAspectEvent` | 1 | `MajorAspectEventService.buildAspectEventParts` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-event.service.ts:52` |
| `MajorAspectEventService.buildAspectEventParts` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-event.service.ts:82` |
| `MajorAspectEventService.getMajorAspect` | 1 | `AspectsUtilitiesService.isAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-event.service.ts:154` |
| `ProgressiveAspectService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:43` |
| `ProgressiveAspectService.buildSimpleAspectFamilyProgressiveEvents` | 1 | `ProgressiveAspectService.buildProgressiveAspectEvents` | `projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:134` |
| `ProgressiveAspectService.createSimpleAspectProgressiveEvent` | 1 | `ProgressiveAspectService.extractTypedAspectParts` | `projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:174` |
| `ProgressiveAspectService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:236` |
| `ProgressiveAspectService.extractTypedAspectPartsOrThrow` | 1 | `ProgressiveAspectService.extractTypedAspectParts` | `projects/caelundas/caelundas-cli/src/modules/progressive/progressive-aspect.service.ts:275` |
| `ProgressiveUtilitiesService.pairInStartOrder` | 1 | `ProgressiveUtilitiesService.byStart` | `projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:33` |
| `ProgressiveUtilitiesService.pairProgressiveEvents` | 1 | `ProgressiveUtilitiesService.pairInStartOrder` | `projects/caelundas/caelundas-cli/src/modules/progressive/progressive-utilities.service.ts:96` |
| `MajorAspectProgressiveService.getAspectGroupKey` | 1 | `ProgressiveAspectService.buildAspectGroupKeyFromTags` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:35` |
| `MajorAspectProgressiveService.getMajorAspectProgressiveEvent` | 1 | `ProgressiveAspectService.createSimpleAspectProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:46` |
| `MajorAspectProgressiveService.castAspectPartsToTypes` | 1 | `ProgressiveAspectService.extractTypedAspectPartsOrThrow` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:66` |
| `MajorAspectProgressiveService.detectProgressive` | 1 | `ProgressiveAspectService.buildSimpleAspectFamilyProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:92` |
| `MajorAspectProgressiveService.getAspectGroupKey` | 1 | `MajorAspectProgressiveService.getAspectGroupKey` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:97` |
| `MajorAspectProgressiveService.getProgressiveEvent` | 1 | `MajorAspectProgressiveService.getMajorAspectProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:98` |
| `MajorAspectProgressiveService.pairProgressiveEvents` | 1 | `ProgressiveUtilitiesService.pairProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:100` |
| `MajorAspectProgressiveService.processAspectGroup` | 1 | `ProgressiveAspectService.buildSimpleAspectFamilyProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:114` |
| `MajorAspectProgressiveService.getProgressiveEvent` | 1 | `MajorAspectProgressiveService.getMajorAspectProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:124` |
| `MajorAspectProgressiveService.pairProgressiveEvents` | 1 | `ProgressiveUtilitiesService.pairProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspect-progressive.service.ts:126` |
| `MajorAspectsService.constructor` | 1 | `AspectsUtilitiesService.getIsAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:37` |
| `MajorAspectsService.detectPhaseFromWindows` | 1 | `AspectsUtilitiesService.detectPhaseFromWindows` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:98` |
| `MajorAspectsService.getLongitudesWindowForBody` | 1 | `AspectCalculationSupportService.getLongitudesWindowForBody` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:112` |
| `MajorAspectsService.buildMajorAspectEvent` | 1 | `MajorAspectEventService.buildMajorAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:128` |
| `MajorAspectsService.detect` | 1 | `AspectsUtilitiesService.scanUniqueBodyPairsAtMinute` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:142` |
| `MajorAspectsService.detect` | 1 | `MajorAspectsService.detectAspectForBodyPair` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:149` |
| `MajorAspectsService.detectActive` | 1 | `AspectsUtilitiesService.getActiveAspectBodies` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:159` |
| `MajorAspectsService.getLongitudesWindow` | 1 | `MajorAspectsService.getLongitudesWindowForBody` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:164` |
| `MajorAspectsService.detectProgressive` | 1 | `MajorAspectProgressiveService.detectProgressive` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:176` |
| `MajorAspectsService.getMajorAspect` | 1 | `MajorAspectEventService.getMajorAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/major-aspects/major-aspects.service.ts:183` |
| `mapClasses` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:17` |
| `mapEach` | 1 | `map(…)` | `projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:38` |
| `map(…)` | 1 | `one` | `projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:43` |
| `mapNone` | 1 | `map(…)` | `projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:51` |
| `mapPlanetaryPhases` | 1 | `map(…)` | `projects/caelundas/caelundas-cli/src/modules/tags/tag-map.functions.ts:60` |
| `map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/tags/tag-map.constants.ts:52` |
| `map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/tags/tag-map.constants.ts:107` |
| `map(…)` | 1 | `signPaths` | `projects/caelundas/caelundas-cli/src/modules/tags/tag-map.constants.ts:116` |
| `map(…)` | 1 | `natureAndHarmonicPaths` | `projects/caelundas/caelundas-cli/src/modules/tags/tag-map.constants.ts:150` |
| `map(…)` | 1 | `natureAndHarmonicPaths` | `projects/caelundas/caelundas-cli/src/modules/tags/tag-map.constants.ts:166` |
| `flatMap(…)` | 1 | `mapRawTag` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.utilities.ts:27` |
| `map(…)` | 1 | `bodyFromDisplayName` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.utilities.ts:51` |
| `find(…)` | 1 | `isSign` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.utilities.ts:55` |
| `eclipsePaths` | 1 | `findRawTag` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.utilities.ts:71` |
| `findRawTag` | 1 | `find(…)` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.utilities.ts:89` |
| `ingressKind` | 1 | `isInstant` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.utilities.ts:97` |
| `map(…)` | 1 | `tagPathKey` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.utilities.ts:150` |
| `filter(…)` | 1 | `some(…)` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.utilities.ts:154` |
| `TagsService.ensurePath` | 1 | `tagNodeKey` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.service.ts:29` |
| `TagsService.map(…)` | 1 | `tagNodeKey` | `projects/caelundas/caelundas-cli/src/modules/tags/tags.service.ts:71` |
| `CalendarEventsService.toRow` | 1 | `CalendarEventsService.formatCoordinate` | `projects/caelundas/caelundas-cli/src/modules/calendar-events/calendar-events.service.ts:136` |
| `CalendarEventsService.map(…)` | 1 | `CalendarEventsService.calendarEventKey` | `projects/caelundas/caelundas-cli/src/modules/calendar-events/calendar-events.service.ts:179` |
| `CalendarEventsService.mapWrittenIds` | 1 | `CalendarEventsService.calendarEventKey` | `projects/caelundas/caelundas-cli/src/modules/calendar-events/calendar-events.service.ts:249` |
| `CalendarEventsService.toTagLinks` | 1 | `tagPathKey` | `projects/caelundas/caelundas-cli/src/modules/calendar-events/calendar-events.service.ts:278` |
| `CalendarEventsService.map(…)` | 1 | `CalendarEventsService.toRow` | `projects/caelundas/caelundas-cli/src/modules/calendar-events/calendar-events.service.ts:352` |
| `CalendarService.buildObservance` | 1 | `CalendarService.formatOffset` | `projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:57` |
| `CalendarService.map(…)` | 1 | `CalendarService.buildObservance` | `projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:102` |
| `CalendarService.findTransitions` | 1 | `CalendarService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:124` |
| `CalendarService.formatEventTime` | 1 | `CalendarService.some(…)` | `projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:160` |
| `CalendarService.toContentLines` | 1 | `CalendarService.flatMap(…)` | `projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:200` |
| `CalendarService.flatMap(…)` | 1 | `CalendarService.foldContentLine` | `projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:202` |
| `CalendarService.map(…)` | 1 | `CalendarService.buildEventContent` | `projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:248` |
| `CalendarService.write` | 1 | `CalendarService.buildFileContent` | `projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:279` |
| `CalendarService.writeJson` | 1 | `CalendarService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/calendar/calendar.service.ts:312` |
| `AspectsService.find(…)` | 1 | `isAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/aspects.service.ts:158` |
| `AspectsService.map(…)` | 1 | `AspectsService.makeKey` | `projects/caelundas/caelundas-cli/src/modules/aspects/aspects.service.ts:176` |
| `AnnualSolarCycleEventsService.buildAphelionEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:155` |
| `AnnualSolarCycleEventsService.buildAutumnalEquinoxEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:165` |
| `AnnualSolarCycleEventsService.buildBeltaneEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:175` |
| `AnnualSolarCycleEventsService.buildEleventhHexadecanEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:185` |
| `AnnualSolarCycleEventsService.buildFifteenthHexadecanEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:195` |
| `AnnualSolarCycleEventsService.buildFifthHexadecanEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:205` |
| `AnnualSolarCycleEventsService.buildFirstHexadecanEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:215` |
| `AnnualSolarCycleEventsService.buildImbolcEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:225` |
| `AnnualSolarCycleEventsService.buildLammasEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:235` |
| `AnnualSolarCycleEventsService.buildNinthHexadecanEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:245` |
| `AnnualSolarCycleEventsService.buildPerihelionEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:255` |
| `AnnualSolarCycleEventsService.buildSamhainEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:265` |
| `AnnualSolarCycleEventsService.buildSeventhHexadecanEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:275` |
| `AnnualSolarCycleEventsService.buildSummerSolsticeEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:285` |
| `AnnualSolarCycleEventsService.buildThirdHexadecanEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:295` |
| `AnnualSolarCycleEventsService.buildThirteenthHexadecanEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:305` |
| `AnnualSolarCycleEventsService.buildVernalEquinoxEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:315` |
| `AnnualSolarCycleEventsService.buildWinterSolsticeEvent` | 1 | `AnnualSolarCycleEventsService.buildSolarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:325` |
| `AnnualSolarCycleEventsService.isAutumnalEquinox` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:357` |
| `AnnualSolarCycleEventsService.isBeltane` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:365` |
| `AnnualSolarCycleEventsService.isEleventhHexadecan` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:373` |
| `AnnualSolarCycleEventsService.isFifteenthHexadecan` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:381` |
| `AnnualSolarCycleEventsService.isFifthHexadecan` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:389` |
| `AnnualSolarCycleEventsService.isFirstHexadecan` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:397` |
| `AnnualSolarCycleEventsService.isImbolc` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:405` |
| `AnnualSolarCycleEventsService.isLammas` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:413` |
| `AnnualSolarCycleEventsService.isNinthHexadecan` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:421` |
| `AnnualSolarCycleEventsService.isSamhain` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:429` |
| `AnnualSolarCycleEventsService.isSeventhHexadecan` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:437` |
| `AnnualSolarCycleEventsService.isSummerSolstice` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:445` |
| `AnnualSolarCycleEventsService.isThirdHexadecan` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:453` |
| `AnnualSolarCycleEventsService.isThirteenthHexadecan` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:461` |
| `AnnualSolarCycleEventsService.isWinterSolstice` | 1 | `AnnualSolarCycleEventsService.hasCrossedSolarLongitude` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle-events.service.ts:475` |
| `AnnualSolarCycleService.map(…)` | 1 | `AnnualSolarCycleService.getSolarAdvancingDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle.service.ts:68` |
| `AnnualSolarCycleService.map(…)` | 1 | `AnnualSolarCycleService.getSolarRetreatingDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle.service.ts:97` |
| `AnnualSolarCycleService.getSolarDistanceSpeeds` | 1 | `EphemerisService.getDistanceSpeedFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/annual-solar-cycle/annual-solar-cycle.service.ts:117` |
| `DailyCyclesBuilderService.buildLunarNadirEvent` | 1 | `CalendarService.buildInstantEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:79` |
| `DailyCyclesBuilderService.buildLunarZenithEvent` | 1 | `CalendarService.buildInstantEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:97` |
| `DailyCyclesBuilderService.buildMoonriseEvent` | 1 | `CalendarService.buildInstantEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:115` |
| `DailyCyclesBuilderService.buildMoonsetEvent` | 1 | `CalendarService.buildInstantEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:133` |
| `DailyCyclesBuilderService.buildSolarNadirEvent` | 1 | `CalendarService.buildInstantEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:151` |
| `DailyCyclesBuilderService.buildSolarZenithEvent` | 1 | `CalendarService.buildInstantEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:169` |
| `DailyCyclesBuilderService.buildSunriseEvent` | 1 | `CalendarService.buildInstantEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:187` |
| `DailyCyclesBuilderService.buildSunsetEvent` | 1 | `CalendarService.buildInstantEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:205` |
| `DailyCyclesBuilderService.getElevationAt` | 1 | `EphemerisService.getAzimuthElevationFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:222` |
| `DailyCyclesBuilderService.getElevationWindow` | 1 | `DailyCyclesBuilderService.getElevationAt` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:236` |
| `DailyCyclesBuilderService.getHorizonClearanceWindow` | 1 | `DailyCyclesBuilderService.clearanceAt` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:261` |
| `DailyCyclesBuilderService.clearanceAt` | 1 | `EphemerisService.getAzimuthElevationFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:267` |
| `DailyCyclesBuilderService.isRise` | 1 | `DailyCyclesBuilderService.crossesUpwardNearCurrent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:296` |
| `DailyCyclesBuilderService.isSet` | 1 | `DailyCyclesBuilderService.crossesUpwardNearCurrent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles-builder.service.ts:304` |
| `DailyCyclesService.buildLunarNadirEvent` | 1 | `DailyCyclesBuilderService.buildLunarNadirEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:80` |
| `DailyCyclesService.buildLunarZenithEvent` | 1 | `DailyCyclesBuilderService.buildLunarZenithEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:87` |
| `DailyCyclesService.buildMoonriseEvent` | 1 | `DailyCyclesBuilderService.buildMoonriseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:94` |
| `DailyCyclesService.buildMoonsetEvent` | 1 | `DailyCyclesBuilderService.buildMoonsetEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:101` |
| `DailyCyclesService.buildSolarNadirEvent` | 1 | `DailyCyclesBuilderService.buildSolarNadirEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:108` |
| `DailyCyclesService.buildSolarZenithEvent` | 1 | `DailyCyclesBuilderService.buildSolarZenithEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:115` |
| `DailyCyclesService.buildSunriseEvent` | 1 | `DailyCyclesBuilderService.buildSunriseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:122` |
| `DailyCyclesService.buildSunsetEvent` | 1 | `DailyCyclesBuilderService.buildSunsetEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/daily-cycles/daily-cycles.service.ts:129` |
| `EclipseEventService.getEclipseDurationEvent` | 1 | `EclipseEventService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipse-event.service.ts:92` |
| `EclipseEventService.map(…)` | 1 | `EclipseEventService.getEclipseDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipse-event.service.ts:139` |
| `EclipseEventService.buildLunarEclipseEvent` | 1 | `EclipseEventService.buildEclipseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipse-event.service.ts:149` |
| `EclipseEventService.buildSolarEclipseEvent` | 1 | `EclipseEventService.buildEclipseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipse-event.service.ts:161` |
| `EclipseGeometryService.coordinate` | 1 | `EphemerisService.getCoordinateFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:97` |
| `EclipseGeometryService.getTopocentricDisc` | 1 | `EclipseGeometryService.field` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:128` |
| `EclipseGeometryService.field` | 1 | `EphemerisService.getAzimuthElevationFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:132` |
| `EclipseGeometryService.getAllEclipseCoordinates` | 1 | `EclipseGeometryService.getEclipseCoordinates` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:160` |
| `EclipseGeometryService.getAllTopocentricSamples` | 1 | `EclipseGeometryService.sample` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:198` |
| `EclipseGeometryService.sample` | 1 | `EclipseGeometryService.getTopocentricDisc` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:203` |
| `EclipseGeometryService.getDiscAngles` | 1 | `EclipseGeometryService.getSubtendedAngle` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:239` |
| `EclipseGeometryService.getTopocentricSample` | 1 | `EclipseGeometryService.getTopocentricDisc` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:330` |
| `EclipseGeometryService.getTopocentricSolarContactGeometry` | 1 | `EclipseGeometryService.getAngularSeparation` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-geometry.service.ts:358` |
| `EclipseTopocentricService.getClosestApproach` | 1 | `EclipseTopocentricService.reduce(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:65` |
| `EclipseTopocentricService.getVisibilityMargin` | 1 | `EclipseTopocentricService.getContactMargin` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:121` |
| `EclipseTopocentricService.some(…)` | 1 | `EclipseTopocentricService.getSolarVisibilityMargin` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:143` |
| `EclipseTopocentricService.getVisiblePhases` | 1 | `MathService.crossesUpwardNearCurrent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:231` |
| `EclipseTopocentricService.isInProgressGeocentrically` | 1 | `EclipseTopocentricService.some(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:258` |
| `EclipseTopocentricService.some(…)` | 1 | `EclipseTopocentricService.getContactMargin` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:263` |
| `EclipseTopocentricService.isInProgressGeocentrically(…)` | 1 | `EclipseGeometryService.getSolarContactGeometry` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:359` |
| `EclipseTopocentricService.isInProgressGeocentrically(…)` | 1 | `EclipseGeometryService.getLunarContactGeometry` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:363` |
| `EclipseTopocentricService.map(…)` | 1 | `EclipseEventService.buildSolarEclipseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:394` |
| `EclipseTopocentricService.map(…)` | 1 | `EclipseEventService.buildLunarEclipseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/geometry/eclipse-topocentric.service.ts:402` |
| `EclipseClassificationService.getClosestApproach` | 1 | `EclipseClassificationService.offset` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-classification.service.ts:48` |
| `EclipseClassificationService.isInProgress` | 1 | `EclipseClassificationService.some(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-classification.service.ts:129` |
| `EclipseClassificationService.isInProgress(…)` | 1 | `EclipseGeometryService.getLunarContactGeometry` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-classification.service.ts:160` |
| `EclipseClassificationService.getClosestApproach(…)` | 1 | `EclipseGeometryService.getAntisolarPoint` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-classification.service.ts:168` |
| `EclipseClassificationService.isInProgress(…)` | 1 | `EclipseGeometryService.getSolarContactGeometry` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-classification.service.ts:199` |
| `EclipseClassificationService.getClosestApproach(…)` | 1 | `EclipseGeometryService.getSunPosition` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-classification.service.ts:207` |
| `EclipseCalculationService.map(…)` | 1 | `EclipseEventService.buildSolarEclipseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-calculation.service.ts:93` |
| `EclipseCalculationService.map(…)` | 1 | `EclipseEventService.buildLunarEclipseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-calculation.service.ts:101` |
| `EclipseCalculationService.getAllEclipseCoordinates` | 1 | `EclipseGeometryService.getAllEclipseCoordinates` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-calculation.service.ts:153` |
| `EclipseCalculationService.getTopocentricEventsForDetect` | 1 | `EclipseTopocentricService.getTopocentricEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/modules/calculation/eclipse-calculation.service.ts:273` |
| `EclipsesService.buildLunarEclipseEvent` | 1 | `EclipseEventService.buildLunarEclipseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipses.service.ts:48` |
| `EclipsesService.buildSolarEclipseEvent` | 1 | `EclipseEventService.buildSolarEclipseEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipses.service.ts:60` |
| `EclipsesService.detectProgressive` | 1 | `EclipseEventService.detectProgressive` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/eclipses/eclipses.service.ts:128` |
| `IngressesComposerService.buildDecanIngressEvent` | 1 | `IngressesComposerService.buildDecanIngressEventObject` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:94` |
| `IngressesComposerService.find(…)` | 1 | `IngressesComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:251` |
| `IngressesComposerService.filterSignIngressEvents` | 1 | `IngressesComposerService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:275` |
| `IngressesComposerService.getDecan` | 1 | `IngressesComposerService.getSign` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:289` |
| `IngressesComposerService.getLongitudes` | 1 | `EphemerisService.getCoordinateFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:299` |
| `IngressesComposerService.getSignIngressDurationEvent` | 1 | `IngressesComposerService.extractSignAndBodyFromTags` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:321` |
| `IngressesComposerService.groupSignIngressEventsByBody` | 1 | `IngressesComposerService.groupBy(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:350` |
| `IngressesComposerService.groupBy(…)` | 1 | `IngressesComposerService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:353` |
| `IngressesComposerService.find(…)` | 1 | `IngressesComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:354` |
| `IngressesComposerService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:356` |
| `IngressesComposerService.isDecanIngress` | 1 | `IngressesComposerService.getDecan` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:366` |
| `IngressesComposerService.isPeakIngress` | 1 | `IngressesComposerService.getSign` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:378` |
| `IngressesComposerService.isSignIngress` | 1 | `IngressesComposerService.getSign` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses-composer.service.ts:399` |
| `IngressesService.buildDecanIngressEvent` | 1 | `IngressesComposerService.buildDecanIngressEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:86` |
| `IngressesService.buildPeakIngressEvent` | 1 | `IngressesComposerService.buildPeakIngressEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:98` |
| `IngressesService.buildSignIngressEvent` | 1 | `IngressesComposerService.buildSignIngressEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/ingresses/ingresses.service.ts:111` |
| `LunarApsidesService.buildApsisEvent` | 1 | `CalendarService.buildInstantEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/lunar-apsides.service.ts:41` |
| `LunarApsidesService.isApsis` | 1 | `LunarApsidesService.isCrossingAt` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/lunar-apsides.service.ts:76` |
| `MonthlyLunarCycleService.getElongation` | 1 | `EphemerisService.getCoordinateFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service.ts:82` |
| `MonthlyLunarCycleService.getElongationWindow` | 1 | `MonthlyLunarCycleService.getElongation` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service.ts:99` |
| `MonthlyLunarCycleService.filter(…)` | 1 | `MonthlyLunarCycleService.isElongationReached` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service.ts:119` |
| `MonthlyLunarCycleService.getMonthlyLunarCycleProgressiveEvent` | 1 | `MonthlyLunarCycleService.extractLunarPhaseFromTags` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service.ts:130` |
| `MonthlyLunarCycleService.isElongationReached` | 1 | `MonthlyLunarCycleService.offset` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service.ts:160` |
| `MonthlyLunarCycleService.buildMonthlyLunarCycleEvent` | 1 | `CalendarService.buildInstantEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service.ts:182` |
| `MonthlyLunarCycleService.map(…)` | 1 | `MonthlyLunarCycleService.buildMonthlyLunarCycleEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service.ts:214` |
| `MonthlyLunarCycleService.detectApsides` | 1 | `LunarApsidesService.detect` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service.ts:224` |
| `PhaseCalculationService.gatherPositions` | 1 | `PhaseCalculationService.read` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:58` |
| `PhaseCalculationService.read` | 1 | `EphemerisService.getCoordinateFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:61` |
| `PhaseCalculationService.getSignedElongation` | 1 | `MathService.normalizeDegrees` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:82` |
| `PhaseCalculationService.filterByTag` | 1 | `PhaseCalculationService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:95` |
| `PhaseCalculationService.gatherMarginEphemeris` | 1 | `PhaseCalculationService.from(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:156` |
| `PhaseCalculationService.from(…)` | 1 | `EphemerisService.getMagnitudeFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:163` |
| `PhaseCalculationService.getElongationAngle` | 1 | `MathService.getAngularSeparation` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:236` |
| `PhaseCalculationService.isBrightest` | 1 | `PhaseCalculationService.getElongationAngle` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:244` |
| `PhaseCalculationService.isEastern` | 1 | `PhaseCalculationService.getSignedElongation` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:261` |
| `PhaseCalculationService.isEvening` | 1 | `PhaseCalculationService.isEastern` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:302` |
| `PhaseCalculationService.isMorning` | 1 | `PhaseCalculationService.isWestern` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:323` |
| `PhaseCalculationService.isRise` | 1 | `MathService.getAngle` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:344` |
| `PhaseCalculationService.isSet` | 1 | `MathService.getAngle` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:370` |
| `PhaseCalculationService.isWestern` | 1 | `PhaseCalculationService.getSignedElongation` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/calculation/phase-calculation.service.ts:396` |
| `MartianPhaseService.buildMartianPhaseEvent` | 1 | `PhaseCalculationService.formatTimeZoneIso` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/martian/martian-phase.service.ts:85` |
| `MartianPhaseService.map(…)` | 1 | `MartianPhaseService.getMarsEveningVisibilityDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/martian/martian-phase.service.ts:158` |
| `MartianPhaseService.map(…)` | 1 | `MartianPhaseService.getMarsMorningVisibilityDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/martian/martian-phase.service.ts:174` |
| `MercurianPhaseService.buildMercurianPhaseEvent` | 1 | `PhaseCalculationService.formatTimeZoneIso` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/mercurian/mercurian-phase.service.ts:123` |
| `MercurianPhaseService.map(…)` | 1 | `MercurianPhaseService.getMercuryEveningVisibilityDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/mercurian/mercurian-phase.service.ts:164` |
| `MercurianPhaseService.map(…)` | 1 | `MercurianPhaseService.getMercuryMorningVisibilityDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/mercurian/mercurian-phase.service.ts:180` |
| `VenusianPhaseService.buildVenusianPhaseEvent` | 1 | `PhaseCalculationService.formatTimeZoneIso` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/venusian/venusian-phase.service.ts:118` |
| `VenusianPhaseService.map(…)` | 1 | `VenusianPhaseService.getVenusEveningVisibilityDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/venusian/venusian-phase.service.ts:175` |
| `VenusianPhaseService.map(…)` | 1 | `VenusianPhaseService.getVenusMorningVisibilityDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/modules/venusian/venusian-phase.service.ts:191` |
| `PhasesService.getMartianPhaseEvents` | 1 | `MartianPhaseService.getMartianPhaseEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/phases.service.ts:137` |
| `PhasesService.getMercurianPhaseEvents` | 1 | `MercurianPhaseService.getMercurianPhaseEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/phases.service.ts:146` |
| `PhasesService.getVenusianPhaseEvents` | 1 | `VenusianPhaseService.getVenusianPhaseEvents` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/phases/phases.service.ts:155` |
| `RetrogradesService.getNextLongitudes` | 1 | `RetrogradesService.from(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:97` |
| `RetrogradesService.from(…)` | 1 | `EphemerisService.getCoordinateFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:101` |
| `RetrogradesService.getPreviousLongitudes` | 1 | `RetrogradesService.from(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:114` |
| `RetrogradesService.from(…)` | 1 | `EphemerisService.getCoordinateFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:118` |
| `RetrogradesService.getRetrogradeProgressiveEvent` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:131` |
| `RetrogradesService.every(…)` | 1 | `MathService.normalizeForComparison` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:162` |
| `RetrogradesService.every(…)` | 1 | `MathService.normalizeForComparison` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:171` |
| `RetrogradesService.every(…)` | 1 | `MathService.normalizeForComparison` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:192` |
| `RetrogradesService.every(…)` | 1 | `MathService.normalizeForComparison` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:201` |
| `RetrogradesService.detect` | 1 | `RetrogradesService.detectBodyStations` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:257` |
| `RetrogradesService.map(…)` | 1 | `RetrogradesService.getRetrogradeProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.ts:302` |
| `TwilightsBuilderService.buildAstronomicalDawnEvent` | 1 | `TwilightsBuilderService.buildTransitionEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:58` |
| `TwilightsBuilderService.buildAstronomicalDuskEvent` | 1 | `TwilightsBuilderService.buildTransitionEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:65` |
| `TwilightsBuilderService.buildCivilDawnEvent` | 1 | `TwilightsBuilderService.buildTransitionEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:72` |
| `TwilightsBuilderService.buildCivilDuskEvent` | 1 | `TwilightsBuilderService.buildTransitionEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:79` |
| `TwilightsBuilderService.buildNauticalDawnEvent` | 1 | `TwilightsBuilderService.buildTransitionEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:86` |
| `TwilightsBuilderService.buildNauticalDuskEvent` | 1 | `TwilightsBuilderService.buildTransitionEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-builder.service.ts:93` |
| `TwilightsComposerService.buildDawnProgressiveEvents` | 1 | `TwilightsComposerService.pairAndBuild` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-composer.service.ts:32` |
| `TwilightsComposerService.builder` | 1 | `TwilightsBuilderService.getAstronomicalTwilightMorningDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-composer.service.ts:40` |
| `TwilightsComposerService.builder` | 1 | `TwilightsBuilderService.getNauticalTwilightMorningDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-composer.service.ts:50` |
| `TwilightsComposerService.buildDuskProgressiveEvents` | 1 | `TwilightsComposerService.pairAndBuild` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-composer.service.ts:64` |
| `TwilightsComposerService.builder` | 1 | `TwilightsBuilderService.getDaylightDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-composer.service.ts:80` |
| `TwilightsComposerService.builder` | 1 | `TwilightsBuilderService.getNauticalTwilightEveningDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-composer.service.ts:90` |
| `TwilightsComposerService.builder` | 1 | `TwilightsBuilderService.getAstronomicalTwilightEveningDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-composer.service.ts:100` |
| `TwilightsDetectorService.getSunElevations` | 1 | `EphemerisService.getAzimuthElevationFromEphemeris` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-detector.service.ts:84` |
| `TwilightsDetectorService.isAstronomicalDawn` | 1 | `TwilightsDetectorService.isDawn` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-detector.service.ts:107` |
| `TwilightsDetectorService.isAstronomicalDusk` | 1 | `TwilightsDetectorService.isDusk` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-detector.service.ts:117` |
| `TwilightsDetectorService.isCivilDawn` | 1 | `TwilightsDetectorService.isDawn` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-detector.service.ts:127` |
| `TwilightsDetectorService.isCivilDusk` | 1 | `TwilightsDetectorService.isDusk` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-detector.service.ts:137` |
| `TwilightsDetectorService.isNauticalDawn` | 1 | `TwilightsDetectorService.isDawn` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-detector.service.ts:173` |
| `TwilightsDetectorService.isNauticalDusk` | 1 | `TwilightsDetectorService.isDusk` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights-detector.service.ts:183` |
| `TwilightsService.buildAstronomicalDawnEvent` | 1 | `TwilightsBuilderService.buildAstronomicalDawnEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:61` |
| `TwilightsService.buildAstronomicalDuskEvent` | 1 | `TwilightsBuilderService.buildAstronomicalDuskEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:71` |
| `TwilightsService.buildCivilDawnEvent` | 1 | `TwilightsBuilderService.buildCivilDawnEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:81` |
| `TwilightsService.buildCivilDuskEvent` | 1 | `TwilightsBuilderService.buildCivilDuskEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:91` |
| `TwilightsService.buildNauticalDawnEvent` | 1 | `TwilightsBuilderService.buildNauticalDawnEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:101` |
| `TwilightsService.buildNauticalDuskEvent` | 1 | `TwilightsBuilderService.buildNauticalDuskEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:111` |
| `TwilightsService.getEventsByTag` | 1 | `TwilightsService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:147` |
| `TwilightsService.builder` | 1 | `TwilightsBuilderService.getNightDurationEvent` | `projects/caelundas/caelundas-cli/src/modules/perfective/modules/twilights/twilights.service.ts:171` |
| `AspectGraphService.canonicalBodyOrder` | 1 | `AspectGraphService.toSorted(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:35` |
| `AspectGraphService.haveAspect` | 1 | `AspectGraphService.some(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:70` |
| `AspectGraphService.unionAspectBodies` | 1 | `AspectGraphService.edgeKey` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/calculation/aspect-graph.service.ts:89` |
| `MinorAspectsEventService.assembleMinorAspectEvent` | 1 | `AspectEventFormattingService.assembleSimpleAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-event.service.ts:47` |
| `MinorAspectsEventService.getLongitudesWindowForBody` | 1 | `AspectCalculationSupportService.getLongitudesWindowForBody` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-event.service.ts:72` |
| `MinorAspectsEventService.getMinorAspect` | 1 | `AspectEventFormattingService.findFirstMatchingAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-event.service.ts:85` |
| `MinorAspectsEventService.isMatchingAspect` | 1 | `AspectsUtilitiesService.isAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-event.service.ts:93` |
| `MinorAspectsProgressiveService.buildGroupKey` | 1 | `ProgressiveAspectService.buildAspectGroupKeyFromTags` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:37` |
| `MinorAspectsProgressiveService.castAspectComponentsToTypes` | 1 | `ProgressiveAspectService.extractTypedAspectPartsOrThrow` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:48` |
| `MinorAspectsProgressiveService.detectProgressive` | 1 | `ProgressiveAspectService.buildSimpleAspectFamilyProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:74` |
| `MinorAspectsProgressiveService.getAspectGroupKey` | 1 | `MinorAspectsProgressiveService.buildGroupKey` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:79` |
| `MinorAspectsProgressiveService.getProgressiveEvent` | 1 | `MinorAspectsProgressiveService.getMinorAspectProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:80` |
| `MinorAspectsProgressiveService.pairProgressiveEvents` | 1 | `ProgressiveUtilitiesService.pairProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:82` |
| `MinorAspectsProgressiveService.getMinorAspectProgressiveEvent` | 1 | `ProgressiveAspectService.createSimpleAspectProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:96` |
| `MinorAspectsProgressiveService.processAspectGroup` | 1 | `ProgressiveAspectService.buildSimpleAspectFamilyProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:114` |
| `MinorAspectsProgressiveService.getProgressiveEvent` | 1 | `MinorAspectsProgressiveService.getMinorAspectProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:124` |
| `MinorAspectsProgressiveService.pairProgressiveEvents` | 1 | `ProgressiveUtilitiesService.pairProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-progressive.service.ts:126` |
| `MinorAspectsService.constructor` | 1 | `AspectsUtilitiesService.getIsAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:41` |
| `MinorAspectsService.detectPhaseFromWindows` | 1 | `AspectsUtilitiesService.detectPhaseFromWindows` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:109` |
| `MinorAspectsService.detect` | 1 | `AspectsUtilitiesService.scanUniqueBodyPairsAtMinute` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:160` |
| `MinorAspectsService.detect` | 1 | `MinorAspectsService.detectBodyPairAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:167` |
| `MinorAspectsService.detectActive` | 1 | `AspectsUtilitiesService.getActiveAspectBodies` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:176` |
| `MinorAspectsService.getLongitudesWindow` | 1 | `MinorAspectsEventService.getLongitudesWindowForBody` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:181` |
| `MinorAspectsService.detectProgressive` | 1 | `MinorAspectsProgressiveService.detectProgressive` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:194` |
| `MinorAspectsService.getMinorAspect` | 1 | `MinorAspectsEventService.getMinorAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects.service.ts:202` |
| `QuadrupleAspectsBaseService.buildQuadrupleAspectDescription` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:82` |
| `QuadrupleAspectsBaseService.checkKitePattern` | 1 | `QuadrupleAspectsBaseService.haveAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:134` |
| `QuadrupleAspectsBaseService.checkTrineTriple` | 1 | `QuadrupleAspectsBaseService.haveAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:185` |
| `QuadrupleAspectsBaseService.groupAspectsByType` | 1 | `AspectGraphService.groupAspectsByType` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:330` |
| `QuadrupleAspectsBaseService.haveAspect` | 1 | `AspectGraphService.haveAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:337` |
| `QuadrupleAspectsBaseService.filter(…)` | 1 | `QuadrupleAspectsBaseService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:351` |
| `QuadrupleAspectsBaseService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:353` |
| `QuadrupleAspectsBaseService.makeQuadrupleAspectTags` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-base.service.ts:366` |
| `QuadrupleAspectsComposerService.collectGrandCrossesForOpp1` | 1 | `QuadrupleAspectsComposerService.tryBuildGrandCross` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-composer.service.ts:39` |
| `QuadrupleAspectsComposerService.checkPatternExists` | 1 | `QuadrupleAspectsBaseService.checkGrandCrossPattern` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-composer.service.ts:243` |
| `QuadrupleAspectsComposerService.checkPatternExists` | 1 | `QuadrupleAspectsBaseService.checkKitePattern` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects-composer.service.ts:296` |
| `QuadrupleAspectsService.groupBy(…)` | 1 | `QuadrupleAspectsBaseService.makeProgressiveGroupKey` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects.service.ts:66` |
| `QuadrupleAspectsService.getOtherBody` | 1 | `QuadrupleAspectsBaseService.getOtherBody` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quadruple-aspects/quadruple-aspects.service.ts:84` |
| `QuintupleAspectsComposerService.buildPentagramEvent` | 1 | `QuintupleAspectsComposerService.getQuintupleAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:55` |
| `QuintupleAspectsComposerService.buildProgressiveQuintupleEvent` | 1 | `AspectEventFormattingService.buildProgressiveCompoundEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:85` |
| `QuintupleAspectsComposerService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:289` |
| `QuintupleAspectsComposerService.filter(…)` | 1 | `QuintupleAspectsComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:322` |
| `QuintupleAspectsComposerService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:323` |
| `QuintupleAspectsComposerService.checkPatternExists` | 1 | `QuintupleAspectsComposerService.findPentagramPattern` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:358` |
| `QuintupleAspectsComposerService.traversePentagramPath` | 1 | `QuintupleAspectsComposerService.find(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects-composer.service.ts:379` |
| `QuintupleAspectsService.detect` | 1 | `QuintupleAspectsComposerService.composePentagrams` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/quintuple-aspects/quintuple-aspects.service.ts:34` |
| `SextupleAspectsComposerService.buildHexagramEvent` | 1 | `SextupleAspectsComposerService.getSextupleAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:95` |
| `SextupleAspectsComposerService.buildProgressiveSextupleEvent` | 1 | `AspectEventFormattingService.buildProgressiveCompoundEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:127` |
| `SextupleAspectsComposerService.findValidHexagonArrangement` | 1 | `SextupleAspectsComposerService.tryHexagonArrangement` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:291` |
| `SextupleAspectsComposerService.getGrandTrineNeighbors` | 1 | `SextupleAspectsComposerService.isValidGrandTrine` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:318` |
| `SextupleAspectsComposerService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:351` |
| `SextupleAspectsComposerService.filter(…)` | 1 | `SextupleAspectsComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:384` |
| `SextupleAspectsComposerService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:385` |
| `SextupleAspectsComposerService.tryHexagonArrangement` | 1 | `SextupleAspectsComposerService.tryArrangementForPair` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects-composer.service.ts:448` |
| `SextupleAspectsService.checkPatternExists` | 1 | `SextupleAspectsComposerService.findHexagramPattern` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects.service.ts:86` |
| `SextupleAspectsService.detect` | 1 | `SextupleAspectsService.composeHexagrams` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/sextuple-aspects/sextuple-aspects.service.ts:112` |
| `SpecialtyAspectsEventService.assembleSpecialtyAspectEvent` | 1 | `AspectEventFormattingService.assembleSimpleAspectEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-event.service.ts:47` |
| `SpecialtyAspectsEventService.getBodyLongitudesWindow` | 1 | `EphemerisService.getLongitudesWindow` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-event.service.ts:72` |
| `SpecialtyAspectsEventService.getSpecialtyAspect` | 1 | `AspectEventFormattingService.findFirstMatchingAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-event.service.ts:90` |
| `SpecialtyAspectsEventService.isMatchingAspect` | 1 | `AspectsUtilitiesService.isAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-event.service.ts:98` |
| `SpecialtyAspectsProgressiveService.detectProgressive` | 1 | `ProgressiveAspectService.buildSimpleAspectFamilyProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:37` |
| `SpecialtyAspectsProgressiveService.getAspectGroupKey` | 1 | `SpecialtyAspectsProgressiveService.specialtyAspectGroupKey` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:42` |
| `SpecialtyAspectsProgressiveService.getProgressiveEvent` | 1 | `SpecialtyAspectsProgressiveService.getSpecialtyAspectProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:43` |
| `SpecialtyAspectsProgressiveService.pairProgressiveEvents` | 1 | `ProgressiveUtilitiesService.pairProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:45` |
| `SpecialtyAspectsProgressiveService.extractTypedAspectValues` | 1 | `ProgressiveAspectService.extractTypedAspectPartsOrThrow` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:59` |
| `SpecialtyAspectsProgressiveService.getSpecialtyAspectProgressiveEvent` | 1 | `ProgressiveAspectService.createSimpleAspectProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:85` |
| `SpecialtyAspectsProgressiveService.processAspectGroup` | 1 | `ProgressiveAspectService.buildSimpleAspectFamilyProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:103` |
| `SpecialtyAspectsProgressiveService.getProgressiveEvent` | 1 | `SpecialtyAspectsProgressiveService.getSpecialtyAspectProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:113` |
| `SpecialtyAspectsProgressiveService.pairProgressiveEvents` | 1 | `ProgressiveUtilitiesService.pairProgressiveEvents` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:115` |
| `SpecialtyAspectsProgressiveService.specialtyAspectGroupKey` | 1 | `ProgressiveAspectService.buildAspectGroupKeyFromTags` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-progressive.service.ts:129` |
| `SpecialtyAspectsService.constructor` | 1 | `AspectsUtilitiesService.getIsAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:41` |
| `SpecialtyAspectsService.detectBodyPairLongitudes` | 1 | `SpecialtyAspectsEventService.getBodyLongitudesWindow` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:101` |
| `SpecialtyAspectsService.detect` | 1 | `AspectsUtilitiesService.scanUniqueBodyPairsAtMinute` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:183` |
| `SpecialtyAspectsService.detect` | 1 | `SpecialtyAspectsService.detectBodyPairEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:190` |
| `SpecialtyAspectsService.detectActive` | 1 | `AspectsUtilitiesService.getActiveAspectBodies` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:198` |
| `SpecialtyAspectsService.getLongitudesWindow` | 1 | `SpecialtyAspectsEventService.getBodyLongitudesWindow` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:203` |
| `SpecialtyAspectsService.detectProgressive` | 1 | `SpecialtyAspectsProgressiveService.detectProgressive` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:216` |
| `SpecialtyAspectsService.getSpecialtyAspect` | 1 | `SpecialtyAspectsEventService.getSpecialtyAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects.service.ts:224` |
| `StelliumService.buildProgressiveStelliumEvent` | 1 | `AspectEventFormattingService.buildProgressiveCompoundEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:67` |
| `StelliumService.map(…)` | 1 | `StelliumService.createStelliumEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:97` |
| `StelliumService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:111` |
| `StelliumService.maxBy(…)` | 1 | `StelliumService.filter(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:160` |
| `StelliumService.filter(…)` | 1 | `StelliumService.neighborsOf` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:160` |
| `StelliumService.map(…)` | 1 | `AspectGraphService.canonicalBodyOrder` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:194` |
| `StelliumService.groupAspectsByType` | 1 | `AspectGraphService.groupAspectsByType` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:219` |
| `StelliumService.filter(…)` | 1 | `StelliumService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:242` |
| `StelliumService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:243` |
| `StelliumService.detect` | 1 | `StelliumService.composeStelliums` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:258` |
| `StelliumService.groupBy(…)` | 1 | `StelliumService.stelliumGroupKey` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/stellium/stellium.service.ts:281` |
| `TripleAspectsComposerService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:59` |
| `TripleAspectsComposerService.buildTripleAspectDescription` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:83` |
| `TripleAspectsComposerService.buildTripleAspectTags` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:99` |
| `TripleAspectsComposerService.resolveProgressiveMeta` | 1 | `TripleAspectsComposerService.resolveTripleBody` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:154` |
| `TripleAspectsComposerService.resolveTripleBody` | 1 | `bodyFromDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:193` |
| `TripleAspectsComposerService.buildProgressiveEvent` | 1 | `TripleAspectsComposerService.buildProgressiveBodiesMeta` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:204` |
| `TripleAspectsComposerService.findBodiesWithAspectTo` | 1 | `AspectGraphService.findBodiesWithAspectTo` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:300` |
| `TripleAspectsComposerService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:317` |
| `TripleAspectsComposerService.haveAspect` | 1 | `AspectGraphService.haveAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-composer.service.ts:335` |
| `TripleAspectsDetectorService.canonicalPair` | 1 | `AspectGraphService.canonicalBodyOrder` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:34` |
| `TripleAspectsDetectorService.checkPatternExists` | 1 | `TripleAspectsDetectorService.isGrandTrine` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:69` |
| `TripleAspectsDetectorService.checkPatternExists` | 1 | `TripleAspectsDetectorService.isTSquare` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:119` |
| `TripleAspectsDetectorService.checkPatternExists` | 1 | `TripleAspectsDetectorService.isYod` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:170` |
| `TripleAspectsDetectorService.groupAspectsByType` | 1 | `AspectGraphService.groupAspectsByType` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:224` |
| `TripleAspectsDetectorService.isGrandTrine` | 1 | `TripleAspectsComposerService.haveAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:233` |
| `TripleAspectsDetectorService.isTSquare` | 1 | `TripleAspectsComposerService.haveAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:265` |
| `TripleAspectsDetectorService.isYod` | 1 | `TripleAspectsComposerService.haveAspect` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects-detector.service.ts:297` |
| `TripleAspectsService.haveAspect` | 1 | `TripleAspectsService.some(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects.service.ts:64` |
| `TripleAspectsService.groupBy(…)` | 1 | `TripleAspectsComposerService.getProgressiveGroupKey` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/triple-aspects/triple-aspects.service.ts:115` |
| `map(…)` | 1 | `measureSeparation` | `projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:63` |
| `indexStars` | 1 | `toBand` | `projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:75` |
| `map(…)` | 1 | `findStar` | `projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.utilities.ts:149` |
| `NightSkyService.replace` | 1 | `NightSkyService.insertInBatches` | `projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.service.ts:69` |
| `NightSkyService.transaction(…)` | 1 | `NightSkyService.replace` | `projects/caelundas/caelundas-cli/src/modules/night-sky/night-sky.service.ts:95` |
| `EphemerisDownloadCommand.run` | 1 | `EphemerisDownloadService.download` | `projects/caelundas/caelundas-cli/src/modules/ephemeris/modules/ephemeris-download/ephemeris-download.command.ts:42` |
| `MinorAspectsComposerService.filter(…)` | 1 | `MinorAspectsComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:101` |
| `MinorAspectsComposerService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:103` |
| `MinorAspectsComposerService.find(…)` | 1 | `MinorAspectsComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:107` |
| `MinorAspectsComposerService.filter(…)` | 1 | `MinorAspectsComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:147` |
| `MinorAspectsComposerService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:148` |
| `MinorAspectsComposerService.find(…)` | 1 | `MinorAspectsComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:151` |
| `MinorAspectsComposerService.getLongitudesWindowForBody` | 1 | `AspectCalculationSupportService.getLongitudesWindowForBody` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:177` |
| `MinorAspectsComposerService.getMinorAspectProgressiveEvent` | 1 | `MinorAspectsComposerService.extractAspectComponents` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:190` |
| `MinorAspectsComposerService.map(…)` | 1 | `MinorAspectsComposerService.getMinorAspectProgressiveEvent` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/minor-aspects/minor-aspects-composer.service.ts:235` |
| `SpecialtyAspectsComposerService.filter(…)` | 1 | `SpecialtyAspectsComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:92` |
| `SpecialtyAspectsComposerService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:93` |
| `SpecialtyAspectsComposerService.find(…)` | 1 | `SpecialtyAspectsComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:96` |
| `SpecialtyAspectsComposerService.getBodyLongitudesWindow` | 1 | `EphemerisService.getLongitudesWindow` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:140` |
| `SpecialtyAspectsComposerService.filter(…)` | 1 | `SpecialtyAspectsComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:227` |
| `SpecialtyAspectsComposerService.map(…)` | 1 | `bodyDisplayName` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:228` |
| `SpecialtyAspectsComposerService.find(…)` | 1 | `SpecialtyAspectsComposerService.map(…)` | `projects/caelundas/caelundas-cli/src/modules/aspects/modules/specialty-aspects/specialty-aspects-composer.service.ts:231` |

</details>
<!-- callidescope:end -->
