{{! The name carries its own `use-` prefix, so the folder and file read use-media-query/use-media-query.ts and the hook useMediaQuery. The hook file holds the hook alone; what it returns is typed beside it, and its constants and helpers go in the sibling files written here with only their section markers. }}
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
