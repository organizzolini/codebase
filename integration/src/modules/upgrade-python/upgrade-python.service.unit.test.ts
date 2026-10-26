import fs from "node:fs";
import os from "node:os";
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

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import {
  APPLICATION_PYPROJECT,
  TEMPLATE_PYPROJECT,
  TOOLS_PYPROJECT,
} from "./upgrade-python.constants";
import { UpgradePythonService } from "./upgrade-python.service";

const PYPROJECT = `requires-python = ">=3.15,<3.16"\n`;
const TOOLS = `target-version = "py315"\npythonVersion = "3.15"\n`;
const OK = { status: 0, stderr: "", stdout: "" };

describe(UpgradePythonService, () => {
  let service: UpgradePythonService;
  let processRunner: ProcessRunnerService;
  let directory: string;
  let originalDirectory: string;

  /** Reads a file of the scratch directory. */
  const read = (file: string): string => fs.readFileSync(file, "utf8");

  /** Makes uv install fine and report the given newest Python. */
  const newestIs = (version: string): void => {
    vi.mocked(processRunner.captureSequence).mockReturnValue(OK);
    vi.mocked(processRunner.capture).mockReturnValue({
      ...OK,
      stdout: `${version}\n`,
    });
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UpgradePythonService,
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
      ],
    }).compile();

    service = await module.resolve(UpgradePythonService);
    processRunner = await module.resolve(ProcessRunnerService);
  });

  beforeEach(() => {
    originalDirectory = process.cwd();
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "python-test-"));
    process.chdir(directory);

    for (const file of [
      APPLICATION_PYPROJECT,
      TEMPLATE_PYPROJECT,
      TOOLS_PYPROJECT,
    ]) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
    }

    fs.writeFileSync(APPLICATION_PYPROJECT, PYPROJECT);
    fs.writeFileSync(TEMPLATE_PYPROJECT, PYPROJECT);
    fs.writeFileSync(TOOLS_PYPROJECT, TOOLS);
    vi.mocked(processRunner.capture).mockReset();
    vi.mocked(processRunner.captureSequence).mockReset();
  });

  afterEach(() => {
    process.chdir(originalDirectory);
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("moves every setting to a newer release and locks again", () => {
    expect.hasAssertions();

    newestIs("3.16");

    expect(service.upgrade()).toBe("Python 3.16");
    expect(read(APPLICATION_PYPROJECT)).toBe(
      `requires-python = ">=3.16,<3.17"\n`,
    );
    expect(read(TEMPLATE_PYPROJECT)).toBe(read(APPLICATION_PYPROJECT));
    expect(read(TOOLS_PYPROJECT)).toBe(
      `target-version = "py316"\npythonVersion = "3.16"\n`,
    );
    expect(processRunner.captureSequence).toHaveBeenCalledTimes(1);
  });

  it("changes nothing when the newest release is older than the one in use", () => {
    expect.hasAssertions();

    newestIs("3.14");

    expect(service.upgrade()).toBe(
      "Python 3.15 (the newest uv installs is 3.14)",
    );
    expect(read(APPLICATION_PYPROJECT)).toBe(PYPROJECT);
    expect(read(TOOLS_PYPROJECT)).toBe(TOOLS);
  });

  it("proceeds when the newest release is the one in use", () => {
    expect.hasAssertions();

    newestIs("3.15");

    expect(service.upgrade()).toBe("Python 3.15");
    expect(read(APPLICATION_PYPROJECT)).toBe(PYPROJECT);
  });

  it("throws when uv cannot install or report a version", () => {
    expect.hasAssertions();

    vi.mocked(processRunner.capture).mockReturnValue({
      status: 1,
      stderr: "no network",
      stdout: "",
    });

    expect(() => service.upgrade()).toThrow("no network");
  });

  it("throws when the lock or the sync fails", () => {
    expect.hasAssertions();

    vi.mocked(processRunner.capture).mockReturnValue({
      ...OK,
      stdout: "3.16\n",
    });
    vi.mocked(processRunner.captureSequence).mockReturnValue({
      status: 1,
      stderr: "no wheel",
      stdout: "",
    });

    expect(() => service.upgrade()).toThrow("no wheel");
  });
});
