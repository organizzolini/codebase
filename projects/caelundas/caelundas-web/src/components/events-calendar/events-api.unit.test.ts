import { afterEach, describe, expect, it, vi } from "vitest";

import { DatasetDocument } from "../../graphql/generated/operations";

import { DEFAULT_CAELUNDAS_API_URL } from "./events-api.constants";
import { queryApi, readApiUrl } from "./events-api.utilities";

/**
 * Stands in for `fetch`, answering with a JSON body.
 */
function answer(body: unknown): ReturnType<typeof vi.fn> {
  const stub = vi.fn<typeof fetch>().mockResolvedValue(Response.json(body));
  vi.stubGlobal("fetch", stub);
  return stub;
}

describe("graphql client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reads the API address from the local default", () => {
    expect.hasAssertions();

    vi.stubEnv("VITE_CAELUNDAS_API_URL", "");

    expect(readApiUrl()).toBe(DEFAULT_CAELUNDAS_API_URL);
  });

  it("reads the API address from the build variable", () => {
    expect.hasAssertions();

    vi.stubEnv("VITE_CAELUNDAS_API_URL", "https://api.example.test/graphql");

    expect(readApiUrl()).toBe("https://api.example.test/graphql");
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
