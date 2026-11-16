/* cspell:words canō */

import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { Token } from "@codebase/lexico-db";

import { DATABASE_TIMEOUT_MILLISECONDS } from "../../../testing/database";
import {
  type ReadingApplication,
  startReadingApplication,
} from "../../../testing/reading-application";
import { passageLineAt } from "../../../testing/reading-passage";

/** A word candidate as the card selects one. */
interface Candidate {
  readonly definition: null | string;
  readonly description: string;
  readonly lemma: string;
  readonly lexemeId: string;
  readonly partOfSpeech: string;
}

/** A token as the candidates test selects one. */
interface CandidateToken {
  readonly data: string;
  readonly id: string;
}

/** The token connection the lookup below selects. */
interface TokenConnection {
  readonly edges: readonly { readonly node: CandidateToken }[];
}

/** The first line's tokens, to find each token's identifier by its spelling. */
const LINE_TOKENS = `
  query LineTokens($lineId: ID!) {
    tokens(lineId: $lineId, first: 20) {
      edges { node { id data } }
    }
  }
`;

/** The word card's query for one token. */
const WORD_CANDIDATES = `
  query WordCandidates($tokenId: ID!) {
    wordCandidates(tokenId: $tokenId) {
      definition
      description
      lemma
      lexemeId
      partOfSpeech
    }
  }
`;

describe("word candidates end to end", () => {
  let application: ReadingApplication;
  let tokenIds: Map<string, string>;

  beforeAll(async () => {
    application = await startReadingApplication();
    const response = await application.execute(LINE_TOKENS, {
      lineId: passageLineAt(application.passage, 0).id,
    });
    const tokens = response.data?.["tokens"] as TokenConnection | undefined;
    const edges = tokens?.edges ?? [];
    tokenIds = new Map(edges.map(({ node }) => [node.data, node.id]));
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.close();
  });

  /** Asks the word card for the candidates of the token with this spelling. */
  async function candidatesFor(data: string): Promise<Candidate[]> {
    const tokenId = tokenIds.get(data);
    if (tokenId === undefined) {
      throw new Error(`The passage has no token "${data}"`);
    }
    const response = await application.execute(WORD_CANDIDATES, { tokenId });

    expect(response.errors).toBeUndefined();

    return response.data?.["wordCandidates"] as Candidate[];
  }

  it("returns one candidate for an unambiguous word", async () => {
    await expect(candidatesFor("cano")).resolves.toStrictEqual([
      {
        definition: "to sing",
        description: "present indicative active first singular",
        lemma: "canō",
        lexemeId: expect.any(String),
        partOfSpeech: "verb",
      },
    ]);
  });

  it("returns every candidate for an ambiguous spelling", async () => {
    const candidates = await candidatesFor("arma");

    expect(candidates.map((candidate) => candidate.description)).toStrictEqual([
      "nominative plural",
      "accusative plural",
    ]);
    expect(
      new Set(candidates.map((candidate) => candidate.lexemeId)).size,
    ).toBe(1);
  });

  it("returns no candidates for a word whose dictionary entry has no forms", async () => {
    await expect(candidatesFor("virumque")).resolves.toStrictEqual([]);
  });

  it("returns no candidates for a word token that has no word", async () => {
    const tokens = application.server.get(DataSource).getRepository(Token);
    const canoId = tokenIds.get("cano");
    if (canoId === undefined) {
      throw new Error('The passage has no token "cano"');
    }
    const template = await tokens.findOneOrFail({
      relations: { author: true, line: true, text: true },
      where: { id: canoId },
    });
    const orphan = await tokens.save(
      Object.assign(new Token(), {
        author: template.author,
        data: "orphan",
        index: 99,
        isPunctuation: false,
        line: template.line,
        text: template.text,
        word: null,
      }),
    );
    const response = await application.execute(WORD_CANDIDATES, {
      tokenId: orphan.id,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.["wordCandidates"]).toStrictEqual([]);
  });

  it("returns no candidates for a punctuation token", async () => {
    await expect(candidatesFor(",")).resolves.toStrictEqual([]);
  });
});
