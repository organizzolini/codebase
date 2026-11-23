import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { RenderMermaidService } from "./modules/render-mermaid/render-mermaid.service";
import { RenderService } from "./render.service";

describe(RenderService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(RenderService, {
      mocks: [RenderMermaidService],
    });

    expect(instance).toBeInstanceOf(RenderService);
  });
});
