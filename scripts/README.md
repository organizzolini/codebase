# Scripts

Utility scripts for codebase setup, maintenance, and development workflows.

## Overview

This directory contains shell scripts for:

- **Local setup** - macOS-specific initial codebase configuration (in `local/`)
- **Shell utilities** - Common terminal operations
- **Nx** - The two helpers the Nx targets call, `await-health.sh` and `stop-port.sh` (in `nx/`)

> **The shell floor.** Which scripts stay shell, and why, is decided in
> [ADR 0027](../documentation/adr/0027-narrow-the-shell-floor-to-the-hooks-and-the-pre-install-ci-steps.md),
> as amended by
> [ADR 0028](../documentation/adr/0028-run-the-nx-ci-steps-after-the-install-as-commands.md).
> A script that is not on that floor belongs in a NestJS command.

## Quick Start

### Initial Setup (macOS)

Run the main setup script to configure your local development environment:

```bash
./scripts/installation.sh
```

This runs the following in sequence:

1. Homebrew is checked, then nvm, Node.js, pnpm, and nx are installed or checked
2. `pnpm install` - Installs the packages the next step is written in
3. `projects/installation/src/installation.main.ts setup` - The [installation](../projects/installation/AGENTS.md) project's `setup` command: shell configuration, the remaining software (uv, Python, Ollama, Docker, GPG, Terraform, and more), `.env` files, and dependencies

> **Note:** If using a devcontainer, these scripts are not needed — the devcontainer handles setup automatically via `.devcontainer/scripts/post-create-command.sh`.

## Installation Script

`scripts/installation.sh` is intended for **macOS local development only**.
The devcontainer handles equivalent setup automatically.

### installation.sh

**Purpose:** Bootstrap a machine, then run the installation project's `setup` command

**Usage:**

```bash
./scripts/installation.sh
```

**What it does:**

- Validates codebase root directory
- Sources `utilities.sh` for common functions
- Checks Homebrew (never installs it; exits with an error if it is missing)
- Installs or checks nvm, Node.js (from `.nvmrc`), pnpm, and nx, and writes Husky's init file
- Runs `pnpm install`, so the command can start
- Runs `projects/installation/src/installation.main.ts setup`, which does everything else

It is one file because it installs the Node the TypeScript runs on, so none of it can be a command, and because the environment changes it makes (`nvm use`, `PATH`) must reach the `setup` command.

**Prerequisites:**

- Must be run from codebase root directory
- Homebrew installed

### The installation project

Everything after Node exists lives in [`projects/installation`](../projects/installation/AGENTS.md), one command each. Run any of them on its own with `nx run installation:start:<command>`.

| Command               | What it does                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `setup`               | Runs the four below in order, then says how to activate the new shell configuration                              |
| `shell-configuration` | Writes nvm, pnpm, GPG, Node memory, completion blocks to your rc file; drops the retired helper                  |
| `software`            | Installs uv, Python, Ollama, Docker, GPG signing, Terraform and the other infrastructure tools, and squawk       |
| `environment-files`   | Creates `.env` from every `.env.default` (excluding the conformetry templates) and sets `LOCAL_WORKSPACE_FOLDER` |
| `dependencies`        | Runs `pnpm install`, `nx reset`, `uv sync`, `terraform init`, and writes kubeconfig                              |

### VS Code extensions and settings

> Implemented in [projects/synchronization](../projects/synchronization), not as scripts.

**Purpose:** Keep `.vscode/extensions.json` and both devcontainer configurations' extension lists in step, and merge `.vscode/settings.json` into the VS Code Machine settings inside a devcontainer.

```bash
nx run synchronization:vscode-extensions:check    # Validate both configs are in sync (default)
nx run synchronization:vscode-extensions:write    # Update both devcontainer.json files
nx run synchronization:vscode-settings:check      # Machine settings hold every workspace key
nx run synchronization:vscode-settings:write      # Merge workspace settings into Machine settings
```

`vscode-extensions` runs in `guard-code`. `vscode-settings` only makes sense inside a devcontainer, so it is left out of `synchronization:start` and run by `post-create-command.sh`.

### sync-devcontainer-configuration.ts

**Purpose:** Propagate common fields from the local devcontainer config into the cloud config. Local is the source of truth for shared settings; cloud is edited directly only for its Docker feature and `runArgs`.

**Synced fields** (local is source of truth):

- `customizations`, `remoteEnv`, `forwardPorts`, `portsAttributes`, `image`, `containerUser`, `remoteUser`, lifecycle scripts, `$schema`
- Shared features (github-cli, kubectl, terraform, etc.) — each config's Docker feature is preserved
- Shared mounts (node-modules, pnpm) — cloud's docker-storage volume is preserved

**Preserved fields** (each config is source of truth):

- `name`, `runArgs`, Docker feature (`docker-in-docker` / `docker-outside-of-docker`)

**Usage:**

```bash
# Via Nx (recommended)
nx run codebase:sync-devcontainer-configuration:check    # Validate cloud config is in sync (default)
nx run codebase:sync-devcontainer-configuration:write    # Propagate common fields from local into cloud

# Direct
tsx scripts/sync-devcontainer-configuration.ts [check|write]
```

