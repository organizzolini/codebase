import { ProjectReportsService } from "@callidescope/output";
import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { EMPTY_TRACE_REPORT } from "../plugin/plugin.constants";

import { VerdictService } from "./verdict.service";

import type { RunVerdict } from "../plugin/plugin.types";
import type { ProjectLimitsLookup } from "@callidescope/configuration";
import type {
  CallGraphResult,
  CallGraphSummary,
  DeepStackFinding,
  ProjectReport,
  WideCallableFinding,
} from "@callidescope/core";

/** The limits a stubbed run resolved, so a forwarded lookup can be pinned. */
const LIMITS = createMock<ProjectLimitsLookup>();

/** The per-project reports a stubbed run produced. */
const REPORTS = [createMock<ProjectReport>({ projectName: "packages/alpha" })];

/** A traced result that read `callableCount` callables. */
function resultOf(callableCount: number): CallGraphResult {
  return createMock<CallGraphResult>({
    projects: REPORTS,
    summary: createMock<CallGraphSummary>({ callableCount }),
  });
}

describe(VerdictService, () => {
  let projectReportsService: ReturnType<
    typeof createMock<ProjectReportsService>
  >;
  let service: VerdictService;

  beforeAll(async () => {
    projectReportsService = createMock<ProjectReportsService>();

    const module = await Test.createTestingModule({
      providers: [
        VerdictService,
        { provide: ProjectReportsService, useValue: projectReportsService },
      ],
    }).compile();

    service = await module.resolve(VerdictService);
  });

  beforeEach(() => {
    projectReportsService.findOwnedFindings.mockReturnValue({
      deepStacks: [],
      wideCallables: [],
    });
    projectReportsService.findUnreadProjects.mockReturnValue([]);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  describe("judge", () => {
    const JUDGED = ["packages/alpha"];

    it("passes a run in which the judged projects own no finding", () => {
      expect(
        service.judge({
          judgedProjectNames: JUDGED,
          projectLimits: LIMITS,
          result: resultOf(143),
        }),
      ).toMatchObject({ ok: true, reason: undefined, unreadProjectNames: [] });
    });

    it("asks only for what the judged projects own, by the limits they resolved", () => {
      service.judge({
        judgedProjectNames: JUDGED,
        projectLimits: LIMITS,
        result: resultOf(143),
      });

      expect(projectReportsService.findOwnedFindings).toHaveBeenCalledWith({
        limits: LIMITS,
        projectNames: JUDGED,
        reports: REPORTS,
      });
    });

    it.each([
      ["a stack deeper than its limit", { deepStacks: [1], wideCallables: [] }],
      [
        "a callable wider than its limit",
        { deepStacks: [], wideCallables: [1] },
      ],
    ])("fails on %s", (_name, counts) => {
      projectReportsService.findOwnedFindings.mockReturnValue({
        deepStacks: counts.deepStacks.map(() => createMock<DeepStackFinding>()),
        wideCallables: counts.wideCallables.map(() =>
          createMock<WideCallableFinding>(),
        ),
      });

      expect(
        service.judge({
          judgedProjectNames: JUDGED,
          projectLimits: LIMITS,
          result: resultOf(143),
        }).ok,
      ).toBe(false);
    });

    it("fails a run that read no code, saying why", () => {
      expect(
        service.judge({
          judgedProjectNames: JUDGED,
          projectLimits: LIMITS,
          result: resultOf(0),
        }),
      ).toMatchObject({ ok: false, reason: EMPTY_TRACE_REPORT });
    });

    it("names a judged project none of whose own files were read", () => {
      projectReportsService.findUnreadProjects.mockReturnValue(JUDGED);

      expect(
        service.judge({
          judgedProjectNames: JUDGED,
          projectLimits: LIMITS,
          result: resultOf(143),
        }).unreadProjectNames,
      ).toStrictEqual(JUDGED);
    });
  });

  describe("explain", () => {
    const FINDINGS = { deepStacks: [], wideCallables: [] };

    it("says nothing for a verdict its findings explain", () => {
      const verdict: RunVerdict = {
        findings: FINDINGS,
        ok: true,
        reason: undefined,
        unreadProjectNames: [],
      };

      expect(service.explain(verdict)).toBeUndefined();
    });

    it("gives the reason of a run that read nothing", () => {
      const verdict: RunVerdict = {
        findings: FINDINGS,
        ok: false,
        reason: EMPTY_TRACE_REPORT,
        unreadProjectNames: [],
      };

      expect(service.explain(verdict)).toBe(EMPTY_TRACE_REPORT);
    });

    it("names the unread projects before the whole-run reason", () => {
      const verdict: RunVerdict = {
        findings: FINDINGS,
        ok: false,
        reason: EMPTY_TRACE_REPORT,
        unreadProjectNames: ["packages/alpha"],
      };

      const explanation = service.explain(verdict);

      expect(explanation).toContain("Read nothing of its own");
      expect(explanation).toContain("packages/alpha");
    });
  });
});
