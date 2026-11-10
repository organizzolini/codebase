import {
  type CallidescopeConfiguration,
  type CallidescopeLimits,
  type CallidescopeProjectConfiguration,
  DEFAULT_ENTRY_POINT_DECORATORS,
  DEFAULT_PROJECT_README_HEADING,
} from "@callidescope/configuration";

/**
 * The starting point every project spreads and overrides: defaults, never
 * ceilings. See `documentation/development/callidescope-configuration.md`.
 */
export const workspaceLimits = {
  /**
   * `configuration/` project's own breadth, and the number the six
   * conformetry leaf analyzers took before this ticket measured their own.
   *
   * Two, from `bodyCoAuthoredOnly` and `footerCoAuthoredOnly` in
   * `configuration/commitlint.config.ts`, tied at the widest — each filters
   * trailers and checks every one of them, ordinary fan-out rather than a
   * closed enumeration. `configuration/` is judged by this number directly,
   * since it is the one traced project with no `callidescope.config.ts` of
   * its own to write a boundary-tested number into.
   */
  maximumBreadth: 2,
  /**
   * The depth `projectDefaults` carries into a project that overrides nothing
   * of its own — and no longer this repository's ratchet.
   *
   * **The ratchet is thirty-eight numbers now**, one per project that declares
   * its own, every one of them set from a boundary-tested run at its gate's own
   * scope: it passes at the number written and fails one below it. That is what
   * a ratchet is, and it is what this single number could never be. Seventeen
   * is the deepest stack anywhere in the repository, so as one workspace-wide
   * limit it gated the three projects near it and nothing else — `logging` at
   * four had thirteen frames of free rein, which is to say no gate at all.
   * `nx run callidescope-cli:start -- limits --config
   * configuration/callidescope.config.ts` prints the whole set and the file
   * each number is written in.
   *
   * **Lowering this number is not how the ratchet descends.** Every traced
   * project now writes its own complete file, with its own boundary-tested
   * number beside the spread — the thirty-eight this section counts — so no
   * traced project reads this value as the number it is judged by any more.
   * The eight projects with no stack to gate are the ones `## The projects
   * traced by nothing` above names, and they hold no configuration file to
   * read a lowered number from either. What a number here still sets is the
   * starting point `projectDefaults` hands a project that has not yet
   * measured and declared its own — a new project, not an existing one, since
   * every existing traced project's own file is what a gate reads. To tighten
   * a project already declaring its own, write the boundary-tested number in
   * that project's own `callidescope.config.ts` instead.
   *
   * The history is still worth keeping, because it is what the per-project
   * numbers were measured against. Set to the issue's suggested six, one
   * workspace limit failed on arrival with dozens of findings — a backlog
   * rather than a gate, and a red pipeline nobody can act on teaches people to
   * ignore it. It came down from 19 by removing three frames that were not
   * layers: a `FormsService` method that forwarded its arguments unchanged to
   * the forms builder, a rung of lexico-cli's finite-verb cascade whose
   * whole body re-ran three guards the rungs above had already applied, and a
   * caelundas method that destructured six fields and passed the same six on.
   * Nothing was merged that was doing work.
   *
   * Three stacks sit at 17 and are why it stopped there:
   * `LexicoIngestionCommand.run`, and callidescope-nx's `depthExecutor` and
   * `breadthExecutor`. Both of those projects now write that number in a file
   * of their own, where it gates the project owning the stack and nobody
   * else — which is the whole difference this ticket made. Sixteen
   * is one frame from each and neither frame is obviously spare — lexico's
   * seventeen are a command, a recursion pair, a parse, and the
   * mood/voice/tense/number/person descent, each of which earns its frame.
   * Reaching 16 by collapsing one of those would buy the number and cost the
   * code, which is the trade this comment exists to refuse.
   */
  maximumDepth: 17,
} satisfies CallidescopeLimits;

/**
 * What a project's own `callidescope.config.ts` spreads, then overrides. See
 * `documentation/development/callidescope-configuration.md`.
 */
export const projectDefaults = {
  entryPoints: {
    addresses: [],
    decorators: [...DEFAULT_ENTRY_POINT_DECORATORS],
    includeExportedFunctions: true,
    includeOrphans: true,
    includeTests: false,
  },
  exclude: [],
  limits: {
    /**
     * Left unset here, and never actually taken by anything: every traced
     * project's own `limits` now names a real, boundary-tested
     * `maximumBreadth`, `workspaceLimits` included for `configuration/` and
     * the six conformetry leaf analyzers. The field stays `undefined` rather
     * than a number, because this object carries no gate scope of its own to
     * measure one against — a value written here would be a guess rather
     * than a measurement, and every project that spreads this object
     * overrides `limits` wholesale rather than merging into it.
     */
    maximumBreadth: undefined,
    maximumDepth: workspaceLimits.maximumDepth,
  },
  write: {
    /**
     * The report a project publishes into its own `callidescope.md`, beside its README.
     *
     * The path is read relative to the project's own root, so this reaches
     * `<project>/callidescope.md` — and a project moving its section somewhere else,
     * or writing `undefined` to publish nothing at all, is a one-line edit in
     * the file that owns the document. There is no workspace declaration left
     * that could reach the same file from the other direction.
     */
    markdown: {
      heading: DEFAULT_PROJECT_README_HEADING,
      path: "callidescope.md",
    },
    /**
     * No diagram by default.
     *
     * A project's README carries the table today and nothing else, and turning
     * a diagram on for every project at once is a decision about thirty-eight
     * documents rather than a default. A project that wants one writes it here.
     */
    mermaid: undefined,
  },
} satisfies CallidescopeProjectConfiguration;

/**
 * Published on main; a branch runs only the depth gate, so no pull request
 * conflicts on a generated block. See `documentation/development/callidescope-
 * configuration.md`.
 */
const callidescopeConfiguration: CallidescopeConfiguration = {
  /**
   * `LoggerService` sits behind nearly every other callable in this
   * repository. A call to it is a fact about instrumentation, not about
   * how deep or wide the code around it is, and counting it would move
   * every other callable's depth and breadth on a change that has nothing
   * to do with them.
   */
  excludeCallees: ["LoggerService.*"],
  excludeFrom: ["configuration/.callidescopeignore"],
  limits: workspaceLimits,
  write: {
    /**
     * The workspace-scope report in the repository's own `callidescope.md`.
     *
     * The root README used to carry a fanned-out project section like any
     * other project's, because the root holds a `tsconfig.json` and so was
     * discovered as a project. What it described was the four loose
     * maintenance scripts that belonged to no other project — never the
     * workspace — and it was headed "Call stacks traced through ``", the
     * project's name being its root-relative path and the root's being empty.
     * `.callidescopeignore` now drops that project, and this destination puts
     * the whole run's report there instead: the summary, one row per project
     * against its own limit, and the findings nothing gates.
     *
     * The default heading is kept: the report's own file needs no other.
     *
     * Published by `nx run configuration:callidescope:write` on main, and for the
     * same reason as the per-project sections below it, never checked on a
     * pull request.
     */
    markdown: {
      description:
        "The workspace's call graph, traced by [callidescope](projects/ic-suite/callidescope/callidescope-cli), regenerated by `nx run configuration:callidescope:write`. Projects are listed tightest-first: the rows at the top are the ones a ratchet cannot descend past.",
      heading: DEFAULT_PROJECT_README_HEADING,
      path: "callidescope.md",
    },
  },
};

export default callidescopeConfiguration;
