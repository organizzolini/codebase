import fs from "node:fs";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
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

import { LoggerService } from "@codebase/logging";

import { enterWorkspace } from "../../../testing/environment";
import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { captureReport } from "../../../testing/report";
import { createTemporaryWorkspace } from "../../../testing/temporary-workspace";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareBrewService } from "./software-brew.service";
import { SoftwareDatabaseService } from "./software-database.service";
import { SoftwareDockerService } from "./software-docker.service";
import { SoftwareGpgService } from "./software-gpg.service";
import { SoftwareInfraService } from "./software-infra.service";
import { SoftwareOllamaService } from "./software-ollama.service";
import { SoftwarePythonService } from "./software-python.service";
import { SoftwareCommand } from "./software.command";
import { SoftwareService } from "./software.service";

import type { FakeMachine } from "../../../testing/fake-process-runner";
import type { TemporaryWorkspace } from "../../../testing/temporary-workspace";

const EVERY_COMMAND = [
  "uv",
  "python3",
  "ollama",
  "docker",
  "gpg",
  "gitleaks",
  "terraform",
  "trivy",
  "supabase",
  "jq",
  "gh",
  "helm",
  "kubectl",
  "squawk",
  "pg_dump",
];

const PYTHON_CHECK =
  "python3 -c import sys; assert sys.version_info >= (3, 14)";

/** A machine with everything installed and healthy. */
const HEALTHY_MACHINE: FakeMachine = {
  installed: EVERY_COMMAND,
  responses: {
    "brew --prefix": { stdout: "/opt/homebrew\n" },
    "gpg --list-secret-keys --keyid-format=long": {
      stdout: "sec   rsa4096/AAAA1111BBBB2222 2024-01-01 [SC]\n",
    },
    "gpg --version": { stdout: "gpg (GnuPG) 2.4.5\n" },
    "pg_dump --version": { stdout: "pg_dump (PostgreSQL) 18.1\n" },
    "python3 --version": { stdout: "Python 3.14.0\n" },
    "uv --version": { stdout: "uv 0.9.0\n" },
  },
};

