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

import { LoggerService } from "@codebase/observability";

import { enterWorkspace } from "../../../testing/environment";
import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { captureReport } from "../../../testing/report";
import { createTemporaryWorkspace } from "../../../testing/temporary-workspace";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { EnvironmentFilesCommand } from "./environment-files.command";
import { EnvironmentFilesService } from "./environment-files.service";

import type { TemporaryWorkspace } from "../../../testing/temporary-workspace";

const LISTING_LINE =
  "git ls-files --cached --others --exclude-standard -- .env.default */.env.default :!:configuration/conformetry-templates/**";

describe(EnvironmentFilesCommand, () => {
  let command: EnvironmentFilesCommand;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EnvironmentFilesCommand,
        {
          provide: EnvironmentFilesService,
          useValue: createMock<EnvironmentFilesService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(EnvironmentFilesCommand);
  });

  let workspace: TemporaryWorkspace;
  let report: string[];

  /** Builds the command over the real service and a machine whose Git lists these files. */
  const createCommand = async (
    listedFiles: string[],
  ): Promise<EnvironmentFilesCommand> => {
    const { runner } = createFakeProcessRunner({
      responses: { [LISTING_LINE]: { stdout: `${listedFiles.join("\n")}\n` } },
    });
    const module = await Test.createTestingModule({
      providers: [
        EnvironmentFilesCommand,
        EnvironmentFilesService,
        ReporterService,
        { provide: ProcessRunnerService, useValue: runner },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return module.resolve(EnvironmentFilesCommand);
  };

  /** Writes a file under the temporary workspace. */
  const write = (relativePath: string, content: string): void => {
    const file = path.join(workspace.root, relativePath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
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
        EnvironmentFilesCommand,
        {
          provide: EnvironmentFilesService,
          useValue: createMock<EnvironmentFilesService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("EnvironmentFilesCommand");
  });

  it("creates a missing .env from its default and reports each directory", async () => {
    expect.hasAssertions();

    write(".env.default", "ROOT=1\n");
    write("projects/a/.env.default", "A=1\n");
    write("projects/b/.env.default", "B=1\n");
    write("projects/b/.env", "B=custom\n");
    const subject = await createCommand([
      ".env.default",
      "projects/a/.env.default",
      "projects/b/.env.default",
      "projects/c/.env.default",
    ]);

    await subject.run();

    expect(report).toStrictEqual([
      "🔍 Setting up environment files...",
      "✅ Root .env created from .env.default",
      "✅ projects/a .env created from .env.default",
      "👍 projects/b .env already exists",
      "⚠️  projects/c .env.default not found. Skipping.",
      "✅ Added LOCAL_WORKSPACE_FOLDER to root .env",
    ]);
    expect(
      fs.readFileSync(path.join(workspace.root, "projects/a/.env"), "utf8"),
    ).toBe("A=1\n");
    expect(
      fs.readFileSync(path.join(workspace.root, "projects/b/.env"), "utf8"),
    ).toBe("B=custom\n");
  });

  it("appends the workspace path to the root .env once", async () => {
    expect.hasAssertions();

    write(".env.default", "ROOT=1\n");
    const subject = await createCommand([".env.default"]);

    await subject.run();
    await subject.run();

    expect(fs.readFileSync(path.join(workspace.root, ".env"), "utf8")).toBe(
      `ROOT=1\n\n# Local workspace path (used by docker-compose for volume mounts)\nLOCAL_WORKSPACE_FOLDER=${workspace.root}\n`,
    );
  });

  it("leaves a root .env that already names the workspace alone", async () => {
    expect.hasAssertions();

    write(".env.default", "ROOT=1\n");
    write(".env", "LOCAL_WORKSPACE_FOLDER=/elsewhere\n");
    const subject = await createCommand([".env.default"]);

    await subject.run();

    expect(fs.readFileSync(path.join(workspace.root, ".env"), "utf8")).toBe(
      "LOCAL_WORKSPACE_FOLDER=/elsewhere\n",
    );
    expect(report).not.toContain(
      "✅ Added LOCAL_WORKSPACE_FOLDER to root .env",
    );
  });
});
