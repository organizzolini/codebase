#!/usr/bin/env bash

set -e

commit_gpg_sign="$(git config --bool --get commit.gpgsign || true)"
if [[ "${commit_gpg_sign}" != "true" ]]; then
  echo "❌ Git commit signing is required. Set commit.gpgsign=true before committing." >&2
  exit 1
fi

signing_key="$(git config --get user.signingkey || true)"
if [[ -z "${signing_key}" ]]; then
  echo "❌ Git signing key is required. Set user.signingkey before committing." >&2
  exit 1
fi

# SSH signing (gpg.format=ssh) is how cloud sessions sign. The GPG checks below
# do not apply, so SSH has its own path: the signer must run, and ssh-keygen
# must verify against an allowed signers file.
signing_format="$(git config --get gpg.format || true)"
if [[ "${signing_format}" == 'ssh' ]]; then
  ssh_program="$(git config --get gpg.ssh.program || true)"
  ssh_program="${ssh_program:-ssh-keygen}"
  if ! command -v "${ssh_program}" > /dev/null 2>&1; then
    echo "❌ ${ssh_program} is required for SSH commit signing but was not found in PATH." >&2
    exit 1
  fi

  # A literal key (key::ssh-ed25519 ...) needs no file; anything else must be one.
  if [[ "${signing_key}" != key::* && ! -f "${signing_key/#\~/${HOME}}" ]]; then
    echo "❌ SSH signing key file not found for user.signingkey=${signing_key}." >&2
    exit 1
  fi

  if ! command -v ssh-keygen > /dev/null 2>&1; then
    echo "❌ ssh-keygen is required to verify SSH commit signatures but was not found in PATH." >&2
    echo "   On Linux, bash scripts/installation.sh installs it (openssh-client)." >&2
    exit 1
  fi

  allowed_signers_file="$(git config --get gpg.ssh.allowedSignersFile || true)"
  if [[ -z "${allowed_signers_file}" || ! -s "${allowed_signers_file/#\~/${HOME}}" ]]; then
    echo "❌ gpg.ssh.allowedSignersFile must name a file listing the key that signs your commits." >&2
    echo "   On Linux, bash scripts/installation.sh writes it from the signer's own key." >&2
    exit 1
  fi

  if [[ "${SKIP_GPG_SIGNING_SMOKE_TEST:-}" == "true" ]]; then
    exit 0
  fi

  # Signing a throwaway commit object proves the signer runs end to end, and
  # verifying it proves the allowed signers file lists the key that signed it.
  ssh_smoke_test_stderr="$(mktemp)"
  trap 'rm -f "$ssh_smoke_test_stderr"' EXIT
  ssh_tree_hash="$(git write-tree)"
  ssh_parent_options=()
  if git rev-parse --verify HEAD > /dev/null 2>&1; then
    ssh_parent_options+=(-p "$(git rev-parse HEAD)")
  fi
  if ! ssh_test_commit_hash="$(
    printf '%s' 'commit-signing-smoke-test' \
      | git commit-tree "${ssh_tree_hash}" "${ssh_parent_options[@]}" -S 2> "${ssh_smoke_test_stderr}"
  )"; then
    cat "${ssh_smoke_test_stderr}" >&2
    echo "❌ Git commit signing smoke test failed: ${ssh_program} could not sign with user.signingkey=${signing_key}." >&2
    exit 1
  fi
  if ! git -c gpg.ssh.program=ssh-keygen verify-commit "${ssh_test_commit_hash}" > /dev/null 2> "${ssh_smoke_test_stderr}"; then
    cat "${ssh_smoke_test_stderr}" >&2
    echo "❌ Git commit signing smoke test failed: the test signature did not verify against ${allowed_signers_file}." >&2
    exit 1
  fi
  exit 0
fi

if ! command -v gpg > /dev/null 2>&1; then
  echo "❌ gpg is required for commit signing but was not found in PATH." >&2
  exit 1
fi

if ! gpg --list-secret-keys --keyid-format=long "${signing_key}" | grep -q '^sec'; then
  echo "❌ No GPG secret key found for user.signingkey=${signing_key}." >&2
  exit 1
