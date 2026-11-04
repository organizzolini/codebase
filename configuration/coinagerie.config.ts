import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  cssKeywords,
  hclKeywords,
  jsonKeywords,
  pythonKeywords,
  shellKeywords,
  sqlKeywords,
  tomlKeywords,
  typescriptKeywords,
  yamlKeywords,
} from "@coinagerie/languages";

import type { CoinagerieConfiguration } from "@coinagerie/configuration";

// 📖 Glossary

/**
 * The root glossary every project's own glossary is written against.
 *
 * Resolved from this file rather than from the working directory, because a
 * project's check runs from the project's own folder.
 */
const ROOT_GLOSSARY_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../GLOSSARY.md",
);

/** One glossary bullet, `- **word**: definition`, captured down to the word. */
const GLOSSARY_BULLET_PATTERN = /^- \*\*(?<word>[^\s*]+)\*\*:/u;

/**
 * Reads the headwords the root glossary lists.
 *
 * Only the bullets matter: a definition, and any line continuing one, says
 * nothing about which words are covered. A missing file throws, so the run
 * names the configuration whose `exclude.words` failed instead of quietly
 * listing every word the root glossary was meant to cover.
 *
 * @returns Every word on a bullet of the root glossary, in file order
 */
export function readRootGlossaryWords(): string[] {
  return readFileSync(ROOT_GLOSSARY_PATH, "utf8")
    .split("\n")
    .flatMap(
      (line) => GLOSSARY_BULLET_PATTERN.exec(line)?.groups?.["word"] ?? [],
    );
}

// ♟️ Conventions

/**
 * Every language's reserved words, which name the language rather than
 * anything this repository did.
 *
 * The package exports them as plain lists and excludes nothing on its own, so
 * what a glossary leaves out is stated here, where a reader can see it.
 */
export const keywordExclusions: string[] = [
  ...cssKeywords,
  ...hclKeywords,
  ...jsonKeywords,
  ...pythonKeywords,
  ...shellKeywords,
  ...sqlKeywords,
  ...tomlKeywords,
  ...typescriptKeywords,
  ...yamlKeywords,
];

/**
 * Words the singularizer and the lemmatizer fold into something the code
 * never wrote, mapped back, and the abbreviations the code spells out in full
 * elsewhere, mapped onto that spelling.
 *
 * `fold` runs after plurals and inflections are folded, so every key is a
 * headword the package already produced: `caelundas` arrives as `caelunda`,
 * and `data` as `datum`.
 */
const FOLDED_WORDS = new Map([
  ["arg", "argument"],
  ["axio", "axios"],
  ["caelunda", "caelundas"],
  ["char", "character"],
  ["config", "configuration"],
  ["datum", "data"],
  ["dir", "directory"],
  ["env", "environment"],
  ["metadatum", "metadata"],
  ["nestj", "nestjs"],
  ["postgre", "postgres"],
  ["protobufj", "protobufjs"],
  ["rechart", "recharts"],
  ["vitej", "vitejs"],
  ["xarg", "xargs"],
]);

/**
 * Maps a headword onto the one this repository writes it as.
 *
 * @param word - A headword after plural and inflection folding
 * @returns The headword this repository keeps the word under
 */
export function foldRepositoryWord(word: string): string {
  return FOLDED_WORDS.get(word) ?? word;
}

// 🗣️ Common words

/**
 * Plain English and runtime vocabulary that no project defines differently
 * from anywhere else: function words, verbs every program uses, and the names
 * of the standard library, the test framework, and package manifest fields.
 *
 * Chosen by how many project glossaries listed the word unprompted, so a word
 * a project means something particular by belongs in that project's glossary
 * and stays out of this list. Written as one string per line of prose rather
 * than one array entry per word to stay under the file size limit.
 */
