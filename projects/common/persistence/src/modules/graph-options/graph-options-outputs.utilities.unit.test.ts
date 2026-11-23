import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  graphOutputDryRunMessages,
  renderGraphJson,
  resolveGraphOutputs,
  writeGraphOutputs,
} from "./graph-options-outputs.utilities";

import type { GraphModel } from "../graph-mermaid/graph-mermaid.types";

const MODEL: GraphModel = {
  directed: true,
  edges: [{ label: "parent", source: "a", target: "b", weight: 2 }],
  nodes: [
    { id: "a", label: "Work", marker: "root" },
    { id: "b", label: "Email" },
  ],
  warnings: ["Node 6 names parent 99, which no row has; drawn as a root"],
};

describe("graph options outputs utilities", () => {
  let directory: string;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "graph-outputs-"));
  });

  afterEach(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  describe(renderGraphJson, () => {
    it("pretty-prints the model with a trailing newline", () => {
      expect(renderGraphJson(MODEL)).toBe(
        `${JSON.stringify(MODEL, null, 2)}\n`,
      );
    });

    it("round-trips the model, warnings included", () => {
      expect(JSON.parse(renderGraphJson(MODEL))).toStrictEqual(MODEL);
    });
  });

  describe(resolveGraphOutputs, () => {
    it("resolves to no files and no overwrite when no output was named", () => {
      expect(resolveGraphOutputs({})).toStrictEqual({
        json: undefined,
        markdown: undefined,
        overwrite: false,
      });
    });

    it("resolves a relative path against the working directory", () => {
      const outputs = resolveGraphOutputs({ json: "reports/tree.json" });

      expect(outputs.json).toBe(path.resolve("reports/tree.json"));
    });

    it("keeps an absolute path and carries --overwrite", () => {
      const file = path.join(directory, "tree.md");

      expect(
        resolveGraphOutputs({ markdown: file, overwrite: true }),
      ).toStrictEqual({
        json: undefined,
        markdown: file,
        overwrite: true,
      });
    });

    it("creates nothing and accepts a path whose missing parents would be created", () => {
      const file = path.join(directory, "missing", "nested", "tree.json");

      expect(resolveGraphOutputs({ json: file }).json).toBe(file);
      expect(fs.existsSync(path.join(directory, "missing"))).toBe(false);
    });

    it("refuses an existing file without --overwrite, naming the flag", () => {
      const file = path.join(directory, "tree.json");
      fs.writeFileSync(file, "kept");

      expect(() => resolveGraphOutputs({ json: file })).toThrow(
        `${file} already exists and was left unchanged: choose another path, or pass --overwrite to replace it`,
      );
      expect(fs.readFileSync(file, "utf8")).toBe("kept");
    });

    it("accepts an existing file with --overwrite", () => {
      const file = path.join(directory, "tree.json");
      fs.writeFileSync(file, "kept");

      expect(resolveGraphOutputs({ json: file, overwrite: true }).json).toBe(
        file,
      );
    });

    it("refuses a path that is a directory", () => {
      expect(() =>
        resolveGraphOutputs({ markdown: directory, overwrite: true }),
      ).toThrow(
        `--output-markdown ${directory} is a directory: name a file path, e.g. --output-markdown tree.md`,
      );
    });

    it("refuses a parent that exists as a file", () => {
      const parent = path.join(directory, "blocker");
      fs.writeFileSync(parent, "not a directory");

      expect(() =>
        resolveGraphOutputs({ json: path.join(parent, "tree.json") }),
      ).toThrow(
        `--output-json cannot write into ${parent}: it is not a writable directory`,
      );
    });

    it("refuses a parent it cannot write into", () => {
      const locked = path.join(directory, "locked");
      fs.mkdirSync(locked);
      fs.chmodSync(locked, 0o500);

      try {
        expect(() =>
          resolveGraphOutputs({ json: path.join(locked, "tree.json") }),
        ).toThrow(
          `--output-json cannot write into ${locked}: it is not a writable directory`,
        );
      } finally {
        fs.chmodSync(locked, 0o700);
      }
    });

    it("refuses both flags naming the same file", () => {
      const file = path.join(directory, "tree");

      expect(() => resolveGraphOutputs({ json: file, markdown: file })).toThrow(
        `--output-markdown and --output-json name the same file ${file}: name two files`,
      );
    });
  });

  describe(graphOutputDryRunMessages, () => {
    it("plans to overwrite an existing file and to create a missing one", () => {
      const existing = path.join(directory, "tree.json");
      const missing = path.join(directory, "tree.md");
      fs.writeFileSync(existing, "kept");

      expect(
        graphOutputDryRunMessages({
          json: existing,
          markdown: missing,
          overwrite: true,
        }),
      ).toStrictEqual([
        `🔍 Planning to overwrite ${existing}`,
        `🔍 Planning to create ${missing}`,
      ]);
    });
  });

  describe(writeGraphOutputs, () => {
    it("writes every file, creating its missing parent directories, and leaves no partial file", () => {
      const json = path.join(directory, "deep", "tree.json");
      const markdown = path.join(directory, "tree.md");

      writeGraphOutputs([
        { content: "{}\n", path: json },
        { content: "```mermaid\n```\n", path: markdown },
      ]);

      expect(fs.readFileSync(json, "utf8")).toBe("{}\n");
      expect(fs.readFileSync(markdown, "utf8")).toBe("```mermaid\n```\n");
      expect(fs.readdirSync(path.join(directory, "deep"))).toStrictEqual([
        "tree.json",
      ]);
      expect(fs.readdirSync(directory).toSorted()).toStrictEqual([
        "deep",
        "tree.md",
      ]);
    });
  });
});
