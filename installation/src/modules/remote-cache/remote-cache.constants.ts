import { z } from "zod";

// ♟️ Constants

/** The bucket the shared Nx cache lives in, as `infrastructure/terraform/linode` names it. */
export const REMOTE_CACHE_BUCKET = "organizzolini-codebase-nx-cache";

/** The region Linode files that bucket under when a key is scoped to it. */
export const REMOTE_CACHE_BUCKET_REGION = "us-iad-2";

/** The S3 endpoint of that region. */
export const REMOTE_CACHE_ENDPOINT = "https://us-iad-18.linodeobjects.com";

/** The region requests are signed with, the one CI signs with too. */
export const REMOTE_CACHE_SIGNING_REGION = "us-east-1";

/** Where the key is kept, under the home directory; the session hook reads the same file. */
export const REMOTE_CACHE_ENVIRONMENT_FILE =
  ".config/codebase/nx-shared-cache-remote.env";

/** The variable that points setup and the session hook at another file. */
export const REMOTE_CACHE_ENVIRONMENT_FILE_VARIABLE =
  "NX_SHARED_CACHE_REMOTE_ENV_FILE";

/** The tool that creates the key. */
export const LINODE_CLI = "linode-cli";

/** What `linode-cli object-storage keys-create --json` prints: the new key, in a list. */
export const keyResponseSchema = z
  .array(z.object({ access_key: z.string(), secret_key: z.string() }))
  .min(1);

export const LINODE_CLI_MISSING_MESSAGE =
  "ℹ️  Skipping the remote Nx cache: linode-cli is not installed. Run the software step, then `linode-cli configure`, then this again.";

export const NOT_A_KEY_MESSAGE =
  "⚠️  Skipping the remote Nx cache: linode-cli printed something that is not a key.";

/** Tells the person the key could not be created, and why. */
export const keyFailedMessage = (output: string): string =>
  `⚠️  Skipping the remote Nx cache: linode-cli could not create a read-only key.\n${output.trim()}`;

/** Tells the person the machine already has a key. */
export const alreadyConfiguredMessage = (file: string): string =>
  `👍 The remote Nx cache is already configured in ${file}`;

/** Tells the person where the new key went, without printing it. */
export const keyCreatedMessage = (file: string): string =>
  `✅ Created a read-only key for the remote Nx cache in ${file}; stop the running shared cache server once so it starts with it`;
