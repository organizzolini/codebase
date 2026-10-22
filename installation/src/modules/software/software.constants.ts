// ♟️ Constants

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

/** Where that package puts the 18 tools; the `pg_dump` in `/usr/bin` picks a version by the cluster it finds. */
export const POSTGRES_APT_BIN_DIRECTORY = "/usr/lib/postgresql/18/bin";

/** The 18 tools linked ahead of that wrapper, as Homebrew's `link --force` does on a Mac. */
export const POSTGRES_LINKED_TOOLS = ["pg_dump", "pg_restore"];

/** The model the ReAct agent uses by default. */
export const OLLAMA_DEFAULT_MODEL = "gemma4:e2b";

/** Where Ollama answers once it is running. */
export const OLLAMA_VERSION_ENDPOINT = "http://localhost:11434/api/version";

/** How many times to ask whether Ollama is up, a second apart. */
export const OLLAMA_READINESS_ATTEMPTS = 15;

/** How many times to ask whether the Docker daemon is up, two seconds apart. */
export const DOCKER_READINESS_ATTEMPTS = 30;

/** What to do, printed in order, when there is no key to sign with. */
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

/**
 * The infrastructure tools, in install order.
 *
 * gitleaks scans for secrets in the pre-commit hook. terraform manages the
 * LKE cluster, trivy scans images, jq parses JSON in CI
 * scripts, gh drives pull requests, helm deploys caelundas, and kubectl
 * inspects the cluster.
 */
export const INFRASTRUCTURE_TOOLS: InfrastructureTool[] = [
  { name: "gitleaks" },
  { name: "terraform" },
  { name: "trivy" },
  { name: "jq" },
  { name: "gh" },
  { name: "helm" },
  { formula: "kubernetes-cli", name: "kubectl" },
];
