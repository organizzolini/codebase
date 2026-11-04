# 🛠️ Configuration

**The workspace's tool configuration, and the Nx targets that run it.**

Every linter, formatter, scanner, git hook, and IC-suite config lives here,
beside the base `tsconfig.json` every project extends. This project also owns
the Nx targets that run those tools over the repository's own files, so the root
`project.json` is left with what concerns the repository as a whole.

## Usage

Run a target by name, in `check` mode unless the target names another:

```bash
nx run configuration:eslint:check        # lint the workspace root
nx run configuration:knip:check          # unused files, exports, and dependencies
nx run configuration:codometer:write     # measure the repository and write the README badges
nx run configuration:local-registry      # a local Verdaccio registry for publish rehearsals
```

`lint-code`, `format-code`, `deprecate-code`, `secure-code`, and `guard-code` are
the aggregates every project declares. Here they gather the root-file checks
below, so `nx affected --target=lint-code` reaches them the way it reaches any
other project.

## What it owns

| Group            | Targets                                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint and format  | `eslint`, `oxlint`, `oxfmt`, `prettier`, `markdown-lint`, `yaml-lint`, `shellcheck`, `spell-check`                                                 |
| Unused code      | `knip`, `fallow`, `fallow-dead-code`, `fallow-health`, `fallow-duplicates`, `fallow-audit`, `fallow-fix`, `jscpd`, `vulture`, `sherif`, `syncpack` |
| Security         | `gitleaks`, `trivy-config`, `license-check`, `pnpm-audit`                                                                                          |
| IC-suite         | `callidescope`, `codependix`, `codometer`, `build-projects`                                                                                        |
| Git hooks        | `commit-msg`, `commitlint`, `pre-commit`, `pre-push`, `lint-staged`, `validate-branch-name`                                                        |
| Local publishing | `local-registry`                                                                                                                                   |

## In the graph, and out of releases

Every project's `eslint.config.ts`, `vite.config.ts`, and `vitest.config.ts`
imports from this folder, so every project depends on `configuration` in the Nx
graph. That is the honest picture, and CI relies on it: a change here affects
every project, and the task cache keeps the ones it does not touch cheap.

The folder also imports a few IC-suite packages for their types. Those edges
would close cycles through each package's `core` layer, so
[`project.json`](project.json) removes them with `implicitDependencies`. The
codependix rules name the `name:configuration` tag as a permitted target for
every layer, so nothing there fails on it.

A release is the one place a change here must not spread.
the `publication` project's `version-packages` command adds this folder to `.nxignore` for the
single `nx release` command, so a commit that edits only configuration releases
no package, while a commit that edits a package still does.

## What this repository keeps outside it

The tools that locate their own file at the root stay there: `nx.json`,
`package.json`, the pnpm and uv workspace files, `tsconfig.json`, the git and
editor dotfiles, and `validate-branch-name.config.cjs`, whose tool takes no
path. Everything a tool can be told to read lives here, and every command
passes the path explicitly.

## Reading root paths

