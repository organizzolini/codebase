import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { RenderMermaidService } from "./render-mermaid.service";

describe(RenderMermaidService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(RenderMermaidService);

    expect(instance).toBeInstanceOf(RenderMermaidService);
  });

  it("renders a graph model as a left-to-right Mermaid flowchart", async () => {
    const { instance } = await buildTestingModule(RenderMermaidService);

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

  it("renders a graph model as a file tree when asked", async () => {
    const { instance } = await buildTestingModule(RenderMermaidService);

    const { diagram } = instance.render(
      {
        directed: true,
        edges: [{ source: "a", target: "b" }],
        nodes: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
        warnings: [],
      },
      { diagram: "filetree" },
    );

    expect(diagram).toBe(["A", "└── B"].join("\n"));
  });
});
