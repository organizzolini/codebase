import { describe, expect, it } from "vitest";

import { CorsService } from "./cors.service";

describe(CorsService, () => {
  const service = new CorsService();

  it("allows every origin when the wildcard is listed", () => {
    expect.hasAssertions();

    expect(service.getOptions(["*"])).toStrictEqual({ origin: "*" });
  });

  it("allows only the listed origins otherwise", () => {
    expect.hasAssertions();

    expect(service.getOptions(["http://localhost:3000"])).toStrictEqual({
      origin: ["http://localhost:3000"],
    });
  });
});