export const commonWordExclusions: string[] = `
  absolute actual address after afterward again allow alpha although
  analysis answer anything append array ask assertion assign at attach
  attempt basename because before better bind block bootstrap buffer bug
  builder byte call callback can capture cell character child chunk clear
  close collection color comment compare compile compiler complete compute
  configure connection console constant contain controller count css
  custom debug declaration decorator deep define definition describe
  difference directly disable discover display each edge empty enable
  encode entity entry equal every exactly example execute exp experimental
  expression extname extra factory failure fake field filename find finish
  finite first fixture flag flat force form gitkeep greater handler hide
  hoist homepage href identifier implementation implicit indent
  indentation injectable inline inside instance int invalid isolate it
  item java judge keep kind last lead least length less level link literal
  load loader locale locate location logger long lower make manifest math
  maximum md member meta method metric millisecond min miss mkdtemp mock
  next no non normalize now nullable ok omit once one open optional
  original other outside own pair parameter part partial pending per pick
  plain plan point pop position positive present preview previous promise
  protocol prototype provide publish quote reach readdir real reason
  recursive reduce reg regex reject relative remove rename repeat replace
  resolution rest round runner safe score search second section see
  segment sep separator sequence show signal skip slice so some sort spawn
  special split spy stack stat statement stdout stop strict stringify stub
  substitution success summary surface synthetic task temporary text than
  that the them timer tmpdir touch trim two unstub up valid variable vi
  visit walk warn what wide without work wrap
`
  .split(/\s+/u)
  .filter(Boolean);

// 📚 External vocabulary

/**
 * Words this repository takes from tools it uses and does not define: lint
 * rule names, library and product terms, abbreviations, and the plain
 * vocabulary of the documents it quotes, with the truncated stems the
 * tokenizer leaves of them.
 *
 * Each one is found in the documentation of the thing it came from, so a
 * glossary here would only repeat it. Written as prose for the same reason as
 * the common words above. The stems are not words, so the spell check skips
 * the list.
 */
