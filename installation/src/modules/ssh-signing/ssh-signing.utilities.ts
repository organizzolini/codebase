import {
  ALLOWED_SIGNERS_NAMESPACES,
  LENGTH_PREFIX_BYTES,
  SSH_SIGNATURE_MAGIC,
  SSH_SIGNATURE_PATTERN,
  SSH_SIGNATURE_PREFIX_LENGTH,
  WHITESPACE_PATTERN,
} from "./ssh-signing.constants";

// 🌎 Utilities

/** One line of an allowed signers file: a principal, its namespaces, a key. */
export function formatAllowedSigner(email: string, publicKey: string): string {
  return `${email} namespaces="${ALLOWED_SIGNERS_NAMESPACES}" ${publicKey}\n`;
}

/**
 * Reads the public key out of the SSH signature in a commit, as the
 * `<type> <base64>` line `ssh-keygen` lists in an allowed signers file.
 *
 * A signer that holds its private key out of reach still embeds the public
 * half in every signature it makes, which is the only way to learn it.
 * Returns `undefined` for a commit that is not SSH-signed or whose signature
 * is malformed.
 */
export function readSshPublicKey(commit: string): string | undefined {
  const armor = SSH_SIGNATURE_PATTERN.exec(commit)?.[1];

  if (armor === undefined) {
    return undefined;
  }

  const data = Buffer.from(armor.replaceAll(WHITESPACE_PATTERN, ""), "base64");

  if (
    data.subarray(0, SSH_SIGNATURE_MAGIC.length).toString() !==
    SSH_SIGNATURE_MAGIC
  ) {
    return undefined;
  }

  try {
    const publicKey = readString(data, SSH_SIGNATURE_PREFIX_LENGTH);
    const type = readString(publicKey, 0).toString();

    return type === "" ? undefined : `${type} ${publicKey.toString("base64")}`;
  } catch {
    return undefined;
  }
}

/**
 * Reads one length-prefixed string from `data` at `offset`, and throws when
 * the length runs past the end: `subarray` would clamp it and return a
 * truncated string as though it were whole.
 */
function readString(data: Buffer, offset: number): Buffer {
  const start = offset + LENGTH_PREFIX_BYTES;
  const end = start + data.readUInt32BE(offset);

  if (end > data.length) {
    throw new RangeError("An SSH string runs past the end of its signature.");
  }

  return data.subarray(start, end);
}
