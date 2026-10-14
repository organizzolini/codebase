// ♟️ Constants

/** The source of truth for the extensions every devcontainer installs and recommends. */
export const VSCODE_EXTENSIONS_FILE = ".vscode/extensions.json";

/** Both devcontainer configurations that receive the extension lists. */
export const VSCODE_EXTENSIONS_DEVCONTAINER_FILES = [
  ".devcontainer/local/devcontainer.json",
  ".devcontainer/cloud/devcontainer.json",
] as const;