describe(SoftwareCommand, () => {
  let command: SoftwareCommand;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SoftwareCommand,
        { provide: SoftwareService, useValue: createMock<SoftwareService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(SoftwareCommand);
  });

  let workspace: TemporaryWorkspace;
  let report: string[];

  /** Builds the command over the real services and the given fake machine. */
  const createCommand = async (
    machine: FakeMachine,
  ): Promise<{
    command: SoftwareCommand;
    commands: string[];
    detached: string[];
  }> => {
    const { commands, detached, runner } = createFakeProcessRunner(machine);
    const module = await Test.createTestingModule({
      providers: [
        SoftwareBrewService,
        SoftwareCommand,
        SoftwareDatabaseService,
        SoftwareDockerService,
        SoftwareGpgService,
        SoftwareInfraService,
        SoftwareOllamaService,
        SoftwarePythonService,
        SoftwareService,
        ReporterService,
        { provide: ProcessRunnerService, useValue: runner },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return {
      command: await module.resolve(SoftwareCommand),
      commands,
      detached,
    };
  };

  beforeEach(() => {
    workspace = createTemporaryWorkspace();
    enterWorkspace(workspace);
    report = captureReport();
  });

  afterEach(() => {
    workspace.remove();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        SoftwareCommand,
        { provide: SoftwareService, useValue: createMock<SoftwareService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("SoftwareCommand");
  });

  describe("on a machine with everything installed", () => {
    it("installs nothing and prints the versions", async () => {
      expect.hasAssertions();

      const { command: subject, commands } =
        await createCommand(HEALTHY_MACHINE);

      await subject.run();

      expect(
        commands.filter((line) =>
          /^(brew (install|link)|pnpm add|uv python)/u.test(line),
        ),
      ).toStrictEqual([]);
      expect(report).toContain("👍 uv is already installed, version: uv 0.9.0");
      expect(report).toContain("👍 Python is already installed: Python 3.14.0");
      expect(report).toContain("👍 PostgreSQL 18 tools are already installed.");
      expect(report).toContain("   Key ID: AAAA1111BBBB2222");
      expect(report).toContain("📋 Installed tool versions:");
    });

    it("reports an upgrade for an outdated tool", async () => {
      expect.hasAssertions();

      const { command: subject } = await createCommand({
        ...HEALTHY_MACHINE,
        responses: {
          ...HEALTHY_MACHINE.responses,
          "brew outdated": { stdout: "uv\njq\n" },
        },
      });

      await subject.run();

      expect(report).toContain(
        "🔄 uv is outdated. To update, run: brew upgrade uv",
      );
      expect(report).toContain(
        "🔄 jq is outdated. To update, run: brew upgrade jq",
      );
    });
  });

  describe("on a machine with nothing installed", () => {
    it("installs every tool through its package manager", async () => {
      expect.hasAssertions();

      const { command: subject, commands } = await createCommand({
        responses: {
          "curl -sf http://localhost:11434/api/version": { status: 1 },
          "docker info": { status: 1 },
          "git config --global user.signingkey": { status: 1 },
        },
      });

      await subject.run();

      expect(
        commands.filter((line) =>
          /^(brew (install|link)|pnpm add|uv python)/u.test(line),
        ),
      ).toStrictEqual([
        "brew install uv",
        "uv python install 3.14",
        "brew install ollama",
        "brew install --cask docker",
        "brew install gnupg pinentry-mac",
        "brew install gitleaks",
        "brew install terraform",
        "brew install trivy",
        "brew install supabase/tap/supabase",
        "brew install jq",
        "brew install gh",
        "brew install helm",
        "brew install kubernetes-cli",
        "pnpm add -g squawk-cli",
        "brew install postgresql@18",
        "brew link --force --overwrite postgresql@18",
      ]);
    });

    it("starts Ollama detached when it is not a Homebrew service, then waits and pulls the model", async () => {
      expect.hasAssertions();

      const {
        command: subject,
        commands,
        detached,
      } = await createCommand({
        responses: {
          "curl -sf http://localhost:11434/api/version": { status: 1 },
        },
      });

      await subject.run();

      expect(detached).toStrictEqual(["ollama serve"]);
      expect(commands.filter((line) => line === "sleep 1")).toHaveLength(15);
      expect(commands).toContain("ollama pull gemma4:e2b");
      expect(report).toContain("✅ Ollama is running");
    });

    it("starts Ollama as a Homebrew service when it is one", async () => {
      expect.hasAssertions();

      const {
        command: subject,
        commands,
        detached,
      } = await createCommand({
        responses: {
          "brew services list": { stdout: "ollama stopped\n" },
          "curl -sf http://localhost:11434/api/version": { status: 1 },
        },
      });

      await subject.run();

      expect(commands).toContain("brew services start ollama");
      expect(detached).toStrictEqual([]);
    });

    it("warns when the Docker daemon never comes up", async () => {
      expect.hasAssertions();

      const { command: subject, commands } = await createCommand({
        responses: { "docker info": { status: 1 } },
      });

      await subject.run();

      expect(commands).toContain("open -a Docker");
      expect(commands.filter((line) => line === "sleep 2")).toHaveLength(30);
      expect(report).toContain(
        "⚠️  Docker daemon is taking longer than expected to start.",
      );
    });

    it("explains how to create a signing key when there is none", async () => {
      expect.hasAssertions();

      const { command: subject } = await createCommand({ installed: ["gpg"] });

      await subject.run();

      expect(report).toContain("⚠️  No GPG secret key found.");
      expect(report).toContain("     https://github.com/settings/gpg/new");
    });
  });

  describe("daemons that take a moment to start", () => {
    it("stops waiting for Docker as soon as the daemon answers", async () => {
      expect.hasAssertions();

      const { command: subject, commands } = await createCommand({
        ...HEALTHY_MACHINE,
        responses: {
          ...HEALTHY_MACHINE.responses,
          "docker --version": { stdout: "Docker version 29.0.0\n" },
        },
        sequences: {
          "docker info": [{ status: 1 }, { status: 1 }, { status: 0 }],
        },
      });

      await subject.run();

      expect(commands.filter((line) => line === "sleep 2")).toHaveLength(1);
      expect(report).toContain("✅ Docker is running: Docker version 29.0.0");
    });

    it("stops waiting for Ollama as soon as the daemon answers", async () => {
      expect.hasAssertions();

      const { command: subject, commands } = await createCommand({
        ...HEALTHY_MACHINE,
        sequences: {
          "curl -sf http://localhost:11434/api/version": [
            { status: 1 },
            { status: 1 },
            { status: 0 },
          ],
        },
      });

      await subject.run();

      expect(commands.filter((line) => line === "sleep 1")).toHaveLength(1);
    });
  });

  describe("the version summary", () => {
    /** Runs a healthy machine with these answers replaced, and returns the summary. */
    const summarize = async (
      responses: FakeMachine["responses"],
    ): Promise<string[]> => {
      const { command: subject } = await createCommand({
        ...HEALTHY_MACHINE,
        responses: { ...HEALTHY_MACHINE.responses, ...responses },
      });

      await subject.run();

      return report.slice(report.indexOf("📋 Installed tool versions:") + 1);
    };

    it("reads Terraform's version from its JSON form", async () => {
      expect.hasAssertions();

      const summary = await summarize({
        "terraform version -json": { stdout: '{"terraform_version":"1.9.0"}' },
        "trivy --version": {
          stdout: "Version: 0.50.0\nVulnerability database\n",
        },
      });

      expect(summary).toContain("   Terraform:   1.9.0");
      expect(summary).toContain("   Trivy:       0.50.0");
    });

    it("falls back to Terraform's text form when the JSON is unusable", async () => {
      expect.hasAssertions();

      const unreadable = await summarize({
        "terraform version": { stdout: "Terraform v1.9.0\non darwin\n" },
        "terraform version -json": { stdout: "not json" },
      });
      const unversioned = await summarize({
        "terraform version": { stdout: "Terraform v1.8.0\non darwin\n" },
        "terraform version -json": { stdout: "{}" },
      });

      expect(unreadable).toContain("   Terraform:   Terraform v1.9.0");
      expect(unversioned).toContain("   Terraform:   Terraform v1.8.0");
    });

    it("falls back to kubectl's long form where --short is gone", async () => {
      expect.hasAssertions();

      const summary = await summarize({
        "kubectl version --client": {
          stdout: "Client Version: v1.31.0\nKustomize\n",
        },
        "kubectl version --client --short": { status: 1 },
      });

      expect(summary).toContain("   kubectl:     Client Version: v1.31.0");
    });

    it("prints only standard output for the tools that never merged the streams", async () => {
      expect.hasAssertions();

      const summary = await summarize({
        "kubectl version --client --short": {
          output: "Client Version: v1.27.0\nFlag --short has been deprecated\n",
          stdout: "Client Version: v1.27.0\n",
        },
      });

      expect(summary).toContain("   kubectl:     Client Version: v1.27.0");
    });

    it("says so when a tool will not report a version", async () => {
      expect.hasAssertions();

      const summary = await summarize({
        "docker --version": { status: 1 },
        "gitleaks version": { status: 1 },
        "squawk --version": { status: 1 },
      });

      expect(summary).toContain("   Gitleaks:    not installed");
      expect(summary).toContain("   Docker:      not installed");
      expect(report).toContain("   Squawk:      not installed");
    });
  });

  describe("signing configuration", () => {
    it("configures the agent once and signs with the first key", async () => {
      expect.hasAssertions();

      const { command: subject, commands } = await createCommand({
        ...HEALTHY_MACHINE,
        responses: {
          ...HEALTHY_MACHINE.responses,
          "git config --global user.signingkey": { status: 1 },
        },
      });

      await subject.run();
      await subject.run();

      expect(commands).toContain(
        "git config --global user.signingkey AAAA1111BBBB2222",
      );
      expect(commands).toContain("git config --global commit.gpgsign true");
      expect(report).toContain(
        "✅ git global signing configured with key AAAA1111BBBB2222",
      );
      expect(
        fs.readFileSync(
          path.join(workspace.home, ".gnupg", "gpg-agent.conf"),
          "utf8",
        ),
      ).toBe("pinentry-program /opt/homebrew/bin/pinentry-mac\n");
      expect(report).toContain("👍 gpg-agent.conf already configured");
    });
  });

  describe("signing failures and oddities", () => {
    it("stops, writing nothing, when Homebrew cannot say where it lives", async () => {
      expect.hasAssertions();

      const { command: subject } = await createCommand({
        ...HEALTHY_MACHINE,
        responses: {
          ...HEALTHY_MACHINE.responses,
          "brew --prefix": { status: 1 },
        },
      });

      await expect(subject.run()).rejects.toThrow("`brew --prefix` failed");

      expect(
        fs.existsSync(path.join(workspace.home, ".gnupg", "gpg-agent.conf")),
      ).toBe(false);
    });

    it("takes a whole field as the key id when it holds no slash", async () => {
      expect.hasAssertions();

      const { command: subject } = await createCommand({
        ...HEALTHY_MACHINE,
        responses: {
          ...HEALTHY_MACHINE.responses,
          "gpg --list-secret-keys --keyid-format=long": {
            stdout: "sec   AAAA1111BBBB2222 2024-01-01\n",
          },
        },
      });

      await subject.run();

      expect(report).toContain("   Key ID: AAAA1111BBBB2222");
    });
  });

  it("stops at the first install that fails", async () => {
    expect.hasAssertions();

    const { command: subject, commands } = await createCommand({
      responses: { "brew install uv": { status: 1 } },
    });

    await expect(subject.run()).rejects.toThrow("`brew install uv` failed");

    expect(commands).not.toContain(PYTHON_CHECK);
  });
});
