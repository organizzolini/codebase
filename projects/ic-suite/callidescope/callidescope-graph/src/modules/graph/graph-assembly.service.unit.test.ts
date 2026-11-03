import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ANALYSIS_MODULES } from "../../../testing/modules";
import {
  buildFixtureProgram,
  buildFixtureServices,
  collectFixtureCallables,
  FIXTURE_ROOT,
} from "../../../testing/programs";

import { BreadthService } from "./breadth.service";
import { ComponentsService } from "./components.service";
import { GraphAssemblyService } from "./graph-assembly.service";
import { GraphDepthService } from "./graph-depth.service";
import { GraphService } from "./graph.service";

import type { AssembledGraph } from "./graph-assembly.types";

/** Assembles the graph for a set of in-memory files. */
function assemble(files: Record<string, string>): AssembledGraph {
  const projectProgram = buildFixtureProgram(files);
  const fixture = buildFixtureServices({ projectProgram });
  const collection = collectFixtureCallables({
    projectProgram,
    services: fixture,
  });
  const subject = new GraphAssemblyService(
    new BreadthService(),
    new ComponentsService(),
    new GraphDepthService(),
    fixture.edges,
    new GraphService(),
  );

  return subject.assemble({
    callablesById: collection.byId,
    excludeCallees: [],
    includeConstructorEdges: true,
    workspaceRoot: FIXTURE_ROOT,
  });
}

describe(GraphAssemblyService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(GraphAssemblyService, {
      imports: [...ANALYSIS_MODULES],
    });

    expect(instance).toBeInstanceOf(GraphAssemblyService);
  });

  it("assembles the call graph from the resolved edges", () => {
    const { graph } = assemble({
      "packages/example/src/index.ts": `
        function helper(): void {}
        export function entry(): void { helper(); }
      `,
    });

    expect(graph.edges).toHaveLength(1);
  });

  it("condenses a cycle into one component", () => {
    const { condensed } = assemble({
      "packages/example/src/index.ts": `
        export function ping(): void { pong(); }
        export function pong(): void { ping(); }
      `,
    });

    expect(
      condensed.memberIdsByComponent.some((members) => members.length > 1),
    ).toBe(true);
  });

  it("measures the breadth of the assembled graph", () => {
    const { breadthMeasurement } = assemble({
      "packages/example/src/index.ts": `
        function first(): void {}
        function second(): void {}
        export function entry(): void { first(); second(); }
      `,
    });

    const widest = Math.max(
      0,
      ...[...breadthMeasurement.byCallable.values()].map(
        (measured) => measured.breadth,
      ),
    );

    expect(widest).toBe(2);
  });

  it("measures the depth of the assembled graph", () => {
    const { measurement } = assemble({
      "packages/example/src/index.ts": `
        function three(): void {}
        function two(): void { three(); }
        export function one(): void { two(); }
      `,
    });

    const deepest = measurement.byComponent.reduce(
      (maximum, entry) => Math.max(maximum, entry.depth),
      0,
    );

    expect(deepest).toBe(3);
  });
});
