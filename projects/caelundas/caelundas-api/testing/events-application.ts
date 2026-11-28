import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { z } from "zod";

import {
  CAELUNDAS_DATABASE_ENTITIES,
  CAELUNDAS_DATABASE_MIGRATIONS,
  CAELUNDAS_PROJECT,
  CaelundasDatabaseModule,
  CaelundasDatabaseService,
  CalendarEventTag,
  type Tag,
} from "@codebase/caelundas-db";
import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import { environmentSchema } from "../src/caelundas-api.constants";
import { EventsModule } from "../src/modules/events/events.module";

import { tagRepository } from "./tag-repository";

import type { DatabaseTestingModule } from "@codebase/persistence/testing";
import type { INestApplication } from "@nestjs/common";
import type { Server } from "node:http";

/** Starting Postgres and running the migration takes longer than a test. */
export const DATABASE_TIMEOUT_MILLISECONDS = 120_000;

/** Validates the body of a GraphQL response. */
const graphqlResponseSchema = z.object({
  data: z.record(z.string(), z.unknown()).nullish(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

/** The events API served over HTTP from a migrated, seeded test database. */
export interface EventsApplication {
  readonly database: DatabaseTestingModule;
  readonly query: (
    document: string,
    variables?: Record<string, unknown>,
  ) => Promise<GraphqlResponse>;
  readonly stop: () => Promise<void>;
}

/** The tags {@link seedFilterTags} adds, by name. */
export interface FilterTags {
  readonly aspect: Tag;
  readonly body: Tag;
  readonly direction: Tag;
  readonly harmonic: Tag;
  readonly harmonic2: Tag;
  readonly harmonic6: Tag;
  readonly harmonic12: Tag;
  readonly luminary: Tag;
  readonly luminaryMoon: Tag;
  readonly major: Tag;
  readonly moon: Tag;
  readonly planet: Tag;
  readonly planetary: Tag;
  readonly sign: Tag;
  readonly signStay: Tag;
  readonly simple: Tag;
  readonly stay: Tag;
}

/** The body of a GraphQL response: data, errors, or both. */
export type GraphqlResponse = z.infer<typeof graphqlResponseSchema>;

/** One event of the fixture, as the entities take it. */
interface SeedEvent {
  readonly end: string;
  readonly name: string;
  readonly start: string;
  readonly tags: readonly Tag[];
  readonly timezone: string;
}

/**
 * Seeds the fixture tags and five events, then refreshes the read model.
 * Returns the tags by name.
 */
export async function seedEvents(
  database: DatabaseTestingModule,
): Promise<Record<string, Tag>> {
  const tags = tagRepository(database.dataSource);
  const planet = await tags.save(
    tags.create({ name: "Planet", slug: "planet" }),
  );
  const mars = await tags.save(
    tags.create({ name: "Mars", parent: planet, slug: "mars" }),
  );
  const retrograde = await tags.save(
    tags.create({ name: "Retrograde", parent: mars, slug: "retrograde" }),
  );
  const aspect = await tags.save(
    tags.create({ name: "Aspect", slug: "aspect" }),
  );
  const conjunct = await tags.save(
    tags.create({ name: "Conjunct", parent: aspect, slug: "conjunct" }),
  );
  const phase = await tags.save(
    tags.create({ name: "Phase", parent: aspect, slug: "phase" }),
  );
  const forming = await tags.save(
    tags.create({ name: "Forming", parent: phase, slug: "forming" }),
  );
  const events: SeedEvent[] = [
    {
      end: "2026-03-05T05:00:00.000Z",
      name: "Mars Retrograde",
      start: "2026-03-05T03:30:00.000Z",
      tags: [retrograde],
      timezone: "America/New_York",
    },
    {
      end: "2026-03-10T12:00:00.000Z",
      name: "Moon Conjunct Mars",
      start: "2026-03-10T12:00:00.000Z",
      tags: [conjunct],
      timezone: "America/New_York",
    },
    {
      end: "2026-03-20T09:00:00.000Z",
      name: "Sun Enters Aries",
      start: "2026-03-20T09:00:00.000Z",
      tags: [],
      timezone: "America/New_York",
    },
    {
      end: "2026-03-21T00:00:00.000Z",
      name: "Equinox Watch",
      start: "2026-03-20T22:00:00.000Z",
      tags: [],
      timezone: "Europe/London",
    },
  ];

  for (const seed of events) {
    const [event] = await database.dataSource.query<[{ id: string }]>(
      `insert into calendar_events
         (name, note, "start", "end", latitude, longitude, timezone)
       values ($1, $2, $3, $4, 40.7128, -74.006, $5)
       returning id`,
      [
        seed.name,
        `${seed.name} description`,
        seed.start,
        seed.end,
        seed.timezone,
      ],
    );

    for (const tag of seed.tags) {
      await database
        .repository(CalendarEventTag)
        .insert({ calendarEventId: event.id, tagId: tag.id });
    }
  }

  await database.module
    .get(CaelundasDatabaseService)
    .refreshMetrics(database.dataSource.manager);

  return { aspect, conjunct, forming, mars, phase, planet, retrograde };
}

/**
 * Adds the filter tags to the seeded fixture's events. Run {@link seedEvents} first.
 * Returns the tags by name.
 */
export async function seedFilterTags(
  database: DatabaseTestingModule,
): Promise<FilterTags> {
  const tags = tagRepository(database.dataSource);
  const planet = await tags.findOneByOrFail({ name: "Planet" });
  const aspect = await tags.findOneByOrFail({ name: "Aspect" });
  const moon = await tags.save(
    tags.create({ name: "Moon", parent: planet, slug: "moon" }),
  );
  const body = await tags.save(tags.create({ name: "Body", slug: "body" }));
  const luminary = await tags.save(
    tags.create({ name: "Luminary", parent: body, slug: "luminary" }),
  );
  const luminaryMoon = await tags.save(
    tags.create({ name: "Moon", parent: luminary, slug: "moon" }),
  );
  const simple = await tags.save(
    tags.create({ name: "Simple", parent: aspect, slug: "simple" }),
  );
  const major = await tags.save(
    tags.create({ name: "Major", parent: simple, slug: "major" }),
  );
  const sign = await tags.save(tags.create({ name: "Sign", slug: "sign" }));
  const stay = await tags.save(
    tags.create({ name: "Stay", parent: sign, slug: "stay" }),
  );
  const signStay = await tags.save(
    tags.create({
      name: "Full Sign",
      parent: stay,
      slug: "full-sign",
    }),
  );
  const planetary = await tags.save(
    tags.create({ name: "Planetary", slug: "planetary" }),
  );
  const direction = await tags.save(
    tags.create({ name: "Direction", parent: planetary, slug: "direction" }),
  );
  const harmonic = await tags.save(
    tags.create({ name: "Harmonic", parent: aspect, slug: "harmonic" }),
  );
  const harmonic2 = await tags.save(
    tags.create({ name: "Harmonic 2", parent: harmonic, slug: "harmonic-2" }),
  );
  const harmonic6 = await tags.save(
    tags.create({ name: "Harmonic 6", parent: harmonic, slug: "harmonic-6" }),
  );
  const harmonic12 = await tags.save(
    tags.create({ name: "Harmonic 12", parent: harmonic, slug: "harmonic-12" }),
  );
  const given: [string, Tag[]][] = [
    ["Moon Conjunct Mars", [major, moon, luminaryMoon, harmonic2]],
    ["Sun Enters Aries", [signStay, harmonic12]],
    ["Mars Retrograde", [direction]],
    ["Equinox Watch", [harmonic6]],
  ];

  for (const [name, eventTags] of given) {
    const [event] = await database.dataSource.query<[{ id: string }]>(
      `select id from calendar_events where "name" = $1`,
      [name],
    );

    for (const tag of eventTags) {
      await database
        .repository(CalendarEventTag)
        .insert({ calendarEventId: event.id, tagId: tag.id });
    }
  }

  await database.module
    .get(CaelundasDatabaseService)
    .refreshMetrics(database.dataSource.manager);

  return {
    aspect,
    body,
    direction,
    harmonic,
    harmonic2,
    harmonic6,
    harmonic12,
    luminary,
    luminaryMoon,
    major,
    moon,
    planet,
    planetary,
    sign,
    signStay,
    simple,
    stay,
  };
}

/**
 * Serves `EventsModule` over Apollo and Express, against a migrated Postgres
 * container on an ephemeral port. Nothing is seeded: call {@link seedEvents}.
 */
export async function startEventsApplication(): Promise<EventsApplication> {
  const database = await startDatabaseTestingModule({
    database: CaelundasDatabaseModule,
    entities: [...CAELUNDAS_DATABASE_ENTITIES],
    imports: [
      GraphQLModule.forRoot<ApolloDriverConfig>({
        autoSchemaFile: true,
        driver: ApolloDriver,
        playground: false,
      }),
      EventsModule,
    ],
    migrations: [...CAELUNDAS_DATABASE_MIGRATIONS],
    project: CAELUNDAS_PROJECT,
    validate: (config) => environmentSchema.parse(config),
  });

  try {
    const application =
      database.module.createNestApplication<INestApplication<Server>>();

    await application.listen(0, "127.0.0.1");
    const endpoint = `${await application.getUrl()}/graphql`;

    return {
      database,
      query: async (document, variables): Promise<GraphqlResponse> => {
        const response = await fetch(endpoint, {
          body: JSON.stringify({ query: document, variables }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        return graphqlResponseSchema.parse(await response.json());
      },
      stop: async (): Promise<void> => {
        await application.close();
        await database.close();
      },
    };
  } catch (error) {
    await database.close();
    throw error;
  }
}