**Use cases:**

- Pre-commit hook (auto-runs when any devcontainer file is staged)
- After editing shared settings in `local/devcontainer.json` (run `write` to propagate)

**Exit codes:**

- `0` - In sync or successfully updated
- `1` - Out of sync (check mode) or failed

### utilities.sh

**Purpose:** Common utilities and helper functions

**Usage:**

```bash
source ./scripts/utilities.sh
```

**Functions:**

#### `get_git_commit_hash()`

Returns the first 7 characters of the current git commit hash.

```bash
commit=$(get_git_commit_hash)
echo "Commit: $commit"
# Output: Commit: abc1234
```

#### `get_utc_timestamp()`

Returns the current UTC timestamp in `YYYYMMDD-HHMMSS` format.

```bash
timestamp=$(get_utc_timestamp)
echo "Timestamp: $timestamp"
# Output: Timestamp: 20240125-143022
```

**Automatic behaviors:**

- Validates codebase root directory
- Exits immediately on error (`set -e`)
- Sources `.env` environment variables
- Makes all `.sh` files executable

## Shell Utilities

### shell/text-to-port.sh

**Purpose:** Derive a project's default port (1000-9999) from its name

**Usage:**

```bash
./scripts/shell/text-to-port.sh lexico-web   # 7797
```

The convention is a rolling hash, `h = (h * 31 + code) mod 9000` over each
character, plus 1000. Order matters, every port is equally weighted, and the
same name always gives the same port. The script header is the specification;
check the other projects' ports for a collision before adopting a new one.

## Nx Scripts

`scripts/nx/` holds only the two helpers the Nx targets call,
`await-health.sh` and `stop-port.sh`. The CI steps around the Nx task cache
and the affected base, which used to be shell here, are commands of the
[publication](../projects/publication) project since
[ADR 0028](../documentation/adr/0028-run-the-nx-ci-steps-after-the-install-as-commands.md).

### Task-Result Database

Nx decides a cache hit only from its task-result database,
`.nx/workspace-data/<machine-id>-v<schema>.db`. That file is named after the
machine, and a hosted runner may be a fresh VM, so a restored database goes
unread unless it is adopted under the current machine's id.

The `setup-codebase` action restores the cache before `pnpm install`, then,
after the install, imports the pull request's in a merge group and verifies
and adopts the database. The install opens no task database, so nothing reads
the restored one before it is adopted. The `cleanup-codebase` action verifies
and keeps the database before saving it.

| Command | Runs in | What it does |
| ------- | ------- | ------------ |
| `import-pr-task-cache` | setup, in a merge group, after the install | Downloads the cache artifact the pull request's own run uploaded and merges it in; a fork's artifact, a missing one, or any failure leaves a cold cache |
| `merge-task-cache` | called by the import, or by hand with a directory | Copies the other cache's outputs this one lacks, then inserts its database rows, and skips rather than fails on an unreadable or unfamiliar source |
| `verify-task-database` | setup and cleanup | Discards any database that fails `PRAGMA integrity_check` |
| `adopt-task-database` | setup | Renames the newest restored database to this machine's id and discards the rest |
| `keep-task-database` | cleanup | Keeps only the newest database, and warns if there was more than one |

A merge group runs on a ref that reads only `main`'s caches, never the pull
request's, so without the import it runs again every task the pull request just
finished. The pull request's run uploads its cache as an artifact in
`cleanup-codebase`, which any run can read, and only for a pull request from
this repository.

All of them open the databases with the built-in `node:sqlite`, honour
`NX_WORKSPACE_DATA_DIRECTORY`, and, where they touch task outputs,
`NX_CACHE_DIRECTORY`. `adopt-task-database` also reads `MACHINE_ID_FILES`, a
space-separated list of files to take the id from, in priority order. So they
can be exercised locally against a scratch directory and a fake id:

```bash
NX_WORKSPACE_DATA_DIRECTORY=/tmp/nx-data MACHINE_ID_FILES=/tmp/machine-id \
  nx run publication:start:adopt-task-database
```

### Affected Runs

The affected-run steps are commands of the
[publication](../projects/publication) project too:

| Command | What it does |
| ------- | ------------ |
| `bound-base-to-push` | On a CI push with `nx-base: push-before`, after the install, moves `NX_BASE` to the push's previous tip (`BEFORE`), keeping it when that is empty, all zeros, or not an ancestor of `NX_HEAD` |
| `run-affected` | Runs one Nx target on the projects a CI change affects. Passes `--base`/`--head` straight to Nx, or, to correct the change set, hands it the changed files over `--stdin`: spelling files dropped unless `INCLUDE_SPELLING` is `true`, and the conformetry config added when a template changed and `INCLUDE_TEMPLATES` is `true` |
| `publishable-packages-gate` | Runs `validation:verify-publishable-packages` whole when an ic-suite package or `validation` is affected and skips otherwise |

All three read everything from the environment, so any of them can be run
locally:

