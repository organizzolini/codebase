#!/bin/bash
# installation.sh — Entry point for local developer machine setup.
#
# Run this once after cloning the codebase repository to install all required tools,
# configure your shell, and install project dependencies.
#
# Usage: bash scripts/installation.sh   (from the workspace/worktree root)
#
# macOS and Linux take different paths through the same file; see the Linux
# section below for what the second one does and leaves out.
#
# This is a bootstrap. It installs only what the real setup needs in order to
# run: Homebrew's presence, nvm, Node.js, pnpm, and the workspace's packages.
# Everything after that is the `setup` command of the installation project
# (projects/installation), which configures the shell, installs the remaining
# software, creates the .env files, and installs the dependencies.
#
# Execution order:
#   1. utilities.sh        — validates cwd, loads .env, enables set -e
#   2. Homebrew            — checked, never installed
#   3. nvm, Node.js, pnpm  — nvm and Node (.nvmrc), Husky init, pnpm, nx
#   4. pnpm install        — the packages the command is written in
#   5. the setup command   — everything else, as tested TypeScript
#
# The whole bootstrap is one file, so environment changes made below
# (nvm use, PATH updates) carry through into the setup command.

source ./scripts/utilities.sh

# Runs a command of the installation project. It is TypeScript, so it needs the
# packages `pnpm install` brings, and NODE_OPTIONS is cleared because a loader
# set there would preempt the transpiler this one names.
installation() {
  NODE_OPTIONS='' node --import @swc-node/register/esm-register projects/installation/src/installation.main.ts "$@"
}

# ── Operating system ─────────────────────────────────────────────────────────
# macOS continues below with Homebrew and nvm. Linux, which is what a Claude
# Code cloud session and the devcontainer run, has no Homebrew and often a system
# Node older than .nvmrc. So there Node is the nodejs.org release for .nvmrc,
# linked into ~/.local/bin, which is ahead of the system Node on PATH. node-gyp
# is shimmed from the copy npm bundles, because the native packages (sweph,
# cpu-features) need it on PATH. Of the setup command only the .env files and the
# SSH signing apply: its shell configuration, software, and Terraform steps are
# for a developer Mac. Docker and Postgres are started last. Safe to run again.
operating_system="$(uname -s)"
if [[ "${operating_system}" != "Darwin" && "${operating_system}" != "Linux" ]]; then
  echo "🛑 Unsupported operating system: ${operating_system}. Use macOS or Linux." >&2
  exit 1
fi

if [[ "${operating_system}" == "Linux" ]]; then
  echo "🐧 Setting up Linux..."
  node_version="$(tr -d '[:space:]' < .nvmrc)"
  node_version="${node_version#v}"
  node_home="${HOME}/.local/node/${node_version}"
  mkdir -p "${HOME}/.local/bin" "${node_home}"

  if [[ ! -x "${node_home}/bin/node" ]]; then
    case "$(uname -m)" in
      aarch64 | arm64) node_architecture="arm64" ;;
      *) node_architecture="x64" ;;
    esac
    echo "📦 Downloading Node.js ${node_version} (${node_architecture})..."
    (
      set -o pipefail
      curl -fsSL "https://nodejs.org/dist/v${node_version}/node-v${node_version}-linux-${node_architecture}.tar.xz" |
        tar -xJ --strip-components=1 -C "${node_home}"
    )
  fi

  for tool in node npm npx corepack; do
    ln -sf "${node_home}/bin/${tool}" "${HOME}/.local/bin/${tool}"
  done
  printf '#!/bin/sh\nexec node "%s" "$@"\n' \
    "${node_home}/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js" \
    > "${HOME}/.local/bin/node-gyp"
  chmod +x "${HOME}/.local/bin/node-gyp"
  export PATH="${HOME}/.local/bin:${PATH}"
  echo "👍 Node.js $(node --version)"

  if ! command -v pnpm &> /dev/null; then
    echo "🛑 pnpm not found. Install the version in package.json packageManager first." >&2
    exit 1
  fi

  echo "📦 Installing the workspace's packages..."
  pnpm install --frozen-lockfile
  installation environment-files

  # SSH commit signatures are made verifiable by the installation project: it
  # installs ssh-keygen and lists the signer's key for the commit hooks.
  installation ssh-signing

  # Docker and Postgres. A container that carries the daemon binary but runs
  # none gets one started, so `infrastructure:postgres:up` has an engine; a
  # machine that already reaches a daemon, like the devcontainer's mounted
  # socket, is left alone. A failure warns rather than failing a setup whose
  # Node toolchain is already done.
  if [[ "$(id -u)" == "0" ]] && command -v dockerd &> /dev/null && ! docker info &> /dev/null; then
    echo "🐳 Starting the Docker daemon..."
    mkdir -p "${HOME}/.local/state"
    setsid nohup dockerd > "${HOME}/.local/state/dockerd.log" 2>&1 &
    for _ in $(seq 1 30); do
      docker info &> /dev/null && break
      sleep 1
    done
  fi
  if docker info &> /dev/null; then
    echo "🐘 Starting Postgres..."
    pnpm exec nx run infrastructure:postgres:up ||
      echo "⚠️  Postgres did not start. Retry with: pnpm exec nx run infrastructure:postgres:up" >&2
  else
    echo "⚠️  No Docker daemon is reachable, so Postgres was not started." >&2
  fi

  # utilities.sh marks every script executable, which leaves the few that git
  # stores as 644 modified, and a later `git add -A` would commit that. Only
  # those mode changes are undone; no file's content is touched.
  git diff --summary | sed -n 's/^ mode change 100644 => 100755 //p' |
    while IFS= read -r script; do
      chmod -x "${script}"
    done

  echo "✅ Linux setup complete."
  exit 0
