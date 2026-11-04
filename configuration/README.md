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
- **absolute**:
- **abusive**:
- **activedescendant**:
- **address**:
- **adjacent**:
- **adjective**:
- **after**:
- **alert**:
- **allowlist**:
- **alone**:
- **alt**:
- **ambiguous**:
- **an**:
- **analysis**:
- **anchor**:
- **anonymous**:
- **append**:
- **archi**:
- **aria**:
- **around**:
- **arr**:
- **array**:
- **arrow**:
- **assertion**:
- **assign**:
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
- **bind**:
- **blob**:
- **block**:
- **bof**:
- **bool**:
- **bootstrap**:
- **bot**:
- **boundary**:
- **bracket**:
- **breadth**:
- **browser**:
- **budget**:
- **buffer**:
- **buildable**:
- **builder**:
- **bullet**:
- **bundle**:
- **call**:
- **callback**:
- **callee**:
- **camel**:
- **capitalisation**:
- **caption**:
- **capture**:
- **carry**:
- **category**:
- **chain**:
- **character**:
- **child**:
- **circular**:
- **classlist**:
- **clause**:
- **click**:
- **clone**:
- **close**:
- **co**:
- **coalesce**:
- **coerce**:
- **coercion**:
- **cognitive**:
- **col**:
- **collapse**:
- **collection**:
- **colon**:
- **color**:
- **comma**:
- **comment**:
- **commonj**:
- **comp**:
- **compare**:
- **comparison**:
- **compilation**:
- **compile**:
- **compiler**:
- **complexity**:
- **compress**:
- **compression**:
- **concat**:
- **cond**:
- **condition**:
- **confuse**:
- **connection**:
- **consistent**:
- **console**:
- **constant**:
- **controller**:
- **convention**:
- **cookie**:
- **correctness**:
- **count**:
- **crap**:
- **css**:
- **ctx**:
- **cur**:
- **curly**:
- **curr**:
- **custom**:
- **cycle**:
- **cyclomatic**:
- **danger**:
- **dangle**:
- **dataset**:
- **db**:
- **decimal**:
- **decl**:
- **declaration**:
- **decode**:
- **decorator**:
- **define**:
- **definition**:
- **delegate**:
- **dep**:
- **describe**:
- **destructuring**:
- **development**:
- **dialect**:
- **dictionary**:
- **digit**:
- **direct**:
- **direction**:
- **discovery**:
- **display**:
- **distract**:
- **div**:
- **dot**:
- **drill**:
- **driver**:
- **dupe**:
- **dynamic**:
- **each**:
- **ecma**:
- **edge**:
- **edge1**:
- **edge2**:
- **effect**:
- **el**:
- **element**:
- **embed**:
- **emphasis**:
- **empty**:
- **encode**:
- **enhance**:
- **entity**:
- **entry**:
- **eof**:
- **eqeqeq**:
- **equal**:
- **equality**:
- **es**:
- **es2020**:
- **es2026**:
- **evaluate**:
- **ex**:
- **exact**:
- **exactly**:
- **example**:
- **exclamation**:
- **execute**:
- **exempt**:
- **exhaustive**:
- **exhaustiveness**:
- **existence**:
- **exp**:
- **experimental**:
- **explicit**:
- **expression**:
- **extraneous**:
- **factory**:
- **failure**:
- **fake**:
- **faker**:
- **fallthrough**:
- **falsy**:
- **fence**:
- **field**:
- **filename**:
- **filetype**:
- **fishery**:
- **flag**:
- **flake8**:
- **flat**:
- **float**:
- **floor**:
- **focus**:
- **follow**:
- **footer**:
- **forbid**:
- **force**:
- **fraction**:
- **fragment**:
- **func**:
- **further**:
- **gap**:
- **general**:
- **generation**:
- **generic**:
- **gitkeep**:
- **glossary**:
- **go**:
- **h1**:
- **handler**:
- **hatch**:
- **hcl**:
- **here**:
- **heritage**:
- **hex**:
- **hexadecimal**:
- **higher**:
- **hoist**:
- **hold**:
- **href**:
- **html**:
- **hydrate**:
- **hyphen**:
- **identical**:
- **identifier**:
- **idx**:
- **iframe**:
- **iife**:
- **img**:
- **immediate**:
- **implicit**:
- **increment**:
- **incremental**:
- **indent**:
- **indentation**:
- **inferrable**:
- **infinity**:
- **ini**:
- **inject**:
- **injectable**:
- **inline**:
- **inlined**:
- **inside**:
- **instance**:
- **int**:
- **interaction**:
- **internal**:
- **interop**:
- **intersection**:
- **invalid**:
- **invalidate**:
- **ipynb**:
- **irregular**:
- **isnan**:
- **isolate**:
- **item**:
- **java**:
- **judge**:
- **jupyter**:
- **kebab**:
- **keep**:
- **keyboard**:
- **kind**:
- **land**:
- **lang**:
- **last**:
- **lead**:
- **least**:
- **length**:
- **level**:
- **link**:
- **literal**:
- **loader**:
- **logger**:
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
- **math**:
- **maxage**:
- **maximum**:
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
- **member**:
- **mermaid**:
- **meta**:
- **method**:
- **metric**:
- **min**:
- **mislead**:
- **miss**:
- **misuse**:
- **mix**:
- **mock**:
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
- **non**:
- **nonconstructor**:
- **noninteractive**:
- **nonoctal**:
- **notebook**:
- **noun**:
- **now**:
- **npmj**:
- **nullable**:
- **nullish**:
- **num**:
- **numeric**:
- **nursery**:
- **obj**:
- **occurrence**:
- **octal**:
- **offline**:
- **omit**:
- **once**:
- **one**:
- **operator**:
- **optional**:
- **origin**:
- **orphan**:
- **over**:
- **overload**:
- **own**:
- **ownership**:
- **pad**:
- **paginate**:
- **pair**:
- **parallelism**:
- **parameter**:
- **paren**:
- **partition**:
- **pascal**:
- **payload**:
- **pedantic**:
- **per**:
- **persistence**:
- **pin**:
- **pixel**:
- **pkg**:
- **plain**:
- **playground**:
- **point**:
- **policy**:
- **poll**:
- **positive**:
- **posix**:
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
- **preview**:
- **previous**:
- **prod**:
- **promise**:
- **prop**:
- **proptype**:
- **prose**:
- **protocol**:
- **prototype**:
- **proxy**:
- **publish**:
- **px**:
- **pyproject**:
- **ql**:
- **quote**:
- **radix**:
- **re**:
- **ready**:
- **real**:
- **reassign**:
- **recommend**:
- **recursion**:
- **redeclare**:
- **reduce**:
- **redundant**:
- **reg**:
- **regex**:
- **regexp**:
- **reject**:
- **rel**:
- **relative**:
- **relay**:
- **remove**:
- **replace**:
- **replacement**:
- **reporter**:
- **reproducible**:
- **req**:
- **resolution**:
- **rest**:
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
- **runner**:
- **runtime**:
- **safe**:
- **same**:
- **save**:
- **scalar**:
- **scoping**:
- **score**:
- **screen**:
- **scroll**:
- **section**:
- **selector**:
- **self**:
- **semi**:
- **sensitive**:
- **sensitivity**:
- **separator**:
- **sequence**:
- **setter**:
- **severity**:
- **shadow**:
- **shorthand**:
- **sibling**:
- **side**:
- **signal**:
- **since**:
- **single**:
- **slash**:
- **slice**:
- **some**:
- **sort**:
- **space**:
- **sparse**:
- **splice**:
- **split**:
- **spread**:
- **stack**:
- **standalone**:
- **statement**:
- **statistic**:
- **stdio**:
- **stg**:
- **str**:
- **strict**:
- **stringify**:
- **stub**:
- **stylistic**:
- **substitution**:
- **success**:
- **suggest**:
- **suppression**:
- **suspicious**:
- **syntax**:
- **synthetic**:
- **tab**:
- **tabindex**:
- **take**:
- **temp**:
- **templater**:
- **temporary**:
- **ternary**:
- **testid**:
- **testpath**:
- **text**:
- **textnode**:
- **their**:
- **thenable**:
- **thin**:
- **threshold**:
- **through**:
- **timer**:
- **tmp**:
- **toggle**:
- **toml**:
- **top**:
- **totalmem**:
- **trace**:
- **trail**:
- **trailer**:
- **transition**:
- **trim**:
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
- **valid**:
- **validator**:
- **variable**:
- **vendored**:
- **venv**:
- **verb**:
- **verbatim**:
- **vi**:
- **violation**:
- **vocabulary**:
- **vue**:
- **wheel**:
- **which**:
- **whitelist**:
- **whitespace**:
- **width**:
- **without**:
- **wrap**:
- **wrong**:
- **yamllint**:
- **yoda**:

<!-- coinagerie:end -->
