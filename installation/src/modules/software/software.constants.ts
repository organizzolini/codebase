// ♟️ Constants

import type { InfrastructureTool } from "./software.types";

/** The check that asks Python whether it is new enough. */
export const PYTHON_VERSION_CHECK =
  "import sys; assert sys.version_info >= (3, 14)";

/** The model the ReAct agent uses by default. */
export const OLLAMA_DEFAULT_MODEL = "gemma4:e2b";

/** Where Ollama answers once it is running. */
export const OLLAMA_VERSION_ENDPOINT = "http://localhost:11434/api/version";

/** How many times to ask whether Ollama is up, a second apart. */
export const OLLAMA_READINESS_ATTEMPTS = 15;

/** How many times to ask whether the Docker daemon is up, two seconds apart. */
export const DOCKER_READINESS_ATTEMPTS = 30;

/** The helm release Linux setup installs, the one this repository is tested with. */
export const HELM_VERSION = "v3.16.4";

/** Where that release's archive for 64-bit Linux comes from. */
export const HELM_RELEASE_URL = `https://get.helm.sh/helm-${HELM_VERSION}-linux-amd64.tar.gz`;

/** The SHA-256 that release publishes for its 64-bit Linux archive. */
export const HELM_LINUX_AMD64_SHA256 =
  "fc307327959aa38ed8f9f7e66d45492bb022a66c3e5da6063958254b9767d179";

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
 * LKE cluster, trivy scans images, supabase runs lexico's local stack, jq
 * parses JSON in CI scripts, gh drives pull requests, helm deploys caelundas,
 * and kubectl inspects the cluster.
 */
export const INFRASTRUCTURE_TOOLS: InfrastructureTool[] = [
  { name: "gitleaks" },
  { name: "terraform" },
  { name: "trivy" },
  { formula: "supabase/tap/supabase", name: "supabase" },
  { name: "jq" },
  { name: "gh" },
  { name: "helm" },
  { formula: "kubernetes-cli", name: "kubectl" },
];
