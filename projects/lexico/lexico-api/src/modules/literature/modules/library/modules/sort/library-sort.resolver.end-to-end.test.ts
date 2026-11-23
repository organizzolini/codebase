/* cspell:words Aulus Gaius Lucius Marcus Quintus Srt Txs Zeno */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { Author, Text, textCollection } from "@codebase/lexico-db";

import {
  type LibraryApplication,
  startLibraryApplication,
} from "../../../../../../../testing/applications/library-application";
import { DATABASE_TIMEOUT_MILLISECONDS } from "../../../../../../../testing/database";

import {
  LibrarySortDirection,
  LibrarySortField,
} from "./library-sort.entities";

/** A page of cards as this suite's `LIBRARY` query selects them. */
interface SortedPage {
  readonly authors: {
    readonly author: { readonly name: string };
    readonly works: { readonly text: { readonly title: string } }[];
  }[];
}

/** Orders the library and names each card's author and Texts. */
const LIBRARY = `
  query Library($search: String, $filters: LibraryFilters, $sort: [LibrarySort!], $group: [LibraryGroupField!]) {
    library(search: $search, filters: $filters, sort: $sort, group: $group) {
      authors { author { name } works { text { title } } }
    }
  }
`;

/** The author the Text cases order, matched by this search. */
const TEXT_SEARCH = "txs keeper";

/** The authors the author cases order, all matched by this search. */
const AUTHOR_SEARCH = "srt";

/** Author sort cases: field and ascending names; Omega sorts last. */
const AUTHOR_CASES: readonly [LibrarySortField, readonly string[]][] = [
  [
    LibrarySortField.AUTHOR_END_YEAR,
    ["Alpha", "Beta", "Delta", "Zeta", "Epsilon", "Gamma"],
  ],
  [
    LibrarySortField.AUTHOR_ERA,
    ["Alpha", "Beta", "Gamma", "Delta", "Zeta", "Epsilon"],
  ],
  [
    LibrarySortField.AUTHOR_FULL_NAME,
    ["Epsilon", "Gamma", "Zeta", "Beta", "Delta", "Alpha"],
  ],
  [
    LibrarySortField.AUTHOR_NAME,
    ["Alpha", "Beta", "Delta", "Epsilon", "Gamma", "Omega", "Zeta"],
  ],
  [
    LibrarySortField.AUTHOR_START_YEAR,
    ["Alpha", "Beta", "Gamma", "Delta", "Zeta", "Epsilon"],
  ],
];

/** Text sort cases: [field, ascending titles]; Echo has no value for any. */
const TEXT_CASES: readonly [LibrarySortField, readonly string[]][] = [
  [LibrarySortField.TEXT_COLLECTION, ["Delta", "Bravo", "Alpha", "Charlie"]],
  [LibrarySortField.TEXT_EDITION, ["Charlie", "Delta", "Bravo", "Alpha"]],
  [LibrarySortField.TEXT_END_YEAR, ["Bravo", "Alpha", "Charlie", "Delta"]],
  [LibrarySortField.TEXT_LINE_COUNT, ["Alpha", "Charlie", "Delta", "Bravo"]],
  [LibrarySortField.TEXT_PRINT_YEAR, ["Charlie", "Bravo", "Delta", "Alpha"]],
  [
    LibrarySortField.TEXT_RECOGNISED_WORD_COUNT,
    ["Delta", "Charlie", "Alpha", "Bravo"],
  ],
  [LibrarySortField.TEXT_START_YEAR, ["Bravo", "Alpha", "Delta", "Charlie"]],
  [LibrarySortField.TEXT_WORD_COUNT, ["Delta", "Charlie", "Bravo", "Alpha"]],
];

/** Authors sharing an era, to show a second sort breaking the tie. */
const MULTI_SEARCH = "mls";

/** Lists a sort direction's expected order: descending reverses the values. */
function directed(
  values: readonly string[],
  direction: LibrarySortDirection,
): string[] {
  return direction === LibrarySortDirection.ASC
    ? [...values]
    : values.toReversed();
}

/**
 * Orders the library by every sort field in both directions, over rows
 * seeded for the suite and removed after it.
 */