// cspell:disable
export const externalWordExclusions: string[] = `
  abbr abc abnormal absorb abusive acc acl aco action active activity
  actor addition adj affinity age agg ai aliased alloc allowlist alone
  already alternative alway an analytics animal animate annotate anonymous
  api apoapsi apog apollo approval approve apsi apt arch archi argument
  armor arr arrange artifact ary ascend asdict aside asset assignable
  assignee assignment associate atlas attest attestation attribute atx
  audit auth authenticate authentication author authorize auto autofocus
  automate autoprefixer autoscaler available avoid aw ax axe axios ay
  azure babel backreference backslash bad bail bandit barrel base bash
  bashrc basi bear bearer bell bend beta bf big bill bin biome bl blank
  blockquote body bof boot bot both brace branch brew brotli btn bucket
  build buildable buildx bump bundler bx bypass cach cache cancel canva
  capitalisation car carousel cat catalog categorize cb cent cere cfg
  changelog checker checkout checksum cheerio chmod ci circular cl
  classlist claude clause cli client cloud clsx cmd cmdk cn co code
  codegen codename codeowner codespace coercion coffee cog cognitive col
  collator collect colon colorize com comma commander commitlint committer
  common comp companion compilation complexity component compose
  compressor conclude concurrency cond conduct configuration confuse
  consequence consistent construct consumer content continuous contribute
  control conventional conventionalcommit cook cooldown coord copilot copy
  corepack correctness cost cousin coverage cp cpu cpus cpython crap
  credential credit cron cruiser crypto cspell ct ctx cur curl curly curr
  currency customization cw cwd cyclomatic damage danger dangerously
  dangle dash dashboard data dataclass dataloader date day dc ddc ddl dead
  deadline dearmor dec decl dedupe deeper deixi delimit delimiter demo dep
  depend dependabot dependency dependent deploy deployment descend
  description destructuring dev devcontainer development devkit devtool di
  diagnostic dialect digest directory dirname discontinue discount
  discriminate discussion disk dismiss disown distract dm dn dnd docker
  dockerignore docstring dom domhandler doom dossier downstream drill dry
  ds dt dummy dupe duplicate dur during dv dx dy ecma ecosystem edc edit
  editor editorconfig ef eff eitsupi el elevate elimination ellipsi elt
  email embla emit emoji emphasis enclose endpoint enforce enforcement
  engine enhance environment eof ep ephe ephemeride eq eqeqeq equality err
  error errored esbuild escape eslint esm etc euo ev evaluation event
  evict eviction evidence ex exceed exchange exclamation exclude exclusion
  executor exempt exhaustive exhaustively exhaustiveness existence
  expandded expect expose express extension external extract extractor
  extraneous fail faker fallback fallow fallthrough falsy fan fast feature
  fem file fileset filetype fillable filter fingerprint fishery fix
  flowchart fm fmt fn folder foo forgive format forward four freeze
  frontmatter fs fsec fullname fully func functool further fx fy fz gadget
  gear gen generate generator getattr getuid gfm gh ghcr git gitattribute
  github gitignore gitleak gitleaksignore gitmodule gitmoji give glob
  globbed gojq golevelup good gpg gpgsign grandchild grandparent graph
  graphql greet greg grep gt guardrail gyp handbook hasattr haumean hcl
  head header headless health healthcheck hello helm help helper heritage
  hi higher home homebrew homedir hook host hostname http hub husky hyphen
  iace iact iacu id identical iect ien ier iframe ignore ignorecase iife
  image impl inbound include independent inferrable info inform ini init
  initialization initialize initializer inlined input install installer
  instruction intact integration integrity intend interact interop
  interpolation interval io isnan issue isupper iud iue iug iun iur iut
  iuv iv jaq jiti jq js jscpd jsdoc jsdom json jsonc jsonencode jsonl jsx
  jupyter jupyterlab keeper kernelspec keygen keyid keyring keyshortcut
  keyword kit knip kubeconfig kubectl kubernete la label lat latest lazy
  lib library license lifecycle lift lightship line linode linter linux
  list listen listener lke ln lo localhost lockfile lodash log logic
  logical login lon lonely longhand look loss lru ls lsof lstat lt lucide
  mac machine magic main major malformation manager manual markdown
  markdownlint masc match matcher matrix matter max maxage maxsize mcp
  mdast meaningless memoize memory merge mermaid message metadata
  microsoft migration minikube minimum minor minute mislead misname misuse
  mj mkdir mktemp moby mode model modelfile modern modify modulus moment
  monitor monkey monorepo moseph most movable msdownload msg msvideo msw
  mtime multiline must mustache mute mutual na name nb nbformat nbstripout
  neg negation nepo nest nestjs net network newest newline newly nod
  nodbit node nohup nonconstructor noninteractive nonoctal note notebook
  notification npm npmj npmrc npx num nursery nvm nvmrc nx nxignore oasi
  occ octal od odd officedocument offline oid ollama op openrouter openssh
  openwiki openwikiignore openxmlformat operate operation opp opt
  optimization optimize option org os oscu otp outcome outdated outgo
  output outsider overload overview overwrite owner ownership oxfmt
  oxfmtignore oxlint oxlintignore pack panel para parallel parallelism
  param paren parent parenthesized parse parser party passphrase password
  patch path pattern payment pct pedantic peer perf perfectionist perform
  periapsi permission persist pg pgdatabase pgdg pghost pgpassfile
  pgpassword pgport pgservice pguser pheno photostructure picker pid
  pinentry pino pip pipe pipefail pkg placeholder plaintext plan planfile
  plugin pluralize pnpm po pod poll port post postcss postgres postgresql
  postinstall pp pr praenoman pragma pre precede precommit prefix prelude
  prepare presentationml prettier prettierignore prettify pretty print
  problem process processor prod production program progress promote pron
  proptype protection protobufjs prov provider provisioner pull push put
  pvc pyc pycache pyright pytest python pythonpath qb ql qq quantity quasi
  query quickstart qx radix rag range rat rate raw rc react readiness
  readline readlink readme really realpath reassign rebase receive
  recharts recommend recommendation record recovery recreate recur
  recursion redeclare redistribute redundant ref refactor refinement
  reformatted refract regexp register registry relabel release relevant
  remain remap remark remeasured reminder remote render repl replica
  report req request rerun research reset resizable resolve resolver
  resource response restart restore restriction result resume ret
  retention retrace retry reui rev review revision rid rm roll rollup
  roundtrip router rs ruff rule ruleset run sagitarius san sanitize say
  scaffold schedule scol scoping script se searxng sec secret sed seed
  seflg seg semantic semi semver sensitive sensitivity separately sera
  serve server service session setter sf sh sha shadcn shape shard share
  shebang shell shellcheck sherif shiki shipment shop short shortest shout
  shutdown sideway sign signature signer signingkey signoff silent sink
  sit site size sl sleep smoke sock sonner sortable specifier specify
  spell splitline spreadsheetml sprocket sql sqlfluff sqlfluffignore
  sqlite squash squawk src srow ss ssh stag stage standard startup state
  status stderr stdio step stg storage storefront straggler stranger
  strategy strictest strip style stylelint stylistic subarray subdirectory
  subject subpath suffix superproject supervisor suppression surround
  survivor suspicious svgsvg swc sweph swieph sx sy symlink symmetrical
  sync syncpack system tabindex tableparser tag tailwind tailwindcss
  tanstack tar tarball target tarjan tax tc tcp telemetry temp template
  templater tense ternary terraform testcontainer tester textnode tf
  tflint their thematic theme thenable thin thing threadpool thrice ticker
  timeout timestamp timestamptz timezone tint tip title tl together tok
  token toleration tool topic topo topoctr total totalmem trailer transfer
  transitive transport trgm triangle trivia trivy trivyignore truncation
  trust truthy ts tsconfig tsdoc tseslint tslib tslint tsx ttl tty tui tw
  ty typeorm typesafety typescript typo tz ui uid unanswered unchecked
  uncompress undecorated undef underscore unescaped unfamiliar unhandled
  unicorn unify unit unlimited unload unnecessary unneeded unpack
  unparsable unplugin unprovided unpublish unr unref unrelated unsafe
  unseal unsigned unsorted untrusted unused unverifiable unversioned
  unwanted unzip uo upgrade uplink uppercase upstream uri url usage usd
  useless user userconfig username usr utc util utility utime uv ux uy val
  variance vendor venu verbatim verbose verdaccio verify version
  versioning vetoable virtual vite vitejs vitest vnd volume vscode
  vulnerability vulture vx vy waiter walkthrough wan warrenbuckley wasm
  watch wax web websocket webui wf which wildcard wink wl wordprocessingml
  worker workflow workspace worktree wrapper write wrong ws www xargs xmln
  xq xz xzf yaml yamllint yml yoda yq zero zeroe zod zshrc
`
  .split(/\s+/u)
  .filter(Boolean);
