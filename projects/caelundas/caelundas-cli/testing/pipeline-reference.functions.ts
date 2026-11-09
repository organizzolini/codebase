import { describe, expect, it } from "vitest";

import { PIPELINE_TEST_TIMEOUT_MILLISECONDS } from "./pipeline-window.constants";
import { runPipelineWindow } from "./pipeline-window.functions";
import { detectorFamiliesFor } from "./reference-families.utilities";
import { referenceFixtureNames } from "./reference-fixture-names.constants";
import {
  assertReferenceEvents,
  loadReferenceFixture,
} from "./reference-fixtures.utilities";

/**
 * Registers one reference case per fixture in one shard of the list, so tests spread across cores; each shard takes every `shards`-th fixture.
 */
export function describeReferenceShard(shard: number, shards: number): void {
  const names = referenceFixtureNames.filter(
    (_name, index) => index % shards === shard,
  );

  describe.each(names)("reference fixture %s", (name) => {
    const fixture = loadReferenceFixture(name);

    it(
      `agrees with ${fixture.source.name}`,
      { timeout: PIPELINE_TEST_TIMEOUT_MILLISECONDS },
      async () => {
        expect.hasAssertions();

        const { events } = await runPipelineWindow(fixture.window, {
          families: detectorFamiliesFor(fixture),
        });

        assertReferenceEvents(events, fixture);
      },
    );
  });
}
