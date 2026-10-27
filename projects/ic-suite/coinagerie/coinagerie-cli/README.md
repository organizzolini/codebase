## Usage

`coinagerie` lists the words a codebase uses — every identifier, object key,
enum member, folder name, and file name, split into lowercase words — and keeps
a markdown glossary of them in step with the code.

```bash
coinagerie                       # print the glossary block, write nothing
coinagerie --check               # exit 1 naming missing and stale words
coinagerie --write               # rewrite every glossary, keeping definitions
coinagerie --config path/to/coinagerie.config.ts --check
```

Without `--config`, a `coinagerie.config.ts` in the working directory is used
when there is one, and defaults apply when there is not. The folder the
configuration file sits in is the root the run scans:

```ts
export default {
  exclude: { paths: ["**/*.test.ts"] },
  include: ["src/**"],
  outputs: [
    { description: "Words this project uses.", path: "README.md", type: "markdown" },
  ],
};
```

Every `.gitignore` git would honor is honored, and the files a run writes are
never scanned. A glossary block that cannot be fully parsed is never written.

## Start

```bash
nx run coinagerie-cli:start
```

## Test

```bash
nx run coinagerie-cli:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this package uses that the root glossary does not define, regenerated with `nx run coinagerie-cli:coinagerie-check:write`.

- **absolute**:
- **after**:
- **anchor**:
- **angle**:
- **answer**:
- **aspect**:
- **assertion**:
- **bootstrap**:
- **breadth**:
- **buffer**:
- **bug**:
- **bullet**:
- **call**:
- **clear**:
- **close**:
- **color**:
- **comparison**:
- **compile**:
- **compiler**:
- **console**:
- **constant**:
- **controller**:
- **css**:
- **decorator**:
- **define**:
- **deliver**:
- **delivery**:
- **describe**:
- **destination**:
- **dialect**:
- **difference**:
- **discovery**:
- **each**:
- **encode**:
- **entry**:
- **equal**:
- **experimental**:
- **factory**:
- **fake**:
- **field**:
- **fixture**:
- **flag**:
- **force**:
- **gitkeep**:
- **glossary**:
- **handler**:
- **homepage**:
- **implementation**:
- **injectable**:
- **inside**:
- **instance**:
- **invalid**:
- **least**:
- **length**:
- **load**:
- **logger**:
- **lunar**:
- **malformed**:
- **maximum**:
- **md**:
- **meta**:
- **miss**:
- **mkdtemp**:
- **mock**:
- **other**:
- **parameter**:
- **phase**:
- **polyglot**:
- **previous**:
- **promise**:
- **prototype**:
- **provide**:
- **py**:
- **real**:
- **reason**:
- **reconcile**:
- **recursive**:
- **reject**:
- **rejection**:
- **relative**:
- **remove**:
- **resolution**:
- **rewrite**:
- **runner**:
- **sort**:
- **spawn**:
- **spy**:
- **stack**:
- **stale**:
- **stdout**:
- **strict**:
- **stringify**:
- **synthetic**:
- **tf**:
- **timer**:
- **toml**:
- **vanish**:
- **vi**:
- **vocabulary**:
- **work**:

<!-- coinagerie:end -->
