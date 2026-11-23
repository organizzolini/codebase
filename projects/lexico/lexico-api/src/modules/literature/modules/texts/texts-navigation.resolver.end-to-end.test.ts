import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { Text } from "@codebase/lexico-db";

import {
  type AuthorTextApplication,
  startAuthorTextApplication,
} from "../../../../../testing/applications/author-text-application";
import { DATABASE_TIMEOUT_MILLISECONDS } from "../../../../../testing/database";

/** A text as the navigation fields select it. */
interface NavigationNode {
  readonly ancestors: readonly { readonly slug: string }[];
  readonly nextText: null | { readonly title: string };
  readonly previousText: null | { readonly title: string };
  readonly title: string;
}

/** Selects a text's siblings and ancestors, from the text itself. */
const NAVIGATION_FIELDS = `
  title
  previousText { title }
  nextText { title }
  ancestors { slug }
`;

/** Looks up one text by slug with its navigation fields and children. */
const TEXT_NAVIGATION = `
  query TextNavigation($slug: String!) {
    text(slug: $slug) {
      ${NAVIGATION_FIELDS}
      childTexts { edges { node { title } } }
    }
  }
`;

/** Pages every text with its navigation fields. */
const TEXTS_NAVIGATION = `
  query TextsNavigation($first: Int) {
    texts(first: $first) {
      edges { node { ${NAVIGATION_FIELDS} } }
    }
  }
`;

/**
 * Executes the `text` and `texts` queries' sibling and ancestor fields over
 * HTTP against the whole Lexico API and a real database. The Aeneid gains a
 * third book here, so the suite has a middle child, and it runs on its own
 * database so the shared catalog keeps its counts.
 */
describe("text navigation end-to-end suite", () => {
  let application: AuthorTextApplication;

  /** Executes an operation expected to succeed and returns its data. */
  async function query<Data>(
    document: string,
    variables?: Record<string, unknown>,
  ): Promise<Data> {
    const body = await application.execute(document, variables);

    expect(body.errors).toBeUndefined();

    if (!body.data) {
      throw new Error("GraphQL returned no data");
    }
    return body.data as Data;
  }

  /** Runs an operation and collects every SQL statement it issued. */
  async function statementsOf<Result>(
    run: () => Promise<Result>,
  ): Promise<{ result: Result; statements: string[] }> {
    const logQuery = vi.spyOn(
      application.server.get(DataSource).logger,
      "logQuery",
    );
    const result = await run();
    const statements = logQuery.mock.calls.map(([statement]) => statement);
    logQuery.mockRestore();
    return { result, statements };
  }

  beforeAll(async () => {
    application = await startAuthorTextApplication();

    const texts = application.server.get(DataSource).getRepository(Text);
    await texts.save(
      texts.create({
        author: application.catalog.vergil,
        parentText: application.catalog.aeneid,
        slug: "vergil/aeneid/3",
        title: "Book III",
        type: "book",
      }),
    );
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  /** Reads a text's navigation fields by slug. */
  async function navigationOf(slug: string): Promise<NavigationNode> {
    const { text } = await query<{ text: NavigationNode }>(TEXT_NAVIGATION, {
      slug,
    });
    return text;
  }

  it("links a middle child to both of its siblings and to its root", async () => {
    expect.hasAssertions();

    const book = await navigationOf("vergil/aeneid/2");

    expect(book.previousText).toStrictEqual({ title: "Book I" });
    expect(book.nextText).toStrictEqual({ title: "Book III" });
    expect(book.ancestors).toStrictEqual([{ slug: "vergil/aeneid" }]);
  });

  it("has no previous sibling for the first child", async () => {
    expect.hasAssertions();

    const book = await navigationOf("vergil/aeneid/1");

    expect(book.previousText).toBeNull();
    expect(book.nextText).toStrictEqual({ title: "Book II" });
  });

  it("has no next sibling for the last child", async () => {
    expect.hasAssertions();

    const book = await navigationOf("vergil/aeneid/3");

    expect(book.previousText).toStrictEqual({ title: "Book II" });
    expect(book.nextText).toBeNull();
  });

  it("has no siblings and no ancestors for a top-level text", async () => {
    expect.hasAssertions();

    const corpus = await navigationOf("vergil/aeneid");

    expect(corpus.previousText).toBeNull();
    expect(corpus.nextText).toBeNull();
    expect(corpus.ancestors).toStrictEqual([]);
  });

  it("lists ancestors root first, climbing past the immediate parent", async () => {
    expect.hasAssertions();

    const section = await navigationOf("vergil/aeneid/1/proem");

    expect(section.ancestors).toStrictEqual([
      { slug: "vergil/aeneid" },
      { slug: "vergil/aeneid/1" },
    ]);
    expect(section.previousText).toBeNull();
    expect(section.nextText).toBeNull();
  });

  it("orders siblings as the parent's child texts are listed", async () => {
    expect.hasAssertions();

    const { text } = await query<{
      text: {
        childTexts: { edges: { node: { title: string } }[] };
      };
    }>(TEXT_NAVIGATION, { slug: "vergil/aeneid" });
    const listed = text.childTexts.edges.map((edge) => edge.node.title);

    expect(listed).toStrictEqual(["Book I", "Book II", "Book III"]);

    const middle = await navigationOf("vergil/aeneid/2");

    expect([middle.previousText?.title, middle.nextText?.title]).toStrictEqual([
      listed[0],
      listed[2],
    ]);
  });

  it("costs the same statements for one text as for every text, whatever each one links to", async () => {
    expect.hasAssertions();

    const one = await statementsOf(async () =>
      query<{
        texts: { edges: { node: NavigationNode }[] };
      }>(TEXTS_NAVIGATION, { first: 1 }),
    );
    const every = await statementsOf(async () =>
      query<{
        texts: { edges: { node: NavigationNode }[] };
      }>(TEXTS_NAVIGATION, {}),
    );

    expect(one.statements.length).toBeGreaterThan(0);
    expect(every.result.texts.edges.length).toBeGreaterThan(1);
    expect(every.statements).toHaveLength(one.statements.length);
  });
});
