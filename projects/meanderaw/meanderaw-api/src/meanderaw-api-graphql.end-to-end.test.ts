import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  DATABASE_TIMEOUT_MILLISECONDS,
  startMeanderawApplication,
} from "../testing/meanderaw-application";

import { CharacteristicsModule } from "./modules/characteristics/characteristics.module";

import type { MeanderawApplication } from "../testing/meanderaw-application";

/** Sends cross-origin requests to the API the way the web app's browser does. */
describe("meanderaw api cors end-to-end suite", () => {
  let application: MeanderawApplication;
  const webOrigin = "http://localhost:2161";

  beforeAll(async () => {
    application = await startMeanderawApplication(
      [CharacteristicsModule],
      [webOrigin],
    );
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("answers the preflight of a GraphQL post from an allowed origin", async () => {
    expect.hasAssertions();

    const response = await fetch(application.endpoint, {
      headers: {
        "access-control-request-headers":
          "apollo-require-preflight,content-type",
        "access-control-request-method": "POST",
        origin: webOrigin,
      },
      method: "OPTIONS",
    });

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(webOrigin);
    expect(response.headers.get("access-control-allow-methods")).toContain(
      "POST",
    );
  });

  it("echoes the allowed origin on a cross-origin query", async () => {
    expect.hasAssertions();

    const response = await fetch(application.endpoint, {
      body: JSON.stringify({ query: "{ characteristics { key } }" }),
      headers: { "content-type": "application/json", origin: webOrigin },
      method: "POST",
    });

    expect(response.headers.get("access-control-allow-origin")).toBe(webOrigin);
  });

  it("withholds the cross-origin headers from an origin that is not allowed", async () => {
    expect.hasAssertions();

    const response = await fetch(application.endpoint, {
      headers: {
        "access-control-request-method": "POST",
        origin: "http://evil.example",
      },
      method: "OPTIONS",
    });

    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
});
