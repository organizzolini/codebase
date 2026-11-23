import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphMermaidService } from "./graph-mermaid.service";

describe(GraphMermaidService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(GraphMermaidService);

    expect(instance).toBeInstanceOf(GraphMermaidService);
  });

  it("renders a graph model as a left-to-right Mermaid flowchart", async () => {
    const { instance } = await buildTestingModule(GraphMermaidService);

    const { diagram, warnings } = instance.render({
      directed: true,
      edges: [],
      nodes: [{ id: "a", label: "A" }],
      warnings: [],
    });

    expect(diagram.startsWith("flowchart LR\n")).toBe(true);
    expect(diagram).toContain('    n0["A"]');
    expect(warnings).toStrictEqual([]);
  });
});
