import { describe, expect, it } from "vitest";

import {
  createSignedCommit,
  encodeString,
} from "../../../testing/ssh-signature";

import { formatAllowedSigner, readSshPublicKey } from "./ssh-signing.utilities";

describe("sSH signing utilities", () => {
  describe(readSshPublicKey, () => {
    it("reads the signer's key out of a signed commit", () => {
      expect.hasAssertions();

      const { commit, publicKey } = createSignedCommit();

      expect(readSshPublicKey(commit)).toBe(publicKey);
    });

    it("reads a key of any type", () => {
      expect.hasAssertions();

      const { commit, publicKey } = createSignedCommit("ssh-rsa");

      expect(readSshPublicKey(commit)).toBe(publicKey);
    });

    it("returns undefined for a commit that is not SSH-signed", () => {
      expect.hasAssertions();
      expect(
        readSshPublicKey("tree 4b825dc\nauthor A <a@b.c> 1 +0000\n\nmessage\n"),
      ).toBeUndefined();
    });

    it("returns undefined for a GPG signature", () => {
      expect.hasAssertions();
      expect(
        readSshPublicKey(
          "gpgsig -----BEGIN PGP SIGNATURE-----\n \n abc\n -----END PGP SIGNATURE-----\n",
        ),
      ).toBeUndefined();
    });

    it("returns undefined when the armor is not an SSH signature", () => {
      expect.hasAssertions();

      const armor = Buffer.from("not an ssh signature").toString("base64");

      expect(
        readSshPublicKey(
          `-----BEGIN SSH SIGNATURE-----\n ${armor}\n -----END SSH SIGNATURE-----\n`,
        ),
      ).toBeUndefined();
    });

    it("returns undefined when the signature is cut short", () => {
      expect.hasAssertions();

      const truncated = Buffer.concat([
        Buffer.from("SSHSIG"),
        Buffer.from([0, 0, 0, 1]),
        Buffer.from([0, 0, 1, 0]),
        Buffer.from("short"),
      ]).toString("base64");

      expect(
        readSshPublicKey(
          `-----BEGIN SSH SIGNATURE-----\n ${truncated}\n -----END SSH SIGNATURE-----\n`,
        ),
      ).toBeUndefined();
    });

    it("returns undefined when the key has no type", () => {
      expect.hasAssertions();

      const signature = Buffer.concat([
        Buffer.from("SSHSIG"),
        Buffer.from([0, 0, 0, 1]),
        encodeString(encodeString("")),
      ]).toString("base64");

      expect(
        readSshPublicKey(
          `-----BEGIN SSH SIGNATURE-----\n ${signature}\n -----END SSH SIGNATURE-----\n`,
        ),
      ).toBeUndefined();
    });
  });

  describe(formatAllowedSigner, () => {
    it("lists the key for the principal, for git signatures only", () => {
      expect.hasAssertions();
      expect(formatAllowedSigner("a@b.c", "ssh-ed25519 AAAA")).toBe(
        'a@b.c namespaces="git" ssh-ed25519 AAAA\n',
      );
    });
  });
});