describe("library sort end-to-end suite", () => {
  let application: LibraryApplication;
  const authorIds: string[] = [];
  const textIds: string[] = [];

  /** Runs the library query, expecting success. */
  async function library(
    variables: Record<string, unknown>,
  ): Promise<SortedPage> {
    const body = await application.execute(LIBRARY, variables);

    expect(body.errors).toBeUndefined();

    return (body.data as { library: SortedPage }).library;
  }

  /** Seeds authors with distinct eras and years, and one with no attributes. */
  async function seedAuthors(): Promise<void> {
    const authors = application.database.repository(Author);
    const rows = [
      ["Alpha", "Archaic", -500, -400, "Srt Zeno"],
      ["Beta", "Classical", -100, 10, "Srt Marcus"],
      ["Gamma", "Imperial", 50, 2000, "Srt Gaius"],
      ["Delta", "Late", 300, 400, "Srt Quintus"],
      ["Zeta", "Medieval", 800, 900, "Srt Lucius"],
      ["Epsilon", "Neo-Latin", 1500, 1600, "Srt Aulus"],
    ] as const;
    for (const [name, era, startYear, endYear, fullName] of rows) {
      const saved = await authors.save(
        authors.create({
          endYear,
          era,
          fullName,
          name: `Srt ${name}`,
          slug: `srt-${name.toLowerCase()}`,
          startYear,
        }),
      );
      authorIds.push(saved.id);
    }
    const omega = await authors.save(
      authors.create({ name: "Srt Omega", slug: "srt-omega" }),
    );
    authorIds.push(omega.id);
  }

  /** Seeds one author whose Texts differ in every sortable attribute. */
  async function seedTexts(): Promise<void> {
    const keeper = await application.database
      .repository(Author)
      .save(
        application.database
          .repository(Author)
          .create({ name: "Txs Keeper", slug: "txs-keeper" }),
      );
    authorIds.push(keeper.id);
    const texts = application.database.repository(Text);
    const rows = [
      ["Delta", textCollection.perseus, "B", 10, 100, 30, 1900, 5, 10],
      ["Alpha", textCollection.csel, "D", -50, 10, 10, 1950, 25, 40],
      ["Charlie", textCollection.edcs, "A", 20, 50, 20, 1800, 15, 20],
      [
        "Bravo",
        textCollection.theLatinLibrary,
        "C",
        -200,
        -100,
        40,
        1850,
        35,
        30,
      ],
    ] as const;
    for (const [
      title,
      collection,
      edition,
      start,
      end,
      lines,
      print,
      recognised,
      words,
    ] of rows) {
      const saved = await texts.save(
        texts.create({
          author: keeper,
          collection,
          edition,
          endYear: end,
          lineCount: lines,
          printYear: print,
          recognisedWordCount: recognised,
          slug: `txs-keeper/${title.toLowerCase()}`,
          startYear: start,
          title,
          type: "text",
          wordCount: words,
        }),
      );
      textIds.push(saved.id);
    }
    const echo = await texts.save(
      texts.create({
        author: keeper,
        slug: "txs-keeper/echo",
        title: "Echo",
        type: "text",
      }),
    );
    textIds.push(echo.id);
  }

  /** Seeds authors that tie on era, so the second sort decides their order. */
  async function seedTies(): Promise<void> {
    const authors = application.database.repository(Author);
    const rows = [
      ["Mls Ant", "Classical", 10],
      ["Mls Bee", "Classical", 20],
      ["Mls Cat", "Imperial", 5],
    ] as const;
    for (const [name, era, startYear] of rows) {
      const saved = await authors.save(
        authors.create({
          era,
          name,
          slug: name.toLowerCase().replaceAll(" ", "-"),
          startYear,
        }),
      );
      authorIds.push(saved.id);
    }
  }

  beforeAll(async () => {
    application = await startLibraryApplication();
    await seedAuthors();
    await seedTexts();
    await seedTies();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.database.repository(Text).delete(textIds);
    await application.database.repository(Author).delete(authorIds);
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("covers every sort field", () => {
    expect.hasAssertions();

    const covered = [
      ...AUTHOR_CASES.map(([field]) => field),
      ...TEXT_CASES.map(([field]) => field),
      LibrarySortField.TEXT_TITLE,
    ];

    expect(covered.toSorted()).toStrictEqual(
      Object.values(LibrarySortField).toSorted(),
    );
  });

  describe.each([LibrarySortDirection.ASC, LibrarySortDirection.DESC])(
    "ordering %s",
    (direction) => {
      it.each(AUTHOR_CASES)(
        "orders the authors by %s",
        async (field, names) => {
          expect.hasAssertions();

          const page = await library({
            search: AUTHOR_SEARCH,
            sort: [{ direction, field }],
          });
          const expected = directed(names, direction);
          // 🔚 Omega has no value for any attribute but its name, so it sorts
          // last in both directions, except when the name is the sort.
          const order =
            field === LibrarySortField.AUTHOR_NAME
              ? expected
              : [...expected, "Omega"];

          expect(page.authors.map(({ author }) => author.name)).toStrictEqual(
            order.map((name) => `Srt ${name}`),
          );
        },
      );

      it.each(TEXT_CASES)("orders the Texts by %s", async (field, titles) => {
        expect.hasAssertions();

        const page = await library({
          search: TEXT_SEARCH,
          sort: [{ direction, field }],
        });

        expect(
          page.authors[0]?.works.map(({ text }) => text.title),
        ).toStrictEqual([...directed(titles, direction), "Echo"]);
      });
    },
  );

  it.each([LibrarySortDirection.ASC, LibrarySortDirection.DESC])(
    "orders the Texts by title %s",
    async (direction) => {
      expect.hasAssertions();

      const page = await library({
        search: TEXT_SEARCH,
        sort: [{ direction, field: LibrarySortField.TEXT_TITLE }],
      });

      expect(
        page.authors[0]?.works.map(({ text }) => text.title),
      ).toStrictEqual(
        directed(["Alpha", "Bravo", "Charlie", "Delta", "Echo"], direction),
      );
    },
  );

  it.each([
    [
      LibrarySortDirection.ASC,
      LibrarySortDirection.ASC,
      ["Mls Ant", "Mls Bee", "Mls Cat"],
    ],
    [
      LibrarySortDirection.ASC,
      LibrarySortDirection.DESC,
      ["Mls Bee", "Mls Ant", "Mls Cat"],
    ],
    [
      LibrarySortDirection.DESC,
      LibrarySortDirection.ASC,
      ["Mls Cat", "Mls Ant", "Mls Bee"],
    ],
  ])(
    "orders by era %s, then by start year %s, in list order",
    async (eraDirection, yearDirection, names) => {
      expect.hasAssertions();

      const page = await library({
        search: MULTI_SEARCH,
        sort: [
          { direction: eraDirection, field: LibrarySortField.AUTHOR_ERA },
          {
            direction: yearDirection,
            field: LibrarySortField.AUTHOR_START_YEAR,
          },
        ],
      });

      expect(page.authors.map(({ author }) => author.name)).toStrictEqual(
        names,
      );
    },
  );

  it("lets the first sort lead when the order of the same two is swapped", async () => {
    expect.hasAssertions();

    const page = await library({
      search: MULTI_SEARCH,
      sort: [
        {
          direction: LibrarySortDirection.ASC,
          field: LibrarySortField.AUTHOR_START_YEAR,
        },
        {
          direction: LibrarySortDirection.ASC,
          field: LibrarySortField.AUTHOR_ERA,
        },
      ],
    });

    expect(page.authors.map(({ author }) => author.name)).toStrictEqual([
      "Mls Cat",
      "Mls Ant",
      "Mls Bee",
    ]);
  });

  it("leads with the group, so its authors keep together, then orders by the sorts", async () => {
    expect.hasAssertions();

    const page = await library({
      group: ["ERA"],
      search: MULTI_SEARCH,
      sort: [
        {
          direction: LibrarySortDirection.ASC,
          field: LibrarySortField.AUTHOR_START_YEAR,
        },
      ],
    });

    expect(page.authors.map(({ author }) => author.name)).toStrictEqual([
      "Mls Ant",
      "Mls Bee",
      "Mls Cat",
    ]);
  });

  it("orders the groups in the direction the era sort names", async () => {
    expect.hasAssertions();

    const page = await library({
      group: ["ERA"],
      search: MULTI_SEARCH,
      sort: [
        {
          direction: LibrarySortDirection.DESC,
          field: LibrarySortField.AUTHOR_ERA,
        },
      ],
    });

    expect(page.authors.map(({ author }) => author.name)).toStrictEqual([
      "Mls Cat",
      "Mls Ant",
      "Mls Bee",
    ]);
  });
});
