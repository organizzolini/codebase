import { describe, expect, it } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphDagService } from "../../../graph-dag/graph-dag.service";
import { GraphEntitiesService } from "../../../graph-entities/graph-entities.service";
import { GraphOptionsService } from "../../../graph-options/graph-options.service";
import { RenderService } from "../../render.service";

import { RenderGraphDataCommand } from "./render-graph-data.command";

const MOCKS = [
  GraphDagService,
  GraphEntitiesService,
  GraphOptionsService,
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
