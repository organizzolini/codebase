#!/bin/bash
# setup.sh — Entry point for local developer machine setup.
#
# Run this once after cloning the codebase repository to install all required tools,
# configure your shell, and install project dependencies.
#
# Usage: bash scripts/local/setup.sh   (from the workspace/worktree root)
#
# This is a bootstrap stub. It installs only what the real setup needs in order
# to run: Homebrew's presence, nvm, Node.js, pnpm, and the workspace's packages.
# Everything after that is the `setup` command of the installation project
# (projects/installation), which configures the shell, installs the remaining
# software, creates the .env files, and installs the dependencies.
#
# Execution order:
#   1. utilities.sh        — validates cwd, loads .env, enables set -e
#   2. software/brew.sh    — checks Homebrew, defines brew_install_or_check
#   3. software/node.sh    — nvm, Node.js (.nvmrc), pnpm, nx, Husky init
#   4. pnpm install        — the packages the command is written in
#   5. the setup command   — everything else, as tested TypeScript

source ./scripts/utilities.sh

# Scripts are sourced (not executed) so environment changes made in node.sh
# (e.g. nvm use, PATH updates) carry through into the command below.
source ./scripts/local/software/brew.sh
source ./scripts/local/software/node.sh

echo "📦 Installing the packages the setup command runs on..."
pnpm install

NODE_OPTIONS='' node --import @swc-node/register/esm-register projects/installation/src/installation.main.ts setup
