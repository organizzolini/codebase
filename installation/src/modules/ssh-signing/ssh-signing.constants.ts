// ♟️ Constants

/** The hash git gives an empty tree, which every repository can commit to. */
export const EMPTY_TREE_HASH = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

/** The message of the throwaway commit signed to learn the signer's key. */
export const PROBE_MESSAGE = "allowed-signers-probe";

/** The directory under the home directory that holds the allowed signers. */
export const SSH_DIRECTORY_NAME = ".ssh";

/** Owner-only, as ssh expects of its directory. */
export const SSH_DIRECTORY_MODE = 0o700;

/** The file `gpg.ssh.allowedSignersFile` names. */
export const ALLOWED_SIGNERS_FILE_NAME = "allowed_signers";

/** Restricts a listed key to signing commits, not other SSH uses. */
export const ALLOWED_SIGNERS_NAMESPACES = "git";

/** The Debian package that provides `ssh-keygen`. */
export const OPENSSH_PACKAGE = "openssh-client";

/** The armored signature a signed commit carries in its `gpgsig` header. */
export const SSH_SIGNATURE_PATTERN =
  /-----BEGIN SSH SIGNATURE-----([\s\S]*?)-----END SSH SIGNATURE-----/u;

/** Every run of whitespace, which armor wraps and a commit header indents. */
export const WHITESPACE_PATTERN = /\s+/gu;

/** The bytes an SSH signature opens with. */
export const SSH_SIGNATURE_MAGIC = "SSHSIG";

/** Six bytes of magic and a four-byte version precede the signer's key. */
export const SSH_SIGNATURE_PREFIX_LENGTH = 10;

/** SSH prefixes every string with its length, as four big-endian bytes. */
export const LENGTH_PREFIX_BYTES = 4;
