// ♟️ Constants

import { RELEASE_ARCHIVE_TOOLS } from "../release-archives/release-archives.constants";

import type { InfrastructureTool } from "./software.types";

/** The check that asks Python whether it is new enough. */
export const PYTHON_VERSION_CHECK =
  "import sys; assert sys.version_info >= (3, 14)";

/** Where the PostgreSQL project publishes 18 for Ubuntu and Debian. */
export const PGDG_REPOSITORY_URL = "http://apt.postgresql.org/pub/repos/apt";

/** The key that signs that repository. */
export const PGDG_KEY_URL =
  "https://www.postgresql.org/media/keys/ACCC4CF8.asc";

/** Where apt is told about the repository. */
export const PGDG_APT_SOURCE_FILE = "/etc/apt/sources.list.d/pgdg.list";

/** Where apt finds the key, converted to the format apt reads. */
export const PGDG_KEY_FILE = "/etc/apt/trusted.gpg.d/postgresql.gpg";

/** The apt package holding `pg_dump` and `pg_restore` 18. */
export const POSTGRES_APT_PACKAGE = "postgresql-client-18";

/** Where that package puts its 18 tools; `pg_dump` picks by cluster. */
export const POSTGRES_APT_BIN_DIRECTORY = "/usr/lib/postgresql/18/bin";

/** The 18 tools linked ahead of that wrapper, as Homebrew does. */
export const POSTGRES_LINKED_TOOLS = ["pg_dump", "pg_restore"];

/** The model the ReAct agent uses by default. */
export const OLLAMA_DEFAULT_MODEL = "gemma4:e2b";

/** Where Ollama answers once it is running. */
export const OLLAMA_VERSION_ENDPOINT = "http://localhost:11434/api/version";

/** How many times to ask whether Ollama is up, a second apart. */
export const OLLAMA_READINESS_ATTEMPTS = 15;

/** Attempts to reach the Docker daemon, two seconds apart. */
export const DOCKER_READINESS_ATTEMPTS = 30;

/** Steps printed, in order, when no signing key exists. */
export const NO_KEY_INSTRUCTIONS = [
  "⚠️  No GPG secret key found.",
  "   To create one, run:",
  '     gpg --quick-generate-key "Your Name <you@example.com>" rsa4096 sign 0',
  "   Then configure git signing:",
  "     KEY_ID=$(gpg --list-secret-keys --keyid-format=long | grep '^sec' | awk '{print $2}' | cut -d'/' -f2)",
  '     git config --global user.signingkey "$KEY_ID"',
  "     git config --global commit.gpgsign true",
  "   Finally, add the public key to GitHub:",
  "     gpg --armor --export you@example.com",
  "     https://github.com/settings/gpg/new",
];

/** Infrastructure tools in install order; gitleaks guards the pre-commit hook. */
export const INFRASTRUCTURE_TOOLS: InfrastructureTool[] = [
  { name: "gitleaks" },
  { name: "terraform" },
  { name: "trivy" },
  { name: "jq" },
  { name: "gh" },
  { name: "helm" },
  { formula: "kubernetes-cli", name: "kubectl" },
  { name: "linode-cli" },
];

/** The name that asks for PostgreSQL 18's `pg_dump` and `pg_restore`. */
export const POSTGRES_CLIENT_NAME = "postgres-client";

/** The tools installed from a release archive, which only Linux uses. */
export const ARCHIVE_TOOL_NAMES: ReadonlySet<string> = new Set(
  RELEASE_ARCHIVE_TOOLS.map(({ name }) => name),
);

/** Every name `software` accepts to install just that software. */
export const NAMED_SOFTWARE: readonly string[] = [
  ...ARCHIVE_TOOL_NAMES,
  POSTGRES_CLIENT_NAME,
];

/** What `pg_dump --version` prints for the PostgreSQL release the database tests need. */
export const POSTGRES_VERSION_MARKER = "18.";

export const POSTGRES_NOT_18_MESSAGE =
  "pg_dump is not PostgreSQL 18 after the install; the database tests need 18's client tools";

/** Reports names that `software` cannot install by name. */
export const unknownNamesMessage = (names: readonly string[]): string =>
  `Unknown software ${names.join(", ")}; choose from ${NAMED_SOFTWARE.join(", ")}`;

/** Notes a named archive tool that Homebrew installs on a Mac. */
export const archiveToolOnMacMessage = (name: string): string =>
  `${name} is installed from a release archive, which only Linux uses; run software with no names to install it through Homebrew`;
