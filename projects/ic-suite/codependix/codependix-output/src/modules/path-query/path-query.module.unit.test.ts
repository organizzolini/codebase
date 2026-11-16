import { describe, expect, it } from "vitest";

import { bootModule } from "@codebase/testing/nestjs";

import { PathQueryModule } from "./path-query.module";
import { PathQueryService } from "./path-query.service";

describe(PathQueryModule, () => {
  it("compiles the module and resolves its providers", async () => {
    const module = await bootModule(PathQueryModule);

    expect(module.get(PathQueryService)).toBeInstanceOf(PathQueryService);
  });
});
