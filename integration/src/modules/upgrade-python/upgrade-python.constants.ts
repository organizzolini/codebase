import type { Command } from "../process-runner/process-runner.types";

// ♟️ Constants

/**
 * The application whose `requires-python` states the version in use. The
 * template below must say the same, and a conformance check holds them equal.
 */
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

/**
 * Locks again for the new version, then proves the lock installs on it: a lock
 * alone would not catch a dependency with no wheel for that Python (ormsgpack,
 * #1491).
 */
export const LOCK_COMMANDS: readonly Command[] = [
  ["uv", "lock", "--project", "configuration"],
  ["uv", "sync", "--frozen", "--quiet", "--project", "configuration"],
];