A project's `{projectRoot}` is `configuration`, but the targets here
read workspace-root paths. So each sets its `cwd` to `{workspaceRoot}` and lists
its inputs as `{workspaceRoot}` globs. The `workspace-files` named input stands
for every file no other project owns.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run configuration:coinagerie-check:write`.

- **abbreviation**:
- **abusive**:
- **activedescendant**:
- **adjacent**:
- **adjective**:
- **alert**:
- **allowlist**:
- **alone**:
- **alt**:
- **ambiguous**:
- **an**:
- **anchor**:
- **anonymous**:
- **archi**:
- **aria**:
- **around**:
- **arr**:
- **arrow**:
- **assignment**:
- **associate**:
- **attribution**:
- **atx**:
- **autocomplete**:
- **autofocus**:
- **avoid**:
- **backend**:
- **background**:
- **backreference**:
- **ban**:
- **band**:
- **bare**:
- **baseline**:
- **beside**:
- **bg**:
- **binary**:
- **blob**:
- **bof**:
- **bool**:
- **bot**:
- **boundary**:
- **bracket**:
- **breadth**:
- **browser**:
- **budget**:
- **buildable**:
- **bullet**:
- **bundle**:
- **callee**:
- **camel**:
- **capitalisation**:
- **caption**:
- **carry**:
- **category**:
- **chain**:
- **circular**:
- **classlist**:
- **clause**:
- **click**:
- **clone**:
- **co**:
- **coalesce**:
- **coerce**:
- **coercion**:
- **cognitive**:
- **col**:
- **collapse**:
- **colon**:
- **comma**:
- **commonj**:
- **comp**:
- **comparison**:
- **compilation**:
- **complexity**:
- **compress**:
- **compression**:
- **concat**:
- **cond**:
- **condition**:
- **confuse**:
- **consistent**:
- **convention**:
- **cookie**:
- **correctness**:
- **crap**:
- **ctx**:
- **cur**:
- **curly**:
- **curr**:
- **cycle**:
- **cyclomatic**:
- **danger**:
- **dangle**:
- **dataset**:
- **db**:
- **decimal**:
- **decl**:
- **decode**:
- **delegate**:
- **dep**:
- **destructuring**:
- **development**:
- **dialect**:
- **dictionary**:
- **digit**:
- **direct**:
- **direction**:
- **discovery**:
- **distract**:
- **div**:
- **dot**:
- **drill**:
- **driver**:
- **dupe**:
- **dynamic**:
- **ecma**:
- **edge1**:
- **edge2**:
- **effect**:
- **el**:
- **element**:
- **embed**:
- **emphasis**:
- **enhance**:
- **eof**:
- **eqeqeq**:
- **equality**:
- **es**:
- **es2020**:
- **es2026**:
- **evaluate**:
- **ex**:
- **exact**:
- **exclamation**:
- **exempt**:
- **exhaustive**:
- **exhaustiveness**:
- **existence**:
- **explicit**:
- **extraneous**:
- **faker**:
- **fallthrough**:
- **falsy**:
- **fence**:
- **filetype**:
- **fishery**:
- **flake8**:
- **float**:
- **floor**:
- **focus**:
- **follow**:
- **footer**:
- **forbid**:
- **fraction**:
- **fragment**:
- **func**:
- **further**:
- **gap**:
- **general**:
- **generation**:
- **generic**:
- **glossary**:
- **go**:
- **h1**:
- **hatch**:
- **hcl**:
- **here**:
- **heritage**:
- **hex**:
- **hexadecimal**:
- **higher**:
- **history**:
- **hold**:
- **html**:
- **hydrate**:
- **hyphen**:
- **identical**:
- **idx**:
- **iframe**:
- **iife**:
- **img**:
- **immediate**:
- **increment**:
- **incremental**:
- **inferrable**:
- **infinity**:
- **ini**:
- **inject**:
- **inlined**:
- **interaction**:
- **internal**:
- **interop**:
- **intersection**:
- **invalidate**:
- **ipynb**:
- **irregular**:
- **isnan**:
- **jupyter**:
- **kebab**:
- **keyboard**:
- **land**:
- **lang**:
- **logic**:
- **logical**:
- **lone**:
- **lonely**:
- **longhand**:
- **loss**:
- **lowercase**:
- **magic**:
- **many**:
- **mark**:
- **marker**:
- **maxage**:
- **md013**:
- **md024**:
- **md033**:
- **md034**:
- **md041**:
- **md046**:
- **md049**:
- **md050**:
- **meanderaw**:
- **meaningless**:
- **mermaid**:
- **mislead**:
- **misuse**:
- **mix**:
- **modern**:
- **mount**:
- **mouse**:
- **multiple**:
- **mutation**:
- **native**:
- **natural**:
- **nav**:
- **navigation**:
- **neg**:
- **negate**:
- **negation**:
- **negative**:
- **newline**:
- **nonconstructor**:
- **noninteractive**:
- **nonoctal**:
- **notebook**:
- **noun**:
- **npmj**:
- **nullish**:
- **num**:
- **numeric**:
- **nursery**:
- **obj**:
- **occurrence**:
- **octal**:
- **offline**:
- **operator**:
- **origin**:
- **orphan**:
- **over**:
- **overload**:
- **ownership**:
- **pad**:
- **paginate**:
- **parallelism**:
- **paren**:
- **partition**:
- **pascal**:
- **payload**:
- **pedantic**:
- **persistence**:
- **pin**:
- **pixel**:
- **pkg**:
- **playground**:
- **policy**:
- **poll**:
- **pr**:
- **pragma**:
- **precision**:
- **prefer**:
- **preload**:
- **prelude**:
- **presence**:
- **presentation**:
- **preset**:
- **prevent**:
- **prod**:
- **prop**:
- **proptype**:
- **prose**:
- **proxy**:
- **px**:
- **pyproject**:
- **ql**:
- **radix**:
- **re**:
- **ready**:
- **reassign**:
- **recommend**:
- **recursion**:
- **redeclare**:
- **redundant**:
- **regexp**:
- **rel**:
- **relay**:
- **replacement**:
- **reporter**:
- **reproducible**:
- **req**:
- **restoration**:
- **restrict**:
- **restriction**:
- **ret**:
- **reverse**:
- **revision**:
- **rewrite**:
- **role**:
- **rollup**:
- **route**:
- **runtime**:
- **same**:
- **save**:
- **scalar**:
- **scoping**:
- **screen**:
- **scroll**:
- **selector**:
- **self**:
- **semi**:
- **sensitive**:
- **sensitivity**:
- **setter**:
- **severity**:
- **shadow**:
- **shorthand**:
- **sibling**:
- **side**:
- **since**:
- **single**:
- **slash**:
- **space**:
- **sparse**:
- **splice**:
- **spread**:
- **standalone**:
- **statistic**:
- **stdio**:
- **stg**:
- **str**:
- **stylistic**:
- **suggest**:
- **suppression**:
- **suspicious**:
- **syntax**:
- **tab**:
- **tabindex**:
- **take**:
- **temp**:
- **templater**:
- **ternary**:
- **testid**:
- **testpath**:
- **textnode**:
- **their**:
- **thenable**:
- **thin**:
- **threshold**:
- **through**:
- **tmp**:
- **toggle**:
- **toml**:
- **top**:
- **totalmem**:
- **trace**:
- **trail**:
- **trailer**:
- **transition**:
- **triple**:
- **trivyignore**:
- **trunc**:
- **truthy**:
- **tseslint**:
- **tslint**:
- **txt**:
- **unbind**:
- **unchecked**:
- **undeclared**:
- **undef**:
- **underscore**:
- **unescaped**:
- **unify**:
- **unnecessary**:
- **unneeded**:
- **unowned**:
- **unplugin**:
- **unprovided**:
- **unpublish**:
- **unreachable**:
- **unreadable**:
- **unresolved**:
- **unsafe**:
- **unsupported**:
- **uplink**:
- **useless**:
- **val**:
- **validator**:
- **vendored**:
- **venv**:
- **verb**:
- **verbatim**:
- **violation**:
- **vue**:
- **wheel**:
- **which**:
- **whitelist**:
- **whitespace**:
- **width**:
- **wrong**:
- **yamllint**:
- **yoda**:

<!-- coinagerie:end -->
