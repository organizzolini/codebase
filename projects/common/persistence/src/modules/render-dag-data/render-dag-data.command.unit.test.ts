import { describe, expect, it } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphDagService } from "../graph-dag/graph-dag.service";
import { GraphEntitiesService } from "../graph-entities/graph-entities.service";
import { GraphOptionsService } from "../graph-options/graph-options.service";
import { GraphRenderService } from "../graph-render/graph-render.service";

import { RenderDagDataCommand } from "./render-dag-data.command";

const MOCKS = [
  GraphDagService,
  GraphEntitiesService,
  GraphOptionsService,
  GraphRenderService,
];

describe(RenderDagDataCommand, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(RenderDagDataCommand, {
      mocks: MOCKS,
    });

    expect(instance).toBeInstanceOf(RenderDagDataCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(RenderDagDataCommand, { mocks: MOCKS });
  });
});
