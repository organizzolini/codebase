import { describe, expect, it } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { RenderService } from "../../render.service";
import { RenderEdgesService } from "../render-edges/render-edges.service";
import { RenderEntitiesService } from "../render-entities/render-entities.service";
import { RenderNodesService } from "../render-nodes/render-nodes.service";
import { RenderOptionsService } from "../render-options/render-options.service";

import { RenderGraphDataCommand } from "./render-graph-data.command";

const MOCKS = [
  RenderEdgesService,
  RenderEntitiesService,
  RenderNodesService,
  RenderOptionsService,
  RenderService,
];

describe(RenderGraphDataCommand, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(RenderGraphDataCommand, {
      mocks: MOCKS,
    });

    expect(instance).toBeInstanceOf(RenderGraphDataCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(RenderGraphDataCommand, { mocks: MOCKS });
  });
});
