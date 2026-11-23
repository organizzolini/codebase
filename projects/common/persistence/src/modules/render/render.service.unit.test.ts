import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphMermaidService } from "../graph-mermaid/graph-mermaid.service";

import { RenderService } from "./render.service";

describe(RenderService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(RenderService, {
      mocks: [GraphMermaidService],
    });

    expect(instance).toBeInstanceOf(RenderService);
  });
});
