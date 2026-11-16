import { describe, expect, it } from "vitest";

import { bootModule } from "@codebase/testing/nestjs";

import { MainModule } from "./coinagerie-nx.module";

describe("coinagerie-nx module", () => {
  it("boots the root module", async () => {
    const moduleReference = await bootModule(MainModule);

    expect(moduleReference.get(MainModule)).toBeInstanceOf(MainModule);
  });
});
