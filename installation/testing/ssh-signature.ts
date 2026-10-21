/** A commit object's text with the public key of the SSH key that signed it. */
export interface SignedCommit {
  commit: string;
  publicKey: string;
}

/**
 * Builds the text of a commit object carrying an SSH signature made by a key of
 * this type, armored and indented the way git writes a `gpgsig` header.
 */
export function createSignedCommit(type = "ssh-ed25519"): SignedCommit {
  const publicKey = Buffer.concat([
    encodeString(type),
    encodeString(Buffer.alloc(32, 7)),
  ]);
  const signature = Buffer.concat([
    Buffer.from("SSHSIG"),
    Buffer.from([0, 0, 0, 1]),
    encodeString(publicKey),
    encodeString("git"),
    encodeString(""),
    encodeString("sha512"),
    encodeString(Buffer.alloc(64, 9)),
  ]);
  const armor = (signature.toString("base64").match(/.{1,70}/gu) ?? [])
    .map((line) => ` ${line}`)
    .join("\n");

  return {
    commit: [
      "tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904",
      "author Claude <noreply@anthropic.com> 1792463166 +0000",
      "committer Claude <noreply@anthropic.com> 1792463166 +0000",
      "gpgsig -----BEGIN SSH SIGNATURE-----",
      armor,
      " -----END SSH SIGNATURE-----",
      "",
      "allowed-signers-probe",
      "",
    ].join("\n"),
    publicKey: `${type} ${publicKey.toString("base64")}`,
  };
}

/** Encodes `value` as an SSH string: four big-endian length bytes, then bytes. */
export function encodeString(value: Buffer | string): Buffer {
  const bytes = Buffer.from(value);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(bytes.length);

  return Buffer.concat([length, bytes]);
}
