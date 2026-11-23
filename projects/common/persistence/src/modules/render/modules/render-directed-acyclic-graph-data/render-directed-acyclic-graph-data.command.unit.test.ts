import { describe, expect, it } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { RenderService } from "../../render.service";
import { RenderEdgesService } from "../render-edges/render-edges.service";
import { RenderEntitiesService } from "../render-entities/render-entities.service";
import { RenderNodesService } from "../render-nodes/render-nodes.service";
import { RenderOptionsService } from "../render-options/render-options.service";

import { RenderDirectedAcyclicGraphDataCommand } from "./render-directed-acyclic-graph-data.command";

const MOCKS = [
  RenderEdgesService,
  RenderEntitiesService,
  RenderNodesService,
  RenderOptionsService,
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
