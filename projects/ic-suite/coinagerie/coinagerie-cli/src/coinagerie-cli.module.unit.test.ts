import { describe, expect, it } from "vitest";

import { bootModule } from "@codebase/testing/nestjs";

import { MainModule } from "./coinagerie-cli.module";

describe("coinagerie-cli module", () => {
  it("boots the root module", async () => {
    const moduleReference = await bootModule(MainModule);

    expect(moduleReference.get(MainModule)).toBeInstanceOf(MainModule);
  });
});
