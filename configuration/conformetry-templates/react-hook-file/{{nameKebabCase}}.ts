{{! A further hook inside an existing hook folder: the hook and its unit test, with the result it returns typed in its own types file beside it, since the folder's types file belongs to the folder's first hook. }}
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
