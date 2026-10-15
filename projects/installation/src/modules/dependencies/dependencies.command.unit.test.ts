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

import { DependenciesCommand } from "./dependencies.command";
import { DependenciesService } from "./dependencies.service";

import type { FakeMachine } from "../../../testing/fake-process-runner";
import type { TemporaryWorkspace } from "../../../testing/temporary-workspace";
import type { ProcessOptions } from "../process-runner/process-runner.types";

const INSTALL_STEPS = ["pnpm install", "nx reset", "uv sync", "terraform init"];
const CREDENTIALS = [
  'TF_VAR_linode_token="secret-token"',
  "TF_VAR_linode_kubernetes_engine_cluster_id=lke12345-6789-abcd",
  "",
].join("\n");

describe(DependenciesCommand, () => {
  let command: DependenciesCommand;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DependenciesCommand,
        {
          provide: DependenciesService,
          useValue: createMock<DependenciesService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(DependenciesCommand);
  });

  let workspace: TemporaryWorkspace;
  let report: string[];

  /** Builds the command over the real service and the given fake machine. */
  const createCommand = async (
    machine: FakeMachine = {},
  ): Promise<{
    command: DependenciesCommand;
    commands: string[];
    options: Map<string, ProcessOptions>;
  }> => {
    const { commands, options, runner } = createFakeProcessRunner(machine);
    const module = await Test.createTestingModule({
      providers: [
        DependenciesCommand,
        DependenciesService,
        ReporterService,
        { provide: ProcessRunnerService, useValue: runner },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return {
      command: await module.resolve(DependenciesCommand),
      commands,
      options,
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
        DependenciesCommand,
        {
          provide: DependenciesService,
          useValue: createMock<DependenciesService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("DependenciesCommand");
  });

  it("installs in order and skips kubeconfig without credentials", async () => {
    expect.hasAssertions();

    const { command: subject, commands } = await createCommand();

    await subject.run();

    expect(commands).toStrictEqual(INSTALL_STEPS);
    expect(report).toStrictEqual([
      "📦 Installing Node dependencies...",
      "✅ Node dependencies installed",
      "🔄 Resetting Nx cache...",
      "✅ Nx cache reset",
      "🐍 Setting up Python virtual environment...",
      "✅ Python dependencies installed (.venv)",
      "🏗  Initializing Terraform...",
      "✅ Terraform initialized",
      "🔑 Setting up kubeconfig...",
      "⚠️  Skipping kubeconfig: set TF_VAR_linode_token and TF_VAR_linode_kubernetes_engine_cluster_id in .env",
    ]);
  });

  it("imports the cluster and writes kubeconfig from the root .env credentials", async () => {
    expect.hasAssertions();

    fs.writeFileSync(path.join(workspace.root, ".env"), CREDENTIALS);
    const { command: subject, commands } = await createCommand({
      responses: {
        "terraform output -raw kubeconfig": { stdout: "a3ViZQ==" },
        "terraform state list": { stdout: "linode_lke_node_pool.pool\n" },
      },
    });

    await subject.run();

    expect(commands.slice(INSTALL_STEPS.length)).toStrictEqual([
      "terraform state list",
      "terraform import linode_lke_cluster.cluster 12345",
      "terraform output -raw kubeconfig",
    ]);
    expect(report).toContain(
      "📥 Importing cluster 12345 into Terraform state...",
    );
    expect(report.at(-1)).toBe("✅ kubeconfig saved to ~/.kube/config");
    expect(
      fs.readFileSync(path.join(workspace.home, ".kube", "config"), "utf8"),
    ).toBe("kube");
  });

  it("skips the import when Terraform already tracks the cluster", async () => {
    expect.hasAssertions();

    fs.writeFileSync(path.join(workspace.root, ".env"), CREDENTIALS);
    const { command: subject, commands } = await createCommand({
      responses: {
        "terraform output -raw kubeconfig": { stdout: "a3ViZQ==" },
        "terraform state list": { stdout: "linode_lke_cluster.cluster\n" },
      },
    });

    await subject.run();

    expect(commands).not.toContain(
      "terraform import linode_lke_cluster.cluster 12345",
    );
  });

  it("leaves an existing kubeconfig alone", async () => {
    expect.hasAssertions();

    fs.writeFileSync(path.join(workspace.root, ".env"), CREDENTIALS);
    fs.mkdirSync(path.join(workspace.home, ".kube"));
    fs.writeFileSync(path.join(workspace.home, ".kube", "config"), "mine");
    const { command: subject, commands } = await createCommand();

    await subject.run();

    expect(commands).toStrictEqual(INSTALL_STEPS);
    expect(report.at(-1)).toBe(
      "👍 kubeconfig already exists at ~/.kube/config",
    );
  });

  it("runs Terraform where its configuration lives, with the .env credentials", async () => {
    expect.hasAssertions();

    fs.writeFileSync(
      path.join(workspace.root, ".env"),
      [
        "# credentials",
        "",
        "export TF_VAR_linode_token='single-quoted'",
        "TF_VAR_linode_kubernetes_engine_cluster_id=lke99_1",
        "NOT A VARIABLE",
        "=orphan",
      ].join("\n"),
    );
    vi.stubEnv("TF_VAR_linode_token", "from-the-process");
    const { command: subject, options } = await createCommand({
      responses: { "terraform output -raw kubeconfig": { stdout: "a3ViZQ==" } },
    });

    await subject.run();

    expect(options.get("terraform init")?.cwd).toBe(
      path.join(workspace.root, "projects/infrastructure/terraform"),
    );
    expect(
      options.get("terraform import linode_lke_cluster.cluster 99")
        ?.environment,
    ).toStrictEqual(
      expect.objectContaining({ TF_VAR_linode_token: "single-quoted" }),
    );
  });

  it("refuses to write a kubeconfig that is not valid base64", async () => {
    expect.hasAssertions();

    fs.writeFileSync(path.join(workspace.root, ".env"), CREDENTIALS);
    const { command: subject } = await createCommand({
      responses: { "terraform output -raw kubeconfig": { stdout: "!!!" } },
    });

    await expect(subject.run()).rejects.toThrow("not valid base64");

    expect(fs.existsSync(path.join(workspace.home, ".kube", "config"))).toBe(
      false,
    );
  });

  it("leaves the Nx cache alone when run inside an Nx task", async () => {
    expect.hasAssertions();

    vi.stubEnv("NX_TASK_TARGET_PROJECT", "installation");
    const { command: subject, commands } = await createCommand();

    await subject.run();

    expect(commands).not.toContain("nx reset");
    expect(report).toContain(
      "⚠️  Skipping Nx cache reset inside an Nx task. Run `nx reset` yourself.",
    );
  });

  it("stops at the first step that fails", async () => {
    expect.hasAssertions();

    const { command: subject, commands } = await createCommand({
      responses: { "nx reset": { status: 1 } },
    });

    await expect(subject.run()).rejects.toThrow("`nx reset` failed");

    expect(commands).toStrictEqual(["pnpm install", "nx reset"]);
  });
});
