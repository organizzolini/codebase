import { describe, expect, it } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { RenderService } from "../../render.service";
import { RenderEntitiesService } from "../render-entities/render-entities.service";
import { RenderNodesService } from "../render-nodes/render-nodes.service";
import { RenderOptionsService } from "../render-options/render-options.service";
import { RenderTreesService } from "../render-trees/render-trees.service";

import { RenderTreeDataCommand } from "./render-tree-data.command";

const MOCKS = [
  RenderEntitiesService,
  RenderNodesService,
  RenderOptionsService,
  RenderService,
  RenderTreesService,
];

describe(RenderTreeDataCommand, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(RenderTreeDataCommand, {
      mocks: MOCKS,
    });

    expect(instance).toBeInstanceOf(RenderTreeDataCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(RenderTreeDataCommand, { mocks: MOCKS });
  });
});