fi

# A key that can sign is not necessarily the committer's own: with several GPG
# identities, user.signingkey can resolve to someone else's key, and every check
# above still passes. Skipped in CI, where the committer is a bot.
if [[ -z "${CI:-}" && -z "${GITHUB_ACTIONS:-}" ]]; then
  git_email="$(git config --get user.email || true)"
  if [[ -z "${git_email}" ]]; then
    echo "❌ Git user.email is required to verify the signing key's identity." >&2
    exit 1
  fi

  key_uid_emails="$(
    gpg --with-colons --list-secret-keys "${signing_key}" 2> /dev/null \
      | awk -F: '$1 == "uid" { print $10 }' \
      | grep -oE '<[^>]+>' \
      | tr -d '<>'
  )"

  if ! grep -qxF "${git_email}" <<< "${key_uid_emails}"; then
    echo "❌ Signing key user.signingkey=${signing_key} does not belong to ${git_email}." >&2
    echo "   Its GPG identity is: $(echo "${key_uid_emails}" | paste -sd', ' -)" >&2
    echo "   Set a signing key for ${git_email}, scoped to this repository:" >&2
    echo "     gpg --list-secret-keys --keyid-format=long ${git_email}" >&2
    echo "     git config user.signingkey <key-id>   # no --global: keep other repos untouched" >&2
    exit 1
  fi
fi

if [[ "${SKIP_GPG_SIGNING_SMOKE_TEST:-}" == "true" ]]; then
  exit 0
fi

# Signs a throwaway commit, so an unusable key fails in seconds. gpg runs through
# a wrapper that never opens pinentry: CI uses loopback, and local agents cancel,
# so an uncached passphrase fails at once and is inconclusive below.
if [[ -n "${CI:-}" || -n "${GITHUB_ACTIONS:-}" ]]; then
  pinentry_mode='loopback'
else
  pinentry_mode='cancel'
fi

gpg_program="$(git config --get gpg.program || true)"
gpg_wrapper="$(mktemp)"
smoke_test_stderr="$(mktemp)"
trap 'rm -f "$gpg_wrapper" "$smoke_test_stderr"' EXIT

cat > "${gpg_wrapper}" << GPG_WRAPPER
#!/usr/bin/env bash
exec ${gpg_program:-gpg} --batch --no-tty --pinentry-mode ${pinentry_mode} "\$@"
GPG_WRAPPER
chmod +x "${gpg_wrapper}"

git_options=(-c "gpg.program=${gpg_wrapper}")

tree_hash="$(git write-tree)"
test_commit_message='commit-signing-smoke-test'

parent_options=()
if git rev-parse --verify HEAD > /dev/null 2>&1; then
  parent_options+=(-p "$(git rev-parse HEAD)")
fi

if ! test_commit_hash="$(
  printf '%s' "${test_commit_message}" | \
    git "${git_options[@]}" commit-tree "${tree_hash}" "${parent_options[@]}" -S 2> "${smoke_test_stderr}"
)"; then
  # A cancelled pinentry means only that the agent holds no cached passphrase. The key
  # exists, and the next commit prompts normally, so the test is inconclusive, not failed.
  #
  # This never applies in CI: the passphrase is preloaded there, so any failure is real.
  if [[ "${pinentry_mode}" == 'cancel' ]] && grep -q 'Operation cancelled' "${smoke_test_stderr}"; then
    exit 0
  fi

  # gpg's own stderr is replayed on purpose: it names the actual failure.
  cat "${smoke_test_stderr}" >&2
  echo "❌ Git commit signing smoke test failed: gpg could not sign with user.signingkey=${signing_key}." >&2
  echo '   Verify the GPG key and its passphrase match (GPG_PRIVATE_KEY / GPG_PASSPHRASE in CI).' >&2
  exit 1
fi

if ! git "${git_options[@]}" verify-commit "${test_commit_hash}" > /dev/null 2>&1; then
  echo '❌ Git commit signing smoke test failed: the test signature did not verify.' >&2
  exit 1
fi
