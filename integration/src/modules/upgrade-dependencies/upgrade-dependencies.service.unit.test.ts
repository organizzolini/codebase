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

import { UpgradeDependenciesService } from "./upgrade-dependencies.service";

describe(UpgradeDependenciesService, () => {
  let service: UpgradeDependenciesService;
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
      ],
    }).compile();

    service = await module.resolve(UpgradeDependenciesService);
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

  it("keeps what a successful step changed", () => {
    expect.hasAssertions();

    const outcome = service.attempt({
      label: "Good",
      script: "echo changed > package.json; echo hello",
    });

    expect(outcome).toStrictEqual({ kind: "succeeded", output: "hello\n" });
    expect(read("package.json")).toBe("changed\n");
  });

  it("undoes a failed step and reports why", () => {
    expect.hasAssertions();

    const outcome = service.attempt({
      label: "Bad",
      script: "echo broken > package.json; echo 'no such version' >&2; exit 3",
    });

    expect(outcome).toMatchObject({
      kind: "skipped",
      skipped: { exitCode: 3, label: "Bad", tail: "no such version" },
    });
    expect(read("package.json")).toBe("original");
  });

  it("undoes a failed step's deletions and additions, even untracked", () => {
    expect.hasAssertions();

    service.attempt({
      label: "Bad",
      script:
        "rm package.json; mkdir -p added/deep; echo x > added/deep/file; echo y > untracked; exit 1",
    });

    expect(read("package.json")).toBe("original");
    expect(fs.existsSync(path.join(repository, "added"))).toBe(false);
    expect(fs.existsSync(path.join(repository, "untracked"))).toBe(false);
  });

  it("restores to what the previous step left, not to the commit", () => {
    expect.hasAssertions();

    service.attempt({ label: "First", script: "echo first > package.json" });
    service.attempt({
      label: "Second",
      script: "echo second > package.json; exit 1",
    });

    expect(read("package.json")).toBe("first\n");
  });

  it("leaves ignored files alone", () => {
    expect.hasAssertions();

    service.attempt({
      label: "Bad",
      script: "echo changed > node_modules/kept; exit 1",
    });

    expect(read("node_modules/kept")).toBe("changed\n");
  });

  it("stops at the first failing command of a script", () => {
    expect.hasAssertions();

    service.attempt({ label: "Bad", script: "false; echo reached > after" });

    expect(fs.existsSync(path.join(repository, "after"))).toBe(false);
  });

  it("quotes only the last lines of a long failure", () => {
    expect.hasAssertions();

    const outcome = service.attempt({
      label: "Bad",
      script: "seq 1 100 >&2; exit 1",
    });
    const tail = outcome.kind === "skipped" ? outcome.skipped.tail : "";

    expect(tail.split("\n")).toHaveLength(20);
    expect(tail.endsWith("100")).toBe(true);
  });

  it("quotes standard output when the failure printed nothing else", () => {
    expect.hasAssertions();

    const outcome = service.attempt({
      label: "Bad",
      script: "echo only on stdout; exit 1",
    });

    expect(outcome).toMatchObject({ skipped: { tail: "only on stdout" } });
  });

  it("runs the recovery script after undoing a failed step", () => {
    expect.hasAssertions();

    const outcome = service.attempt({
      label: "Bad",
      recover: "echo recovered > recovered.txt",
      script: "exit 1",
    });

    expect(outcome.kind).toBe("skipped");
    expect(read("recovered.txt")).toBe("recovered\n");
  });

  it("does not run the recovery script after a step that succeeds", () => {
    expect.hasAssertions();

    service.attempt({
      label: "Good",
      recover: "touch recovered.txt",
      script: "true",
    });

    expect(fs.existsSync(path.join(repository, "recovered.txt"))).toBe(false);
  });

  it("stops the run when the recovery script fails", () => {
    expect.hasAssertions();

    const outcome = service.attempt({
      label: "Bad",
      recover: "echo cannot rebuild >&2; exit 4",
      script: "exit 1",
    });

    expect(outcome.kind).toBe("unrestored");
    expect(outcome).toMatchObject({
      message: expect.stringContaining("exited 4") as unknown,
    });
  });

  it("stops the run when the working tree cannot be restored", () => {
    expect.hasAssertions();

    // A lock left behind by the step stops git from restoring the index.
    const outcome = service.attempt({
      label: "Bad",
      script: "touch .git/index.lock; exit 1",
    });

    expect(outcome.kind).toBe("unrestored");
    expect(outcome).toMatchObject({
      message: expect.stringContaining("git read-tree") as unknown,
    });
  });

  it("throws when the working tree cannot be recorded", () => {
    expect.hasAssertions();

    process.chdir(temporary);

    expect(() => service.attempt({ label: "Any", script: "true" })).toThrow(
      "Could not record the working tree",
    );
  });

  it("writes the pull request when something changed, and says so", () => {
    expect.hasAssertions();

    service.attempt({ label: "Good", script: "echo changed > package.json" });

    const changed = service.finish([
      { exitCode: 1, label: "Bad", tail: "boom" },
    ]);

    expect(changed).toBe(true);
    expect(fs.readFileSync(path.join(temporary, "output"), "utf8")).toBe(
      `has_dependency_updates=true\nbody_path=${path.join(temporary, "pull-request-body.md")}\n`,
    );
    expect(
      fs.readFileSync(path.join(temporary, "pull-request-body.md"), "utf8"),
    ).toContain("Skipped **Bad**");
  });

  it("counts a new untracked file as a change", () => {
    expect.hasAssertions();

    service.attempt({ label: "Good", script: "echo new > added-skill.md" });

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
