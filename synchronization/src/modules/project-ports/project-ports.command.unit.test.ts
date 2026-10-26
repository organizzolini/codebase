import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
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

import { expectProcessExitOne } from "../../../testing/mocks";
import { SynchronizationService } from "../synchronization/synchronization.service";

import { ProjectPortsCommand } from "./project-ports.command";
import { ProjectPortsService } from "./project-ports.service";

/** Where the fixture workspaces live: inside this project's gitignored `tmp`. */
const FIXTURE_ROOT = path.resolve(import.meta.dirname, "../../../tmp");

describe(ProjectPortsCommand, () => {
  let command: ProjectPortsCommand;
  let sharedLogger: LoggerService;
  let root: string;

  /** Writes a file under the fixture workspace, creating its directories. */
  const write = (relativePath: string, content: string): void => {
    const file = path.join(root, relativePath);

    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
  };

  /** Reads a file under the fixture workspace. */
  const read = (relativePath: string): string =>
    readFileSync(path.join(root, relativePath), "utf8");

  /** Declares an application as an Nx project whose port source holds this port. */
  const writeProject = (
    directory: string,
    name: string,
    port: number,
  ): void => {
    write(`${directory}/project.json`, JSON.stringify({ name }));

    if (name.endsWith("-web")) {
      write(
        `${directory}/vite.config.mts`,
        `export default {\n  server: {\n    port: ${port},\n  },\n};\n`,
      );
    } else {
      write(
        `${directory}/.env.default`,
        `EXAMPLE_API_LIGHTSHIP_PORT=9000\nEXAMPLE_API_PORT=${port}\n`,
      );
    }
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProjectPortsCommand,
        ProjectPortsService,
        SynchronizationService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(ProjectPortsCommand);
    sharedLogger = await module.resolve(LoggerService);
  });

  beforeEach(() => {
    mkdirSync(FIXTURE_ROOT, { recursive: true });
    root = mkdtempSync(path.join(FIXTURE_ROOT, "project-ports-"));
    vi.spyOn(process, "cwd").mockReturnValue(root);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(root, { force: true, recursive: true });
  });

  it("is defined", () => {
    expect(command).toBeDefined();
    expect(command.synchronizationLabel).toBe("project-ports");
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProjectPortsCommand,
        ProjectPortsService,
        SynchronizationService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("ProjectPortsCommand");
  });

  it("passes when every port is the hashed one", async () => {
    writeProject("projects/lexico/lexico-web", "lexico-web", 7797);
    writeProject("projects/lexico/lexico-api", "lexico-api", 5003);

    await expect(command.synchronize("check")).resolves.toBe(true);

    expect(sharedLogger.info).toHaveBeenCalledWith(
      "🔌 Verified every application's port against its hashed name",
      undefined,
      { count: 2 },
    );
  });

  it("ignores projects that are not an api or a web application", async () => {
    writeProject("projects/lexico/lexico-web", "lexico-web", 7797);
    write("projects/lexico/lexico-cli/project.json", '{"name":"lexico-cli"}');

    await expect(command.synchronize("check")).resolves.toBe(true);
  });

  it("finds a project that sits directly under projects", async () => {
    writeProject("projects/caelundas-web", "caelundas-web", 3000);

    await expect(command.synchronize("check")).resolves.toBe(false);
  });

  it("reports drift in check mode and writes nothing", async () => {
    writeProject("projects/caelundas/caelundas-web", "caelundas-web", 3000);

    await expect(command.synchronize("check")).resolves.toBe(false);

    expect(read("projects/caelundas/caelundas-web/vite.config.mts")).toContain(
      "port: 3000",
    );
    expect(sharedLogger.info).toHaveBeenCalledWith(
      "🔌 Detected an out-of-sync port",
      undefined,
      expect.objectContaining({
        currentPort: 3000,
        expectedPort: 8967,
        project: "caelundas-web",
      }),
    );
  });

  it("rewrites a web application's port across its domain in write mode", async () => {
    writeProject("projects/meanderaw/meanderaw-web", "meanderaw-web", 3000);
    write(
      "projects/meanderaw/meanderaw-web/README.md",
      "Served on http://localhost:3000\n",
    );
    write(
      "projects/meanderaw/meanderaw-api/src/origins.ts",
      'const origin = "http://localhost:3000";\nconst timeout = 3000;\n',
    );
    write("projects/lexico/lexico-web/src/other.ts", "const port = 3000;\n");

    await expect(command.synchronize("write")).resolves.toBe(true);

    expect(read("projects/meanderaw/meanderaw-web/vite.config.mts")).toContain(
      "port: 2161",
    );
    expect(read("projects/meanderaw/meanderaw-web/README.md")).toBe(
      "Served on http://localhost:2161\n",
    );
    expect(read("projects/meanderaw/meanderaw-api/src/origins.ts")).toBe(
      'const origin = "http://localhost:2161";\nconst timeout = 3000;\n',
    );
    expect(read("projects/lexico/lexico-web/src/other.ts")).toBe(
      "const port = 3000;\n",
    );
    await expect(command.synchronize("check")).resolves.toBe(true);
  });

  it("rewrites only the project itself when it has no domain folder", async () => {
    writeProject("projects/caelundas-web", "caelundas-web", 3000);
    write("projects/caelundas-web/src/main.ts", "const port = 3000;\n");
    write("projects/elsewhere/src/main.ts", "const port = 3000;\n");

    await expect(command.synchronize("write")).resolves.toBe(true);

    expect(read("projects/caelundas-web/src/main.ts")).toBe(
      "const port = 8967;\n",
    );
    expect(read("projects/elsewhere/src/main.ts")).toBe("const port = 3000;\n");
  });

  it("rewrites an api's port from its env defaults", async () => {
    writeProject("projects/lexico/lexico-api", "lexico-api", 4000);
    write(
      "projects/lexico/lexico-web/src/search.tsx",
      'const url = "http://localhost:4000/graphql";\n',
    );

    await expect(command.synchronize("write")).resolves.toBe(true);

    expect(read("projects/lexico/lexico-api/.env.default")).toBe(
      "EXAMPLE_API_LIGHTSHIP_PORT=9000\nEXAMPLE_API_PORT=5003\n",
    );
    expect(read("projects/lexico/lexico-web/src/search.tsx")).toBe(
      'const url = "http://localhost:5003/graphql";\n',
    );
  });

  it("skips dependencies, lockfiles, and history", async () => {
    writeProject("projects/meanderaw/meanderaw-web", "meanderaw-web", 3000);
    write(
      "projects/meanderaw/meanderaw-web/node_modules/x/index.js",
      "port 3000\n",
    );
    write("projects/meanderaw/meanderaw-web/CHANGELOG.md", "port 3000\n");

    await command.synchronize("write");

    expect(
      read("projects/meanderaw/meanderaw-web/node_modules/x/index.js"),
    ).toBe("port 3000\n");
    expect(read("projects/meanderaw/meanderaw-web/CHANGELOG.md")).toBe(
      "port 3000\n",
    );
  });

  it("fails when a project does not declare a port", async () => {
    write("projects/lexico/lexico-web/project.json", '{"name":"lexico-web"}');
    write("projects/lexico/lexico-web/vite.config.mts", "export default {};\n");

    await expect(command.synchronize("check")).resolves.toBe(false);

    expect(sharedLogger.error).toHaveBeenCalledWith(
      "🔌 Failed to find the port a project declares",
      undefined,
      {
        file: path.join("projects/lexico/lexico-web", "vite.config.mts"),
        project: "lexico-web",
      },
    );
  });

  it("fails when two applications hash to the same port", async () => {
    // "ab-web" and a name differing by a multiple of 9000 in hash would collide;
    // the same name in two domains is the simplest way to share a port.
    writeProject("projects/one/shared-web", "shared-web", 1000);
    writeProject("projects/two/shared-web", "shared-web", 1000);

    await expect(command.synchronize("check")).resolves.toBe(false);

    expect(sharedLogger.error).toHaveBeenCalledWith(
      "🔌 Detected projects sharing a port",
      undefined,
      expect.objectContaining({ projects: ["shared-web", "shared-web"] }),
    );
  });

  it("fails and logs when the workspace has no projects directory", async () => {
    await expect(command.synchronize("check")).resolves.toBe(false);

    expect(sharedLogger.error).toHaveBeenCalledWith(
      "💥 Failed synchronizing the project ports",
      expect.any(String),
    );
  });

  describe("run", () => {
    it("defaults to check mode and exits 1 on drift", async () => {
      writeProject("projects/meanderaw/meanderaw-web", "meanderaw-web", 3000);

      await expectProcessExitOne(async () => {
        await command.run([]);
      });

      expect(sharedLogger.info).toHaveBeenCalledWith(
        "🔌 Detected an out-of-sync port",
        undefined,
        expect.any(Object),
      );
    });

    it("does not exit when every port is current", async () => {
      writeProject("projects/lexico/lexico-web", "lexico-web", 7797);

      await expect(command.run(["check"])).resolves.toBeUndefined();
    });

    it("exits 1 on an unknown mode", async () => {
      await expectProcessExitOne(async () => {
        await command.run(["sideways"]);
      });

      expect(sharedLogger.error).toHaveBeenCalledWith(
        "🚦 Rejected an unusable mode",
        undefined,
        expect.any(Object),
      );
    });
  });
});
