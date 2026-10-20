// ♟️ Constants

/** Marker that guards each block against being appended twice. */
export const MARKERS = {
  completions: "# codebase: shell completions",
  gpg: "# codebase: GPG TTY for commit signing",
  nodeOptions: "# codebase: Node.js memory limit",
  nvm: "# codebase: nvm configuration",
  pnpm: "# codebase: pnpm global bin",
  terraform: "# codebase: terraform completion",
} as const;

/** The marker of the block that once sourced the process helper functions. */
export const LEGACY_PROCESSES_MARKER = "# codebase: shell utility functions";

/** The script that block sourced, deleted since; its line is what is removed. */
export const LEGACY_PROCESSES_SCRIPT = "scripts/shell/processes.sh";

/** Exports the Node.js memory limit, matching the dev container. */
export const NODE_OPTIONS_BLOCK =
  'export NODE_OPTIONS="--max-old-space-size=2048"';

/**
 * Exports the terminal gpg-agent shows its passphrase prompt on.
 *
 * Written as the shell text it is, so the `$(tty)` is evaluated when the
 * terminal starts rather than once, here.
 */
export const GPG_TTY_BLOCK = "export GPG_TTY=$(tty)";

/** Puts pnpm's global bin directory on `PATH` once. */
export const PNPM_BLOCK = [
  'export PNPM_HOME="$HOME/.local/share/pnpm"',
  'case ":$PATH:" in *":$PNPM_HOME/bin:"*) ;; *) export PATH="$PNPM_HOME/bin:$PNPM_HOME:$PATH" ;; esac',
].join("\n");

/** The commands whose completions are wired when they are installed. */
export const COMPLETION_COMMANDS = [
  {
    command: "pnpm",
    line: (shell: string): string => `eval "$(pnpm completion ${shell})"`,
  },
  {
    command: "kubectl",
    line: (shell: string): string => `eval "$(kubectl completion ${shell})"`,
  },
  {
    command: "helm",
    line: (shell: string): string => `eval "$(helm completion ${shell})"`,
  },
  {
    command: "gh",
    line: (shell: string): string => `eval "$(gh completion -s ${shell})"`,
  },
] as const;

/** The file name zsh reads, which selects zsh completions. */
export const ZSH_RC_NAME = ".zshrc";
