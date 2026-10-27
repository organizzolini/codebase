{{! The name carries its own `use-` prefix, so the folder and file read use-media-query/use-media-query.ts and the hook useMediaQuery. The hook file holds the hook alone and what it returns is typed beside it. Its constants and helpers go in sibling .constants.ts and .utilities.ts files, added only when it has some: written empty, knip would report them unused. }}
import type { {{namePascalCase}}Result } from "./{{nameKebabCase}}.types";

// 🧩 Hook

/**
 * TODO: Document what {{nameCamelCase}} returns.
 */
export function {{nameCamelCase}}(): {{namePascalCase}}Result {
  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🎁 Result
  return {};
}
