import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CorsService } from "./cors.service";

describe(CorsService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(CorsService);

    expect(instance).toBeInstanceOf(CorsService);
  });

  it("allows every origin when the wildcard is listed", () => {
    expect.hasAssertions();

    expect(new CorsService().getOptions(["*"])).toStrictEqual({ origin: "*" });
  });

  it("allows only the listed origins otherwise", () => {
    expect.hasAssertions();

    expect(
      new CorsService().getOptions(["https://app.example.com"]),
    ).toStrictEqual({ origin: ["https://app.example.com"] });
  });

  it("allows no origin when none are listed", () => {
    expect.hasAssertions();

    expect(new CorsService().getOptions([])).toStrictEqual({ origin: [] });
  });
});