```bash
BEFORE=c160aad5f NX_BASE=HEAD~5 NX_HEAD=007edad2e GITHUB_ENV=/tmp/github-env \
  nx run publication:start:bound-base-to-push
TARGET=test-code ARGUMENTS="--parallel=4" NX_BASE=004d1f58c^ NX_HEAD=004d1f58c \
  nx run publication:start:run-affected
```

## Notepads

### notepads/notepad.sql

**Purpose:** SQL queries and database utilities for notepad/notes functionality

**Location:** `notepads/notepad.sql`

**Usage:**

```bash
# Run SQL file
psql -U username -d database -f notepads/notepad.sql

# Or copy queries into database client
```

See file for specific SQL queries and documentation.

## Best Practices

### Script Execution

**Always run from codebase root:**

```bash
# ✅ Correct
cd ~/Personal/codebase
./scripts/installation.sh

# ❌ Wrong
cd scripts
./installation.sh
```

**Make scripts executable:**

```bash
chmod +x scripts/**/*.sh
```

Or use the utilities.sh automatic behavior (makes all `.sh` files executable).

### Sourcing vs Executing

**Execute scripts** (standalone):

```bash
./scripts/installation.sh
```

**Source scripts** (use functions in current shell):

```bash
source ./scripts/utilities.sh
commit=$(get_git_commit_hash)
```

### Error Handling

Scripts use `set -e` to exit on error. Handle errors explicitly:

```bash
#!/bin/bash
set -e  # Exit on error

# This will stop execution if command fails
pnpm install

# Continue execution even if command fails
pnpm test || echo "⚠️ Tests failed but continuing..."
```

### Environment Variables

Load environment variables before using them:

```bash
# Load from .env
source ./scripts/utilities.sh  # Automatically sources .env

# Or manually
set -a
source .env
set +a
```

## Common Tasks

### Fresh Install

Complete codebase setup from scratch:

```bash
# 1. Clone repository
git clone https://github.com/Organizzolini/codebase.git
cd codebase

# 2. Create .env file
cp .env.example .env
# Edit .env with your values

# 3. Run setup
./scripts/installation.sh
```

### Update Dependencies

Update npm packages:

```bash
# Update all dependencies
pnpm update

# Or run dependencies script
pnpm exec nx run installation:start:dependencies
```

### Clean Install

Remove node_modules and reinstall:

```bash
# Remove all node_modules
pnpm clean

# Reinstall
pnpm exec nx run installation:start:dependencies
```

### Validate Lockfile

Check if lockfile needs updating:

```bash
pnpm exec nx run validation:lockfile
```

If out of sync:

```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore(dependencies): update lockfile"
```

## Troubleshooting

### "Permission denied" errors

Make scripts executable:

```bash
chmod +x scripts/**/*.sh
```

Or source utilities which does this automatically:

```bash
source ./scripts/utilities.sh
```

### "Must be run from codebase root" error

Change to codebase root directory:

```bash
cd ~/Personal/codebase
```

Verify you're in the right place:

```bash
pwd
# Should output: .../Personal/codebase

ls package.json
# Should exist
```

### Environment variables not loading

Ensure `.env` file exists:

```bash
ls -la .env
```

Create from example if missing:

```bash
cp .env.example .env
```

Source utilities to load environment:

```bash
source ./scripts/utilities.sh
```

### pnpm not found

Install via Homebrew:

```bash
brew install pnpm
```

Or run software setup:

```bash
pnpm exec nx run installation:start:software
```

### Lockfile out of sync

Update lockfile:

```bash
pnpm install
```

Verify sync:

```bash
pnpm exec nx run validation:lockfile
```

## Contributing

### Adding New Scripts

1. Create script in appropriate directory:
   - Core scripts: `scripts/`
   - Shell utilities: `scripts/shell/`
   - Notepads: `notepads/`

2. Add shebang and description:

   ```bash
   #!/bin/bash
   #
   # Script description here
   #
   ```

3. Make executable:

   ```bash
   chmod +x scripts/your-script.sh
   ```

4. Document in this README

5. Test thoroughly:

   ```bash
   # Test from codebase root
   ./scripts/your-script.sh

   # Test with various inputs
   ./scripts/your-script.sh arg1 arg2
   ```

### Script Conventions

**File naming:**

- Use kebab-case: `validate-session-skills.sh`
- Add `.sh` extension
- Descriptive names

**Code style:**

- Use `#!/bin/bash` shebang
- Add `set -e` for error handling
- Include usage comments
- Validate inputs
- Provide helpful error messages
- Use emoji for visual feedback (✅ ❌ 🔍 📦)

**Testing:**

- Test happy path
- Test error conditions
- Test from codebase root
- Test with missing dependencies

## Related Documentation

- [CONTRIBUTING.md](../.github/CONTRIBUTING.md) - Contribution guidelines
- [scripts/utilities.sh](./utilities.sh) - Common utility functions
- [.github/workflows/](../.github/workflows/) - CI/CD workflows using these scripts

## See Also

- [Homebrew Documentation](https://docs.brew.sh/)
- [pnpm Documentation](https://pnpm.io/)
- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/)
