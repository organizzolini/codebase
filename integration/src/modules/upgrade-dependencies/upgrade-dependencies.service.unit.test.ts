import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { UpgradeNodeService } from "../upgrade-node/upgrade-node.service";
import { UpgradePnpmService } from "../upgrade-pnpm/upgrade-pnpm.service";
import { UpgradePythonService } from "../upgrade-python/upgrade-python.service";

import { UpgradeDependenciesService } from "./upgrade-dependencies.service";

import type { Command } from "../process-runner/process-runner.types";
import type { UpgradeStep } from "./upgrade-dependencies.types";

/** A command that runs some JavaScript, which is how a test writes a file. */
const node = (code: string): Command => ["node", "-e", code];

/** A command that writes a file. */
const write = (file: string, text: string): Command =>
  node(
    `require("fs").writeFileSync(${JSON.stringify(file)}, ${JSON.stringify(text)})`,
  );

/** Throws whatever it is given, which is how a test throws what is not an error. */
const fail = (value: unknown): never => {
  throw value;
};

/** A step made of the given commands. */
const stepOf = (...commands: Command[]): UpgradeStep => ({
  commands,
  label: "Step",
});

describe(UpgradeDependenciesService, () => {
  let service: UpgradeDependenciesService;
  let pnpm: UpgradePnpmService;
  let repository: string;
  let temporary: string;
  let originalDirectory: string;

  /** Runs git in the scratch repository. */
  const git = (...args: string[]): string =>
    execFileSync("git", args, { cwd: repository, encoding: "utf8" });

  /** Reads a file of the scratch repository. */
  const read = (name: string): string =>
    fs.readFileSync(path.join(repository, name), "utf8");

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UpgradeDependenciesService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        {
          provide: UpgradeNodeService,
          useValue: createMock<UpgradeNodeService>(),
        },
        {
          provide: UpgradePnpmService,
          useValue: createMock<UpgradePnpmService>(),
        },
        {
          provide: UpgradePythonService,
          useValue: createMock<UpgradePythonService>(),
        },
      ],
    }).compile();

    service = await module.resolve(UpgradeDependenciesService);
  });

  beforeEach(async () => {
    originalDirectory = process.cwd();
    temporary = fs.mkdtempSync(path.join(os.tmpdir(), "upgrade-test-"));
    repository = path.join(temporary, "repository");
    fs.mkdirSync(repository);
    git("init", "-q");
    git("config", "user.email", "test@example.test");
    git("config", "user.name", "Test");
    fs.writeFileSync(path.join(repository, "package.json"), "original");
    fs.writeFileSync(path.join(repository, ".gitignore"), "node_modules\n");
    fs.mkdirSync(path.join(repository, "node_modules"));
    fs.writeFileSync(path.join(repository, "node_modules/kept"), "kept");
    git("add", "-A");
    git("commit", "-qm", "init");
    process.chdir(repository);
    vi.stubEnv("TMPDIR", temporary);
    vi.stubEnv("GITHUB_OUTPUT", path.join(temporary, "output"));

    const module = await Test.createTestingModule({
      providers: [
        UpgradeDependenciesService,
        ProcessRunnerService,
        { provide: ConfigService, useValue: new ConfigService() },
        {
          provide: UpgradeNodeService,
          useValue: createMock<UpgradeNodeService>(),
        },
        {
          provide: UpgradePnpmService,
          useValue: createMock<UpgradePnpmService>(),
        },
        {
          provide: UpgradePythonService,
          useValue: createMock<UpgradePythonService>(),
        },
      ],
    }).compile();

    service = await module.resolve(UpgradeDependenciesService);
    pnpm = await module.resolve(UpgradePnpmService);
  });

  afterEach(() => {
    process.chdir(originalDirectory);
    vi.unstubAllEnvs();
    fs.rmSync(temporary, { force: true, recursive: true });
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  it("keeps what a successful step changed", async () => {
    expect.hasAssertions();

    const outcome = await service.attempt(
      stepOf(write("package.json", "changed\n"), node("console.log('hello')")),
    );

    expect(outcome).toStrictEqual({
      kind: "succeeded",
      output: "hello\n",
      report: {
        changes: "1 file changed, 1 insertion(+), 1 deletion(-)",
        label: "Step",
        summary: undefined,
        warnings: [],
      },
    });
    expect(read("package.json")).toBe("changed\n");
  });

  it("counts the lines of a file git treats as binary", async () => {
    expect.hasAssertions();

    fs.writeFileSync(
      path.join(repository, ".gitattributes"),
      "*.lock binary\n",
    );
    fs.writeFileSync(path.join(repository, "pnpm.lock"), "one\n");
    git("add", "-A");
    git("commit", "-qm", "lockfile");

    const outcome = await service.attempt(
      stepOf(write("pnpm.lock", "one\ntwo\n")),
    );

    expect(outcome).toMatchObject({
      report: { changes: "1 file changed, 1 insertion(+)" },
    });
  });

  it("reports the warnings a step printed", async () => {
    expect.hasAssertions();

    const outcome = await service.attempt(
      stepOf(node("console.log('⚠ one skill is stale')")),
    );

    expect(outcome).toMatchObject({
      report: { changes: "", warnings: ["⚠ one skill is stale"] },
    });
  });

  it("undoes a failed step and reports why", async () => {
    expect.hasAssertions();

    const outcome = await service.attempt(
      stepOf(
        write("package.json", "broken"),
        node("console.error('no such version'); process.exitCode = 3"),
      ),
    );

    expect(outcome).toMatchObject({
      kind: "skipped",
      report: {
        label: "Step",
        skipped: { exitCode: 3, tail: "no such version" },
      },
    });
    expect(read("package.json")).toBe("original");
  });

  it("undoes a failed step's deletions and additions, even untracked", async () => {
    expect.hasAssertions();

    await service.attempt(
      stepOf(
        node(
          'const fs = require("fs"); fs.rmSync("package.json"); fs.mkdirSync("added/deep", { recursive: true }); fs.writeFileSync("added/deep/file", "x"); fs.writeFileSync("untracked", "y"); process.exit(1)',
        ),
      ),
    );

    expect(read("package.json")).toBe("original");
    expect(fs.existsSync(path.join(repository, "added"))).toBe(false);
    expect(fs.existsSync(path.join(repository, "untracked"))).toBe(false);
  });

  it("restores to what the previous step left, not to the commit", async () => {
    expect.hasAssertions();

    await service.attempt(stepOf(write("package.json", "first\n")));
    await service.attempt(
      stepOf(write("package.json", "second\n"), node("process.exit(1)")),
    );

    expect(read("package.json")).toBe("first\n");
  });

  it("leaves ignored files alone", async () => {
    expect.hasAssertions();

    await service.attempt(
      stepOf(write("node_modules/kept", "changed\n"), node("process.exit(1)")),
    );

    expect(read("node_modules/kept")).toBe("changed\n");
  });

  it("stops at the first failing command of a step", async () => {
    expect.hasAssertions();

    await service.attempt(stepOf(node("process.exit(1)"), write("after", "x")));

    expect(fs.existsSync(path.join(repository, "after"))).toBe(false);
  });

  it("quotes only the last lines of a long failure", async () => {
    expect.hasAssertions();

    const outcome = await service.attempt(
      stepOf(
        node(
          "for (let n = 1; n <= 100; n++) console.error(String(n)); process.exitCode = 1",
        ),
      ),
    );
    const tail =
      outcome.kind === "skipped" ? (outcome.report.skipped?.tail ?? "") : "";

    expect(tail.split("\n")).toHaveLength(20);
    expect(tail.endsWith("100")).toBe(true);
  });

  it("quotes standard output when the failure printed nothing else", async () => {
    expect.hasAssertions();

    const outcome = await service.attempt(
      stepOf(node("console.log('only on stdout'); process.exitCode = 1")),
    );

    expect(outcome).toMatchObject({
      report: { skipped: { tail: "only on stdout" } },
    });
  });

  it("runs the recovery commands after undoing a failed step", async () => {
    expect.hasAssertions();

    const outcome = await service.attempt({
      commands: [node("process.exit(1)")],
      label: "Step",
      recover: [write("recovered.txt", "recovered\n")],
    });

    expect(outcome.kind).toBe("skipped");
    expect(read("recovered.txt")).toBe("recovered\n");
  });

  it("does not run the recovery commands after a step that succeeds", async () => {
    expect.hasAssertions();

    await service.attempt({
      commands: [node("0")],
      label: "Step",
      recover: [write("recovered.txt", "x")],
    });

    expect(fs.existsSync(path.join(repository, "recovered.txt"))).toBe(false);
  });

  it("stops the run when the recovery commands fail", async () => {
    expect.hasAssertions();

    const outcome = await service.attempt({
      commands: [node("process.exit(1)")],
      label: "Step",
      recover: [node("console.error('cannot rebuild'); process.exitCode = 4")],
    });

    expect(outcome.kind).toBe("unrestored");
    expect(outcome).toMatchObject({
      message: expect.stringContaining("exited 4") as unknown,
    });
  });

  it("stops the run when the working tree cannot be restored", async () => {
    expect.hasAssertions();

    // A lock left behind by the step stops git from restoring the index.
    const outcome = await service.attempt(
      stepOf(write(".git/index.lock", ""), node("process.exit(1)")),
    );

    expect(outcome.kind).toBe("unrestored");
    expect(outcome).toMatchObject({
      message: expect.stringContaining("git read-tree") as unknown,
    });
  });

  it("throws when the working tree cannot be recorded", async () => {
    expect.hasAssertions();

    process.chdir(temporary);

    await expect(service.attempt(stepOf(node("0")))).rejects.toThrow(
      "Could not record the working tree",
    );
  });

  describe("a task", () => {
    it("keeps what it changed and reports its summary", async () => {
      expect.hasAssertions();

      vi.mocked(pnpm.upgrade).mockImplementation(() => {
        fs.writeFileSync("package.json", "pinned\n");

        return "pnpm 12.15.0";
      });

      const outcome = await service.attempt({
        label: "Upgrade pnpm",
        task: "pnpm",
      });

      expect(outcome).toMatchObject({
        kind: "succeeded",
        report: {
          changes: "1 file changed, 1 insertion(+), 1 deletion(-)",
          summary: "pnpm 12.15.0",
        },
      });
      expect(read("package.json")).toBe("pinned\n");
    });

    it("is undone and reported when it throws", async () => {
      expect.hasAssertions();

      vi.mocked(pnpm.upgrade).mockImplementation(() => {
        fs.writeFileSync("package.json", "half\n");

        throw new Error("pnpm will not switch");
      });

      const outcome = await service.attempt({
        label: "Upgrade pnpm",
        task: "pnpm",
      });

      expect(outcome).toMatchObject({
        kind: "skipped",
        report: { skipped: { exitCode: 1, tail: "pnpm will not switch" } },
      });
      expect(read("package.json")).toBe("original");
    });

    it("is reported when it throws something that is not an error", async () => {
      expect.hasAssertions();

      const throwText = (): string => fail("plain text");

      vi.mocked(pnpm.upgrade).mockImplementation(throwText);

      const outcome = await service.attempt({
        label: "Upgrade pnpm",
        task: "pnpm",
      });

      expect(outcome).toMatchObject({
        report: { skipped: { tail: "plain text" } },
      });
    });
  });

  it("writes the pull request when something changed, and says so", async () => {
    expect.hasAssertions();

    await service.attempt(stepOf(write("package.json", "changed\n")));

    const changed = service.finish([
      {
        changes: "",
        label: "Bad",
        skipped: { exitCode: 1, tail: "boom" },
        warnings: [],
      },
    ]);

    expect(changed).toBe(true);
    expect(fs.readFileSync(path.join(temporary, "output"), "utf8")).toBe(
      `has_dependency_updates=true\nbody_path=${path.join(temporary, "pull-request-body.md")}\n`,
    );
    expect(
      fs.readFileSync(path.join(temporary, "pull-request-body.md"), "utf8"),
    ).toContain("**Bad** skipped");
  });

  it("links the run in the body when GitHub names one", async () => {
    expect.hasAssertions();

    vi.stubEnv("GITHUB_RUN_ID", "42");
    await service.attempt(stepOf(write("package.json", "changed\n")));
    service.finish([]);

    expect(
      fs.readFileSync(path.join(temporary, "pull-request-body.md"), "utf8"),
    ).toContain("/actions/runs/42)");
  });

  it("counts a new untracked file as a change", async () => {
    expect.hasAssertions();

    await service.attempt(stepOf(write("added-skill.md", "new\n")));

    expect(service.finish([])).toBe(true);
  });

  it("writes no pull request when nothing changed", () => {
    expect.hasAssertions();

    expect(service.finish([])).toBe(false);
    expect(fs.existsSync(path.join(temporary, "pull-request-body.md"))).toBe(
      false,
    );
    expect(fs.readFileSync(path.join(temporary, "output"), "utf8")).toBe(
      `has_dependency_updates=false\nbody_path=${path.join(temporary, "pull-request-body.md")}\n`,
    );
  });

  it("reports outside GitHub Actions without an output file", () => {
    expect.hasAssertions();

    vi.stubEnv("GITHUB_OUTPUT", "");

    expect(service.finish([])).toBe(false);
  });
});
