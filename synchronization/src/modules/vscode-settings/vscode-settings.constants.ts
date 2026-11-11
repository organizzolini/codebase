// ♟️ Constants

/** The workspace settings that apply in-container once merged into the Machine settings. */
export const VSCODE_WORKSPACE_SETTINGS_FILE = ".vscode/settings.json";

/** VS Code Server's Machine settings, volume-mounted to outlive a rebuild. */
export const VSCODE_MACHINE_SETTINGS_DIRECTORY =
  "/root/.vscode-server/data/Machine";

/** The Machine settings file inside that directory. */
export const VSCODE_MACHINE_SETTINGS_FILE = `${VSCODE_MACHINE_SETTINGS_DIRECTORY}/settings.json`;
