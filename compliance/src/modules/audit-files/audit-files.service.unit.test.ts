import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { AuditFilesService } from "./audit-files.service";

describe(AuditFilesService, () => {
  let service: AuditFilesService;

  beforeAll(async () => {
    const built = await buildTestingModule(AuditFilesService);

    service = built.instance;
  });

  /** A throwaway workspace holding only the governance files given. */
  function workspace(files: {
    readonly codeowners?: string;
    readonly workflows?: Record<string, string>;
  }): string {
    const root = createTemporaryDirectory("audit-files");

    if (files.codeowners !== undefined) {
      mkdirSync(path.join(root, ".github"), { recursive: true });
      writeFileSync(path.join(root, ".github/CODEOWNERS"), files.codeowners);
    }

    if (files.workflows !== undefined) {
      const directory = path.join(root, ".github/workflows");
      mkdirSync(directory, { recursive: true });
      for (const [name, content] of Object.entries(files.workflows)) {
        writeFileSync(path.join(directory, name), content);
      }
    }

    return root;
  }

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(AuditFilesService);

    expect(instance).toBeInstanceOf(AuditFilesService);
  });

  describe("checkCodeowners", () => {
    it("returns violation when CODEOWNERS file does not exist", () => {
      expect.hasAssertions();

      const verdict = service.checkCodeowners(workspace({}));

      expect(verdict.valid).toBe(false);
      expect(verdict.ruleCount).toBe(0);
      expect(verdict.violations).toHaveLength(1);
      expect(verdict.violations[0]?.reason).toContain(
        "CODEOWNERS file not found",
      );
    });

    it("returns violation when CODEOWNERS contains no active rules", () => {
      expect.hasAssertions();

      const verdict = service.checkCodeowners(
        workspace({ codeowners: "# Only comments\n\n   \n# Another comment" }),
      );

      expect(verdict.valid).toBe(false);
      expect(verdict.ruleCount).toBe(0);
      expect(verdict.violations).toHaveLength(1);
      expect(verdict.violations[0]?.reason).toContain("no active rules");
    });

    it("returns violation when rule has no owner specified", () => {
      expect.hasAssertions();

      const verdict = service.checkCodeowners(workspace({ codeowners: "*" }));

      expect(verdict.valid).toBe(false);
      expect(verdict.violations).toHaveLength(1);
      expect(verdict.violations[0]?.reason).toContain("no owners specified");
    });

    it("returns violation when owner handle is invalid", () => {
      expect.hasAssertions();

      const verdict = service.checkCodeowners(
        workspace({ codeowners: "* invalid-handle-without-at" }),
      );

      expect(verdict.valid).toBe(false);
      expect(verdict.violations).toHaveLength(1);
      expect(verdict.violations[0]?.reason).toContain("Invalid owner handle");
    });

    it("accepts valid @user, @org/team, and email owners", () => {
      expect.hasAssertions();

      const verdict = service.checkCodeowners(
        workspace({
          codeowners:
            "*\t@JimmyPaolini\n/docs/\t@org/docs-team user@example.com\n",
        }),
      );

      expect(verdict.valid).toBe(true);
      expect(verdict.ruleCount).toBe(2);
      expect(verdict.violations).toHaveLength(0);
    });
  });

  describe("checkWorkflows", () => {
    it("returns violation when workflows directory does not exist", () => {
      expect.hasAssertions();

      const verdict = service.checkWorkflows(workspace({}));

      expect(verdict.valid).toBe(false);
      expect(verdict.workflowsAudited).toBe(0);
      expect(verdict.violations[0]?.reason).toContain(
        "Workflows directory not found",
      );
    });

    it("returns violation when workflow is missing a top-level name", () => {
      expect.hasAssertions();

      const verdict = service.checkWorkflows(
        workspace({
          workflows: {
            "ci.yml": `
permissions:
  contents: read
jobs:
  build:
    timeout-minutes: 10
`,
          },
        }),
      );

      expect(verdict.valid).toBe(false);
      expect(
        verdict.violations.some((violation) =>
          violation.reason.includes("missing a top-level 'name:'"),
        ),
      ).toBe(true);
    });

    it("returns valid verdict when workflow file has no jobs section", () => {
      expect.hasAssertions();

      const verdict = service.checkWorkflows(
        workspace({ workflows: { "empty.yml": "name: Empty Workflow\n" } }),
      );

      expect(verdict.valid).toBe(true);
      expect(verdict.violations).toStrictEqual([]);
    });

    it("returns violation when workflow has neither top-level nor job-level permissions", () => {
      expect.hasAssertions();

      const verdict = service.checkWorkflows(
        workspace({
          workflows: {
            "ci.yml": `
name: CI
jobs:
  build:
    timeout-minutes: 10
`,
          },
        }),
      );

      expect(verdict.valid).toBe(false);
      expect(
        verdict.violations.some((violation) =>
          violation.reason.includes("lacks explicit 'permissions:'"),
        ),
      ).toBe(true);
    });

    it("returns violation when job lacks timeout-minutes", () => {
      expect.hasAssertions();

      const verdict = service.checkWorkflows(
        workspace({
          workflows: {
            "ci.yml": `
name: CI
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
`,
          },
        }),
      );

      expect(verdict.valid).toBe(false);
      expect(
        verdict.violations.some((violation) =>
          violation.reason.includes("lacks explicit 'timeout-minutes:'"),
        ),
      ).toBe(true);
    });

    it("returns violation when job timeout exceeds maximum permitted limit", () => {
      expect.hasAssertions();

      const verdict = service.checkWorkflows(
        workspace({
          workflows: {
            "ci.yml": `
name: CI
permissions:
  contents: read
jobs:
  long-build:
    timeout-minutes: 400
`,
          },
        }),
      );

      expect(verdict.valid).toBe(false);
      expect(
        verdict.violations.some((violation) =>
          violation.reason.includes("exceeds maximum permitted"),
        ),
      ).toBe(true);
    });

    it("accepts valid workflow with matrix timeout expression and job permissions", () => {
      expect.hasAssertions();

      const verdict = service.checkWorkflows(
        workspace({
          workflows: {
            "compliance.yml": `
name: Compliance
jobs:
  audit:
    permissions:
      contents: read
    timeout-minutes: \${{ matrix.target.timeout }}
`,
          },
        }),
      );

      expect(verdict.valid).toBe(true);
      expect(verdict.violations).toHaveLength(0);
    });

    it("accepts valid workflow with multiple jobs", () => {
      expect.hasAssertions();

      const verdict = service.checkWorkflows(
        workspace({
          workflows: {
            "ci.yml": `
name: Multi Job CI
permissions:
  contents: read
jobs:
  build:
    permissions:
      contents: read
    timeout-minutes: 10
  test:
    permissions:
      contents: read
    timeout-minutes: 15
`,
          },
        }),
      );

      expect(verdict.valid).toBe(true);
      expect(verdict.violations).toHaveLength(0);
    });

    it("handles non-job lines before the first job declaration in jobs section", () => {
      expect.hasAssertions();

      const verdict = service.checkWorkflows(
        workspace({
          workflows: {
            "compliance.yml": `
name: Compliance
permissions:
  contents: read
jobs:
  # comment before first job
  audit:
    timeout-minutes: 10
`,
          },
        }),
      );

      expect(verdict.valid).toBe(true);
      expect(verdict.violations).toHaveLength(0);
    });
  });

  describe("checkFiles", () => {
    it("returns aggregated verdict correctly", () => {
      expect.hasAssertions();

      const verdict = service.checkFiles(
        workspace({
          codeowners: "* @JimmyPaolini",
          workflows: {
            "ci.yml": `
name: CI
permissions:
  contents: read
jobs:
  build:
    timeout-minutes: 10
`,
          },
        }),
      );

      expect(verdict.valid).toBe(true);
      expect(verdict.codeowners.valid).toBe(true);
      expect(verdict.workflows.valid).toBe(true);
    });
  });
});
