#!/usr/bin/env bash

set -e

zero_sha='0000000000000000000000000000000000000000'
unsigned_commits=()
unverifiable_ssh=false

while read -r local_ref local_sha remote_ref remote_sha; do
  if [[ -z "${local_ref}" || "${local_sha}" == "${zero_sha}" ]]; then
    continue
  fi

  if [[ "${local_ref}" == refs/notes/semantic-release-* || "${remote_ref}" == refs/notes/semantic-release-* ]]; then
    continue
  fi

  # A remote tip this clone never fetched cannot bound a range: `git rev-list`
  # exits 128 on it, which masked the remote's own rejection of a push that
  # `main` had moved underneath. Falling back to the remote-tracking refs still
  # checks every commit new to the remote, and lets git report the real reason.
  commit_range=''
  if [[ "${remote_sha}" == "${zero_sha}" ]] || ! git cat-file -e "${remote_sha}^{commit}" 2>/dev/null; then
    commit_range="$(git rev-list "${local_sha}" --not --remotes)"
  else
    commit_range="$(git rev-list "${remote_sha}..${local_sha}" --not --remotes)"
  fi

  if [[ -z "${commit_range}" ]]; then
    continue
  fi

  while read -r commit_sha; do
    if [[ -z "${commit_sha}" ]]; then
      continue
    fi

    # git runs gpg.ssh.program to verify an SSH signature as well as to make
    # one, and a harness signer only makes them, so ssh-keygen is named here. It
    # changes nothing for a GPG signature.
    signature_status="$(git -c gpg.ssh.program=ssh-keygen log -1 --format='%G?' "${commit_sha}" 2> /dev/null)"

    if [[ "${signature_status}" != 'G' && "${signature_status}" != 'U' ]]; then
      commit_subject="$(git log -1 --format='%s' "${commit_sha}")"
      unsigned_commits+=("${commit_sha} [${signature_status}] ${commit_subject}")

      # Without ssh-keygen git reports a good signature as B or E, so a refused
      # SSH signature is explained by the missing tool, not only by the commit.
      if [[ "${signature_status}" == 'E' ]] || ! command -v ssh-keygen > /dev/null 2>&1; then
        if git cat-file commit "${commit_sha}" | grep -q '^gpgsig -----BEGIN SSH SIGNATURE-----'; then
          unverifiable_ssh=true
        fi
      fi
    fi
  done <<< "${commit_range}"
done

if [[ "${#unsigned_commits[@]}" -gt 0 ]]; then
  echo "❌ Push rejected because unsigned or unverifiable commits were found:" >&2
  printf '  - %s\n' "${unsigned_commits[@]}" >&2
  echo "    Recreate or amend commits with signing enabled (git commit -S ...)." >&2
  if [[ "${unverifiable_ssh}" == true ]]; then
    echo "    An SSH signature this clone cannot verify needs ssh-keygen and" >&2
    echo "    gpg.ssh.allowedSignersFile. On Linux, bash scripts/installation.sh sets both up." >&2
  fi
  exit 1
fi
