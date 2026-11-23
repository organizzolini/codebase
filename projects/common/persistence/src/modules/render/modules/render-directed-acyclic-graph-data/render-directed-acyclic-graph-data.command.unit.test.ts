import { describe, expect, it } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphEdgesService } from "../../../graph-edges/graph-edges.service";
import { GraphEntitiesService } from "../../../graph-entities/graph-entities.service";
import { GraphOptionsService } from "../../../graph-options/graph-options.service";
import { RenderService } from "../../render.service";

import { RenderDirectedAcyclicGraphDataCommand } from "./render-directed-acyclic-graph-data.command";

const MOCKS = [
  GraphEdgesService,
  GraphEntitiesService,
  GraphOptionsService,
  RenderService,
];

describe(RenderDirectedAcyclicGraphDataCommand, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      RenderDirectedAcyclicGraphDataCommand,
      {
        mocks: MOCKS,
      },
    );

    expect(instance).toBeInstanceOf(RenderDirectedAcyclicGraphDataCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(RenderDirectedAcyclicGraphDataCommand, {
      mocks: MOCKS,
    });
  });
});
