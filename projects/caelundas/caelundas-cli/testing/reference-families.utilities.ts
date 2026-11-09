import { familyBySummaryPattern } from "./reference-families.constants";

import type { DetectorFamily } from "../src/modules/perfective/perfective.types";
import type { ReferenceFixture } from "./reference-fixtures.types";

/**
 * Detector families a fixture's summaries need, so its sweep can skip the rest, including for absent and counted summaries.
 */
export function detectorFamiliesFor(
  fixture: ReferenceFixture,
): Set<DetectorFamily> {
  const summaries = [
    ...fixture.events.map((event) => event.summary),
    ...(fixture.absent ?? []),
    ...Object.keys(fixture.counts ?? {}),
  ];
  const families = new Set<DetectorFamily>();
  for (const summary of summaries) {
    const matches = familyBySummaryPattern.filter(([pattern]) =>
      pattern.test(summary),
    );
    if (matches.length === 0) {
      throw new Error(`No detector family is known for "${summary}"`);
    }
    for (const [, family] of matches) families.add(family);
  }
  return families;
}
