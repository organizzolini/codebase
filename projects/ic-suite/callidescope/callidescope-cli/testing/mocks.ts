import { createMock } from "@golevelup/ts-vitest";
import { afterEach, beforeEach, vi } from "vitest";

import type {
  CallableNode,
  CallGraphResult,
  SourceLocation,
  StackFrame,
} from "@callidescope/core";
import type { DiscoveredCallable } from "@callidescope/graph";

/**
 * Default test date used across time-sensitive tests.
 */
export const DEFAULT_TEST_DATE = new Date("2025-03-20T14:46:00Z");

/**
 * Builds a callable node with every field populated, so adding a field breaks no test that builds one.
 */
export function buildCallableNode(
  overrides: Partial<CallableNode> = {},
): CallableNode {
  const location = overrides.location ?? buildSourceLocation();

  return {
    displayName: "ExampleService.example",
    enclosingTypeName: "ExampleService",
    id: `${location.filePath}#0`,
    isExported: true,
    kind: "method",
    location,
    memberName: "example",
    projectName: "example",
    statementCount: 1,
    ...overrides,
  };
}

/**
 * Builds a finding-free result. The summary counts one callable, since a zero would fail a run that traced nothing.
 */
export function buildCallGraphResult(
  overrides: Partial<CallGraphResult> = {},
): CallGraphResult {
  return {
    deepStacks: [],
    projects: [],
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
    wideCallables: [],
    ...overrides,
  };
}

/**
 * Builds a discovered callable whose declaration and program are mocks, not casts.
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

/**
 * Builds a source location, defaulting the parts a test does not care about.
 */
export function buildSourceLocation(
  overrides: Partial<SourceLocation> = {},
): SourceLocation {
  return {
    column: 1,
    filePath: "packages/example/src/modules/example/example.service.ts",
    line: 1,
    ...overrides,
  };
}

/**
 * Builds a stack frame with no documentation or signature, the honest baseline for shape-only assertions.
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
