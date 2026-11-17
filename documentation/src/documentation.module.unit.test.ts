import { describe, expect, it, vi } from "vitest";

import { LoggerModule } from "@codebase/observability";
import { expectModuleImports } from "@codebase/testing/nestjs";

import { MainModule } from "./documentation.module";
import { RefreshDocumentationModule } from "./modules/refresh-documentation/refresh-documentation.module";

interface ForRootOptions {
  validate: (config: Record<string, unknown>) => unknown;
}

// Captured when the module is imported: the suite clears mock calls between
// tests, and `forRoot` runs once, at import.
const captured = vi.hoisted<{ options?: ForRootOptions }>(() => ({}));
const forRoot = vi.hoisted(() =>
  vi.fn<(options: ForRootOptions) => { module: unknown }>((options) => {
    captured.options = options;
    return { module: Object };
  }),
);

vi.mock("@nestjs/config", () => ({
  ConfigModule: { forRoot },
}));

describe(MainModule, () => {
  it("imports the logger and the refresh-documentation module", () => {
    expect.hasAssertions();

    expectModuleImports(MainModule, LoggerModule, RefreshDocumentationModule);
  });

  it("validates the environment against the schema", () => {
    expect.hasAssertions();

    expect(captured.options?.validate({})).toStrictEqual({});
  });
});
