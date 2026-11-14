import { buildSourceLocation } from "@callidescope/core/testing";
import { afterEach, beforeEach, vi } from "vitest";

import type {
  ProjectLimits,
  ProjectLimitsLookup,
} from "@callidescope/configuration";
import type { CallGraphResult, StackFrame } from "@callidescope/core";

/**
 * Default test date used across time-sensitive tests.
 */
export const DEFAULT_TEST_DATE = new Date("2025-03-20T14:46:00Z");

/**
 * Builds an empty result for renderers that only pass it through. Tests about what a run reports
 * want `buildTracedCallGraphResult`.
 */
export function buildEmptyCallGraphResult(
  overrides: Partial<CallGraphResult> = {},
): CallGraphResult {
  return {
    deepStacks: [],
    projects: [],
    summary: {
      callableCount: 0,
      cyclicComponentCount: 0,
      edgeCount: 0,
      entryPointCount: 0,
      fileCount: 0,
      maximumDepth: 0,
      projectCount: 0,
      unresolvedCallCount: 0,
    },
    wideCallables: [],
    ...overrides,
  };
}

/**
 * Builds the limits lookup a run hands the renderers. Unnamed projects fall back to the workspace limit.
 */
export function buildProjectLimitsLookup(
  args: {
    byProject?: Record<string, number>;
    maximumDepth?: number;
  } = {},
): ProjectLimitsLookup {
  const workspaceDepth = args.maximumDepth ?? 6;

  const declared = (value: number): ProjectLimits => ({
    maximumBreadth: undefined,
    maximumDepth: value,
    path: "callidescope.config.ts",
  });

  return {
    byProject: new Map(
      Object.entries(args.byProject ?? {}).map(([project, value]) => [
        project,
        declared(value),
      ]),
    ),
    workspace: {
      maximumBreadth: undefined,
      maximumDepth: workspaceDepth,
      path: "configuration/callidescope.config.ts",
    },
  };
}

/**
 * Builds a stack frame, with neither documentation nor a signature unless the test sets one.
 */
export function buildStackFrame(
  overrides: Partial<StackFrame> = {},
): StackFrame {
  const location = overrides.location ?? buildSourceLocation();

  return {
    displayName: "ExampleService.example",
    documentation: undefined,
    id: `${location.filePath}#0`,
    isCycle: false,
    location,
    signature: undefined,
    ...overrides,
  };
}

/**
 * Builds a result whose summary says a run traced something: one callable in one file in one project.
 */
export function buildTracedCallGraphResult(
  overrides: Partial<CallGraphResult> = {},
): CallGraphResult {
  return buildEmptyCallGraphResult({
    summary: {
      callableCount: 1,
      cyclicComponentCount: 0,
      edgeCount: 0,
      entryPointCount: 0,
      fileCount: 1,
      maximumDepth: 0,
      projectCount: 1,
      unresolvedCallCount: 0,
    },
    ...overrides,
  });
}

/**
 * Fakes timers at a fixed system time before each test and restores real
 * timers after.
 */
export function mockDates(date: Date = DEFAULT_TEST_DATE): void {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
}
