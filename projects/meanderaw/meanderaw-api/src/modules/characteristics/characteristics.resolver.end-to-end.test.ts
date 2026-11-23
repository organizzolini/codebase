import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { catalogEntry, meanderRow } from "../../../testing/fixtures";
import {
  DATABASE_TIMEOUT_MILLISECONDS,
  seedMeanderaw,
  startMeanderawApplication,
} from "../../../testing/meanderaw-application";

import { CharacteristicsModule } from "./characteristics.module";

import type { MeanderawApplication } from "../../../testing/meanderaw-application";

const CATALOG_QUERY = `{ characteristics {
  key name description category valueType isPattern formula documentationUrl meanderCount
  valueCounts { value meanderCount }
} }`;

/** Sends the catalog query over HTTP to a migrated, seeded Postgres. */
describe("characteristics resolver end-to-end suite", () => {
  let application: MeanderawApplication;

  beforeAll(async () => {
    application = await startMeanderawApplication([CharacteristicsModule]);
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("answers an empty catalog before any draw run", async () => {
    expect.hasAssertions();

    const body = await application.query(CATALOG_QUERY);

    expect(body.errors).toBeUndefined();
    expect(body.data).toStrictEqual({ characteristics: [] });
  });

  it("lists the catalog by key, each with its stored value counts", async () => {
    expect.hasAssertions();

    await seedMeanderaw(
      application.database,
      [
        catalogEntry("junctionCount", {
          category: "path",
          formula: "count(junctions)",
        }),
        catalogEntry("isChain", {
          category: "compound",
          documentationUrl: "https://example.test/chain",
          isPattern: true,
        }),
        catalogEntry("unusedCount"),
      ],
      [
        meanderRow({
          characteristics: { isChain: true, junctionCount: 2 },
          code: "01x01y0",
        }),
        meanderRow({
          characteristics: { isChain: true, junctionCount: 5 },
          code: "01x01y1",
        }),
        meanderRow({
          characteristics: { junctionCount: 2 },
          code: "01x01y2",
        }),
      ],
    );

    const body = await application.query(CATALOG_QUERY);

    expect(body.errors).toBeUndefined();
    expect(body.data).toStrictEqual({
      characteristics: [
        {
          category: "compound",
          description: "How isChain measures a meander.",
          documentationUrl: "https://example.test/chain",
          formula: null,
          isPattern: true,
          key: "isChain",
          meanderCount: 2,
          name: "isChain",
          valueCounts: [{ meanderCount: 2, value: 1 }],
          valueType: "boolean",
        },
        {
          category: "path",
          description: "How junctionCount measures a meander.",
          documentationUrl: null,
          formula: "count(junctions)",
          isPattern: false,
          key: "junctionCount",
          meanderCount: 3,
          name: "junctionCount",
          valueCounts: [
            { meanderCount: 2, value: 2 },
            { meanderCount: 1, value: 5 },
          ],
          valueType: "number",
        },
        {
          category: "path",
          description: "How unusedCount measures a meander.",
          documentationUrl: null,
          formula: null,
          isPattern: false,
          key: "unusedCount",
          meanderCount: 0,
          name: "unusedCount",
          valueCounts: [],
          valueType: "number",
        },
      ],
    });
  });
});
