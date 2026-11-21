import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { TypescriptCommentsService } from "./typescript-comments.service";

describe(TypescriptCommentsService, () => {
  let service: TypescriptCommentsService;

  beforeAll(async () => {
    const { instance } = await buildTestingModule(TypescriptCommentsService);

    service = instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(TypescriptCommentsService);

    expect(instance).toBeInstanceOf(TypescriptCommentsService);
  });

  it("reads a `//` comment's line, prose, and source", () => {
    expect(service.read("const value = 1;\n// a note\n", "a.ts")).toStrictEqual(
      [
        {
          line: 2,
          ownLine: true,
          prose: " a note",
          source: "// a note",
        },
      ],
    );
  });

  it("reads a plain block comment spanning several lines as one token", () => {
    expect(service.read("/* line one\nline two */\n", "a.ts")).toStrictEqual([
      {
        line: 1,
        ownLine: true,
        prose: " line one\nline two ",
        source: "/* line one\nline two */",
      },
    ]);
  });

  it("marks a comment following code as not starting its own line", () => {
    const [token] = service.read("const value = 1; // trailing\n", "a.ts");

    expect(token?.ownLine).toBe(false);
  });

  it("marks an indented comment as starting its own line", () => {
    const [token] = service.read("  // indented\n", "a.ts");

    expect(token?.ownLine).toBe(true);
  });

  it("never reads a `//` inside a string as a comment", () => {
    expect(
      service.read('const url = "https://example.com";\n', "a.ts"),
    ).toStrictEqual([]);
  });

  it("never reads a `//` inside a template literal as a comment", () => {
    expect(
      service.read("const url = `https://${host}`;\n", "a.ts"),
    ).toStrictEqual([]);
  });

  it("skips a JSDoc block, which is measured elsewhere", () => {
    expect(
      service.read(
        "/**\n * Documents a function.\n */\nfunction run() {}\n",
        "a.ts",
      ),
    ).toStrictEqual([]);
  });

  it("finds nothing in a file with no comments", () => {
    expect(service.read("const value = 1;\n", "a.ts")).toStrictEqual([]);
  });

  it("reads a comment sitting after the last statement in the file", () => {
    expect(
      service.read("const value = 1;\n// trailing note\n", "a.ts"),
    ).toStrictEqual([
      {
        line: 2,
        ownLine: true,
        prose: " trailing note",
        source: "// trailing note",
      },
    ]);
  });

  it("reads every comment even where a bare scanner would lose its place", () => {
    // A bare `ts.createScanner` can misread a division as a regex opener and drop every real comment after it.
    // Parsing for real avoids that, and this asserts against exactly that shape.
    const content = [
      "const ratio = a / b;",
      "// first note",
      "const other = c / d;",
      "// second note",
      "",
    ].join("\n");

    expect(
      service.read(content, "a.ts").map((token) => token.line),
    ).toStrictEqual([2, 4]);
  });

  it("reads a `.js` file's comments the same way", () => {
    expect(
      service
        .read("const value = 1;\n// a note\n", "a.js")
        .map((token) => token.line),
    ).toStrictEqual([2]);
  });

  it("parses a `.jsx` file with JSX syntax enabled", () => {
    const content = "const element = <div />;\n// a note\n";

    expect(
      service.read(content, "a.jsx").map((token) => token.line),
    ).toStrictEqual([2]);
  });
});
