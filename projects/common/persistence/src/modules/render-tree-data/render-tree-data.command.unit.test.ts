import { describe, expect, it } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphEntitiesService } from "../graph-entities/graph-entities.service";
import { GraphOptionsService } from "../graph-options/graph-options.service";
import { GraphRenderService } from "../graph-render/graph-render.service";
import { GraphTreeService } from "../graph-tree/graph-tree.service";

import { RenderTreeDataCommand } from "./render-tree-data.command";

const MOCKS = [
  GraphEntitiesService,
  GraphOptionsService,
  GraphRenderService,
  GraphTreeService,
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
