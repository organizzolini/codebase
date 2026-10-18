#!/bin/bash
# installation.sh — Entry point for local developer machine setup.
#
# Run this once after cloning the codebase repository to install all required tools,
# configure your shell, and install project dependencies.
#
# Usage: bash scripts/installation.sh   (from the workspace/worktree root)
#
# This is a bootstrap. It installs only what the real setup needs in order to
# run: Homebrew's presence, nvm, Node.js, pnpm, and the workspace's packages.
# Everything after that is the `setup` command of the installation project
# (installation), which configures the shell, installs the remaining
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

# ── Node.js version from .nvmrc or .node-version ───────────────────────────
# Prefer .nvmrc, then .node-version. Strip leading 'v' if present and pass the
# explicit version to nvm so it's deterministic in CI and scripts.
echo "🔍 Installing Node.js from .nvmrc or .node-version..."
node_version=""
if [[ -f ".nvmrc" ]]; then
  node_version=$(cat .nvmrc)
elif [[ -f ".node-version" ]]; then
  node_version=$(cat .node-version)
fi
# strip leading v
node_version=${node_version#v}
if [[ -n "${node_version}" ]]; then
  echo "🔧 Requested node version: ${node_version}"
  nvm install "${node_version}"
  nvm use "${node_version}"
else
  echo "⚠️  No .nvmrc or .node-version found — falling back to nvm default"
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

NODE_OPTIONS='' node --import @swc-node/register/esm-register installation/src/installation.main.ts setup
