import { buildCallableNode } from "@callidescope/core/testing";
import { createMock } from "@golevelup/ts-vitest";

import type { DiscoveredCallable } from "../src/modules/callables/callables.types";
import type { CallableNode } from "@callidescope/core";

/**
 * Builds a discovered callable for tests that only read its described node.
 * Declaration and program come from `createMock`, not a cast.
 */
export function buildDiscoveredCallable(
  overrides: Partial<CallableNode> = {},
): DiscoveredCallable {
  return {
    declaration: createMock<DiscoveredCallable["declaration"]>(),
    node: buildCallableNode(overrides),
    projectProgram: createMock<DiscoveredCallable["projectProgram"]>(),
  };
}
