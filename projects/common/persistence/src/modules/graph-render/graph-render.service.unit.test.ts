import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphMermaidService } from "../graph-mermaid/graph-mermaid.service";

import { GraphRenderService } from "./graph-render.service";

describe(GraphRenderService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(GraphRenderService, {
      mocks: [GraphMermaidService],
    });

    expect(instance).toBeInstanceOf(GraphRenderService);
  });
});
