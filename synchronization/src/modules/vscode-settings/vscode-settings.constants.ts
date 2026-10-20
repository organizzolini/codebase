// ♟️ Constants

/** The workspace settings that apply in-container once merged into the Machine settings. */
export const VSCODE_WORKSPACE_SETTINGS_FILE = ".vscode/settings.json";

/** Where VS Code Server keeps Machine settings; volume-mounted, so they outlive a rebuild. */
export const VSCODE_MACHINE_SETTINGS_DIRECTORY =
  "/root/.vscode-server/data/Machine";

/** The Machine settings file inside that directory. */
export const VSCODE_MACHINE_SETTINGS_FILE = `${VSCODE_MACHINE_SETTINGS_DIRECTORY}/settings.json`;
