import {
  InvalidConfigurationError,
  InvalidLimitValueError,
} from "@codometer/core";
import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ConfigurationResolverService } from "./configuration-resolver.service";

// What a file's contents become once every default is applied. The facade's
// own suite drives this through `loadConfiguration`, which reads a real file
// first; these reach the resolver directly, so a default that moved is a
// failure here rather than a puzzle about which layer changed.
describe(ConfigurationResolverService, () => {
  let service: ConfigurationResolverService;

  beforeAll(async () => {
    const { instance } = await buildTestingModule(ConfigurationResolverService);
    service = instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(ConfigurationResolverService);

    expect(instance).toBeInstanceOf(ConfigurationResolverService);
  });

  it("refuses a configuration that names no format", () => {
    expect(() => service.parseConfiguration({})).toThrow(
      InvalidConfigurationError,
    );
  });

  it("keeps a validated configuration's own fields", () => {
    expect(service.parseConfiguration({ format: "json" })).toStrictEqual({
      format: "json",
    });
  });

  it("prepends the built-in codebase input and the built-in exclusions", () => {
    const resolved = service.resolveConfiguration({ format: "markdown" });

    expect(resolved.inputs.map((input) => input.name)).toStrictEqual([
      "codebase",
    ]);
    expect(resolved.exclude).toContain("**/node_modules/**");
    expect(resolved.python.command).toBe("python3");
  });

  it("reads a limit written with a decimal unit as a number of bytes", () => {
    const resolved = service.resolveConfiguration({
      format: "markdown",
      limits: [{ metric: "codebase.size", value: "8 KB" }],
    });

    expect(resolved.limits).toStrictEqual([
      {
        label: undefined,
        metric: "codebase.size",
        severity: "fail",
        value: 8000,
      },
    ]);
  });

  it("refuses a limit whose value names no unit it knows", () => {
    expect(() =>
      service.resolveConfiguration({
        format: "markdown",
        limits: [{ metric: "codebase.size", value: "8 K" }],
      }),
    ).toThrow(InvalidLimitValueError);
  });
});
