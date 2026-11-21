import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { AspectPhaseEmojiService } from "./aspect-phase-emoji.service";

describe(AspectPhaseEmojiService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(AspectPhaseEmojiService);

    expect(instance).toBeInstanceOf(AspectPhaseEmojiService);
  });
});