// cspell:enable

/**
 * Words that follow a shape no one defines: hexadecimal runs from hashes and
 * identifiers, and a name ending in digits, such as a numbered fixture or a
 * version tag. `j2000`, the astronomical epoch, is the one name kept.
 */
export const patternExclusions: RegExp[] = [
  /^(?=.*\d)[0-9a-f]{2,}$/u,
  /^(?!j2000$)[a-z]+\d+$/u,
];

// 🧩 Configuration

/**
 * What every project's `coinagerie.config.ts` spreads.
 *
 * Words the root glossary lists are excluded, so a project's own glossary
 * holds only the words that are its own. The root configuration does not
 * spread this: it writes the glossary these words are read from, and reading
 * it would exclude every word it was about to write.
 *
 * A named export beside the default: the loader reads only a file's default
 * export, and a project spreading the shared configuration imports it by name.
 */
export const coinagerieConfiguration = {
  exclude: {
    words: (): (string | RegExp)[] => [
      ...keywordExclusions,
      ...commonWordExclusions,
      ...externalWordExclusions,
      ...patternExclusions,
      ...readRootGlossaryWords(),
    ],
  },
  fold: foldRepositoryWord,
} satisfies CoinagerieConfiguration;

/**
 * The `configuration` project's own glossary, written into its README.
 *
 * The default export is what the loader reads, so it adds the one output the
 * spread configuration above leaves to each project.
 */
export default {
  ...coinagerieConfiguration,
  outputs: [
    {
      description:
        "The words this project uses that the root glossary does not define, regenerated with `nx run configuration:coinagerie-check:write`.",
      path: "README.md",
      type: "markdown",
    },
  ],
} satisfies CoinagerieConfiguration;
