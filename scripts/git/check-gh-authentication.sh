#!/usr/bin/env bash

set -euo pipefail

github_host='github.com'

resolve_repository_owner() {
  if [[ -n "${GITHUB_REPOSITORY_OWNER:-}" ]]; then
    printf '%s' "${GITHUB_REPOSITORY_OWNER}"
    return 0
  fi

  local remote_url
  remote_url="$(git config --get remote.origin.url 2>/dev/null || true)"
  if [[ -z "${remote_url}" ]]; then
    return 1
  fi

  if [[ "${remote_url}" =~ ^git@github\.com:([^/]+)/[^/]+(\.git)?$ ]]; then
    printf '%s' "${BASH_REMATCH[1]}"
    return 0
  fi

  if [[ "${remote_url}" =~ ^https://github\.com/([^/]+)/[^/]+(\.git)?$ ]]; then
    printf '%s' "${BASH_REMATCH[1]}"
    return 0
  fi

  return 1
}

# Cloud sessions hold a placeholder in GH_TOKEN; a proxy adds the real credential.
# So `gh auth status` rejects a token that REST calls accept, and GraphQL gets a 403.
# Cloud sessions are therefore judged by the REST call they make.
is_cloud_session() {
  [[ "${CLAUDE_CODE_REMOTE:-}" == 'true' ]]
}

# `gh auth status` fails when any account the keyring knows has a problem, so
# `--active` narrows it to the credential this session sends. Without it, a stale
# second account fails the check while every gh command succeeds.
verify_github_cli_access() {
  if is_cloud_session; then
    gh api user --hostname "${github_host}" --jq .login >/dev/null
    return
  fi

  local repository_owner
  repository_owner="$(resolve_repository_owner || true)"

  gh auth status --hostname "${github_host}" --active >/dev/null

  if [[ -n "${repository_owner}" ]]; then
    gh project list --owner "${repository_owner}" --limit 1 >/dev/null
  fi
}

# Hooks run in a bare shell that skips the user's profile, so GH_TOKEN and
# GITHUB_TOKEN are absent and gh falls back to a keyring token with fewer scopes.
# Asking the login shell for its exports sees that token. CI passes the token
# itself, so it never asks.
resolve_login_shell_token() {
  if [[ -n "${GITHUB_ACTIONS:-}" || -n "${CI:-}" ]]; then
    return 1
  fi

  local login_shell="${SHELL:-}"
  if [[ -z "${login_shell}" || ! -x "${login_shell}" ]]; then
    return 1
  fi

  # A shell profile is free to print banners, so the value is fenced by markers
  # and read back out of whatever else lands on stdout.
  local shell_output
  shell_output="$(
    "${login_shell}" -lc \
      "printf '\\n<gh-token>%s</gh-token>\\n' \"\${GH_TOKEN:-\${GITHUB_TOKEN:-}}\"" \
      </dev/null 2>/dev/null || true
  )"

  local login_shell_token
  login_shell_token="$(
    printf '%s' "${shell_output}" |
      sed -n 's/.*<gh-token>\(.*\)<\/gh-token>.*/\1/p' |
      head -n 1
  )"

  if [[ -z "${login_shell_token}" ]]; then
    return 1
  fi

  printf '%s' "${login_shell_token}"
}

# Candidate tokens in precedence order, deduplicated because a shell profile
# commonly points GH_TOKEN and GITHUB_TOKEN at the same value.
collect_authentication_tokens() {
  local -a candidates=()

  if [[ -n "${GH_TOKEN:-}" ]]; then
    candidates+=("${GH_TOKEN}")
  fi

  if [[ -n "${GITHUB_TOKEN:-}" && "${GITHUB_TOKEN:-}" != "${GH_TOKEN:-}" ]]; then
    candidates+=("${GITHUB_TOKEN}")
  fi

  if [[ "${#candidates[@]}" -eq 0 ]]; then
    local login_shell_token
    login_shell_token="$(resolve_login_shell_token || true)"
    if [[ -n "${login_shell_token}" ]]; then
      candidates+=("${login_shell_token}")
    fi
  fi

  if [[ "${#candidates[@]}" -eq 0 ]]; then
    return 0
  fi

  printf '%s\n' "${candidates[@]}"
}

authenticate_with_token() {
  local authentication_token="$1"

  # Return codes:
  # 0 => authenticated and verified
  # 1 => token login failed (fallback token may be attempted)
  # 2 => non-token setup failure (do not attempt fallback token)
  if [[ -n "${GITHUB_ACTIONS:-}" ]]; then
    echo "::add-mask::${authentication_token}"
  fi

  mkdir -p "${HOME}/.config/gh"
  rm -f "${HOME}/.config/gh/hosts.yml"

  # gh refuses to store a credential while GH_TOKEN or GITHUB_TOKEN is set, so
  # both the login and the credential helper setup run without them. They come
  # back for verification, because they are what the rest of the session sends.
  if ! printf '%s' "${authentication_token}" |
    env -u GH_TOKEN -u GITHUB_TOKEN gh auth login --hostname "${github_host}" --with-token; then
    return 1
  fi

  if ! env -u GH_TOKEN -u GITHUB_TOKEN gh auth setup-git --hostname "${github_host}"; then
    echo '❌ GH CLI authenticated but failed to configure git credential helper.' >&2
    return 2
  fi

  export GH_TOKEN="${authentication_token}"
  export GITHUB_TOKEN="${authentication_token}"

  verify_github_cli_access
}

authentication_tokens=()
while IFS= read -r authentication_token; do
  authentication_tokens+=("${authentication_token}")
done < <(collect_authentication_tokens)

if [[ "${#authentication_tokens[@]}" -eq 0 ]]; then
  if verify_github_cli_access; then
    exit 0
  fi

  echo '❌ GH CLI is not authenticated and GH_TOKEN/GITHUB_TOKEN are unavailable.' >&2
  exit 1
fi

# A token in the environment outranks whichever account gh would pick, so each
# candidate is exported and verified before the keyring is consulted. Only the
# last failure keeps its diagnostics, since a candidate beaten by a later one is
# not worth reporting.
verification_index=0
for authentication_token in "${authentication_tokens[@]}"; do
  verification_index=$((verification_index + 1))
  export GH_TOKEN="${authentication_token}"
  export GITHUB_TOKEN="${authentication_token}"

  if [[ "${verification_index}" -eq "${#authentication_tokens[@]}" ]]; then
    if verify_github_cli_access; then
      exit 0
    fi
  elif verify_github_cli_access 2>/dev/null; then
    exit 0
  fi
done

# No token worked as an environment credential. Only continuous integration
# escalates to a full token login, because that path rewrites the gh host
# configuration and git credential helper: fine on a throwaway runner,
# destructive on a developer machine with a working keyring account.
if [[ -z "${GITHUB_ACTIONS:-}" && -z "${CI:-}" ]]; then
  echo '❌ GH CLI authentication failed with the token in GH_TOKEN/GITHUB_TOKEN.' >&2
  exit 1
fi

for authentication_token in "${authentication_tokens[@]}"; do
  authentication_status=0
  authenticate_with_token "${authentication_token}" || authentication_status=$?

  if [[ "${authentication_status}" -eq 0 ]]; then
    exit 0
  fi

  if [[ "${authentication_status}" -eq 2 ]]; then
    exit 1
  fi
done

echo '❌ GH CLI authentication bootstrap failed.' >&2
exit 1
