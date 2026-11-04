import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { TypescriptService } from "./typescript.service";

describe(TypescriptService, () => {
  let service: TypescriptService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [TypescriptService],
    }).compile();

    service = await module.resolve(TypescriptService);
  });

  /** The distinct identifiers a source yields, sorted, so order never matters. */
  function identifiersOf(content: string, filePath = "source.ts"): string[] {
    return [...new Set(service.tokenize(content, filePath))].toSorted();
  }

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it.each([
    [
      "declarations and parameters",
      "const alphaValue = 1;\nfunction betaRun(gammaInput: DeltaType): void {}\n",
      ["DeltaType", "alphaValue", "betaRun", "gammaInput"],
    ],
    [
      "classes, members, decorators, and private names",
      "@Injectable()\nclass ShelfStore {\n  #secretCount = 0;\n  readonly bookTitle = 'x';\n  shelve(): void {}\n}\n",
      ["#secretCount", "Injectable", "ShelfStore", "bookTitle", "shelve"],
    ],
    [
      "comments of every kind",
      "// lineHidden\n/* blockHidden */\n/** docHidden {@link LinkHidden} */\nconst shown = 1;\n",
      ["shown"],
    ],
    [
      "string literals and string literal types",
      'const greeting = "hiddenString";\ntype ModeName = "hiddenMode" | \'otherHidden\';\n',
      ["ModeName", "greeting"],
    ],
    [
      "template literals, keeping only their substitutions",
      "const message = `hiddenHead ${visibleValue} hiddenTail`;\n",
      ["message", "visibleValue"],
    ],
    [
      "regular expressions",
      "const pattern = /hiddenRegex\\w+/u;\n",
      ["pattern"],
    ],
    [
      "object keys, quoted or not",
      "const table = { plainKey: 1, \"quotedKey\": 2, 'singleKey': 3, [computedName]: 4, 5: 6 };\n",
      ["computedName", "plainKey", "quotedKey", "singleKey", "table"],
    ],
    [
      "enum members, quoted or not",
      'enum ColorName { RedValue, "QuotedMember" = 2 }\n',
      ["ColorName", "QuotedMember", "RedValue"],
    ],
    [
      "property signatures with quoted names",
      'interface ShapeOptions { "kebab-name": string; plainName: number }\n',
      ["ShapeOptions", "kebab-name", "plainName"],
    ],
    [
      "imports and their aliases, never the module specifier",
      'import { alphaName as betaName } from "hiddenModule";\nimport * as gammaName from "./hiddenPath";\n',
      ["alphaName", "betaName", "gammaName"],
    ],
    [
      "a module declaration's name, which is a specifier",
      'declare module "hiddenAmbient" { export const ambientValue: number; }\n',
      ["ambientValue"],
    ],
    [
      "keywords, which are not identifiers",
      "async function runTask(): Promise<void> { return; }\nlet flag: boolean = true;\n",
      ["Promise", "flag", "runTask"],
    ],
  ])("reads %s", (_case, content, expected) => {
    expect(identifiersOf(content)).toStrictEqual(expected);
  });

  it("reads element names and attributes in a tsx file, never their text", () => {
    expect(
      identifiersOf(
        'const view = <PanelBox titleText="hidden">hiddenText {childValue}</PanelBox>;\n',
        "view.tsx",
      ),
    ).toStrictEqual(["PanelBox", "childValue", "titleText", "view"]);
  });

  it("reads javascript and jsx with the same parser", () => {
    expect(
      identifiersOf("export const viewer = () => <ListItem />;\n", "list.jsx"),
    ).toStrictEqual(["ListItem", "viewer"]);
    expect(
      identifiersOf("module.exports = { scriptName: 1 };\n", "script.cjs"),
    ).toStrictEqual(["exports", "module", "scriptName"]);
  });

  it("still scans a file with syntax errors", () => {
    expect(
      identifiersOf("const brokenThing = ;;\nfunction halfDone(argumentOne\n"),
    ).toStrictEqual(["argumentOne", "brokenThing", "halfDone"]);
  });

  it("drops the empty names the parser invents to recover from an error", () => {
    expect(service.tokenize("owner.;\n", "broken.ts")).toStrictEqual(["owner"]);
  });

  it("yields nothing for an empty file", () => {
    expect(service.tokenize("", "empty.ts")).toStrictEqual([]);
  });
});
