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

import { LoggerService } from "@codebase/observability";

import {
  EPHEMERIS_BASE_URL,
  EPHEMERIS_FILENAMES,
} from "./ephemeris-download.constants";
import { EphemerisDownloadService } from "./ephemeris-download.service";

describe(EphemerisDownloadService, () => {
  let service: EphemerisDownloadService;
  let workingDirectory: string;
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  const dataDirectory = (): string =>
    path.join(workingDirectory, "data", "ephemeris");
  const dataFile = (filename: string): string =>
    path.join(dataDirectory(), filename);
  const listing = (): string[] =>
    fs.existsSync(dataDirectory())
      ? fs.readdirSync(dataDirectory()).toSorted()
      : [];

  /** Serves `content` for every file, whatever is asked for. */
  const serve = (content = "ephemeris"): void => {
    const respond = async (): Promise<Response> =>
      new Response(await new Blob([content]).arrayBuffer(), { status: 200 });
    fetchMock.mockImplementation(respond);
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EphemerisDownloadService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(EphemerisDownloadService);
  });

  beforeEach(() => {
    workingDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "download-"));
    vi.spyOn(process, "cwd").mockReturnValue(workingDirectory);
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fs.rmSync(workingDirectory, { force: true, recursive: true });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        EphemerisDownloadService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("EphemerisDownloadService");
  });

  it("downloads every file into the data directory", async () => {
    serve("swiss");

    await service.download();

    expect(fetchMock.mock.calls.map(([url]) => url)).toStrictEqual(
      EPHEMERIS_FILENAMES.map(
        (filename) => `${EPHEMERIS_BASE_URL}/${filename}`,
      ),
    );
    expect(listing()).toStrictEqual([...EPHEMERIS_FILENAMES].toSorted());
    expect(fs.readFileSync(dataFile(EPHEMERIS_FILENAMES[0]), "utf8")).toBe(
      "swiss",
    );
  });

  it("leaves no partial file behind once it finishes", async () => {
    serve();

    await service.download();

    expect(listing().filter((name) => name.endsWith(".part"))).toStrictEqual(
      [],
    );
  });

  it("skips the files that are already there", async () => {
    serve("fresh");
    fs.mkdirSync(dataDirectory(), { recursive: true });
    fs.writeFileSync(dataFile(EPHEMERIS_FILENAMES[0]), "kept");

    await service.download();

    expect(fetchMock).toHaveBeenCalledTimes(EPHEMERIS_FILENAMES.length - 1);
    expect(fs.readFileSync(dataFile(EPHEMERIS_FILENAMES[0]), "utf8")).toBe(
      "kept",
    );
  });

  it("downloads nothing when every file is already there", async () => {
    serve();
    fs.mkdirSync(dataDirectory(), { recursive: true });

    for (const filename of EPHEMERIS_FILENAMES) {
      fs.writeFileSync(dataFile(filename), "kept");
    }

    await service.download();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("downloads a file again when the one there is empty", async () => {
    serve("whole");
    fs.mkdirSync(dataDirectory(), { recursive: true });
    fs.writeFileSync(dataFile(EPHEMERIS_FILENAMES[0]), "");

    await service.download();

    expect(fs.readFileSync(dataFile(EPHEMERIS_FILENAMES[0]), "utf8")).toBe(
      "whole",
    );
  });

  it("throws, and keeps nothing, when the server answers with an error", async () => {
    fetchMock.mockResolvedValue(new Response("missing", { status: 404 }));

    await expect(service.download()).rejects.toThrow(
      `Failed to download ${EPHEMERIS_BASE_URL}/${EPHEMERIS_FILENAMES[0]}: HTTP 404`,
    );
    expect(listing()).toStrictEqual([]);
  });

  it("throws, and keeps nothing, when the file arrives empty", async () => {
    serve("");

    await expect(service.download()).rejects.toThrow(
      "Downloaded an empty file",
    );
    expect(listing()).toStrictEqual([]);
  });

  it("removes the partial file when the connection drops mid-download", async () => {
    const dropped = new ReadableStream<Uint8Array>({
      pull(controller): void {
        controller.enqueue(new TextEncoder().encode("half"));
        controller.error(new Error("connection reset"));
      },
    });
    fetchMock.mockResolvedValue(new Response(dropped, { status: 200 }));

    await expect(service.download()).rejects.toThrow("connection reset");
    expect(listing()).toStrictEqual([]);
  });

  it("keeps the files it finished when a later one fails", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response("one", { status: 200 }))
      .mockResolvedValueOnce(new Response("nope", { status: 500 }));

    await expect(service.download()).rejects.toThrow("HTTP 500");
    expect(listing()).toStrictEqual([EPHEMERIS_FILENAMES[0]]);
  });

  it("is safe to run again after a failure", async () => {
    fetchMock.mockResolvedValueOnce(new Response("nope", { status: 500 }));

    await expect(service.download()).rejects.toThrow("HTTP 500");

    serve("whole");
    await service.download();

    expect(listing()).toStrictEqual([...EPHEMERIS_FILENAMES].toSorted());
  });
});
