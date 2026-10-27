import { readFileSync } from "node:fs";
import path from "node:path";

/** The headwords of the root glossary, read the way the root glossary lists them. */
const rootGlossary = path.resolve(import.meta.dirname, "../../GLOSSARY.md");

export default {
  exclude: {
    words: () =>
      [...readFileSync(rootGlossary, "utf8").matchAll(/^- \*\*(.+)\*\*:/gmu)]
        .map((match) => match[1])
        .filter((word): word is string => word !== undefined),
  },
  include: ["src/**"],
  outputs: [{ path: "README.md", type: "markdown" }],
};
