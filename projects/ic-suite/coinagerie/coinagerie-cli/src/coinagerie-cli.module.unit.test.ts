import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";

import { MainModule } from "./coinagerie-cli.module";

describe("coinagerie-cli module", () => {
  it("boots the root module", async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [MainModule],
    }).compile();

    expect(moduleReference.get(MainModule)).toBeInstanceOf(MainModule);

    await moduleReference.close();
  });
});
