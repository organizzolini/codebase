import { afterEach, describe, expect, it, vi } from "vitest";

import { stubFetch } from "@codebase/testing";

import { DatasetDocument } from "../../graphql/generated/operations";

import { DEFAULT_CAELUNDAS_API_URL } from "./events-api.constants";
import { queryApi } from "./events-api.utilities";

/**
 * Stands in for `fetch`, answering with a JSON body.
 */
function answer(body: unknown): ReturnType<typeof stubFetch> {
  return stubFetch(Response.json(body));
}

describe("graphql client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("calls the local default address when the build variable is empty", async () => {
    expect.hasAssertions();

    const stub = answer({ data: { dataset: null } });
    vi.stubEnv("VITE_CAELUNDAS_API_URL", "");

    await queryApi(DatasetDocument, {});

    expect(stub).toHaveBeenCalledWith(
      DEFAULT_CAELUNDAS_API_URL,
      expect.anything(),
    );
  });

  it("calls the address the build variable gives", async () => {
    expect.hasAssertions();

    const stub = answer({ data: { dataset: null } });
    vi.stubEnv("VITE_CAELUNDAS_API_URL", "https://api.example.test/graphql");

    await queryApi(DatasetDocument, {});

    expect(stub).toHaveBeenCalledWith(
      "https://api.example.test/graphql",
      expect.anything(),
    );
  });

  it("posts the printed document to the API and returns its data", async () => {
    expect.hasAssertions();

    const data = {
      dataset: { count: 1, end: "b", start: "a", timezone: "UTC" },
    };
    const stub = answer({ data });
    vi.stubEnv("VITE_CAELUNDAS_API_URL", "");

    await expect(queryApi(DatasetDocument, {})).resolves.toStrictEqual(data);
    expect(stub).toHaveBeenCalledWith(
      DEFAULT_CAELUNDAS_API_URL,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws the first error the API reports", async () => {
    expect.hasAssertions();

    answer({ errors: [{ message: "no window" }] });

    await expect(queryApi(DatasetDocument, {})).rejects.toThrow("no window");
  });
});
