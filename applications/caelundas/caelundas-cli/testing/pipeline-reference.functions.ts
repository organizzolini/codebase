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
 * Registers one reference case per fixture in one slice of the list.
 *
 * Vitest runs test files in parallel but the cases inside one file in turn,
 * so the list is dealt across several files, one per `shard`, to use every
 * core. Slice `shard` of `shards` takes each `shards`-th fixture, which keeps
 * the slow aspect and eclipse fixtures spread out.
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
