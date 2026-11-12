import type { Command } from "../process-runner/process-runner.types";

// ♟️ Constants

/** Application whose `requires-python` states the version; the template must match. */
export const APPLICATION_PYPROJECT = "projects/affirmancy/pyproject.toml";

/** The template of the notebook applications, which follows the application. */
export const TEMPLATE_PYPROJECT =
  "configuration/conformetry-templates/jupyter-notebook-application/{{nameKebabCase}}/pyproject.toml";

/** The workspace configuration, whose ruff and pyright versions follow too. */
export const TOOLS_PYPROJECT = "configuration/pyproject.toml";

/** Prints the `major.minor` of the Python it runs on. */
export const VERSION_PROGRAM =
  "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')";

/** What the program prints: Python 3 and a minor version. */
export const VERSION_PATTERN = /^3\.\d+$/u;

/** Installs the newest stable Python, which makes it the one `3` names. */
export const INSTALL_COMMAND: Command = [
  "uv",
  "python",
  "install",
  "3",
  "--upgrade",
];

/** Re-lock, then prove it installs; a lock misses no-wheel packages. */
export const LOCK_COMMANDS: readonly Command[] = [
  ["uv", "lock", "--project", "configuration"],
  ["uv", "sync", "--frozen", "--quiet", "--project", "configuration"],
];
