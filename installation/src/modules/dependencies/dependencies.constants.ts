// ♟️ Constants

/** Where Terraform's configuration lives, relative to the workspace root. */
export const TERRAFORM_DIRECTORY = "infrastructure/terraform";

/** The Terraform address of the cluster this project manages. */
export const CLUSTER_RESOURCE_ADDRESS = "linode_lke_cluster.cluster";

/** The variable holding the Linode API token. */
export const LINODE_TOKEN_VARIABLE = "TF_VAR_linode_token";

/** The variable holding the cluster's id, which may carry a node pool suffix. */
export const CLUSTER_ID_VARIABLE = "TF_VAR_linode_kubernetes_engine_cluster_id";

/** The workspace config uv should resolve as the project root. */
export const UV_WORKSPACE_PROJECT_PATH = "configuration";

/** Matches the first separator of a node pool suffix, such as `lke12345-6789`. */
export const POOL_SUFFIX_PATTERN = /[-_].*$/u;

/** Matches everything that is not a digit. */
export const NON_DIGIT_PATTERN = /\D/gu;

/** Matches the `export ` a shell-style `.env` line may start with. */
export const EXPORT_PREFIX_PATTERN = /^\s*export\s+/u;

/** Matches a valid variable name. */
export const VARIABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/u;

/** Matches a value wrapped in one matching pair of quotes; group 2 is the value. */
export const SURROUNDING_QUOTES_PATTERN = /^(["'])(.*)\1$/u;

/** Said when kubeconfig cannot be written for want of credentials. */
export const KUBECONFIG_SKIPPED_MESSAGE = `⚠️  Skipping kubeconfig: set ${LINODE_TOKEN_VARIABLE} and ${CLUSTER_ID_VARIABLE} in .env`;
