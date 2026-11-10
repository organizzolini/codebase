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
  Tag,
} from "@codebase/caelundas-db";
import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import { environmentSchema } from "../src/caelundas-api.constants";
import { EventsModule } from "../src/modules/events/events.module";

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
  readonly direction: Tag;
  readonly harmonic: Tag;
  readonly harmonic2: Tag;
  readonly harmonic6: Tag;
  readonly harmonic12: Tag;
  readonly ingress: Tag;
  readonly major: Tag;
  readonly moon: Tag;
  readonly planet: Tag;
  readonly signIngress: Tag;
  readonly simple: Tag;
  readonly type: Tag;
}

/** The body of a GraphQL response: data, errors, or both. */
export type GraphqlResponse = z.infer<typeof graphqlResponseSchema>;

/** One event of the fixture, as the entities take it. */
interface SeedEvent {
  readonly end: string;
  readonly start: string;
  readonly summary: string;
  readonly tags: readonly Tag[];
  readonly timezone: string;
}

/**
 * Seeds a small fixture and refreshes the read model: the tag chains
 * Planet / Mars / Retrograde, Aspect / Conjunct and Phase / Forming, and five events,
 * four observed in New York and one in London. Returns the tags by name.
 */
export async function seedEvents(
  database: DatabaseTestingModule,
): Promise<Record<string, Tag>> {
  const tags = database.dataSource.getTreeRepository(Tag);
  const planet = await tags.save(tags.create({ name: "Planet" }));
  const mars = await tags.save(tags.create({ name: "Mars", parent: planet }));
  const retrograde = await tags.save(
    tags.create({ name: "Retrograde", parent: mars }),
  );
  const aspect = await tags.save(tags.create({ name: "Aspect" }));
  const conjunct = await tags.save(
    tags.create({ name: "Conjunct", parent: aspect }),
  );
  const phase = await tags.save(tags.create({ name: "Phase" }));
  const forming = await tags.save(
    tags.create({ name: "Forming", parent: phase }),
  );
  const events: SeedEvent[] = [
    {
      end: "2026-03-05T05:00:00.000Z",
      start: "2026-03-05T03:30:00.000Z",
      summary: "Mars Retrograde",
      tags: [retrograde],
      timezone: "America/New_York",
    },
    {
      end: "2026-03-10T12:00:00.000Z",
      start: "2026-03-10T12:00:00.000Z",
      summary: "Moon Conjunct Mars",
      tags: [conjunct],
      timezone: "America/New_York",
    },
    {
      end: "2026-03-10T12:00:00.000Z",
      start: "2026-03-10T12:00:00.000Z",
      summary: "Moon Conjunct Mars Forming",
      tags: [conjunct, forming],
      timezone: "America/New_York",
    },
    {
      end: "2026-03-20T09:00:00.000Z",
      start: "2026-03-20T09:00:00.000Z",
      summary: "Sun Enters Aries",
      tags: [],
      timezone: "America/New_York",
    },
    {
      end: "2026-03-21T00:00:00.000Z",
      start: "2026-03-20T22:00:00.000Z",
      summary: "Equinox Watch",
      tags: [],
      timezone: "Europe/London",
    },
  ];

  for (const seed of events) {
    const [event] = await database.dataSource.query<[{ id: string }]>(
      `insert into calendar_events
         (summary, description, "start", "end", latitude, longitude, timezone)
       values ($1, $2, $3, $4, 40.7128, -74.006, $5)
       returning id`,
      [
        seed.summary,
        `${seed.summary} description`,
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
    .refreshReadModel(database.dataSource.manager);

  return { aspect, conjunct, forming, mars, phase, planet, retrograde };
}

/**
 * Adds the tags the filters and presets read to the seeded fixture, and
 * gives them to its events: the Type chains Aspect / Simple Aspect / Major
 * Aspect, Ingress / Sign Ingress and Direction, the planet Moon, and the
 * numbered root Aspect Harmonic with Harmonic 2, Harmonic 6 and Harmonic 12.
 * Moon Conjunct Mars is a Major Aspect with the Moon and Harmonic 2; Sun
 * Enters Aries a Sign Ingress with Harmonic 12; Mars Retrograde a Direction;
 * Equinox Watch has Harmonic 6. Run {@link seedEvents} first. Returns the
 * tags by name.
 */
export async function seedFilterTags(
  database: DatabaseTestingModule,
): Promise<FilterTags> {
  const tags = database.dataSource.getTreeRepository(Tag);
  const planet = await tags.findOneByOrFail({ name: "Planet" });
  const moon = await tags.save(tags.create({ name: "Moon", parent: planet }));
  const type = await tags.save(tags.create({ name: "Type" }));
  const aspect = await tags.save(tags.create({ name: "Aspect", parent: type }));
  const simple = await tags.save(
    tags.create({ name: "Simple Aspect", parent: aspect }),
  );
  const major = await tags.save(
    tags.create({ name: "Major Aspect", parent: simple }),
  );
  const ingress = await tags.save(
    tags.create({ name: "Ingress", parent: type }),
  );
  const signIngress = await tags.save(
    tags.create({ name: "Sign Ingress", parent: ingress }),
  );
  const direction = await tags.save(
    tags.create({ name: "Direction", parent: type }),
  );
  const harmonic = await tags.save(tags.create({ name: "Aspect Harmonic" }));
  const harmonic2 = await tags.save(
    tags.create({ name: "Harmonic 2", parent: harmonic }),
  );
  const harmonic6 = await tags.save(
    tags.create({ name: "Harmonic 6", parent: harmonic }),
  );
  const harmonic12 = await tags.save(
    tags.create({ name: "Harmonic 12", parent: harmonic }),
  );
  const given: [string, Tag[]][] = [
    ["Moon Conjunct Mars", [major, moon, harmonic2]],
    ["Sun Enters Aries", [signIngress, harmonic12]],
    ["Mars Retrograde", [direction]],
    ["Equinox Watch", [harmonic6]],
  ];

  for (const [summary, eventTags] of given) {
    const [event] = await database.dataSource.query<[{ id: string }]>(
      `select id from calendar_events where "summary" = $1`,
      [summary],
    );

    for (const tag of eventTags) {
      await database
        .repository(CalendarEventTag)
        .insert({ calendarEventId: event.id, tagId: tag.id });
    }
  }

  await database.module
    .get(CaelundasDatabaseService)
    .refreshReadModel(database.dataSource.manager);

  return {
    aspect,
    direction,
    harmonic,
    harmonic2,
    harmonic6,
    harmonic12,
    ingress,
    major,
    moon,
    planet,
    signIngress,
    simple,
    type,
  };
}

/**
 * Serves `EventsModule` the way the API does, Apollo over Express and
 * `CaelundasDatabaseModule` read from `CAELUNDAS_POSTGRES_*`, against a
 * Postgres container built by the real migration, on an ephemeral port.
 * Nothing is seeded: call {@link seedEvents}.
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
