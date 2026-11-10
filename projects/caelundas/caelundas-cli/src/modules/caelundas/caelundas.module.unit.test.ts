import { beforeAll, describe, expect, it, vi } from "vitest";

type ConfigOptions =
  | undefined
  | {
      envFilePath?: string | string[];
      isGlobal?: boolean;
      validate?: (config: Record<string, unknown>) => unknown;
    };

/**
 * Sixty seconds rather than the shared ten: importing the app afresh takes far longer on a CI runner.
 */
const IMPORT_TIMEOUT_MILLISECONDS = 60_000;

describe("caelundas module", () => {
  let mainModule: unknown;
  let configOptions: ConfigOptions;

  beforeAll(async () => {
    vi.resetModules();
    const importedConfigModule = await import("@nestjs/config");
    const forRootSpy = vi.spyOn(importedConfigModule.ConfigModule, "forRoot");

    const importedModule = await import("../../caelundas-cli.module");
    mainModule = importedModule.MainModule;
    configOptions = forRootSpy.mock.calls[0]?.[0];
  }, IMPORT_TIMEOUT_MILLISECONDS);

  it("configures the global env validator", () => {
    expect(mainModule).toBeDefined();

    const options = configOptions;

    if (options === undefined) {
      throw new Error("options is undefined");
    }

    expect(options.envFilePath).toBe(".env");
    expect(options.isGlobal).toBe(true);
    expect(typeof options.validate).toBe("function");

    expect(options.validate?.({})).toMatchObject({
      CAELUNDAS_POSTGRES_DATABASE: "caelundas_development",
      CAELUNDAS_POSTGRES_SCHEMA: "caelundas",
      OUTPUT_DIRECTORY: "./output",
    });
  });
});