fi

# ── Homebrew ─────────────────────────────────────────────────────────────────
echo "🔍 Checking for Homebrew installation..."
if ! command -v brew &> /dev/null; then
  echo "🛑 Homebrew not found. Please install Homebrew first: https://brew.sh/" >&2
  exit 1
fi

# ── nvm ──────────────────────────────────────────────────────────────────────
# nvm is used instead of a system Node.js so that the version is pinned by
# .nvmrc and stays consistent across developer machines and the devcontainer.
echo "🔍 Checking for nvm installation..."
if ! brew list nvm &> /dev/null; then
  echo "📦 nvm not found. Installing via Homebrew..."
  brew install nvm
  echo "✅ nvm installed via Homebrew."
else
  echo "👍 nvm is already installed via Homebrew."
  if brew outdated | grep -q '^nvm$'; then
    echo "🔄 nvm is outdated. To update, run: brew upgrade nvm"
  fi
fi

# Prepare nvm and pre-install the .nvmrc version before use.
# nvm is a shell function, so source once in no-auto-use mode and then run
# install/use explicitly.
export NVM_DIR="${HOME}/.nvm"
mkdir -p "${NVM_DIR}"
NVM_SCRIPT_PATH="$(brew --prefix nvm)/nvm.sh"

# shellcheck source=/dev/null
. "${NVM_SCRIPT_PATH}" --no-use

# ── Node.js version from .nvmrc ──────────────────────────────────────────────
# Strip leading 'v' if present and pass the explicit version to nvm so it's
# deterministic in CI and scripts.
echo "🔍 Installing Node.js from .nvmrc..."
node_version=""
if [[ -f ".nvmrc" ]]; then
  node_version=$(cat .nvmrc)
fi
# strip leading v
node_version=${node_version#v}
if [[ -n "${node_version}" ]]; then
  echo "🔧 Requested node version: ${node_version}"
  nvm install "${node_version}"
  nvm use "${node_version}"
else
  echo "⚠️  No .nvmrc found — falling back to nvm default"
  nvm install
  nvm use
fi
echo "👍 Node.js $(nvm current)"

# ── Husky ─────────────────────────────────────────────────────────────────────
# Husky executes hooks inside a minimal shell that skips ~/.zshrc / ~/.bashrc,
# so `node`, `nx`, and `uv` are not on PATH by default. The init file at
# ~/.config/husky/init.sh is sourced by every hook before it runs, making
# nvm-managed node and uv-managed Python available inside git hooks.
echo "🔍 Setting up husky init..."
mkdir -p "${HOME}/.config/husky"
HUSKY_INIT_FILE="${HOME}/.config/husky/init.sh"
if [[ ! -f "${HUSKY_INIT_FILE}" ]] || ! grep -q 'PNPM_HOME' "${HUSKY_INIT_FILE}"; then
  cat > "${HUSKY_INIT_FILE}" << 'HUSKY_INIT'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# uv is installed to ~/.local/bin by its installer
export PATH="$HOME/.local/bin:$PATH"

# pnpm global bin directory
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME/bin:$PNPM_HOME:$PATH"
HUSKY_INIT
  echo "✅ Updated ~/.config/husky/init.sh to source nvm, uv, and pnpm in git hooks"
else
  echo "👍 ~/.config/husky/init.sh already configured"
fi

# ── pnpm ──────────────────────────────────────────────────────────────────────
# Installed with Homebrew when it is not yet on PATH; when it is, this reports
# whether an upgrade is available.
echo "🔍 Checking for pnpm installation..."
if ! command -v pnpm &> /dev/null; then
  echo "📦 pnpm not found. Installing via Homebrew..."
  brew install pnpm
  echo "✅ pnpm installed via Homebrew"
else
  echo "👍 pnpm is already installed"
  if brew outdated | grep -q "pnpm"; then
    echo "🔄 pnpm is outdated. To update, run: brew upgrade pnpm"
  fi
fi

echo "🔍 Setting up pnpm global bin directory..."
export PNPM_HOME="${HOME}/.local/share/pnpm"
mkdir -p "${PNPM_HOME}/bin"
export PATH="${PNPM_HOME}/bin:${PNPM_HOME}:${PATH}"
pnpm setup 2>/dev/null || true

# ── nx (global) ───────────────────────────────────────────────────────────────
# nx must be available globally so that `nx run` works in the terminal without
# a project-local node_modules/.bin prefix. pnpm global bin is already on PATH
# from the PNPM_HOME export above.
echo "🌐 Installing nx globally..."
pnpm add -g nx
echo "✅ nx available globally"

# ── Packages and the setup command ────────────────────────────────────────────
echo "📦 Installing the packages the setup command runs on..."
pnpm install

installation setup
