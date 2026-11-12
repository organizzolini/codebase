# Changelog

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.0.1](https://github.com/organizzolini/codebase/compare/v6.0.0...v6.0.1) (2026-11-12)

## [6.0.0](https://github.com/organizzolini/codebase/compare/v5.0.0...v6.0.0) (2026-11-12)

### ⚠ BREAKING CHANGES

* **dependencies:** GraphQL 14 and 15 are no
longer supported. The <code>graphql</code> peer dependency is now
<code>^16.0.0 || ^17.0.0</code>, so upgrade <code>graphql</code>
to version 16 or 17 before updating to this version.</p>
</li>
<li>
<p><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11075">#11075</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Thanks <a
href="https://github.com/eddeee888"><code>@​eddeee888</code></a>! -
* **dependencies:** Node.js versions below
22.18.0 are no longer supported. Upgrade to Node.js 22.18.0 or later
before updating to this
version.</p>
</li>
<li>
<p><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11075">#11075</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Thanks <a
href="https://github.com/eddeee888"><code>@​eddeee888</code></a>! -
<code>generate()</code> now returns
<code>Promise&lt;FileOutput[] | void&gt;</code> instead of
<code>Promise&lt;FileOutput[] | any&gt;</code>. The result is no longer
<code>any</code>, so consumers using the result as an array must narrow
it first.</p>
<p>Refs <a
href="https://redirect.github.com/dotansimha/graphql-code-generator/issues/11071">#11071</a></p>
</li>
<li>
<p><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11075">#11075</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Thanks <a
href="https://github.com/eddeee888"><code>@​eddeee888</code></a>! -
* **dependencies:** Remove the deprecated
<code>emitLegacyCommonJSImports</code> config option and the
<code>--emit-legacy-common-js-imports</code> CLI flag</p>
<p>Use <code>importExtension</code> (or <code>--import-extension</code>)
to set the extension appended to relative imports.
When <code>importExtension</code> is not set, no extension is
appended.</p>
<p><code>@graphql-codegen/plugin-helpers</code> no longer exports
<code>normalizeImportExtension</code>. Use
<code>importExtension ?? ''</code> instead.</p>
<p>Migration:</p>
<pre lang="diff"><code> const config: CodegenConfig = {
-  emitLegacyCommonJSImports: false,
+  importExtension: '.js',
 };
</code></pre>
</li>
<li>
<p><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11075">#11075</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Thanks <a
href="https://github.com/eddeee888"><code>@​eddeee888</code></a>! -
* **dependencies:** <code>@graphql-tools/*</code>
dependencies are updated to their latest majors, which require Node.js
22.18.0 or later and
GraphQL 16 or 17. If you import <code>@graphql-tools/*</code> packages
in your own code, update them to the
same majors to avoid duplicate installs.
<code>@graphql-tools/code-file-loader@9</code> now extracts</p>
</li>
</ul>
<!-- raw HTML omitted -->
</blockquote>
<p>... (truncated)</p>
</details>
<details>
<summary>Commits</summary>
<ul>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/e5a5669f4197c6db561956a9b4c47244d4e29b48"><code>e5a5669</code></a>
chore(release): update monorepo packages versions (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/graphql-codegen-cli/issues/11085">#11085</a>)</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Next major feature branch (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/graphql-codegen-cli/issues/11075">#11075</a>)</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/11ac951a30b79369d3b0aa78f83a79d309ffcc77"><code>11ac951</code></a>
test: copy dev-test fixtures into package tests (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/graphql-codegen-cli/issues/11098">#11098</a>)</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/cbefcf33b7fde93d3a44c337a4edb5f32ab38fdb"><code>cbefcf3</code></a>
Revert &quot;chore: update <a
href="https://github.com/graphql-tools"><code>@​graphql-tools</code></a>
to latest majors and drop Node below 22....</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/1161d66e36bb074809849cca9367213deed9c443"><code>1161d66</code></a>
chore: update <a
href="https://github.com/graphql-tools"><code>@​graphql-tools</code></a>
to latest majors and drop Node below 22.18 and g...</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/291cfb2a434f24de54a856cc09c6a4dd8ad01526"><code>291cfb2</code></a>
chore(deps): bump shell-quote from 1.9.0 to 1.11.0 in the security group
acro...</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/710d41525f5c2c3283e185b1ac0c94dd988630e7"><code>710d415</code></a>
chore: type-check spec files with a solution-style root tsconfig (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/graphql-codegen-cli/issues/11053">#11053</a>)</li>
<li>See full diff in <a
href="https://github.com/dotansimha/graphql-code-generator/commits/@graphql-codegen/cli@8.0.0/packages/graphql-codegen-cli">compare
view</a></li>
</ul>
</details>
<br />

<!-- codometer-changes:start -->
## ⏲️ Codometer

_Compared against
[`main`](https://github.com/organizzolini/codebase/actions/runs/43312133089)._

<details>
<summary>`affirmancy` — 71 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 33 | — | — |
| 🆕 | codebase.folders | 3 | — | — |
| 🆕 | codebase.javascript.imports | 2 | — | — |
| 🆕 | codebase.json.arrays | 1 | — | — |
| 🆕 | codebase.json.booleans | 1 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 4 | — | — |
| 🆕 | codebase.json.lines | 69 | — | — |
| 🆕 | codebase.json.maxDepth | 6 | — | — |
| 🆕 | codebase.json.objects | 34 | — | — |
| 🆕 | codebase.json.properties | 49 | — | — |
| 🆕 | codebase.json.strings | 20 | — | — |
| 🆕 | codebase.json.totalNodes | 56 | — | — |
| 🆕 | codebase.jupyter.cells | 16 | — | — |
| 🆕 | codebase.jupyter.classes | 9 | — | — |
| 🆕 | codebase.jupyter.codeCells | 14 | — | — |
| 🆕 | codebase.jupyter.codeLines | 876 | — | — |
| 🆕 | codebase.jupyter.decorators | 1 | — | — |
| 🆕 | codebase.jupyter.files | 3 | — | — |
| 🆕 | codebase.jupyter.functions | 21 | — | — |
| 🆕 | codebase.jupyter.headings | 2 | — | — |
| 🆕 | codebase.jupyter.imports | 63 | — | — |
| 🆕 | codebase.jupyter.markdownCells | 2 | — | — |
| 🆕 | codebase.jupyter.markdownLines | 7 | — | — |
| 🆕 | codebase.jupyter.maxDepth | 5 | — | — |
| 🆕 | codebase.jupyter.properties | 126 | — | — |
| 🆕 | codebase.jupyter.totalNodes | 1,028 | — | — |
| 🆕 | codebase.linesOfCode | 4,375 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 9 | — | — |
| 🆕 | codebase.markdown.files | 5 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 22 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 16 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 97 | — | — |
| 🆕 | codebase.markdown.lines | 573 | — | — |
| 🆕 | codebase.markdown.links | 6 | — | — |
| 🆕 | codebase.markdown.listItems | 47 | — | — |
| 🆕 | codebase.markdown.lists | 5 | — | — |
| 🆕 | codebase.markdown.paragraphs | 75 | — | — |
| 🆕 | codebase.markdown.tableRows | 35 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.python.files | 15 | — | — |
| 🆕 | codebase.python.classes | 19 | — | — |
| 🆕 | codebase.python.functions | 83 | — | — |
| 🆕 | codebase.python.constants | 121 | — | — |
| 🆕 | codebase.python.imports | 52 | — | — |
| 🆕 | codebase.python.decorators | 74 | — | — |
| 🆕 | codebase.python.lines | 3,485 | — | — |
| 🆕 | codebase.python.comments | 23 | — | — |
| 🆕 | codebase.python.commentLines | 23 | — | — |
| 🆕 | codebase.python.docstrings | 23 | — | — |
| 🆕 | codebase.python.docstringLines | 74 | — | — |
| 🆕 | codebase.repositoryBytes | 246,510 | — | — |
| 🆕 | codebase.sourceFiles | 18 | — | — |
| 🆕 | codebase.toml.arrays | 16 | — | — |
| 🆕 | codebase.toml.comments | 11 | — | — |
| 🆕 | codebase.toml.files | 1 | — | — |
| 🆕 | codebase.toml.keys | 56 | — | — |
| 🆕 | codebase.toml.lines | 96 | — | — |
| 🆕 | codebase.toml.tables | 12 | — | — |
| 🆕 | codebase.typescript.files | 3 | — | — |
| 🆕 | codebase.yaml.comments | 170 | — | — |
| 🆕 | codebase.yaml.documents | 1 | — | — |
| 🆕 | codebase.yaml.files | 1 | — | — |
| 🆕 | codebase.yaml.keys | 97 | — | — |
| 🆕 | codebase.yaml.lines | 361 | — | — |
| 🆕 | codebase.yaml.mappings | 20 | — | — |
| 🆕 | codebase.yaml.maxDepth | 4 | — | — |
| 🆕 | codebase.yaml.scalars | 262 | — | — |
| 🆕 | codebase.yaml.sequences | 5 | — | — |
</details>

<details>
<summary>`caelundas-cli` — 60 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 386 | — | — |
| 🆕 | codebase.folders | 34 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 296 | — | — |
| 🆕 | codebase.javascript.classes | 115 | — | — |
| 🆕 | codebase.javascript.commentLines | 3,022 | — | — |
| 🆕 | codebase.javascript.comments | 1,972 | — | — |
| 🆕 | codebase.javascript.constants | 4,107 | — | — |
| 🆕 | codebase.javascript.exported | 494 | — | — |
| 🆕 | codebase.javascript.externalPackages | 22 | — | — |
| 🆕 | codebase.javascript.functions | 2,670 | — | — |
| 🆕 | codebase.javascript.imports | 2,138 | — | — |
| 🆕 | codebase.javascript.methods | 860 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 3,234 | — | — |
| 🆕 | codebase.javascript.testFiles | 116 | — | — |
| 🆕 | codebase.javascript.todos | 4 | — | — |
| 🆕 | codebase.json.arrays | 91 | — | — |
| 🆕 | codebase.json.booleans | 10 | — | — |
| 🆕 | codebase.json.files | 52 | — | — |
| 🆕 | codebase.json.items | 287 | — | — |
| 🆕 | codebase.json.lines | 2,624 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 555 | — | — |
| 🆕 | codebase.json.objects | 471 | — | — |
| 🆕 | codebase.json.properties | 1,797 | — | — |
| 🆕 | codebase.json.strings | 1,009 | — | — |
| 🆕 | codebase.json.totalNodes | 2,136 | — | — |
| 🆕 | codebase.linesOfCode | 55,863 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 134 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 29 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 50 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 2,966 | — | — |
| 🆕 | codebase.markdown.lines | 5,148 | — | — |
| 🆕 | codebase.markdown.links | 29 | — | — |
| 🆕 | codebase.markdown.listItems | 328 | — | — |
| 🆕 | codebase.markdown.lists | 24 | — | — |
| 🆕 | codebase.markdown.paragraphs | 538 | — | — |
| 🆕 | codebase.markdown.tableRows | 713 | — | — |
| 🆕 | codebase.markdown.tables | 11 | — | — |
| 🆕 | codebase.repositoryBytes | 2,413,980 | — | — |
| 🆕 | codebase.sourceFiles | 325 | — | — |
| 🆕 | codebase.typescript.decorators | 132 | — | — |
| 🆕 | codebase.typescript.docComments | 969 | — | — |
| 🆕 | codebase.typescript.files | 325 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 15 | — | — |
| 🆕 | codebase.typescript.interfaces | 94 | — | — |
| 🆕 | codebase.custom.Module Files | 34 | — | — |
| 🆕 | codebase.custom.Service Files | 74 | — | — |
| 🆕 | codebase.custom.Command Files | 3 | — | — |
| 🆕 | codebase.custom.Constants Files | 39 | — | — |
| 🆕 | codebase.custom.Types Files | 33 | — | — |
| 🆕 | codebase.custom.Utilities Files | 11 | — | — |
| 🆕 | codebase.custom.Unit Tests | 92 | — | — |
| 🆕 | codebase.custom.Integration Tests | 15 | — | — |
| 🆕 | codebase.custom.End To End Tests | 9 | — | — |
| 🆕 | codebase.custom.Static Methods | 20 | — | — |
| 🆕 | Compiled JavaScript.files | 182 | — | — |
| 🆕 | Compiled JavaScript.size | 169.14 kB | — | — |
</details>

<details>
<summary>`caelundas-db` — 62 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 43 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 26 | — | — |
| 🆕 | codebase.javascript.classes | 12 | — | — |
| 🆕 | codebase.javascript.commentLines | 143 | — | — |
| 🆕 | codebase.javascript.comments | 89 | — | — |
| 🆕 | codebase.javascript.constants | 37 | — | — |
| 🆕 | codebase.javascript.exported | 24 | — | — |
| 🆕 | codebase.javascript.externalPackages | 9 | — | — |
| 🆕 | codebase.javascript.functions | 63 | — | — |
| 🆕 | codebase.javascript.imports | 94 | — | — |
| 🆕 | codebase.javascript.methods | 12 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 49 | — | — |
| 🆕 | codebase.javascript.testFiles | 4 | — | — |
| 🆕 | codebase.json.arrays | 13 | — | — |
| 🆕 | codebase.json.booleans | 8 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 38 | — | — |
| 🆕 | codebase.json.lines | 168 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 42 | — | — |
| 🆕 | codebase.json.properties | 108 | — | — |
| 🆕 | codebase.json.strings | 86 | — | — |
| 🆕 | codebase.json.totalNodes | 150 | — | — |
| 🆕 | codebase.linesOfCode | 1,580 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 8 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 14 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 20 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 109 | — | — |
| 🆕 | codebase.markdown.lines | 573 | — | — |
| 🆕 | codebase.markdown.links | 7 | — | — |
| 🆕 | codebase.markdown.listItems | 38 | — | — |
| 🆕 | codebase.markdown.lists | 4 | — | — |
| 🆕 | codebase.markdown.paragraphs | 70 | — | — |
| 🆕 | codebase.markdown.tableRows | 30 | — | — |
| 🆕 | codebase.markdown.tables | 5 | — | — |
| 🆕 | codebase.repositoryBytes | 105,506 | — | — |
| 🆕 | codebase.sourceFiles | 29 | — | — |
| 🆕 | codebase.sql.commonTableExpressions | 6 | — | — |
| 🆕 | codebase.sql.creates | 21 | — | — |
| 🆕 | codebase.sql.deletes | 9 | — | — |
| 🆕 | codebase.sql.files | 2 | — | — |
| 🆕 | codebase.sql.inserts | 3 | — | — |
| 🆕 | codebase.sql.lines | 264 | — | — |
| 🆕 | codebase.sql.selects | 1 | — | — |
| 🆕 | codebase.sql.statements | 74 | — | — |
| 🆕 | codebase.sql.updates | 8 | — | — |
| 🆕 | codebase.typescript.decorators | 96 | — | — |
| 🆕 | codebase.typescript.docComments | 62 | — | — |
| 🆕 | codebase.typescript.files | 29 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Constants Files | 2 | — | — |
| 🆕 | codebase.custom.Types Files | 1 | — | — |
| 🆕 | codebase.custom.Utilities Files | 1 | — | — |
| 🆕 | codebase.custom.TypeORM Entities | 9 | — | — |
| 🆕 | codebase.custom.Unit Tests | 2 | — | — |
| 🆕 | codebase.custom.Integration Tests | 2 | — | — |
</details>

<details>
<summary>`callidescope-agents` — 43 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 18 | — | — |
| 🆕 | codebase.folders | 5 | — | — |
| 🆕 | codebase.javascript.commentLines | 24 | — | — |
| 🆕 | codebase.javascript.comments | 19 | — | — |
| 🆕 | codebase.javascript.constants | 18 | — | — |
| 🆕 | codebase.javascript.externalPackages | 6 | — | — |
| 🆕 | codebase.javascript.functions | 14 | — | — |
| 🆕 | codebase.javascript.imports | 11 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 14 | — | — |
| 🆕 | codebase.javascript.testFiles | 1 | — | — |
| 🆕 | codebase.json.arrays | 7 | — | — |
| 🆕 | codebase.json.booleans | 3 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 17 | — | — |
| 🆕 | codebase.json.lines | 71 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 25 | — | — |
| 🆕 | codebase.json.properties | 51 | — | — |
| 🆕 | codebase.json.strings | 35 | — | — |
| 🆕 | codebase.json.totalNodes | 71 | — | — |
| 🆕 | codebase.linesOfCode | 190 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 1 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 26 | — | — |
| 🆕 | codebase.markdown.files | 8 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 5 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 41 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 35 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 539 | — | — |
| 🆕 | codebase.markdown.lines | 1,717 | — | — |
| 🆕 | codebase.markdown.links | 14 | — | — |
| 🆕 | codebase.markdown.listItems | 62 | — | — |
| 🆕 | codebase.markdown.lists | 20 | — | — |
| 🆕 | codebase.markdown.paragraphs | 247 | — | — |
| 🆕 | codebase.markdown.tableRows | 66 | — | — |
| 🆕 | codebase.markdown.tables | 11 | — | — |
| 🆕 | codebase.repositoryBytes | 107,570 | — | — |
| 🆕 | codebase.sourceFiles | 7 | — | — |
| 🆕 | codebase.typescript.docComments | 9 | — | — |
| 🆕 | codebase.typescript.files | 7 | — | — |
| 🆕 | codebase.typescript.interfaces | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 1 | — | — |
</details>

<details>
<summary>`callidescope-examples` — 47 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 76 | — | — |
| 🆕 | codebase.folders | 22 | — | — |
| 🆕 | codebase.javascript.classes | 31 | — | — |
| 🆕 | codebase.javascript.commentLines | 344 | — | — |
| 🆕 | codebase.javascript.comments | 188 | — | — |
| 🆕 | codebase.javascript.constants | 52 | — | — |
| 🆕 | codebase.javascript.exported | 39 | — | — |
| 🆕 | codebase.javascript.externalPackages | 8 | — | — |
| 🆕 | codebase.javascript.functions | 108 | — | — |
| 🆕 | codebase.javascript.imports | 61 | — | — |
| 🆕 | codebase.javascript.methods | 76 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 184 | — | — |
| 🆕 | codebase.javascript.testFiles | 1 | — | — |
| 🆕 | codebase.json.arrays | 1,292 | — | — |
| 🆕 | codebase.json.booleans | 2,318 | — | — |
| 🆕 | codebase.json.files | 5 | — | — |
| 🆕 | codebase.json.items | 1,848 | — | — |
| 🆕 | codebase.json.lines | 18,660 | — | — |
| 🆕 | codebase.json.maxDepth | 11 | — | — |
| 🆕 | codebase.json.numbers | 1,649 | — | — |
| 🆕 | codebase.json.objects | 3,390 | — | — |
| 🆕 | codebase.json.properties | 12,517 | — | — |
| 🆕 | codebase.json.strings | 5,721 | — | — |
| 🆕 | codebase.json.totalNodes | 14,370 | — | — |
| 🆕 | codebase.linesOfCode | 1,950 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 79 | — | — |
| 🆕 | codebase.markdown.files | 25 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 22 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 84 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 50 | — | — |
| 🆕 | codebase.markdown.images | 330 | — | — |
| 🆕 | codebase.markdown.inlineCode | 838 | — | — |
| 🆕 | codebase.markdown.lines | 3,079 | — | — |
| 🆕 | codebase.markdown.links | 192 | — | — |
| 🆕 | codebase.markdown.listItems | 43 | — | — |
| 🆕 | codebase.markdown.lists | 10 | — | — |
| 🆕 | codebase.markdown.paragraphs | 318 | — | — |
| 🆕 | codebase.markdown.tableRows | 258 | — | — |
| 🆕 | codebase.markdown.tables | 33 | — | — |
| 🆕 | codebase.repositoryBytes | 990,614 | — | — |
| 🆕 | codebase.sourceFiles | 46 | — | — |
| 🆕 | codebase.typescript.decorators | 32 | — | — |
| 🆕 | codebase.typescript.docComments | 135 | — | — |
| 🆕 | codebase.typescript.files | 46 | — | — |
| 🆕 | codebase.typescript.interfaces | 4 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Integration Tests | 1 | — | — |
</details>

<details>
<summary>`codebase` — 103 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 1,055 | — | — |
| 🆕 | codebase.folders | 173 | — | — |
| 🆕 | codebase.hcl.attributes | 329 | — | — |
| 🆕 | codebase.hcl.blocks | 121 | — | — |
| 🆕 | codebase.hcl.comments | 82 | — | — |
| 🆕 | codebase.hcl.files | 10 | — | — |
| 🆕 | codebase.hcl.interpolations | 10 | — | — |
| 🆕 | codebase.hcl.lines | 852 | — | — |
| 🆕 | codebase.hcl.outputs | 12 | — | — |
| 🆕 | codebase.hcl.resources | 32 | — | — |
| 🆕 | codebase.hcl.variables | 19 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 1,167 | — | — |
| 🆕 | codebase.javascript.classes | 226 | — | — |
| 🆕 | codebase.javascript.commentLines | 4,637 | — | — |
| 🆕 | codebase.javascript.comments | 3,325 | — | — |
| 🆕 | codebase.javascript.constants | 3,479 | — | — |
| 🆕 | codebase.javascript.exported | 959 | — | — |
| 🆕 | codebase.javascript.externalPackages | 62 | — | — |
| 🆕 | codebase.javascript.files | 6 | — | — |
| 🆕 | codebase.javascript.functions | 3,150 | — | — |
| 🆕 | codebase.javascript.imports | 3,167 | — | — |
| 🆕 | codebase.javascript.methods | 985 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 2,968 | — | — |
| 🆕 | codebase.javascript.testFiles | 216 | — | — |
| 🆕 | codebase.javascript.todos | 4 | — | — |
| 🆕 | codebase.json.arrays | 458 | — | — |
| 🆕 | codebase.json.booleans | 210 | — | — |
| 🆕 | codebase.json.files | 56 | — | — |
| 🆕 | codebase.json.items | 1,661 | — | — |
| 🆕 | codebase.json.lines | 8,022 | — | — |
| 🆕 | codebase.json.maxDepth | 11 | — | — |
| 🆕 | codebase.json.numbers | 46 | — | — |
| 🆕 | codebase.json.objects | 1,278 | — | — |
| 🆕 | codebase.json.properties | 3,048 | — | — |
| 🆕 | codebase.json.strings | 2,766 | — | — |
| 🆕 | codebase.json.totalNodes | 4,758 | — | — |
| 🆕 | codebase.linesOfCode | 69,712 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 23 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 597 | — | — |
| 🆕 | codebase.markdown.files | 182 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 143 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 880 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 819 | — | — |
| 🆕 | codebase.markdown.headingLevel4 | 82 | — | — |
| 🆕 | codebase.markdown.images | 1,497 | — | — |
| 🆕 | codebase.markdown.inlineCode | 16,050 | — | — |
| 🆕 | codebase.markdown.lines | 46,114 | — | — |
| 🆕 | codebase.markdown.links | 1,240 | — | — |
| 🆕 | codebase.markdown.listItems | 4,831 | — | — |
| 🆕 | codebase.markdown.lists | 986 | — | — |
| 🆕 | codebase.markdown.paragraphs | 6,787 | — | — |
| 🆕 | codebase.markdown.tableRows | 2,974 | — | — |
| 🆕 | codebase.markdown.tables | 298 | — | — |
| 🆕 | codebase.markdown.taskListItems | 60 | — | — |
| 🆕 | codebase.markdown.thematicBreaks | 50 | — | — |
| 🆕 | codebase.python.files | 1 | — | — |
| 🆕 | codebase.python.lines | 5 | — | — |
| 🆕 | codebase.python.docstrings | 1 | — | — |
| 🆕 | codebase.python.docstringLines | 4 | — | — |
| 🆕 | codebase.repositoryBytes | 7,276,242 | — | — |
| 🆕 | codebase.shell.commentLines | 266 | — | — |
| 🆕 | codebase.shell.comments | 266 | — | — |
| 🆕 | codebase.shell.conditionals | 142 | — | — |
| 🆕 | codebase.shell.exports | 19 | — | — |
| 🆕 | codebase.shell.files | 21 | — | — |
| 🆕 | codebase.shell.functions | 18 | — | — |
| 🆕 | codebase.shell.lines | 1,841 | — | — |
| 🆕 | codebase.shell.loops | 21 | — | — |
| 🆕 | codebase.shell.pipelines | 53 | — | — |
| 🆕 | codebase.shell.shebangs | 22 | — | — |
| 🆕 | codebase.shell.variables | 172 | — | — |
| 🆕 | codebase.sourceFiles | 706 | — | — |
| 🆕 | codebase.toml.arrays | 14 | — | — |
| 🆕 | codebase.toml.arrayTables | 6 | — | — |
| 🆕 | codebase.toml.comments | 25 | — | — |
| 🆕 | codebase.toml.files | 3 | — | — |
| 🆕 | codebase.toml.keys | 48 | — | — |
| 🆕 | codebase.toml.lines | 131 | — | — |
| 🆕 | codebase.toml.tables | 12 | — | — |
| 🆕 | codebase.typescript.decorators | 269 | — | — |
| 🆕 | codebase.typescript.docComments | 1,652 | — | — |
| 🆕 | codebase.typescript.files | 699 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 9 | — | — |
| 🆕 | codebase.typescript.interfaces | 177 | — | — |
| 🆕 | codebase.yaml.comments | 459 | — | — |
| 🆕 | codebase.yaml.documents | 22 | — | — |
| 🆕 | codebase.yaml.files | 22 | — | — |
| 🆕 | codebase.yaml.keys | 1,660 | — | — |
| 🆕 | codebase.yaml.lines | 3,266 | — | — |
| 🆕 | codebase.yaml.mappings | 459 | — | — |
| 🆕 | codebase.yaml.maxDepth | 8 | — | — |
| 🆕 | codebase.yaml.scalars | 3,352 | — | — |
| 🆕 | codebase.yaml.sequences | 90 | — | — |
| 🆕 | codebase.custom.Module Files | 70 | — | — |
| 🆕 | codebase.custom.Service Files | 90 | — | — |
| 🆕 | codebase.custom.Command Files | 50 | — | — |
| 🆕 | codebase.custom.Constants Files | 85 | — | — |
| 🆕 | codebase.custom.Types Files | 76 | — | — |
| 🆕 | codebase.custom.Utilities Files | 10 | — | — |
| 🆕 | codebase.custom.Unit Tests | 204 | — | — |
| 🆕 | codebase.custom.Integration Tests | 5 | — | — |
| 🆕 | codebase.custom.End To End Tests | 7 | — | — |
| 🆕 | codebase.custom.Static Methods | 4 | — | — |
</details>

<details>
<summary>`codependix-agents` — 43 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 19 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.commentLines | 24 | — | — |
| 🆕 | codebase.javascript.comments | 19 | — | — |
| 🆕 | codebase.javascript.constants | 18 | — | — |
| 🆕 | codebase.javascript.externalPackages | 6 | — | — |
| 🆕 | codebase.javascript.functions | 14 | — | — |
| 🆕 | codebase.javascript.imports | 11 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 14 | — | — |
| 🆕 | codebase.javascript.testFiles | 1 | — | — |
| 🆕 | codebase.json.arrays | 7 | — | — |
| 🆕 | codebase.json.booleans | 3 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 17 | — | — |
| 🆕 | codebase.json.lines | 71 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 25 | — | — |
| 🆕 | codebase.json.properties | 51 | — | — |
| 🆕 | codebase.json.strings | 35 | — | — |
| 🆕 | codebase.json.totalNodes | 71 | — | — |
| 🆕 | codebase.linesOfCode | 190 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 1 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 20 | — | — |
| 🆕 | codebase.markdown.files | 9 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 49 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 27 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 481 | — | — |
| 🆕 | codebase.markdown.lines | 1,540 | — | — |
| 🆕 | codebase.markdown.links | 11 | — | — |
| 🆕 | codebase.markdown.listItems | 67 | — | — |
| 🆕 | codebase.markdown.lists | 22 | — | — |
| 🆕 | codebase.markdown.paragraphs | 225 | — | — |
| 🆕 | codebase.markdown.tableRows | 50 | — | — |
| 🆕 | codebase.markdown.tables | 10 | — | — |
| 🆕 | codebase.repositoryBytes | 88,416 | — | — |
| 🆕 | codebase.sourceFiles | 7 | — | — |
| 🆕 | codebase.typescript.docComments | 9 | — | — |
| 🆕 | codebase.typescript.files | 7 | — | — |
| 🆕 | codebase.typescript.interfaces | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 1 | — | — |
</details>

<details>
<summary>`codependix-examples` — 67 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 136 | — | — |
| 🆕 | codebase.folders | 72 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 91 | — | — |
| 🆕 | codebase.javascript.classes | 27 | — | — |
| 🆕 | codebase.javascript.commentLines | 420 | — | — |
| 🆕 | codebase.javascript.comments | 357 | — | — |
| 🆕 | codebase.javascript.constants | 257 | — | — |
| 🆕 | codebase.javascript.exported | 163 | — | — |
| 🆕 | codebase.javascript.externalPackages | 20 | — | — |
| 🆕 | codebase.javascript.functions | 292 | — | — |
| 🆕 | codebase.javascript.imports | 209 | — | — |
| 🆕 | codebase.javascript.methods | 3 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 204 | — | — |
| 🆕 | codebase.javascript.testFiles | 3 | — | — |
| 🆕 | codebase.json.arrays | 30 | — | — |
| 🆕 | codebase.json.booleans | 19 | — | — |
| 🆕 | codebase.json.files | 16 | — | — |
| 🆕 | codebase.json.items | 56 | — | — |
| 🆕 | codebase.json.lines | 292 | — | — |
| 🆕 | codebase.json.maxDepth | 6 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 67 | — | — |
| 🆕 | codebase.json.properties | 172 | — | — |
| 🆕 | codebase.json.strings | 127 | — | — |
| 🆕 | codebase.json.totalNodes | 244 | — | — |
| 🆕 | codebase.linesOfCode | 5,230 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 113 | — | — |
| 🆕 | codebase.markdown.files | 26 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 23 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 157 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 21 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 588 | — | — |
| 🆕 | codebase.markdown.lines | 2,484 | — | — |
| 🆕 | codebase.markdown.links | 102 | — | — |
| 🆕 | codebase.markdown.listItems | 39 | — | — |
| 🆕 | codebase.markdown.lists | 6 | — | — |
| 🆕 | codebase.markdown.paragraphs | 257 | — | — |
| 🆕 | codebase.markdown.tableRows | 81 | — | — |
| 🆕 | codebase.markdown.tables | 9 | — | — |
| 🆕 | codebase.python.files | 15 | — | — |
| 🆕 | codebase.python.classes | 1 | — | — |
| 🆕 | codebase.python.functions | 4 | — | — |
| 🆕 | codebase.python.constants | 9 | — | — |
| 🆕 | codebase.python.imports | 12 | — | — |
| 🆕 | codebase.python.lines | 53 | — | — |
| 🆕 | codebase.python.comments | 1 | — | — |
| 🆕 | codebase.python.commentLines | 1 | — | — |
| 🆕 | codebase.python.docstrings | 4 | — | — |
| 🆕 | codebase.python.docstringLines | 4 | — | — |
| 🆕 | codebase.repositoryBytes | 300,294 | — | — |
| 🆕 | codebase.sourceFiles | 91 | — | — |
| 🆕 | codebase.typescript.decorators | 29 | — | — |
| 🆕 | codebase.typescript.docComments | 275 | — | — |
| 🆕 | codebase.typescript.files | 76 | — | — |
| 🆕 | codebase.typescript.interfaces | 16 | — | — |
| 🆕 | codebase.yaml.documents | 1 | — | — |
| 🆕 | codebase.yaml.files | 1 | — | — |
| 🆕 | codebase.yaml.keys | 3 | — | — |
| 🆕 | codebase.yaml.lines | 4 | — | — |
| 🆕 | codebase.yaml.mappings | 3 | — | — |
| 🆕 | codebase.yaml.maxDepth | 4 | — | — |
| 🆕 | codebase.yaml.scalars | 4 | — | — |
| 🆕 | codebase.custom.Module Files | 27 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Integration Tests | 3 | — | — |
| 🆕 | codebase.custom.Static Methods | 1 | — | — |
</details>

<details>
<summary>`codometer-agents` — 42 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 18 | — | — |
| 🆕 | codebase.folders | 5 | — | — |
| 🆕 | codebase.javascript.commentLines | 24 | — | — |
| 🆕 | codebase.javascript.comments | 19 | — | — |
| 🆕 | codebase.javascript.constants | 18 | — | — |
| 🆕 | codebase.javascript.externalPackages | 6 | — | — |
| 🆕 | codebase.javascript.functions | 14 | — | — |
| 🆕 | codebase.javascript.imports | 11 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 14 | — | — |
| 🆕 | codebase.javascript.testFiles | 1 | — | — |
| 🆕 | codebase.json.arrays | 7 | — | — |
| 🆕 | codebase.json.booleans | 3 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 17 | — | — |
| 🆕 | codebase.json.lines | 71 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 25 | — | — |
| 🆕 | codebase.json.properties | 51 | — | — |
| 🆕 | codebase.json.strings | 35 | — | — |
| 🆕 | codebase.json.totalNodes | 71 | — | — |
| 🆕 | codebase.linesOfCode | 190 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 15 | — | — |
| 🆕 | codebase.markdown.files | 8 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 5 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 30 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 20 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 301 | — | — |
| 🆕 | codebase.markdown.lines | 1,025 | — | — |
| 🆕 | codebase.markdown.links | 9 | — | — |
| 🆕 | codebase.markdown.listItems | 21 | — | — |
| 🆕 | codebase.markdown.lists | 9 | — | — |
| 🆕 | codebase.markdown.paragraphs | 113 | — | — |
| 🆕 | codebase.markdown.tableRows | 40 | — | — |
| 🆕 | codebase.markdown.tables | 7 | — | — |
| 🆕 | codebase.repositoryBytes | 61,997 | — | — |
| 🆕 | codebase.sourceFiles | 7 | — | — |
| 🆕 | codebase.typescript.docComments | 9 | — | — |
| 🆕 | codebase.typescript.files | 7 | — | — |
| 🆕 | codebase.typescript.interfaces | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 1 | — | — |
</details>

<details>
<summary>`codometer-examples` — 144 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 94 | — | — |
| 🆕 | codebase.css.atRules | 1 | — | — |
| 🆕 | codebase.css.comments | 1 | — | — |
| 🆕 | codebase.css.customProperties | 5 | — | — |
| 🆕 | codebase.css.declarations | 8 | — | — |
| 🆕 | codebase.css.files | 1 | — | — |
| 🆕 | codebase.css.lines | 25 | — | — |
| 🆕 | codebase.css.mediaQueries | 1 | — | — |
| 🆕 | codebase.css.rules | 4 | — | — |
| 🆕 | codebase.css.selectors | 5 | — | — |
| 🆕 | codebase.folders | 27 | — | — |
| 🆕 | codebase.hcl.attributes | 10 | — | — |
| 🆕 | codebase.hcl.blocks | 5 | — | — |
| 🆕 | codebase.hcl.comments | 1 | — | — |
| 🆕 | codebase.hcl.files | 1 | — | — |
| 🆕 | codebase.hcl.interpolations | 1 | — | — |
| 🆕 | codebase.hcl.lines | 29 | — | — |
| 🆕 | codebase.hcl.outputs | 1 | — | — |
| 🆕 | codebase.hcl.resources | 2 | — | — |
| 🆕 | codebase.hcl.variables | 2 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 3 | — | — |
| 🆕 | codebase.javascript.classes | 8 | — | — |
| 🆕 | codebase.javascript.commentLines | 547 | — | — |
| 🆕 | codebase.javascript.comments | 269 | — | — |
| 🆕 | codebase.javascript.constants | 175 | — | — |
| 🆕 | codebase.javascript.exported | 40 | — | — |
| 🆕 | codebase.javascript.externalPackages | 10 | — | — |
| 🆕 | codebase.javascript.files | 4 | — | — |
| 🆕 | codebase.javascript.functions | 172 | — | — |
| 🆕 | codebase.javascript.imports | 94 | — | — |
| 🆕 | codebase.javascript.methods | 21 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 190 | — | — |
| 🆕 | codebase.javascript.testFiles | 15 | — | — |
| 🆕 | codebase.json.arrays | 13 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 29 | — | — |
| 🆕 | codebase.json.lines | 119 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.nulls | 1 | — | — |
| 🆕 | codebase.json.numbers | 4 | — | — |
| 🆕 | codebase.json.objects | 31 | — | — |
| 🆕 | codebase.json.properties | 78 | — | — |
| 🆕 | codebase.json.strings | 56 | — | — |
| 🆕 | codebase.json.totalNodes | 111 | — | — |
| 🆕 | codebase.jupyter.cells | 5 | — | — |
| 🆕 | codebase.jupyter.classes | 1 | — | — |
| 🆕 | codebase.jupyter.codeCells | 3 | — | — |
| 🆕 | codebase.jupyter.codeLines | 18 | — | — |
| 🆕 | codebase.jupyter.decorators | 1 | — | — |
| 🆕 | codebase.jupyter.executedCells | 3 | — | — |
| 🆕 | codebase.jupyter.files | 1 | — | — |
| 🆕 | codebase.jupyter.functions | 1 | — | — |
| 🆕 | codebase.jupyter.headings | 2 | — | — |
| 🆕 | codebase.jupyter.imports | 1 | — | — |
| 🆕 | codebase.jupyter.links | 1 | — | — |
| 🆕 | codebase.jupyter.markdownCells | 2 | — | — |
| 🆕 | codebase.jupyter.markdownLines | 8 | — | — |
| 🆕 | codebase.jupyter.maxDepth | 8 | — | — |
| 🆕 | codebase.jupyter.outputs | 2 | — | — |
| 🆕 | codebase.jupyter.properties | 40 | — | — |
| 🆕 | codebase.jupyter.totalNodes | 74 | — | — |
| 🆕 | codebase.linesOfCode | 3,063 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 1 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 50 | — | — |
| 🆕 | codebase.markdown.files | 15 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 13 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 76 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 24 | — | — |
| 🆕 | codebase.markdown.images | 150 | — | — |
| 🆕 | codebase.markdown.inlineCode | 457 | — | — |
| 🆕 | codebase.markdown.lines | 1,692 | — | — |
| 🆕 | codebase.markdown.links | 89 | — | — |
| 🆕 | codebase.markdown.listItems | 54 | — | — |
| 🆕 | codebase.markdown.lists | 13 | — | — |
| 🆕 | codebase.markdown.paragraphs | 198 | — | — |
| 🆕 | codebase.markdown.tableRows | 94 | — | — |
| 🆕 | codebase.markdown.tables | 12 | — | — |
| 🆕 | codebase.markdown.taskListItems | 2 | — | — |
| 🆕 | codebase.markdown.thematicBreaks | 1 | — | — |
| 🆕 | codebase.python.files | 1 | — | — |
| 🆕 | codebase.python.classes | 3 | — | — |
| 🆕 | codebase.python.functions | 4 | — | — |
| 🆕 | codebase.python.constants | 2 | — | — |
| 🆕 | codebase.python.protocols | 1 | — | — |
| 🆕 | codebase.python.imports | 3 | — | — |
| 🆕 | codebase.python.decorators | 2 | — | — |
| 🆕 | codebase.python.lines | 49 | — | — |
| 🆕 | codebase.python.comments | 1 | — | — |
| 🆕 | codebase.python.commentLines | 1 | — | — |
| 🆕 | codebase.python.docstrings | 8 | — | — |
| 🆕 | codebase.python.docstringLines | 8 | — | — |
| 🆕 | codebase.repositoryBytes | 194,158 | — | — |
| 🆕 | codebase.shell.commentLines | 2 | — | — |
| 🆕 | codebase.shell.comments | 2 | — | — |
| 🆕 | codebase.shell.conditionals | 1 | — | — |
| 🆕 | codebase.shell.exports | 1 | — | — |
| 🆕 | codebase.shell.files | 1 | — | — |
| 🆕 | codebase.shell.functions | 2 | — | — |
| 🆕 | codebase.shell.lines | 30 | — | — |
| 🆕 | codebase.shell.loops | 2 | — | — |
| 🆕 | codebase.shell.pipelines | 1 | — | — |
| 🆕 | codebase.shell.shebangs | 1 | — | — |
| 🆕 | codebase.shell.variables | 1 | — | — |
| 🆕 | codebase.sourceFiles | 67 | — | — |
| 🆕 | codebase.sql.comments | 1 | — | — |
| 🆕 | codebase.sql.commonTableExpressions | 1 | — | — |
| 🆕 | codebase.sql.creates | 2 | — | — |
| 🆕 | codebase.sql.deletes | 1 | — | — |
| 🆕 | codebase.sql.files | 1 | — | — |
| 🆕 | codebase.sql.inserts | 1 | — | — |
| 🆕 | codebase.sql.joins | 1 | — | — |
| 🆕 | codebase.sql.lines | 39 | — | — |
| 🆕 | codebase.sql.selects | 2 | — | — |
| 🆕 | codebase.sql.statements | 6 | — | — |
| 🆕 | codebase.sql.updates | 1 | — | — |
| 🆕 | codebase.toml.arrays | 1 | — | — |
| 🆕 | codebase.toml.arrayTables | 2 | — | — |
| 🆕 | codebase.toml.comments | 1 | — | — |
| 🆕 | codebase.toml.files | 1 | — | — |
| 🆕 | codebase.toml.keys | 9 | — | — |
| 🆕 | codebase.toml.lines | 19 | — | — |
| 🆕 | codebase.toml.tables | 2 | — | — |
| 🆕 | codebase.typescript.docComments | 101 | — | — |
| 🆕 | codebase.typescript.enums | 1 | — | — |
| 🆕 | codebase.typescript.files | 62 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 2 | — | — |
| 🆕 | codebase.typescript.interfaces | 9 | — | — |
| 🆕 | codebase.yaml.aliases | 2 | — | — |
| 🆕 | codebase.yaml.anchors | 1 | — | — |
| 🆕 | codebase.yaml.comments | 1 | — | — |
| 🆕 | codebase.yaml.documents | 1 | — | — |
| 🆕 | codebase.yaml.files | 1 | — | — |
| 🆕 | codebase.yaml.keys | 12 | — | — |
| 🆕 | codebase.yaml.lines | 21 | — | — |
| 🆕 | codebase.yaml.mappings | 5 | — | — |
| 🆕 | codebase.yaml.maxDepth | 5 | — | — |
| 🆕 | codebase.yaml.scalars | 20 | — | — |
| 🆕 | codebase.yaml.sequences | 4 | — | — |
| 🆕 | codebase.custom.Service Files | 4 | — | — |
| 🆕 | codebase.custom.Unit Tests | 6 | — | — |
| 🆕 | codebase.custom.Static Methods | 7 | — | — |
| 🆕 | Corpus.files | 27 | — | — |
| 🆕 | Corpus.size | 8.32 kB | — | — |
</details>

<details>
<summary>`coinagerie-agents` — 42 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 20 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.commentLines | 32 | — | — |
| 🆕 | codebase.javascript.comments | 25 | — | — |
| 🆕 | codebase.javascript.constants | 26 | — | — |
| 🆕 | codebase.javascript.externalPackages | 5 | — | — |
| 🆕 | codebase.javascript.functions | 27 | — | — |
| 🆕 | codebase.javascript.imports | 15 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 27 | — | — |
| 🆕 | codebase.javascript.testFiles | 2 | — | — |
| 🆕 | codebase.json.arrays | 7 | — | — |
| 🆕 | codebase.json.booleans | 3 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 17 | — | — |
| 🆕 | codebase.json.lines | 70 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 25 | — | — |
| 🆕 | codebase.json.properties | 50 | — | — |
| 🆕 | codebase.json.strings | 34 | — | — |
| 🆕 | codebase.json.totalNodes | 70 | — | — |
| 🆕 | codebase.linesOfCode | 285 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 13 | — | — |
| 🆕 | codebase.markdown.files | 9 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 36 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 16 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 242 | — | — |
| 🆕 | codebase.markdown.lines | 894 | — | — |
| 🆕 | codebase.markdown.links | 9 | — | — |
| 🆕 | codebase.markdown.listItems | 61 | — | — |
| 🆕 | codebase.markdown.lists | 16 | — | — |
| 🆕 | codebase.markdown.paragraphs | 125 | — | — |
| 🆕 | codebase.markdown.tableRows | 56 | — | — |
| 🆕 | codebase.markdown.tables | 9 | — | — |
| 🆕 | codebase.repositoryBytes | 61,319 | — | — |
| 🆕 | codebase.sourceFiles | 8 | — | — |
| 🆕 | codebase.typescript.docComments | 13 | — | — |
| 🆕 | codebase.typescript.files | 8 | — | — |
| 🆕 | codebase.typescript.interfaces | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 2 | — | — |
</details>

<details>
<summary>`conformetry-agents` — 42 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 21 | — | — |
| 🆕 | codebase.folders | 7 | — | — |
| 🆕 | codebase.javascript.commentLines | 25 | — | — |
| 🆕 | codebase.javascript.comments | 20 | — | — |
| 🆕 | codebase.javascript.constants | 18 | — | — |
| 🆕 | codebase.javascript.externalPackages | 6 | — | — |
| 🆕 | codebase.javascript.functions | 14 | — | — |
| 🆕 | codebase.javascript.imports | 11 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 14 | — | — |
| 🆕 | codebase.javascript.testFiles | 1 | — | — |
| 🆕 | codebase.json.arrays | 7 | — | — |
| 🆕 | codebase.json.booleans | 3 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 17 | — | — |
| 🆕 | codebase.json.lines | 71 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 25 | — | — |
| 🆕 | codebase.json.properties | 51 | — | — |
| 🆕 | codebase.json.strings | 35 | — | — |
| 🆕 | codebase.json.totalNodes | 71 | — | — |
| 🆕 | codebase.linesOfCode | 195 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 17 | — | — |
| 🆕 | codebase.markdown.files | 11 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 8 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 54 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 21 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 271 | — | — |
| 🆕 | codebase.markdown.lines | 1,452 | — | — |
| 🆕 | codebase.markdown.links | 17 | — | — |
| 🆕 | codebase.markdown.listItems | 72 | — | — |
| 🆕 | codebase.markdown.lists | 23 | — | — |
| 🆕 | codebase.markdown.paragraphs | 267 | — | — |
| 🆕 | codebase.markdown.tableRows | 54 | — | — |
| 🆕 | codebase.markdown.tables | 9 | — | — |
| 🆕 | codebase.repositoryBytes | 80,619 | — | — |
| 🆕 | codebase.sourceFiles | 7 | — | — |
| 🆕 | codebase.typescript.docComments | 9 | — | — |
| 🆕 | codebase.typescript.files | 7 | — | — |
| 🆕 | codebase.typescript.interfaces | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 1 | — | — |
</details>

<details>
<summary>`conformetry-examples` — 72 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 115 | — | — |
| 🆕 | codebase.folders | 94 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 2 | — | — |
| 🆕 | codebase.javascript.classes | 17 | — | — |
| 🆕 | codebase.javascript.commentLines | 277 | — | — |
| 🆕 | codebase.javascript.comments | 169 | — | — |
| 🆕 | codebase.javascript.constants | 83 | — | — |
| 🆕 | codebase.javascript.exported | 36 | — | — |
| 🆕 | codebase.javascript.externalPackages | 15 | — | — |
| 🆕 | codebase.javascript.functions | 29 | — | — |
| 🆕 | codebase.javascript.imports | 36 | — | — |
| 🆕 | codebase.javascript.methods | 12 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 39 | — | — |
| 🆕 | codebase.javascript.testFiles | 1 | — | — |
| 🆕 | codebase.javascript.todos | 1 | — | — |
| 🆕 | codebase.json.arrays | 13 | — | — |
| 🆕 | codebase.json.booleans | 25 | — | — |
| 🆕 | codebase.json.files | 9 | — | — |
| 🆕 | codebase.json.items | 34 | — | — |
| 🆕 | codebase.json.lines | 297 | — | — |
| 🆕 | codebase.json.maxDepth | 6 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 70 | — | — |
| 🆕 | codebase.json.properties | 200 | — | — |
| 🆕 | codebase.json.strings | 134 | — | — |
| 🆕 | codebase.json.totalNodes | 243 | — | — |
| 🆕 | codebase.jupyter.cells | 4 | — | — |
| 🆕 | codebase.jupyter.codeCells | 2 | — | — |
| 🆕 | codebase.jupyter.codeLines | 2 | — | — |
| 🆕 | codebase.jupyter.files | 2 | — | — |
| 🆕 | codebase.jupyter.headings | 2 | — | — |
| 🆕 | codebase.jupyter.markdownCells | 2 | — | — |
| 🆕 | codebase.jupyter.markdownLines | 4 | — | — |
| 🆕 | codebase.jupyter.maxDepth | 5 | — | — |
| 🆕 | codebase.jupyter.properties | 24 | — | — |
| 🆕 | codebase.jupyter.totalNodes | 34 | — | — |
| 🆕 | codebase.linesOfCode | 1,221 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 2 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 92 | — | — |
| 🆕 | codebase.markdown.files | 43 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 40 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 102 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 33 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 402 | — | — |
| 🆕 | codebase.markdown.lines | 2,180 | — | — |
| 🆕 | codebase.markdown.links | 103 | — | — |
| 🆕 | codebase.markdown.listItems | 36 | — | — |
| 🆕 | codebase.markdown.lists | 12 | — | — |
| 🆕 | codebase.markdown.paragraphs | 222 | — | — |
| 🆕 | codebase.markdown.tableRows | 142 | — | — |
| 🆕 | codebase.markdown.tables | 18 | — | — |
| 🆕 | codebase.python.files | 1 | — | — |
| 🆕 | codebase.python.functions | 1 | — | — |
| 🆕 | codebase.python.lines | 6 | — | — |
| 🆕 | codebase.python.docstrings | 2 | — | — |
| 🆕 | codebase.python.docstringLines | 2 | — | — |
| 🆕 | codebase.repositoryBytes | 146,799 | — | — |
| 🆕 | codebase.sourceFiles | 53 | — | — |
| 🆕 | codebase.toml.files | 2 | — | — |
| 🆕 | codebase.toml.keys | 2 | — | — |
| 🆕 | codebase.toml.lines | 6 | — | — |
| 🆕 | codebase.toml.tables | 2 | — | — |
| 🆕 | codebase.typescript.decorators | 2 | — | — |
| 🆕 | codebase.typescript.docComments | 69 | — | — |
| 🆕 | codebase.typescript.files | 52 | — | — |
| 🆕 | codebase.typescript.interfaces | 7 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 15 | — | — |
| 🆕 | codebase.custom.Constants Files | 6 | — | — |
| 🆕 | codebase.custom.Types Files | 6 | — | — |
| 🆕 | codebase.custom.Integration Tests | 1 | — | — |
</details>

<details>
<summary>`interface` — 51 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 37 | — | — |
| 🆕 | codebase.folders | 7 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 6 | — | — |
| 🆕 | codebase.javascript.classes | 6 | — | — |
| 🆕 | codebase.javascript.commentLines | 91 | — | — |
| 🆕 | codebase.javascript.comments | 63 | — | — |
| 🆕 | codebase.javascript.constants | 98 | — | — |
| 🆕 | codebase.javascript.exported | 47 | — | — |
| 🆕 | codebase.javascript.externalPackages | 5 | — | — |
| 🆕 | codebase.javascript.functions | 120 | — | — |
| 🆕 | codebase.javascript.imports | 38 | — | — |
| 🆕 | codebase.javascript.methods | 11 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 125 | — | — |
| 🆕 | codebase.javascript.testFiles | 4 | — | — |
| 🆕 | codebase.json.arrays | 14 | — | — |
| 🆕 | codebase.json.booleans | 9 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 37 | — | — |
| 🆕 | codebase.json.lines | 160 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 38 | — | — |
| 🆕 | codebase.json.properties | 102 | — | — |
| 🆕 | codebase.json.strings | 81 | — | — |
| 🆕 | codebase.json.totalNodes | 143 | — | — |
| 🆕 | codebase.linesOfCode | 1,772 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 8 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 12 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 25 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 102 | — | — |
| 🆕 | codebase.markdown.lines | 509 | — | — |
| 🆕 | codebase.markdown.links | 5 | — | — |
| 🆕 | codebase.markdown.listItems | 9 | — | — |
| 🆕 | codebase.markdown.lists | 3 | — | — |
| 🆕 | codebase.markdown.paragraphs | 42 | — | — |
| 🆕 | codebase.markdown.tableRows | 33 | — | — |
| 🆕 | codebase.markdown.tables | 5 | — | — |
| 🆕 | codebase.repositoryBytes | 86,254 | — | — |
| 🆕 | codebase.sourceFiles | 25 | — | — |
| 🆕 | codebase.typescript.decorators | 16 | — | — |
| 🆕 | codebase.typescript.docComments | 54 | — | — |
| 🆕 | codebase.typescript.files | 25 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 35 | — | — |
| 🆕 | codebase.typescript.interfaces | 7 | — | — |
| 🆕 | codebase.custom.Constants Files | 3 | — | — |
| 🆕 | codebase.custom.Types Files | 3 | — | — |
| 🆕 | codebase.custom.Utilities Files | 4 | — | — |
| 🆕 | codebase.custom.Unit Tests | 4 | — | — |
</details>

<details>
<summary>`lexico-db` — 65 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 74 | — | — |
| 🆕 | codebase.folders | 11 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 29 | — | — |
| 🆕 | codebase.javascript.classes | 37 | — | — |
| 🆕 | codebase.javascript.commentLines | 209 | — | — |
| 🆕 | codebase.javascript.comments | 134 | — | — |
| 🆕 | codebase.javascript.constants | 144 | — | — |
| 🆕 | codebase.javascript.exported | 112 | — | — |
| 🆕 | codebase.javascript.externalPackages | 10 | — | — |
| 🆕 | codebase.javascript.functions | 194 | — | — |
| 🆕 | codebase.javascript.imports | 209 | — | — |
| 🆕 | codebase.javascript.methods | 18 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 183 | — | — |
| 🆕 | codebase.javascript.testFiles | 8 | — | — |
| 🆕 | codebase.javascript.todos | 5 | — | — |
| 🆕 | codebase.json.arrays | 10 | — | — |
| 🆕 | codebase.json.booleans | 8 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 31 | — | — |
| 🆕 | codebase.json.lines | 148 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 41 | — | — |
| 🆕 | codebase.json.properties | 99 | — | — |
| 🆕 | codebase.json.strings | 74 | — | — |
| 🆕 | codebase.json.totalNodes | 134 | — | — |
| 🆕 | codebase.linesOfCode | 4,887 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 12 | — | — |
| 🆕 | codebase.markdown.files | 5 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 1 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 12 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 24 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 116 | — | — |
| 🆕 | codebase.markdown.lines | 731 | — | — |
| 🆕 | codebase.markdown.links | 14 | — | — |
| 🆕 | codebase.markdown.listItems | 27 | — | — |
| 🆕 | codebase.markdown.lists | 3 | — | — |
| 🆕 | codebase.markdown.paragraphs | 63 | — | — |
| 🆕 | codebase.markdown.tableRows | 31 | — | — |
| 🆕 | codebase.markdown.tables | 5 | — | — |
| 🆕 | codebase.repositoryBytes | 259,234 | — | — |
| 🆕 | codebase.sourceFiles | 60 | — | — |
| 🆕 | codebase.sql.commonTableExpressions | 37 | — | — |
| 🆕 | codebase.sql.creates | 62 | — | — |
| 🆕 | codebase.sql.deletes | 18 | — | — |
| 🆕 | codebase.sql.files | 4 | — | — |
| 🆕 | codebase.sql.inserts | 31 | — | — |
| 🆕 | codebase.sql.lines | 387 | — | — |
| 🆕 | codebase.sql.statements | 337 | — | — |
| 🆕 | codebase.sql.updates | 17 | — | — |
| 🆕 | codebase.typescript.decorators | 153 | — | — |
| 🆕 | codebase.typescript.docComments | 100 | — | — |
| 🆕 | codebase.typescript.files | 60 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 2 | — | — |
| 🆕 | codebase.typescript.interfaces | 8 | — | — |
| 🆕 | codebase.custom.Module Files | 3 | — | — |
| 🆕 | codebase.custom.Service Files | 3 | — | — |
| 🆕 | codebase.custom.Constants Files | 4 | — | — |
| 🆕 | codebase.custom.Types Files | 3 | — | — |
| 🆕 | codebase.custom.TypeORM Entities | 28 | — | — |
| 🆕 | codebase.custom.Unit Tests | 6 | — | — |
| 🆕 | codebase.custom.Integration Tests | 2 | — | — |
| 🆕 | Compiled JavaScript.files | 44 | — | — |
| 🆕 | Compiled JavaScript.size | 26.34 kB | — | — |
</details>

<details>
<summary>`lexico-web` — 67 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 137 | — | — |
| 🆕 | codebase.css.atRules | 2 | — | — |
| 🆕 | codebase.css.comments | 2 | — | — |
| 🆕 | codebase.css.customProperties | 14 | — | — |
| 🆕 | codebase.css.declarations | 14 | — | — |
| 🆕 | codebase.css.files | 1 | — | — |
| 🆕 | codebase.css.lines | 35 | — | — |
| 🆕 | codebase.css.rules | 3 | — | — |
| 🆕 | codebase.css.selectors | 4 | — | — |
| 🆕 | codebase.folders | 27 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 23 | — | — |
| 🆕 | codebase.javascript.commentLines | 788 | — | — |
| 🆕 | codebase.javascript.comments | 615 | — | — |
| 🆕 | codebase.javascript.constants | 179 | — | — |
| 🆕 | codebase.javascript.exported | 313 | — | — |
| 🆕 | codebase.javascript.externalPackages | 22 | — | — |
| 🆕 | codebase.javascript.files | 2 | — | — |
| 🆕 | codebase.javascript.functions | 290 | — | — |
| 🆕 | codebase.javascript.imports | 290 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 267 | — | — |
| 🆕 | codebase.javascript.testFiles | 24 | — | — |
| 🆕 | codebase.json.arrays | 15 | — | — |
| 🆕 | codebase.json.booleans | 10 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 54 | — | — |
| 🆕 | codebase.json.lines | 205 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 2 | — | — |
| 🆕 | codebase.json.objects | 41 | — | — |
| 🆕 | codebase.json.properties | 135 | — | — |
| 🆕 | codebase.json.strings | 124 | — | — |
| 🆕 | codebase.json.totalNodes | 192 | — | — |
| 🆕 | codebase.linesOfCode | 7,110 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 1 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 33 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 18 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 29 | — | — |
| 🆕 | codebase.markdown.images | 169 | — | — |
| 🆕 | codebase.markdown.inlineCode | 254 | — | — |
| 🆕 | codebase.markdown.lines | 1,068 | — | — |
| 🆕 | codebase.markdown.links | 27 | — | — |
| 🆕 | codebase.markdown.listItems | 39 | — | — |
| 🆕 | codebase.markdown.lists | 5 | — | — |
| 🆕 | codebase.markdown.paragraphs | 99 | — | — |
| 🆕 | codebase.markdown.tableRows | 72 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 312,018 | — | — |
| 🆕 | codebase.sourceFiles | 121 | — | — |
| 🆕 | codebase.typescript.docComments | 302 | — | — |
| 🆕 | codebase.typescript.enums | 2 | — | — |
| 🆕 | codebase.typescript.files | 119 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 17 | — | — |
| 🆕 | codebase.typescript.interfaces | 47 | — | — |
| 🆕 | codebase.custom.Constants Files | 19 | — | — |
| 🆕 | codebase.custom.Types Files | 18 | — | — |
| 🆕 | codebase.custom.Utilities Files | 18 | — | — |
| 🆕 | codebase.custom.Variable JSDoc Budget | 4 | — | — |
| 🆕 | Client entry JavaScript.files | 1 | — | — |
| 🆕 | Client entry JavaScript.size | 186.68 kB | — | — |
| 🆕 | Client route JavaScript.files | 4 | — | — |
| 🆕 | Client route JavaScript.size | 52.00 kB | — | — |
| 🆕 | Client CSS.files | 1 | — | — |
| 🆕 | Client CSS.size | 46.93 kB | — | — |
| 🆕 | Server JavaScript.files | 9 | — | — |
| 🆕 | Server JavaScript.size | 208.10 kB | — | — |
</details>

<details>
<summary>`meanderaw-cli` — 64 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 456 | — | — |
| 🆕 | codebase.folders | 36 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 438 | — | — |
| 🆕 | codebase.javascript.classes | 209 | — | — |
| 🆕 | codebase.javascript.commentLines | 2,779 | — | — |
| 🆕 | codebase.javascript.comments | 1,616 | — | — |
| 🆕 | codebase.javascript.constants | 1,353 | — | — |
| 🆕 | codebase.javascript.exported | 339 | — | — |
| 🆕 | codebase.javascript.externalPackages | 20 | — | — |
| 🆕 | codebase.javascript.functions | 2,388 | — | — |
| 🆕 | codebase.javascript.imports | 2,560 | — | — |
| 🆕 | codebase.javascript.methods | 545 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 2,495 | — | — |
| 🆕 | codebase.javascript.testFiles | 179 | — | — |
| 🆕 | codebase.json.arrays | 15 | — | — |
| 🆕 | codebase.json.booleans | 9 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 41 | — | — |
| 🆕 | codebase.json.lines | 178 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 49 | — | — |
| 🆕 | codebase.json.properties | 117 | — | — |
| 🆕 | codebase.json.strings | 88 | — | — |
| 🆕 | codebase.json.totalNodes | 162 | — | — |
| 🆕 | codebase.linesOfCode | 42,231 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 136 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 1 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 18 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 38 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 1,848 | — | — |
| 🆕 | codebase.markdown.lines | 6,208 | — | — |
| 🆕 | codebase.markdown.links | 32 | — | — |
| 🆕 | codebase.markdown.listItems | 97 | — | — |
| 🆕 | codebase.markdown.lists | 11 | — | — |
| 🆕 | codebase.markdown.paragraphs | 302 | — | — |
| 🆕 | codebase.markdown.tableRows | 408 | — | — |
| 🆕 | codebase.markdown.tables | 9 | — | — |
| 🆕 | codebase.repositoryBytes | 2,188,083 | — | — |
| 🆕 | codebase.sourceFiles | 439 | — | — |
| 🆕 | codebase.sql.commonTableExpressions | 2 | — | — |
| 🆕 | codebase.sql.creates | 7 | — | — |
| 🆕 | codebase.sql.files | 4 | — | — |
| 🆕 | codebase.sql.inserts | 1 | — | — |
| 🆕 | codebase.sql.lines | 107 | — | — |
| 🆕 | codebase.sql.statements | 29 | — | — |
| 🆕 | codebase.typescript.decorators | 480 | — | — |
| 🆕 | codebase.typescript.docComments | 872 | — | — |
| 🆕 | codebase.typescript.files | 439 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 7 | — | — |
| 🆕 | codebase.typescript.interfaces | 50 | — | — |
| 🆕 | codebase.custom.Module Files | 33 | — | — |
| 🆕 | codebase.custom.Service Files | 157 | — | — |
| 🆕 | codebase.custom.Command Files | 1 | — | — |
| 🆕 | codebase.custom.Constants Files | 29 | — | — |
| 🆕 | codebase.custom.Types Files | 20 | — | — |
| 🆕 | codebase.custom.TypeORM Entities | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 167 | — | — |
| 🆕 | codebase.custom.Integration Tests | 11 | — | — |
| 🆕 | codebase.custom.End To End Tests | 1 | — | — |
| 🆕 | Compiled JavaScript.files | 246 | — | — |
| 🆕 | Compiled JavaScript.size | 206.30 kB | — | — |
</details>

<details>
<summary>`observability` — 55 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 32 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 12 | — | — |
| 🆕 | codebase.javascript.classes | 4 | — | — |
| 🆕 | codebase.javascript.commentLines | 175 | — | — |
| 🆕 | codebase.javascript.comments | 125 | — | — |
| 🆕 | codebase.javascript.constants | 84 | — | — |
| 🆕 | codebase.javascript.exported | 16 | — | — |
| 🆕 | codebase.javascript.externalPackages | 7 | — | — |
| 🆕 | codebase.javascript.functions | 91 | — | — |
| 🆕 | codebase.javascript.imports | 39 | — | — |
| 🆕 | codebase.javascript.methods | 22 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 101 | — | — |
| 🆕 | codebase.javascript.testFiles | 4 | — | — |
| 🆕 | codebase.json.arrays | 19 | — | — |
| 🆕 | codebase.json.booleans | 7 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 61 | — | — |
| 🆕 | codebase.json.lines | 193 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 40 | — | — |
| 🆕 | codebase.json.properties | 108 | — | — |
| 🆕 | codebase.json.strings | 106 | — | — |
| 🆕 | codebase.json.totalNodes | 173 | — | — |
| 🆕 | codebase.linesOfCode | 1,540 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 13 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 18 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 27 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 121 | — | — |
| 🆕 | codebase.markdown.lines | 647 | — | — |
| 🆕 | codebase.markdown.links | 7 | — | — |
| 🆕 | codebase.markdown.listItems | 19 | — | — |
| 🆕 | codebase.markdown.lists | 5 | — | — |
| 🆕 | codebase.markdown.paragraphs | 62 | — | — |
| 🆕 | codebase.markdown.tableRows | 30 | — | — |
| 🆕 | codebase.markdown.tables | 8 | — | — |
| 🆕 | codebase.repositoryBytes | 84,701 | — | — |
| 🆕 | codebase.sourceFiles | 20 | — | — |
| 🆕 | codebase.typescript.decorators | 5 | — | — |
| 🆕 | codebase.typescript.docComments | 48 | — | — |
| 🆕 | codebase.typescript.files | 20 | — | — |
| 🆕 | codebase.typescript.interfaces | 6 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Constants Files | 1 | — | — |
| 🆕 | codebase.custom.Types Files | 1 | — | — |
| 🆕 | codebase.custom.Utilities Files | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 4 | — | — |
| 🆕 | codebase.custom.Static Methods | 2 | — | — |
| 🆕 | Compiled JavaScript.files | 7 | — | — |
| 🆕 | Compiled JavaScript.size | 4.69 kB | — | — |
</details>

<details>
<summary>`persistence` — 58 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 100 | — | — |
| 🆕 | codebase.folders | 12 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 272 | — | — |
| 🆕 | codebase.javascript.classes | 36 | — | — |
| 🆕 | codebase.javascript.commentLines | 616 | — | — |
| 🆕 | codebase.javascript.comments | 360 | — | — |
| 🆕 | codebase.javascript.constants | 585 | — | — |
| 🆕 | codebase.javascript.exported | 147 | — | — |
| 🆕 | codebase.javascript.externalPackages | 22 | — | — |
| 🆕 | codebase.javascript.functions | 610 | — | — |
| 🆕 | codebase.javascript.imports | 409 | — | — |
| 🆕 | codebase.javascript.methods | 62 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 400 | — | — |
| 🆕 | codebase.javascript.testFiles | 35 | — | — |
| 🆕 | codebase.json.arrays | 13 | — | — |
| 🆕 | codebase.json.booleans | 9 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 38 | — | — |
| 🆕 | codebase.json.lines | 185 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 42 | — | — |
| 🆕 | codebase.json.properties | 123 | — | — |
| 🆕 | codebase.json.strings | 100 | — | — |
| 🆕 | codebase.json.totalNodes | 165 | — | — |
| 🆕 | codebase.linesOfCode | 9,776 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 20 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 12 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 32 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 475 | — | — |
| 🆕 | codebase.markdown.lines | 1,208 | — | — |
| 🆕 | codebase.markdown.links | 6 | — | — |
| 🆕 | codebase.markdown.listItems | 45 | — | — |
| 🆕 | codebase.markdown.lists | 7 | — | — |
| 🆕 | codebase.markdown.paragraphs | 109 | — | — |
| 🆕 | codebase.markdown.tableRows | 99 | — | — |
| 🆕 | codebase.markdown.tables | 10 | — | — |
| 🆕 | codebase.repositoryBytes | 405,911 | — | — |
| 🆕 | codebase.sourceFiles | 88 | — | — |
| 🆕 | codebase.typescript.decorators | 46 | — | — |
| 🆕 | codebase.typescript.docComments | 280 | — | — |
| 🆕 | codebase.typescript.files | 88 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 7 | — | — |
| 🆕 | codebase.typescript.interfaces | 30 | — | — |
| 🆕 | codebase.custom.Module Files | 8 | — | — |
| 🆕 | codebase.custom.Service Files | 3 | — | — |
| 🆕 | codebase.custom.Command Files | 2 | — | — |
| 🆕 | codebase.custom.Constants Files | 6 | — | — |
| 🆕 | codebase.custom.Types Files | 6 | — | — |
| 🆕 | codebase.custom.Utilities Files | 6 | — | — |
| 🆕 | codebase.custom.TypeORM Entities | 6 | — | — |
| 🆕 | codebase.custom.Unit Tests | 20 | — | — |
| 🆕 | codebase.custom.Integration Tests | 14 | — | — |
| 🆕 | codebase.custom.End To End Tests | 1 | — | — |
| 🆕 | codebase.custom.Static Methods | 1 | — | — |
</details>

<details open>
<summary>`presentation` — 50 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 20 | — | — |
| 🆕 | codebase.css.atRules | 12 | — | — |
| 🆕 | codebase.css.comments | 17 | — | — |
| 🆕 | codebase.css.customProperties | 117 | — | — |
| 🆕 | codebase.css.declarations | 124 | — | — |
| 🆕 | codebase.css.files | 1 | — | — |
| 🆕 | codebase.css.lines | 213 | — | — |
| 🆕 | codebase.css.rules | 9 | — | — |
| 🆕 | codebase.css.selectors | 10 | — | — |
| 🆕 | codebase.folders | 2 | — | — |
| 🆕 | codebase.javascript.commentLines | 61 | — | — |
| 🆕 | codebase.javascript.comments | 25 | — | — |
| 🆕 | codebase.javascript.constants | 2 | — | — |
| 🆕 | codebase.javascript.externalPackages | 6 | — | — |
| 🆕 | codebase.javascript.files | 2 | — | — |
| 🆕 | codebase.javascript.functions | 1 | — | — |
| 🆕 | codebase.javascript.imports | 10 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 1 | — | — |
| 🆕 | codebase.json.arrays | 10 | — | — |
| 🆕 | codebase.json.booleans | 7 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 25 | — | — |
| 🆕 | codebase.json.lines | 161 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 36 | — | — |
| 🆕 | codebase.json.properties | 119 | — | — |
| 🆕 | codebase.json.strings | 94 | — | — |
| 🆕 | codebase.json.totalNodes | 148 | — | — |
| 🆕 | codebase.linesOfCode | 411 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 29 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 23 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 51 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 86 | — | — |
| 🆕 | codebase.markdown.lines | 1,365 | — | — |
| 🆕 | codebase.markdown.links | 30 | — | — |
| 🆕 | codebase.markdown.listItems | 141 | — | — |
| 🆕 | codebase.markdown.lists | 15 | — | — |
| 🆕 | codebase.markdown.paragraphs | 197 | — | — |
| 🆕 | codebase.markdown.tableRows | 16 | — | — |
| 🆕 | codebase.markdown.tables | 3 | — | — |
| 🆕 | codebase.repositoryBytes | 108,282 | — | — |
| 🆕 | codebase.sourceFiles | 9 | — | — |
| 🆕 | codebase.typescript.docComments | 3 | — | — |
| 🆕 | codebase.typescript.files | 7 | — | — |
| 🆕 | Library bundle.files | 1 | — | — |
| ❗ | Library bundle.size | 492.25 kB | — | — |
</details>

<details>
<summary>`testing` — 53 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 74 | — | — |
| 🆕 | codebase.folders | 18 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 56 | — | — |
| 🆕 | codebase.javascript.classes | 7 | — | — |
| 🆕 | codebase.javascript.commentLines | 210 | — | — |
| 🆕 | codebase.javascript.comments | 142 | — | — |
| 🆕 | codebase.javascript.constants | 152 | — | — |
| 🆕 | codebase.javascript.exported | 58 | — | — |
| 🆕 | codebase.javascript.externalPackages | 21 | — | — |
| 🆕 | codebase.javascript.functions | 262 | — | — |
| 🆕 | codebase.javascript.imports | 168 | — | — |
| 🆕 | codebase.javascript.methods | 4 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 210 | — | — |
| 🆕 | codebase.javascript.testFiles | 17 | — | — |
| 🆕 | codebase.json.arrays | 14 | — | — |
| 🆕 | codebase.json.booleans | 9 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 41 | — | — |
| 🆕 | codebase.json.lines | 189 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 41 | — | — |
| 🆕 | codebase.json.properties | 124 | — | — |
| 🆕 | codebase.json.strings | 104 | — | — |
| 🆕 | codebase.json.totalNodes | 169 | — | — |
| 🆕 | codebase.linesOfCode | 2,672 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 27 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 12 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 27 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 467 | — | — |
| 🆕 | codebase.markdown.lines | 888 | — | — |
| 🆕 | codebase.markdown.links | 5 | — | — |
| 🆕 | codebase.markdown.listItems | 24 | — | — |
| 🆕 | codebase.markdown.lists | 3 | — | — |
| 🆕 | codebase.markdown.paragraphs | 73 | — | — |
| 🆕 | codebase.markdown.tableRows | 119 | — | — |
| 🆕 | codebase.markdown.tables | 5 | — | — |
| 🆕 | codebase.repositoryBytes | 145,095 | — | — |
| 🆕 | codebase.sourceFiles | 62 | — | — |
| 🆕 | codebase.typescript.decorators | 5 | — | — |
| 🆕 | codebase.typescript.docComments | 109 | — | — |
| 🆕 | codebase.typescript.files | 62 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 5 | — | — |
| 🆕 | codebase.typescript.interfaces | 13 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 2 | — | — |
| 🆕 | codebase.custom.Constants Files | 6 | — | — |
| 🆕 | codebase.custom.Types Files | 7 | — | — |
| 🆕 | codebase.custom.Utilities Files | 13 | — | — |
| 🆕 | codebase.custom.Unit Tests | 15 | — | — |
</details>

*Updated automatically when you push new commits.*
<!-- codometer-changes:end -->

Signed-off-by: dependabot[bot] <support@github.com>
Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

### 📝 Documentation

* **documentation:** 📝 close commit sub-issues as agents commit and the spec when done ([#2272](https://github.com/organizzolini/codebase/issues/2272)) ([1d81603](https://github.com/organizzolini/codebase/commit/1d816033acb450a8287fd7c8bb2a6d67553f2c2a)), closes [#2271](https://github.com/organizzolini/codebase/issues/2271) [#2270](https://github.com/organizzolini/codebase/issues/2270)
* **documentation:** 📝 require one overlapping scope per commit, not every scope ([#2270](https://github.com/organizzolini/codebase/issues/2270)) ([1173e8a](https://github.com/organizzolini/codebase/commit/1173e8a9fa884bd52c26cc6bd1998e9aba5288b1)), closes [#2269](https://github.com/organizzolini/codebase/issues/2269) [#2036](https://github.com/organizzolini/codebase/issues/2036)

### 🔧 Chores

* **dependencies:** 🔧 bump @graphql-codegen/cli from 7.4.6 to 8.0.0 ([#2258](https://github.com/organizzolini/codebase/issues/2258)) ([7bc29d4](https://github.com/organizzolini/codebase/commit/7bc29d4b551e4478fcc251cd8300441643321404))

## [5.0.0](https://github.com/organizzolini/codebase/compare/v4.0.1...v5.0.0) (2026-11-12)

### ⚠ BREAKING CHANGES

* **dependencies:** GraphQL 14 and 15 are no
longer supported. The <code>graphql</code> peer dependency is now
<code>^16.0.0 || ^17.0.0</code>, so upgrade <code>graphql</code>
to version 16 or 17 before updating to this version.</p>
</li>
<li>
<p><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11075">#11075</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Thanks <a
href="https://github.com/eddeee888"><code>@​eddeee888</code></a>! -
* **dependencies:** Node.js versions below
22.18.0 are no longer supported. Upgrade to Node.js 22.18.0 or later
before updating to this
version.</p>
</li>
<li>
<p><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11075">#11075</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Thanks <a
href="https://github.com/eddeee888"><code>@​eddeee888</code></a>! -
* **dependencies:** A plugin's <code>validate</code>
function now receives an info object as its fourth argument, matching
the <code>plugin</code> function:
<code>validate(schema, documents, config, { outputFile, allPlugins,
pluginContext })</code>. Custom plugins
that export <code>validate</code> and read <code>outputFile</code>,
<code>allPlugins</code> or <code>pluginContext</code> as positional
arguments must destructure them from the fourth argument instead.</p>
<p>Refs <a
href="https://redirect.github.com/dotansimha/graphql-code-generator/issues/11071">#11071</a></p>
</li>
</ul>
<h3>Minor Changes</h3>
<ul>
<li>
<p><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11103">#11103</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/409ffbfda5c56d6f46f0e0a4045c547714df2264"><code>409ffbf</code></a>
Thanks <a
href="https://github.com/jerelmiller"><code>@​jerelmiller</code></a>! -
Add support for graphql v17 fragment
arguments (<code>experimentalFragmentArguments</code>).</p>
<p>To use fragment arguments, set the parser option in the root
<code>config</code>:</p>
<pre lang="ts"><code>const config: CodegenConfig = {
  config: { experimentalFragmentArguments: true }
  // ...
}
</code></pre>
</li>
</ul>
<h3>Patch Changes</h3>
<ul>
<li><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11075">#11075</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Thanks <a
href="https://github.com/eddeee888"><code>@​eddeee888</code></a>! -
dependencies updates:
<ul>
<li>Updated dependency
<a
href="https://www.npmjs.com/package/graphql/v/16.0.0"><code>graphql@^16.0.0
|| ^17.0.0</code> ↗︎</a> (from
<code>^0.8.0 || ^0.9.0 || ^0.10.0 || ^0.11.0 || ^0.12.0 || ^0.13.0 ||
^14.0.0 || ^15.0.0 || ^16.0.0 || ^17.0.0</code>,</li>
</ul>
</li>
</ul>
<!-- raw HTML omitted -->
</blockquote>
<p>... (truncated)</p>
</details>
<details>
<summary>Commits</summary>
<ul>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/e5a5669f4197c6db561956a9b4c47244d4e29b48"><code>e5a5669</code></a>
chore(release): update monorepo packages versions (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/typed-document-node/issues/11085">#11085</a>)</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/409ffbfda5c56d6f46f0e0a4045c547714df2264"><code>409ffbf</code></a>
Add support for GraphQL 17 experimental fragment arguments (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/typed-document-node/issues/11103">#11103</a>)</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Next major feature branch (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/typed-document-node/issues/11075">#11075</a>)</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/7366c63b4fca59951f15d017bb939c5460ba2451"><code>7366c63</code></a>
[typed-document-node] fix: add missing import in string mode with no
document...</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/cbefcf33b7fde93d3a44c337a4edb5f32ab38fdb"><code>cbefcf3</code></a>
Revert &quot;chore: update <a
href="https://github.com/graphql-tools"><code>@​graphql-tools</code></a>
to latest majors and drop Node below 22....</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/1161d66e36bb074809849cca9367213deed9c443"><code>1161d66</code></a>
chore: update <a
href="https://github.com/graphql-tools"><code>@​graphql-tools</code></a>
to latest majors and drop Node below 22.18 and g...</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/e2b32491deba75e8aed34531b94814118a86d987"><code>e2b3249</code></a>
Add inlineReferencedFragmentsInFragmentDocuments option (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/typed-document-node/issues/11060">#11060</a>)</li>
<li>See full diff in <a
href="https://github.com/dotansimha/graphql-code-generator/commits/@graphql-codegen/typed-document-node@8.0.0/packages/plugins/typescript/typed-document-node">compare
view</a></li>
</ul>
</details>
<br />

<!-- codometer-changes:start -->
## ⏲️ Codometer

<details>
<summary>`affirmancy` — 71 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 33 | — | — |
| 🆕 | codebase.folders | 3 | — | — |
| 🆕 | codebase.javascript.imports | 2 | — | — |
| 🆕 | codebase.json.arrays | 1 | — | — |
| 🆕 | codebase.json.booleans | 1 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 4 | — | — |
| 🆕 | codebase.json.lines | 69 | — | — |
| 🆕 | codebase.json.maxDepth | 6 | — | — |
| 🆕 | codebase.json.objects | 34 | — | — |
| 🆕 | codebase.json.properties | 49 | — | — |
| 🆕 | codebase.json.strings | 20 | — | — |
| 🆕 | codebase.json.totalNodes | 56 | — | — |
| 🆕 | codebase.jupyter.cells | 16 | — | — |
| 🆕 | codebase.jupyter.classes | 9 | — | — |
| 🆕 | codebase.jupyter.codeCells | 14 | — | — |
| 🆕 | codebase.jupyter.codeLines | 876 | — | — |
| 🆕 | codebase.jupyter.decorators | 1 | — | — |
| 🆕 | codebase.jupyter.files | 3 | — | — |
| 🆕 | codebase.jupyter.functions | 21 | — | — |
| 🆕 | codebase.jupyter.headings | 2 | — | — |
| 🆕 | codebase.jupyter.imports | 63 | — | — |
| 🆕 | codebase.jupyter.markdownCells | 2 | — | — |
| 🆕 | codebase.jupyter.markdownLines | 7 | — | — |
| 🆕 | codebase.jupyter.maxDepth | 5 | — | — |
| 🆕 | codebase.jupyter.properties | 126 | — | — |
| 🆕 | codebase.jupyter.totalNodes | 1,028 | — | — |
| 🆕 | codebase.linesOfCode | 4,375 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 9 | — | — |
| 🆕 | codebase.markdown.files | 5 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 22 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 16 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 97 | — | — |
| 🆕 | codebase.markdown.lines | 573 | — | — |
| 🆕 | codebase.markdown.links | 6 | — | — |
| 🆕 | codebase.markdown.listItems | 47 | — | — |
| 🆕 | codebase.markdown.lists | 5 | — | — |
| 🆕 | codebase.markdown.paragraphs | 75 | — | — |
| 🆕 | codebase.markdown.tableRows | 35 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.python.files | 15 | — | — |
| 🆕 | codebase.python.classes | 19 | — | — |
| 🆕 | codebase.python.functions | 83 | — | — |
| 🆕 | codebase.python.constants | 121 | — | — |
| 🆕 | codebase.python.imports | 52 | — | — |
| 🆕 | codebase.python.decorators | 74 | — | — |
| 🆕 | codebase.python.lines | 3,485 | — | — |
| 🆕 | codebase.python.comments | 23 | — | — |
| 🆕 | codebase.python.commentLines | 23 | — | — |
| 🆕 | codebase.python.docstrings | 23 | — | — |
| 🆕 | codebase.python.docstringLines | 74 | — | — |
| 🆕 | codebase.repositoryBytes | 246,510 | — | — |
| 🆕 | codebase.sourceFiles | 18 | — | — |
| 🆕 | codebase.toml.arrays | 16 | — | — |
| 🆕 | codebase.toml.comments | 11 | — | — |
| 🆕 | codebase.toml.files | 1 | — | — |
| 🆕 | codebase.toml.keys | 56 | — | — |
| 🆕 | codebase.toml.lines | 96 | — | — |
| 🆕 | codebase.toml.tables | 12 | — | — |
| 🆕 | codebase.typescript.files | 3 | — | — |
| 🆕 | codebase.yaml.comments | 170 | — | — |
| 🆕 | codebase.yaml.documents | 1 | — | — |
| 🆕 | codebase.yaml.files | 1 | — | — |
| 🆕 | codebase.yaml.keys | 97 | — | — |
| 🆕 | codebase.yaml.lines | 361 | — | — |
| 🆕 | codebase.yaml.mappings | 20 | — | — |
| 🆕 | codebase.yaml.maxDepth | 4 | — | — |
| 🆕 | codebase.yaml.scalars | 262 | — | — |
| 🆕 | codebase.yaml.sequences | 5 | — | — |
</details>

<details>
<summary>`caelundas-cli` — 60 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 386 | — | — |
| 🆕 | codebase.folders | 34 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 296 | — | — |
| 🆕 | codebase.javascript.classes | 115 | — | — |
| 🆕 | codebase.javascript.commentLines | 3,022 | — | — |
| 🆕 | codebase.javascript.comments | 1,972 | — | — |
| 🆕 | codebase.javascript.constants | 4,107 | — | — |
| 🆕 | codebase.javascript.exported | 494 | — | — |
| 🆕 | codebase.javascript.externalPackages | 22 | — | — |
| 🆕 | codebase.javascript.functions | 2,670 | — | — |
| 🆕 | codebase.javascript.imports | 2,138 | — | — |
| 🆕 | codebase.javascript.methods | 860 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 3,234 | — | — |
| 🆕 | codebase.javascript.testFiles | 116 | — | — |
| 🆕 | codebase.javascript.todos | 4 | — | — |
| 🆕 | codebase.json.arrays | 91 | — | — |
| 🆕 | codebase.json.booleans | 10 | — | — |
| 🆕 | codebase.json.files | 52 | — | — |
| 🆕 | codebase.json.items | 287 | — | — |
| 🆕 | codebase.json.lines | 2,624 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 555 | — | — |
| 🆕 | codebase.json.objects | 471 | — | — |
| 🆕 | codebase.json.properties | 1,797 | — | — |
| 🆕 | codebase.json.strings | 1,009 | — | — |
| 🆕 | codebase.json.totalNodes | 2,136 | — | — |
| 🆕 | codebase.linesOfCode | 55,863 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 134 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 29 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 50 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 2,966 | — | — |
| 🆕 | codebase.markdown.lines | 5,148 | — | — |
| 🆕 | codebase.markdown.links | 29 | — | — |
| 🆕 | codebase.markdown.listItems | 328 | — | — |
| 🆕 | codebase.markdown.lists | 24 | — | — |
| 🆕 | codebase.markdown.paragraphs | 538 | — | — |
| 🆕 | codebase.markdown.tableRows | 713 | — | — |
| 🆕 | codebase.markdown.tables | 11 | — | — |
| 🆕 | codebase.repositoryBytes | 2,413,980 | — | — |
| 🆕 | codebase.sourceFiles | 325 | — | — |
| 🆕 | codebase.typescript.decorators | 132 | — | — |
| 🆕 | codebase.typescript.docComments | 969 | — | — |
| 🆕 | codebase.typescript.files | 325 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 15 | — | — |
| 🆕 | codebase.typescript.interfaces | 94 | — | — |
| 🆕 | codebase.custom.Module Files | 34 | — | — |
| 🆕 | codebase.custom.Service Files | 74 | — | — |
| 🆕 | codebase.custom.Command Files | 3 | — | — |
| 🆕 | codebase.custom.Constants Files | 39 | — | — |
| 🆕 | codebase.custom.Types Files | 33 | — | — |
| 🆕 | codebase.custom.Utilities Files | 11 | — | — |
| 🆕 | codebase.custom.Unit Tests | 92 | — | — |
| 🆕 | codebase.custom.Integration Tests | 15 | — | — |
| 🆕 | codebase.custom.End To End Tests | 9 | — | — |
| 🆕 | codebase.custom.Static Methods | 20 | — | — |
| 🆕 | Compiled JavaScript.files | 182 | — | — |
| 🆕 | Compiled JavaScript.size | 169.14 kB | — | — |
</details>

<details>
<summary>`caelundas-db` — 62 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 43 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 26 | — | — |
| 🆕 | codebase.javascript.classes | 12 | — | — |
| 🆕 | codebase.javascript.commentLines | 143 | — | — |
| 🆕 | codebase.javascript.comments | 89 | — | — |
| 🆕 | codebase.javascript.constants | 37 | — | — |
| 🆕 | codebase.javascript.exported | 24 | — | — |
| 🆕 | codebase.javascript.externalPackages | 9 | — | — |
| 🆕 | codebase.javascript.functions | 63 | — | — |
| 🆕 | codebase.javascript.imports | 94 | — | — |
| 🆕 | codebase.javascript.methods | 12 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 49 | — | — |
| 🆕 | codebase.javascript.testFiles | 4 | — | — |
| 🆕 | codebase.json.arrays | 13 | — | — |
| 🆕 | codebase.json.booleans | 8 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 38 | — | — |
| 🆕 | codebase.json.lines | 168 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 42 | — | — |
| 🆕 | codebase.json.properties | 108 | — | — |
| 🆕 | codebase.json.strings | 86 | — | — |
| 🆕 | codebase.json.totalNodes | 150 | — | — |
| 🆕 | codebase.linesOfCode | 1,580 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 8 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 14 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 20 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 109 | — | — |
| 🆕 | codebase.markdown.lines | 573 | — | — |
| 🆕 | codebase.markdown.links | 7 | — | — |
| 🆕 | codebase.markdown.listItems | 38 | — | — |
| 🆕 | codebase.markdown.lists | 4 | — | — |
| 🆕 | codebase.markdown.paragraphs | 70 | — | — |
| 🆕 | codebase.markdown.tableRows | 30 | — | — |
| 🆕 | codebase.markdown.tables | 5 | — | — |
| 🆕 | codebase.repositoryBytes | 105,506 | — | — |
| 🆕 | codebase.sourceFiles | 29 | — | — |
| 🆕 | codebase.sql.commonTableExpressions | 6 | — | — |
| 🆕 | codebase.sql.creates | 21 | — | — |
| 🆕 | codebase.sql.deletes | 9 | — | — |
| 🆕 | codebase.sql.files | 2 | — | — |
| 🆕 | codebase.sql.inserts | 3 | — | — |
| 🆕 | codebase.sql.lines | 264 | — | — |
| 🆕 | codebase.sql.selects | 1 | — | — |
| 🆕 | codebase.sql.statements | 74 | — | — |
| 🆕 | codebase.sql.updates | 8 | — | — |
| 🆕 | codebase.typescript.decorators | 96 | — | — |
| 🆕 | codebase.typescript.docComments | 62 | — | — |
| 🆕 | codebase.typescript.files | 29 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Constants Files | 2 | — | — |
| 🆕 | codebase.custom.Types Files | 1 | — | — |
| 🆕 | codebase.custom.Utilities Files | 1 | — | — |
| 🆕 | codebase.custom.TypeORM Entities | 9 | — | — |
| 🆕 | codebase.custom.Unit Tests | 2 | — | — |
| 🆕 | codebase.custom.Integration Tests | 2 | — | — |
</details>

<details>
<summary>`callidescope-agents` — 43 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 18 | — | — |
| 🆕 | codebase.folders | 5 | — | — |
| 🆕 | codebase.javascript.commentLines | 24 | — | — |
| 🆕 | codebase.javascript.comments | 19 | — | — |
| 🆕 | codebase.javascript.constants | 18 | — | — |
| 🆕 | codebase.javascript.externalPackages | 6 | — | — |
| 🆕 | codebase.javascript.functions | 14 | — | — |
| 🆕 | codebase.javascript.imports | 11 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 14 | — | — |
| 🆕 | codebase.javascript.testFiles | 1 | — | — |
| 🆕 | codebase.json.arrays | 7 | — | — |
| 🆕 | codebase.json.booleans | 3 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 17 | — | — |
| 🆕 | codebase.json.lines | 71 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 25 | — | — |
| 🆕 | codebase.json.properties | 51 | — | — |
| 🆕 | codebase.json.strings | 35 | — | — |
| 🆕 | codebase.json.totalNodes | 71 | — | — |
| 🆕 | codebase.linesOfCode | 190 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 1 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 26 | — | — |
| 🆕 | codebase.markdown.files | 8 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 5 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 41 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 35 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 539 | — | — |
| 🆕 | codebase.markdown.lines | 1,717 | — | — |
| 🆕 | codebase.markdown.links | 14 | — | — |
| 🆕 | codebase.markdown.listItems | 62 | — | — |
| 🆕 | codebase.markdown.lists | 20 | — | — |
| 🆕 | codebase.markdown.paragraphs | 247 | — | — |
| 🆕 | codebase.markdown.tableRows | 66 | — | — |
| 🆕 | codebase.markdown.tables | 11 | — | — |
| 🆕 | codebase.repositoryBytes | 107,570 | — | — |
| 🆕 | codebase.sourceFiles | 7 | — | — |
| 🆕 | codebase.typescript.docComments | 9 | — | — |
| 🆕 | codebase.typescript.files | 7 | — | — |
| 🆕 | codebase.typescript.interfaces | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 1 | — | — |
</details>

<details>
<summary>`callidescope-cli` — 57 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 66 | — | — |
| 🆕 | codebase.folders | 8 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 185 | — | — |
| 🆕 | codebase.javascript.classes | 16 | — | — |
| 🆕 | codebase.javascript.commentLines | 600 | — | — |
| 🆕 | codebase.javascript.comments | 471 | — | — |
| 🆕 | codebase.javascript.constants | 282 | — | — |
| 🆕 | codebase.javascript.exported | 58 | — | — |
| 🆕 | codebase.javascript.externalPackages | 19 | — | — |
| 🆕 | codebase.javascript.functions | 371 | — | — |
| 🆕 | codebase.javascript.imports | 282 | — | — |
| 🆕 | codebase.javascript.methods | 100 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 286 | — | — |
| 🆕 | codebase.javascript.testFiles | 13 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 7 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 45 | — | — |
| 🆕 | codebase.json.lines | 191 | — | — |
| 🆕 | codebase.json.maxDepth | 6 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 43 | — | — |
| 🆕 | codebase.json.properties | 121 | — | — |
| 🆕 | codebase.json.strings | 107 | — | — |
| 🆕 | codebase.json.totalNodes | 170 | — | — |
| 🆕 | codebase.linesOfCode | 8,428 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 71 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 107 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 130 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 646 | — | — |
| 🆕 | codebase.markdown.lines | 2,784 | — | — |
| 🆕 | codebase.markdown.links | 53 | — | — |
| 🆕 | codebase.markdown.listItems | 357 | — | — |
| 🆕 | codebase.markdown.lists | 98 | — | — |
| 🆕 | codebase.markdown.paragraphs | 522 | — | — |
| 🆕 | codebase.markdown.tableRows | 147 | — | — |
| 🆕 | codebase.markdown.tables | 13 | — | — |
| 🆕 | codebase.repositoryBytes | 437,701 | — | — |
| 🆕 | codebase.sourceFiles | 52 | — | — |
| 🆕 | codebase.typescript.decorators | 58 | — | — |
| 🆕 | codebase.typescript.docComments | 207 | — | — |
| 🆕 | codebase.typescript.files | 52 | — | — |
| 🆕 | codebase.typescript.interfaces | 12 | — | — |
| 🆕 | codebase.custom.Module Files | 6 | — | — |
| 🆕 | codebase.custom.Service Files | 4 | — | — |
| 🆕 | codebase.custom.Command Files | 4 | — | — |
| 🆕 | codebase.custom.Constants Files | 6 | — | — |
| 🆕 | codebase.custom.Types Files | 5 | — | — |
| 🆕 | codebase.custom.Unit Tests | 11 | — | — |
| 🆕 | codebase.custom.Integration Tests | 1 | — | — |
| 🆕 | codebase.custom.End To End Tests | 1 | — | — |
| 🆕 | codebase.custom.Static Methods | 1 | — | — |
| 🆕 | Compiled JavaScript.files | 3 | — | — |
| 🆕 | Compiled JavaScript.size | 9.79 kB | — | — |
</details>

<details>
<summary>`callidescope-configuration` — 55 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 52 | — | — |
| 🆕 | codebase.folders | 7 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 111 | — | — |
| 🆕 | codebase.javascript.classes | 19 | — | — |
| 🆕 | codebase.javascript.commentLines | 563 | — | — |
| 🆕 | codebase.javascript.comments | 429 | — | — |
| 🆕 | codebase.javascript.constants | 332 | — | — |
| 🆕 | codebase.javascript.exported | 98 | — | — |
| 🆕 | codebase.javascript.externalPackages | 12 | — | — |
| 🆕 | codebase.javascript.functions | 272 | — | — |
| 🆕 | codebase.javascript.imports | 132 | — | — |
| 🆕 | codebase.javascript.methods | 83 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 244 | — | — |
| 🆕 | codebase.javascript.testFiles | 8 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 162 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 100 | — | — |
| 🆕 | codebase.json.strings | 91 | — | — |
| 🆕 | codebase.json.totalNodes | 147 | — | — |
| 🆕 | codebase.linesOfCode | 6,047 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 1 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 29 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 100 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 128 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 512 | — | — |
| 🆕 | codebase.markdown.lines | 1,820 | — | — |
| 🆕 | codebase.markdown.links | 41 | — | — |
| 🆕 | codebase.markdown.listItems | 126 | — | — |
| 🆕 | codebase.markdown.lists | 96 | — | — |
| 🆕 | codebase.markdown.paragraphs | 243 | — | — |
| 🆕 | codebase.markdown.tableRows | 122 | — | — |
| 🆕 | codebase.markdown.tables | 12 | — | — |
| 🆕 | codebase.repositoryBytes | 298,185 | — | — |
| 🆕 | codebase.sourceFiles | 38 | — | — |
| 🆕 | codebase.typescript.decorators | 11 | — | — |
| 🆕 | codebase.typescript.docComments | 243 | — | — |
| 🆕 | codebase.typescript.files | 38 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 1 | — | — |
| 🆕 | codebase.typescript.interfaces | 40 | — | — |
| 🆕 | codebase.custom.Module Files | 5 | — | — |
| 🆕 | codebase.custom.Service Files | 6 | — | — |
| 🆕 | codebase.custom.Constants Files | 4 | — | — |
| 🆕 | codebase.custom.Types Files | 5 | — | — |
| 🆕 | codebase.custom.Unit Tests | 8 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 7.29 kB | — | — |
</details>

<details>
<summary>`callidescope-core` — 53 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 30 | — | — |
| 🆕 | codebase.folders | 4 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 1 | — | — |
| 🆕 | codebase.javascript.classes | 2 | — | — |
| 🆕 | codebase.javascript.commentLines | 70 | — | — |
| 🆕 | codebase.javascript.comments | 54 | — | — |
| 🆕 | codebase.javascript.constants | 2 | — | — |
| 🆕 | codebase.javascript.exported | 26 | — | — |
| 🆕 | codebase.javascript.externalPackages | 5 | — | — |
| 🆕 | codebase.javascript.functions | 7 | — | — |
| 🆕 | codebase.javascript.imports | 19 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 6 | — | — |
| 🆕 | codebase.javascript.testFiles | 2 | — | — |
| 🆕 | codebase.javascript.todos | 2 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 44 | — | — |
| 🆕 | codebase.json.lines | 156 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 93 | — | — |
| 🆕 | codebase.json.strings | 85 | — | — |
| 🆕 | codebase.json.totalNodes | 141 | — | — |
| 🆕 | codebase.linesOfCode | 408 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 16 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 90 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 41 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 89 | — | — |
| 🆕 | codebase.markdown.lines | 904 | — | — |
| 🆕 | codebase.markdown.links | 24 | — | — |
| 🆕 | codebase.markdown.listItems | 36 | — | — |
| 🆕 | codebase.markdown.lists | 16 | — | — |
| 🆕 | codebase.markdown.paragraphs | 150 | — | — |
| 🆕 | codebase.markdown.tableRows | 21 | — | — |
| 🆕 | codebase.markdown.tables | 4 | — | — |
| 🆕 | codebase.repositoryBytes | 54,514 | — | — |
| 🆕 | codebase.sourceFiles | 16 | — | — |
| 🆕 | codebase.typescript.decorators | 2 | — | — |
| 🆕 | codebase.typescript.docComments | 41 | — | — |
| 🆕 | codebase.typescript.files | 16 | — | — |
| 🆕 | codebase.typescript.interfaces | 17 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Constants Files | 1 | — | — |
| 🆕 | codebase.custom.Types Files | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 2 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 0.55 kB | — | — |
</details>

<details>
<summary>`callidescope-examples` — 47 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 76 | — | — |
| 🆕 | codebase.folders | 22 | — | — |
| 🆕 | codebase.javascript.classes | 31 | — | — |
| 🆕 | codebase.javascript.commentLines | 344 | — | — |
| 🆕 | codebase.javascript.comments | 188 | — | — |
| 🆕 | codebase.javascript.constants | 52 | — | — |
| 🆕 | codebase.javascript.exported | 39 | — | — |
| 🆕 | codebase.javascript.externalPackages | 8 | — | — |
| 🆕 | codebase.javascript.functions | 108 | — | — |
| 🆕 | codebase.javascript.imports | 61 | — | — |
| 🆕 | codebase.javascript.methods | 76 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 184 | — | — |
| 🆕 | codebase.javascript.testFiles | 1 | — | — |
| 🆕 | codebase.json.arrays | 1,292 | — | — |
| 🆕 | codebase.json.booleans | 2,318 | — | — |
| 🆕 | codebase.json.files | 5 | — | — |
| 🆕 | codebase.json.items | 1,848 | — | — |
| 🆕 | codebase.json.lines | 18,660 | — | — |
| 🆕 | codebase.json.maxDepth | 11 | — | — |
| 🆕 | codebase.json.numbers | 1,649 | — | — |
| 🆕 | codebase.json.objects | 3,390 | — | — |
| 🆕 | codebase.json.properties | 12,517 | — | — |
| 🆕 | codebase.json.strings | 5,721 | — | — |
| 🆕 | codebase.json.totalNodes | 14,370 | — | — |
| 🆕 | codebase.linesOfCode | 1,950 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 79 | — | — |
| 🆕 | codebase.markdown.files | 25 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 22 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 84 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 50 | — | — |
| 🆕 | codebase.markdown.images | 330 | — | — |
| 🆕 | codebase.markdown.inlineCode | 838 | — | — |
| 🆕 | codebase.markdown.lines | 3,079 | — | — |
| 🆕 | codebase.markdown.links | 192 | — | — |
| 🆕 | codebase.markdown.listItems | 43 | — | — |
| 🆕 | codebase.markdown.lists | 10 | — | — |
| 🆕 | codebase.markdown.paragraphs | 318 | — | — |
| 🆕 | codebase.markdown.tableRows | 258 | — | — |
| 🆕 | codebase.markdown.tables | 33 | — | — |
| 🆕 | codebase.repositoryBytes | 990,614 | — | — |
| 🆕 | codebase.sourceFiles | 46 | — | — |
| 🆕 | codebase.typescript.decorators | 32 | — | — |
| 🆕 | codebase.typescript.docComments | 135 | — | — |
| 🆕 | codebase.typescript.files | 46 | — | — |
| 🆕 | codebase.typescript.interfaces | 4 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Integration Tests | 1 | — | — |
</details>

<details>
<summary>`callidescope-graph` — 54 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 104 | — | — |
| 🆕 | codebase.folders | 12 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 72 | — | — |
| 🆕 | codebase.javascript.classes | 32 | — | — |
| 🆕 | codebase.javascript.commentLines | 782 | — | — |
| 🆕 | codebase.javascript.comments | 571 | — | — |
| 🆕 | codebase.javascript.constants | 758 | — | — |
| 🆕 | codebase.javascript.exported | 124 | — | — |
| 🆕 | codebase.javascript.externalPackages | 12 | — | — |
| 🆕 | codebase.javascript.functions | 515 | — | — |
| 🆕 | codebase.javascript.imports | 442 | — | — |
| 🆕 | codebase.javascript.methods | 186 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 629 | — | — |
| 🆕 | codebase.javascript.testFiles | 22 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 44 | — | — |
| 🆕 | codebase.json.lines | 165 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 38 | — | — |
| 🆕 | codebase.json.properties | 101 | — | — |
| 🆕 | codebase.json.strings | 92 | — | — |
| 🆕 | codebase.json.totalNodes | 149 | — | — |
| 🆕 | codebase.linesOfCode | 11,531 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 20 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 90 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 119 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 490 | — | — |
| 🆕 | codebase.markdown.lines | 1,662 | — | — |
| 🆕 | codebase.markdown.links | 29 | — | — |
| 🆕 | codebase.markdown.listItems | 206 | — | — |
| 🆕 | codebase.markdown.lists | 94 | — | — |
| 🆕 | codebase.markdown.paragraphs | 254 | — | — |
| 🆕 | codebase.markdown.tableRows | 122 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 450,340 | — | — |
| 🆕 | codebase.sourceFiles | 90 | — | — |
| 🆕 | codebase.typescript.decorators | 31 | — | — |
| 🆕 | codebase.typescript.docComments | 307 | — | — |
| 🆕 | codebase.typescript.files | 90 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 1 | — | — |
| 🆕 | codebase.typescript.interfaces | 51 | — | — |
| 🆕 | codebase.custom.Module Files | 9 | — | — |
| 🆕 | codebase.custom.Service Files | 22 | — | — |
| 🆕 | codebase.custom.Constants Files | 12 | — | — |
| 🆕 | codebase.custom.Types Files | 13 | — | — |
| 🆕 | codebase.custom.Unit Tests | 22 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 14.51 kB | — | — |
</details>

<details>
<summary>`callidescope-nx` — 55 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 81 | — | — |
| 🆕 | codebase.folders | 14 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 156 | — | — |
| 🆕 | codebase.javascript.classes | 13 | — | — |
| 🆕 | codebase.javascript.commentLines | 425 | — | — |
| 🆕 | codebase.javascript.comments | 311 | — | — |
| 🆕 | codebase.javascript.constants | 222 | — | — |
| 🆕 | codebase.javascript.exported | 68 | — | — |
| 🆕 | codebase.javascript.externalPackages | 16 | — | — |
| 🆕 | codebase.javascript.functions | 336 | — | — |
| 🆕 | codebase.javascript.imports | 269 | — | — |
| 🆕 | codebase.javascript.methods | 56 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 236 | — | — |
| 🆕 | codebase.javascript.testFiles | 16 | — | — |
| 🆕 | codebase.json.arrays | 19 | — | — |
| 🆕 | codebase.json.booleans | 11 | — | — |
| 🆕 | codebase.json.files | 9 | — | — |
| 🆕 | codebase.json.items | 61 | — | — |
| 🆕 | codebase.json.lines | 347 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 85 | — | — |
| 🆕 | codebase.json.properties | 249 | — | — |
| 🆕 | codebase.json.strings | 203 | — | — |
| 🆕 | codebase.json.totalNodes | 319 | — | — |
| 🆕 | codebase.linesOfCode | 6,422 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 29 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 97 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 129 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 414 | — | — |
| 🆕 | codebase.markdown.lines | 2,212 | — | — |
| 🆕 | codebase.markdown.links | 41 | — | — |
| 🆕 | codebase.markdown.listItems | 431 | — | — |
| 🆕 | codebase.markdown.lists | 100 | — | — |
| 🆕 | codebase.markdown.paragraphs | 516 | — | — |
| 🆕 | codebase.markdown.tableRows | 91 | — | — |
| 🆕 | codebase.markdown.tables | 10 | — | — |
| 🆕 | codebase.repositoryBytes | 334,425 | — | — |
| 🆕 | codebase.sourceFiles | 62 | — | — |
| 🆕 | codebase.typescript.decorators | 13 | — | — |
| 🆕 | codebase.typescript.docComments | 193 | — | — |
| 🆕 | codebase.typescript.files | 62 | — | — |
| 🆕 | codebase.typescript.interfaces | 22 | — | — |
| 🆕 | codebase.custom.Module Files | 7 | — | — |
| 🆕 | codebase.custom.Service Files | 6 | — | — |
| 🆕 | codebase.custom.Constants Files | 6 | — | — |
| 🆕 | codebase.custom.Types Files | 9 | — | — |
| 🆕 | codebase.custom.Utilities Files | 3 | — | — |
| 🆕 | codebase.custom.Unit Tests | 15 | — | — |
| 🆕 | codebase.custom.Integration Tests | 1 | — | — |
| 🆕 | Compiled JavaScript.files | 9 | — | — |
| 🆕 | Compiled JavaScript.size | 10.50 kB | — | — |
</details>

<details>
<summary>`callidescope-output` — 53 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 66 | — | — |
| 🆕 | codebase.folders | 10 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 40 | — | — |
| 🆕 | codebase.javascript.classes | 18 | — | — |
| 🆕 | codebase.javascript.commentLines | 387 | — | — |
| 🆕 | codebase.javascript.comments | 272 | — | — |
| 🆕 | codebase.javascript.constants | 364 | — | — |
| 🆕 | codebase.javascript.exported | 89 | — | — |
| 🆕 | codebase.javascript.externalPackages | 11 | — | — |
| 🆕 | codebase.javascript.functions | 275 | — | — |
| 🆕 | codebase.javascript.imports | 209 | — | — |
| 🆕 | codebase.javascript.methods | 126 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 361 | — | — |
| 🆕 | codebase.javascript.testFiles | 10 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 161 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 99 | — | — |
| 🆕 | codebase.json.strings | 90 | — | — |
| 🆕 | codebase.json.totalNodes | 146 | — | — |
| 🆕 | codebase.linesOfCode | 6,302 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 18 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 90 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 117 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 365 | — | — |
| 🆕 | codebase.markdown.lines | 1,477 | — | — |
| 🆕 | codebase.markdown.links | 25 | — | — |
| 🆕 | codebase.markdown.listItems | 274 | — | — |
| 🆕 | codebase.markdown.lists | 92 | — | — |
| 🆕 | codebase.markdown.paragraphs | 320 | — | — |
| 🆕 | codebase.markdown.tableRows | 94 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 266,402 | — | — |
| 🆕 | codebase.sourceFiles | 52 | — | — |
| 🆕 | codebase.typescript.decorators | 17 | — | — |
| 🆕 | codebase.typescript.docComments | 153 | — | — |
| 🆕 | codebase.typescript.files | 52 | — | — |
| 🆕 | codebase.typescript.interfaces | 25 | — | — |
| 🆕 | codebase.custom.Module Files | 7 | — | — |
| 🆕 | codebase.custom.Service Files | 10 | — | — |
| 🆕 | codebase.custom.Constants Files | 7 | — | — |
| 🆕 | codebase.custom.Types Files | 7 | — | — |
| 🆕 | codebase.custom.Unit Tests | 10 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 9.55 kB | — | — |
</details>

<details>
<summary>`codebase` — 103 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 1,055 | — | — |
| 🆕 | codebase.folders | 173 | — | — |
| 🆕 | codebase.hcl.attributes | 329 | — | — |
| 🆕 | codebase.hcl.blocks | 121 | — | — |
| 🆕 | codebase.hcl.comments | 82 | — | — |
| 🆕 | codebase.hcl.files | 10 | — | — |
| 🆕 | codebase.hcl.interpolations | 10 | — | — |
| 🆕 | codebase.hcl.lines | 852 | — | — |
| 🆕 | codebase.hcl.outputs | 12 | — | — |
| 🆕 | codebase.hcl.resources | 32 | — | — |
| 🆕 | codebase.hcl.variables | 19 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 1,167 | — | — |
| 🆕 | codebase.javascript.classes | 226 | — | — |
| 🆕 | codebase.javascript.commentLines | 4,637 | — | — |
| 🆕 | codebase.javascript.comments | 3,325 | — | — |
| 🆕 | codebase.javascript.constants | 3,479 | — | — |
| 🆕 | codebase.javascript.exported | 959 | — | — |
| 🆕 | codebase.javascript.externalPackages | 62 | — | — |
| 🆕 | codebase.javascript.files | 6 | — | — |
| 🆕 | codebase.javascript.functions | 3,150 | — | — |
| 🆕 | codebase.javascript.imports | 3,167 | — | — |
| 🆕 | codebase.javascript.methods | 985 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 2,968 | — | — |
| 🆕 | codebase.javascript.testFiles | 216 | — | — |
| 🆕 | codebase.javascript.todos | 4 | — | — |
| 🆕 | codebase.json.arrays | 458 | — | — |
| 🆕 | codebase.json.booleans | 210 | — | — |
| 🆕 | codebase.json.files | 56 | — | — |
| 🆕 | codebase.json.items | 1,661 | — | — |
| 🆕 | codebase.json.lines | 8,022 | — | — |
| 🆕 | codebase.json.maxDepth | 11 | — | — |
| 🆕 | codebase.json.numbers | 46 | — | — |
| 🆕 | codebase.json.objects | 1,278 | — | — |
| 🆕 | codebase.json.properties | 3,048 | — | — |
| 🆕 | codebase.json.strings | 2,766 | — | — |
| 🆕 | codebase.json.totalNodes | 4,758 | — | — |
| 🆕 | codebase.linesOfCode | 69,712 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 23 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 597 | — | — |
| 🆕 | codebase.markdown.files | 182 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 143 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 880 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 819 | — | — |
| 🆕 | codebase.markdown.headingLevel4 | 82 | — | — |
| 🆕 | codebase.markdown.images | 1,497 | — | — |
| 🆕 | codebase.markdown.inlineCode | 16,050 | — | — |
| 🆕 | codebase.markdown.lines | 46,114 | — | — |
| 🆕 | codebase.markdown.links | 1,240 | — | — |
| 🆕 | codebase.markdown.listItems | 4,831 | — | — |
| 🆕 | codebase.markdown.lists | 986 | — | — |
| 🆕 | codebase.markdown.paragraphs | 6,787 | — | — |
| 🆕 | codebase.markdown.tableRows | 2,974 | — | — |
| 🆕 | codebase.markdown.tables | 298 | — | — |
| 🆕 | codebase.markdown.taskListItems | 60 | — | — |
| 🆕 | codebase.markdown.thematicBreaks | 50 | — | — |
| 🆕 | codebase.python.files | 1 | — | — |
| 🆕 | codebase.python.lines | 5 | — | — |
| 🆕 | codebase.python.docstrings | 1 | — | — |
| 🆕 | codebase.python.docstringLines | 4 | — | — |
| 🆕 | codebase.repositoryBytes | 7,276,242 | — | — |
| 🆕 | codebase.shell.commentLines | 266 | — | — |
| 🆕 | codebase.shell.comments | 266 | — | — |
| 🆕 | codebase.shell.conditionals | 142 | — | — |
| 🆕 | codebase.shell.exports | 19 | — | — |
| 🆕 | codebase.shell.files | 21 | — | — |
| 🆕 | codebase.shell.functions | 18 | — | — |
| 🆕 | codebase.shell.lines | 1,841 | — | — |
| 🆕 | codebase.shell.loops | 21 | — | — |
| 🆕 | codebase.shell.pipelines | 53 | — | — |
| 🆕 | codebase.shell.shebangs | 22 | — | — |
| 🆕 | codebase.shell.variables | 172 | — | — |
| 🆕 | codebase.sourceFiles | 706 | — | — |
| 🆕 | codebase.toml.arrays | 14 | — | — |
| 🆕 | codebase.toml.arrayTables | 6 | — | — |
| 🆕 | codebase.toml.comments | 25 | — | — |
| 🆕 | codebase.toml.files | 3 | — | — |
| 🆕 | codebase.toml.keys | 48 | — | — |
| 🆕 | codebase.toml.lines | 131 | — | — |
| 🆕 | codebase.toml.tables | 12 | — | — |
| 🆕 | codebase.typescript.decorators | 269 | — | — |
| 🆕 | codebase.typescript.docComments | 1,652 | — | — |
| 🆕 | codebase.typescript.files | 699 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 9 | — | — |
| 🆕 | codebase.typescript.interfaces | 177 | — | — |
| 🆕 | codebase.yaml.comments | 459 | — | — |
| 🆕 | codebase.yaml.documents | 22 | — | — |
| 🆕 | codebase.yaml.files | 22 | — | — |
| 🆕 | codebase.yaml.keys | 1,660 | — | — |
| 🆕 | codebase.yaml.lines | 3,266 | — | — |
| 🆕 | codebase.yaml.mappings | 459 | — | — |
| 🆕 | codebase.yaml.maxDepth | 8 | — | — |
| 🆕 | codebase.yaml.scalars | 3,352 | — | — |
| 🆕 | codebase.yaml.sequences | 90 | — | — |
| 🆕 | codebase.custom.Module Files | 70 | — | — |
| 🆕 | codebase.custom.Service Files | 90 | — | — |
| 🆕 | codebase.custom.Command Files | 50 | — | — |
| 🆕 | codebase.custom.Constants Files | 85 | — | — |
| 🆕 | codebase.custom.Types Files | 76 | — | — |
| 🆕 | codebase.custom.Utilities Files | 10 | — | — |
| 🆕 | codebase.custom.Unit Tests | 204 | — | — |
| 🆕 | codebase.custom.Integration Tests | 5 | — | — |
| 🆕 | codebase.custom.End To End Tests | 7 | — | — |
| 🆕 | codebase.custom.Static Methods | 4 | — | — |
</details>

<details>
<summary>`codependix-agents` — 43 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 19 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.commentLines | 24 | — | — |
| 🆕 | codebase.javascript.comments | 19 | — | — |
| 🆕 | codebase.javascript.constants | 18 | — | — |
| 🆕 | codebase.javascript.externalPackages | 6 | — | — |
| 🆕 | codebase.javascript.functions | 14 | — | — |
| 🆕 | codebase.javascript.imports | 11 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 14 | — | — |
| 🆕 | codebase.javascript.testFiles | 1 | — | — |
| 🆕 | codebase.json.arrays | 7 | — | — |
| 🆕 | codebase.json.booleans | 3 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 17 | — | — |
| 🆕 | codebase.json.lines | 71 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 25 | — | — |
| 🆕 | codebase.json.properties | 51 | — | — |
| 🆕 | codebase.json.strings | 35 | — | — |
| 🆕 | codebase.json.totalNodes | 71 | — | — |
| 🆕 | codebase.linesOfCode | 190 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 1 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 20 | — | — |
| 🆕 | codebase.markdown.files | 9 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 49 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 27 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 481 | — | — |
| 🆕 | codebase.markdown.lines | 1,540 | — | — |
| 🆕 | codebase.markdown.links | 11 | — | — |
| 🆕 | codebase.markdown.listItems | 67 | — | — |
| 🆕 | codebase.markdown.lists | 22 | — | — |
| 🆕 | codebase.markdown.paragraphs | 225 | — | — |
| 🆕 | codebase.markdown.tableRows | 50 | — | — |
| 🆕 | codebase.markdown.tables | 10 | — | — |
| 🆕 | codebase.repositoryBytes | 88,416 | — | — |
| 🆕 | codebase.sourceFiles | 7 | — | — |
| 🆕 | codebase.typescript.docComments | 9 | — | — |
| 🆕 | codebase.typescript.files | 7 | — | — |
| 🆕 | codebase.typescript.interfaces | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 1 | — | — |
</details>

<details>
<summary>`codependix-boundaries` — 54 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 53 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 81 | — | — |
| 🆕 | codebase.javascript.classes | 12 | — | — |
| 🆕 | codebase.javascript.commentLines | 392 | — | — |
| 🆕 | codebase.javascript.comments | 260 | — | — |
| 🆕 | codebase.javascript.constants | 204 | — | — |
| 🆕 | codebase.javascript.exported | 49 | — | — |
| 🆕 | codebase.javascript.externalPackages | 11 | — | — |
| 🆕 | codebase.javascript.functions | 243 | — | — |
| 🆕 | codebase.javascript.imports | 164 | — | — |
| 🆕 | codebase.javascript.methods | 126 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 288 | — | — |
| 🆕 | codebase.javascript.testFiles | 12 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 161 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 99 | — | — |
| 🆕 | codebase.json.strings | 90 | — | — |
| 🆕 | codebase.json.totalNodes | 146 | — | — |
| 🆕 | codebase.linesOfCode | 5,412 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 23 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 95 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 128 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 490 | — | — |
| 🆕 | codebase.markdown.lines | 1,905 | — | — |
| 🆕 | codebase.markdown.links | 43 | — | — |
| 🆕 | codebase.markdown.listItems | 443 | — | — |
| 🆕 | codebase.markdown.lists | 103 | — | — |
| 🆕 | codebase.markdown.paragraphs | 508 | — | — |
| 🆕 | codebase.markdown.tableRows | 123 | — | — |
| 🆕 | codebase.markdown.tables | 9 | — | — |
| 🆕 | codebase.repositoryBytes | 277,670 | — | — |
| 🆕 | codebase.sourceFiles | 40 | — | — |
| 🆕 | codebase.typescript.decorators | 12 | — | — |
| 🆕 | codebase.typescript.docComments | 145 | — | — |
| 🆕 | codebase.typescript.files | 40 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 1 | — | — |
| 🆕 | codebase.typescript.interfaces | 20 | — | — |
| 🆕 | codebase.custom.Module Files | 3 | — | — |
| 🆕 | codebase.custom.Service Files | 9 | — | — |
| 🆕 | codebase.custom.Constants Files | 3 | — | — |
| 🆕 | codebase.custom.Types Files | 3 | — | — |
| 🆕 | codebase.custom.Unit Tests | 12 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 6.08 kB | — | — |
</details>

<details>
<summary>`codependix-cli` — 56 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 46 | — | — |
| 🆕 | codebase.folders | 5 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 100 | — | — |
| 🆕 | codebase.javascript.classes | 6 | — | — |
| 🆕 | codebase.javascript.commentLines | 169 | — | — |
| 🆕 | codebase.javascript.comments | 122 | — | — |
| 🆕 | codebase.javascript.constants | 157 | — | — |
| 🆕 | codebase.javascript.exported | 12 | — | — |
| 🆕 | codebase.javascript.externalPackages | 19 | — | — |
| 🆕 | codebase.javascript.functions | 214 | — | — |
| 🆕 | codebase.javascript.imports | 118 | — | — |
| 🆕 | codebase.javascript.methods | 46 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 160 | — | — |
| 🆕 | codebase.javascript.testFiles | 10 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 7 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 45 | — | — |
| 🆕 | codebase.json.lines | 187 | — | — |
| 🆕 | codebase.json.maxDepth | 6 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 41 | — | — |
| 🆕 | codebase.json.properties | 119 | — | — |
| 🆕 | codebase.json.strings | 107 | — | — |
| 🆕 | codebase.json.totalNodes | 168 | — | — |
| 🆕 | codebase.linesOfCode | 4,059 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 40 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 97 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 137 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 357 | — | — |
| 🆕 | codebase.markdown.lines | 2,014 | — | — |
| 🆕 | codebase.markdown.links | 67 | — | — |
| 🆕 | codebase.markdown.listItems | 368 | — | — |
| 🆕 | codebase.markdown.lists | 105 | — | — |
| 🆕 | codebase.markdown.paragraphs | 452 | — | — |
| 🆕 | codebase.markdown.tableRows | 85 | — | — |
| 🆕 | codebase.markdown.tables | 10 | — | — |
| 🆕 | codebase.repositoryBytes | 226,664 | — | — |
| 🆕 | codebase.sourceFiles | 32 | — | — |
| 🆕 | codebase.typescript.decorators | 39 | — | — |
| 🆕 | codebase.typescript.docComments | 45 | — | — |
| 🆕 | codebase.typescript.files | 32 | — | — |
| 🆕 | codebase.typescript.interfaces | 2 | — | — |
| 🆕 | codebase.custom.Module Files | 3 | — | — |
| 🆕 | codebase.custom.Command Files | 2 | — | — |
| 🆕 | codebase.custom.Constants Files | 3 | — | — |
| 🆕 | codebase.custom.Types Files | 2 | — | — |
| 🆕 | codebase.custom.Unit Tests | 7 | — | — |
| 🆕 | codebase.custom.Integration Tests | 2 | — | — |
| 🆕 | codebase.custom.End To End Tests | 1 | — | — |
| 🆕 | codebase.custom.Static Methods | 1 | — | — |
| 🆕 | Compiled JavaScript.files | 3 | — | — |
| 🆕 | Compiled JavaScript.size | 5.89 kB | — | — |
</details>

<details>
<summary>`codependix-configuration` — 53 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 47 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 70 | — | — |
| 🆕 | codebase.javascript.classes | 12 | — | — |
| 🆕 | codebase.javascript.commentLines | 343 | — | — |
| 🆕 | codebase.javascript.comments | 212 | — | — |
| 🆕 | codebase.javascript.constants | 194 | — | — |
| 🆕 | codebase.javascript.exported | 67 | — | — |
| 🆕 | codebase.javascript.externalPackages | 11 | — | — |
| 🆕 | codebase.javascript.functions | 179 | — | — |
| 🆕 | codebase.javascript.imports | 106 | — | — |
| 🆕 | codebase.javascript.methods | 54 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 163 | — | — |
| 🆕 | codebase.javascript.testFiles | 8 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 161 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 99 | — | — |
| 🆕 | codebase.json.strings | 90 | — | — |
| 🆕 | codebase.json.totalNodes | 146 | — | — |
| 🆕 | codebase.linesOfCode | 3,577 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 16 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 90 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 123 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 214 | — | — |
| 🆕 | codebase.markdown.lines | 1,199 | — | — |
| 🆕 | codebase.markdown.links | 31 | — | — |
| 🆕 | codebase.markdown.listItems | 121 | — | — |
| 🆕 | codebase.markdown.lists | 97 | — | — |
| 🆕 | codebase.markdown.paragraphs | 163 | — | — |
| 🆕 | codebase.markdown.tableRows | 61 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 171,997 | — | — |
| 🆕 | codebase.sourceFiles | 33 | — | — |
| 🆕 | codebase.typescript.decorators | 8 | — | — |
| 🆕 | codebase.typescript.docComments | 148 | — | — |
| 🆕 | codebase.typescript.files | 33 | — | — |
| 🆕 | codebase.typescript.interfaces | 28 | — | — |
| 🆕 | codebase.custom.Module Files | 3 | — | — |
| 🆕 | codebase.custom.Service Files | 5 | — | — |
| 🆕 | codebase.custom.Constants Files | 3 | — | — |
| 🆕 | codebase.custom.Types Files | 4 | — | — |
| 🆕 | codebase.custom.Unit Tests | 8 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 4.72 kB | — | — |
</details>

<details>
<summary>`codependix-core` — 53 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 30 | — | — |
| 🆕 | codebase.folders | 4 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 1 | — | — |
| 🆕 | codebase.javascript.classes | 2 | — | — |
| 🆕 | codebase.javascript.commentLines | 53 | — | — |
| 🆕 | codebase.javascript.comments | 37 | — | — |
| 🆕 | codebase.javascript.constants | 2 | — | — |
| 🆕 | codebase.javascript.exported | 14 | — | — |
| 🆕 | codebase.javascript.externalPackages | 5 | — | — |
| 🆕 | codebase.javascript.functions | 7 | — | — |
| 🆕 | codebase.javascript.imports | 19 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 6 | — | — |
| 🆕 | codebase.javascript.testFiles | 2 | — | — |
| 🆕 | codebase.javascript.todos | 2 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 44 | — | — |
| 🆕 | codebase.json.lines | 156 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 93 | — | — |
| 🆕 | codebase.json.strings | 85 | — | — |
| 🆕 | codebase.json.totalNodes | 141 | — | — |
| 🆕 | codebase.linesOfCode | 277 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 15 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 89 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 42 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 78 | — | — |
| 🆕 | codebase.markdown.lines | 885 | — | — |
| 🆕 | codebase.markdown.links | 25 | — | — |
| 🆕 | codebase.markdown.listItems | 38 | — | — |
| 🆕 | codebase.markdown.lists | 16 | — | — |
| 🆕 | codebase.markdown.paragraphs | 149 | — | — |
| 🆕 | codebase.markdown.tableRows | 21 | — | — |
| 🆕 | codebase.markdown.tables | 4 | — | — |
| 🆕 | codebase.repositoryBytes | 49,801 | — | — |
| 🆕 | codebase.sourceFiles | 16 | — | — |
| 🆕 | codebase.typescript.decorators | 2 | — | — |
| 🆕 | codebase.typescript.docComments | 22 | — | — |
| 🆕 | codebase.typescript.files | 16 | — | — |
| 🆕 | codebase.typescript.interfaces | 8 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Constants Files | 1 | — | — |
| 🆕 | codebase.custom.Types Files | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 2 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 0.55 kB | — | — |
</details>

<details>
<summary>`codependix-examples` — 67 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 136 | — | — |
| 🆕 | codebase.folders | 72 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 91 | — | — |
| 🆕 | codebase.javascript.classes | 27 | — | — |
| 🆕 | codebase.javascript.commentLines | 420 | — | — |
| 🆕 | codebase.javascript.comments | 357 | — | — |
| 🆕 | codebase.javascript.constants | 257 | — | — |
| 🆕 | codebase.javascript.exported | 163 | — | — |
| 🆕 | codebase.javascript.externalPackages | 20 | — | — |
| 🆕 | codebase.javascript.functions | 292 | — | — |
| 🆕 | codebase.javascript.imports | 209 | — | — |
| 🆕 | codebase.javascript.methods | 3 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 204 | — | — |
| 🆕 | codebase.javascript.testFiles | 3 | — | — |
| 🆕 | codebase.json.arrays | 30 | — | — |
| 🆕 | codebase.json.booleans | 19 | — | — |
| 🆕 | codebase.json.files | 16 | — | — |
| 🆕 | codebase.json.items | 56 | — | — |
| 🆕 | codebase.json.lines | 292 | — | — |
| 🆕 | codebase.json.maxDepth | 6 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 67 | — | — |
| 🆕 | codebase.json.properties | 172 | — | — |
| 🆕 | codebase.json.strings | 127 | — | — |
| 🆕 | codebase.json.totalNodes | 244 | — | — |
| 🆕 | codebase.linesOfCode | 5,230 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 113 | — | — |
| 🆕 | codebase.markdown.files | 26 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 23 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 157 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 21 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 588 | — | — |
| 🆕 | codebase.markdown.lines | 2,484 | — | — |
| 🆕 | codebase.markdown.links | 102 | — | — |
| 🆕 | codebase.markdown.listItems | 39 | — | — |
| 🆕 | codebase.markdown.lists | 6 | — | — |
| 🆕 | codebase.markdown.paragraphs | 257 | — | — |
| 🆕 | codebase.markdown.tableRows | 81 | — | — |
| 🆕 | codebase.markdown.tables | 9 | — | — |
| 🆕 | codebase.python.files | 15 | — | — |
| 🆕 | codebase.python.classes | 1 | — | — |
| 🆕 | codebase.python.functions | 4 | — | — |
| 🆕 | codebase.python.constants | 9 | — | — |
| 🆕 | codebase.python.imports | 12 | — | — |
| 🆕 | codebase.python.lines | 53 | — | — |
| 🆕 | codebase.python.comments | 1 | — | — |
| 🆕 | codebase.python.commentLines | 1 | — | — |
| 🆕 | codebase.python.docstrings | 4 | — | — |
| 🆕 | codebase.python.docstringLines | 4 | — | — |
| 🆕 | codebase.repositoryBytes | 300,294 | — | — |
| 🆕 | codebase.sourceFiles | 91 | — | — |
| 🆕 | codebase.typescript.decorators | 29 | — | — |
| 🆕 | codebase.typescript.docComments | 275 | — | — |
| 🆕 | codebase.typescript.files | 76 | — | — |
| 🆕 | codebase.typescript.interfaces | 16 | — | — |
| 🆕 | codebase.yaml.documents | 1 | — | — |
| 🆕 | codebase.yaml.files | 1 | — | — |
| 🆕 | codebase.yaml.keys | 3 | — | — |
| 🆕 | codebase.yaml.lines | 4 | — | — |
| 🆕 | codebase.yaml.mappings | 3 | — | — |
| 🆕 | codebase.yaml.maxDepth | 4 | — | — |
| 🆕 | codebase.yaml.scalars | 4 | — | — |
| 🆕 | codebase.custom.Module Files | 27 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Integration Tests | 3 | — | — |
| 🆕 | codebase.custom.Static Methods | 1 | — | — |
</details>

<details>
<summary>`codependix-file-imports` — 53 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 55 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 36 | — | — |
| 🆕 | codebase.javascript.classes | 12 | — | — |
| 🆕 | codebase.javascript.commentLines | 246 | — | — |
| 🆕 | codebase.javascript.comments | 174 | — | — |
| 🆕 | codebase.javascript.constants | 170 | — | — |
| 🆕 | codebase.javascript.exported | 44 | — | — |
| 🆕 | codebase.javascript.externalPackages | 8 | — | — |
| 🆕 | codebase.javascript.functions | 129 | — | — |
| 🆕 | codebase.javascript.imports | 131 | — | — |
| 🆕 | codebase.javascript.methods | 91 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 184 | — | — |
| 🆕 | codebase.javascript.testFiles | 11 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 159 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 38 | — | — |
| 🆕 | codebase.json.properties | 96 | — | — |
| 🆕 | codebase.json.strings | 86 | — | — |
| 🆕 | codebase.json.totalNodes | 143 | — | — |
| 🆕 | codebase.linesOfCode | 2,759 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 15 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 88 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 42 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 282 | — | — |
| 🆕 | codebase.markdown.lines | 1,032 | — | — |
| 🆕 | codebase.markdown.links | 23 | — | — |
| 🆕 | codebase.markdown.listItems | 40 | — | — |
| 🆕 | codebase.markdown.lists | 16 | — | — |
| 🆕 | codebase.markdown.paragraphs | 149 | — | — |
| 🆕 | codebase.markdown.tableRows | 79 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 154,123 | — | — |
| 🆕 | codebase.sourceFiles | 41 | — | — |
| 🆕 | codebase.typescript.decorators | 11 | — | — |
| 🆕 | codebase.typescript.docComments | 101 | — | — |
| 🆕 | codebase.typescript.files | 41 | — | — |
| 🆕 | codebase.typescript.interfaces | 10 | — | — |
| 🆕 | codebase.custom.Module Files | 3 | — | — |
| 🆕 | codebase.custom.Service Files | 8 | — | — |
| 🆕 | codebase.custom.Constants Files | 4 | — | — |
| 🆕 | codebase.custom.Types Files | 4 | — | — |
| 🆕 | codebase.custom.Unit Tests | 11 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 4.14 kB | — | — |
</details>

<details>
<summary>`codependix-nestjs-modules` — 54 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 45 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 28 | — | — |
| 🆕 | codebase.javascript.classes | 8 | — | — |
| 🆕 | codebase.javascript.commentLines | 159 | — | — |
| 🆕 | codebase.javascript.comments | 107 | — | — |
| 🆕 | codebase.javascript.constants | 93 | — | — |
| 🆕 | codebase.javascript.exported | 29 | — | — |
| 🆕 | codebase.javascript.externalPackages | 10 | — | — |
| 🆕 | codebase.javascript.functions | 94 | — | — |
| 🆕 | codebase.javascript.imports | 75 | — | — |
| 🆕 | codebase.javascript.methods | 55 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 121 | — | — |
| 🆕 | codebase.javascript.testFiles | 7 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 160 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 98 | — | — |
| 🆕 | codebase.json.strings | 89 | — | — |
| 🆕 | codebase.json.totalNodes | 145 | — | — |
| 🆕 | codebase.linesOfCode | 2,043 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 15 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 88 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 46 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 188 | — | — |
| 🆕 | codebase.markdown.lines | 968 | — | — |
| 🆕 | codebase.markdown.links | 29 | — | — |
| 🆕 | codebase.markdown.listItems | 42 | — | — |
| 🆕 | codebase.markdown.lists | 20 | — | — |
| 🆕 | codebase.markdown.paragraphs | 148 | — | — |
| 🆕 | codebase.markdown.tableRows | 52 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 119,874 | — | — |
| 🆕 | codebase.sourceFiles | 31 | — | — |
| 🆕 | codebase.typescript.decorators | 8 | — | — |
| 🆕 | codebase.typescript.docComments | 72 | — | — |
| 🆕 | codebase.typescript.files | 31 | — | — |
| 🆕 | codebase.typescript.interfaces | 9 | — | — |
| 🆕 | codebase.custom.Module Files | 5 | — | — |
| 🆕 | codebase.custom.Service Files | 3 | — | — |
| 🆕 | codebase.custom.Constants Files | 3 | — | — |
| 🆕 | codebase.custom.Types Files | 3 | — | — |
| 🆕 | codebase.custom.Unit Tests | 7 | — | — |
| 🆕 | codebase.custom.Static Methods | 1 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 4.63 kB | — | — |
</details>

<details>
<summary>`codependix-nx` — 54 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 60 | — | — |
| 🆕 | codebase.folders | 8 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 81 | — | — |
| 🆕 | codebase.javascript.classes | 7 | — | — |
| 🆕 | codebase.javascript.commentLines | 336 | — | — |
| 🆕 | codebase.javascript.comments | 239 | — | — |
| 🆕 | codebase.javascript.constants | 234 | — | — |
| 🆕 | codebase.javascript.exported | 69 | — | — |
| 🆕 | codebase.javascript.externalPackages | 16 | — | — |
| 🆕 | codebase.javascript.files | 1 | — | — |
| 🆕 | codebase.javascript.functions | 301 | — | — |
| 🆕 | codebase.javascript.imports | 175 | — | — |
| 🆕 | codebase.javascript.methods | 41 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 261 | — | — |
| 🆕 | codebase.javascript.testFiles | 13 | — | — |
| 🆕 | codebase.json.arrays | 14 | — | — |
| 🆕 | codebase.json.booleans | 8 | — | — |
| 🆕 | codebase.json.files | 6 | — | — |
| 🆕 | codebase.json.items | 48 | — | — |
| 🆕 | codebase.json.lines | 223 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 51 | — | — |
| 🆕 | codebase.json.properties | 145 | — | — |
| 🆕 | codebase.json.strings | 125 | — | — |
| 🆕 | codebase.json.totalNodes | 199 | — | — |
| 🆕 | codebase.linesOfCode | 5,160 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 17 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 83 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 112 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 356 | — | — |
| 🆕 | codebase.markdown.lines | 1,445 | — | — |
| 🆕 | codebase.markdown.links | 46 | — | — |
| 🆕 | codebase.markdown.listItems | 166 | — | — |
| 🆕 | codebase.markdown.lists | 91 | — | — |
| 🆕 | codebase.markdown.paragraphs | 215 | — | — |
| 🆕 | codebase.markdown.tableRows | 70 | — | — |
| 🆕 | codebase.markdown.tables | 7 | — | — |
| 🆕 | codebase.repositoryBytes | 236,026 | — | — |
| 🆕 | codebase.sourceFiles | 44 | — | — |
| 🆕 | codebase.typescript.decorators | 7 | — | — |
| 🆕 | codebase.typescript.docComments | 155 | — | — |
| 🆕 | codebase.typescript.files | 43 | — | — |
| 🆕 | codebase.typescript.interfaces | 20 | — | — |
| 🆕 | codebase.custom.Module Files | 4 | — | — |
| 🆕 | codebase.custom.Service Files | 3 | — | — |
| 🆕 | codebase.custom.Constants Files | 3 | — | — |
| 🆕 | codebase.custom.Types Files | 4 | — | — |
| 🆕 | codebase.custom.Utilities Files | 4 | — | — |
| 🆕 | codebase.custom.Unit Tests | 12 | — | — |
| 🆕 | codebase.custom.Integration Tests | 1 | — | — |
</details>

<details>
<summary>`codependix-nx-projects` — 53 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 37 | — | — |
| 🆕 | codebase.folders | 5 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 11 | — | — |
| 🆕 | codebase.javascript.classes | 5 | — | — |
| 🆕 | codebase.javascript.commentLines | 91 | — | — |
| 🆕 | codebase.javascript.comments | 58 | — | — |
| 🆕 | codebase.javascript.constants | 85 | — | — |
| 🆕 | codebase.javascript.exported | 18 | — | — |
| 🆕 | codebase.javascript.externalPackages | 7 | — | — |
| 🆕 | codebase.javascript.functions | 84 | — | — |
| 🆕 | codebase.javascript.imports | 56 | — | — |
| 🆕 | codebase.javascript.methods | 36 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 109 | — | — |
| 🆕 | codebase.javascript.testFiles | 5 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 157 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 95 | — | — |
| 🆕 | codebase.json.strings | 86 | — | — |
| 🆕 | codebase.json.totalNodes | 142 | — | — |
| 🆕 | codebase.linesOfCode | 1,383 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 15 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 89 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 45 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 149 | — | — |
| 🆕 | codebase.markdown.lines | 940 | — | — |
| 🆕 | codebase.markdown.links | 30 | — | — |
| 🆕 | codebase.markdown.listItems | 39 | — | — |
| 🆕 | codebase.markdown.lists | 19 | — | — |
| 🆕 | codebase.markdown.paragraphs | 147 | — | — |
| 🆕 | codebase.markdown.tableRows | 39 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 92,100 | — | — |
| 🆕 | codebase.sourceFiles | 23 | — | — |
| 🆕 | codebase.typescript.decorators | 4 | — | — |
| 🆕 | codebase.typescript.docComments | 36 | — | — |
| 🆕 | codebase.typescript.files | 23 | — | — |
| 🆕 | codebase.typescript.interfaces | 4 | — | — |
| 🆕 | codebase.custom.Module Files | 2 | — | — |
| 🆕 | codebase.custom.Service Files | 2 | — | — |
| 🆕 | codebase.custom.Constants Files | 2 | — | — |
| 🆕 | codebase.custom.Types Files | 2 | — | — |
| 🆕 | codebase.custom.Unit Tests | 5 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 2.20 kB | — | — |
</details>

<details>
<summary>`codependix-output` — 53 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 77 | — | — |
| 🆕 | codebase.folders | 12 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 91 | — | — |
| 🆕 | codebase.javascript.classes | 19 | — | — |
| 🆕 | codebase.javascript.commentLines | 335 | — | — |
| 🆕 | codebase.javascript.comments | 227 | — | — |
| 🆕 | codebase.javascript.constants | 388 | — | — |
| 🆕 | codebase.javascript.exported | 71 | — | — |
| 🆕 | codebase.javascript.externalPackages | 15 | — | — |
| 🆕 | codebase.javascript.functions | 289 | — | — |
| 🆕 | codebase.javascript.imports | 306 | — | — |
| 🆕 | codebase.javascript.methods | 104 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 302 | — | — |
| 🆕 | codebase.javascript.testFiles | 18 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 165 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 103 | — | — |
| 🆕 | codebase.json.strings | 94 | — | — |
| 🆕 | codebase.json.totalNodes | 150 | — | — |
| 🆕 | codebase.linesOfCode | 7,966 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 17 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 91 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 125 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 399 | — | — |
| 🆕 | codebase.markdown.lines | 1,810 | — | — |
| 🆕 | codebase.markdown.links | 37 | — | — |
| 🆕 | codebase.markdown.listItems | 506 | — | — |
| 🆕 | codebase.markdown.lists | 99 | — | — |
| 🆕 | codebase.markdown.paragraphs | 551 | — | — |
| 🆕 | codebase.markdown.tableRows | 88 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 345,639 | — | — |
| 🆕 | codebase.sourceFiles | 64 | — | — |
| 🆕 | codebase.typescript.decorators | 18 | — | — |
| 🆕 | codebase.typescript.docComments | 142 | — | — |
| 🆕 | codebase.typescript.files | 64 | — | — |
| 🆕 | codebase.typescript.interfaces | 14 | — | — |
| 🆕 | codebase.custom.Module Files | 9 | — | — |
| 🆕 | codebase.custom.Service Files | 9 | — | — |
| 🆕 | codebase.custom.Constants Files | 9 | — | — |
| 🆕 | codebase.custom.Types Files | 9 | — | — |
| 🆕 | codebase.custom.Unit Tests | 18 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 9.66 kB | — | — |
</details>

<details>
<summary>`codometer-agents` — 42 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 18 | — | — |
| 🆕 | codebase.folders | 5 | — | — |
| 🆕 | codebase.javascript.commentLines | 24 | — | — |
| 🆕 | codebase.javascript.comments | 19 | — | — |
| 🆕 | codebase.javascript.constants | 18 | — | — |
| 🆕 | codebase.javascript.externalPackages | 6 | — | — |
| 🆕 | codebase.javascript.functions | 14 | — | — |
| 🆕 | codebase.javascript.imports | 11 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 14 | — | — |
| 🆕 | codebase.javascript.testFiles | 1 | — | — |
| 🆕 | codebase.json.arrays | 7 | — | — |
| 🆕 | codebase.json.booleans | 3 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 17 | — | — |
| 🆕 | codebase.json.lines | 71 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 25 | — | — |
| 🆕 | codebase.json.properties | 51 | — | — |
| 🆕 | codebase.json.strings | 35 | — | — |
| 🆕 | codebase.json.totalNodes | 71 | — | — |
| 🆕 | codebase.linesOfCode | 190 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 15 | — | — |
| 🆕 | codebase.markdown.files | 8 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 5 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 30 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 20 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 301 | — | — |
| 🆕 | codebase.markdown.lines | 1,025 | — | — |
| 🆕 | codebase.markdown.links | 9 | — | — |
| 🆕 | codebase.markdown.listItems | 21 | — | — |
| 🆕 | codebase.markdown.lists | 9 | — | — |
| 🆕 | codebase.markdown.paragraphs | 113 | — | — |
| 🆕 | codebase.markdown.tableRows | 40 | — | — |
| 🆕 | codebase.markdown.tables | 7 | — | — |
| 🆕 | codebase.repositoryBytes | 61,997 | — | — |
| 🆕 | codebase.sourceFiles | 7 | — | — |
| 🆕 | codebase.typescript.docComments | 9 | — | — |
| 🆕 | codebase.typescript.files | 7 | — | — |
| 🆕 | codebase.typescript.interfaces | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 1 | — | — |
</details>

<details>
<summary>`codometer-cli` — 57 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 52 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 82 | — | — |
| 🆕 | codebase.javascript.classes | 8 | — | — |
| 🆕 | codebase.javascript.commentLines | 209 | — | — |
| 🆕 | codebase.javascript.comments | 140 | — | — |
| 🆕 | codebase.javascript.constants | 124 | — | — |
| 🆕 | codebase.javascript.exported | 24 | — | — |
| 🆕 | codebase.javascript.externalPackages | 21 | — | — |
| 🆕 | codebase.javascript.functions | 181 | — | — |
| 🆕 | codebase.javascript.imports | 148 | — | — |
| 🆕 | codebase.javascript.methods | 39 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 138 | — | — |
| 🆕 | codebase.javascript.testFiles | 9 | — | — |
| 🆕 | codebase.json.arrays | 14 | — | — |
| 🆕 | codebase.json.booleans | 7 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 49 | — | — |
| 🆕 | codebase.json.lines | 198 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 44 | — | — |
| 🆕 | codebase.json.properties | 123 | — | — |
| 🆕 | codebase.json.strings | 110 | — | — |
| 🆕 | codebase.json.totalNodes | 176 | — | — |
| 🆕 | codebase.linesOfCode | 3,481 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 47 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 104 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 129 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 357 | — | — |
| 🆕 | codebase.markdown.lines | 2,287 | — | — |
| 🆕 | codebase.markdown.links | 50 | — | — |
| 🆕 | codebase.markdown.listItems | 355 | — | — |
| 🆕 | codebase.markdown.lists | 98 | — | — |
| 🆕 | codebase.markdown.paragraphs | 472 | — | — |
| 🆕 | codebase.markdown.tableRows | 98 | — | — |
| 🆕 | codebase.markdown.tables | 15 | — | — |
| 🆕 | codebase.repositoryBytes | 216,372 | — | — |
| 🆕 | codebase.sourceFiles | 38 | — | — |
| 🆕 | codebase.typescript.decorators | 25 | — | — |
| 🆕 | codebase.typescript.docComments | 69 | — | — |
| 🆕 | codebase.typescript.files | 38 | — | — |
| 🆕 | codebase.typescript.interfaces | 6 | — | — |
| 🆕 | codebase.custom.Module Files | 4 | — | — |
| 🆕 | codebase.custom.Command Files | 3 | — | — |
| 🆕 | codebase.custom.Constants Files | 4 | — | — |
| 🆕 | codebase.custom.Types Files | 3 | — | — |
| 🆕 | codebase.custom.Utilities Files | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 6 | — | — |
| 🆕 | codebase.custom.Integration Tests | 2 | — | — |
| 🆕 | codebase.custom.End To End Tests | 1 | — | — |
| 🆕 | codebase.custom.Static Methods | 1 | — | — |
| 🆕 | Compiled JavaScript.files | 3 | — | — |
| 🆕 | Compiled JavaScript.size | 6.43 kB | — | — |
</details>

<details>
<summary>`codometer-configuration` — 54 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 41 | — | — |
| 🆕 | codebase.folders | 4 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 77 | — | — |
| 🆕 | codebase.javascript.classes | 6 | — | — |
| 🆕 | codebase.javascript.commentLines | 419 | — | — |
| 🆕 | codebase.javascript.comments | 302 | — | — |
| 🆕 | codebase.javascript.constants | 230 | — | — |
| 🆕 | codebase.javascript.exported | 73 | — | — |
| 🆕 | codebase.javascript.externalPackages | 10 | — | — |
| 🆕 | codebase.javascript.functions | 165 | — | — |
| 🆕 | codebase.javascript.imports | 92 | — | — |
| 🆕 | codebase.javascript.methods | 54 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 142 | — | — |
| 🆕 | codebase.javascript.testFiles | 6 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 160 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 98 | — | — |
| 🆕 | codebase.json.strings | 89 | — | — |
| 🆕 | codebase.json.totalNodes | 145 | — | — |
| 🆕 | codebase.linesOfCode | 3,737 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 32 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 98 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 124 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 433 | — | — |
| 🆕 | codebase.markdown.lines | 1,641 | — | — |
| 🆕 | codebase.markdown.links | 28 | — | — |
| 🆕 | codebase.markdown.listItems | 116 | — | — |
| 🆕 | codebase.markdown.lists | 93 | — | — |
| 🆕 | codebase.markdown.paragraphs | 206 | — | — |
| 🆕 | codebase.markdown.tableRows | 101 | — | — |
| 🆕 | codebase.markdown.tables | 12 | — | — |
| 🆕 | codebase.repositoryBytes | 197,817 | — | — |
| 🆕 | codebase.sourceFiles | 27 | — | — |
| 🆕 | codebase.typescript.decorators | 5 | — | — |
| 🆕 | codebase.typescript.docComments | 156 | — | — |
| 🆕 | codebase.typescript.files | 27 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 1 | — | — |
| 🆕 | codebase.typescript.interfaces | 26 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 4 | — | — |
| 🆕 | codebase.custom.Constants Files | 3 | — | — |
| 🆕 | codebase.custom.Types Files | 4 | — | — |
| 🆕 | codebase.custom.Unit Tests | 6 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 5.39 kB | — | — |
</details>

<details>
<summary>`codometer-core` — 53 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 29 | — | — |
| 🆕 | codebase.folders | 4 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 1 | — | — |
| 🆕 | codebase.javascript.classes | 6 | — | — |
| 🆕 | codebase.javascript.commentLines | 103 | — | — |
| 🆕 | codebase.javascript.comments | 64 | — | — |
| 🆕 | codebase.javascript.constants | 9 | — | — |
| 🆕 | codebase.javascript.exported | 36 | — | — |
| 🆕 | codebase.javascript.externalPackages | 5 | — | — |
| 🆕 | codebase.javascript.functions | 8 | — | — |
| 🆕 | codebase.javascript.imports | 20 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 7 | — | — |
| 🆕 | codebase.javascript.testFiles | 2 | — | — |
| 🆕 | codebase.javascript.todos | 2 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 44 | — | — |
| 🆕 | codebase.json.lines | 156 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 93 | — | — |
| 🆕 | codebase.json.strings | 85 | — | — |
| 🆕 | codebase.json.totalNodes | 141 | — | — |
| 🆕 | codebase.linesOfCode | 745 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 15 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 89 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 41 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 79 | — | — |
| 🆕 | codebase.markdown.lines | 896 | — | — |
| 🆕 | codebase.markdown.links | 23 | — | — |
| 🆕 | codebase.markdown.listItems | 38 | — | — |
| 🆕 | codebase.markdown.lists | 15 | — | — |
| 🆕 | codebase.markdown.paragraphs | 151 | — | — |
| 🆕 | codebase.markdown.tableRows | 21 | — | — |
| 🆕 | codebase.markdown.tables | 4 | — | — |
| 🆕 | codebase.repositoryBytes | 61,775 | — | — |
| 🆕 | codebase.sourceFiles | 15 | — | — |
| 🆕 | codebase.typescript.decorators | 2 | — | — |
| 🆕 | codebase.typescript.docComments | 44 | — | — |
| 🆕 | codebase.typescript.files | 15 | — | — |
| 🆕 | codebase.typescript.interfaces | 20 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Constants Files | 1 | — | — |
| 🆕 | codebase.custom.Types Files | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 2 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 1.14 kB | — | — |
</details>

<details>
<summary>`codometer-examples` — 144 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 94 | — | — |
| 🆕 | codebase.css.atRules | 1 | — | — |
| 🆕 | codebase.css.comments | 1 | — | — |
| 🆕 | codebase.css.customProperties | 5 | — | — |
| 🆕 | codebase.css.declarations | 8 | — | — |
| 🆕 | codebase.css.files | 1 | — | — |
| 🆕 | codebase.css.lines | 25 | — | — |
| 🆕 | codebase.css.mediaQueries | 1 | — | — |
| 🆕 | codebase.css.rules | 4 | — | — |
| 🆕 | codebase.css.selectors | 5 | — | — |
| 🆕 | codebase.folders | 27 | — | — |
| 🆕 | codebase.hcl.attributes | 10 | — | — |
| 🆕 | codebase.hcl.blocks | 5 | — | — |
| 🆕 | codebase.hcl.comments | 1 | — | — |
| 🆕 | codebase.hcl.files | 1 | — | — |
| 🆕 | codebase.hcl.interpolations | 1 | — | — |
| 🆕 | codebase.hcl.lines | 29 | — | — |
| 🆕 | codebase.hcl.outputs | 1 | — | — |
| 🆕 | codebase.hcl.resources | 2 | — | — |
| 🆕 | codebase.hcl.variables | 2 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 3 | — | — |
| 🆕 | codebase.javascript.classes | 8 | — | — |
| 🆕 | codebase.javascript.commentLines | 547 | — | — |
| 🆕 | codebase.javascript.comments | 269 | — | — |
| 🆕 | codebase.javascript.constants | 175 | — | — |
| 🆕 | codebase.javascript.exported | 40 | — | — |
| 🆕 | codebase.javascript.externalPackages | 10 | — | — |
| 🆕 | codebase.javascript.files | 4 | — | — |
| 🆕 | codebase.javascript.functions | 172 | — | — |
| 🆕 | codebase.javascript.imports | 94 | — | — |
| 🆕 | codebase.javascript.methods | 21 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 190 | — | — |
| 🆕 | codebase.javascript.testFiles | 15 | — | — |
| 🆕 | codebase.json.arrays | 13 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 29 | — | — |
| 🆕 | codebase.json.lines | 119 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.nulls | 1 | — | — |
| 🆕 | codebase.json.numbers | 4 | — | — |
| 🆕 | codebase.json.objects | 31 | — | — |
| 🆕 | codebase.json.properties | 78 | — | — |
| 🆕 | codebase.json.strings | 56 | — | — |
| 🆕 | codebase.json.totalNodes | 111 | — | — |
| 🆕 | codebase.jupyter.cells | 5 | — | — |
| 🆕 | codebase.jupyter.classes | 1 | — | — |
| 🆕 | codebase.jupyter.codeCells | 3 | — | — |
| 🆕 | codebase.jupyter.codeLines | 18 | — | — |
| 🆕 | codebase.jupyter.decorators | 1 | — | — |
| 🆕 | codebase.jupyter.executedCells | 3 | — | — |
| 🆕 | codebase.jupyter.files | 1 | — | — |
| 🆕 | codebase.jupyter.functions | 1 | — | — |
| 🆕 | codebase.jupyter.headings | 2 | — | — |
| 🆕 | codebase.jupyter.imports | 1 | — | — |
| 🆕 | codebase.jupyter.links | 1 | — | — |
| 🆕 | codebase.jupyter.markdownCells | 2 | — | — |
| 🆕 | codebase.jupyter.markdownLines | 8 | — | — |
| 🆕 | codebase.jupyter.maxDepth | 8 | — | — |
| 🆕 | codebase.jupyter.outputs | 2 | — | — |
| 🆕 | codebase.jupyter.properties | 40 | — | — |
| 🆕 | codebase.jupyter.totalNodes | 74 | — | — |
| 🆕 | codebase.linesOfCode | 3,063 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 1 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 50 | — | — |
| 🆕 | codebase.markdown.files | 15 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 13 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 76 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 24 | — | — |
| 🆕 | codebase.markdown.images | 150 | — | — |
| 🆕 | codebase.markdown.inlineCode | 457 | — | — |
| 🆕 | codebase.markdown.lines | 1,692 | — | — |
| 🆕 | codebase.markdown.links | 89 | — | — |
| 🆕 | codebase.markdown.listItems | 54 | — | — |
| 🆕 | codebase.markdown.lists | 13 | — | — |
| 🆕 | codebase.markdown.paragraphs | 198 | — | — |
| 🆕 | codebase.markdown.tableRows | 94 | — | — |
| 🆕 | codebase.markdown.tables | 12 | — | — |
| 🆕 | codebase.markdown.taskListItems | 2 | — | — |
| 🆕 | codebase.markdown.thematicBreaks | 1 | — | — |
| 🆕 | codebase.python.files | 1 | — | — |
| 🆕 | codebase.python.classes | 3 | — | — |
| 🆕 | codebase.python.functions | 4 | — | — |
| 🆕 | codebase.python.constants | 2 | — | — |
| 🆕 | codebase.python.protocols | 1 | — | — |
| 🆕 | codebase.python.imports | 3 | — | — |
| 🆕 | codebase.python.decorators | 2 | — | — |
| 🆕 | codebase.python.lines | 49 | — | — |
| 🆕 | codebase.python.comments | 1 | — | — |
| 🆕 | codebase.python.commentLines | 1 | — | — |
| 🆕 | codebase.python.docstrings | 8 | — | — |
| 🆕 | codebase.python.docstringLines | 8 | — | — |
| 🆕 | codebase.repositoryBytes | 194,158 | — | — |
| 🆕 | codebase.shell.commentLines | 2 | — | — |
| 🆕 | codebase.shell.comments | 2 | — | — |
| 🆕 | codebase.shell.conditionals | 1 | — | — |
| 🆕 | codebase.shell.exports | 1 | — | — |
| 🆕 | codebase.shell.files | 1 | — | — |
| 🆕 | codebase.shell.functions | 2 | — | — |
| 🆕 | codebase.shell.lines | 30 | — | — |
| 🆕 | codebase.shell.loops | 2 | — | — |
| 🆕 | codebase.shell.pipelines | 1 | — | — |
| 🆕 | codebase.shell.shebangs | 1 | — | — |
| 🆕 | codebase.shell.variables | 1 | — | — |
| 🆕 | codebase.sourceFiles | 67 | — | — |
| 🆕 | codebase.sql.comments | 1 | — | — |
| 🆕 | codebase.sql.commonTableExpressions | 1 | — | — |
| 🆕 | codebase.sql.creates | 2 | — | — |
| 🆕 | codebase.sql.deletes | 1 | — | — |
| 🆕 | codebase.sql.files | 1 | — | — |
| 🆕 | codebase.sql.inserts | 1 | — | — |
| 🆕 | codebase.sql.joins | 1 | — | — |
| 🆕 | codebase.sql.lines | 39 | — | — |
| 🆕 | codebase.sql.selects | 2 | — | — |
| 🆕 | codebase.sql.statements | 6 | — | — |
| 🆕 | codebase.sql.updates | 1 | — | — |
| 🆕 | codebase.toml.arrays | 1 | — | — |
| 🆕 | codebase.toml.arrayTables | 2 | — | — |
| 🆕 | codebase.toml.comments | 1 | — | — |
| 🆕 | codebase.toml.files | 1 | — | — |
| 🆕 | codebase.toml.keys | 9 | — | — |
| 🆕 | codebase.toml.lines | 19 | — | — |
| 🆕 | codebase.toml.tables | 2 | — | — |
| 🆕 | codebase.typescript.docComments | 101 | — | — |
| 🆕 | codebase.typescript.enums | 1 | — | — |
| 🆕 | codebase.typescript.files | 62 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 2 | — | — |
| 🆕 | codebase.typescript.interfaces | 9 | — | — |
| 🆕 | codebase.yaml.aliases | 2 | — | — |
| 🆕 | codebase.yaml.anchors | 1 | — | — |
| 🆕 | codebase.yaml.comments | 1 | — | — |
| 🆕 | codebase.yaml.documents | 1 | — | — |
| 🆕 | codebase.yaml.files | 1 | — | — |
| 🆕 | codebase.yaml.keys | 12 | — | — |
| 🆕 | codebase.yaml.lines | 21 | — | — |
| 🆕 | codebase.yaml.mappings | 5 | — | — |
| 🆕 | codebase.yaml.maxDepth | 5 | — | — |
| 🆕 | codebase.yaml.scalars | 20 | — | — |
| 🆕 | codebase.yaml.sequences | 4 | — | — |
| 🆕 | codebase.custom.Service Files | 4 | — | — |
| 🆕 | codebase.custom.Unit Tests | 6 | — | — |
| 🆕 | codebase.custom.Static Methods | 7 | — | — |
| 🆕 | Corpus.files | 27 | — | — |
| 🆕 | Corpus.size | 8.32 kB | — | — |
</details>

<details>
<summary>`codometer-languages` — 63 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 118 | — | — |
| 🆕 | codebase.folders | 16 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 54 | — | — |
| 🆕 | codebase.javascript.classes | 34 | — | — |
| 🆕 | codebase.javascript.commentLines | 679 | — | — |
| 🆕 | codebase.javascript.comments | 550 | — | — |
| 🆕 | codebase.javascript.constants | 587 | — | — |
| 🆕 | codebase.javascript.exported | 125 | — | — |
| 🆕 | codebase.javascript.externalPackages | 21 | — | — |
| 🆕 | codebase.javascript.functions | 365 | — | — |
| 🆕 | codebase.javascript.imports | 495 | — | — |
| 🆕 | codebase.javascript.methods | 186 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 497 | — | — |
| 🆕 | codebase.javascript.testFiles | 34 | — | — |
| 🆕 | codebase.javascript.todos | 3 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 44 | — | — |
| 🆕 | codebase.json.lines | 170 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 107 | — | — |
| 🆕 | codebase.json.strings | 99 | — | — |
| 🆕 | codebase.json.totalNodes | 155 | — | — |
| 🆕 | codebase.linesOfCode | 10,056 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 32 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 88 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 119 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 506 | — | — |
| 🆕 | codebase.markdown.lines | 1,784 | — | — |
| 🆕 | codebase.markdown.links | 26 | — | — |
| 🆕 | codebase.markdown.listItems | 195 | — | — |
| 🆕 | codebase.markdown.lists | 93 | — | — |
| 🆕 | codebase.markdown.paragraphs | 254 | — | — |
| 🆕 | codebase.markdown.tableRows | 129 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.python.files | 1 | — | — |
| 🆕 | codebase.python.functions | 4 | — | — |
| 🆕 | codebase.python.constants | 1 | — | — |
| 🆕 | codebase.python.imports | 7 | — | — |
| 🆕 | codebase.python.lines | 118 | — | — |
| 🆕 | codebase.python.comments | 1 | — | — |
| 🆕 | codebase.python.commentLines | 1 | — | — |
| 🆕 | codebase.python.docstrings | 3 | — | — |
| 🆕 | codebase.python.docstringLines | 19 | — | — |
| 🆕 | codebase.repositoryBytes | 399,871 | — | — |
| 🆕 | codebase.sourceFiles | 105 | — | — |
| 🆕 | codebase.typescript.decorators | 34 | — | — |
| 🆕 | codebase.typescript.docComments | 271 | — | — |
| 🆕 | codebase.typescript.files | 104 | — | — |
| 🆕 | codebase.typescript.interfaces | 45 | — | — |
| 🆕 | codebase.custom.Module Files | 13 | — | — |
| 🆕 | codebase.custom.Service Files | 21 | — | — |
| 🆕 | codebase.custom.Constants Files | 14 | — | — |
| 🆕 | codebase.custom.Types Files | 13 | — | — |
| 🆕 | codebase.custom.Unit Tests | 34 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 13.51 kB | — | — |
</details>

<details>
<summary>`codometer-measurement` — 54 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 68 | — | — |
| 🆕 | codebase.folders | 9 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 22 | — | — |
| 🆕 | codebase.javascript.classes | 18 | — | — |
| 🆕 | codebase.javascript.commentLines | 485 | — | — |
| 🆕 | codebase.javascript.comments | 352 | — | — |
| 🆕 | codebase.javascript.constants | 232 | — | — |
| 🆕 | codebase.javascript.exported | 80 | — | — |
| 🆕 | codebase.javascript.externalPackages | 13 | — | — |
| 🆕 | codebase.javascript.functions | 221 | — | — |
| 🆕 | codebase.javascript.imports | 228 | — | — |
| 🆕 | codebase.javascript.methods | 94 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 293 | — | — |
| 🆕 | codebase.javascript.testFiles | 14 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 162 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 100 | — | — |
| 🆕 | codebase.json.strings | 91 | — | — |
| 🆕 | codebase.json.totalNodes | 147 | — | — |
| 🆕 | codebase.linesOfCode | 5,758 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 15 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 89 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 117 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 278 | — | — |
| 🆕 | codebase.markdown.lines | 1,441 | — | — |
| 🆕 | codebase.markdown.links | 23 | — | — |
| 🆕 | codebase.markdown.listItems | 272 | — | — |
| 🆕 | codebase.markdown.lists | 91 | — | — |
| 🆕 | codebase.markdown.paragraphs | 317 | — | — |
| 🆕 | codebase.markdown.tableRows | 70 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 242,103 | — | — |
| 🆕 | codebase.sourceFiles | 54 | — | — |
| 🆕 | codebase.typescript.decorators | 14 | — | — |
| 🆕 | codebase.typescript.docComments | 190 | — | — |
| 🆕 | codebase.typescript.files | 54 | — | — |
| 🆕 | codebase.typescript.interfaces | 29 | — | — |
| 🆕 | codebase.custom.Module Files | 6 | — | — |
| 🆕 | codebase.custom.Service Files | 8 | — | — |
| 🆕 | codebase.custom.Constants Files | 6 | — | — |
| 🆕 | codebase.custom.Types Files | 7 | — | — |
| 🆕 | codebase.custom.Unit Tests | 10 | — | — |
| 🆕 | codebase.custom.Integration Tests | 4 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 8.88 kB | — | — |
</details>

<details>
<summary>`codometer-output` — 56 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 79 | — | — |
| 🆕 | codebase.folders | 12 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 40 | — | — |
| 🆕 | codebase.javascript.classes | 20 | — | — |
| 🆕 | codebase.javascript.commentLines | 464 | — | — |
| 🆕 | codebase.javascript.comments | 357 | — | — |
| 🆕 | codebase.javascript.constants | 363 | — | — |
| 🆕 | codebase.javascript.exported | 106 | — | — |
| 🆕 | codebase.javascript.externalPackages | 12 | — | — |
| 🆕 | codebase.javascript.functions | 319 | — | — |
| 🆕 | codebase.javascript.imports | 225 | — | — |
| 🆕 | codebase.javascript.methods | 123 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 402 | — | — |
| 🆕 | codebase.javascript.testFiles | 17 | — | — |
| 🆕 | codebase.javascript.todos | 1 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 162 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 100 | — | — |
| 🆕 | codebase.json.strings | 91 | — | — |
| 🆕 | codebase.json.totalNodes | 147 | — | — |
| 🆕 | codebase.linesOfCode | 7,352 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 17 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 88 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 119 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 458 | — | — |
| 🆕 | codebase.markdown.lines | 1,472 | — | — |
| 🆕 | codebase.markdown.links | 25 | — | — |
| 🆕 | codebase.markdown.listItems | 274 | — | — |
| 🆕 | codebase.markdown.lists | 93 | — | — |
| 🆕 | codebase.markdown.paragraphs | 318 | — | — |
| 🆕 | codebase.markdown.tableRows | 111 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 302,645 | — | — |
| 🆕 | codebase.sourceFiles | 66 | — | — |
| 🆕 | codebase.typescript.decorators | 19 | — | — |
| 🆕 | codebase.typescript.docComments | 185 | — | — |
| 🆕 | codebase.typescript.files | 66 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 2 | — | — |
| 🆕 | codebase.typescript.interfaces | 36 | — | — |
| 🆕 | codebase.custom.Module Files | 9 | — | — |
| 🆕 | codebase.custom.Service Files | 10 | — | — |
| 🆕 | codebase.custom.Constants Files | 9 | — | — |
| 🆕 | codebase.custom.Types Files | 9 | — | — |
| 🆕 | codebase.custom.Utilities Files | 2 | — | — |
| 🆕 | codebase.custom.Unit Tests | 17 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 11.56 kB | — | — |
</details>

<details>
<summary>`coinagerie-agents` — 42 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 20 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.commentLines | 32 | — | — |
| 🆕 | codebase.javascript.comments | 25 | — | — |
| 🆕 | codebase.javascript.constants | 26 | — | — |
| 🆕 | codebase.javascript.externalPackages | 5 | — | — |
| 🆕 | codebase.javascript.functions | 27 | — | — |
| 🆕 | codebase.javascript.imports | 15 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 27 | — | — |
| 🆕 | codebase.javascript.testFiles | 2 | — | — |
| 🆕 | codebase.json.arrays | 7 | — | — |
| 🆕 | codebase.json.booleans | 3 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 17 | — | — |
| 🆕 | codebase.json.lines | 70 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 25 | — | — |
| 🆕 | codebase.json.properties | 50 | — | — |
| 🆕 | codebase.json.strings | 34 | — | — |
| 🆕 | codebase.json.totalNodes | 70 | — | — |
| 🆕 | codebase.linesOfCode | 285 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 13 | — | — |
| 🆕 | codebase.markdown.files | 9 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 36 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 16 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 242 | — | — |
| 🆕 | codebase.markdown.lines | 894 | — | — |
| 🆕 | codebase.markdown.links | 9 | — | — |
| 🆕 | codebase.markdown.listItems | 61 | — | — |
| 🆕 | codebase.markdown.lists | 16 | — | — |
| 🆕 | codebase.markdown.paragraphs | 125 | — | — |
| 🆕 | codebase.markdown.tableRows | 56 | — | — |
| 🆕 | codebase.markdown.tables | 9 | — | — |
| 🆕 | codebase.repositoryBytes | 61,319 | — | — |
| 🆕 | codebase.sourceFiles | 8 | — | — |
| 🆕 | codebase.typescript.docComments | 13 | — | — |
| 🆕 | codebase.typescript.files | 8 | — | — |
| 🆕 | codebase.typescript.interfaces | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 2 | — | — |
</details>

<details>
<summary>`coinagerie-cli` — 54 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 54 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 36 | — | — |
| 🆕 | codebase.javascript.classes | 7 | — | — |
| 🆕 | codebase.javascript.commentLines | 140 | — | — |
| 🆕 | codebase.javascript.comments | 90 | — | — |
| 🆕 | codebase.javascript.constants | 121 | — | — |
| 🆕 | codebase.javascript.exported | 31 | — | — |
| 🆕 | codebase.javascript.externalPackages | 18 | — | — |
| 🆕 | codebase.javascript.functions | 115 | — | — |
| 🆕 | codebase.javascript.imports | 145 | — | — |
| 🆕 | codebase.javascript.methods | 28 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 107 | — | — |
| 🆕 | codebase.javascript.testFiles | 10 | — | — |
| 🆕 | codebase.json.arrays | 14 | — | — |
| 🆕 | codebase.json.booleans | 7 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 48 | — | — |
| 🆕 | codebase.json.lines | 196 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 44 | — | — |
| 🆕 | codebase.json.properties | 122 | — | — |
| 🆕 | codebase.json.strings | 108 | — | — |
| 🆕 | codebase.json.totalNodes | 174 | — | — |
| 🆕 | codebase.linesOfCode | 2,418 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 24 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 34 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 58 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 152 | — | — |
| 🆕 | codebase.markdown.lines | 1,028 | — | — |
| 🆕 | codebase.markdown.links | 31 | — | — |
| 🆕 | codebase.markdown.listItems | 127 | — | — |
| 🆕 | codebase.markdown.lists | 31 | — | — |
| 🆕 | codebase.markdown.paragraphs | 176 | — | — |
| 🆕 | codebase.markdown.tableRows | 36 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 126,970 | — | — |
| 🆕 | codebase.sourceFiles | 40 | — | — |
| 🆕 | codebase.typescript.decorators | 19 | — | — |
| 🆕 | codebase.typescript.docComments | 62 | — | — |
| 🆕 | codebase.typescript.files | 40 | — | — |
| 🆕 | codebase.typescript.interfaces | 8 | — | — |
| 🆕 | codebase.custom.Module Files | 4 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Command Files | 2 | — | — |
| 🆕 | codebase.custom.Constants Files | 4 | — | — |
| 🆕 | codebase.custom.Types Files | 3 | — | — |
| 🆕 | codebase.custom.Utilities Files | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 8 | — | — |
| 🆕 | codebase.custom.End To End Tests | 2 | — | — |
</details>

<details>
<summary>`coinagerie-configuration` — 51 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 31 | — | — |
| 🆕 | codebase.folders | 4 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 29 | — | — |
| 🆕 | codebase.javascript.classes | 2 | — | — |
| 🆕 | codebase.javascript.commentLines | 111 | — | — |
| 🆕 | codebase.javascript.comments | 68 | — | — |
| 🆕 | codebase.javascript.constants | 63 | — | — |
| 🆕 | codebase.javascript.exported | 26 | — | — |
| 🆕 | codebase.javascript.externalPackages | 9 | — | — |
| 🆕 | codebase.javascript.functions | 43 | — | — |
| 🆕 | codebase.javascript.imports | 38 | — | — |
| 🆕 | codebase.javascript.methods | 11 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 25 | — | — |
| 🆕 | codebase.javascript.testFiles | 3 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 42 | — | — |
| 🆕 | codebase.json.lines | 158 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 97 | — | — |
| 🆕 | codebase.json.strings | 87 | — | — |
| 🆕 | codebase.json.totalNodes | 143 | — | — |
| 🆕 | codebase.linesOfCode | 1,333 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 21 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 35 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 63 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 135 | — | — |
| 🆕 | codebase.markdown.lines | 860 | — | — |
| 🆕 | codebase.markdown.links | 32 | — | — |
| 🆕 | codebase.markdown.listItems | 58 | — | — |
| 🆕 | codebase.markdown.lists | 33 | — | — |
| 🆕 | codebase.markdown.paragraphs | 105 | — | — |
| 🆕 | codebase.markdown.tableRows | 46 | — | — |
| 🆕 | codebase.markdown.tables | 10 | — | — |
| 🆕 | codebase.repositoryBytes | 85,912 | — | — |
| 🆕 | codebase.sourceFiles | 17 | — | — |
| 🆕 | codebase.typescript.decorators | 2 | — | — |
| 🆕 | codebase.typescript.docComments | 55 | — | — |
| 🆕 | codebase.typescript.files | 17 | — | — |
| 🆕 | codebase.typescript.interfaces | 11 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Constants Files | 1 | — | — |
| 🆕 | codebase.custom.Types Files | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 3 | — | — |
</details>

<details>
<summary>`coinagerie-core` — 50 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 31 | — | — |
| 🆕 | codebase.folders | 4 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 1 | — | — |
| 🆕 | codebase.javascript.classes | 5 | — | — |
| 🆕 | codebase.javascript.commentLines | 49 | — | — |
| 🆕 | codebase.javascript.comments | 34 | — | — |
| 🆕 | codebase.javascript.constants | 11 | — | — |
| 🆕 | codebase.javascript.exported | 16 | — | — |
| 🆕 | codebase.javascript.externalPackages | 5 | — | — |
| 🆕 | codebase.javascript.functions | 14 | — | — |
| 🆕 | codebase.javascript.imports | 25 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 13 | — | — |
| 🆕 | codebase.javascript.testFiles | 3 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 42 | — | — |
| 🆕 | codebase.json.lines | 154 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 93 | — | — |
| 🆕 | codebase.json.strings | 83 | — | — |
| 🆕 | codebase.json.totalNodes | 139 | — | — |
| 🆕 | codebase.linesOfCode | 378 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 16 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 32 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 36 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 78 | — | — |
| 🆕 | codebase.markdown.lines | 646 | — | — |
| 🆕 | codebase.markdown.links | 24 | — | — |
| 🆕 | codebase.markdown.listItems | 35 | — | — |
| 🆕 | codebase.markdown.lists | 11 | — | — |
| 🆕 | codebase.markdown.paragraphs | 93 | — | — |
| 🆕 | codebase.markdown.tableRows | 21 | — | — |
| 🆕 | codebase.markdown.tables | 4 | — | — |
| 🆕 | codebase.repositoryBytes | 45,834 | — | — |
| 🆕 | codebase.sourceFiles | 17 | — | — |
| 🆕 | codebase.typescript.decorators | 2 | — | — |
| 🆕 | codebase.typescript.docComments | 20 | — | — |
| 🆕 | codebase.typescript.files | 17 | — | — |
| 🆕 | codebase.typescript.interfaces | 3 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Constants Files | 1 | — | — |
| 🆕 | codebase.custom.Types Files | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 3 | — | — |
</details>

<details>
<summary>`coinagerie-languages` — 51 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 81 | — | — |
| 🆕 | codebase.folders | 14 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 30 | — | — |
| 🆕 | codebase.javascript.classes | 22 | — | — |
| 🆕 | codebase.javascript.commentLines | 267 | — | — |
| 🆕 | codebase.javascript.comments | 197 | — | — |
| 🆕 | codebase.javascript.constants | 74 | — | — |
| 🆕 | codebase.javascript.exported | 64 | — | — |
| 🆕 | codebase.javascript.externalPackages | 7 | — | — |
| 🆕 | codebase.javascript.functions | 100 | — | — |
| 🆕 | codebase.javascript.imports | 173 | — | — |
| 🆕 | codebase.javascript.methods | 23 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 93 | — | — |
| 🆕 | codebase.javascript.testFiles | 13 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 42 | — | — |
| 🆕 | codebase.json.lines | 155 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 94 | — | — |
| 🆕 | codebase.json.strings | 84 | — | — |
| 🆕 | codebase.json.totalNodes | 140 | — | — |
| 🆕 | codebase.linesOfCode | 2,935 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 27 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 33 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 36 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 156 | — | — |
| 🆕 | codebase.markdown.lines | 1,001 | — | — |
| 🆕 | codebase.markdown.links | 28 | — | — |
| 🆕 | codebase.markdown.listItems | 36 | — | — |
| 🆕 | codebase.markdown.lists | 11 | — | — |
| 🆕 | codebase.markdown.paragraphs | 104 | — | — |
| 🆕 | codebase.markdown.tableRows | 50 | — | — |
| 🆕 | codebase.markdown.tables | 7 | — | — |
| 🆕 | codebase.repositoryBytes | 147,807 | — | — |
| 🆕 | codebase.sourceFiles | 67 | — | — |
| 🆕 | codebase.typescript.decorators | 22 | — | — |
| 🆕 | codebase.typescript.docComments | 96 | — | — |
| 🆕 | codebase.typescript.files | 67 | — | — |
| 🆕 | codebase.typescript.interfaces | 7 | — | — |
| 🆕 | codebase.custom.Module Files | 11 | — | — |
| 🆕 | codebase.custom.Service Files | 11 | — | — |
| 🆕 | codebase.custom.Constants Files | 11 | — | — |
| 🆕 | codebase.custom.Types Files | 11 | — | — |
| 🆕 | codebase.custom.Unit Tests | 13 | — | — |
</details>

<details>
<summary>`coinagerie-nx` — 52 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 51 | — | — |
| 🆕 | codebase.folders | 7 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 33 | — | — |
| 🆕 | codebase.javascript.classes | 5 | — | — |
| 🆕 | codebase.javascript.commentLines | 139 | — | — |
| 🆕 | codebase.javascript.comments | 89 | — | — |
| 🆕 | codebase.javascript.constants | 88 | — | — |
| 🆕 | codebase.javascript.exported | 40 | — | — |
| 🆕 | codebase.javascript.externalPackages | 13 | — | — |
| 🆕 | codebase.javascript.functions | 93 | — | — |
| 🆕 | codebase.javascript.imports | 101 | — | — |
| 🆕 | codebase.javascript.methods | 11 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 71 | — | — |
| 🆕 | codebase.javascript.testFiles | 9 | — | — |
| 🆕 | codebase.json.arrays | 13 | — | — |
| 🆕 | codebase.json.booleans | 8 | — | — |
| 🆕 | codebase.json.files | 6 | — | — |
| 🆕 | codebase.json.items | 46 | — | — |
| 🆕 | codebase.json.lines | 198 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 45 | — | — |
| 🆕 | codebase.json.properties | 124 | — | — |
| 🆕 | codebase.json.strings | 109 | — | — |
| 🆕 | codebase.json.totalNodes | 176 | — | — |
| 🆕 | codebase.linesOfCode | 1,837 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 20 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 33 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 56 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 168 | — | — |
| 🆕 | codebase.markdown.lines | 861 | — | — |
| 🆕 | codebase.markdown.links | 25 | — | — |
| 🆕 | codebase.markdown.listItems | 54 | — | — |
| 🆕 | codebase.markdown.lists | 31 | — | — |
| 🆕 | codebase.markdown.paragraphs | 103 | — | — |
| 🆕 | codebase.markdown.tableRows | 43 | — | — |
| 🆕 | codebase.markdown.tables | 7 | — | — |
| 🆕 | codebase.repositoryBytes | 102,644 | — | — |
| 🆕 | codebase.sourceFiles | 35 | — | — |
| 🆕 | codebase.typescript.decorators | 5 | — | — |
| 🆕 | codebase.typescript.docComments | 62 | — | — |
| 🆕 | codebase.typescript.files | 35 | — | — |
| 🆕 | codebase.typescript.interfaces | 13 | — | — |
| 🆕 | codebase.custom.Module Files | 3 | — | — |
| 🆕 | codebase.custom.Service Files | 2 | — | — |
| 🆕 | codebase.custom.Constants Files | 2 | — | — |
| 🆕 | codebase.custom.Types Files | 3 | — | — |
| 🆕 | codebase.custom.Utilities Files | 2 | — | — |
| 🆕 | codebase.custom.Unit Tests | 9 | — | — |
</details>

<details>
<summary>`coinagerie-output` — 51 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 45 | — | — |
| 🆕 | codebase.folders | 7 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 9 | — | — |
| 🆕 | codebase.javascript.classes | 8 | — | — |
| 🆕 | codebase.javascript.commentLines | 146 | — | — |
| 🆕 | codebase.javascript.comments | 96 | — | — |
| 🆕 | codebase.javascript.constants | 89 | — | — |
| 🆕 | codebase.javascript.exported | 25 | — | — |
| 🆕 | codebase.javascript.externalPackages | 9 | — | — |
| 🆕 | codebase.javascript.functions | 88 | — | — |
| 🆕 | codebase.javascript.imports | 75 | — | — |
| 🆕 | codebase.javascript.methods | 49 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 128 | — | — |
| 🆕 | codebase.javascript.testFiles | 5 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 42 | — | — |
| 🆕 | codebase.json.lines | 156 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 95 | — | — |
| 🆕 | codebase.json.strings | 85 | — | — |
| 🆕 | codebase.json.totalNodes | 141 | — | — |
| 🆕 | codebase.linesOfCode | 1,880 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 16 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 32 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 55 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 203 | — | — |
| 🆕 | codebase.markdown.lines | 803 | — | — |
| 🆕 | codebase.markdown.links | 26 | — | — |
| 🆕 | codebase.markdown.listItems | 80 | — | — |
| 🆕 | codebase.markdown.lists | 30 | — | — |
| 🆕 | codebase.markdown.paragraphs | 122 | — | — |
| 🆕 | codebase.markdown.tableRows | 56 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 101,174 | — | — |
| 🆕 | codebase.sourceFiles | 31 | — | — |
| 🆕 | codebase.typescript.decorators | 8 | — | — |
| 🆕 | codebase.typescript.docComments | 62 | — | — |
| 🆕 | codebase.typescript.files | 31 | — | — |
| 🆕 | codebase.typescript.interfaces | 10 | — | — |
| 🆕 | codebase.custom.Module Files | 4 | — | — |
| 🆕 | codebase.custom.Service Files | 4 | — | — |
| 🆕 | codebase.custom.Constants Files | 4 | — | — |
| 🆕 | codebase.custom.Types Files | 4 | — | — |
| 🆕 | codebase.custom.Unit Tests | 5 | — | — |
</details>

<details>
<summary>`coinagerie-vocabulary` — 51 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 47 | — | — |
| 🆕 | codebase.folders | 7 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 29 | — | — |
| 🆕 | codebase.javascript.classes | 9 | — | — |
| 🆕 | codebase.javascript.commentLines | 145 | — | — |
| 🆕 | codebase.javascript.comments | 93 | — | — |
| 🆕 | codebase.javascript.constants | 52 | — | — |
| 🆕 | codebase.javascript.exported | 21 | — | — |
| 🆕 | codebase.javascript.externalPackages | 12 | — | — |
| 🆕 | codebase.javascript.functions | 77 | — | — |
| 🆕 | codebase.javascript.imports | 88 | — | — |
| 🆕 | codebase.javascript.methods | 37 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 85 | — | — |
| 🆕 | codebase.javascript.testFiles | 6 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 42 | — | — |
| 🆕 | codebase.json.lines | 160 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 99 | — | — |
| 🆕 | codebase.json.strings | 89 | — | — |
| 🆕 | codebase.json.totalNodes | 145 | — | — |
| 🆕 | codebase.linesOfCode | 1,574 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 16 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 32 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 56 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 160 | — | — |
| 🆕 | codebase.markdown.lines | 824 | — | — |
| 🆕 | codebase.markdown.links | 27 | — | — |
| 🆕 | codebase.markdown.listItems | 80 | — | — |
| 🆕 | codebase.markdown.lists | 31 | — | — |
| 🆕 | codebase.markdown.paragraphs | 122 | — | — |
| 🆕 | codebase.markdown.tableRows | 42 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 91,927 | — | — |
| 🆕 | codebase.sourceFiles | 33 | — | — |
| 🆕 | codebase.typescript.decorators | 9 | — | — |
| 🆕 | codebase.typescript.docComments | 46 | — | — |
| 🆕 | codebase.typescript.files | 33 | — | — |
| 🆕 | codebase.typescript.interfaces | 4 | — | — |
| 🆕 | codebase.custom.Module Files | 4 | — | — |
| 🆕 | codebase.custom.Service Files | 5 | — | — |
| 🆕 | codebase.custom.Constants Files | 4 | — | — |
| 🆕 | codebase.custom.Types Files | 4 | — | — |
| 🆕 | codebase.custom.Unit Tests | 6 | — | — |
</details>

<details>
<summary>`conformetry-agents` — 42 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 21 | — | — |
| 🆕 | codebase.folders | 7 | — | — |
| 🆕 | codebase.javascript.commentLines | 25 | — | — |
| 🆕 | codebase.javascript.comments | 20 | — | — |
| 🆕 | codebase.javascript.constants | 18 | — | — |
| 🆕 | codebase.javascript.externalPackages | 6 | — | — |
| 🆕 | codebase.javascript.functions | 14 | — | — |
| 🆕 | codebase.javascript.imports | 11 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 14 | — | — |
| 🆕 | codebase.javascript.testFiles | 1 | — | — |
| 🆕 | codebase.json.arrays | 7 | — | — |
| 🆕 | codebase.json.booleans | 3 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 17 | — | — |
| 🆕 | codebase.json.lines | 71 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 25 | — | — |
| 🆕 | codebase.json.properties | 51 | — | — |
| 🆕 | codebase.json.strings | 35 | — | — |
| 🆕 | codebase.json.totalNodes | 71 | — | — |
| 🆕 | codebase.linesOfCode | 195 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 17 | — | — |
| 🆕 | codebase.markdown.files | 11 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 8 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 54 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 21 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 271 | — | — |
| 🆕 | codebase.markdown.lines | 1,452 | — | — |
| 🆕 | codebase.markdown.links | 17 | — | — |
| 🆕 | codebase.markdown.listItems | 72 | — | — |
| 🆕 | codebase.markdown.lists | 23 | — | — |
| 🆕 | codebase.markdown.paragraphs | 267 | — | — |
| 🆕 | codebase.markdown.tableRows | 54 | — | — |
| 🆕 | codebase.markdown.tables | 9 | — | — |
| 🆕 | codebase.repositoryBytes | 80,619 | — | — |
| 🆕 | codebase.sourceFiles | 7 | — | — |
| 🆕 | codebase.typescript.docComments | 9 | — | — |
| 🆕 | codebase.typescript.files | 7 | — | — |
| 🆕 | codebase.typescript.interfaces | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 1 | — | — |
</details>

<details>
<summary>`conformetry-cli` — 58 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 52 | — | — |
| 🆕 | codebase.folders | 7 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 112 | — | — |
| 🆕 | codebase.javascript.classes | 10 | — | — |
| 🆕 | codebase.javascript.commentLines | 266 | — | — |
| 🆕 | codebase.javascript.comments | 172 | — | — |
| 🆕 | codebase.javascript.constants | 108 | — | — |
| 🆕 | codebase.javascript.exported | 25 | — | — |
| 🆕 | codebase.javascript.externalPackages | 18 | — | — |
| 🆕 | codebase.javascript.functions | 172 | — | — |
| 🆕 | codebase.javascript.imports | 145 | — | — |
| 🆕 | codebase.javascript.methods | 52 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 112 | — | — |
| 🆕 | codebase.javascript.testFiles | 8 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 7 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 45 | — | — |
| 🆕 | codebase.json.lines | 186 | — | — |
| 🆕 | codebase.json.maxDepth | 6 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 41 | — | — |
| 🆕 | codebase.json.properties | 118 | — | — |
| 🆕 | codebase.json.strings | 106 | — | — |
| 🆕 | codebase.json.totalNodes | 167 | — | — |
| 🆕 | codebase.linesOfCode | 3,332 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 1 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 51 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 107 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 139 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 401 | — | — |
| 🆕 | codebase.markdown.lines | 2,435 | — | — |
| 🆕 | codebase.markdown.links | 59 | — | — |
| 🆕 | codebase.markdown.listItems | 444 | — | — |
| 🆕 | codebase.markdown.lists | 106 | — | — |
| 🆕 | codebase.markdown.paragraphs | 567 | — | — |
| 🆕 | codebase.markdown.tableRows | 124 | — | — |
| 🆕 | codebase.markdown.tables | 20 | — | — |
| 🆕 | codebase.repositoryBytes | 231,458 | — | — |
| 🆕 | codebase.sourceFiles | 38 | — | — |
| 🆕 | codebase.typescript.decorators | 27 | — | — |
| 🆕 | codebase.typescript.docComments | 62 | — | — |
| 🆕 | codebase.typescript.files | 38 | — | — |
| 🆕 | codebase.typescript.interfaces | 5 | — | — |
| 🆕 | codebase.custom.Module Files | 5 | — | — |
| 🆕 | codebase.custom.Command Files | 4 | — | — |
| 🆕 | codebase.custom.Constants Files | 5 | — | — |
| 🆕 | codebase.custom.Types Files | 4 | — | — |
| 🆕 | codebase.custom.Unit Tests | 6 | — | — |
| 🆕 | codebase.custom.Integration Tests | 1 | — | — |
| 🆕 | codebase.custom.End To End Tests | 1 | — | — |
| 🆕 | codebase.custom.Class JSDoc Budget | 2 | — | — |
| 🆕 | codebase.custom.Variable JSDoc Budget | 1 | — | — |
| 🆕 | Compiled JavaScript.files | 3 | — | — |
| 🆕 | Compiled JavaScript.size | 6.55 kB | — | — |
</details>

<details>
<summary>`conformetry-configuration` — 56 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 70 | — | — |
| 🆕 | codebase.folders | 9 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 117 | — | — |
| 🆕 | codebase.javascript.classes | 21 | — | — |
| 🆕 | codebase.javascript.commentLines | 592 | — | — |
| 🆕 | codebase.javascript.comments | 324 | — | — |
| 🆕 | codebase.javascript.constants | 347 | — | — |
| 🆕 | codebase.javascript.exported | 66 | — | — |
| 🆕 | codebase.javascript.externalPackages | 14 | — | — |
| 🆕 | codebase.javascript.functions | 364 | — | — |
| 🆕 | codebase.javascript.imports | 225 | — | — |
| 🆕 | codebase.javascript.methods | 148 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 395 | — | — |
| 🆕 | codebase.javascript.testFiles | 15 | — | — |
| 🆕 | codebase.json.arrays | 17 | — | — |
| 🆕 | codebase.json.booleans | 9 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 59 | — | — |
| 🆕 | codebase.json.lines | 204 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 45 | — | — |
| 🆕 | codebase.json.properties | 118 | — | — |
| 🆕 | codebase.json.strings | 109 | — | — |
| 🆕 | codebase.json.totalNodes | 181 | — | — |
| 🆕 | codebase.linesOfCode | 6,499 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 1 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 28 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 99 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 132 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 551 | — | — |
| 🆕 | codebase.markdown.lines | 1,761 | — | — |
| 🆕 | codebase.markdown.links | 43 | — | — |
| 🆕 | codebase.markdown.listItems | 135 | — | — |
| 🆕 | codebase.markdown.lists | 105 | — | — |
| 🆕 | codebase.markdown.paragraphs | 211 | — | — |
| 🆕 | codebase.markdown.tableRows | 153 | — | — |
| 🆕 | codebase.markdown.tables | 10 | — | — |
| 🆕 | codebase.repositoryBytes | 310,873 | — | — |
| 🆕 | codebase.sourceFiles | 56 | — | — |
| 🆕 | codebase.typescript.decorators | 17 | — | — |
| 🆕 | codebase.typescript.docComments | 189 | — | — |
| 🆕 | codebase.typescript.files | 56 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 2 | — | — |
| 🆕 | codebase.typescript.interfaces | 18 | — | — |
| 🆕 | codebase.custom.Module Files | 6 | — | — |
| 🆕 | codebase.custom.Service Files | 11 | — | — |
| 🆕 | codebase.custom.Constants Files | 6 | — | — |
| 🆕 | codebase.custom.Types Files | 6 | — | — |
| 🆕 | codebase.custom.Utilities Files | 2 | — | — |
| 🆕 | codebase.custom.Unit Tests | 15 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 8.28 kB | — | — |
</details>

<details>
<summary>`conformetry-core` — 53 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 30 | — | — |
| 🆕 | codebase.folders | 4 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 1 | — | — |
| 🆕 | codebase.javascript.classes | 2 | — | — |
| 🆕 | codebase.javascript.commentLines | 121 | — | — |
| 🆕 | codebase.javascript.comments | 80 | — | — |
| 🆕 | codebase.javascript.constants | 2 | — | — |
| 🆕 | codebase.javascript.exported | 24 | — | — |
| 🆕 | codebase.javascript.externalPackages | 5 | — | — |
| 🆕 | codebase.javascript.functions | 7 | — | — |
| 🆕 | codebase.javascript.imports | 19 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 6 | — | — |
| 🆕 | codebase.javascript.testFiles | 2 | — | — |
| 🆕 | codebase.javascript.todos | 2 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 44 | — | — |
| 🆕 | codebase.json.lines | 156 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 93 | — | — |
| 🆕 | codebase.json.strings | 85 | — | — |
| 🆕 | codebase.json.totalNodes | 141 | — | — |
| 🆕 | codebase.linesOfCode | 464 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 18 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 96 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 45 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 126 | — | — |
| 🆕 | codebase.markdown.lines | 1,013 | — | — |
| 🆕 | codebase.markdown.links | 37 | — | — |
| 🆕 | codebase.markdown.listItems | 40 | — | — |
| 🆕 | codebase.markdown.lists | 20 | — | — |
| 🆕 | codebase.markdown.paragraphs | 162 | — | — |
| 🆕 | codebase.markdown.tableRows | 26 | — | — |
| 🆕 | codebase.markdown.tables | 5 | — | — |
| 🆕 | codebase.repositoryBytes | 62,892 | — | — |
| 🆕 | codebase.sourceFiles | 16 | — | — |
| 🆕 | codebase.typescript.decorators | 2 | — | — |
| 🆕 | codebase.typescript.docComments | 63 | — | — |
| 🆕 | codebase.typescript.files | 16 | — | — |
| 🆕 | codebase.typescript.interfaces | 17 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Constants Files | 1 | — | — |
| 🆕 | codebase.custom.Types Files | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 2 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 0.55 kB | — | — |
</details>

<details>
<summary>`conformetry-examples` — 72 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 115 | — | — |
| 🆕 | codebase.folders | 94 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 2 | — | — |
| 🆕 | codebase.javascript.classes | 17 | — | — |
| 🆕 | codebase.javascript.commentLines | 277 | — | — |
| 🆕 | codebase.javascript.comments | 169 | — | — |
| 🆕 | codebase.javascript.constants | 83 | — | — |
| 🆕 | codebase.javascript.exported | 36 | — | — |
| 🆕 | codebase.javascript.externalPackages | 15 | — | — |
| 🆕 | codebase.javascript.functions | 29 | — | — |
| 🆕 | codebase.javascript.imports | 36 | — | — |
| 🆕 | codebase.javascript.methods | 12 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 39 | — | — |
| 🆕 | codebase.javascript.testFiles | 1 | — | — |
| 🆕 | codebase.javascript.todos | 1 | — | — |
| 🆕 | codebase.json.arrays | 13 | — | — |
| 🆕 | codebase.json.booleans | 25 | — | — |
| 🆕 | codebase.json.files | 9 | — | — |
| 🆕 | codebase.json.items | 34 | — | — |
| 🆕 | codebase.json.lines | 297 | — | — |
| 🆕 | codebase.json.maxDepth | 6 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 70 | — | — |
| 🆕 | codebase.json.properties | 200 | — | — |
| 🆕 | codebase.json.strings | 134 | — | — |
| 🆕 | codebase.json.totalNodes | 243 | — | — |
| 🆕 | codebase.jupyter.cells | 4 | — | — |
| 🆕 | codebase.jupyter.codeCells | 2 | — | — |
| 🆕 | codebase.jupyter.codeLines | 2 | — | — |
| 🆕 | codebase.jupyter.files | 2 | — | — |
| 🆕 | codebase.jupyter.headings | 2 | — | — |
| 🆕 | codebase.jupyter.markdownCells | 2 | — | — |
| 🆕 | codebase.jupyter.markdownLines | 4 | — | — |
| 🆕 | codebase.jupyter.maxDepth | 5 | — | — |
| 🆕 | codebase.jupyter.properties | 24 | — | — |
| 🆕 | codebase.jupyter.totalNodes | 34 | — | — |
| 🆕 | codebase.linesOfCode | 1,221 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 2 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 92 | — | — |
| 🆕 | codebase.markdown.files | 43 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 40 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 102 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 33 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 402 | — | — |
| 🆕 | codebase.markdown.lines | 2,180 | — | — |
| 🆕 | codebase.markdown.links | 103 | — | — |
| 🆕 | codebase.markdown.listItems | 36 | — | — |
| 🆕 | codebase.markdown.lists | 12 | — | — |
| 🆕 | codebase.markdown.paragraphs | 222 | — | — |
| 🆕 | codebase.markdown.tableRows | 142 | — | — |
| 🆕 | codebase.markdown.tables | 18 | — | — |
| 🆕 | codebase.python.files | 1 | — | — |
| 🆕 | codebase.python.functions | 1 | — | — |
| 🆕 | codebase.python.lines | 6 | — | — |
| 🆕 | codebase.python.docstrings | 2 | — | — |
| 🆕 | codebase.python.docstringLines | 2 | — | — |
| 🆕 | codebase.repositoryBytes | 146,799 | — | — |
| 🆕 | codebase.sourceFiles | 53 | — | — |
| 🆕 | codebase.toml.files | 2 | — | — |
| 🆕 | codebase.toml.keys | 2 | — | — |
| 🆕 | codebase.toml.lines | 6 | — | — |
| 🆕 | codebase.toml.tables | 2 | — | — |
| 🆕 | codebase.typescript.decorators | 2 | — | — |
| 🆕 | codebase.typescript.docComments | 69 | — | — |
| 🆕 | codebase.typescript.files | 52 | — | — |
| 🆕 | codebase.typescript.interfaces | 7 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 15 | — | — |
| 🆕 | codebase.custom.Constants Files | 6 | — | — |
| 🆕 | codebase.custom.Types Files | 6 | — | — |
| 🆕 | codebase.custom.Integration Tests | 1 | — | — |
</details>

<details>
<summary>`conformetry-generation` — 54 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 30 | — | — |
| 🆕 | codebase.folders | 4 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 26 | — | — |
| 🆕 | codebase.javascript.classes | 4 | — | — |
| 🆕 | codebase.javascript.commentLines | 75 | — | — |
| 🆕 | codebase.javascript.comments | 34 | — | — |
| 🆕 | codebase.javascript.constants | 46 | — | — |
| 🆕 | codebase.javascript.exported | 7 | — | — |
| 🆕 | codebase.javascript.externalPackages | 8 | — | — |
| 🆕 | codebase.javascript.functions | 30 | — | — |
| 🆕 | codebase.javascript.imports | 36 | — | — |
| 🆕 | codebase.javascript.methods | 19 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 23 | — | — |
| 🆕 | codebase.javascript.testFiles | 2 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 158 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 96 | — | — |
| 🆕 | codebase.json.strings | 87 | — | — |
| 🆕 | codebase.json.totalNodes | 143 | — | — |
| 🆕 | codebase.linesOfCode | 907 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 1 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 20 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 98 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 129 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 169 | — | — |
| 🆕 | codebase.markdown.lines | 1,378 | — | — |
| 🆕 | codebase.markdown.links | 37 | — | — |
| 🆕 | codebase.markdown.listItems | 169 | — | — |
| 🆕 | codebase.markdown.lists | 101 | — | — |
| 🆕 | codebase.markdown.paragraphs | 232 | — | — |
| 🆕 | codebase.markdown.tableRows | 42 | — | — |
| 🆕 | codebase.markdown.tables | 9 | — | — |
| 🆕 | codebase.repositoryBytes | 83,576 | — | — |
| 🆕 | codebase.sourceFiles | 16 | — | — |
| 🆕 | codebase.typescript.decorators | 2 | — | — |
| 🆕 | codebase.typescript.docComments | 18 | — | — |
| 🆕 | codebase.typescript.files | 16 | — | — |
| 🆕 | codebase.typescript.interfaces | 3 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Constants Files | 1 | — | — |
| 🆕 | codebase.custom.Types Files | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 2 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 1.43 kB | — | — |
</details>

<details>
<summary>`conformetry-languages` — 65 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 108 | — | — |
| 🆕 | codebase.folders | 14 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 44 | — | — |
| 🆕 | codebase.javascript.classes | 28 | — | — |
| 🆕 | codebase.javascript.commentLines | 595 | — | — |
| 🆕 | codebase.javascript.comments | 367 | — | — |
| 🆕 | codebase.javascript.constants | 347 | — | — |
| 🆕 | codebase.javascript.exported | 90 | — | — |
| 🆕 | codebase.javascript.externalPackages | 15 | — | — |
| 🆕 | codebase.javascript.functions | 361 | — | — |
| 🆕 | codebase.javascript.imports | 325 | — | — |
| 🆕 | codebase.javascript.methods | 148 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 465 | — | — |
| 🆕 | codebase.javascript.testFiles | 28 | — | — |
| 🆕 | codebase.javascript.todos | 4 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 46 | — | — |
| 🆕 | codebase.json.lines | 165 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 100 | — | — |
| 🆕 | codebase.json.strings | 94 | — | — |
| 🆕 | codebase.json.totalNodes | 150 | — | — |
| 🆕 | codebase.linesOfCode | 7,238 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 31 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 97 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 121 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 503 | — | — |
| 🆕 | codebase.markdown.lines | 1,790 | — | — |
| 🆕 | codebase.markdown.links | 29 | — | — |
| 🆕 | codebase.markdown.listItems | 198 | — | — |
| 🆕 | codebase.markdown.lists | 95 | — | — |
| 🆕 | codebase.markdown.paragraphs | 266 | — | — |
| 🆕 | codebase.markdown.tableRows | 123 | — | — |
| 🆕 | codebase.markdown.tables | 7 | — | — |
| 🆕 | codebase.python.files | 8 | — | — |
| 🆕 | codebase.python.classes | 3 | — | — |
| 🆕 | codebase.python.functions | 19 | — | — |
| 🆕 | codebase.python.constants | 1 | — | — |
| 🆕 | codebase.python.imports | 21 | — | — |
| 🆕 | codebase.python.decorators | 2 | — | — |
| 🆕 | codebase.python.lines | 405 | — | — |
| 🆕 | codebase.python.comments | 7 | — | — |
| 🆕 | codebase.python.commentLines | 7 | — | — |
| 🆕 | codebase.python.docstrings | 18 | — | — |
| 🆕 | codebase.python.docstringLines | 44 | — | — |
| 🆕 | codebase.repositoryBytes | 333,237 | — | — |
| 🆕 | codebase.sourceFiles | 94 | — | — |
| 🆕 | codebase.typescript.decorators | 28 | — | — |
| 🆕 | codebase.typescript.docComments | 192 | — | — |
| 🆕 | codebase.typescript.files | 86 | — | — |
| 🆕 | codebase.typescript.interfaces | 30 | — | — |
| 🆕 | codebase.custom.Module Files | 10 | — | — |
| 🆕 | codebase.custom.Service Files | 18 | — | — |
| 🆕 | codebase.custom.Constants Files | 10 | — | — |
| 🆕 | codebase.custom.Types Files | 10 | — | — |
| 🆕 | codebase.custom.Unit Tests | 28 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 9.04 kB | — | — |
</details>

<details>
<summary>`conformetry-nx` — 55 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 88 | — | — |
| 🆕 | codebase.folders | 15 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 170 | — | — |
| 🆕 | codebase.javascript.classes | 17 | — | — |
| 🆕 | codebase.javascript.commentLines | 535 | — | — |
| 🆕 | codebase.javascript.comments | 329 | — | — |
| 🆕 | codebase.javascript.constants | 332 | — | — |
| 🆕 | codebase.javascript.exported | 83 | — | — |
| 🆕 | codebase.javascript.externalPackages | 18 | — | — |
| 🆕 | codebase.javascript.files | 1 | — | — |
| 🆕 | codebase.javascript.functions | 323 | — | — |
| 🆕 | codebase.javascript.imports | 287 | — | — |
| 🆕 | codebase.javascript.methods | 96 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 249 | — | — |
| 🆕 | codebase.javascript.testFiles | 17 | — | — |
| 🆕 | codebase.json.arrays | 14 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 8 | — | — |
| 🆕 | codebase.json.items | 48 | — | — |
| 🆕 | codebase.json.lines | 258 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 3 | — | — |
| 🆕 | codebase.json.objects | 58 | — | — |
| 🆕 | codebase.json.properties | 168 | — | — |
| 🆕 | codebase.json.strings | 143 | — | — |
| 🆕 | codebase.json.totalNodes | 224 | — | — |
| 🆕 | codebase.linesOfCode | 6,780 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 30 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 100 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 133 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 444 | — | — |
| 🆕 | codebase.markdown.lines | 2,006 | — | — |
| 🆕 | codebase.markdown.links | 51 | — | — |
| 🆕 | codebase.markdown.listItems | 367 | — | — |
| 🆕 | codebase.markdown.lists | 108 | — | — |
| 🆕 | codebase.markdown.paragraphs | 433 | — | — |
| 🆕 | codebase.markdown.tableRows | 100 | — | — |
| 🆕 | codebase.markdown.tables | 8 | — | — |
| 🆕 | codebase.repositoryBytes | 326,310 | — | — |
| 🆕 | codebase.sourceFiles | 70 | — | — |
| 🆕 | codebase.typescript.decorators | 17 | — | — |
| 🆕 | codebase.typescript.docComments | 158 | — | — |
| 🆕 | codebase.typescript.files | 69 | — | — |
| 🆕 | codebase.typescript.interfaces | 21 | — | — |
| 🆕 | codebase.custom.Module Files | 9 | — | — |
| 🆕 | codebase.custom.Service Files | 8 | — | — |
| 🆕 | codebase.custom.Constants Files | 8 | — | — |
| 🆕 | codebase.custom.Types Files | 10 | — | — |
| 🆕 | codebase.custom.Utilities Files | 4 | — | — |
| 🆕 | codebase.custom.Unit Tests | 17 | — | — |
| 🆕 | Compiled JavaScript.files | 6 | — | — |
| 🆕 | Compiled JavaScript.size | 11.85 kB | — | — |
</details>

<details>
<summary>`conformetry-output` — 53 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 36 | — | — |
| 🆕 | codebase.folders | 5 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 4 | — | — |
| 🆕 | codebase.javascript.classes | 4 | — | — |
| 🆕 | codebase.javascript.commentLines | 110 | — | — |
| 🆕 | codebase.javascript.comments | 72 | — | — |
| 🆕 | codebase.javascript.constants | 65 | — | — |
| 🆕 | codebase.javascript.exported | 22 | — | — |
| 🆕 | codebase.javascript.externalPackages | 7 | — | — |
| 🆕 | codebase.javascript.functions | 51 | — | — |
| 🆕 | codebase.javascript.imports | 45 | — | — |
| 🆕 | codebase.javascript.methods | 30 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 77 | — | — |
| 🆕 | codebase.javascript.testFiles | 4 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 157 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 95 | — | — |
| 🆕 | codebase.json.strings | 86 | — | — |
| 🆕 | codebase.json.totalNodes | 142 | — | — |
| 🆕 | codebase.linesOfCode | 1,257 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 17 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 95 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 120 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 161 | — | — |
| 🆕 | codebase.markdown.lines | 1,236 | — | — |
| 🆕 | codebase.markdown.links | 27 | — | — |
| 🆕 | codebase.markdown.listItems | 194 | — | — |
| 🆕 | codebase.markdown.lists | 94 | — | — |
| 🆕 | codebase.markdown.paragraphs | 241 | — | — |
| 🆕 | codebase.markdown.tableRows | 48 | — | — |
| 🆕 | codebase.markdown.tables | 7 | — | — |
| 🆕 | codebase.repositoryBytes | 88,618 | — | — |
| 🆕 | codebase.sourceFiles | 22 | — | — |
| 🆕 | codebase.typescript.decorators | 4 | — | — |
| 🆕 | codebase.typescript.docComments | 34 | — | — |
| 🆕 | codebase.typescript.files | 22 | — | — |
| 🆕 | codebase.typescript.interfaces | 2 | — | — |
| 🆕 | codebase.custom.Module Files | 2 | — | — |
| 🆕 | codebase.custom.Service Files | 2 | — | — |
| 🆕 | codebase.custom.Constants Files | 2 | — | — |
| 🆕 | codebase.custom.Types Files | 2 | — | — |
| 🆕 | codebase.custom.Unit Tests | 4 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 2.14 kB | — | — |
</details>

<details>
<summary>`conformetry-validation` — 53 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 41 | — | — |
| 🆕 | codebase.folders | 5 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 28 | — | — |
| 🆕 | codebase.javascript.classes | 7 | — | — |
| 🆕 | codebase.javascript.commentLines | 210 | — | — |
| 🆕 | codebase.javascript.comments | 118 | — | — |
| 🆕 | codebase.javascript.constants | 136 | — | — |
| 🆕 | codebase.javascript.exported | 19 | — | — |
| 🆕 | codebase.javascript.externalPackages | 10 | — | — |
| 🆕 | codebase.javascript.functions | 99 | — | — |
| 🆕 | codebase.javascript.imports | 90 | — | — |
| 🆕 | codebase.javascript.methods | 53 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 124 | — | — |
| 🆕 | codebase.javascript.testFiles | 6 | — | — |
| 🆕 | codebase.json.arrays | 12 | — | — |
| 🆕 | codebase.json.booleans | 6 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 43 | — | — |
| 🆕 | codebase.json.lines | 159 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 37 | — | — |
| 🆕 | codebase.json.properties | 97 | — | — |
| 🆕 | codebase.json.strings | 88 | — | — |
| 🆕 | codebase.json.totalNodes | 144 | — | — |
| 🆕 | codebase.linesOfCode | 2,270 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 17 | — | — |
| 🆕 | codebase.markdown.files | 7 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 97 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 121 | — | — |
| 🆕 | codebase.markdown.images | 167 | — | — |
| 🆕 | codebase.markdown.inlineCode | 215 | — | — |
| 🆕 | codebase.markdown.lines | 1,430 | — | — |
| 🆕 | codebase.markdown.links | 31 | — | — |
| 🆕 | codebase.markdown.listItems | 275 | — | — |
| 🆕 | codebase.markdown.lists | 96 | — | — |
| 🆕 | codebase.markdown.paragraphs | 327 | — | — |
| 🆕 | codebase.markdown.tableRows | 52 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 133,444 | — | — |
| 🆕 | codebase.sourceFiles | 27 | — | — |
| 🆕 | codebase.typescript.decorators | 7 | — | — |
| 🆕 | codebase.typescript.docComments | 59 | — | — |
| 🆕 | codebase.typescript.files | 27 | — | — |
| 🆕 | codebase.typescript.interfaces | 7 | — | — |
| 🆕 | codebase.custom.Module Files | 2 | — | — |
| 🆕 | codebase.custom.Service Files | 5 | — | — |
| 🆕 | codebase.custom.Constants Files | 2 | — | — |
| 🆕 | codebase.custom.Types Files | 2 | — | — |
| 🆕 | codebase.custom.Unit Tests | 6 | — | — |
| 🆕 | Compiled JavaScript.files | 1 | — | — |
| 🆕 | Compiled JavaScript.size | 3.20 kB | — | — |
</details>

<details>
<summary>`interface` — 51 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 37 | — | — |
| 🆕 | codebase.folders | 7 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 6 | — | — |
| 🆕 | codebase.javascript.classes | 6 | — | — |
| 🆕 | codebase.javascript.commentLines | 91 | — | — |
| 🆕 | codebase.javascript.comments | 63 | — | — |
| 🆕 | codebase.javascript.constants | 98 | — | — |
| 🆕 | codebase.javascript.exported | 47 | — | — |
| 🆕 | codebase.javascript.externalPackages | 5 | — | — |
| 🆕 | codebase.javascript.functions | 120 | — | — |
| 🆕 | codebase.javascript.imports | 38 | — | — |
| 🆕 | codebase.javascript.methods | 11 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 125 | — | — |
| 🆕 | codebase.javascript.testFiles | 4 | — | — |
| 🆕 | codebase.json.arrays | 14 | — | — |
| 🆕 | codebase.json.booleans | 9 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 37 | — | — |
| 🆕 | codebase.json.lines | 160 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 38 | — | — |
| 🆕 | codebase.json.properties | 102 | — | — |
| 🆕 | codebase.json.strings | 81 | — | — |
| 🆕 | codebase.json.totalNodes | 143 | — | — |
| 🆕 | codebase.linesOfCode | 1,772 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 8 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 12 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 25 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 102 | — | — |
| 🆕 | codebase.markdown.lines | 509 | — | — |
| 🆕 | codebase.markdown.links | 5 | — | — |
| 🆕 | codebase.markdown.listItems | 9 | — | — |
| 🆕 | codebase.markdown.lists | 3 | — | — |
| 🆕 | codebase.markdown.paragraphs | 42 | — | — |
| 🆕 | codebase.markdown.tableRows | 33 | — | — |
| 🆕 | codebase.markdown.tables | 5 | — | — |
| 🆕 | codebase.repositoryBytes | 86,254 | — | — |
| 🆕 | codebase.sourceFiles | 25 | — | — |
| 🆕 | codebase.typescript.decorators | 16 | — | — |
| 🆕 | codebase.typescript.docComments | 54 | — | — |
| 🆕 | codebase.typescript.files | 25 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 35 | — | — |
| 🆕 | codebase.typescript.interfaces | 7 | — | — |
| 🆕 | codebase.custom.Constants Files | 3 | — | — |
| 🆕 | codebase.custom.Types Files | 3 | — | — |
| 🆕 | codebase.custom.Utilities Files | 4 | — | — |
| 🆕 | codebase.custom.Unit Tests | 4 | — | — |
</details>

<details>
<summary>`lexico-db` — 65 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 74 | — | — |
| 🆕 | codebase.folders | 11 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 29 | — | — |
| 🆕 | codebase.javascript.classes | 37 | — | — |
| 🆕 | codebase.javascript.commentLines | 209 | — | — |
| 🆕 | codebase.javascript.comments | 134 | — | — |
| 🆕 | codebase.javascript.constants | 144 | — | — |
| 🆕 | codebase.javascript.exported | 112 | — | — |
| 🆕 | codebase.javascript.externalPackages | 10 | — | — |
| 🆕 | codebase.javascript.functions | 194 | — | — |
| 🆕 | codebase.javascript.imports | 209 | — | — |
| 🆕 | codebase.javascript.methods | 18 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 183 | — | — |
| 🆕 | codebase.javascript.testFiles | 8 | — | — |
| 🆕 | codebase.javascript.todos | 5 | — | — |
| 🆕 | codebase.json.arrays | 10 | — | — |
| 🆕 | codebase.json.booleans | 8 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 31 | — | — |
| 🆕 | codebase.json.lines | 148 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 41 | — | — |
| 🆕 | codebase.json.properties | 99 | — | — |
| 🆕 | codebase.json.strings | 74 | — | — |
| 🆕 | codebase.json.totalNodes | 134 | — | — |
| 🆕 | codebase.linesOfCode | 4,887 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 12 | — | — |
| 🆕 | codebase.markdown.files | 5 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 1 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 12 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 24 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 116 | — | — |
| 🆕 | codebase.markdown.lines | 731 | — | — |
| 🆕 | codebase.markdown.links | 14 | — | — |
| 🆕 | codebase.markdown.listItems | 27 | — | — |
| 🆕 | codebase.markdown.lists | 3 | — | — |
| 🆕 | codebase.markdown.paragraphs | 63 | — | — |
| 🆕 | codebase.markdown.tableRows | 31 | — | — |
| 🆕 | codebase.markdown.tables | 5 | — | — |
| 🆕 | codebase.repositoryBytes | 259,234 | — | — |
| 🆕 | codebase.sourceFiles | 60 | — | — |
| 🆕 | codebase.sql.commonTableExpressions | 37 | — | — |
| 🆕 | codebase.sql.creates | 62 | — | — |
| 🆕 | codebase.sql.deletes | 18 | — | — |
| 🆕 | codebase.sql.files | 4 | — | — |
| 🆕 | codebase.sql.inserts | 31 | — | — |
| 🆕 | codebase.sql.lines | 387 | — | — |
| 🆕 | codebase.sql.statements | 337 | — | — |
| 🆕 | codebase.sql.updates | 17 | — | — |
| 🆕 | codebase.typescript.decorators | 153 | — | — |
| 🆕 | codebase.typescript.docComments | 100 | — | — |
| 🆕 | codebase.typescript.files | 60 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 2 | — | — |
| 🆕 | codebase.typescript.interfaces | 8 | — | — |
| 🆕 | codebase.custom.Module Files | 3 | — | — |
| 🆕 | codebase.custom.Service Files | 3 | — | — |
| 🆕 | codebase.custom.Constants Files | 4 | — | — |
| 🆕 | codebase.custom.Types Files | 3 | — | — |
| 🆕 | codebase.custom.TypeORM Entities | 28 | — | — |
| 🆕 | codebase.custom.Unit Tests | 6 | — | — |
| 🆕 | codebase.custom.Integration Tests | 2 | — | — |
| 🆕 | Compiled JavaScript.files | 44 | — | — |
| 🆕 | Compiled JavaScript.size | 26.34 kB | — | — |
</details>

<details>
<summary>`lexico-web` — 67 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 137 | — | — |
| 🆕 | codebase.css.atRules | 2 | — | — |
| 🆕 | codebase.css.comments | 2 | — | — |
| 🆕 | codebase.css.customProperties | 14 | — | — |
| 🆕 | codebase.css.declarations | 14 | — | — |
| 🆕 | codebase.css.files | 1 | — | — |
| 🆕 | codebase.css.lines | 35 | — | — |
| 🆕 | codebase.css.rules | 3 | — | — |
| 🆕 | codebase.css.selectors | 4 | — | — |
| 🆕 | codebase.folders | 27 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 23 | — | — |
| 🆕 | codebase.javascript.commentLines | 788 | — | — |
| 🆕 | codebase.javascript.comments | 615 | — | — |
| 🆕 | codebase.javascript.constants | 179 | — | — |
| 🆕 | codebase.javascript.exported | 313 | — | — |
| 🆕 | codebase.javascript.externalPackages | 22 | — | — |
| 🆕 | codebase.javascript.files | 2 | — | — |
| 🆕 | codebase.javascript.functions | 290 | — | — |
| 🆕 | codebase.javascript.imports | 290 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 267 | — | — |
| 🆕 | codebase.javascript.testFiles | 24 | — | — |
| 🆕 | codebase.json.arrays | 15 | — | — |
| 🆕 | codebase.json.booleans | 10 | — | — |
| 🆕 | codebase.json.files | 3 | — | — |
| 🆕 | codebase.json.items | 54 | — | — |
| 🆕 | codebase.json.lines | 205 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 2 | — | — |
| 🆕 | codebase.json.objects | 41 | — | — |
| 🆕 | codebase.json.properties | 135 | — | — |
| 🆕 | codebase.json.strings | 124 | — | — |
| 🆕 | codebase.json.totalNodes | 192 | — | — |
| 🆕 | codebase.linesOfCode | 7,110 | — | — |
| 🆕 | codebase.markdown.blockQuotes | 1 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 33 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 18 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 29 | — | — |
| 🆕 | codebase.markdown.images | 169 | — | — |
| 🆕 | codebase.markdown.inlineCode | 254 | — | — |
| 🆕 | codebase.markdown.lines | 1,068 | — | — |
| 🆕 | codebase.markdown.links | 27 | — | — |
| 🆕 | codebase.markdown.listItems | 39 | — | — |
| 🆕 | codebase.markdown.lists | 5 | — | — |
| 🆕 | codebase.markdown.paragraphs | 99 | — | — |
| 🆕 | codebase.markdown.tableRows | 72 | — | — |
| 🆕 | codebase.markdown.tables | 6 | — | — |
| 🆕 | codebase.repositoryBytes | 312,018 | — | — |
| 🆕 | codebase.sourceFiles | 121 | — | — |
| 🆕 | codebase.typescript.docComments | 302 | — | — |
| 🆕 | codebase.typescript.enums | 2 | — | — |
| 🆕 | codebase.typescript.files | 119 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 17 | — | — |
| 🆕 | codebase.typescript.interfaces | 47 | — | — |
| 🆕 | codebase.custom.Constants Files | 19 | — | — |
| 🆕 | codebase.custom.Types Files | 18 | — | — |
| 🆕 | codebase.custom.Utilities Files | 18 | — | — |
| 🆕 | codebase.custom.Variable JSDoc Budget | 4 | — | — |
| 🆕 | Client entry JavaScript.files | 1 | — | — |
| 🆕 | Client entry JavaScript.size | 186.68 kB | — | — |
| 🆕 | Client route JavaScript.files | 4 | — | — |
| 🆕 | Client route JavaScript.size | 52.00 kB | — | — |
| 🆕 | Client CSS.files | 1 | — | — |
| 🆕 | Client CSS.size | 46.93 kB | — | — |
| 🆕 | Server JavaScript.files | 9 | — | — |
| 🆕 | Server JavaScript.size | 208.10 kB | — | — |
</details>

<details>
<summary>`meanderaw-cli` — 64 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 456 | — | — |
| 🆕 | codebase.folders | 36 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 438 | — | — |
| 🆕 | codebase.javascript.classes | 209 | — | — |
| 🆕 | codebase.javascript.commentLines | 2,779 | — | — |
| 🆕 | codebase.javascript.comments | 1,616 | — | — |
| 🆕 | codebase.javascript.constants | 1,353 | — | — |
| 🆕 | codebase.javascript.exported | 339 | — | — |
| 🆕 | codebase.javascript.externalPackages | 20 | — | — |
| 🆕 | codebase.javascript.functions | 2,388 | — | — |
| 🆕 | codebase.javascript.imports | 2,560 | — | — |
| 🆕 | codebase.javascript.methods | 545 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 2,495 | — | — |
| 🆕 | codebase.javascript.testFiles | 179 | — | — |
| 🆕 | codebase.json.arrays | 15 | — | — |
| 🆕 | codebase.json.booleans | 9 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 41 | — | — |
| 🆕 | codebase.json.lines | 178 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 49 | — | — |
| 🆕 | codebase.json.properties | 117 | — | — |
| 🆕 | codebase.json.strings | 88 | — | — |
| 🆕 | codebase.json.totalNodes | 162 | — | — |
| 🆕 | codebase.linesOfCode | 42,231 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 136 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 1 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 18 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 38 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 1,848 | — | — |
| 🆕 | codebase.markdown.lines | 6,208 | — | — |
| 🆕 | codebase.markdown.links | 32 | — | — |
| 🆕 | codebase.markdown.listItems | 97 | — | — |
| 🆕 | codebase.markdown.lists | 11 | — | — |
| 🆕 | codebase.markdown.paragraphs | 302 | — | — |
| 🆕 | codebase.markdown.tableRows | 408 | — | — |
| 🆕 | codebase.markdown.tables | 9 | — | — |
| 🆕 | codebase.repositoryBytes | 2,188,083 | — | — |
| 🆕 | codebase.sourceFiles | 439 | — | — |
| 🆕 | codebase.sql.commonTableExpressions | 2 | — | — |
| 🆕 | codebase.sql.creates | 7 | — | — |
| 🆕 | codebase.sql.files | 4 | — | — |
| 🆕 | codebase.sql.inserts | 1 | — | — |
| 🆕 | codebase.sql.lines | 107 | — | — |
| 🆕 | codebase.sql.statements | 29 | — | — |
| 🆕 | codebase.typescript.decorators | 480 | — | — |
| 🆕 | codebase.typescript.docComments | 872 | — | — |
| 🆕 | codebase.typescript.files | 439 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 7 | — | — |
| 🆕 | codebase.typescript.interfaces | 50 | — | — |
| 🆕 | codebase.custom.Module Files | 33 | — | — |
| 🆕 | codebase.custom.Service Files | 157 | — | — |
| 🆕 | codebase.custom.Command Files | 1 | — | — |
| 🆕 | codebase.custom.Constants Files | 29 | — | — |
| 🆕 | codebase.custom.Types Files | 20 | — | — |
| 🆕 | codebase.custom.TypeORM Entities | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 167 | — | — |
| 🆕 | codebase.custom.Integration Tests | 11 | — | — |
| 🆕 | codebase.custom.End To End Tests | 1 | — | — |
| 🆕 | Compiled JavaScript.files | 246 | — | — |
| 🆕 | Compiled JavaScript.size | 206.30 kB | — | — |
</details>

<details>
<summary>`observability` — 55 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 32 | — | — |
| 🆕 | codebase.folders | 6 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 12 | — | — |
| 🆕 | codebase.javascript.classes | 4 | — | — |
| 🆕 | codebase.javascript.commentLines | 175 | — | — |
| 🆕 | codebase.javascript.comments | 125 | — | — |
| 🆕 | codebase.javascript.constants | 84 | — | — |
| 🆕 | codebase.javascript.exported | 16 | — | — |
| 🆕 | codebase.javascript.externalPackages | 7 | — | — |
| 🆕 | codebase.javascript.functions | 91 | — | — |
| 🆕 | codebase.javascript.imports | 39 | — | — |
| 🆕 | codebase.javascript.methods | 22 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 101 | — | — |
| 🆕 | codebase.javascript.testFiles | 4 | — | — |
| 🆕 | codebase.json.arrays | 19 | — | — |
| 🆕 | codebase.json.booleans | 7 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 61 | — | — |
| 🆕 | codebase.json.lines | 193 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 40 | — | — |
| 🆕 | codebase.json.properties | 108 | — | — |
| 🆕 | codebase.json.strings | 106 | — | — |
| 🆕 | codebase.json.totalNodes | 173 | — | — |
| 🆕 | codebase.linesOfCode | 1,540 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 13 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 18 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 27 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 121 | — | — |
| 🆕 | codebase.markdown.lines | 647 | — | — |
| 🆕 | codebase.markdown.links | 7 | — | — |
| 🆕 | codebase.markdown.listItems | 19 | — | — |
| 🆕 | codebase.markdown.lists | 5 | — | — |
| 🆕 | codebase.markdown.paragraphs | 62 | — | — |
| 🆕 | codebase.markdown.tableRows | 30 | — | — |
| 🆕 | codebase.markdown.tables | 8 | — | — |
| 🆕 | codebase.repositoryBytes | 84,701 | — | — |
| 🆕 | codebase.sourceFiles | 20 | — | — |
| 🆕 | codebase.typescript.decorators | 5 | — | — |
| 🆕 | codebase.typescript.docComments | 48 | — | — |
| 🆕 | codebase.typescript.files | 20 | — | — |
| 🆕 | codebase.typescript.interfaces | 6 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 1 | — | — |
| 🆕 | codebase.custom.Constants Files | 1 | — | — |
| 🆕 | codebase.custom.Types Files | 1 | — | — |
| 🆕 | codebase.custom.Utilities Files | 1 | — | — |
| 🆕 | codebase.custom.Unit Tests | 4 | — | — |
| 🆕 | codebase.custom.Static Methods | 2 | — | — |
| 🆕 | Compiled JavaScript.files | 7 | — | — |
| 🆕 | Compiled JavaScript.size | 4.69 kB | — | — |
</details>

<details>
<summary>`persistence` — 58 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 100 | — | — |
| 🆕 | codebase.folders | 12 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 272 | — | — |
| 🆕 | codebase.javascript.classes | 36 | — | — |
| 🆕 | codebase.javascript.commentLines | 616 | — | — |
| 🆕 | codebase.javascript.comments | 360 | — | — |
| 🆕 | codebase.javascript.constants | 585 | — | — |
| 🆕 | codebase.javascript.exported | 147 | — | — |
| 🆕 | codebase.javascript.externalPackages | 22 | — | — |
| 🆕 | codebase.javascript.functions | 610 | — | — |
| 🆕 | codebase.javascript.imports | 409 | — | — |
| 🆕 | codebase.javascript.methods | 62 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 400 | — | — |
| 🆕 | codebase.javascript.testFiles | 35 | — | — |
| 🆕 | codebase.json.arrays | 13 | — | — |
| 🆕 | codebase.json.booleans | 9 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 38 | — | — |
| 🆕 | codebase.json.lines | 185 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 42 | — | — |
| 🆕 | codebase.json.properties | 123 | — | — |
| 🆕 | codebase.json.strings | 100 | — | — |
| 🆕 | codebase.json.totalNodes | 165 | — | — |
| 🆕 | codebase.linesOfCode | 9,776 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 20 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 12 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 32 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 475 | — | — |
| 🆕 | codebase.markdown.lines | 1,208 | — | — |
| 🆕 | codebase.markdown.links | 6 | — | — |
| 🆕 | codebase.markdown.listItems | 45 | — | — |
| 🆕 | codebase.markdown.lists | 7 | — | — |
| 🆕 | codebase.markdown.paragraphs | 109 | — | — |
| 🆕 | codebase.markdown.tableRows | 99 | — | — |
| 🆕 | codebase.markdown.tables | 10 | — | — |
| 🆕 | codebase.repositoryBytes | 405,911 | — | — |
| 🆕 | codebase.sourceFiles | 88 | — | — |
| 🆕 | codebase.typescript.decorators | 46 | — | — |
| 🆕 | codebase.typescript.docComments | 280 | — | — |
| 🆕 | codebase.typescript.files | 88 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 7 | — | — |
| 🆕 | codebase.typescript.interfaces | 30 | — | — |
| 🆕 | codebase.custom.Module Files | 8 | — | — |
| 🆕 | codebase.custom.Service Files | 3 | — | — |
| 🆕 | codebase.custom.Command Files | 2 | — | — |
| 🆕 | codebase.custom.Constants Files | 6 | — | — |
| 🆕 | codebase.custom.Types Files | 6 | — | — |
| 🆕 | codebase.custom.Utilities Files | 6 | — | — |
| 🆕 | codebase.custom.TypeORM Entities | 6 | — | — |
| 🆕 | codebase.custom.Unit Tests | 20 | — | — |
| 🆕 | codebase.custom.Integration Tests | 14 | — | — |
| 🆕 | codebase.custom.End To End Tests | 1 | — | — |
| 🆕 | codebase.custom.Static Methods | 1 | — | — |
</details>

<details open>
<summary>`presentation` — 50 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 20 | — | — |
| 🆕 | codebase.css.atRules | 12 | — | — |
| 🆕 | codebase.css.comments | 17 | — | — |
| 🆕 | codebase.css.customProperties | 117 | — | — |
| 🆕 | codebase.css.declarations | 124 | — | — |
| 🆕 | codebase.css.files | 1 | — | — |
| 🆕 | codebase.css.lines | 213 | — | — |
| 🆕 | codebase.css.rules | 9 | — | — |
| 🆕 | codebase.css.selectors | 10 | — | — |
| 🆕 | codebase.folders | 2 | — | — |
| 🆕 | codebase.javascript.commentLines | 61 | — | — |
| 🆕 | codebase.javascript.comments | 25 | — | — |
| 🆕 | codebase.javascript.constants | 2 | — | — |
| 🆕 | codebase.javascript.externalPackages | 6 | — | — |
| 🆕 | codebase.javascript.files | 2 | — | — |
| 🆕 | codebase.javascript.functions | 1 | — | — |
| 🆕 | codebase.javascript.imports | 10 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 1 | — | — |
| 🆕 | codebase.json.arrays | 10 | — | — |
| 🆕 | codebase.json.booleans | 7 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 25 | — | — |
| 🆕 | codebase.json.lines | 161 | — | — |
| 🆕 | codebase.json.maxDepth | 5 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 36 | — | — |
| 🆕 | codebase.json.properties | 119 | — | — |
| 🆕 | codebase.json.strings | 94 | — | — |
| 🆕 | codebase.json.totalNodes | 148 | — | — |
| 🆕 | codebase.linesOfCode | 411 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 29 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 23 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 51 | — | — |
| 🆕 | codebase.markdown.images | 166 | — | — |
| 🆕 | codebase.markdown.inlineCode | 86 | — | — |
| 🆕 | codebase.markdown.lines | 1,365 | — | — |
| 🆕 | codebase.markdown.links | 30 | — | — |
| 🆕 | codebase.markdown.listItems | 141 | — | — |
| 🆕 | codebase.markdown.lists | 15 | — | — |
| 🆕 | codebase.markdown.paragraphs | 197 | — | — |
| 🆕 | codebase.markdown.tableRows | 16 | — | — |
| 🆕 | codebase.markdown.tables | 3 | — | — |
| 🆕 | codebase.repositoryBytes | 108,282 | — | — |
| 🆕 | codebase.sourceFiles | 9 | — | — |
| 🆕 | codebase.typescript.docComments | 3 | — | — |
| 🆕 | codebase.typescript.files | 7 | — | — |
| 🆕 | Library bundle.files | 1 | — | — |
| ❗ | Library bundle.size | 492.25 kB | — | — |
</details>

<details>
<summary>`testing` — 53 changed</summary>

| | Metric | Value | `main` | Change |
|--|--------|-------|--------|--------|
| 🆕 | codebase.files | 74 | — | — |
| 🆕 | codebase.folders | 18 | — | — |
| 🆕 | codebase.javascript.asyncFunctions | 56 | — | — |
| 🆕 | codebase.javascript.classes | 7 | — | — |
| 🆕 | codebase.javascript.commentLines | 210 | — | — |
| 🆕 | codebase.javascript.comments | 142 | — | — |
| 🆕 | codebase.javascript.constants | 152 | — | — |
| 🆕 | codebase.javascript.exported | 58 | — | — |
| 🆕 | codebase.javascript.externalPackages | 21 | — | — |
| 🆕 | codebase.javascript.functions | 262 | — | — |
| 🆕 | codebase.javascript.imports | 168 | — | — |
| 🆕 | codebase.javascript.methods | 4 | — | — |
| 🆕 | codebase.javascript.syncFunctions | 210 | — | — |
| 🆕 | codebase.javascript.testFiles | 17 | — | — |
| 🆕 | codebase.json.arrays | 14 | — | — |
| 🆕 | codebase.json.booleans | 9 | — | — |
| 🆕 | codebase.json.files | 4 | — | — |
| 🆕 | codebase.json.items | 41 | — | — |
| 🆕 | codebase.json.lines | 189 | — | — |
| 🆕 | codebase.json.maxDepth | 7 | — | — |
| 🆕 | codebase.json.numbers | 1 | — | — |
| 🆕 | codebase.json.objects | 41 | — | — |
| 🆕 | codebase.json.properties | 124 | — | — |
| 🆕 | codebase.json.strings | 104 | — | — |
| 🆕 | codebase.json.totalNodes | 169 | — | — |
| 🆕 | codebase.linesOfCode | 2,672 | — | — |
| 🆕 | codebase.markdown.codeBlocks | 27 | — | — |
| 🆕 | codebase.markdown.files | 6 | — | — |
| 🆕 | codebase.markdown.headingLevel1 | 2 | — | — |
| 🆕 | codebase.markdown.headingLevel2 | 12 | — | — |
| 🆕 | codebase.markdown.headingLevel3 | 27 | — | — |
| 🆕 | codebase.markdown.images | 165 | — | — |
| 🆕 | codebase.markdown.inlineCode | 467 | — | — |
| 🆕 | codebase.markdown.lines | 888 | — | — |
| 🆕 | codebase.markdown.links | 5 | — | — |
| 🆕 | codebase.markdown.listItems | 24 | — | — |
| 🆕 | codebase.markdown.lists | 3 | — | — |
| 🆕 | codebase.markdown.paragraphs | 73 | — | — |
| 🆕 | codebase.markdown.tableRows | 119 | — | — |
| 🆕 | codebase.markdown.tables | 5 | — | — |
| 🆕 | codebase.repositoryBytes | 145,095 | — | — |
| 🆕 | codebase.sourceFiles | 62 | — | — |
| 🆕 | codebase.typescript.decorators | 5 | — | — |
| 🆕 | codebase.typescript.docComments | 109 | — | — |
| 🆕 | codebase.typescript.files | 62 | — | — |
| 🆕 | codebase.typescript.genericDeclarations | 5 | — | — |
| 🆕 | codebase.typescript.interfaces | 13 | — | — |
| 🆕 | codebase.custom.Module Files | 1 | — | — |
| 🆕 | codebase.custom.Service Files | 2 | — | — |
| 🆕 | codebase.custom.Constants Files | 6 | — | — |
| 🆕 | codebase.custom.Types Files | 7 | — | — |
| 🆕 | codebase.custom.Utilities Files | 13 | — | — |
| 🆕 | codebase.custom.Unit Tests | 15 | — | — |
</details>

*Updated automatically when you push new commits.*
<!-- codometer-changes:end -->

Signed-off-by: dependabot[bot] <support@github.com>
Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

### 🔧 Chores

* **dependencies:** 🔧 bump @graphql-codegen/typed-document-node from 7.2.0 to 8.0.0 ([#2259](https://github.com/organizzolini/codebase/issues/2259)) ([b1f33a5](https://github.com/organizzolini/codebase/commit/b1f33a5f0af17c991f5281522b4eef60b9bef6e8))

## [4.0.1](https://github.com/organizzolini/codebase/compare/v4.0.0...v4.0.1) (2026-11-12)

### 🐛 Bug Fixes

* **infrastructure:** 🐛 read terraform state from the bucket root ([#2265](https://github.com/organizzolini/codebase/issues/2265)) ([2eb78c5](https://github.com/organizzolini/codebase/commit/2eb78c5ae8e2e2ce7279adaa7cd62d60016c26a4)), closes [#2264](https://github.com/organizzolini/codebase/issues/2264)

## [4.0.0](https://github.com/organizzolini/codebase/compare/v3.63.0...v4.0.0) (2026-11-12)

### ⚠ BREAKING CHANGES

* **dependencies:** GraphQL 14 and 15 are no
longer supported. The <code>graphql</code> peer dependency is now
<code>^16.0.0 || ^17.0.0</code>, so upgrade <code>graphql</code>
to version 16 or 17 before updating to this version.</p>
</li>
<li>
<p><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11075">#11075</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Thanks <a
href="https://github.com/eddeee888"><code>@​eddeee888</code></a>! -
* **dependencies:** Node.js versions below
22.18.0 are no longer supported. Upgrade to Node.js 22.18.0 or later
before updating to this
version.</p>
</li>
<li>
<p><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11075">#11075</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Thanks <a
href="https://github.com/eddeee888"><code>@​eddeee888</code></a>! -
* **dependencies:** Remove the deprecated
<code>emitLegacyCommonJSImports</code> config option and the
<code>--emit-legacy-common-js-imports</code> CLI flag</p>
<p>Use <code>importExtension</code> (or <code>--import-extension</code>)
to set the extension appended to relative imports.
When <code>importExtension</code> is not set, no extension is
appended.</p>
<p><code>@graphql-codegen/plugin-helpers</code> no longer exports
<code>normalizeImportExtension</code>. Use
<code>importExtension ?? ''</code> instead.</p>
<p>Migration:</p>
<pre lang="diff"><code> const config: CodegenConfig = {
-  emitLegacyCommonJSImports: false,
+  importExtension: '.js',
 };
</code></pre>
</li>
</ul>
<h3>Minor Changes</h3>
<ul>
<li>
<p><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11103">#11103</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/409ffbfda5c56d6f46f0e0a4045c547714df2264"><code>409ffbf</code></a>
Thanks <a
href="https://github.com/jerelmiller"><code>@​jerelmiller</code></a>! -
Add support for graphql v17 fragment
arguments (<code>experimentalFragmentArguments</code>).</p>
<p>To use fragment arguments, set the parser option in the root
<code>config</code>:</p>
<pre lang="ts"><code>const config: CodegenConfig = {
  config: { experimentalFragmentArguments: true }
  // ...
}
</code></pre>
</li>
</ul>
<!-- raw HTML omitted -->
</blockquote>
<p>... (truncated)</p>
</details>
<details>
<summary>Commits</summary>
<ul>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/e5a5669f4197c6db561956a9b4c47244d4e29b48"><code>e5a5669</code></a>
chore(release): update monorepo packages versions (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/operations/issues/11085">#11085</a>)</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/409ffbfda5c56d6f46f0e0a4045c547714df2264"><code>409ffbf</code></a>
Add support for GraphQL 17 experimental fragment arguments (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/operations/issues/11103">#11103</a>)</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Next major feature branch (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/operations/issues/11075">#11075</a>)</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/11ac951a30b79369d3b0aa78f83a79d309ffcc77"><code>11ac951</code></a>
test: copy dev-test fixtures into package tests (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/operations/issues/11098">#11098</a>)</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/cbefcf33b7fde93d3a44c337a4edb5f32ab38fdb"><code>cbefcf3</code></a>
Revert &quot;chore: update <a
href="https://github.com/graphql-tools"><code>@​graphql-tools</code></a>
to latest majors and drop Node below 22....</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/1161d66e36bb074809849cca9367213deed9c443"><code>1161d66</code></a>
chore: update <a
href="https://github.com/graphql-tools"><code>@​graphql-tools</code></a>
to latest majors and drop Node below 22.18 and g...</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/fc181792a6751246c416650b1e26b69fd679e9c3"><code>fc18179</code></a>
chore(release): update monorepo packages versions (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/operations/issues/11077">#11077</a>)</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/48ebd5d96fcbc7b7b9b990f98bc571d4dc37f278"><code>48ebd5d</code></a>
[typescript-operations] feat: add native-with-string-values enumType (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/operations/issues/7295">#7295</a>)
...</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/710d41525f5c2c3283e185b1ac0c94dd988630e7"><code>710d415</code></a>
chore: type-check spec files with a solution-style root tsconfig (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/operations/issues/11053">#11053</a>)</li>
<li>See full diff in <a
href="https://github.com/dotansimha/graphql-code-generator/commits/@graphql-codegen/typescript-operations@7.0.0/packages/plugins/typescript/operations">compare
view</a></li>
</ul>
</details>
<br />


[![Dependabot compatibility
score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=@graphql-codegen/typescript-operations&package-manager=npm_and_yarn&previous-version=6.1.10&new-version=7.0.0)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)

Dependabot will resolve any conflicts with this PR as long as you don't
alter it yourself. You can also trigger a rebase manually by commenting
`@dependabot rebase`.

[//]: # (dependabot-automerge-start)
[//]: # (dependabot-automerge-end)
* **dependencies:** GraphQL 14 and 15 are no
longer supported. The <code>graphql</code> peer dependency is now
<code>^16.0.0 || ^17.0.0</code>, so upgrade <code>graphql</code>
to version 16 or 17 before updating to this version.</p>
</li>
<li>
<p><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11075">#11075</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Thanks <a
href="https://github.com/eddeee888"><code>@​eddeee888</code></a>! -
* **dependencies:** Node.js versions below
22.18.0 are no longer supported. Upgrade to Node.js 22.18.0 or later
before updating to this
version.</p>
</li>
</ul>
<h3>Patch Changes</h3>
<ul>
<li>
<p><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11075">#11075</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Thanks <a
href="https://github.com/eddeee888"><code>@​eddeee888</code></a>! -
dependencies updates:</p>
<ul>
<li>Updated dependency
<a
href="https://www.npmjs.com/package/graphql/v/16.0.0"><code>graphql@^16.0.0
|| ^17.0.0</code> ↗︎</a> (from
<code>^0.12.0 || ^0.13.0 || ^14.0.0 || ^15.0.0 || ^16.0.0 ||
^17.0.0</code>, in <code>peerDependencies</code>)</li>
</ul>
</li>
<li>
<p><a
href="https://redirect.github.com/dotansimha/graphql-code-generator/pull/11075">#11075</a>
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Thanks <a
href="https://github.com/eddeee888"><code>@​eddeee888</code></a>! -
dependencies updates:</p>
<ul>
<li>Updated dependency
<a
href="https://www.npmjs.com/package/graphql/v/16.0.0"><code>graphql@^16.0.0
|| ^17.0.0</code> ↗︎</a> (from
<code>^0.12.0 || ^0.13.0 || ^14.0.0 || ^15.0.0 || ^16.0.0 ||
^17.0.0</code>, in <code>peerDependencies</code>)</li>
</ul>
</li>
<li>
<p>Updated dependencies
[<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/409ffbfda5c56d6f46f0e0a4045c547714df2264"><code>409ffbf</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>,
<a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>]:</p>
</li>
</ul>
<!-- raw HTML omitted -->
</blockquote>
<p>... (truncated)</p>
</details>
<details>
<summary>Commits</summary>
<ul>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/e5a5669f4197c6db561956a9b4c47244d4e29b48"><code>e5a5669</code></a>
chore(release): update monorepo packages versions (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/typescript/issues/11085">#11085</a>)</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/fa49a3725bf269abf07616b5df1336cf86a4838d"><code>fa49a37</code></a>
Next major feature branch (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/typescript/issues/11075">#11075</a>)</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/cbefcf33b7fde93d3a44c337a4edb5f32ab38fdb"><code>cbefcf3</code></a>
Revert &quot;chore: update <a
href="https://github.com/graphql-tools"><code>@​graphql-tools</code></a>
to latest majors and drop Node below 22....</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/1161d66e36bb074809849cca9367213deed9c443"><code>1161d66</code></a>
chore: update <a
href="https://github.com/graphql-tools"><code>@​graphql-tools</code></a>
to latest majors and drop Node below 22.18 and g...</li>
<li><a
href="https://github.com/dotansimha/graphql-code-generator/commit/710d41525f5c2c3283e185b1ac0c94dd988630e7"><code>710d415</code></a>
chore: type-check spec files with a solution-style root tsconfig (<a
href="https://github.com/dotansimha/graphql-code-generator/tree/HEAD/packages/plugins/typescript/typescript/issues/11053">#11053</a>)</li>
<li>See full diff in <a
href="https://github.com/dotansimha/graphql-code-generator/commits/@graphql-codegen/typescript@7.0.0/packages/plugins/typescript/typescript">compare
view</a></li>
</ul>
</details>
<br />


[![Dependabot compatibility
score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=@graphql-codegen/typescript&package-manager=npm_and_yarn&previous-version=6.1.2&new-version=7.0.0)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)

Dependabot will resolve any conflicts with this PR as long as you don't
alter it yourself. You can also trigger a rebase manually by commenting
`@dependabot rebase`.

[//]: # (dependabot-automerge-start)
[//]: # (dependabot-automerge-end)

### 🔧 Chores

* **dependencies:** 🔧 bump @graphql-codegen/typescript from 6.1.2 to 7.0.0 ([#2256](https://github.com/organizzolini/codebase/issues/2256)) ([112314f](https://github.com/organizzolini/codebase/commit/112314f9097f34861490c588d9711bb10ab02c4d))
* **dependencies:** 🔧 bump @graphql-codegen/typescript-operations from 6.1.10 to 7.0.0 ([#2260](https://github.com/organizzolini/codebase/issues/2260)) ([f8e07be](https://github.com/organizzolini/codebase/commit/f8e07bec759f92d9ff83a0e0462885f014d04d70))

## [3.63.0](https://github.com/organizzolini/codebase/compare/v3.62.0...v3.63.0) (2026-11-11)

### ✨ Features

* **codometer:** ✨ tighten the comment budgets and shorten every comment over them ([#2262](https://github.com/organizzolini/codebase/issues/2262)) ([7e2bdf0](https://github.com/organizzolini/codebase/commit/7e2bdf03365c8b1c0f10ab2ccfbb64a5a37d1f2b)), closes [#2261](https://github.com/organizzolini/codebase/issues/2261)

## [3.62.0](https://github.com/organizzolini/codebase/compare/v3.61.6...v3.62.0) (2026-11-10)

### ✨ Features

* **codometer:** ✨ gate JSDoc on every declaration kind and shorten long comments ([#2227](https://github.com/organizzolini/codebase/issues/2227)) ([bb1778e](https://github.com/organizzolini/codebase/commit/bb1778e84b884f2b40c1f350d6911adc4c30e2e6)), closes [#2226](https://github.com/organizzolini/codebase/issues/2226)

## [3.61.6](https://github.com/organizzolini/codebase/compare/v3.61.5...v3.61.6) (2026-11-10)

### 🐛 Bug Fixes

* **codependix,conformetry,infrastructure,installation,persistence,testing,configuration,caelundas,dependencies:** 🐛 gap ([#2223](https://github.com/organizzolini/codebase/issues/2223)) ([4a49195](https://github.com/organizzolini/codebase/commit/4a4919570756f489c4dbf7b7b169c9bc6fdc5547)), closes [#2221](https://github.com/organizzolini/codebase/issues/2221)

## [3.61.5](https://github.com/organizzolini/codebase/compare/v3.61.4...v3.61.5) (2026-11-10)

## [3.61.4](https://github.com/organizzolini/codebase/compare/v3.61.3...v3.61.4) (2026-11-10)

### ⚡ Performance Improvements

* **integration,codometer:** ⚡️ judge every project's codometer limits from one batched run ([#2244](https://github.com/organizzolini/codebase/issues/2244)) ([283f014](https://github.com/organizzolini/codebase/commit/283f014b00563a7a455d190e27bebeb0bfe34d89)), closes [#2242](https://github.com/organizzolini/codebase/issues/2242) [#2112](https://github.com/organizzolini/codebase/issues/2112) [#2113](https://github.com/organizzolini/codebase/issues/2113)

### ♻️ Code Refactoring

* **caelundas:** ♻️ move events utilities into services and submodules ([#2220](https://github.com/organizzolini/codebase/issues/2220)) ([0dfa25b](https://github.com/organizzolini/codebase/commit/0dfa25b763d36ba5928558d5b74402a68ea88b2e)), closes [#2214](https://github.com/organizzolini/codebase/issues/2214) [#2211](https://github.com/organizzolini/codebase/issues/2211) [#2216](https://github.com/organizzolini/codebase/issues/2216)

## [3.61.3](https://github.com/organizzolini/codebase/compare/v3.61.2...v3.61.3) (2026-11-10)

### ♻️ Code Refactoring

* **caelundas:** ♻️ move night-sky utilities into services ([#2215](https://github.com/organizzolini/codebase/issues/2215)) ([af55d43](https://github.com/organizzolini/codebase/commit/af55d43228f18a3dea7dd6cfd4dc35111d15be94)), closes [#2213](https://github.com/organizzolini/codebase/issues/2213) [#2211](https://github.com/organizzolini/codebase/issues/2211)
* **caelundas:** ♻️ rename the caelundas-api vocabulary to windows, periods and presets ([#2216](https://github.com/organizzolini/codebase/issues/2216)) ([10e62f5](https://github.com/organizzolini/codebase/commit/10e62f5254fee26eebc3a418004273dbb0d263a9)), closes [#2212](https://github.com/organizzolini/codebase/issues/2212) [#2211](https://github.com/organizzolini/codebase/issues/2211)

## [3.61.2](https://github.com/organizzolini/codebase/compare/v3.61.1...v3.61.2) (2026-11-10)

## [3.61.1](https://github.com/organizzolini/codebase/compare/v3.61.0...v3.61.1) (2026-11-10)

### ♻️ Code Refactoring

* **configuration,deployment,integration:** ♻️ rename publication to deployment and move its gate to integration ([#2193](https://github.com/organizzolini/codebase/issues/2193)) ([0440302](https://github.com/organizzolini/codebase/commit/04403028a23422aa80ed9fa03f7d6a57401dcbe4)), closes [#2192](https://github.com/organizzolini/codebase/issues/2192)

## [3.61.0](https://github.com/organizzolini/codebase/compare/v3.60.0...v3.61.0) (2026-11-10)

### ✨ Features

* **caelundas:** ✨ control night sky and calendar opacity from the Sky menu ([#2222](https://github.com/organizzolini/codebase/issues/2222)) ([c34e799](https://github.com/organizzolini/codebase/commit/c34e799528a8386b38e369f356e8b5bee1de19f3)), closes [#2218](https://github.com/organizzolini/codebase/issues/2218)

## [3.60.0](https://github.com/organizzolini/codebase/compare/v3.59.5...v3.60.0) (2026-11-10)

### ✨ Features

* **callidescope,codependix,codometer,coinagerie,configuration:** ✨ write tool markdown to adjacent files ([#2225](https://github.com/organizzolini/codebase/issues/2225)) ([9649098](https://github.com/organizzolini/codebase/commit/96490981a3429a535ed79e290e5a4ba1ca225dc6)), closes [#2224](https://github.com/organizzolini/codebase/issues/2224)

### ♻️ Code Refactoring

* **compliance,documentation:** ♻️ add a manage-project skill and rename audit-governance to audit-files ([#2191](https://github.com/organizzolini/codebase/issues/2191)) ([8e39566](https://github.com/organizzolini/codebase/commit/8e3956672947398748b4b7fafdde15698a3d99b7)), closes [#2190](https://github.com/organizzolini/codebase/issues/2190)

## [3.59.5](https://github.com/organizzolini/codebase/compare/v3.59.4...v3.59.5) (2026-11-09)

### 🐛 Bug Fixes

* **configuration,testing:** 🐛 ratchet conformetry thresholds per project and adopt the testing package in templates ([#1883](https://github.com/organizzolini/codebase/issues/1883)) ([1591212](https://github.com/organizzolini/codebase/commit/159121295ebed0ab9991e4dede93682398dcd2a3)), closes [#1850](https://github.com/organizzolini/codebase/issues/1850) [#1851](https://github.com/organizzolini/codebase/issues/1851) [#1852](https://github.com/organizzolini/codebase/issues/1852) [#1832](https://github.com/organizzolini/codebase/issues/1832) [#329](https://github.com/organizzolini/codebase/issues/329) [#1877](https://github.com/organizzolini/codebase/issues/1877) [#1850](https://github.com/organizzolini/codebase/issues/1850) [#1851](https://github.com/organizzolini/codebase/issues/1851) [#1852](https://github.com/organizzolini/codebase/issues/1852)

## [3.59.4](https://github.com/organizzolini/codebase/compare/v3.59.3...v3.59.4) (2026-11-09)

### 🐛 Bug Fixes

* **caelundas:** 🐛 add a not-found page to the web calendar ([#2204](https://github.com/organizzolini/codebase/issues/2204)) ([680a326](https://github.com/organizzolini/codebase/commit/680a326123375cd1d21a0d18f220149d8300a037)), closes [#2201](https://github.com/organizzolini/codebase/issues/2201)
* **caelundas:** 🐛 draw the night sky from the stars in Postgres ([#2205](https://github.com/organizzolini/codebase/issues/2205)) ([d249016](https://github.com/organizzolini/codebase/commit/d249016aa691369651a83a64dd35df52a74ee246)), closes [#2202](https://github.com/organizzolini/codebase/issues/2202)
* **configuration:** 🐛 let the request exception handler log raw errors ([#2203](https://github.com/organizzolini/codebase/issues/2203)) ([60e1a66](https://github.com/organizzolini/codebase/commit/60e1a6641a1f8c7d449817dfc6d0c605ee48e6fc)), closes [#2200](https://github.com/organizzolini/codebase/issues/2200)
* **testing,configuration:** 🐛 add the common testing package with its adapters ([#1877](https://github.com/organizzolini/codebase/issues/1877)) ([ed17e83](https://github.com/organizzolini/codebase/commit/ed17e83ae1a07d3e9d86c17a288bbb10fb130e0d)), closes [#1831](https://github.com/organizzolini/codebase/issues/1831) [#329](https://github.com/organizzolini/codebase/issues/329) [#1844](https://github.com/organizzolini/codebase/issues/1844) [#1845](https://github.com/organizzolini/codebase/issues/1845) [#1846](https://github.com/organizzolini/codebase/issues/1846) [#1847](https://github.com/organizzolini/codebase/issues/1847) [#1848](https://github.com/organizzolini/codebase/issues/1848) [#1849](https://github.com/organizzolini/codebase/issues/1849)

## [3.59.3](https://github.com/organizzolini/codebase/compare/v3.59.2...v3.59.3) (2026-11-09)

### 🐛 Bug Fixes

* **dependencies:** 🐛 align Stylelint core and config versions ([#2194](https://github.com/organizzolini/codebase/issues/2194)) ([01d16c2](https://github.com/organizzolini/codebase/commit/01d16c2a3e4ec23a98ddc7e598e0935ece7e1be5)), closes [#2189](https://github.com/organizzolini/codebase/issues/2189)

## [3.59.2](https://github.com/organizzolini/codebase/compare/v3.59.1...v3.59.2) (2026-11-08)

### 🐛 Bug Fixes

* **conformetry,dependencies:** 🐛 align notebook dependency template ([#2188](https://github.com/organizzolini/codebase/issues/2188)) ([4f94366](https://github.com/organizzolini/codebase/commit/4f94366f1df826022ceee166890e7132a9c2f1dc)), closes [#2187](https://github.com/organizzolini/codebase/issues/2187) [#2174](https://github.com/organizzolini/codebase/issues/2174)

## [3.59.1](https://github.com/organizzolini/codebase/compare/v3.59.0...v3.59.1) (2026-11-08)

### ♻️ Code Refactoring

* **lexico-db,lexico,lexico-cli,configuration:** ♻️ rename lexico-entities to lexico-db and split its modules ([#2185](https://github.com/organizzolini/codebase/issues/2185)) ([da2974e](https://github.com/organizzolini/codebase/commit/da2974e13b259606fe855e6360e7e3e4ec7e8549)), closes [#2184](https://github.com/organizzolini/codebase/issues/2184)

## [3.59.0](https://github.com/organizzolini/codebase/compare/v3.58.1...v3.59.0) (2026-11-07)

### ✨ Features

* **caelundas,configuration,persistence:** ✨ serve the calendar from caelundas-api on Postgres ([#2171](https://github.com/organizzolini/codebase/issues/2171)) ([0703cd5](https://github.com/organizzolini/codebase/commit/0703cd5118344b9caa8f44e6851da9d559509f8c)), closes [#2122](https://github.com/organizzolini/codebase/issues/2122) [#2118](https://github.com/organizzolini/codebase/issues/2118) [#2121](https://github.com/organizzolini/codebase/issues/2121) [#2154](https://github.com/organizzolini/codebase/issues/2154) [#2157](https://github.com/organizzolini/codebase/issues/2157) [#2158](https://github.com/organizzolini/codebase/issues/2158) [#1886](https://github.com/organizzolini/codebase/issues/1886) [#1898](https://github.com/organizzolini/codebase/issues/1898) [#1901](https://github.com/organizzolini/codebase/issues/1901) [#1905](https://github.com/organizzolini/codebase/issues/1905) [#1911](https://github.com/organizzolini/codebase/issues/1911) [#1915](https://github.com/organizzolini/codebase/issues/1915) [#1921](https://github.com/organizzolini/codebase/issues/1921) [#1926](https://github.com/organizzolini/codebase/issues/1926) [#1931](https://github.com/organizzolini/codebase/issues/1931) [#1937](https://github.com/organizzolini/codebase/issues/1937) [#1941](https://github.com/organizzolini/codebase/issues/1941) [#1947](https://github.com/organizzolini/codebase/issues/1947) [#2141](https://github.com/organizzolini/codebase/issues/2141) [#2147](https://github.com/organizzolini/codebase/issues/2147) [#2164](https://github.com/organizzolini/codebase/issues/2164) [#2126](https://github.com/organizzolini/codebase/issues/2126) [#2130](https://github.com/organizzolini/codebase/issues/2130) [#2134](https://github.com/organizzolini/codebase/issues/2134) [#2116](https://github.com/organizzolini/codebase/issues/2116) [#2122](https://github.com/organizzolini/codebase/issues/2122) [#2161](https://github.com/organizzolini/codebase/issues/2161) [#2162](https://github.com/organizzolini/codebase/issues/2162) [#2163](https://github.com/organizzolini/codebase/issues/2163) [#2166](https://github.com/organizzolini/codebase/issues/2166) [#1899](https://github.com/organizzolini/codebase/issues/1899) [#1900](https://github.com/organizzolini/codebase/issues/1900) [#1902](https://github.com/organizzolini/codebase/issues/1902) [#1903](https://github.com/organizzolini/codebase/issues/1903) [#1904](https://github.com/organizzolini/codebase/issues/1904) [#2150](https://github.com/organizzolini/codebase/issues/2150) [#1906](https://github.com/organizzolini/codebase/issues/1906) [#1907](https://github.com/organizzolini/codebase/issues/1907) [#1908](https://github.com/organizzolini/codebase/issues/1908) [#1909](https://github.com/organizzolini/codebase/issues/1909) [#1910](https://github.com/organizzolini/codebase/issues/1910) [#1912](https://github.com/organizzolini/codebase/issues/1912) [#1913](https://github.com/organizzolini/codebase/issues/1913) [#1914](https://github.com/organizzolini/codebase/issues/1914) [#1916](https://github.com/organizzolini/codebase/issues/1916) [#1917](https://github.com/organizzolini/codebase/issues/1917) [#1918](https://github.com/organizzolini/codebase/issues/1918) [#1919](https://github.com/organizzolini/codebase/issues/1919) [#1920](https://github.com/organizzolini/codebase/issues/1920) [#1922](https://github.com/organizzolini/codebase/issues/1922) [#1923](https://github.com/organizzolini/codebase/issues/1923) [#1924](https://github.com/organizzolini/codebase/issues/1924) [#1925](https://github.com/organizzolini/codebase/issues/1925) [#1927](https://github.com/organizzolini/codebase/issues/1927) [#1928](https://github.com/organizzolini/codebase/issues/1928) [#1929](https://github.com/organizzolini/codebase/issues/1929) [#1930](https://github.com/organizzolini/codebase/issues/1930) [#1932](https://github.com/organizzolini/codebase/issues/1932) [#1933](https://github.com/organizzolini/codebase/issues/1933) [#1934](https://github.com/organizzolini/codebase/issues/1934) [#1935](https://github.com/organizzolini/codebase/issues/1935) [#1936](https://github.com/organizzolini/codebase/issues/1936) [#1938](https://github.com/organizzolini/codebase/issues/1938) [#1939](https://github.com/organizzolini/codebase/issues/1939) [#1940](https://github.com/organizzolini/codebase/issues/1940) [#1942](https://github.com/organizzolini/codebase/issues/1942) [#1943](https://github.com/organizzolini/codebase/issues/1943) [#1944](https://github.com/organizzolini/codebase/issues/1944) [#1945](https://github.com/organizzolini/codebase/issues/1945) [#1946](https://github.com/organizzolini/codebase/issues/1946) [#1948](https://github.com/organizzolini/codebase/issues/1948) [#1949](https://github.com/organizzolini/codebase/issues/1949) [#1950](https://github.com/organizzolini/codebase/issues/1950) [#2127](https://github.com/organizzolini/codebase/issues/2127) [#2128](https://github.com/organizzolini/codebase/issues/2128) [#2129](https://github.com/organizzolini/codebase/issues/2129) [#2131](https://github.com/organizzolini/codebase/issues/2131) [#2132](https://github.com/organizzolini/codebase/issues/2132) [#2133](https://github.com/organizzolini/codebase/issues/2133) [#2135](https://github.com/organizzolini/codebase/issues/2135) [#2136](https://github.com/organizzolini/codebase/issues/2136) [#2137](https://github.com/organizzolini/codebase/issues/2137) [#2138](https://github.com/organizzolini/codebase/issues/2138) [#2139](https://github.com/organizzolini/codebase/issues/2139) [#2140](https://github.com/organizzolini/codebase/issues/2140) [#2142](https://github.com/organizzolini/codebase/issues/2142) [#2143](https://github.com/organizzolini/codebase/issues/2143) [#2144](https://github.com/organizzolini/codebase/issues/2144) [#2145](https://github.com/organizzolini/codebase/issues/2145) [#2146](https://github.com/organizzolini/codebase/issues/2146) [#2148](https://github.com/organizzolini/codebase/issues/2148) [#2149](https://github.com/organizzolini/codebase/issues/2149) [#2165](https://github.com/organizzolini/codebase/issues/2165) [#1895](https://github.com/organizzolini/codebase/issues/1895) [#1896](https://github.com/organizzolini/codebase/issues/1896) [#1897](https://github.com/organizzolini/codebase/issues/1897)

## [3.58.1](https://github.com/organizzolini/codebase/compare/v3.58.0...v3.58.1) (2026-11-07)

### 🐛 Bug Fixes

* **configuration:** 🐛 ignore any database library name in spell-check ([#2183](https://github.com/organizzolini/codebase/issues/2183)) ([638d741](https://github.com/organizzolini/codebase/commit/638d74156f580ec8dc043d58a45b2ac43c71681f)), closes [#2182](https://github.com/organizzolini/codebase/issues/2182)

## [3.58.0](https://github.com/organizzolini/codebase/compare/v3.57.0...v3.58.0) (2026-11-06)

### ✨ Features

* **caelundas,documentation:** ✨ store the calendar and its read model in Postgres through caelundas-db ([#2119](https://github.com/organizzolini/codebase/issues/2119)) ([ea2ff03](https://github.com/organizzolini/codebase/commit/ea2ff03d2db7e9e1cd6546c552b5ac06505edc03)), closes [#2134](https://github.com/organizzolini/codebase/issues/2134) [#1905](https://github.com/organizzolini/codebase/issues/1905) [#1886](https://github.com/organizzolini/codebase/issues/1886) [#2117](https://github.com/organizzolini/codebase/issues/2117) [#2135](https://github.com/organizzolini/codebase/issues/2135) [#2136](https://github.com/organizzolini/codebase/issues/2136) [#2137](https://github.com/organizzolini/codebase/issues/2137) [#2138](https://github.com/organizzolini/codebase/issues/2138) [#2139](https://github.com/organizzolini/codebase/issues/2139) [#2140](https://github.com/organizzolini/codebase/issues/2140)
* **caelundas,infrastructure:** ✨ scaffold the caelundas-db library and register its database ([#2117](https://github.com/organizzolini/codebase/issues/2117)) ([7caf6c3](https://github.com/organizzolini/codebase/commit/7caf6c363442d4c9510f4d5781af8196e0082f57)), closes [#1898](https://github.com/organizzolini/codebase/issues/1898) [#2130](https://github.com/organizzolini/codebase/issues/2130) [#1886](https://github.com/organizzolini/codebase/issues/1886) [#1899](https://github.com/organizzolini/codebase/issues/1899) [#1900](https://github.com/organizzolini/codebase/issues/1900) [#2131](https://github.com/organizzolini/codebase/issues/2131) [#2132](https://github.com/organizzolini/codebase/issues/2132) [#2133](https://github.com/organizzolini/codebase/issues/2133)

### ♻️ Code Refactoring

* **compliance,configuration,documentation:** ♻️ move the compliance project to the workspace root ([#2170](https://github.com/organizzolini/codebase/issues/2170)) ([fdf7f2f](https://github.com/organizzolini/codebase/commit/fdf7f2f62cc04f21347a4353264641298dca0ef3)), closes [#2169](https://github.com/organizzolini/codebase/issues/2169) [organizzolini/codebase#2058](https://github.com/organizzolini/codebase/issues/2058)
* **persistence,lexico-entities:** ♻️ share one plural snake-case naming strategy across projects ([#2152](https://github.com/organizzolini/codebase/issues/2152)) ([02990cc](https://github.com/organizzolini/codebase/commit/02990cc0b6357bfe6caac0791c2bf75d218356bd)), closes [#2126](https://github.com/organizzolini/codebase/issues/2126) [#1886](https://github.com/organizzolini/codebase/issues/1886) [#2127](https://github.com/organizzolini/codebase/issues/2127) [#2128](https://github.com/organizzolini/codebase/issues/2128) [#2129](https://github.com/organizzolini/codebase/issues/2129)

## [3.57.0](https://github.com/organizzolini/codebase/compare/v3.56.0...v3.57.0) (2026-11-06)

### ✨ Features

* **compliance,configuration,documentation:** ✨ migrate external-resource commands ([#2058](https://github.com/organizzolini/codebase/issues/2058)) ([e5f9924](https://github.com/organizzolini/codebase/commit/e5f9924bb947623e32b2832a81f09745c02344eb)), closes [#1980](https://github.com/organizzolini/codebase/issues/1980) [#2055](https://github.com/organizzolini/codebase/issues/2055) [#1981](https://github.com/organizzolini/codebase/issues/1981)

## [3.56.0](https://github.com/organizzolini/codebase/compare/v3.55.1...v3.56.0) (2026-11-06)

### ✨ Features

* **integration,installation:** ✨ read the shared nx cache bucket locally and set it up with the machine ([#2160](https://github.com/organizzolini/codebase/issues/2160)) ([8d1c0f8](https://github.com/organizzolini/codebase/commit/8d1c0f8c395843f77d2dcbdfb5fb55fd212d5322))

### 📝 Documentation

* **integration:** 📝 remove the nx cloud badge from the readme ([#2159](https://github.com/organizzolini/codebase/issues/2159)) ([e1f04c9](https://github.com/organizzolini/codebase/commit/e1f04c9f562d519e5825cde52cab51210bec8cf9))

## [3.55.1](https://github.com/organizzolini/codebase/compare/v3.55.0...v3.55.1) (2026-11-06)

### 🐛 Bug Fixes

* **installation:** 🐛 retry the postgresql apt key download ([#2156](https://github.com/organizzolini/codebase/issues/2156)) ([dfc266d](https://github.com/organizzolini/codebase/commit/dfc266d245736028c05c849ed6c8b44b194bf3f1))

## [3.55.0](https://github.com/organizzolini/codebase/compare/v3.54.1...v3.55.0) (2026-11-06)

### ✨ Features

* **infrastructure:** ✨ add the organizzolini-codebase-terraform-state bucket and its move runbook ([#2153](https://github.com/organizzolini/codebase/issues/2153)) ([e77e817](https://github.com/organizzolini/codebase/commit/e77e8172d1749fa6039536d2b564fcc6f14fbbb8))

## [3.54.1](https://github.com/organizzolini/codebase/compare/v3.54.0...v3.54.1) (2026-11-06)

### 🐛 Bug Fixes

* **infrastructure:** 🐛 give the nx cache bucket a provisioning key for its lifecycle rule ([#2151](https://github.com/organizzolini/codebase/issues/2151)) ([29270fd](https://github.com/organizzolini/codebase/commit/29270fd5b3adf30a481e2e21da942fb137f46602))

## [3.54.0](https://github.com/organizzolini/codebase/compare/v3.53.4...v3.54.0) (2026-11-06)

### ✨ Features

* **integration:** ✨ back the shared nx cache with a linode bucket and drop nx cloud ([#2124](https://github.com/organizzolini/codebase/issues/2124)) ([ecfce41](https://github.com/organizzolini/codebase/commit/ecfce4112831f7243d6c1ee0734a7fc17be1a581)), closes [#2125](https://github.com/organizzolini/codebase/issues/2125)

## [3.53.4](https://github.com/organizzolini/codebase/compare/v3.53.3...v3.53.4) (2026-11-06)

### ⚡ Performance Improvements

* **coinagerie:** ⚡️ judge every project's glossary from one batched command-line run ([#2115](https://github.com/organizzolini/codebase/issues/2115)) ([8e84f05](https://github.com/organizzolini/codebase/commit/8e84f05e01bafe7815132bc0bdd2c7e5e5f2e91d))

### 📝 Documentation

* **configuration,caelundas:** 📝 exclude generic words from the glossaries ([#2114](https://github.com/organizzolini/codebase/issues/2114)) ([0018f71](https://github.com/organizzolini/codebase/commit/0018f716fcf6b31514870bac0b1476a0e8ca9529))

## [3.53.3](https://github.com/organizzolini/codebase/compare/v3.53.2...v3.53.3) (2026-11-04)

### ⚡ Performance Improvements

* **integration:** ⚡️ judge every project's spell check from one batched cspell run ([#2113](https://github.com/organizzolini/codebase/issues/2113)) ([300ac43](https://github.com/organizzolini/codebase/commit/300ac435ff0ca7fb237f1aaf8fc2e12e44cc4ff2))

### 📝 Documentation

* **configuration:** 📝 define the glossary words ([#2106](https://github.com/organizzolini/codebase/issues/2106)) ([bec52d7](https://github.com/organizzolini/codebase/commit/bec52d7b9b756e41c8e46936a56a54b4bcc2263c))

## [3.53.2](https://github.com/organizzolini/codebase/compare/v3.53.1...v3.53.2) (2026-11-04)

### ⚡ Performance Improvements

* **codependix:** ⚡️ judge every project from one batched boundary check ([#2111](https://github.com/organizzolini/codebase/issues/2111)) ([8f0ce0b](https://github.com/organizzolini/codebase/commit/8f0ce0ba6502bb7f1439f733b460bf0256726abc))
* **configuration,integration:** ⚡️ judge every project's knip check from one batched run ([#2112](https://github.com/organizzolini/codebase/issues/2112)) ([3d5f141](https://github.com/organizzolini/codebase/commit/3d5f1413e15b909827d6d95a16774ef5e33fbc72))

## [3.53.1](https://github.com/organizzolini/codebase/compare/v3.53.0...v3.53.1) (2026-11-04)

### ⚡ Performance Improvements

* **callidescope:** ⚡️ gate every project from one batched trace ([#2107](https://github.com/organizzolini/codebase/issues/2107)) ([e10441f](https://github.com/organizzolini/codebase/commit/e10441f9aa2ebd501217c341774cb5515297e265))

## [3.53.0](https://github.com/organizzolini/codebase/compare/v3.52.3...v3.53.0) (2026-11-04)

### ✨ Features

* **coinagerie:** ✨ accept regular expressions in exclude.words ([#2109](https://github.com/organizzolini/codebase/issues/2109)) ([d79fb01](https://github.com/organizzolini/codebase/commit/d79fb0190272300bb7bbde7c7821de0e77770c3f))

## [3.52.3](https://github.com/organizzolini/codebase/compare/v3.52.2...v3.52.3) (2026-11-04)

## [3.52.2](https://github.com/organizzolini/codebase/compare/v3.52.1...v3.52.2) (2026-11-04)

## [3.52.1](https://github.com/organizzolini/codebase/compare/v3.52.0...v3.52.1) (2026-11-04)

## [3.52.0](https://github.com/organizzolini/codebase/compare/v3.51.3...v3.52.0) (2026-11-04)

### ✨ Features

* **coinagerie:** 📦️ publish coinagerie to npm ([#2088](https://github.com/organizzolini/codebase/issues/2088)) ([1ccd418](https://github.com/organizzolini/codebase/commit/1ccd418e4a5936ce64456897e2437d88dcaf24ac)), closes [#1793](https://github.com/organizzolini/codebase/issues/1793) [#1794](https://github.com/organizzolini/codebase/issues/1794) [#1795](https://github.com/organizzolini/codebase/issues/1795) [#1749](https://github.com/organizzolini/codebase/issues/1749) [#2087](https://github.com/organizzolini/codebase/issues/2087)

### 🐛 Bug Fixes

* **configuration:** 🐛 stop disabling Nx Cloud so the remote cache connects ([#2101](https://github.com/organizzolini/codebase/issues/2101)) ([71b24f5](https://github.com/organizzolini/codebase/commit/71b24f57b2aba5d40e98290e4b31d4db70b81482))

### ⚡ Performance Improvements

* **conformetry:** ⚡️ expand each instance glob once per inferTargets pass ([#2102](https://github.com/organizzolini/codebase/issues/2102)) ([1c31071](https://github.com/organizzolini/codebase/commit/1c310719979a4a84e1cb45669f12f7335370a564))

## [3.51.3](https://github.com/organizzolini/codebase/compare/v3.51.2...v3.51.3) (2026-11-04)

## [3.51.2](https://github.com/organizzolini/codebase/compare/v3.51.1...v3.51.2) (2026-11-04)

### ♻️ Code Refactoring

* **callidescope,codependix,configuration,validation:** ♻️ rename gate targets to restrict and bound ([#2100](https://github.com/organizzolini/codebase/issues/2100)) ([2b8017a](https://github.com/organizzolini/codebase/commit/2b8017a499455b21200eb4c08c1eaca5f4b9cf97))

## [3.51.1](https://github.com/organizzolini/codebase/compare/v3.51.0...v3.51.1) (2026-11-03)

### ⚡ Performance Improvements

* **configuration,infrastructure,installation:** ⚡️ trim pre-commit checks and use Nx Cloud with scoped tokens ([#2097](https://github.com/organizzolini/codebase/issues/2097)) ([b43f34a](https://github.com/organizzolini/codebase/commit/b43f34aaca681dffb4adef26e2a3abc83dd9d8ab))

## [3.51.0](https://github.com/organizzolini/codebase/compare/v3.50.0...v3.51.0) (2026-11-03)

### ✨ Features

* **nx-cloud:** set up nx cloud workspace ([#2099](https://github.com/organizzolini/codebase/issues/2099)) ([fb5ddcc](https://github.com/organizzolini/codebase/commit/fb5ddcc40346394b11975c23e4ac7aad7d8d59b2))

### ⚡ Performance Improvements

* **callidescope:** ⚡️ cache file-system probes across a run's programs ([#2098](https://github.com/organizzolini/codebase/issues/2098)) ([3bc4484](https://github.com/organizzolini/codebase/commit/3bc4484539482ead12ed46f2aa39a0852fcb7471))

## [3.50.0](https://github.com/organizzolini/codebase/compare/v3.49.0...v3.50.0) (2026-11-03)

### ✨ Features

* **configuration,coinagerie:** ✨ adopt coinagerie with a root glossary ([#1888](https://github.com/organizzolini/codebase/issues/1888)) ([ba65ac8](https://github.com/organizzolini/codebase/commit/ba65ac83439a781420a4760eead1eb7547761db6)), closes [#1785](https://github.com/organizzolini/codebase/issues/1785) [#1749](https://github.com/organizzolini/codebase/issues/1749) [#1786](https://github.com/organizzolini/codebase/issues/1786) [#1787](https://github.com/organizzolini/codebase/issues/1787) [#1788](https://github.com/organizzolini/codebase/issues/1788) [#1887](https://github.com/organizzolini/codebase/issues/1887) [#1885](https://github.com/organizzolini/codebase/issues/1885) [#1879](https://github.com/organizzolini/codebase/issues/1879) [#1789](https://github.com/organizzolini/codebase/issues/1789)

## [3.49.0](https://github.com/organizzolini/codebase/compare/v3.48.0...v3.49.0) (2026-11-03)

### ✨ Features

* **coinagerie:** ✨ add coinagerie agent skills ([#1887](https://github.com/organizzolini/codebase/issues/1887)) ([1babeae](https://github.com/organizzolini/codebase/commit/1babeae40373a91ba49cf9257dc1e931487e82ca)), closes [#1782](https://github.com/organizzolini/codebase/issues/1782) [#1749](https://github.com/organizzolini/codebase/issues/1749) [#1885](https://github.com/organizzolini/codebase/issues/1885) [#1778](https://github.com/organizzolini/codebase/issues/1778) [#1879](https://github.com/organizzolini/codebase/issues/1879) [#1775](https://github.com/organizzolini/codebase/issues/1775)

### 📝 Documentation

* **coinagerie:** 📝 add coinagerie examples and guided tour ([#1885](https://github.com/organizzolini/codebase/issues/1885)) ([da5227a](https://github.com/organizzolini/codebase/commit/da5227a0c383c468ae6d2cbe8530eb405f4c62e6)), closes [#1879](https://github.com/organizzolini/codebase/issues/1879) [#1778](https://github.com/organizzolini/codebase/issues/1778) [#1749](https://github.com/organizzolini/codebase/issues/1749) [#1779](https://github.com/organizzolini/codebase/issues/1779) [#1780](https://github.com/organizzolini/codebase/issues/1780) [#1781](https://github.com/organizzolini/codebase/issues/1781)

## [3.48.0](https://github.com/organizzolini/codebase/compare/v3.47.0...v3.48.0) (2026-11-03)

### ✨ Features

* **coinagerie:** ✨ infer coinagerie check targets in nx ([#1879](https://github.com/organizzolini/codebase/issues/1879)) ([c6f42e7](https://github.com/organizzolini/codebase/commit/c6f42e7805b51ea12e94693a65ff44d07dca5f50)), closes [#1775](https://github.com/organizzolini/codebase/issues/1775) [#1749](https://github.com/organizzolini/codebase/issues/1749) [#1881](https://github.com/organizzolini/codebase/issues/1881) [#1770](https://github.com/organizzolini/codebase/issues/1770)

## [3.47.0](https://github.com/organizzolini/codebase/compare/v3.46.0...v3.47.0) (2026-11-03)

### ✨ Features

* **coinagerie:** ✨ read identifiers from python, sql, shell, css, hcl, toml, json, and yaml ([#1881](https://github.com/organizzolini/codebase/issues/1881)) ([6db570a](https://github.com/organizzolini/codebase/commit/6db570a18dde3d3f98405eb11becf478d740f3ab)), closes [#1770](https://github.com/organizzolini/codebase/issues/1770) [#1749](https://github.com/organizzolini/codebase/issues/1749) [#1771](https://github.com/organizzolini/codebase/issues/1771) [#1772](https://github.com/organizzolini/codebase/issues/1772) [#1773](https://github.com/organizzolini/codebase/issues/1773) [#1774](https://github.com/organizzolini/codebase/issues/1774) [#1880](https://github.com/organizzolini/codebase/issues/1880) [#1766](https://github.com/organizzolini/codebase/issues/1766) [#1882](https://github.com/organizzolini/codebase/issues/1882) [#1762](https://github.com/organizzolini/codebase/issues/1762) [#1875](https://github.com/organizzolini/codebase/issues/1875)

## [3.46.0](https://github.com/organizzolini/codebase/compare/v3.45.0...v3.46.0) (2026-11-03)

### ✨ Features

* **coinagerie:** ✨ write json glossaries and override configuration with flags ([#1880](https://github.com/organizzolini/codebase/issues/1880)) ([5cdc269](https://github.com/organizzolini/codebase/commit/5cdc26922b8a3bab3abee20b04cad54d5c95d00b)), closes [#1766](https://github.com/organizzolini/codebase/issues/1766) [#1749](https://github.com/organizzolini/codebase/issues/1749) [#1882](https://github.com/organizzolini/codebase/issues/1882) [#1762](https://github.com/organizzolini/codebase/issues/1762) [#1875](https://github.com/organizzolini/codebase/issues/1875) [#1755](https://github.com/organizzolini/codebase/issues/1755)

## [3.45.0](https://github.com/organizzolini/codebase/compare/v3.44.0...v3.45.0) (2026-11-03)

### ✨ Features

* **coinagerie:** ✨ fold word forms and exclude configured words ([#1882](https://github.com/organizzolini/codebase/issues/1882)) ([2760046](https://github.com/organizzolini/codebase/commit/27600466bf8213f6da8404fe739f0aae66c994df)), closes [#1762](https://github.com/organizzolini/codebase/issues/1762) [#1749](https://github.com/organizzolini/codebase/issues/1749) [#1875](https://github.com/organizzolini/codebase/issues/1875) [#1755](https://github.com/organizzolini/codebase/issues/1755)

## [3.44.0](https://github.com/organizzolini/codebase/compare/v3.43.0...v3.44.0) (2026-11-03)

### ✨ Features

* **coinagerie:** ✨ build a markdown glossary from typescript ([#1875](https://github.com/organizzolini/codebase/issues/1875)) ([2b02aff](https://github.com/organizzolini/codebase/commit/2b02afff32c03b175bbcecf0cd06c9eb9142e841)), closes [#1755](https://github.com/organizzolini/codebase/issues/1755) [#1749](https://github.com/organizzolini/codebase/issues/1749) [#1859](https://github.com/organizzolini/codebase/issues/1859) [#1750](https://github.com/organizzolini/codebase/issues/1750)

## [3.43.0](https://github.com/organizzolini/codebase/compare/v3.42.0...v3.43.0) (2026-11-03)

### ✨ Features

* **caelundas,presentation:** ✨ show a tunable night sky behind the web calendar ([#1884](https://github.com/organizzolini/codebase/issues/1884)) ([beba8a2](https://github.com/organizzolini/codebase/commit/beba8a2261afdeadd4259a2074e8a391cf6b7ce2)), closes [#1878](https://github.com/organizzolini/codebase/issues/1878) [#1951](https://github.com/organizzolini/codebase/issues/1951) [#1867](https://github.com/organizzolini/codebase/issues/1867) [#1868](https://github.com/organizzolini/codebase/issues/1868) [#1869](https://github.com/organizzolini/codebase/issues/1869) [#1870](https://github.com/organizzolini/codebase/issues/1870) [#1871](https://github.com/organizzolini/codebase/issues/1871) [#1872](https://github.com/organizzolini/codebase/issues/1872) [#1873](https://github.com/organizzolini/codebase/issues/1873) [#1861](https://github.com/organizzolini/codebase/issues/1861) [#1878](https://github.com/organizzolini/codebase/issues/1878) [#1951](https://github.com/organizzolini/codebase/issues/1951)

## [3.42.0](https://github.com/organizzolini/codebase/compare/v3.41.9...v3.42.0) (2026-11-03)

### ✨ Features

* **caelundas:** ✨ generate a real-star night sky SVG ([#1878](https://github.com/organizzolini/codebase/issues/1878)) ([4a2dca4](https://github.com/organizzolini/codebase/commit/4a2dca48368c3b5f1e9631e1f52c978b7a982514)), closes [#1951](https://github.com/organizzolini/codebase/issues/1951) [#1951](https://github.com/organizzolini/codebase/issues/1951) [#1884](https://github.com/organizzolini/codebase/issues/1884) [#1862](https://github.com/organizzolini/codebase/issues/1862) [#1863](https://github.com/organizzolini/codebase/issues/1863) [#1864](https://github.com/organizzolini/codebase/issues/1864) [#1865](https://github.com/organizzolini/codebase/issues/1865) [#1866](https://github.com/organizzolini/codebase/issues/1866) [#1861](https://github.com/organizzolini/codebase/issues/1861) [#1951](https://github.com/organizzolini/codebase/issues/1951)

## [3.41.9](https://github.com/organizzolini/codebase/compare/v3.41.8...v3.41.9) (2026-11-03)

### ♻️ Code Refactoring

* **configuration,caelundas,lexico,meanderaw,documentation,conformetry:** ♻️ hold every web app to one file shape ([#1951](https://github.com/organizzolini/codebase/issues/1951)) ([5c92134](https://github.com/organizzolini/codebase/commit/5c9213414614db7290247a531c766635e4e81833))

## [3.41.8](https://github.com/organizzolini/codebase/compare/v3.41.7...v3.41.8) (2026-10-30)

### 📝 Documentation

* **documentation,scripts:** 📝 specify model tiers for planning and subagent execution ([#2054](https://github.com/organizzolini/codebase/issues/2054)) ([e279ce0](https://github.com/organizzolini/codebase/commit/e279ce0d16798eea961fb6b43da6baad2dfee3c9))

## [3.41.7](https://github.com/organizzolini/codebase/compare/v3.41.6...v3.41.7) (2026-10-29)

## [3.41.6](https://github.com/organizzolini/codebase/compare/v3.41.5...v3.41.6) (2026-10-29)

## [3.41.5](https://github.com/organizzolini/codebase/compare/v3.41.4...v3.41.5) (2026-10-29)

## [3.41.4](https://github.com/organizzolini/codebase/compare/v3.41.3...v3.41.4) (2026-10-29)

### 📝 Documentation

* **documentation:** 📝 refresh OpenWiki ([#2031](https://github.com/organizzolini/codebase/issues/2031)) ([09f661c](https://github.com/organizzolini/codebase/commit/09f661c6e918e9cbdbf30841bc0e3f31fa63c917))

## [3.41.3](https://github.com/organizzolini/codebase/compare/v3.41.2...v3.41.3) (2026-10-29)

## [3.41.2](https://github.com/organizzolini/codebase/compare/v3.41.1...v3.41.2) (2026-10-29)

### ♻️ Code Refactoring

* **infrastructure:** ♻️ rename the openrouter preset to refresh-documentation ([#2030](https://github.com/organizzolini/codebase/issues/2030)) ([206fdd4](https://github.com/organizzolini/codebase/commit/206fdd4cdc05487b700c306541ce4b1db7c410f1))

## [3.41.1](https://github.com/organizzolini/codebase/compare/v3.41.0...v3.41.1) (2026-10-29)

## [3.41.0](https://github.com/organizzolini/codebase/compare/v3.40.0...v3.41.0) (2026-10-29)

### ✨ Features

* **infrastructure,installation:** ✨ manage github and linode with terraform ([#1979](https://github.com/organizzolini/codebase/issues/1979)) ([0c9d11d](https://github.com/organizzolini/codebase/commit/0c9d11d10f53564b2130b6154dc24a968e029365))

## [3.40.0](https://github.com/organizzolini/codebase/compare/v3.39.0...v3.40.0) (2026-10-27)

### ✨ Features

* **caelundas,persistence:** ✨ write caelundas events to a sqlite database ([#1876](https://github.com/organizzolini/codebase/issues/1876)) ([a9970e9](https://github.com/organizzolini/codebase/commit/a9970e9d00d2636826d0429eb7cb72f50ce40df3)), closes [#1874](https://github.com/organizzolini/codebase/issues/1874) [#1874](https://github.com/organizzolini/codebase/issues/1874)

## [3.39.0](https://github.com/organizzolini/codebase/compare/v3.38.0...v3.39.0) (2026-10-27)

### ✨ Features

* **persistence:** ✨ add sqlite module and name the postgresql commands ([#1874](https://github.com/organizzolini/codebase/issues/1874)) ([f75f026](https://github.com/organizzolini/codebase/commit/f75f0262fbddc75efe5b69f9343942a312d1b436)), closes [projects/common/persistence/README.md#sqlite](https://github.com/projects/common/persistence/README.md/issues/sqlite)

## [3.38.0](https://github.com/organizzolini/codebase/compare/v3.37.0...v3.38.0) (2026-10-27)

### ✨ Features

* **infrastructure:** ✨ add openrouter terraform module ([#1855](https://github.com/organizzolini/codebase/issues/1855)) ([fd97f8a](https://github.com/organizzolini/codebase/commit/fd97f8a2a04e1256a8a2c8ce4f78ecc081a9a51b))

## [3.37.0](https://github.com/organizzolini/codebase/compare/v3.36.0...v3.37.0) (2026-10-26)

### ✨ Features

* **lexico:** ✨ show fuzzy match edit distance in lexico-web ([#1856](https://github.com/organizzolini/codebase/issues/1856)) ([85e243e](https://github.com/organizzolini/codebase/commit/85e243e3992ae1a744f1c9218bc8e9e5a05f907d))

## [3.36.0](https://github.com/organizzolini/codebase/compare/v3.35.0...v3.36.0) (2026-10-26)

### ✨ Features

* **caelundas,persistence:** ✨ bundle the real event database into the build ([#1727](https://github.com/organizzolini/codebase/issues/1727)) ([447a734](https://github.com/organizzolini/codebase/commit/447a734797998da91bfce4c2809f67cba3212cf0)), closes [#1659](https://github.com/organizzolini/codebase/issues/1659) [#1660](https://github.com/organizzolini/codebase/issues/1660) [#1661](https://github.com/organizzolini/codebase/issues/1661) [#1741](https://github.com/organizzolini/codebase/issues/1741) [#1717](https://github.com/organizzolini/codebase/issues/1717) [#1726](https://github.com/organizzolini/codebase/issues/1726)

## [3.35.0](https://github.com/organizzolini/codebase/compare/v3.34.0...v3.35.0) (2026-10-26)

### ✨ Features

* **persistence:** ✨ export postgres tables to sqlite with --sqlite ([#1741](https://github.com/organizzolini/codebase/issues/1741)) ([e1bd453](https://github.com/organizzolini/codebase/commit/e1bd453d55261e7cc1136e5113366db5f5c07664)), closes [#1602](https://github.com/organizzolini/codebase/issues/1602) [#1603](https://github.com/organizzolini/codebase/issues/1603) [#1604](https://github.com/organizzolini/codebase/issues/1604) [#1605](https://github.com/organizzolini/codebase/issues/1605) [#1606](https://github.com/organizzolini/codebase/issues/1606) [#1607](https://github.com/organizzolini/codebase/issues/1607) [#1601](https://github.com/organizzolini/codebase/issues/1601) [#1735](https://github.com/organizzolini/codebase/issues/1735)

## [3.34.0](https://github.com/organizzolini/codebase/compare/v3.33.0...v3.34.0) (2026-10-26)

### ✨ Features

* **caelundas:** ✨ polish responsive layouts across phone, tablet and desktop ([#1726](https://github.com/organizzolini/codebase/issues/1726)) ([f49497d](https://github.com/organizzolini/codebase/commit/f49497dc4fed23a39d78ee1d39f30ae7bd1ceab9)), closes [#1655](https://github.com/organizzolini/codebase/issues/1655) [#1655](https://github.com/organizzolini/codebase/issues/1655) [#1656](https://github.com/organizzolini/codebase/issues/1656) [#1657](https://github.com/organizzolini/codebase/issues/1657) [#1658](https://github.com/organizzolini/codebase/issues/1658) [#1654](https://github.com/organizzolini/codebase/issues/1654) [#1655](https://github.com/organizzolini/codebase/issues/1655) [#1656](https://github.com/organizzolini/codebase/issues/1656) [#1657](https://github.com/organizzolini/codebase/issues/1657) [#1658](https://github.com/organizzolini/codebase/issues/1658) [#1601](https://github.com/organizzolini/codebase/issues/1601) [#1725](https://github.com/organizzolini/codebase/issues/1725)

## [3.33.0](https://github.com/organizzolini/codebase/compare/v3.32.0...v3.33.0) (2026-10-26)

### ✨ Features

* **caelundas:** ✨ group events and add the timeline ([#1725](https://github.com/organizzolini/codebase/issues/1725)) ([e80d1b0](https://github.com/organizzolini/codebase/commit/e80d1b08c81f245d18570a92e0c02f515c229fe7)), closes [#1647](https://github.com/organizzolini/codebase/issues/1647) [#1648](https://github.com/organizzolini/codebase/issues/1648) [#1649](https://github.com/organizzolini/codebase/issues/1649) [#1650](https://github.com/organizzolini/codebase/issues/1650) [#1651](https://github.com/organizzolini/codebase/issues/1651) [#1652](https://github.com/organizzolini/codebase/issues/1652) [#1653](https://github.com/organizzolini/codebase/issues/1653) [#1646](https://github.com/organizzolini/codebase/issues/1646) [#1647](https://github.com/organizzolini/codebase/issues/1647) [#1648](https://github.com/organizzolini/codebase/issues/1648) [#1649](https://github.com/organizzolini/codebase/issues/1649) [#1650](https://github.com/organizzolini/codebase/issues/1650) [#1651](https://github.com/organizzolini/codebase/issues/1651) [#1652](https://github.com/organizzolini/codebase/issues/1652) [#1653](https://github.com/organizzolini/codebase/issues/1653) [#1601](https://github.com/organizzolini/codebase/issues/1601) [#1724](https://github.com/organizzolini/codebase/issues/1724)

## [3.32.0](https://github.com/organizzolini/codebase/compare/v3.31.0...v3.32.0) (2026-10-26)

### ✨ Features

* **caelundas:** ✨ add week, day, three-day and agenda views ([#1724](https://github.com/organizzolini/codebase/issues/1724)) ([398cc3e](https://github.com/organizzolini/codebase/commit/398cc3e3848729e6783981923fb0ecaae5c51357)), closes [#1641](https://github.com/organizzolini/codebase/issues/1641) [#1642](https://github.com/organizzolini/codebase/issues/1642) [#1643](https://github.com/organizzolini/codebase/issues/1643) [#1644](https://github.com/organizzolini/codebase/issues/1644) [#1645](https://github.com/organizzolini/codebase/issues/1645) [#1633](https://github.com/organizzolini/codebase/issues/1633) [#1640](https://github.com/organizzolini/codebase/issues/1640) [#1641](https://github.com/organizzolini/codebase/issues/1641) [#1642](https://github.com/organizzolini/codebase/issues/1642) [#1643](https://github.com/organizzolini/codebase/issues/1643) [#1644](https://github.com/organizzolini/codebase/issues/1644) [#1645](https://github.com/organizzolini/codebase/issues/1645) [#1601](https://github.com/organizzolini/codebase/issues/1601) [#1723](https://github.com/organizzolini/codebase/issues/1723) [#1633](https://github.com/organizzolini/codebase/issues/1633)

## [3.31.0](https://github.com/organizzolini/codebase/compare/v3.30.0...v3.31.0) (2026-10-26)

### ✨ Features

* **caelundas:** ✨ filter events with nested and/or rules ([#1723](https://github.com/organizzolini/codebase/issues/1723)) ([5ca8c3d](https://github.com/organizzolini/codebase/commit/5ca8c3d889aa03b8355f593a2ee2b275a2455706)), closes [#1638](https://github.com/organizzolini/codebase/issues/1638) [#1633](https://github.com/organizzolini/codebase/issues/1633) [#1634](https://github.com/organizzolini/codebase/issues/1634) [#1635](https://github.com/organizzolini/codebase/issues/1635) [#1636](https://github.com/organizzolini/codebase/issues/1636) [#1637](https://github.com/organizzolini/codebase/issues/1637) [#1638](https://github.com/organizzolini/codebase/issues/1638) [#1639](https://github.com/organizzolini/codebase/issues/1639) [#1601](https://github.com/organizzolini/codebase/issues/1601) [#1721](https://github.com/organizzolini/codebase/issues/1721) [#1626](https://github.com/organizzolini/codebase/issues/1626) [#1640](https://github.com/organizzolini/codebase/issues/1640)

## [3.30.0](https://github.com/organizzolini/codebase/compare/v3.29.0...v3.30.0) (2026-10-26)

### ✨ Features

* **caelundas:** ✨ show events in a static month calendar ([#1721](https://github.com/organizzolini/codebase/issues/1721)) ([4a5fade](https://github.com/organizzolini/codebase/commit/4a5fade6fc08f00588f7bfbec2a3f36cbbc139e0)), closes [#1626](https://github.com/organizzolini/codebase/issues/1626) [#1627](https://github.com/organizzolini/codebase/issues/1627) [#1628](https://github.com/organizzolini/codebase/issues/1628) [#1629](https://github.com/organizzolini/codebase/issues/1629) [#1630](https://github.com/organizzolini/codebase/issues/1630) [#1631](https://github.com/organizzolini/codebase/issues/1631) [#1632](https://github.com/organizzolini/codebase/issues/1632) [#1601](https://github.com/organizzolini/codebase/issues/1601) [#1633](https://github.com/organizzolini/codebase/issues/1633)

## [3.29.0](https://github.com/organizzolini/codebase/compare/v3.28.0...v3.29.0) (2026-10-26)

### ✨ Features

* **caelundas:** ✨ classify events across tag dimensions ([#1722](https://github.com/organizzolini/codebase/issues/1722)) ([67c63cc](https://github.com/organizzolini/codebase/commit/67c63cc529492c3f00767607e78d346b1b6025e7)), closes [#1618](https://github.com/organizzolini/codebase/issues/1618) [#1619](https://github.com/organizzolini/codebase/issues/1619) [#1620](https://github.com/organizzolini/codebase/issues/1620) [#1621](https://github.com/organizzolini/codebase/issues/1621) [#1622](https://github.com/organizzolini/codebase/issues/1622) [#1623](https://github.com/organizzolini/codebase/issues/1623) [#1624](https://github.com/organizzolini/codebase/issues/1624) [#1625](https://github.com/organizzolini/codebase/issues/1625) [#1601](https://github.com/organizzolini/codebase/issues/1601) [#1719](https://github.com/organizzolini/codebase/issues/1719) [#1659](https://github.com/organizzolini/codebase/issues/1659)

## [3.28.0](https://github.com/organizzolini/codebase/compare/v3.27.1...v3.28.0) (2026-10-26)

### ✨ Features

* **caelundas:** ✨ store event tags as a tree and keep each event's timezone ([#1719](https://github.com/organizzolini/codebase/issues/1719)) ([03304e4](https://github.com/organizzolini/codebase/commit/03304e42584ce36214f63e647e592d84f03660a4)), closes [#1717](https://github.com/organizzolini/codebase/issues/1717) [#1612](https://github.com/organizzolini/codebase/issues/1612) [#1613](https://github.com/organizzolini/codebase/issues/1613) [#1614](https://github.com/organizzolini/codebase/issues/1614) [#1615](https://github.com/organizzolini/codebase/issues/1615) [#1616](https://github.com/organizzolini/codebase/issues/1616) [#1617](https://github.com/organizzolini/codebase/issues/1617) [#1601](https://github.com/organizzolini/codebase/issues/1601) [#1717](https://github.com/organizzolini/codebase/issues/1717) [#1618](https://github.com/organizzolini/codebase/issues/1618)

## [3.27.1](https://github.com/organizzolini/codebase/compare/v3.27.0...v3.27.1) (2026-10-26)

### ♻️ Code Refactoring

* **caelundas:** ♻️ rename categories to tags ([#1717](https://github.com/organizzolini/codebase/issues/1717)) ([686f56b](https://github.com/organizzolini/codebase/commit/686f56bb7ac567c5a764dd7201217c7bade76007)), closes [#1608](https://github.com/organizzolini/codebase/issues/1608) [#1609](https://github.com/organizzolini/codebase/issues/1609) [#1610](https://github.com/organizzolini/codebase/issues/1610) [#1611](https://github.com/organizzolini/codebase/issues/1611) [#1601](https://github.com/organizzolini/codebase/issues/1601)

## [3.27.0](https://github.com/organizzolini/codebase/compare/v3.26.9...v3.27.0) (2026-10-26)

### ✨ Features

* **lexico:** ✨ rank fuzzy Latin matches by edit distance ([#1854](https://github.com/organizzolini/codebase/issues/1854)) ([12dc7cc](https://github.com/organizzolini/codebase/commit/12dc7cc37055bc701400beee664695e3c64eaceb))

### 📝 Documentation

* **documentation:** 📝 refresh OpenWiki ([#1858](https://github.com/organizzolini/codebase/issues/1858)) ([f2ea39a](https://github.com/organizzolini/codebase/commit/f2ea39af591d1192ef9edb5c3d7eb3c730f4e5a9))

## [3.26.9](https://github.com/organizzolini/codebase/compare/v3.26.8...v3.26.9) (2026-10-26)

### 🐛 Bug Fixes

* **documentation,configuration:** 🐛 refresh documentation on a free OpenRouter model ([#1806](https://github.com/organizzolini/codebase/issues/1806)) ([ee6a4f0](https://github.com/organizzolini/codebase/commit/ee6a4f0415481faf47ac1d454bdf424dd831cb5e))

## [3.26.8](https://github.com/organizzolini/codebase/compare/v3.26.7...v3.26.8) (2026-10-26)

### 🐛 Bug Fixes

* **dependencies:** 🔥 Remove generated .codex hooks folder ([#1829](https://github.com/organizzolini/codebase/issues/1829)) ([3271b6e](https://github.com/organizzolini/codebase/commit/3271b6e8458468a081b738f69195415fad633e9c)), closes [#1802](https://github.com/organizzolini/codebase/issues/1802)

### 📝 Documentation

* **documentation:** 📝 add missing technology badges ([#1828](https://github.com/organizzolini/codebase/issues/1828)) ([696db38](https://github.com/organizzolini/codebase/commit/696db3870b48c09348ea52c0a7ee4192301d39d5))

## [3.26.7](https://github.com/organizzolini/codebase/compare/v3.26.6...v3.26.7) (2026-10-26)

### 🐛 Bug Fixes

* **integration,deployments:** 🐛 upgrade node and run the weekly upgrades without shell scripts ([#1827](https://github.com/organizzolini/codebase/issues/1827)) ([dfc6069](https://github.com/organizzolini/codebase/commit/dfc606931576117520f8a3527048399c6581140e))

## [3.26.6](https://github.com/organizzolini/codebase/compare/v3.26.5...v3.26.6) (2026-10-25)

## [3.26.5](https://github.com/organizzolini/codebase/compare/v3.26.4...v3.26.5) (2026-10-24)

## [3.26.4](https://github.com/organizzolini/codebase/compare/v3.26.3...v3.26.4) (2026-10-24)

## [3.26.3](https://github.com/organizzolini/codebase/compare/v3.26.2...v3.26.3) (2026-10-24)

### 📦 Build System

* **ic-suite,presentation:** 👷 infer the vite build target instead of @nx/vite:build ([#1823](https://github.com/organizzolini/codebase/issues/1823)) ([20be9c5](https://github.com/organizzolini/codebase/commit/20be9c5d9a12fcaee3a4a523023cc8ee1c63f650)), closes [organizzolini/codebase#1821](https://github.com/organizzolini/codebase/issues/1821) [organizzolini/codebase#1819](https://github.com/organizzolini/codebase/issues/1819)

## [3.26.2](https://github.com/organizzolini/codebase/compare/v3.26.1...v3.26.2) (2026-10-24)

### 🐛 Bug Fixes

* **codependix:** 🐛 replace the gate's custom hasher with a cache check ([#1819](https://github.com/organizzolini/codebase/issues/1819)) ([7fea157](https://github.com/organizzolini/codebase/commit/7fea157d662e25652bf807dff49bfab994c047ee))

## [3.26.1](https://github.com/organizzolini/codebase/compare/v3.26.0...v3.26.1) (2026-10-24)

### ♻️ Code Refactoring

* **installation,integration:** ♻️ let the software command install named tools ([#1809](https://github.com/organizzolini/codebase/issues/1809)) ([bc43c4c](https://github.com/organizzolini/codebase/commit/bc43c4c40e61d8a81036e4d233031173d41ff9b1))

## [3.26.0](https://github.com/organizzolini/codebase/compare/v3.25.2...v3.26.0) (2026-10-23)

### ✨ Features

* **integration:** ✨ report each upgrade step in the pull request body ([#1804](https://github.com/organizzolini/codebase/issues/1804)) ([c3e7a70](https://github.com/organizzolini/codebase/commit/c3e7a70adbbc3d9bd9971a5f5ca72696cf27c943))

## [3.25.2](https://github.com/organizzolini/codebase/compare/v3.25.1...v3.25.2) (2026-10-23)

## [3.25.1](https://github.com/organizzolini/codebase/compare/v3.25.0...v3.25.1) (2026-10-23)

### ♻️ Code Refactoring

* **integration,documentation:** ♻️ move the CI steps into integration commands ([#1801](https://github.com/organizzolini/codebase/issues/1801)) ([dc1c4df](https://github.com/organizzolini/codebase/commit/dc1c4df98cee03a2ceedf60f9ed39ae6e5c71d98))

## [3.25.0](https://github.com/organizzolini/codebase/compare/v3.24.1...v3.25.0) (2026-10-23)

### ✨ Features

* **documentation:** ✨ add refresh-documentation command project ([#1800](https://github.com/organizzolini/codebase/issues/1800)) ([64e4646](https://github.com/organizzolini/codebase/commit/64e464656b7f94d6463cd20e40589f5754ebfac7))

## [3.24.1](https://github.com/organizzolini/codebase/compare/v3.24.0...v3.24.1) (2026-10-23)

### 🐛 Bug Fixes

* **synchronization,configuration:** 🐛 ignore every file a vendored skill installs ([#1798](https://github.com/organizzolini/codebase/issues/1798)) ([896b81f](https://github.com/organizzolini/codebase/commit/896b81f2aba13e27e0c996a0a94cda717230206a))

### 📝 Documentation

* **documentation:** 📝 add a code of conduct ([#1799](https://github.com/organizzolini/codebase/issues/1799)) ([4cd49e6](https://github.com/organizzolini/codebase/commit/4cd49e643e628f6334ad886da1a6141e07d0aa2b))

## [3.24.0](https://github.com/organizzolini/codebase/compare/v3.23.1...v3.24.0) (2026-10-23)

### ✨ Features

* **integration,deployments:** ✨ run the dependency upgrades as one command that reports skips ([#1796](https://github.com/organizzolini/codebase/issues/1796)) ([705e640](https://github.com/organizzolini/codebase/commit/705e640463a2077dde2ebd31d4058dded6ace2ec))

### ♻️ Code Refactoring

* **integration:** ♻️ hardcode the spelling and template paths of run-affected ([#1797](https://github.com/organizzolini/codebase/issues/1797)) ([a635398](https://github.com/organizzolini/codebase/commit/a635398ea11127ea455063e51fb0a63f7ef72e04))

## [3.23.1](https://github.com/organizzolini/codebase/compare/v3.23.0...v3.23.1) (2026-10-22)

## [3.23.0](https://github.com/organizzolini/codebase/compare/v3.22.1...v3.23.0) (2026-10-22)

### ✨ Features

* **documentation:** ✨ add ponytail skills for smaller implementations ([#1745](https://github.com/organizzolini/codebase/issues/1745)) ([40bd0c3](https://github.com/organizzolini/codebase/commit/40bd0c392e0d051cbb2b293efb430a79ac4fcb48))

### 📝 Documentation

* **documentation,scripts:** 📝 guide cloud sessions through ssh signing and github mcp ([#1746](https://github.com/organizzolini/codebase/issues/1746)) ([37960bc](https://github.com/organizzolini/codebase/commit/37960bc8ccb7aa7210605cdb0d0698d55bfec23b)), closes [.github/CONTRIBUTING.md#commit-signing-required](https://github.com/.github/CONTRIBUTING.md/issues/commit-signing-required)
* **documentation:** 📝 move handoff and openwiki procedures out of agents ([#1748](https://github.com/organizzolini/codebase/issues/1748)) ([0e79185](https://github.com/organizzolini/codebase/commit/0e7918505d3e8da67b23699e72606da59f84123d))

## [3.22.1](https://github.com/organizzolini/codebase/compare/v3.22.0...v3.22.1) (2026-10-22)

### 📦 Build System

* **dependencies,configuration:** 🔥 remove supabase and allow claude-session trailer ([#1744](https://github.com/organizzolini/codebase/issues/1744)) ([667b8c4](https://github.com/organizzolini/codebase/commit/667b8c49c0f2dd0a19cda79882320a9f4a9aa2fe))

## [3.22.0](https://github.com/organizzolini/codebase/compare/v3.21.0...v3.22.0) (2026-10-22)

### ✨ Features

* **installation:** ✨ fold ssh-signing into software and install the commit tools on linux ([#1743](https://github.com/organizzolini/codebase/issues/1743)) ([a5eeba3](https://github.com/organizzolini/codebase/commit/a5eeba37cddd974c6f800abc3d2f40c6265ce469)), closes [#1738](https://github.com/organizzolini/codebase/issues/1738)

## [3.21.0](https://github.com/organizzolini/codebase/compare/v3.20.0...v3.21.0) (2026-10-22)

### ✨ Features

* **lexico,interface:** ✨ add interface package with graphql server and client modules ([#1742](https://github.com/organizzolini/codebase/issues/1742)) ([4cbb539](https://github.com/organizzolini/codebase/commit/4cbb53930e18647c7555fa0abc5f540efe9b73cd))

## [3.20.0](https://github.com/organizzolini/codebase/compare/v3.19.0...v3.20.0) (2026-10-22)

### ✨ Features

* **synchronization,installation:** ✨ add project-ports command and install helm on linux ([#1738](https://github.com/organizzolini/codebase/issues/1738)) ([2eb4ae4](https://github.com/organizzolini/codebase/commit/2eb4ae4e5695503708cfdd2e1c1581cc2bd37df6)), closes [#1739](https://github.com/organizzolini/codebase/issues/1739)

### 📝 Documentation

* **documentation:** 📝 group common projects and move license badge in readme ([#1740](https://github.com/organizzolini/codebase/issues/1740)) ([3fa847b](https://github.com/organizzolini/codebase/commit/3fa847b0f7b33ecdff7f7107f60f54e9b28b98e9))

## [3.19.0](https://github.com/organizzolini/codebase/compare/v3.18.0...v3.19.0) (2026-10-21)

### ✨ Features

* **lexico:** ✨ add graphql codegen workflow for web ([#1720](https://github.com/organizzolini/codebase/issues/1720)) ([6bf18e4](https://github.com/organizzolini/codebase/commit/6bf18e4931f80d63fbf14de915963e68c0d21df7))

## [3.18.0](https://github.com/organizzolini/codebase/compare/v3.17.0...v3.18.0) (2026-10-20)

### ✨ Features

* **caelundas:** ✨ verify ephemeris files and refuse fallback results ([#1736](https://github.com/organizzolini/codebase/issues/1736)) ([03126ed](https://github.com/organizzolini/codebase/commit/03126ed3c6dafcf5d6a74906b9310f804ac3090e))
* **scripts,installation:** ✨ set up Linux through the setup command ([#1739](https://github.com/organizzolini/codebase/issues/1739)) ([ecf3737](https://github.com/organizzolini/codebase/commit/ecf3737b98104b9f942187df5efa91480a30347b))

## [3.17.0](https://github.com/organizzolini/codebase/compare/v3.16.0...v3.17.0) (2026-10-20)

### ✨ Features

* **scripts,installation:** ✨ verify ssh commit signatures locally ([#1732](https://github.com/organizzolini/codebase/issues/1732)) ([7af5762](https://github.com/organizzolini/codebase/commit/7af57626cb2db033f535a30b6629137c43b46b36))

## [3.16.0](https://github.com/organizzolini/codebase/compare/v3.15.2...v3.16.0) (2026-10-20)

### ✨ Features

* **lexico:** ✨ add relay connections for relationship fields ([#1714](https://github.com/organizzolini/codebase/issues/1714)) ([9e99709](https://github.com/organizzolini/codebase/commit/9e997098ac1bf6f6b00bf9dcbd31bd8dccfd0d5e))

## [3.15.2](https://github.com/organizzolini/codebase/compare/v3.15.1...v3.15.2) (2026-10-20)

### ♻️ Code Refactoring

* **lexico-entities:** ♻️ rename entity files to kebab-case ([#1713](https://github.com/organizzolini/codebase/issues/1713)) ([f6c74e5](https://github.com/organizzolini/codebase/commit/f6c74e51b5f89393c99954a1a4ce54cf346d3db4))

## [3.15.1](https://github.com/organizzolini/codebase/compare/v3.15.0...v3.15.1) (2026-10-20)

### ♻️ Code Refactoring

* **configuration:** ♻️ relocate internal projects and rename shared packages ([#1708](https://github.com/organizzolini/codebase/issues/1708)) ([d0b7206](https://github.com/organizzolini/codebase/commit/d0b7206d01b474562ae222282c5173df74935722))

## [3.15.0](https://github.com/organizzolini/codebase/compare/v3.14.1...v3.15.0) (2026-10-20)

### ✨ Features

* **scripts:** ✨ set up linux in installation script ([#1730](https://github.com/organizzolini/codebase/issues/1730)) ([4620c1a](https://github.com/organizzolini/codebase/commit/4620c1aced3359edf72ebf1c6e315abe8cf0486c))

### 🐛 Bug Fixes

* **configuration:** 🩹 unset node path in pre-commit hook ([#1731](https://github.com/organizzolini/codebase/issues/1731)) ([2847b23](https://github.com/organizzolini/codebase/commit/2847b23116e51059aa0c0e2e477a47b9d9acf24c))

## [3.14.1](https://github.com/organizzolini/codebase/compare/v3.14.0...v3.14.1) (2026-10-20)

### 🐛 Bug Fixes

* **scripts:** 🩹 verify gh auth by rest call in cloud sessions ([#1729](https://github.com/organizzolini/codebase/issues/1729)) ([3527062](https://github.com/organizzolini/codebase/commit/35270626e095987ce56c561b388d9b6a6f5b01e7))

## [3.14.0](https://github.com/organizzolini/codebase/compare/v3.13.6...v3.14.0) (2026-10-20)

### ✨ Features

* **scripts:** ✨ accept ssh commit signing ([#1728](https://github.com/organizzolini/codebase/issues/1728)) ([62e37ca](https://github.com/organizzolini/codebase/commit/62e37cacb6f86084256d70aaa67d3cf39491f33d))

## [3.13.6](https://github.com/organizzolini/codebase/compare/v3.13.5...v3.13.6) (2026-10-20)

### ♻️ Code Refactoring

* **database/synchronization/integration:** ♻️ rename database project to persistence ([#1707](https://github.com/organizzolini/codebase/issues/1707)) ([bc4fbfd](https://github.com/organizzolini/codebase/commit/bc4fbfd0f38018c33728ae1d797d316bbc243218))

## [3.13.5](https://github.com/organizzolini/codebase/compare/v3.13.4...v3.13.5) (2026-10-18)

### 🐛 Bug Fixes

* **lexico:** 🐛 align search and sidebar surface styling ([#1715](https://github.com/organizzolini/codebase/issues/1715)) ([cf32c55](https://github.com/organizzolini/codebase/commit/cf32c555ea20202b9b3db1a7bdd650f9569811b2))

### ♻️ Code Refactoring

* **configuration,deployments:** ♻️ relocate workspace config files and explicit tool paths ([#1710](https://github.com/organizzolini/codebase/issues/1710)) ([a2fee75](https://github.com/organizzolini/codebase/commit/a2fee753f9596665dd391aef1ce802cbf05213ee))

## [3.13.4](https://github.com/organizzolini/codebase/compare/v3.13.3...v3.13.4) (2026-10-18)

### 🐛 Bug Fixes

* **publication,integration:** 🐛 harden release linking and ci guidance ([#1712](https://github.com/organizzolini/codebase/issues/1712)) ([e3f3abd](https://github.com/organizzolini/codebase/commit/e3f3abd96bc03a788abd7c4f3c51c38de7d70906))

## [3.13.3](https://github.com/organizzolini/codebase/compare/v3.13.2...v3.13.3) (2026-10-18)

## [3.13.2](https://github.com/organizzolini/codebase/compare/v3.13.1...v3.13.2) (2026-10-18)

### ♻️ Code Refactoring

* **configuration:** ♻️ consolidate node version pin to nvmrc ([#1709](https://github.com/organizzolini/codebase/issues/1709)) ([07ca0f6](https://github.com/organizzolini/codebase/commit/07ca0f6080e6ae99d53a94d49b7fd4f3dd58b289))

## [3.13.1](https://github.com/organizzolini/codebase/compare/v3.13.0...v3.13.1) (2026-10-18)

### ⚡ Performance Improvements

* **configuration,documentation,publication,deployments:** ⚡️ enable task-based affected execution in nx ([#1705](https://github.com/organizzolini/codebase/issues/1705)) ([4e90f36](https://github.com/organizzolini/codebase/commit/4e90f36f62ebcbf956b35b1a8991b7a4434d6df4))

## [3.13.0](https://github.com/organizzolini/codebase/compare/v3.12.0...v3.13.0) (2026-10-18)

### ✨ Features

* **conformetry:** ✨ expose the filesystem and configuration directory to hooks ([#1695](https://github.com/organizzolini/codebase/issues/1695)) ([7507601](https://github.com/organizzolini/codebase/commit/7507601a694aaa4c2320a8df85b1be92ebcee02c)), closes [#1679](https://github.com/organizzolini/codebase/issues/1679) [#1680](https://github.com/organizzolini/codebase/issues/1680) [#1681](https://github.com/organizzolini/codebase/issues/1681) [#1682](https://github.com/organizzolini/codebase/issues/1682) [#1671](https://github.com/organizzolini/codebase/issues/1671) [#1693](https://github.com/organizzolini/codebase/issues/1693)
* **conformetry:** ✨ run configured generator hooks from the Nx plugin ([#1697](https://github.com/organizzolini/codebase/issues/1697)) ([f73e691](https://github.com/organizzolini/codebase/commit/f73e6919e61f144f1fd353266b1a8166faa34a2e)), closes [#1683](https://github.com/organizzolini/codebase/issues/1683) [#1684](https://github.com/organizzolini/codebase/issues/1684) [#1685](https://github.com/organizzolini/codebase/issues/1685) [#1671](https://github.com/organizzolini/codebase/issues/1671) [#1695](https://github.com/organizzolini/codebase/issues/1695)

### 📝 Documentation

* **conformetry:** 📝 document generator hooks ([#1700](https://github.com/organizzolini/codebase/issues/1700)) ([99e66df](https://github.com/organizzolini/codebase/commit/99e66dfae230c11c67bfcadf6dd0273300ac4c7d)), closes [#1686](https://github.com/organizzolini/codebase/issues/1686) [#1687](https://github.com/organizzolini/codebase/issues/1687) [#1688](https://github.com/organizzolini/codebase/issues/1688) [#1689](https://github.com/organizzolini/codebase/issues/1689) [#1671](https://github.com/organizzolini/codebase/issues/1671) [#1697](https://github.com/organizzolini/codebase/issues/1697)

## [3.12.0](https://github.com/organizzolini/codebase/compare/v3.11.0...v3.12.0) (2026-10-18)

### ✨ Features

* **conformetry:** ✨ run configured generator hooks from the command line ([#1693](https://github.com/organizzolini/codebase/issues/1693)) ([c840dc1](https://github.com/organizzolini/codebase/commit/c840dc1c23efd56055b87dfd7eb2daf0e6b76726)), closes [#1692](https://github.com/organizzolini/codebase/issues/1692) [#1675](https://github.com/organizzolini/codebase/issues/1675) [#1676](https://github.com/organizzolini/codebase/issues/1676) [#1677](https://github.com/organizzolini/codebase/issues/1677) [#1678](https://github.com/organizzolini/codebase/issues/1678) [#1671](https://github.com/organizzolini/codebase/issues/1671) [#1692](https://github.com/organizzolini/codebase/issues/1692)

### ♻️ Code Refactoring

* **conformetry:** ♻️ move the hook and filesystem types to the core package ([#1692](https://github.com/organizzolini/codebase/issues/1692)) ([613b87f](https://github.com/organizzolini/codebase/commit/613b87fb22513f17ca365120afe710bd5b1fe5ef)), closes [#1673](https://github.com/organizzolini/codebase/issues/1673) [#1674](https://github.com/organizzolini/codebase/issues/1674) [#1672](https://github.com/organizzolini/codebase/issues/1672) [#1671](https://github.com/organizzolini/codebase/issues/1671)

## [3.11.0](https://github.com/organizzolini/codebase/compare/v3.10.1...v3.11.0) (2026-10-18)

### ✨ Features

* **callidescope:** ✨ prefix inferred nx target defaults ([#1706](https://github.com/organizzolini/codebase/issues/1706)) ([1a54464](https://github.com/organizzolini/codebase/commit/1a54464de655280872d5cc65589d9585af9d273d))

## [3.10.1](https://github.com/organizzolini/codebase/compare/v3.10.0...v3.10.1) (2026-10-18)

### ♻️ Code Refactoring

* **configuration,integration,publication:** ♻️ move CI plumbing from publication into a new integration project ([#1704](https://github.com/organizzolini/codebase/issues/1704)) ([e84044b](https://github.com/organizzolini/codebase/commit/e84044be7ba278ef00a5a6bc4b5d496916902a33)), closes [#1702](https://github.com/organizzolini/codebase/issues/1702) [#1699](https://github.com/organizzolini/codebase/issues/1699) [#1699](https://github.com/organizzolini/codebase/issues/1699) [#1702](https://github.com/organizzolini/codebase/issues/1702)

## [3.10.0](https://github.com/organizzolini/codebase/compare/v3.9.13...v3.10.0) (2026-10-18)

### ✨ Features

* **conformetry,configuration,caelundas,lexico,meanderaw,callidescope:** ✨ place generators by instances ([#1670](https://github.com/organizzolini/codebase/issues/1670)) ([78c26e3](https://github.com/organizzolini/codebase/commit/78c26e3f3795333eeee9a52c4a8ae93a65e605fb))

## [3.9.13](https://github.com/organizzolini/codebase/compare/v3.9.12...v3.9.13) (2026-10-18)

### ♻️ Code Refactoring

* **publication,scripts:** ♻️ run the Nx base and cache steps after the install as publication commands ([#1702](https://github.com/organizzolini/codebase/issues/1702)) ([8a2c0c6](https://github.com/organizzolini/codebase/commit/8a2c0c6aead50835e350000de06aacfff516a48b)), closes [#1699](https://github.com/organizzolini/codebase/issues/1699) [#1564](https://github.com/organizzolini/codebase/issues/1564) [#1565](https://github.com/organizzolini/codebase/issues/1565) [#1569](https://github.com/organizzolini/codebase/issues/1569) [#1699](https://github.com/organizzolini/codebase/issues/1699) [#1565](https://github.com/organizzolini/codebase/issues/1565)

## [3.9.12](https://github.com/organizzolini/codebase/compare/v3.9.11...v3.9.12) (2026-10-17)

### ♻️ Code Refactoring

* **configuration,installation,scripts:** ♻️ inline the bootstrap into installation.sh and drop the shell helpers ([#1701](https://github.com/organizzolini/codebase/issues/1701)) ([6104702](https://github.com/organizzolini/codebase/commit/61047027c5d873178c2a76476db9c0fed0e9a6f2))

## [3.9.11](https://github.com/organizzolini/codebase/compare/v3.9.10...v3.9.11) (2026-10-17)

### 🐛 Bug Fixes

* **lexico:** 🐛 align search page spacing and stop the masonry layout flash ([#1696](https://github.com/organizzolini/codebase/issues/1696)) ([8b4149f](https://github.com/organizzolini/codebase/commit/8b4149fabf4a2542243e81c7cd0a894ebe8212fb))

## [3.9.10](https://github.com/organizzolini/codebase/compare/v3.9.9...v3.9.10) (2026-10-17)

### ♻️ Code Refactoring

* **installation:** ♻️ move update-reui-skill into an installation command ([#1698](https://github.com/organizzolini/codebase/issues/1698)) ([c33111b](https://github.com/organizzolini/codebase/commit/c33111ba311409376ba10900ed9be8392f4799c8))
* **scripts:** ♻️ drop the stale-branch script and move sign-commits into its skill ([#1699](https://github.com/organizzolini/codebase/issues/1699)) ([0d99a0f](https://github.com/organizzolini/codebase/commit/0d99a0f206e49c4e9639c11bd80e372967ee204e))

## [3.9.9](https://github.com/organizzolini/codebase/compare/v3.9.8...v3.9.9) (2026-10-16)

### ♻️ Code Refactoring

* **components:** ♻️ rename components-web to components and list it with the shared packages ([#1691](https://github.com/organizzolini/codebase/issues/1691)) ([ba4415c](https://github.com/organizzolini/codebase/commit/ba4415cf0e533e2804d9b100a3a4ffceb85ebc87))

## [3.9.8](https://github.com/organizzolini/codebase/compare/v3.9.7...v3.9.8) (2026-10-16)

### ♻️ Code Refactoring

* **configuration,synchronization:** ♻️ remove the root project ([#1690](https://github.com/organizzolini/codebase/issues/1690)) ([766efff](https://github.com/organizzolini/codebase/commit/766efff8b6f15f6541ccbc466e90629c543af8d7)), closes [#1669](https://github.com/organizzolini/codebase/issues/1669)

## [3.9.7](https://github.com/organizzolini/codebase/compare/v3.9.6...v3.9.7) (2026-10-16)

### ♻️ Code Refactoring

* **publication:** ♻️ move the release steps into publication commands ([#1569](https://github.com/organizzolini/codebase/issues/1569)) ([de0da35](https://github.com/organizzolini/codebase/commit/de0da3510d5cf443f086eaa970607ec254595e7e)), closes [#1537](https://github.com/organizzolini/codebase/issues/1537) [#1511](https://github.com/organizzolini/codebase/issues/1511) [#1538](https://github.com/organizzolini/codebase/issues/1538) [#1539](https://github.com/organizzolini/codebase/issues/1539) [#1540](https://github.com/organizzolini/codebase/issues/1540) [#1541](https://github.com/organizzolini/codebase/issues/1541) [#1542](https://github.com/organizzolini/codebase/issues/1542) [#1562](https://github.com/organizzolini/codebase/issues/1562)

## [3.9.6](https://github.com/organizzolini/codebase/compare/v3.9.5...v3.9.6) (2026-10-16)

### ♻️ Code Refactoring

* **configuration,publication:** ♻️ create the publication project with the Nx plumbing ([#1562](https://github.com/organizzolini/codebase/issues/1562)) ([f6dffc8](https://github.com/organizzolini/codebase/commit/f6dffc82080f8df266957fcae136551f4c38d973)), closes [#1663](https://github.com/organizzolini/codebase/issues/1663) [#1588](https://github.com/organizzolini/codebase/issues/1588) [#1663](https://github.com/organizzolini/codebase/issues/1663) [#1530](https://github.com/organizzolini/codebase/issues/1530) [#1511](https://github.com/organizzolini/codebase/issues/1511) [#1531](https://github.com/organizzolini/codebase/issues/1531) [#1532](https://github.com/organizzolini/codebase/issues/1532) [#1533](https://github.com/organizzolini/codebase/issues/1533) [#1534](https://github.com/organizzolini/codebase/issues/1534) [#1535](https://github.com/organizzolini/codebase/issues/1535) [#1536](https://github.com/organizzolini/codebase/issues/1536)
* **publication:** ♻️ move the Nx task-database steps into publication commands ([#1565](https://github.com/organizzolini/codebase/issues/1565)) ([06f449b](https://github.com/organizzolini/codebase/commit/06f449bec78525c7c70651cbf612787585dee2c4)), closes [#1546](https://github.com/organizzolini/codebase/issues/1546) [#1663](https://github.com/organizzolini/codebase/issues/1663) [#1544](https://github.com/organizzolini/codebase/issues/1544) [#1511](https://github.com/organizzolini/codebase/issues/1511) [#1545](https://github.com/organizzolini/codebase/issues/1545) [#1546](https://github.com/organizzolini/codebase/issues/1546) [#1548](https://github.com/organizzolini/codebase/issues/1548) [#1547](https://github.com/organizzolini/codebase/issues/1547) [#1562](https://github.com/organizzolini/codebase/issues/1562)

## [3.9.5](https://github.com/organizzolini/codebase/compare/v3.9.4...v3.9.5) (2026-10-16)

### ♻️ Code Refactoring

* **configuration,installation,scripts:** ♻️ create the installation project from the local setup scripts ([#1564](https://github.com/organizzolini/codebase/issues/1564)) ([91df9a1](https://github.com/organizzolini/codebase/commit/91df9a1010b6fe78ecc2cd17eab9da57fd98ff3c)), closes [#1550](https://github.com/organizzolini/codebase/issues/1550) [#1511](https://github.com/organizzolini/codebase/issues/1511) [#1551](https://github.com/organizzolini/codebase/issues/1551) [#1552](https://github.com/organizzolini/codebase/issues/1552) [#1553](https://github.com/organizzolini/codebase/issues/1553) [#1554](https://github.com/organizzolini/codebase/issues/1554) [#1555](https://github.com/organizzolini/codebase/issues/1555) [#1556](https://github.com/organizzolini/codebase/issues/1556) [#1557](https://github.com/organizzolini/codebase/issues/1557)
* **validation:** ♻️ move session branch and worktree checks into commands ([#1567](https://github.com/organizzolini/codebase/issues/1567)) ([9cab275](https://github.com/organizzolini/codebase/commit/9cab275d281769911850de07d11bc35aa77bb651)), closes [#1511](https://github.com/organizzolini/codebase/issues/1511) [#1524](https://github.com/organizzolini/codebase/issues/1524) [#1525](https://github.com/organizzolini/codebase/issues/1525) [#1526](https://github.com/organizzolini/codebase/issues/1526) [#1527](https://github.com/organizzolini/codebase/issues/1527) [#1528](https://github.com/organizzolini/codebase/issues/1528) [#1529](https://github.com/organizzolini/codebase/issues/1529) [#1563](https://github.com/organizzolini/codebase/issues/1563)

## [3.9.4](https://github.com/organizzolini/codebase/compare/v3.9.3...v3.9.4) (2026-10-16)

### 📝 Documentation

* **scripts:** 📝 record the shell floor as an ADR ([#1561](https://github.com/organizzolini/codebase/issues/1561)) ([fec37d0](https://github.com/organizzolini/codebase/commit/fec37d0ddbbc760ca0cb80e7694ccf8bbe1ad131)), closes [#1509](https://github.com/organizzolini/codebase/issues/1509) [#1514](https://github.com/organizzolini/codebase/issues/1514) [#1515](https://github.com/organizzolini/codebase/issues/1515) [#1516](https://github.com/organizzolini/codebase/issues/1516) [#1511](https://github.com/organizzolini/codebase/issues/1511)

### ♻️ Code Refactoring

* **synchronization:** ♻️ move skill restoration into an installed-skills command ([#1563](https://github.com/organizzolini/codebase/issues/1563)) ([d8597a7](https://github.com/organizzolini/codebase/commit/d8597a77b0a8957f3811b09e1dfeccd99b31b028)), closes [#1524](https://github.com/organizzolini/codebase/issues/1524) [#1517](https://github.com/organizzolini/codebase/issues/1517) [#1511](https://github.com/organizzolini/codebase/issues/1511) [#1518](https://github.com/organizzolini/codebase/issues/1518) [#1519](https://github.com/organizzolini/codebase/issues/1519) [#1520](https://github.com/organizzolini/codebase/issues/1520) [#1521](https://github.com/organizzolini/codebase/issues/1521) [#1522](https://github.com/organizzolini/codebase/issues/1522) [#1523](https://github.com/organizzolini/codebase/issues/1523) [#1524](https://github.com/organizzolini/codebase/issues/1524)

## [3.9.3](https://github.com/organizzolini/codebase/compare/v3.9.2...v3.9.3) (2026-10-16)

### ♻️ Code Refactoring

* **configuration:** ♻️ move the root project's code gates and CI targets into configuration ([#1669](https://github.com/organizzolini/codebase/issues/1669)) ([31fac6a](https://github.com/organizzolini/codebase/commit/31fac6a08fff7846896fc3a2765b9bbecfd2dc26))

## [3.9.2](https://github.com/organizzolini/codebase/compare/v3.9.1...v3.9.2) (2026-10-16)

### ⚡ Performance Improvements

* **configuration,conformetry,scripts:** ⚡️ raise local pre-commit parallelism and overlap conformetry ([#1663](https://github.com/organizzolini/codebase/issues/1663)) ([b64cef5](https://github.com/organizzolini/codebase/commit/b64cef53be9cc83137c823c1227c2f13ca5395de))

## [3.9.1](https://github.com/organizzolini/codebase/compare/v3.9.0...v3.9.1) (2026-10-16)

### 🐛 Bug Fixes

* **codependix:** 🐛 load a project's module files one at a time ([#1668](https://github.com/organizzolini/codebase/issues/1668)) ([00b141b](https://github.com/organizzolini/codebase/commit/00b141bbe9e20e600a19fcc20fe4d7952434bdf1))

## [3.9.0](https://github.com/organizzolini/codebase/compare/v3.8.3...v3.9.0) (2026-10-16)

### ✨ Features

* **validation,documentation:** ✨ enforce issue types on issue hierarchy ([#1665](https://github.com/organizzolini/codebase/issues/1665)) ([fefd4ef](https://github.com/organizzolini/codebase/commit/fefd4ef5b759b3746bae40190af61b9e53cf1621))

### 🐛 Bug Fixes

* **documentation:** 🐛 drop the dead source .env from the openwiki target ([#1667](https://github.com/organizzolini/codebase/issues/1667)) ([0618c63](https://github.com/organizzolini/codebase/commit/0618c6387a08db82dc9a4083aa6027e5dad7e4b1))

## [3.8.3](https://github.com/organizzolini/codebase/compare/v3.8.2...v3.8.3) (2026-10-16)

### 🐛 Bug Fixes

* **database:** 🐛 start dry-run plan log messages with a verb ([#1666](https://github.com/organizzolini/codebase/issues/1666)) ([950d721](https://github.com/organizzolini/codebase/commit/950d721b93412e7ed43abc730b4392632c8680f9)), closes [#1571](https://github.com/organizzolini/codebase/issues/1571) [#1593](https://github.com/organizzolini/codebase/issues/1593)

## [3.8.2](https://github.com/organizzolini/codebase/compare/v3.8.1...v3.8.2) (2026-10-15)

### ♻️ Code Refactoring

* **callidescope,codependix,codometer,conformetry:** ♻️ require --config on every ic-suite command line ([#1598](https://github.com/organizzolini/codebase/issues/1598)) ([541a319](https://github.com/organizzolini/codebase/commit/541a3197012a76135d1258490d458a25b72ba983))

## [3.8.1](https://github.com/organizzolini/codebase/compare/v3.8.0...v3.8.1) (2026-10-15)

### ♻️ Code Refactoring

* **configuration,documentation:** ♻️ move the configuration folder into an nx project ([#1509](https://github.com/organizzolini/codebase/issues/1509)) ([e9de999](https://github.com/organizzolini/codebase/commit/e9de99988526745eead1e988765f8261daae816e))

## [3.8.0](https://github.com/organizzolini/codebase/compare/v3.7.0...v3.8.0) (2026-10-15)

### ✨ Features

* **database,lexico-cli,scripts:** ✨ add export and import commands for postgres data ([#1593](https://github.com/organizzolini/codebase/issues/1593)) ([3968c32](https://github.com/organizzolini/codebase/commit/3968c3215c2e79a8584c116fe3aef1350ac92847)), closes [#1594](https://github.com/organizzolini/codebase/issues/1594) [#1572](https://github.com/organizzolini/codebase/issues/1572) [#1571](https://github.com/organizzolini/codebase/issues/1571) [#1573](https://github.com/organizzolini/codebase/issues/1573) [#1574](https://github.com/organizzolini/codebase/issues/1574) [#1575](https://github.com/organizzolini/codebase/issues/1575) [#1576](https://github.com/organizzolini/codebase/issues/1576) [#1577](https://github.com/organizzolini/codebase/issues/1577) [#1578](https://github.com/organizzolini/codebase/issues/1578) [#1579](https://github.com/organizzolini/codebase/issues/1579) [#1580](https://github.com/organizzolini/codebase/issues/1580) [#1581](https://github.com/organizzolini/codebase/issues/1581) [#1594](https://github.com/organizzolini/codebase/issues/1594)

### 📝 Documentation

* **components-web,documentation:** 📝 add reui skill and mcp servers ([#1600](https://github.com/organizzolini/codebase/issues/1600)) ([66a0464](https://github.com/organizzolini/codebase/commit/66a0464318186b4cebb378964f14d7fba03a6790))

### ♻️ Code Refactoring

* **infrastructure,documentation:** 🔥 remove postgres-data targets and seed-postgres skill ([#1594](https://github.com/organizzolini/codebase/issues/1594)) ([e8a4e71](https://github.com/organizzolini/codebase/commit/e8a4e71f61d3b067551ca1155083e11ab3c0bc06)), closes [#1582](https://github.com/organizzolini/codebase/issues/1582) [#1583](https://github.com/organizzolini/codebase/issues/1583) [#1584](https://github.com/organizzolini/codebase/issues/1584) [#1571](https://github.com/organizzolini/codebase/issues/1571) [#1593](https://github.com/organizzolini/codebase/issues/1593)

## [3.7.0](https://github.com/organizzolini/codebase/compare/v3.6.0...v3.7.0) (2026-10-15)

### ✨ Features

* **lexico,scripts:** ✨ derive default ports from project names ([#1597](https://github.com/organizzolini/codebase/issues/1597)) ([b07b779](https://github.com/organizzolini/codebase/commit/b07b7795d4aa60da410e28c95743c5d0f87b3617))

## [3.6.0](https://github.com/organizzolini/codebase/compare/v3.5.0...v3.6.0) (2026-10-15)

### ✨ Features

* **ic-suite,configuration:** ✨ name root files after their project and declare root modules ([#1588](https://github.com/organizzolini/codebase/issues/1588)) ([e503714](https://github.com/organizzolini/codebase/commit/e503714d3bbca9ff3a7f2121bb3575f7a9d97dc7)), closes [#1480](https://github.com/organizzolini/codebase/issues/1480) [#1480](https://github.com/organizzolini/codebase/issues/1480)

## [3.5.0](https://github.com/organizzolini/codebase/compare/v3.4.1...v3.5.0) (2026-10-15)

### ✨ Features

* **lexico,configuration:** ✨ rebuild search page and remove legacy code ([#1513](https://github.com/organizzolini/codebase/issues/1513)) ([4d97785](https://github.com/organizzolini/codebase/commit/4d97785f7603876db1d8c2e62ee5e450c59ad1f7))
* **lexico:** ✨ expose the words behind each form of a lexeme ([#1586](https://github.com/organizzolini/codebase/issues/1586)) ([41285d5](https://github.com/organizzolini/codebase/commit/41285d530366a261e4a06171899ce236545997c7))
* **lexico:** ✨ rebuild the lexeme card with etymology, pronunciation, and forms ([#1587](https://github.com/organizzolini/codebase/issues/1587)) ([431c13e](https://github.com/organizzolini/codebase/commit/431c13e5334240ba31a12119f12fbf1c67010f7b))

## [3.4.1](https://github.com/organizzolini/codebase/compare/v3.4.0...v3.4.1) (2026-10-15)

### 🐛 Bug Fixes

* **configuration:** 🐛 exit non-zero when a template-generated cli command throws ([#1591](https://github.com/organizzolini/codebase/issues/1591)) ([5b02e7a](https://github.com/organizzolini/codebase/commit/5b02e7abe3daece5eeb20e384d63004580a8a69e))

## [3.4.0](https://github.com/organizzolini/codebase/compare/v3.3.2...v3.4.0) (2026-10-15)

### ✨ Features

* **infrastructure,affirmancy,validation,documentation:** ✨ make infrastructure an Nx project and check searxng ([#1512](https://github.com/organizzolini/codebase/issues/1512)) ([d229cf9](https://github.com/organizzolini/codebase/commit/d229cf99c869c003145635b844d3a5a40f6e3b50)), closes [.github/CONTRIBUTING.md#release-significance](https://github.com/.github/CONTRIBUTING.md/issues/release-significance)

## [3.3.2](https://github.com/organizzolini/codebase/compare/v3.3.1...v3.3.2) (2026-10-15)

### 🐛 Bug Fixes

* **configuration:** 🐛 make squawk.toml settings actually apply ([#1559](https://github.com/organizzolini/codebase/issues/1559)) ([7bcdccb](https://github.com/organizzolini/codebase/commit/7bcdccb9a428823a747eb77c3cabfcf5d36ded24))

## [3.3.1](https://github.com/organizzolini/codebase/compare/v3.3.0...v3.3.1) (2026-10-15)

### 🐛 Bug Fixes

* **configuration:** 🐛 ignore vendored component paths in spell-check ([#1585](https://github.com/organizzolini/codebase/issues/1585)) ([7d46cd4](https://github.com/organizzolini/codebase/commit/7d46cd4709c66c00989e34c649bd261edff5354e)), closes [#1510](https://github.com/organizzolini/codebase/issues/1510)

## [3.3.0](https://github.com/organizzolini/codebase/compare/v3.2.9...v3.3.0) (2026-10-15)

### ✨ Features

* **components-web,lexico,configuration:** ✨ switch to Base UI and vendor ReUI components ([#1510](https://github.com/organizzolini/codebase/issues/1510)) ([62dde69](https://github.com/organizzolini/codebase/commit/62dde69df4f705a268820586aeb3604ebad90890))

## [3.2.9](https://github.com/organizzolini/codebase/compare/v3.2.8...v3.2.9) (2026-10-15)

### 🐛 Bug Fixes

* **lexico-cli:** 🐛 send user agent and skip cached wiktionary pages ([#1570](https://github.com/organizzolini/codebase/issues/1570)) ([9ba0ce9](https://github.com/organizzolini/codebase/commit/9ba0ce9a6964caaef714d6f20e91dddb03d8350e))

## [3.2.8](https://github.com/organizzolini/codebase/compare/v3.2.7...v3.2.8) (2026-10-14)

### 🐛 Bug Fixes

* **conformetry:** 🐛 let the sync generator run under nx g ([#1560](https://github.com/organizzolini/codebase/issues/1560)) ([570279e](https://github.com/organizzolini/codebase/commit/570279e7d74b1bce517a78611e4754e2c01e211f))

## [3.2.7](https://github.com/organizzolini/codebase/compare/v3.2.6...v3.2.7) (2026-10-14)

### 📝 Documentation

* **documentation,configuration,deployments:** 📝 consolidate docs and openwiki into documentation behind symlinks ([#1507](https://github.com/organizzolini/codebase/issues/1507)) ([af71371](https://github.com/organizzolini/codebase/commit/af713719da5c29a3103eb58c5fd53998a6fbcfc1))

## [3.2.6](https://github.com/organizzolini/codebase/compare/v3.2.5...v3.2.6) (2026-10-13)

### ♻️ Code Refactoring

* **configuration,synchronization,validation:** ♻️ move root validation and sync targets into their projects ([#1508](https://github.com/organizzolini/codebase/issues/1508)) ([95be3b6](https://github.com/organizzolini/codebase/commit/95be3b642d3656eaca8ef4ee8730ae6a0827a3d3))

## [3.2.5](https://github.com/organizzolini/codebase/compare/v3.2.4...v3.2.5) (2026-10-13)

### 🐛 Bug Fixes

* **configuration:** 🐛 keep gitignored dist readmes out of release commits ([#1506](https://github.com/organizzolini/codebase/issues/1506)) ([e7e0733](https://github.com/organizzolini/codebase/commit/e7e0733b8ee8851ffdfc8866e9eb0c1253919dc2)), closes [#1439](https://github.com/organizzolini/codebase/issues/1439) [organizzolini/codebase#1439](https://github.com/organizzolini/codebase/issues/1439)

## [3.2.4](https://github.com/organizzolini/codebase/compare/v3.2.3...v3.2.4) (2026-10-13)

### 📝 Documentation

* **caelundas:** 📝 remove a committed conflict marker from the pheno jsdoc ([#1503](https://github.com/organizzolini/codebase/issues/1503)) ([fe7aa0e](https://github.com/organizzolini/codebase/commit/fe7aa0e3e6a963be3d64d73fe3b3549d39bc026e)), closes [organizzolini/codebase#1424](https://github.com/organizzolini/codebase/issues/1424)

### ♻️ Code Refactoring

* **configuration,codometer,validation:** ♻️ nest every project under a single projects folder ([#1439](https://github.com/organizzolini/codebase/issues/1439)) ([b6192f8](https://github.com/organizzolini/codebase/commit/b6192f8e3ee2e9ad6e767c73922ea62a516b0381)), closes [.github/CONTRIBUTING.md#workspace-structure](https://github.com/.github/CONTRIBUTING.md/issues/workspace-structure)

## [3.2.3](https://github.com/organizzolini/codebase/compare/v3.2.2...v3.2.3) (2026-10-13)

### 📝 Documentation

* **codependix,documentation:** 📝 tidy the codependix skills, attribution examples, and plugin ADR note ([#1445](https://github.com/organizzolini/codebase/issues/1445)) ([3e5441a](https://github.com/organizzolini/codebase/commit/3e5441ac38a89849d57d03041b039194ea126f40)), closes [#1441](https://github.com/organizzolini/codebase/issues/1441) [#1444](https://github.com/organizzolini/codebase/issues/1444) [#1429](https://github.com/organizzolini/codebase/issues/1429) [#1430](https://github.com/organizzolini/codebase/issues/1430) [#1430](https://github.com/organizzolini/codebase/issues/1430) [#1434](https://github.com/organizzolini/codebase/issues/1434) [#1221](https://github.com/organizzolini/codebase/issues/1221) [#1444](https://github.com/organizzolini/codebase/issues/1444)

## [3.2.2](https://github.com/organizzolini/codebase/compare/v3.2.1...v3.2.2) (2026-10-13)

### 🐛 Bug Fixes

* **callidescope,codependix,configuration:** 🐛 harden the codependix nx plugin for consumers outside this workspace ([#1444](https://github.com/organizzolini/codebase/issues/1444)) ([05278c1](https://github.com/organizzolini/codebase/commit/05278c15044ce05d532dba652363465ea41cfd4c)), closes [#1433](https://github.com/organizzolini/codebase/issues/1433) [#1221](https://github.com/organizzolini/codebase/issues/1221) [#1441](https://github.com/organizzolini/codebase/issues/1441)

## [3.2.1](https://github.com/organizzolini/codebase/compare/v3.2.0...v3.2.1) (2026-10-13)

### 🐛 Bug Fixes

* **codependix:** 🐛 warn on unmatched selection entries and harden the boundary report ([#1441](https://github.com/organizzolini/codebase/issues/1441)) ([4dd5def](https://github.com/organizzolini/codebase/commit/4dd5def7bf3192ad9763d7f343a1ef72350b7209)), closes [#1432](https://github.com/organizzolini/codebase/issues/1432) [#1221](https://github.com/organizzolini/codebase/issues/1221) [#1430](https://github.com/organizzolini/codebase/issues/1430)

### 📝 Documentation

* **documentation:** 📝 add affirmancy heading and fix readme project list breaks ([#1501](https://github.com/organizzolini/codebase/issues/1501)) ([cd8d701](https://github.com/organizzolini/codebase/commit/cd8d70166f4c0a308875007cdc0edd8393214867))

## [3.2.0](https://github.com/organizzolini/codebase/compare/v3.1.1...v3.2.0) (2026-10-13)

### ✨ Features

* **codependix:** ✨ infer a per-project codependix-gate target from a new nx plugin ([#1429](https://github.com/organizzolini/codebase/issues/1429)) ([d09ee1a](https://github.com/organizzolini/codebase/commit/d09ee1a22c91e10470af55a35545fe504c8daf0c)), closes [#1201](https://github.com/organizzolini/codebase/issues/1201) [#1403](https://github.com/organizzolini/codebase/issues/1403) [#1221](https://github.com/organizzolini/codebase/issues/1221) [#1419](https://github.com/organizzolini/codebase/issues/1419)

### 🐛 Bug Fixes

* **caelundas,conformetry:** 🐛 require an explicit directory instead of defaulting the destination ([#1395](https://github.com/organizzolini/codebase/issues/1395)) ([c84885a](https://github.com/organizzolini/codebase/commit/c84885a96fb2939dedad303d904fa2f30b6495f1))
* **deployments:** 🐛 baseline a new package's first release ([#1499](https://github.com/organizzolini/codebase/issues/1499)) ([63639a7](https://github.com/organizzolini/codebase/commit/63639a74cb34b9f49b4224ac032654922622e5cf)), closes [#1429](https://github.com/organizzolini/codebase/issues/1429) [#1429](https://github.com/organizzolini/codebase/issues/1429)
* **deployments:** 🐛 skip the pre-commit hook on release commits ([#1502](https://github.com/organizzolini/codebase/issues/1502)) ([8a83e1a](https://github.com/organizzolini/codebase/commit/8a83e1ae8981652b027be59663284ccd4c6dabcc)), closes [#1499](https://github.com/organizzolini/codebase/issues/1499)

### 📝 Documentation

* **documentation:** 📝 clean up local resources after ship-changes and let submit-changes fix easy hook failures ([#1500](https://github.com/organizzolini/codebase/issues/1500)) ([865bd18](https://github.com/organizzolini/codebase/commit/865bd1804c8896c76664ffebbf7e55db0d51eaff))
* **documentation:** 📝 restructure readme project sections ([#1497](https://github.com/organizzolini/codebase/issues/1497)) ([6c36cef](https://github.com/organizzolini/codebase/commit/6c36cefd5df69b99e6aff9facdf8231002d1a9ed))

## [3.1.1](https://github.com/organizzolini/codebase/compare/v3.1.0...v3.1.1) (2026-10-12)

### 🐛 Bug Fixes

* **caelundas:** 🐛 define LongitudesWindow once ([#1498](https://github.com/organizzolini/codebase/issues/1498)) ([de3aac8](https://github.com/organizzolini/codebase/commit/de3aac86875eac257e6175e6ea161d87617944bc)), closes [#1495](https://github.com/organizzolini/codebase/issues/1495) [#1429](https://github.com/organizzolini/codebase/issues/1429) [#1446](https://github.com/organizzolini/codebase/issues/1446) [#1429](https://github.com/organizzolini/codebase/issues/1429)

## [3.1.0](https://github.com/organizzolini/codebase/compare/v3.0.6...v3.1.0) (2026-10-12)

### ✨ Features

* **validation,lexico-entities,dependencies:** ✨ hold pull request body sections to a shape and word limit ([#1446](https://github.com/organizzolini/codebase/issues/1446)) ([01cfc89](https://github.com/organizzolini/codebase/commit/01cfc89cf310dabeb8699f30835cb7327feb92bd)), closes [#1447](https://github.com/organizzolini/codebase/issues/1447) [#1399](https://github.com/organizzolini/codebase/issues/1399) [#1399](https://github.com/organizzolini/codebase/issues/1399)

### 📝 Documentation

* **documentation:** 📝 add ship-changes skill to carry pull requests through to main ([#1494](https://github.com/organizzolini/codebase/issues/1494)) ([eb556eb](https://github.com/organizzolini/codebase/commit/eb556ebeeea25f4b88abfddcef23313df3ab9335)), closes [.github/CONTRIBUTING.md#pull-request-process](https://github.com/.github/CONTRIBUTING.md/issues/pull-request-process)

## [3.0.6](https://github.com/organizzolini/codebase/compare/v3.0.5...v3.0.6) (2026-10-12)

### 🐛 Bug Fixes

* **caelundas:** 🐛 restore two lost fixes and speed up the end-to-end tests ([#1495](https://github.com/organizzolini/codebase/issues/1495)) ([f2a0312](https://github.com/organizzolini/codebase/commit/f2a03120dd80ae0bd48e84fcaee1fa3b2b6a88f5)), closes [#1413](https://github.com/organizzolini/codebase/issues/1413) [#1417](https://github.com/organizzolini/codebase/issues/1417) [#1413](https://github.com/organizzolini/codebase/issues/1413) [#1413](https://github.com/organizzolini/codebase/issues/1413) [#1428](https://github.com/organizzolini/codebase/issues/1428) [#1424](https://github.com/organizzolini/codebase/issues/1424) [#1413](https://github.com/organizzolini/codebase/issues/1413) [#1428](https://github.com/organizzolini/codebase/issues/1428) [#1417](https://github.com/organizzolini/codebase/issues/1417) [#1429](https://github.com/organizzolini/codebase/issues/1429) [#1430](https://github.com/organizzolini/codebase/issues/1430) [#1441](https://github.com/organizzolini/codebase/issues/1441) [#1444](https://github.com/organizzolini/codebase/issues/1444) [#1492](https://github.com/organizzolini/codebase/issues/1492) [#1496](https://github.com/organizzolini/codebase/issues/1496)

## [3.0.5](https://github.com/organizzolini/codebase/compare/v3.0.4...v3.0.5) (2026-10-12)

### 📦 Build System

* **configuration:** 📦️ pin python to 3.14 ([#1493](https://github.com/organizzolini/codebase/issues/1493)) ([6445506](https://github.com/organizzolini/codebase/commit/6445506945b01602944450ca4c7439d6216a6edd))

## [3.0.4](https://github.com/organizzolini/codebase/compare/v3.0.3...v3.0.4) (2026-10-09)

### 🐛 Bug Fixes

* **caelundas:** 🐛 generate the advertised lunar apogee and perigee ([#1420](https://github.com/organizzolini/codebase/issues/1420)) ([31b4b59](https://github.com/organizzolini/codebase/commit/31b4b59a275bd62c8f3c8bbf791d62c220213279)), closes [#1387](https://github.com/organizzolini/codebase/issues/1387) [#1388](https://github.com/organizzolini/codebase/issues/1388) [#1341](https://github.com/organizzolini/codebase/issues/1341) [#1408](https://github.com/organizzolini/codebase/issues/1408) [#1378](https://github.com/organizzolini/codebase/issues/1378)
* **caelundas:** 🐛 judge local eclipse visibility topocentrically ([#1428](https://github.com/organizzolini/codebase/issues/1428)) ([42ec02b](https://github.com/organizzolini/codebase/commit/42ec02b24a17dd892f1005f2d0cdc07d12e3b75b)), closes [#1372](https://github.com/organizzolini/codebase/issues/1372) [#1373](https://github.com/organizzolini/codebase/issues/1373) [#1341](https://github.com/organizzolini/codebase/issues/1341) [#1425](https://github.com/organizzolini/codebase/issues/1425)
* **caelundas:** 🐛 seed compound aspects already in orb at the window start ([#1417](https://github.com/organizzolini/codebase/issues/1417)) ([29206b9](https://github.com/organizzolini/codebase/commit/29206b9c7a71ec1d3bad111ccf9bb3634ae4c76d)), closes [#1362](https://github.com/organizzolini/codebase/issues/1362) [#1363](https://github.com/organizzolini/codebase/issues/1363) [#1363](https://github.com/organizzolini/codebase/issues/1363) [#1359](https://github.com/organizzolini/codebase/issues/1359) [#1363](https://github.com/organizzolini/codebase/issues/1363) [#1356](https://github.com/organizzolini/codebase/issues/1356) [#1357](https://github.com/organizzolini/codebase/issues/1357) [#1358](https://github.com/organizzolini/codebase/issues/1358) [#1341](https://github.com/organizzolini/codebase/issues/1341) [#1408](https://github.com/organizzolini/codebase/issues/1408) [#1359](https://github.com/organizzolini/codebase/issues/1359)
* **caelundas:** 🐛 time geocentric eclipses by standard contacts ([#1425](https://github.com/organizzolini/codebase/issues/1425)) ([dfccd37](https://github.com/organizzolini/codebase/commit/dfccd37ba959f46745257d4effabe55f3c046183)), closes [#1372](https://github.com/organizzolini/codebase/issues/1372) [#1369](https://github.com/organizzolini/codebase/issues/1369) [#1370](https://github.com/organizzolini/codebase/issues/1370) [#1371](https://github.com/organizzolini/codebase/issues/1371) [#1341](https://github.com/organizzolini/codebase/issues/1341) [#1412](https://github.com/organizzolini/codebase/issues/1412)
* **caelundas:** 🐛 wrap east/west and measure true elongation for planetary phases ([#1424](https://github.com/organizzolini/codebase/issues/1424)) ([46c11de](https://github.com/organizzolini/codebase/commit/46c11dea79c417b34bd44643905c85b6f1eb3994)), closes [#1374](https://github.com/organizzolini/codebase/issues/1374) [#1375](https://github.com/organizzolini/codebase/issues/1375) [#1376](https://github.com/organizzolini/codebase/issues/1376) [#1377](https://github.com/organizzolini/codebase/issues/1377) [#1341](https://github.com/organizzolini/codebase/issues/1341) [#1408](https://github.com/organizzolini/codebase/issues/1408)

### 📝 Documentation

* **caelundas:** 📝 document the astronomical and astrological conventions ([#1422](https://github.com/organizzolini/codebase/issues/1422)) ([d749a36](https://github.com/organizzolini/codebase/commit/d749a3600d4a9a75c92972fc002e49a6458a9584)), closes [#1363](https://github.com/organizzolini/codebase/issues/1363) [#1366](https://github.com/organizzolini/codebase/issues/1366) [#1412](https://github.com/organizzolini/codebase/issues/1412) [#1383](https://github.com/organizzolini/codebase/issues/1383) [#1387](https://github.com/organizzolini/codebase/issues/1387) [#1366](https://github.com/organizzolini/codebase/issues/1366) [#1389](https://github.com/organizzolini/codebase/issues/1389) [#1390](https://github.com/organizzolini/codebase/issues/1390) [#1341](https://github.com/organizzolini/codebase/issues/1341) [#1414](https://github.com/organizzolini/codebase/issues/1414)

## [3.0.3](https://github.com/organizzolini/codebase/compare/v3.0.2...v3.0.3) (2026-10-09)

### 🐛 Bug Fixes

* **caelundas:** 🐛 make peak ingress direction-aware ([#1418](https://github.com/organizzolini/codebase/issues/1418)) ([53b28bf](https://github.com/organizzolini/codebase/commit/53b28bf36273f40e33dfa9bcf13ca2ab0dcc5384)), closes [#1383](https://github.com/organizzolini/codebase/issues/1383) [#1384](https://github.com/organizzolini/codebase/issues/1384) [#1341](https://github.com/organizzolini/codebase/issues/1341) [#1408](https://github.com/organizzolini/codebase/issues/1408)

## [3.0.2](https://github.com/organizzolini/codebase/compare/v3.0.1...v3.0.2) (2026-10-09)

### 🐛 Bug Fixes

* **caelundas:** 🐛 report one solar perihelion and aphelion per year ([#1470](https://github.com/organizzolini/codebase/issues/1470)) ([fc3a634](https://github.com/organizzolini/codebase/commit/fc3a634393dec64db7158c808953c5e095e195d7)), closes [#1346](https://github.com/organizzolini/codebase/issues/1346) [#1387](https://github.com/organizzolini/codebase/issues/1387) [#1410](https://github.com/organizzolini/codebase/issues/1410) [#1346](https://github.com/organizzolini/codebase/issues/1346) [#1378](https://github.com/organizzolini/codebase/issues/1378) [#1379](https://github.com/organizzolini/codebase/issues/1379) [#1341](https://github.com/organizzolini/codebase/issues/1341) [#1410](https://github.com/organizzolini/codebase/issues/1410) [#1346](https://github.com/organizzolini/codebase/issues/1346)
* **caelundas:** 🐛 time primary Moon phases by ecliptic longitude ([#1414](https://github.com/organizzolini/codebase/issues/1414)) ([ece0475](https://github.com/organizzolini/codebase/commit/ece0475539920233da5054107b19c4fe4a7fd0a9)), closes [#1380](https://github.com/organizzolini/codebase/issues/1380) [#1381](https://github.com/organizzolini/codebase/issues/1381) [#1408](https://github.com/organizzolini/codebase/issues/1408) [#1389](https://github.com/organizzolini/codebase/issues/1389)

## [3.0.1](https://github.com/organizzolini/codebase/compare/v3.0.0...v3.0.1) (2026-10-08)

### 🐛 Bug Fixes

* **caelundas:** 🐛 detect exact conjunctions and oppositions by sign change ([#1413](https://github.com/organizzolini/codebase/issues/1413)) ([2318faf](https://github.com/organizzolini/codebase/commit/2318faf39ee303fb6b75bcb669131736c959589d)), closes [#1353](https://github.com/organizzolini/codebase/issues/1353) [#1354](https://github.com/organizzolini/codebase/issues/1354) [#1355](https://github.com/organizzolini/codebase/issues/1355) [#1341](https://github.com/organizzolini/codebase/issues/1341) [#1408](https://github.com/organizzolini/codebase/issues/1408)

## [3.0.0](https://github.com/organizzolini/codebase/compare/v2.35.5...v3.0.0) (2026-10-08)

### ⚠ BREAKING CHANGES

* **codependix:** 💥 charge boundary findings to the projects they belong to (#1409)

### ✨ Features

* **codependix:** ✨ print boundary findings in the markdown and json output ([#1415](https://github.com/organizzolini/codebase/issues/1415)) ([5031d07](https://github.com/organizzolini/codebase/commit/5031d07e7b37b41d63311603e16c29cc6efacc7a)), closes [#1409](https://github.com/organizzolini/codebase/issues/1409) [#1401](https://github.com/organizzolini/codebase/issues/1401) [#1221](https://github.com/organizzolini/codebase/issues/1221) [#1409](https://github.com/organizzolini/codebase/issues/1409)
* **codependix:** 💥 charge boundary findings to the projects they belong to ([#1409](https://github.com/organizzolini/codebase/issues/1409)) ([ff4cce2](https://github.com/organizzolini/codebase/commit/ff4cce25cb7f41a16fbdafcfe61663b910a02c75)), closes [#1201](https://github.com/organizzolini/codebase/issues/1201) [#1400](https://github.com/organizzolini/codebase/issues/1400) [#1221](https://github.com/organizzolini/codebase/issues/1221) [#1201](https://github.com/organizzolini/codebase/issues/1201) [#1218](https://github.com/organizzolini/codebase/issues/1218)

### 📝 Documentation

* **codependix:** 📝 add an example for each boundary attribution rule ([#1419](https://github.com/organizzolini/codebase/issues/1419)) ([3da2f6e](https://github.com/organizzolini/codebase/commit/3da2f6e499ee2a25d3c7037ed43b72127df2d1b9)), closes [#1402](https://github.com/organizzolini/codebase/issues/1402) [#1221](https://github.com/organizzolini/codebase/issues/1221) [#1415](https://github.com/organizzolini/codebase/issues/1415) [#1409](https://github.com/organizzolini/codebase/issues/1409)

## [2.35.5](https://github.com/organizzolini/codebase/compare/v2.35.4...v2.35.5) (2026-10-08)

### 🐛 Bug Fixes

* **ic-suite:** 🐛 exit non-zero when an ic-suite cli command throws ([#1486](https://github.com/organizzolini/codebase/issues/1486)) ([7cd6b5c](https://github.com/organizzolini/codebase/commit/7cd6b5c1af92d56ffd112e2ea5b4d84d91fabbd2)), closes [#1480](https://github.com/organizzolini/codebase/issues/1480) [#1480](https://github.com/organizzolini/codebase/issues/1480) [#1479](https://github.com/organizzolini/codebase/issues/1479) [#1480](https://github.com/organizzolini/codebase/issues/1480)

## [2.35.4](https://github.com/organizzolini/codebase/compare/v2.35.3...v2.35.4) (2026-10-08)

### 🐛 Bug Fixes

* **caelundas:** 🐛 compute rise and set with topocentric parallax and standard altitude ([#1412](https://github.com/organizzolini/codebase/issues/1412)) ([191d6c2](https://github.com/organizzolini/codebase/commit/191d6c25159e5c0017b5ac2f4780ecd9f0027e5a)), closes [#1372](https://github.com/organizzolini/codebase/issues/1372) [#1366](https://github.com/organizzolini/codebase/issues/1366) [#1367](https://github.com/organizzolini/codebase/issues/1367) [#1368](https://github.com/organizzolini/codebase/issues/1368) [#1341](https://github.com/organizzolini/codebase/issues/1341) [#1408](https://github.com/organizzolini/codebase/issues/1408)

## [2.35.3](https://github.com/organizzolini/codebase/compare/v2.35.2...v2.35.3) (2026-10-08)

### 🐛 Bug Fixes

* **caelundas:** 🐛 end calendar lines with CRLF and fold them at 75 octets ([#1431](https://github.com/organizzolini/codebase/issues/1431)) ([0d86d6a](https://github.com/organizzolini/codebase/commit/0d86d6a35ff75f4111d945c87bae10593b7dca56)), closes [#1406](https://github.com/organizzolini/codebase/issues/1406) [#1406](https://github.com/organizzolini/codebase/issues/1406) [#1341](https://github.com/organizzolini/codebase/issues/1341)
* **deployments:** 🐛 finish a partly tagged release instead of versioning it again ([#1476](https://github.com/organizzolini/codebase/issues/1476)) ([4400e0d](https://github.com/organizzolini/codebase/commit/4400e0dd505076c1a19591ecae407bd491f8b820))
* **ic-suite:** 🐛 keep class and function names in the published ic-suite bundles ([#1472](https://github.com/organizzolini/codebase/issues/1472)) ([029082e](https://github.com/organizzolini/codebase/commit/029082e72981d16b634998b2a75156452e7b6ddd)), closes [#1208](https://github.com/organizzolini/codebase/issues/1208) [#1451](https://github.com/organizzolini/codebase/issues/1451) [#1221](https://github.com/organizzolini/codebase/issues/1221) [#1455](https://github.com/organizzolini/codebase/issues/1455) [#1456](https://github.com/organizzolini/codebase/issues/1456) [.github/CONTRIBUTING.md#release-process](https://github.com/.github/CONTRIBUTING.md/issues/release-process)
* **synchronization:** 🐛 exit non-zero when a synchronization command throws ([#1485](https://github.com/organizzolini/codebase/issues/1485)) ([de6102f](https://github.com/organizzolini/codebase/commit/de6102f314ca664df013f0ba95ffc2aeb733dc57)), closes [#1477](https://github.com/organizzolini/codebase/issues/1477) [#1478](https://github.com/organizzolini/codebase/issues/1478) [#1477](https://github.com/organizzolini/codebase/issues/1477)
* **validation:** 🐛 exit non-zero when a validation command throws ([#1477](https://github.com/organizzolini/codebase/issues/1477)) ([ce4ad45](https://github.com/organizzolini/codebase/commit/ce4ad450198c304da1ef86c017e4113d2c83eb97)), closes [#1475](https://github.com/organizzolini/codebase/issues/1475)

## [2.35.2](https://github.com/organizzolini/codebase/compare/v2.35.1...v2.35.2) (2026-10-08)

### 🐛 Bug Fixes

* **caelundas:** 🐛 name every body identically across events ([#1407](https://github.com/organizzolini/codebase/issues/1407)) ([7068538](https://github.com/organizzolini/codebase/commit/7068538a56c26f25bd44262b4ca7c98d7f007fff)), closes [#1349](https://github.com/organizzolini/codebase/issues/1349) [#1350](https://github.com/organizzolini/codebase/issues/1350) [#1351](https://github.com/organizzolini/codebase/issues/1351)

## [2.35.1](https://github.com/organizzolini/codebase/compare/v2.35.0...v2.35.1) (2026-10-08)

### 🐛 Bug Fixes

* **caelundas:** 🐛 detect stelliums by maximal clique ([#1427](https://github.com/organizzolini/codebase/issues/1427)) ([7db89f6](https://github.com/organizzolini/codebase/commit/7db89f65090364ad86f9275404fe5e8433eaa345)), closes [#1356](https://github.com/organizzolini/codebase/issues/1356) [#1417](https://github.com/organizzolini/codebase/issues/1417) [#1363](https://github.com/organizzolini/codebase/issues/1363) [#1364](https://github.com/organizzolini/codebase/issues/1364) [#1365](https://github.com/organizzolini/codebase/issues/1365) [#1341](https://github.com/organizzolini/codebase/issues/1341) [#1423](https://github.com/organizzolini/codebase/issues/1423) [#1410](https://github.com/organizzolini/codebase/issues/1410) [#1408](https://github.com/organizzolini/codebase/issues/1408) [#1417](https://github.com/organizzolini/codebase/issues/1417) [#1356](https://github.com/organizzolini/codebase/issues/1356)
* **caelundas:** 🐛 emit a valid VTIMEZONE for every zone ([#1406](https://github.com/organizzolini/codebase/issues/1406)) ([ac2f025](https://github.com/organizzolini/codebase/commit/ac2f0255a368455cbd5adc5967e2068ea8a0c217)), closes [#1385](https://github.com/organizzolini/codebase/issues/1385) [#1386](https://github.com/organizzolini/codebase/issues/1386) [#1341](https://github.com/organizzolini/codebase/issues/1341)
* **caelundas:** 🐛 emit each compound aspect once with correct titles and timing ([#1423](https://github.com/organizzolini/codebase/issues/1423)) ([01f3fa4](https://github.com/organizzolini/codebase/commit/01f3fa4da8c687b87dac82af21c445b1164559e7)), closes [#1410](https://github.com/organizzolini/codebase/issues/1410) [#1356](https://github.com/organizzolini/codebase/issues/1356) [#1417](https://github.com/organizzolini/codebase/issues/1417) [#1359](https://github.com/organizzolini/codebase/issues/1359) [#1360](https://github.com/organizzolini/codebase/issues/1360) [#1361](https://github.com/organizzolini/codebase/issues/1361) [#1362](https://github.com/organizzolini/codebase/issues/1362) [#1341](https://github.com/organizzolini/codebase/issues/1341) [#1410](https://github.com/organizzolini/codebase/issues/1410) [#1408](https://github.com/organizzolini/codebase/issues/1408) [#1417](https://github.com/organizzolini/codebase/issues/1417) [#1356](https://github.com/organizzolini/codebase/issues/1356)
* **caelundas:** 🐛 pair progressive spans by occurrence ([#1410](https://github.com/organizzolini/codebase/issues/1410)) ([d66c080](https://github.com/organizzolini/codebase/commit/d66c0804893901ca0ba1e0df69fc47ebfa036ca7)), closes [#1346](https://github.com/organizzolini/codebase/issues/1346) [#1347](https://github.com/organizzolini/codebase/issues/1347) [#1348](https://github.com/organizzolini/codebase/issues/1348) [#1341](https://github.com/organizzolini/codebase/issues/1341) [#1408](https://github.com/organizzolini/codebase/issues/1408)

## [2.35.0](https://github.com/organizzolini/codebase/compare/v2.34.2...v2.35.0) (2026-10-08)

### ✨ Features

* **caelundas,configuration:** ✨ scaffold the caelundas-web tanstack application ([#1397](https://github.com/organizzolini/codebase/issues/1397)) ([4759fff](https://github.com/organizzolini/codebase/commit/4759fff2089db64cdf4f26a1acdffda1b3dcf7d0)), closes [#1396](https://github.com/organizzolini/codebase/issues/1396) [#1395](https://github.com/organizzolini/codebase/issues/1395) [#1394](https://github.com/organizzolini/codebase/issues/1394)
* **meanderaw,configuration:** ✨ scaffold meanderaw-web from the tanstack-application template ([#1396](https://github.com/organizzolini/codebase/issues/1396)) ([f723c45](https://github.com/organizzolini/codebase/commit/f723c45bbe281d766a2c6a2bf71d4b79f4e9164b)), closes [Organizzolini/codebase#1301](https://github.com/Organizzolini/codebase/issues/1301) [Organizzolini/codebase#1309](https://github.com/Organizzolini/codebase/issues/1309)

### 🐛 Bug Fixes

* **configuration:** 🐛 measure every application three folders deep with the right path ([#1440](https://github.com/organizzolini/codebase/issues/1440)) ([a805b41](https://github.com/organizzolini/codebase/commit/a805b41c255628a5c404188f757a8316be160653))
* **deployments:** 🐛 wait for new npm tarballs and never link an empty digest ([#1398](https://github.com/organizzolini/codebase/issues/1398)) ([745a902](https://github.com/organizzolini/codebase/commit/745a9029bd9c0db2eefa57bd84b007b28aacb71d)), closes [#1327](https://github.com/organizzolini/codebase/issues/1327) [#1327](https://github.com/organizzolini/codebase/issues/1327)
* **scripts:** 🐛 bootstrap .env from every .env.default outside the conformetry templates ([#1443](https://github.com/organizzolini/codebase/issues/1443)) ([f42bfdc](https://github.com/organizzolini/codebase/commit/f42bfdc5a3398994088a3d1dcb33815943aa6b8e))

### ⚡ Performance Improvements

* **lexico,lexico-entities:** ⚡️ page reader relations as batched relay connections ([#1435](https://github.com/organizzolini/codebase/issues/1435)) ([b110cd5](https://github.com/organizzolini/codebase/commit/b110cd5a1363cdea1e9ea1dd8ec4e7ec12d2f669)), closes [1181/#1182](https://github.com/1181/codebase/issues/1182) [#1321](https://github.com/organizzolini/codebase/issues/1321) [#1336](https://github.com/organizzolini/codebase/issues/1336) [#1170](https://github.com/organizzolini/codebase/issues/1170) [#1321](https://github.com/organizzolini/codebase/issues/1321) [#1322](https://github.com/organizzolini/codebase/issues/1322) [#1323](https://github.com/organizzolini/codebase/issues/1323) [#1331](https://github.com/organizzolini/codebase/issues/1331)

### ♻️ Code Refactoring

* **lexico-entities,lexico:** ♻️ move lexico's graphql types into lexico-api, checked against its entities ([#1399](https://github.com/organizzolini/codebase/issues/1399)) ([6657d0d](https://github.com/organizzolini/codebase/commit/6657d0d678f8183ee76452d899831b3ef042634b)), closes [#1339](https://github.com/organizzolini/codebase/issues/1339) [#1263](https://github.com/organizzolini/codebase/issues/1263) [#1311](https://github.com/organizzolini/codebase/issues/1311)

## [2.34.2](https://github.com/organizzolini/codebase/compare/v2.34.1...v2.34.2) (2026-10-08)

### ♻️ Code Refactoring

* **lexico-cli:** ♻️ rename lexico-ingestion to lexico-cli under the applications/lexico group ([#1334](https://github.com/organizzolini/codebase/issues/1334)) ([f4b8261](https://github.com/organizzolini/codebase/commit/f4b82618cda1fae61a3c768dd6c84c5845660572)), closes [#1313](https://github.com/organizzolini/codebase/issues/1313) [#1333](https://github.com/organizzolini/codebase/issues/1333) [#1329](https://github.com/organizzolini/codebase/issues/1329) [#1313](https://github.com/organizzolini/codebase/issues/1313)
* **lexico:** ♻️ move lexico-api under the applications/lexico group ([#1333](https://github.com/organizzolini/codebase/issues/1333)) ([9b140ae](https://github.com/organizzolini/codebase/commit/9b140aee1f76b757c4c0ae7b66f1c2a4df9a6977)), closes [#1329](https://github.com/organizzolini/codebase/issues/1329) [#1329](https://github.com/organizzolini/codebase/issues/1329) [#1334](https://github.com/organizzolini/codebase/issues/1334)
* **lexico:** ♻️ rename lexico to lexico-web under an applications/lexico group ([#1329](https://github.com/organizzolini/codebase/issues/1329)) ([4fb87a4](https://github.com/organizzolini/codebase/commit/4fb87a4aec90f6b3bdc4ba6bd79453a612e6355c)), closes [#1302](https://github.com/organizzolini/codebase/issues/1302) [#1304](https://github.com/organizzolini/codebase/issues/1304) [organizzolini/codebase#1301](https://github.com/organizzolini/codebase/issues/1301) [#1302](https://github.com/organizzolini/codebase/issues/1302) [#1304](https://github.com/organizzolini/codebase/issues/1304)

## [2.34.1](https://github.com/organizzolini/codebase/compare/v2.34.0...v2.34.1) (2026-10-08)

### ⚡ Performance Improvements

* **lexico:** ⚡️ paginate literature connections in sql instead of in memory ([#1322](https://github.com/organizzolini/codebase/issues/1322)) ([d9e3d6b](https://github.com/organizzolini/codebase/commit/d9e3d6bf79c2cfa585ef8981b5848b7e24974c27)), closes [#1320](https://github.com/organizzolini/codebase/issues/1320) [#1180](https://github.com/organizzolini/codebase/issues/1180) [#1179](https://github.com/organizzolini/codebase/issues/1179) [#1170](https://github.com/organizzolini/codebase/issues/1170) [#1311](https://github.com/organizzolini/codebase/issues/1311) [#1320](https://github.com/organizzolini/codebase/issues/1320)

### ♻️ Code Refactoring

* **caelundas:** ♻️ use the CalendarEvent entity as caelundas' only event type ([#1393](https://github.com/organizzolini/codebase/issues/1393)) ([17e5a2e](https://github.com/organizzolini/codebase/commit/17e5a2ea8c06fd696083b4992c05edafa50ba800)), closes [#1340](https://github.com/organizzolini/codebase/issues/1340) [#1263](https://github.com/organizzolini/codebase/issues/1263) [#1310](https://github.com/organizzolini/codebase/issues/1310) [#1278](https://github.com/organizzolini/codebase/issues/1278)

## [2.34.0](https://github.com/organizzolini/codebase/compare/v2.33.7...v2.34.0) (2026-10-08)

### ✨ Features

* **caelundas:** ✨ store detected events in postgres and render calendars from them ([#1310](https://github.com/organizzolini/codebase/issues/1310)) ([a766d71](https://github.com/organizzolini/codebase/commit/a766d711fbc7474737b5820d3ceee6ed2ecd4ec6)), closes [#1278](https://github.com/organizzolini/codebase/issues/1278) [#1279](https://github.com/organizzolini/codebase/issues/1279) [#1280](https://github.com/organizzolini/codebase/issues/1280) [#1281](https://github.com/organizzolini/codebase/issues/1281) [#1305](https://github.com/organizzolini/codebase/issues/1305)
* **conformetry,lexico:** ✨ add frontend conformetry templates and infer validation inputs ([#1301](https://github.com/organizzolini/codebase/issues/1301)) ([d26a7bc](https://github.com/organizzolini/codebase/commit/d26a7bc4424cfa17a36570ca1a3ae147fa58a089))
* **database,infrastructure:** ✨ add a shared postgres package and a database per project ([#1305](https://github.com/organizzolini/codebase/issues/1305)) ([75d9a21](https://github.com/organizzolini/codebase/commit/75d9a218e9a4bcbcc94b383bf8431dfe3275ac84)), closes [#1273](https://github.com/organizzolini/codebase/issues/1273) [#1278](https://github.com/organizzolini/codebase/issues/1278) [#1283](https://github.com/organizzolini/codebase/issues/1283) [#1273](https://github.com/organizzolini/codebase/issues/1273) [#1264](https://github.com/organizzolini/codebase/issues/1264) [#1263](https://github.com/organizzolini/codebase/issues/1263) [#1260](https://github.com/organizzolini/codebase/issues/1260) [#1309](https://github.com/organizzolini/codebase/issues/1309) [#1310](https://github.com/organizzolini/codebase/issues/1310) [#1311](https://github.com/organizzolini/codebase/issues/1311)
* **meanderaw:** ✨ replace families with pattern characteristics ([#1335](https://github.com/organizzolini/codebase/issues/1335)) ([2f44269](https://github.com/organizzolini/codebase/commit/2f44269f392919982352dea38b5c335759a5a6fa))

### 🐛 Bug Fixes

* **caelundas:** 🐛 write the calendar reliably and stop cross-planet retrograde pairing ([#1337](https://github.com/organizzolini/codebase/issues/1337)) ([fa7cf03](https://github.com/organizzolini/codebase/commit/fa7cf03ce6d798a4118c3453346f5a486e381f5c))
* **lexico:** 🐛 apply searchTexts' author filter to title matches and cover literature search ([#1320](https://github.com/organizzolini/codebase/issues/1320)) ([38b0700](https://github.com/organizzolini/codebase/commit/38b0700efcaec0056128b7a1cf37f66265e2bf08)), closes [#1186](https://github.com/organizzolini/codebase/issues/1186) [#1183](https://github.com/organizzolini/codebase/issues/1183) [#1170](https://github.com/organizzolini/codebase/issues/1170) [#1311](https://github.com/organizzolini/codebase/issues/1311)
* **lexico:** 🐛 batch token word lookups with a request-scoped dataloader ([#1323](https://github.com/organizzolini/codebase/issues/1323)) ([6384530](https://github.com/organizzolini/codebase/commit/6384530ad86e8baf491c10832a5c6939e949bde5)), closes [#1181](https://github.com/organizzolini/codebase/issues/1181) [#1179](https://github.com/organizzolini/codebase/issues/1179) [#1170](https://github.com/organizzolini/codebase/issues/1170) [#1311](https://github.com/organizzolini/codebase/issues/1311)
* **lexico:** 🐛 resolve nested parent texts and test author and text queries ([#1321](https://github.com/organizzolini/codebase/issues/1321)) ([a3f8003](https://github.com/organizzolini/codebase/commit/a3f8003969a90d06f4818a6f84d51bd30156ce72)), closes [#1178](https://github.com/organizzolini/codebase/issues/1178) [#1175](https://github.com/organizzolini/codebase/issues/1175) [#1170](https://github.com/organizzolini/codebase/issues/1170) [#1311](https://github.com/organizzolini/codebase/issues/1311)
* **lexico:** 🐛 return batched words in request order and test word lookups end to end ([#1319](https://github.com/organizzolini/codebase/issues/1319)) ([f1b03e6](https://github.com/organizzolini/codebase/commit/f1b03e6beef8d2e9446183e8e0e9d5937fef693d)), closes [#1174](https://github.com/organizzolini/codebase/issues/1174) [#1171](https://github.com/organizzolini/codebase/issues/1171) [#1170](https://github.com/organizzolini/codebase/issues/1170) [#1311](https://github.com/organizzolini/codebase/issues/1311)

### 📝 Documentation

* **documentation:** 📝 record that packages version by everything a commit affects ([#1392](https://github.com/organizzolini/codebase/issues/1392)) ([6167e9e](https://github.com/organizzolini/codebase/commit/6167e9e57e3eed7bfccdcca57890fb37efdd311e)), closes [#1312](https://github.com/organizzolini/codebase/issues/1312)

### ♻️ Code Refactoring

* **lexico-entities,lexico-ingestion,lexico:** ♻️ move lexico onto the shared postgres convention ([#1311](https://github.com/organizzolini/codebase/issues/1311)) ([e7366c8](https://github.com/organizzolini/codebase/commit/e7366c8438b5610be1ad52d3c1a9fe4656e4bc6a)), closes [#1283](https://github.com/organizzolini/codebase/issues/1283) [#1263](https://github.com/organizzolini/codebase/issues/1263) [#1305](https://github.com/organizzolini/codebase/issues/1305) [#1263](https://github.com/organizzolini/codebase/issues/1263)
* **meanderaw:** ♻️ move meanderaw onto the shared postgres convention ([#1309](https://github.com/organizzolini/codebase/issues/1309)) ([af56be3](https://github.com/organizzolini/codebase/commit/af56be35d6f7e128a29891f08d483fefe2b1e157)), closes [#1305](https://github.com/organizzolini/codebase/issues/1305) [#1273](https://github.com/organizzolini/codebase/issues/1273) [#1274](https://github.com/organizzolini/codebase/issues/1274) [#1275](https://github.com/organizzolini/codebase/issues/1275) [#1276](https://github.com/organizzolini/codebase/issues/1276) [#1277](https://github.com/organizzolini/codebase/issues/1277) [#1263](https://github.com/organizzolini/codebase/issues/1263) [#1305](https://github.com/organizzolini/codebase/issues/1305) [#1264](https://github.com/organizzolini/codebase/issues/1264)

## [2.33.7](https://github.com/organizzolini/codebase/compare/v2.33.6...v2.33.7) (2026-10-07)

### 📝 Documentation

* **documentation:** 📝 run deprecate-code in the root validation commands ([#1332](https://github.com/organizzolini/codebase/issues/1332)) ([e48a176](https://github.com/organizzolini/codebase/commit/e48a17695644b5f4c396aaa2d2cecd0a36761760))

## [2.33.6](https://github.com/organizzolini/codebase/compare/v2.33.5...v2.33.6) (2026-10-06)

## [2.33.5](https://github.com/organizzolini/codebase/compare/v2.33.4...v2.33.5) (2026-10-05)

### ♻️ Code Refactoring

* **affirmancy:** ♻️ rename affirmations to affirmancy and untrack its generated output ([#1314](https://github.com/organizzolini/codebase/issues/1314)) ([02e3ba0](https://github.com/organizzolini/codebase/commit/02e3ba0deccc11366d7171922a886b40720fc972)), closes [#1302](https://github.com/organizzolini/codebase/issues/1302)
* **components-web:** ♻️ rename lexico-components to components-web ([#1313](https://github.com/organizzolini/codebase/issues/1313)) ([9d1b62a](https://github.com/organizzolini/codebase/commit/9d1b62a4784adca2e5bb4418876775079f216cef)), closes [#1302](https://github.com/organizzolini/codebase/issues/1302)

## [2.33.4](https://github.com/organizzolini/codebase/compare/v2.33.3...v2.33.4) (2026-10-05)

### ♻️ Code Refactoring

* **ic-suite:** ♻️ rename @codebase/logger to @codebase/observability ([#1208](https://github.com/organizzolini/codebase/issues/1208)) ([03b3564](https://github.com/organizzolini/codebase/commit/03b3564fc46decee05eaeb5163b476fc1589bf05))

## [2.33.3](https://github.com/organizzolini/codebase/compare/v2.33.2...v2.33.3) (2026-10-05)

### 📦 Build System

* **configuration,documentation:** 📦️ move the verdaccio config into the configuration folder ([#1307](https://github.com/organizzolini/codebase/issues/1307)) ([5684bd1](https://github.com/organizzolini/codebase/commit/5684bd13f6189fbf0e97545b7502d6aff2af0ac7))

## [2.33.2](https://github.com/organizzolini/codebase/compare/v2.33.1...v2.33.2) (2026-10-05)

### ♻️ Code Refactoring

* **meanderaw:** ♻️ rename meanderaw to meanderaw-cli under an applications/meanderaw group ([#1302](https://github.com/organizzolini/codebase/issues/1302)) ([52d2bc3](https://github.com/organizzolini/codebase/commit/52d2bc3ae7dd82b65c85696bb53b1d4fe8c3233c)), closes [#1259](https://github.com/organizzolini/codebase/issues/1259)

## [2.33.1](https://github.com/organizzolini/codebase/compare/v2.33.0...v2.33.1) (2026-10-05)

### 📝 Documentation

* **ic-suite:** 📝 add an npm badge for every published ic-suite package ([#1298](https://github.com/organizzolini/codebase/issues/1298)) ([46bd103](https://github.com/organizzolini/codebase/commit/46bd103566aa3366d45646bfd33b96a5301b7340))

### ♻️ Code Refactoring

* **caelundas,configuration:** 🚚 nest caelundas under a domain folder as caelundas-cli ([#1304](https://github.com/organizzolini/codebase/issues/1304)) ([a465a2d](https://github.com/organizzolini/codebase/commit/a465a2d589d8fac7b0e9e87726f8dd6f4b168b51))

## [2.33.0](https://github.com/organizzolini/codebase/compare/v2.32.0...v2.33.0) (2026-10-05)

### ✨ Features

* **lexico,configuration:** ✨ close lexico-api search gaps and add cors and search logging ([#1297](https://github.com/organizzolini/codebase/issues/1297)) ([af139b9](https://github.com/organizzolini/codebase/commit/af139b9698337f4217f4958a4d449eaa9aa79386)), closes [Organizzolini/codebase#1259](https://github.com/Organizzolini/codebase/issues/1259) [Organizzolini/codebase#1170](https://github.com/Organizzolini/codebase/issues/1170)
* **meanderaw,configuration:** ✨ draw at a 24-edge budget across worker threads and stop committing the html pages ([#1259](https://github.com/organizzolini/codebase/issues/1259)) ([9d9196a](https://github.com/organizzolini/codebase/commit/9d9196a4155772a83d97da21e782781212d73e71)), closes [#1260](https://github.com/organizzolini/codebase/issues/1260) [#1168](https://github.com/organizzolini/codebase/issues/1168) [#1260](https://github.com/organizzolini/codebase/issues/1260) [#1248](https://github.com/organizzolini/codebase/issues/1248)

### 🐛 Bug Fixes

* **codependix:** 🐛 make the published codependix packages releasable at 0.0.1 ([#1290](https://github.com/organizzolini/codebase/issues/1290)) ([b8d920b](https://github.com/organizzolini/codebase/commit/b8d920b95a6b6bed25e14a0df1d2eb352d0cf25a)), closes [#1168](https://github.com/organizzolini/codebase/issues/1168) [#1168](https://github.com/organizzolini/codebase/issues/1168)
* **configuration:** 🐛 anchor the claude worktree ignores to the workspace root ([#1299](https://github.com/organizzolini/codebase/issues/1299)) ([23220b5](https://github.com/organizzolini/codebase/commit/23220b53a657d1234eee5058736415217e6f7447))

### 📦 Build System

* **configuration:** 📦️ add file extensions to shared vite config imports ([#1296](https://github.com/organizzolini/codebase/issues/1296)) ([8b4c1e1](https://github.com/organizzolini/codebase/commit/8b4c1e12b3d80f3325868d0f57fac8d3fc832ff3))
* **synchronization,ic-suite:** 📦️ spell the repository owner in lowercase so npm accepts provenance ([#1300](https://github.com/organizzolini/codebase/issues/1300)) ([92b73f0](https://github.com/organizzolini/codebase/commit/92b73f0c7ebe6d4499baf66cd8f9b6e48e16d9b8))

## [2.32.0](https://github.com/Organizzolini/codebase/compare/v2.31.0...v2.32.0) (2026-10-04)

### ✨ Features

* **meanderaw,infrastructure:** ✨ store meanders in postgres instead of a committed sqlite file ([#1260](https://github.com/Organizzolini/codebase/issues/1260)) ([17c24a6](https://github.com/Organizzolini/codebase/commit/17c24a60b6186ac62ba8fe44d4829f1101f0b798))

### 📝 Documentation

* **documentation:** 📝 add badges for the tools the readme was missing ([#1262](https://github.com/Organizzolini/codebase/issues/1262)) ([dd69376](https://github.com/Organizzolini/codebase/commit/dd69376efad186d05096f1376aece9bf518350f8))

## [2.31.0](https://github.com/Organizzolini/codebase/compare/v2.30.2...v2.31.0) (2026-10-04)

### ✨ Features

* **conformetry,lexico:** ✨ add resolver file template, require all tags, and conform lexico-api modules ([#1234](https://github.com/Organizzolini/codebase/issues/1234)) ([513b440](https://github.com/Organizzolini/codebase/commit/513b44089955acdeadda607757bc947b85bca964))

### 🐛 Bug Fixes

* **conformetry,lexico:** 🐛 emit the lexico-api graphql schema beside its root module ([#1241](https://github.com/Organizzolini/codebase/issues/1241)) ([3e743d3](https://github.com/Organizzolini/codebase/commit/3e743d31f6f83d43e0a3dba36496b994c0a03a9d))
* **conformetry:** 🐛 publish a built conformetry-nx-bootstrap-generators command ([#1245](https://github.com/Organizzolini/codebase/issues/1245)) ([7677716](https://github.com/Organizzolini/codebase/commit/767771666463147d90e05bba085c23479e958d36))
* **dependencies,validation:** 🐛 accept nestjs 11 in the published ic-suite packages ([#1244](https://github.com/Organizzolini/codebase/issues/1244)) ([abc135a](https://github.com/Organizzolini/codebase/commit/abc135a6f661dc65a6f0ce6319d8ecc42c0ab283))
* **lexico:** 🐛 resolve the graphql schema path from the module, not the working directory ([#1246](https://github.com/Organizzolini/codebase/issues/1246)) ([a9e57a1](https://github.com/Organizzolini/codebase/commit/a9e57a1c9fc963771cb92dd4a8bbb575f0efa6c8))

### ⚡ Performance Improvements

* **configuration,documentation:** ⚡️ cache the root checks and hash only the packages each task runs ([#1250](https://github.com/Organizzolini/codebase/issues/1250)) ([e4b2d6b](https://github.com/Organizzolini/codebase/commit/e4b2d6b9987382a20bd53bf4c95f2124311fac6b)), closes [#381](https://github.com/Organizzolini/codebase/issues/381) [#381](https://github.com/Organizzolini/codebase/issues/381)

### ♻️ Code Refactoring

* **meanderaw:** ♻️ fold characteristics into one json map and drop the drift check ([#1248](https://github.com/Organizzolini/codebase/issues/1248)) ([a10f00a](https://github.com/Organizzolini/codebase/commit/a10f00a4d201e1914c7629cbb2f4d139ba184fcf))
* **synchronization,documentation:** ♻️ replace the readme title version with a release badge ([#1249](https://github.com/Organizzolini/codebase/issues/1249)) ([8883439](https://github.com/Organizzolini/codebase/commit/8883439f547c3c67d49abfc5f39de40dbf47ad48))

### 📦 Build System

* **configuration,deployments,scripts:** 📦️ gate the workspace shell scripts with shellcheck ([#1235](https://github.com/Organizzolini/codebase/issues/1235)) ([c43278b](https://github.com/Organizzolini/codebase/commit/c43278b540213cf756f39922e64c73c264dedc13))

## [2.30.2](https://github.com/Organizzolini/codebase/compare/v2.30.1...v2.30.2) (2026-09-30)

### 🐛 Bug Fixes

* **lexico-ingestion:** 🐛 honor command options and fail loudly ([#1232](https://github.com/Organizzolini/codebase/issues/1232)) ([db88c9e](https://github.com/Organizzolini/codebase/commit/db88c9e310a925bfcd646041984ef0f6e394140b))
* **lexico:** 🐛 boot lexico-api as a real server and resolve line tokens ([#1228](https://github.com/Organizzolini/codebase/issues/1228)) ([828fb63](https://github.com/Organizzolini/codebase/commit/828fb63a1351536b58dfde2a07dcf4a6c630c369)), closes [#1128](https://github.com/Organizzolini/codebase/issues/1128) [#1201](https://github.com/Organizzolini/codebase/issues/1201) [#1170](https://github.com/Organizzolini/codebase/issues/1170) [#1171](https://github.com/Organizzolini/codebase/issues/1171) [#1175](https://github.com/Organizzolini/codebase/issues/1175)
* **meanderaw:** 🐛 make start read-only by default with an explicit --write and exit non-zero on failure ([#1203](https://github.com/Organizzolini/codebase/issues/1203)) ([3b6591b](https://github.com/Organizzolini/codebase/commit/3b6591b7fd7613ecfbbbeca8c99af2d60aa5d7b4)), closes [#1187](https://github.com/Organizzolini/codebase/issues/1187) [#1188](https://github.com/Organizzolini/codebase/issues/1188) [#1204](https://github.com/Organizzolini/codebase/issues/1204) [#1205](https://github.com/Organizzolini/codebase/issues/1205) [#1206](https://github.com/Organizzolini/codebase/issues/1206)
* **validation:** 🐛 find package tarballs by their real version instead of 0.0.1 ([#1233](https://github.com/Organizzolini/codebase/issues/1233)) ([892371b](https://github.com/Organizzolini/codebase/commit/892371bf743c6379f5bdb67162155f076a96ae17)), closes [#1168](https://github.com/Organizzolini/codebase/issues/1168)

## [2.30.1](https://github.com/Organizzolini/codebase/compare/v2.30.0...v2.30.1) (2026-09-29)

### 🐛 Bug Fixes

* **lexico-entities:** 🐛 warm the data source import outside the test timeout ([#1225](https://github.com/Organizzolini/codebase/issues/1225)) ([af39e4c](https://github.com/Organizzolini/codebase/commit/af39e4c203b9afeaa962090f23fb1b96f282dd97))

## [2.30.0](https://github.com/Organizzolini/codebase/compare/v2.29.0...v2.30.0) (2026-09-28)

### ✨ Features

* **meanderaw:** ✨ add arabic letter skeletons in all positional forms ([#1206](https://github.com/Organizzolini/codebase/issues/1206)) ([007edad](https://github.com/Organizzolini/codebase/commit/007edad2e4767b31cd2122e7b13edc803c85b0df)), closes [#1205](https://github.com/Organizzolini/codebase/issues/1205) [#1205](https://github.com/Organizzolini/codebase/issues/1205) [#1204](https://github.com/Organizzolini/codebase/issues/1204) [#1198](https://github.com/Organizzolini/codebase/issues/1198) [#1197](https://github.com/Organizzolini/codebase/issues/1197) [#1204](https://github.com/Organizzolini/codebase/issues/1204) [#1198](https://github.com/Organizzolini/codebase/issues/1198) [#1192](https://github.com/Organizzolini/codebase/issues/1192) [#1197](https://github.com/Organizzolini/codebase/issues/1197) [#1198](https://github.com/Organizzolini/codebase/issues/1198) [#1189](https://github.com/Organizzolini/codebase/issues/1189) [#1205](https://github.com/Organizzolini/codebase/issues/1205)

## [2.29.0](https://github.com/Organizzolini/codebase/compare/v2.28.0...v2.29.0) (2026-09-28)

### ✨ Features

* **lexico,callidescope:** ✨ add word and literature lookups ([#1201](https://github.com/Organizzolini/codebase/issues/1201)) ([6b08eca](https://github.com/Organizzolini/codebase/commit/6b08eca1720d2c3d283edea2f77b6af29ebf08d9)), closes [#1170](https://github.com/Organizzolini/codebase/issues/1170) [#1171](https://github.com/Organizzolini/codebase/issues/1171) [#1175](https://github.com/Organizzolini/codebase/issues/1175) [#1179](https://github.com/Organizzolini/codebase/issues/1179) [#1183](https://github.com/Organizzolini/codebase/issues/1183) [#1172](https://github.com/Organizzolini/codebase/issues/1172) [#1173](https://github.com/Organizzolini/codebase/issues/1173) [#1174](https://github.com/Organizzolini/codebase/issues/1174) [#1176](https://github.com/Organizzolini/codebase/issues/1176) [#1177](https://github.com/Organizzolini/codebase/issues/1177) [#1178](https://github.com/Organizzolini/codebase/issues/1178) [#1180](https://github.com/Organizzolini/codebase/issues/1180) [#1181](https://github.com/Organizzolini/codebase/issues/1181) [#1182](https://github.com/Organizzolini/codebase/issues/1182) [#1184](https://github.com/Organizzolini/codebase/issues/1184) [#1185](https://github.com/Organizzolini/codebase/issues/1185) [#1186](https://github.com/Organizzolini/codebase/issues/1186)
* **meanderaw:** ✨ add directional edge counts, submatrix window metadata, and utilities services ([#1188](https://github.com/Organizzolini/codebase/issues/1188)) ([486a3f3](https://github.com/Organizzolini/codebase/commit/486a3f3d6a3753e0dc139750c87c0ee2fe22819f)), closes [#1164](https://github.com/Organizzolini/codebase/issues/1164) [#1165](https://github.com/Organizzolini/codebase/issues/1165) [#1166](https://github.com/Organizzolini/codebase/issues/1166) [#1204](https://github.com/Organizzolini/codebase/issues/1204) [#1204](https://github.com/Organizzolini/codebase/issues/1204) [#1204](https://github.com/Organizzolini/codebase/issues/1204) [#1204](https://github.com/Organizzolini/codebase/issues/1204) [#1204](https://github.com/Organizzolini/codebase/issues/1204) [#1166](https://github.com/Organizzolini/codebase/issues/1166) [#1165](https://github.com/Organizzolini/codebase/issues/1165) [#1163](https://github.com/Organizzolini/codebase/issues/1163) [#1164](https://github.com/Organizzolini/codebase/issues/1164) [#1165](https://github.com/Organizzolini/codebase/issues/1165) [#1166](https://github.com/Organizzolini/codebase/issues/1166) [#1140](https://github.com/Organizzolini/codebase/issues/1140) [#1187](https://github.com/Organizzolini/codebase/issues/1187) [#1167](https://github.com/Organizzolini/codebase/issues/1167) [#1204](https://github.com/Organizzolini/codebase/issues/1204)
* **meanderaw:** ✨ add zig-zag greek letters lambda, sigma, delta, kappa, and omega ([#1205](https://github.com/Organizzolini/codebase/issues/1205)) ([900b8a4](https://github.com/Organizzolini/codebase/commit/900b8a46e7637f0337345944354a114c40bba98e)), closes [#1203](https://github.com/Organizzolini/codebase/issues/1203) [#1191](https://github.com/Organizzolini/codebase/issues/1191) [#1196](https://github.com/Organizzolini/codebase/issues/1196) [#1189](https://github.com/Organizzolini/codebase/issues/1189) [#1204](https://github.com/Organizzolini/codebase/issues/1204)
* **meanderaw:** ✨ enumerate every letter in eight orientations and split out glyph storage ([#1204](https://github.com/Organizzolini/codebase/issues/1204)) ([cf6c8e8](https://github.com/Organizzolini/codebase/commit/cf6c8e8b53db45668e083e8a633a2985acb3e03b)), closes [#1167](https://github.com/Organizzolini/codebase/issues/1167) [#1188](https://github.com/Organizzolini/codebase/issues/1188) [#1188](https://github.com/Organizzolini/codebase/issues/1188) [#1188](https://github.com/Organizzolini/codebase/issues/1188) [#1167](https://github.com/Organizzolini/codebase/issues/1167) [#1195](https://github.com/Organizzolini/codebase/issues/1195) [#1188](https://github.com/Organizzolini/codebase/issues/1188) [#1167](https://github.com/Organizzolini/codebase/issues/1167) [#1188](https://github.com/Organizzolini/codebase/issues/1188) [#1193](https://github.com/Organizzolini/codebase/issues/1193) [#1195](https://github.com/Organizzolini/codebase/issues/1195) [#1194](https://github.com/Organizzolini/codebase/issues/1194) [#1195](https://github.com/Organizzolini/codebase/issues/1195) [#1193](https://github.com/Organizzolini/codebase/issues/1193) [#1195](https://github.com/Organizzolini/codebase/issues/1195) [#1194](https://github.com/Organizzolini/codebase/issues/1194) [#1195](https://github.com/Organizzolini/codebase/issues/1195) [#1193](https://github.com/Organizzolini/codebase/issues/1193) [#1195](https://github.com/Organizzolini/codebase/issues/1195) [#1194](https://github.com/Organizzolini/codebase/issues/1194) [#1194](https://github.com/Organizzolini/codebase/issues/1194) [#1195](https://github.com/Organizzolini/codebase/issues/1195) [#1167](https://github.com/Organizzolini/codebase/issues/1167) [#1190](https://github.com/Organizzolini/codebase/issues/1190) [#1193](https://github.com/Organizzolini/codebase/issues/1193) [#1194](https://github.com/Organizzolini/codebase/issues/1194) [#1195](https://github.com/Organizzolini/codebase/issues/1195) [#1189](https://github.com/Organizzolini/codebase/issues/1189) [#1188](https://github.com/Organizzolini/codebase/issues/1188)

### 🐛 Bug Fixes

* **lexico:** 🐛 type entity relations as Relation to break the Word import cycle ([#1218](https://github.com/Organizzolini/codebase/issues/1218)) ([ff96e72](https://github.com/Organizzolini/codebase/commit/ff96e72a831dc0b0bc1bf825ad45314f6c2fca13)), closes [#1201](https://github.com/Organizzolini/codebase/issues/1201) [#1201](https://github.com/Organizzolini/codebase/issues/1201) [#1217](https://github.com/Organizzolini/codebase/issues/1217) [#1201](https://github.com/Organizzolini/codebase/issues/1201)
* **meanderaw:** 🐛 move glyph words into shared linguistics dictionary ([#1222](https://github.com/Organizzolini/codebase/issues/1222)) ([004d1f5](https://github.com/Organizzolini/codebase/commit/004d1f58c6a12a98bd7e4d35e119e7f79774d647)), closes [#1218](https://github.com/Organizzolini/codebase/issues/1218)
* **validation,configuration:** 🐛 stop pre-commit checks re-linking node_modules ([#1212](https://github.com/Organizzolini/codebase/issues/1212)) ([da8fe64](https://github.com/Organizzolini/codebase/commit/da8fe6414e01dac392572d246076924b259da730)), closes [#1211](https://github.com/Organizzolini/codebase/issues/1211)

## [2.28.0](https://github.com/Organizzolini/codebase/compare/v2.27.0...v2.28.0) (2026-09-28)

### ✨ Features

* **meanderaw:** ✨ implement compound characteristics, entity schema update, and orchestrator refactor ([#1187](https://github.com/Organizzolini/codebase/issues/1187)) ([3df164e](https://github.com/Organizzolini/codebase/commit/3df164e7e8273f180492d458c75bc71a49b08c2f)), closes [#1154](https://github.com/Organizzolini/codebase/issues/1154) [#1155](https://github.com/Organizzolini/codebase/issues/1155) [#1156](https://github.com/Organizzolini/codebase/issues/1156) [#1157](https://github.com/Organizzolini/codebase/issues/1157) [#1158](https://github.com/Organizzolini/codebase/issues/1158) [#1140](https://github.com/Organizzolini/codebase/issues/1140) [#1161](https://github.com/Organizzolini/codebase/issues/1161)

## [2.27.0](https://github.com/JimmyPaolini/codebase/compare/v2.26.0...v2.27.0) (2026-09-28)

### ✨ Features

* **meanderaw:** ✨ implement topological betti numbers and path dynamic characteristic services ([#1161](https://github.com/JimmyPaolini/codebase/issues/1161)) ([ac45a21](https://github.com/JimmyPaolini/codebase/commit/ac45a21d8b01ed7e3033633f4098736ab6c944ac)), closes [#1150](https://github.com/JimmyPaolini/codebase/issues/1150) [#1151](https://github.com/JimmyPaolini/codebase/issues/1151) [#1152](https://github.com/JimmyPaolini/codebase/issues/1152) [#1153](https://github.com/JimmyPaolini/codebase/issues/1153) [#1140](https://github.com/JimmyPaolini/codebase/issues/1140) [#1160](https://github.com/JimmyPaolini/codebase/issues/1160)

## [2.26.0](https://github.com/JimmyPaolini/codebase/compare/v2.25.0...v2.26.0) (2026-09-28)

### ✨ Features

* **meanderaw:** ✨ implement submatrix forks, rectangles, and minimal letter glyph services ([#1162](https://github.com/JimmyPaolini/codebase/issues/1162)) ([edaaed7](https://github.com/JimmyPaolini/codebase/commit/edaaed701d93b200ea21a6284d90b4ea5f7bb2f3)), closes [#1140](https://github.com/JimmyPaolini/codebase/issues/1140) [#1145](https://github.com/JimmyPaolini/codebase/issues/1145) [#1146](https://github.com/JimmyPaolini/codebase/issues/1146) [#1147](https://github.com/JimmyPaolini/codebase/issues/1147) [#1148](https://github.com/JimmyPaolini/codebase/issues/1148)

## [2.25.0](https://github.com/JimmyPaolini/codebase/compare/v2.24.2...v2.25.0) (2026-09-28)

### ✨ Features

* **meanderaw:** ✨ establish characteristic evaluator contract and atomic submatrix point/corner services ([#1160](https://github.com/JimmyPaolini/codebase/issues/1160)) ([c4585bc](https://github.com/JimmyPaolini/codebase/commit/c4585bcc2d06aa4e7aed69f14c549ba67966ccee)), closes [#1141](https://github.com/JimmyPaolini/codebase/issues/1141) [#1142](https://github.com/JimmyPaolini/codebase/issues/1142) [#1143](https://github.com/JimmyPaolini/codebase/issues/1143) [#1144](https://github.com/JimmyPaolini/codebase/issues/1144) [#1140](https://github.com/JimmyPaolini/codebase/issues/1140) [#1145](https://github.com/JimmyPaolini/codebase/issues/1145) [#1150](https://github.com/JimmyPaolini/codebase/issues/1150)

## [2.24.2](https://github.com/JimmyPaolini/codebase/compare/v2.24.1...v2.24.2) (2026-09-27)

### 🐛 Bug Fixes

* **validation:** 🐛 relax commit scope overlap validation ([#1200](https://github.com/JimmyPaolini/codebase/issues/1200)) ([5367fd2](https://github.com/JimmyPaolini/codebase/commit/5367fd2eeba84428d07421f5d553079fe3e35b25))

## [2.24.1](https://github.com/JimmyPaolini/codebase/compare/v2.24.0...v2.24.1) (2026-09-27)

### 🐛 Bug Fixes

* **ic-suite,deployments:** 🐛 fix order of anchor tags and refresh codependix markdown outputs ([#1199](https://github.com/JimmyPaolini/codebase/issues/1199)) ([1621631](https://github.com/JimmyPaolini/codebase/commit/1621631fb0555347d2d95ea4acb76a50542b47d6))

## [2.24.0](https://github.com/JimmyPaolini/codebase/compare/v2.23.3...v2.24.0) (2026-09-26)

### ✨ Features

* **conformetry,lexico,lexico-ingestion,meanderaw:** ✨ scaffold lexico-api application and health probes ([#1128](https://github.com/JimmyPaolini/codebase/issues/1128)) ([d644b05](https://github.com/JimmyPaolini/codebase/commit/d644b050ca1cc2e462944f519639a004f6842be5)), closes [#1118](https://github.com/JimmyPaolini/codebase/issues/1118) [#1119](https://github.com/JimmyPaolini/codebase/issues/1119) [#1120](https://github.com/JimmyPaolini/codebase/issues/1120) [#1121](https://github.com/JimmyPaolini/codebase/issues/1121) [#1117](https://github.com/JimmyPaolini/codebase/issues/1117)
* **lexico:** ✨ implement dictionary lexeme lookups and tiered search queries ([#1122](https://github.com/JimmyPaolini/codebase/issues/1122)) ([#1129](https://github.com/JimmyPaolini/codebase/issues/1129)) ([7c88077](https://github.com/JimmyPaolini/codebase/commit/7c88077ff50d2abe2aa016158f581b1f4a2e6d09)), closes [#1123](https://github.com/JimmyPaolini/codebase/issues/1123) [#1124](https://github.com/JimmyPaolini/codebase/issues/1124) [#1125](https://github.com/JimmyPaolini/codebase/issues/1125) [#1126](https://github.com/JimmyPaolini/codebase/issues/1126) [#1123](https://github.com/JimmyPaolini/codebase/issues/1123) [#1124](https://github.com/JimmyPaolini/codebase/issues/1124) [#1125](https://github.com/JimmyPaolini/codebase/issues/1125) [#1126](https://github.com/JimmyPaolini/codebase/issues/1126) [#1117](https://github.com/JimmyPaolini/codebase/issues/1117) [#1128](https://github.com/JimmyPaolini/codebase/issues/1128)

### 🐛 Bug Fixes

* **callidescope,conformetry:** 🐛 ship the nx plugins as pure esm ([#1102](https://github.com/JimmyPaolini/codebase/issues/1102)) ([4ad5aff](https://github.com/JimmyPaolini/codebase/commit/4ad5aff1a86d1f6e18d7b2ba4448545015ea71d1)), closes [#487](https://github.com/JimmyPaolini/codebase/issues/487) [#488](https://github.com/JimmyPaolini/codebase/issues/488) [#489](https://github.com/JimmyPaolini/codebase/issues/489)

### 📝 Documentation

* **documentation:** 📝 add human-gated step-by-step stops to agent planning workflow ([#1159](https://github.com/JimmyPaolini/codebase/issues/1159)) ([eef38d2](https://github.com/JimmyPaolini/codebase/commit/eef38d2929a715cce8a976945676b5f3729719a8))

## [2.23.3](https://github.com/JimmyPaolini/codebase/compare/v2.23.2...v2.23.3) (2026-09-26)

### 📦 Build System

* **callidescope:** 📦️ migrate callidescope to the vite library build and inline the logger ([#1131](https://github.com/JimmyPaolini/codebase/issues/1131)) ([5be0da0](https://github.com/JimmyPaolini/codebase/commit/5be0da0e7d81a1b1106a95ab4130b4cc994e5d9d)), closes [#475](https://github.com/JimmyPaolini/codebase/issues/475) [#476](https://github.com/JimmyPaolini/codebase/issues/476) [#477](https://github.com/JimmyPaolini/codebase/issues/477) [#478](https://github.com/JimmyPaolini/codebase/issues/478) [#479](https://github.com/JimmyPaolini/codebase/issues/479) [#480](https://github.com/JimmyPaolini/codebase/issues/480)
* **codometer:** 📦️ migrate codometer to the vite library build and inline the logger ([#1132](https://github.com/JimmyPaolini/codebase/issues/1132)) ([424ed90](https://github.com/JimmyPaolini/codebase/commit/424ed90892c3ef03ea04f5868c39d004cdae9eac)), closes [#468](https://github.com/JimmyPaolini/codebase/issues/468) [#469](https://github.com/JimmyPaolini/codebase/issues/469) [#470](https://github.com/JimmyPaolini/codebase/issues/470) [#472](https://github.com/JimmyPaolini/codebase/issues/472) [#473](https://github.com/JimmyPaolini/codebase/issues/473) [#474](https://github.com/JimmyPaolini/codebase/issues/474)
* **conformetry:** 📦️ migrate conformetry to the vite library build and inline the logger ([#1097](https://github.com/JimmyPaolini/codebase/issues/1097)) ([7548270](https://github.com/JimmyPaolini/codebase/commit/75482707c286edc6e863fba687eae95519db519a)), closes [#462](https://github.com/JimmyPaolini/codebase/issues/462) [#463](https://github.com/JimmyPaolini/codebase/issues/463) [#464](https://github.com/JimmyPaolini/codebase/issues/464) [#465](https://github.com/JimmyPaolini/codebase/issues/465) [#466](https://github.com/JimmyPaolini/codebase/issues/466) [#467](https://github.com/JimmyPaolini/codebase/issues/467)

## [2.23.2](https://github.com/JimmyPaolini/codebase/compare/v2.23.1...v2.23.2) (2026-09-25)

### 🐛 Bug Fixes

* **deployments,configuration:** 🐛 sign commits in upgrade-dependencies and suppress dead overrides ([#1135](https://github.com/JimmyPaolini/codebase/issues/1135)) ([a30b316](https://github.com/JimmyPaolini/codebase/commit/a30b316b853726c5c2c7582784953456bd1e8bbe)), closes [#1130](https://github.com/JimmyPaolini/codebase/issues/1130)

### 📦 Build System

* **codependix:** 📦️ migrate codependix to the vite library build and inline the logger ([#1094](https://github.com/JimmyPaolini/codebase/issues/1094)) ([13fc4de](https://github.com/JimmyPaolini/codebase/commit/13fc4dece2591fda9d9f6c82d0ca5398af010983)), closes [#481](https://github.com/JimmyPaolini/codebase/issues/481) [#482](https://github.com/JimmyPaolini/codebase/issues/482) [#483](https://github.com/JimmyPaolini/codebase/issues/483) [#484](https://github.com/JimmyPaolini/codebase/issues/484) [#485](https://github.com/JimmyPaolini/codebase/issues/485) [#486](https://github.com/JimmyPaolini/codebase/issues/486) [#443](https://github.com/JimmyPaolini/codebase/issues/443)

## [2.23.1](https://github.com/JimmyPaolini/codebase/compare/v2.23.0...v2.23.1) (2026-09-25)

### 📦 Build System

* **callidescope,codependix,codometer,configuration,conformetry,ic-suite,testing,validation:** 📦️ verify publish set ([#1057](https://github.com/JimmyPaolini/codebase/issues/1057)) ([e2e155a](https://github.com/JimmyPaolini/codebase/commit/e2e155a2adec21cdfe19831448a383198d5d9d49)), closes [#451](https://github.com/JimmyPaolini/codebase/issues/451) [#452](https://github.com/JimmyPaolini/codebase/issues/452) [#453](https://github.com/JimmyPaolini/codebase/issues/453) [#454](https://github.com/JimmyPaolini/codebase/issues/454) [#455](https://github.com/JimmyPaolini/codebase/issues/455) [#456](https://github.com/JimmyPaolini/codebase/issues/456) [#457](https://github.com/JimmyPaolini/codebase/issues/457)
* **configuration,documentation:** 📦️ add the shared vite library build ([#1058](https://github.com/JimmyPaolini/codebase/issues/1058)) ([b1d2a42](https://github.com/JimmyPaolini/codebase/commit/b1d2a4256c7373868c3cc6fde86d147bbb4107a4)), closes [#458](https://github.com/JimmyPaolini/codebase/issues/458) [#459](https://github.com/JimmyPaolini/codebase/issues/459) [#460](https://github.com/JimmyPaolini/codebase/issues/460) [#461](https://github.com/JimmyPaolini/codebase/issues/461)

## [2.23.0](https://github.com/JimmyPaolini/codebase/compare/v2.22.1...v2.23.0) (2026-09-25)

### ✨ Features

* **meanderaw:** ✨ split branches into comb, arcade, fork, tree, and stipple ([#1100](https://github.com/JimmyPaolini/codebase/issues/1100)) ([392eee0](https://github.com/JimmyPaolini/codebase/commit/392eee0ecb6248ff8f016e7e4eb039625beb6778))

## [2.22.1](https://github.com/JimmyPaolini/codebase/compare/v2.22.0...v2.22.1) (2026-09-24)

### 🐛 Bug Fixes

* **conformetry,codometer,callidescope,codependix,configuration,documentation:** 🐛 make exports conditions authoritative ([#1056](https://github.com/JimmyPaolini/codebase/issues/1056)) ([062d099](https://github.com/JimmyPaolini/codebase/commit/062d09928ee1908d8f2d485010ee3ec83c821a06)), closes [#447](https://github.com/JimmyPaolini/codebase/issues/447) [#448](https://github.com/JimmyPaolini/codebase/issues/448) [#449](https://github.com/JimmyPaolini/codebase/issues/449) [#450](https://github.com/JimmyPaolini/codebase/issues/450)

## [2.22.0](https://github.com/JimmyPaolini/codebase/compare/v2.21.0...v2.22.0) (2026-09-24)

### ✨ Features

* **configuration,meanderaw:** ✨ add waterfalls family and remove invalid boxes ([#1101](https://github.com/JimmyPaolini/codebase/issues/1101)) ([fb32aa6](https://github.com/JimmyPaolini/codebase/commit/fb32aa6f5cb307bfb861310e6d4c5b860e475130))
* **meanderaw:** :sparkles: extract characteristics to refine chain, whirl, and clasps classification ([#1098](https://github.com/JimmyPaolini/codebase/issues/1098)) ([1c4d89d](https://github.com/JimmyPaolini/codebase/commit/1c4d89d4607be3bbf00e4d340076a95815116e7d))

### 📝 Documentation

* **documentation:** 📝 cross-link skills, examples, and command line documentation ([#1055](https://github.com/JimmyPaolini/codebase/issues/1055)) ([5ac136d](https://github.com/JimmyPaolini/codebase/commit/5ac136d4ecc4a8a1f3bd69ffeb74ebbbb80bdace)), closes [#494](https://github.com/JimmyPaolini/codebase/issues/494) [#495](https://github.com/JimmyPaolini/codebase/issues/495) [#496](https://github.com/JimmyPaolini/codebase/issues/496) [#493](https://github.com/JimmyPaolini/codebase/issues/493) [#494](https://github.com/JimmyPaolini/codebase/issues/494) [#495](https://github.com/JimmyPaolini/codebase/issues/495) [#496](https://github.com/JimmyPaolini/codebase/issues/496) [#443](https://github.com/JimmyPaolini/codebase/issues/443)

## [2.21.0](https://github.com/JimmyPaolini/codebase/compare/v2.20.0...v2.21.0) (2026-09-24)

### ✨ Features

* **meanderaw:** ✨ add clasps family for disconnected chain meanders ([#1054](https://github.com/JimmyPaolini/codebase/issues/1054)) ([ab955a0](https://github.com/JimmyPaolini/codebase/commit/ab955a05412b2a077ec0c43ae226765f2cc29f83)), closes [#1027](https://github.com/JimmyPaolini/codebase/issues/1027) [#1052](https://github.com/JimmyPaolini/codebase/issues/1052)

## [2.20.0](https://github.com/JimmyPaolini/codebase/compare/v2.19.0...v2.20.0) (2026-09-24)

### ✨ Features

* **meanderaw:** ✨ Implement single-family classification and update meander entity ([#1052](https://github.com/JimmyPaolini/codebase/issues/1052)) ([8adc28b](https://github.com/JimmyPaolini/codebase/commit/8adc28b266884ced440621467ac7004f76d07fc1)), closes [#1031](https://github.com/JimmyPaolini/codebase/issues/1031) [#1027](https://github.com/JimmyPaolini/codebase/issues/1027)

### ♻️ Code Refactoring

* **meanderaw:** ♻️ Refactor characteristics to use 2D Matrix and remove negative space ([#1051](https://github.com/JimmyPaolini/codebase/issues/1051)) ([1b0c4f9](https://github.com/JimmyPaolini/codebase/commit/1b0c4f9189dd30ecd85dff622836a97c8f3c0b28)), closes [#1030](https://github.com/JimmyPaolini/codebase/issues/1030) [#1027](https://github.com/JimmyPaolini/codebase/issues/1027)

## [2.19.0](https://github.com/JimmyPaolini/codebase/compare/v2.18.1...v2.19.0) (2026-09-24)

### ✨ Features

* **meanderaw:** ✨ Implement MatrixModule and 2D matrix transformation ([#1048](https://github.com/JimmyPaolini/codebase/issues/1048)) ([46c7c3b](https://github.com/JimmyPaolini/codebase/commit/46c7c3b98f63cbb04af92e16b40a2ec2d14213e0)), closes [#1028](https://github.com/JimmyPaolini/codebase/issues/1028) [#1027](https://github.com/JimmyPaolini/codebase/issues/1027)

### 📝 Documentation

* **documentation,deployments:** 📝 reorder readme projects and remove probe from compliance workflow ([#1053](https://github.com/JimmyPaolini/codebase/issues/1053)) ([d0c86ea](https://github.com/JimmyPaolini/codebase/commit/d0c86eadd80cb427f5e548315a539d453ed6ec0c))

### ♻️ Code Refactoring

* **meanderaw:** ♻️ Redefine rows to lattice height and eliminate levels ([#1049](https://github.com/JimmyPaolini/codebase/issues/1049)) ([cd83426](https://github.com/JimmyPaolini/codebase/commit/cd8342670cb04aa8b51026875feee64c24240624)), closes [#1029](https://github.com/JimmyPaolini/codebase/issues/1029) [#1027](https://github.com/JimmyPaolini/codebase/issues/1027)

## [2.18.1](https://github.com/JimmyPaolini/codebase/compare/v2.18.0...v2.18.1) (2026-09-23)

### ♻️ Code Refactoring

* **configuration,deployments:** :recycle: relocate root configuration files and rename compliance jobs ([#1032](https://github.com/JimmyPaolini/codebase/issues/1032)) ([951d98a](https://github.com/JimmyPaolini/codebase/commit/951d98a8ff30c056de7c57954bb05d3e75326327))

## [2.18.0](https://github.com/JimmyPaolini/codebase/compare/v2.17.0...v2.18.0) (2026-09-21)

### ✨ Features

* **validation:** ✨ validate pull request body sections are non-empty ([#1050](https://github.com/JimmyPaolini/codebase/issues/1050)) ([7ea5295](https://github.com/JimmyPaolini/codebase/commit/7ea52958ca50ec4c26e5fc4b4ef0d2aa13e8c2d9))

## [2.17.0](https://github.com/JimmyPaolini/codebase/compare/v2.16.0...v2.17.0) (2026-09-21)

### ✨ Features

* **codependix:** ✨ add a path command that reports how one node reaches another ([#1018](https://github.com/JimmyPaolini/codebase/issues/1018)) ([f7a1170](https://github.com/JimmyPaolini/codebase/commit/f7a11706a0e8f1559d880d021c6ee8dc9f569133)), closes [#924](https://github.com/JimmyPaolini/codebase/issues/924) [#904](https://github.com/JimmyPaolini/codebase/issues/904)
* **codependix:** ✨ give a nestjs module node its declaring file ([#1017](https://github.com/JimmyPaolini/codebase/issues/1017)) ([0f6736c](https://github.com/JimmyPaolini/codebase/commit/0f6736c14e3c1b83e1a644b2f94b6c93c5451320)), closes [#938](https://github.com/JimmyPaolini/codebase/issues/938) [#938](https://github.com/JimmyPaolini/codebase/issues/938) [#940](https://github.com/JimmyPaolini/codebase/issues/940) [#939](https://github.com/JimmyPaolini/codebase/issues/939) [#941](https://github.com/JimmyPaolini/codebase/issues/941) [#926](https://github.com/JimmyPaolini/codebase/issues/926) [#938](https://github.com/JimmyPaolini/codebase/issues/938) [#939](https://github.com/JimmyPaolini/codebase/issues/939) [#940](https://github.com/JimmyPaolini/codebase/issues/940) [#941](https://github.com/JimmyPaolini/codebase/issues/941) [#904](https://github.com/JimmyPaolini/codebase/issues/904)
* **codependix:** ✨ report stale exports by destination, anchor, and difference ([#1019](https://github.com/JimmyPaolini/codebase/issues/1019)) ([487cb80](https://github.com/JimmyPaolini/codebase/commit/487cb80cd6b8730bbedc21d7e7d1b263bb0613ff)), closes [#925](https://github.com/JimmyPaolini/codebase/issues/925) [#904](https://github.com/JimmyPaolini/codebase/issues/904)
* **deployments,documentation:** ✨ combine push releases into continuous deployment workflow ([#1021](https://github.com/JimmyPaolini/codebase/issues/1021)) ([2282c9b](https://github.com/JimmyPaolini/codebase/commit/2282c9b4ae14de9432dabb31212feec6063c78c0)), closes [#996](https://github.com/JimmyPaolini/codebase/issues/996) [#991](https://github.com/JimmyPaolini/codebase/issues/991)
* **deployments:** ✨ validate commit message and governance on push to main ([#1024](https://github.com/JimmyPaolini/codebase/issues/1024)) ([9b1b2ef](https://github.com/JimmyPaolini/codebase/commit/9b1b2ef36787103d6cecb7a315862672faf1dc98))
* **meanderaw:** ✨ bake dimensions and repeats into meander codes ([#1022](https://github.com/JimmyPaolini/codebase/issues/1022)) ([9ea2c80](https://github.com/JimmyPaolini/codebase/commit/9ea2c804e0c0f430721ca970e41bc9eb722a09ca)), closes [#1013](https://github.com/JimmyPaolini/codebase/issues/1013)
* **meanderaw:** ✨ formalize lines, bars, mesh, and dots meander families ([#1047](https://github.com/JimmyPaolini/codebase/issues/1047)) ([e5e786d](https://github.com/JimmyPaolini/codebase/commit/e5e786d6f51f0f9c2da12f969c99b7b91e256f6b))

### 📝 Documentation

* **callidescope,codometer,conformetry:** 📝 remove orphaned codependix anchor blocks ([#1016](https://github.com/JimmyPaolini/codebase/issues/1016)) ([dadd4e3](https://github.com/JimmyPaolini/codebase/commit/dadd4e34e1394b1dc22884cfcc4e9c7b86f32279)), closes [#923](https://github.com/JimmyPaolini/codebase/issues/923) [#904](https://github.com/JimmyPaolini/codebase/issues/904)
* **codependix:** 📝 rewrite the navigate skill to drive the command line ([#1020](https://github.com/JimmyPaolini/codebase/issues/1020)) ([2d2a6e1](https://github.com/JimmyPaolini/codebase/commit/2d2a6e1ea752e3c45ea3362b673e7475548bcd45)), closes [#927](https://github.com/JimmyPaolini/codebase/issues/927) [#904](https://github.com/JimmyPaolini/codebase/issues/904)

### ♻️ Code Refactoring

* **ic-suite:** ♻️ unify markdown anchor markers across ic-suite toolchains ([#1026](https://github.com/JimmyPaolini/codebase/issues/1026)) ([d89e544](https://github.com/JimmyPaolini/codebase/commit/d89e5448255fda29210dc1106b9478dd2ff1c095)), closes [#904](https://github.com/JimmyPaolini/codebase/issues/904)

## [2.16.0](https://github.com/JimmyPaolini/codebase/compare/v2.15.0...v2.16.0) (2026-09-21)

### ✨ Features

* **meanderaw:** ✨ implement canonical phase for meanders ([#1011](https://github.com/JimmyPaolini/codebase/issues/1011)) ([c3215f6](https://github.com/JimmyPaolini/codebase/commit/c3215f651c746172d46ca6972023d5e92b5c708a)), closes [#859](https://github.com/JimmyPaolini/codebase/issues/859)
* **meanderaw:** ✨ measure characteristics ([#1010](https://github.com/JimmyPaolini/codebase/issues/1010)) ([20fabe6](https://github.com/JimmyPaolini/codebase/commit/20fabe623bb69136c798b75c2ede47e8d703a6a3)), closes [#859](https://github.com/JimmyPaolini/codebase/issues/859)
* **meanderaw:** ✨ store families as an open set and drop charter columns ([#1012](https://github.com/JimmyPaolini/codebase/issues/1012)) ([6755608](https://github.com/JimmyPaolini/codebase/commit/6755608a8e8e8c885d679b16d819853da8d81f5c)), closes [#859](https://github.com/JimmyPaolini/codebase/issues/859)

### ♻️ Code Refactoring

* **meanderaw:** ♻️ remove module forward references and restore coverage ([#1013](https://github.com/JimmyPaolini/codebase/issues/1013)) ([b0ffba1](https://github.com/JimmyPaolini/codebase/commit/b0ffba1a5562fff298f5cdbc831f9f2e4baf4b4b)), closes [#859](https://github.com/JimmyPaolini/codebase/issues/859)

## [2.15.0](https://github.com/JimmyPaolini/codebase/compare/v2.14.0...v2.15.0) (2026-09-20)

### ✨ Features

* **validation:** ✨ add continuous compliance hierarchy and governance audits ([#1015](https://github.com/JimmyPaolini/codebase/issues/1015)) ([7d3f379](https://github.com/JimmyPaolini/codebase/commit/7d3f379cffa07b0fd2757f0344bf0765afada67d)), closes [#1005](https://github.com/JimmyPaolini/codebase/issues/1005) [#1006](https://github.com/JimmyPaolini/codebase/issues/1006) [#1007](https://github.com/JimmyPaolini/codebase/issues/1007) [#1008](https://github.com/JimmyPaolini/codebase/issues/1008) [#1009](https://github.com/JimmyPaolini/codebase/issues/1009) [#1004](https://github.com/JimmyPaolini/codebase/issues/1004)

## [2.14.0](https://github.com/JimmyPaolini/codebase/compare/v2.13.1...v2.14.0) (2026-09-20)

### ✨ Features

* **deployments,documentation,dependencies:** ✨ unify continuous deployment and continuous compliance workflows ([#996](https://github.com/JimmyPaolini/codebase/issues/996)) ([1b303cb](https://github.com/JimmyPaolini/codebase/commit/1b303cb8f5bce440ab494a103e0f13ef3e67ce93)), closes [#992](https://github.com/JimmyPaolini/codebase/issues/992) [#991](https://github.com/JimmyPaolini/codebase/issues/991) [#967](https://github.com/JimmyPaolini/codebase/issues/967)

### 🐛 Bug Fixes

* **codometer:** 🐛 discover root and nested package reports in pr changes ([#985](https://github.com/JimmyPaolini/codebase/issues/985)) ([94b2cee](https://github.com/JimmyPaolini/codebase/commit/94b2ceeb4587ab6ce3bc56c4765455a4a786b758)), closes [#981](https://github.com/JimmyPaolini/codebase/issues/981)
* **configuration:** 🐛 stop sharing nx cache across worktrees to prevent race conditions ([#990](https://github.com/JimmyPaolini/codebase/issues/990)) ([1cd8448](https://github.com/JimmyPaolini/codebase/commit/1cd8448294bfd8ab6b68b0159f682e8992a8614b)), closes [#960](https://github.com/JimmyPaolini/codebase/issues/960)

## [2.13.1](https://github.com/JimmyPaolini/codebase/compare/v2.13.0...v2.13.1) (2026-09-20)

## [2.13.0](https://github.com/JimmyPaolini/codebase/compare/v2.12.0...v2.13.0) (2026-09-20)

## [2.12.0](https://github.com/JimmyPaolini/codebase/compare/v2.11.1...v2.12.0) (2026-09-19)

## [2.11.1](https://github.com/JimmyPaolini/codebase/compare/v2.11.0...v2.11.1) (2026-09-19)

## [2.11.0](https://github.com/JimmyPaolini/codebase/compare/v2.10.6...v2.11.0) (2026-09-19)

## [2.10.6](https://github.com/JimmyPaolini/codebase/compare/v2.10.5...v2.10.6) (2026-09-19)

## [2.10.5](https://github.com/JimmyPaolini/codebase/compare/v2.10.4...v2.10.5) (2026-09-19)

## [2.10.4](https://github.com/JimmyPaolini/codebase/compare/v2.10.3...v2.10.4) (2026-09-19)

## [2.10.3](https://github.com/JimmyPaolini/codebase/compare/v2.10.2...v2.10.3) (2026-09-19)

## [2.10.2](https://github.com/JimmyPaolini/codebase/compare/v2.10.1...v2.10.2) (2026-09-18)

## [2.10.1](https://github.com/JimmyPaolini/codebase/compare/v2.10.0...v2.10.1) (2026-09-18)

## [2.10.0](https://github.com/JimmyPaolini/codebase/compare/v2.9.2...v2.10.0) (2026-09-18)

## [2.9.2](https://github.com/JimmyPaolini/codebase/compare/v2.9.1...v2.9.2) (2026-09-18)

## [2.9.1](https://github.com/JimmyPaolini/codebase/compare/v2.9.0...v2.9.1) (2026-09-18)

## [2.9.0](https://github.com/JimmyPaolini/codebase/compare/v2.8.2...v2.9.0) (2026-09-18)

## [2.8.2](https://github.com/JimmyPaolini/codebase/compare/v2.8.1...v2.8.2) (2026-09-18)

## [2.8.1](https://github.com/JimmyPaolini/codebase/compare/v2.8.0...v2.8.1) (2026-09-15)

## [2.8.0](https://github.com/JimmyPaolini/codebase/compare/v2.7.0...v2.8.0) (2026-09-15)

## [2.7.0](https://github.com/JimmyPaolini/codebase/compare/v2.6.0...v2.7.0) (2026-09-14)

## [2.6.0](https://github.com/JimmyPaolini/codebase/compare/v2.5.0...v2.6.0) (2026-09-14)

## [2.5.0](https://github.com/JimmyPaolini/codebase/compare/v2.4.2...v2.5.0) (2026-09-14)

## [2.4.2](https://github.com/JimmyPaolini/codebase/compare/v2.4.1...v2.4.2) (2026-09-14)

## [2.4.1](https://github.com/JimmyPaolini/codebase/compare/v2.4.0...v2.4.1) (2026-09-14)

## [2.4.0](https://github.com/JimmyPaolini/codebase/compare/v2.3.1...v2.4.0) (2026-09-14)

## [2.3.1](https://github.com/JimmyPaolini/codebase/compare/v2.3.0...v2.3.1) (2026-09-14)

## [2.3.0](https://github.com/JimmyPaolini/codebase/compare/v2.2.1...v2.3.0) (2026-09-14)

## [2.2.1](https://github.com/JimmyPaolini/codebase/compare/v2.2.0...v2.2.1) (2026-09-14)

## [2.2.0](https://github.com/JimmyPaolini/codebase/compare/v2.1.2...v2.2.0) (2026-09-14)

## [2.1.2](https://github.com/JimmyPaolini/codebase/compare/v2.1.1...v2.1.2) (2026-09-08)

## [2.1.1](https://github.com/JimmyPaolini/codebase/compare/v2.1.0...v2.1.1) (2026-09-08)

## [2.1.0](https://github.com/JimmyPaolini/codebase/compare/v2.0.0...v2.1.0) (2026-09-07)

## [2.0.0](https://github.com/JimmyPaolini/codebase/compare/v1.64.0...v2.0.0) (2026-09-07)

## [1.64.0](https://github.com/JimmyPaolini/codebase/compare/v1.63.0...v1.64.0) (2026-09-07)

## [1.63.0](https://github.com/JimmyPaolini/codebase/compare/v1.62.0...v1.63.0) (2026-09-07)

## [1.62.0](https://github.com/JimmyPaolini/codebase/compare/v1.61.0...v1.62.0) (2026-09-07)

## [1.61.0](https://github.com/JimmyPaolini/codebase/compare/v1.60.0...v1.61.0) (2026-09-07)

## [1.60.0](https://github.com/JimmyPaolini/codebase/compare/v1.59.0...v1.60.0) (2026-09-07)

## [1.59.0](https://github.com/JimmyPaolini/codebase/compare/v1.58.1...v1.59.0) (2026-09-07)

## [1.58.1](https://github.com/JimmyPaolini/codebase/compare/v1.58.0...v1.58.1) (2026-09-06)

## [1.58.0](https://github.com/JimmyPaolini/codebase/compare/v1.57.0...v1.58.0) (2026-09-05)

## [1.57.0](https://github.com/JimmyPaolini/codebase/compare/v1.56.0...v1.57.0) (2026-09-05)

## [1.56.0](https://github.com/JimmyPaolini/codebase/compare/v1.55.2...v1.56.0) (2026-09-05)

## [1.55.2](https://github.com/JimmyPaolini/codebase/compare/v1.55.1...v1.55.2) (2026-09-05)

## [1.55.1](https://github.com/JimmyPaolini/codebase/compare/v1.55.0...v1.55.1) (2026-09-05)

## [1.55.0](https://github.com/JimmyPaolini/codebase/compare/v1.54.0...v1.55.0) (2026-09-04)

## [1.54.0](https://github.com/JimmyPaolini/codebase/compare/v1.53.0...v1.54.0) (2026-09-04)

## [1.53.0](https://github.com/JimmyPaolini/codebase/compare/v1.52.1...v1.53.0) (2026-09-03)

## [1.52.1](https://github.com/JimmyPaolini/codebase/compare/v1.52.0...v1.52.1) (2026-09-02)

## [1.52.0](https://github.com/JimmyPaolini/codebase/compare/v1.51.0...v1.52.0) (2026-09-02)

## [1.51.0](https://github.com/JimmyPaolini/codebase/compare/v1.50.1...v1.51.0) (2026-09-01)

## [1.50.1](https://github.com/JimmyPaolini/codebase/compare/v1.50.0...v1.50.1) (2026-09-01)

## [1.50.0](https://github.com/JimmyPaolini/codebase/compare/v1.49.0...v1.50.0) (2026-08-28)

## [1.49.0](https://github.com/JimmyPaolini/codebase/compare/v1.48.0...v1.49.0) (2026-08-28)

## [1.48.0](https://github.com/JimmyPaolini/codebase/compare/v1.47.1...v1.48.0) (2026-08-27)

## [1.47.1](https://github.com/JimmyPaolini/codebase/compare/v1.47.0...v1.47.1) (2026-08-27)

## [1.47.0](https://github.com/JimmyPaolini/codebase/compare/v1.46.0...v1.47.0) (2026-08-27)

## [1.46.0](https://github.com/JimmyPaolini/codebase/compare/v1.45.0...v1.46.0) (2026-08-27)

## [1.45.0](https://github.com/JimmyPaolini/codebase/compare/v1.44.0...v1.45.0) (2026-08-27)

## [1.44.0](https://github.com/JimmyPaolini/codebase/compare/v1.43.0...v1.44.0) (2026-08-27)

## [1.43.0](https://github.com/JimmyPaolini/codebase/compare/v1.42.0...v1.43.0) (2026-08-27)

## [1.42.0](https://github.com/JimmyPaolini/codebase/compare/v1.41.0...v1.42.0) (2026-08-27)

## [1.41.0](https://github.com/JimmyPaolini/codebase/compare/v1.40.0...v1.41.0) (2026-08-26)

## [1.40.0](https://github.com/JimmyPaolini/codebase/compare/v1.39.0...v1.40.0) (2026-08-26)

## [1.39.0](https://github.com/JimmyPaolini/codebase/compare/v1.38.0...v1.39.0) (2026-08-26)

## [1.38.0](https://github.com/JimmyPaolini/codebase/compare/v1.37.1...v1.38.0) (2026-08-26)

## [1.37.1](https://github.com/JimmyPaolini/codebase/compare/v1.37.0...v1.37.1) (2026-08-25)

## [1.37.0](https://github.com/JimmyPaolini/codebase/compare/v1.36.0...v1.37.0) (2026-08-25)

## [1.36.0](https://github.com/JimmyPaolini/codebase/compare/v1.35.2...v1.36.0) (2026-08-24)

## [1.35.2](https://github.com/JimmyPaolini/codebase/compare/v1.35.1...v1.35.2) (2026-08-24)

## [1.35.1](https://github.com/JimmyPaolini/codebase/compare/v1.35.0...v1.35.1) (2026-08-24)

## [1.35.0](https://github.com/JimmyPaolini/codebase/compare/v1.34.0...v1.35.0) (2026-08-24)

## [1.34.0](https://github.com/JimmyPaolini/codebase/compare/v1.33.2...v1.34.0) (2026-08-24)

## [1.33.2](https://github.com/JimmyPaolini/codebase/compare/v1.33.1...v1.33.2) (2026-08-23)

## [1.33.1](https://github.com/JimmyPaolini/codebase/compare/v1.33.0...v1.33.1) (2026-08-23)

## [1.33.0](https://github.com/JimmyPaolini/codebase/compare/v1.32.1...v1.33.0) (2026-08-23)

## [1.32.1](https://github.com/JimmyPaolini/codebase/compare/v1.32.0...v1.32.1) (2026-08-23)

## [1.32.0](https://github.com/JimmyPaolini/codebase/compare/v1.31.2...v1.32.0) (2026-08-23)

## [1.31.2](https://github.com/JimmyPaolini/codebase/compare/v1.31.1...v1.31.2) (2026-08-23)

## [1.31.1](https://github.com/JimmyPaolini/codebase/compare/v1.31.0...v1.31.1) (2026-08-23)

## [1.31.0](https://github.com/JimmyPaolini/codebase/compare/v1.30.2...v1.31.0) (2026-08-23)

## [1.30.2](https://github.com/JimmyPaolini/codebase/compare/v1.30.1...v1.30.2) (2026-08-22)

## [1.30.1](https://github.com/JimmyPaolini/codebase/compare/v1.30.0...v1.30.1) (2026-08-22)

## [1.30.0](https://github.com/JimmyPaolini/codebase/compare/v1.29.2...v1.30.0) (2026-08-22)

## [1.29.2](https://github.com/JimmyPaolini/codebase/compare/v1.29.1...v1.29.2) (2026-08-22)

## [1.29.1](https://github.com/JimmyPaolini/codebase/compare/v1.29.0...v1.29.1) (2026-08-22)

## [1.29.0](https://github.com/JimmyPaolini/codebase/compare/v1.28.1...v1.29.0) (2026-08-21)

## [1.28.1](https://github.com/JimmyPaolini/codebase/compare/v1.28.0...v1.28.1) (2026-08-21)

## [1.28.0](https://github.com/JimmyPaolini/codebase/compare/v1.27.0...v1.28.0) (2026-08-21)

## [1.27.0](https://github.com/JimmyPaolini/codebase/compare/v1.26.0...v1.27.0) (2026-08-18)

## [1.26.0](https://github.com/JimmyPaolini/codebase/compare/v1.25.0...v1.26.0) (2026-08-18)

## [1.25.0](https://github.com/JimmyPaolini/codebase/compare/v1.24.0...v1.25.0) (2026-08-18)

## [1.24.0](https://github.com/JimmyPaolini/codebase/compare/v1.23.0...v1.24.0) (2026-08-18)

## [1.23.0](https://github.com/JimmyPaolini/codebase/compare/v1.22.0...v1.23.0) (2026-08-17)

## [1.22.0](https://github.com/JimmyPaolini/codebase/compare/v1.21.1...v1.22.0) (2026-08-16)

## [1.21.1](https://github.com/JimmyPaolini/codebase/compare/v1.21.0...v1.21.1) (2026-08-16)

## [1.21.0](https://github.com/JimmyPaolini/codebase/compare/v1.20.1...v1.21.0) (2026-08-16)

## [1.20.1](https://github.com/JimmyPaolini/codebase/compare/v1.20.0...v1.20.1) (2026-08-16)

## [1.20.0](https://github.com/JimmyPaolini/codebase/compare/v1.19.0...v1.20.0) (2026-08-16)

## [1.19.0](https://github.com/JimmyPaolini/codebase/compare/v1.18.0...v1.19.0) (2026-08-16)

## [1.18.0](https://github.com/JimmyPaolini/codebase/compare/v1.17.3...v1.18.0) (2026-08-16)

## [1.17.3](https://github.com/JimmyPaolini/codebase/compare/v1.17.2...v1.17.3) (2026-08-16)

## [1.17.2](https://github.com/JimmyPaolini/codebase/compare/v1.17.1...v1.17.2) (2026-08-15)

## [1.17.1](https://github.com/JimmyPaolini/codebase/compare/v1.17.0...v1.17.1) (2026-08-15)

## [1.17.0](https://github.com/JimmyPaolini/codebase/compare/v1.16.0...v1.17.0) (2026-08-15)

## [1.16.0](https://github.com/JimmyPaolini/codebase/compare/v1.15.1...v1.16.0) (2026-07-30)

## [1.15.1](https://github.com/JimmyPaolini/monorepo/compare/v1.15.0...v1.15.1) (2026-07-24)

## [1.15.0](https://github.com/JimmyPaolini/monorepo/compare/v1.14.3...v1.15.0) (2026-07-24)

## [1.14.3](https://github.com/JimmyPaolini/monorepo/compare/v1.14.2...v1.14.3) (2026-07-23)

## [1.14.2](https://github.com/JimmyPaolini/monorepo/compare/v1.14.1...v1.14.2) (2026-07-22)

## [1.14.1](https://github.com/JimmyPaolini/monorepo/compare/v1.14.0...v1.14.1) (2026-07-22)

## [1.14.0](https://github.com/JimmyPaolini/monorepo/compare/v1.13.2...v1.14.0) (2026-07-21)

## [1.13.2](https://github.com/JimmyPaolini/monorepo/compare/v1.13.1...v1.13.2) (2026-07-21)

## [1.13.1](https://github.com/JimmyPaolini/monorepo/compare/v1.13.0...v1.13.1) (2026-07-18)

### 📦 Build System

* **deps:** bump mistune from 3.2.1 to 3.3.0 in /applications/affirmations in the uv group across 1 directory ([#88](https://github.com/JimmyPaolini/monorepo/issues/88)) ([63c86fd](https://github.com/JimmyPaolini/monorepo/commit/63c86fdbd11199303f493614f12b2e1a2059376f))

## [1.13.0](https://github.com/JimmyPaolini/monorepo/compare/v1.12.0...v1.13.0) (2026-07-17)

### ✨ Features

* **scripts:** ✨ add stale local branch cleanup script ([#89](https://github.com/JimmyPaolini/monorepo/issues/89)) ([7cbb1d0](https://github.com/JimmyPaolini/monorepo/commit/7cbb1d0f98ba321e39992b80d387d0f05d7539e5))

## [1.12.0](https://github.com/JimmyPaolini/monorepo/compare/v1.11.0...v1.12.0) (2026-07-17)

### ✨ Features

* **monorepo:** ✨ integrate fallow code-quality workflows ([#74](https://github.com/JimmyPaolini/monorepo/issues/74)) ([e219208](https://github.com/JimmyPaolini/monorepo/commit/e2192087a5c5e53162ccd574ff34798384b505f7))

### 🐛 Bug Fixes

* **monorepo:** 🐛 enforce gpg signing checks for copilot commits ([#75](https://github.com/JimmyPaolini/monorepo/issues/75)) ([2f5c636](https://github.com/JimmyPaolini/monorepo/commit/2f5c6361cc2963dead6ad0d51832449c63bc3223))

### ♻️ Code Refactoring

* **conformance:** ♻️ refactor modules and add command option routing ([#82](https://github.com/JimmyPaolini/monorepo/issues/82)) ([4a4083a](https://github.com/JimmyPaolini/monorepo/commit/4a4083acc8e47e0b4d71bfde113ff681819d6ad8))
* **monorepo:** ♻️ migrate sync scripts to synchronization tool ([#80](https://github.com/JimmyPaolini/monorepo/issues/80)) ([3ea7081](https://github.com/JimmyPaolini/monorepo/commit/3ea7081789a3cfe19477bb6a86612cc6a4218a8c))
* **monorepo:** ♻️ standardize orchestration and deduplicate modules ([#79](https://github.com/JimmyPaolini/monorepo/issues/79)) ([a42d349](https://github.com/JimmyPaolini/monorepo/commit/a42d34955f0a943b4071a7a43644c7f726738e37))

### 📦 Build System

* **dependencies:** ⬆️ upgrade nx to version 23 ([#73](https://github.com/JimmyPaolini/monorepo/issues/73)) ([94b51bb](https://github.com/JimmyPaolini/monorepo/commit/94b51bb09c2011e069df142bfb5b68f3f8295286))
* **deps:** bump the uv group across 1 directory with 3 updates ([#76](https://github.com/JimmyPaolini/monorepo/issues/76)) ([245b3f5](https://github.com/JimmyPaolini/monorepo/commit/245b3f591a024fbfa9611e0803953c7d0fd59056))

## [1.11.0](https://github.com/JimmyPaolini/monorepo/compare/v1.10.4...v1.11.0) (2026-06-18)

### ✨ Features

* **conformance:** ✨ add nestjs service files conformance generator ([#70](https://github.com/JimmyPaolini/monorepo/issues/70)) ([944a965](https://github.com/JimmyPaolini/monorepo/commit/944a9650b9691879f4bf77541d88e1ad1189c7b7))

## [1.10.4](https://github.com/JimmyPaolini/monorepo/compare/v1.10.3...v1.10.4) (2026-06-18)

### 📦 Build System

* **deps:** bump the uv group across 1 directory with 5 updates ([#71](https://github.com/JimmyPaolini/monorepo/issues/71)) ([f288501](https://github.com/JimmyPaolini/monorepo/commit/f28850113f99aa5209a66dbda7bcf35f29171803))

## [1.10.3](https://github.com/JimmyPaolini/monorepo/compare/v1.10.2...v1.10.3) (2026-06-18)

### 📦 Build System

* **deps:** bump @apollo/server from 4.13.0 to 5.5.1 in /tools/conformance/src/generators/nestjs-graphql-application/templates in the npm_and_yarn group across 1 directory ([#64](https://github.com/JimmyPaolini/monorepo/issues/64)) ([75096e3](https://github.com/JimmyPaolini/monorepo/commit/75096e3662e9244597f8fa0cda1762b834e5a528))
* **deps:** bump tornado from 6.5.5 to 6.5.6 in /applications/affirmations in the uv group across 1 directory ([#67](https://github.com/JimmyPaolini/monorepo/issues/67)) ([dd76687](https://github.com/JimmyPaolini/monorepo/commit/dd76687045235ac7c55d2b9bff97222b3a0724fa))

## [1.10.2](https://github.com/JimmyPaolini/monorepo/compare/v1.10.1...v1.10.2) (2026-06-18)

### ♻️ Code Refactoring

* **monorepo:** ♻️ standardize naming and lint configuration ([#69](https://github.com/JimmyPaolini/monorepo/issues/69)) ([6306eb6](https://github.com/JimmyPaolini/monorepo/commit/6306eb6cbe5e12d4e29fcb00a0d2ae960ccb7a9e))

## [1.10.1](https://github.com/JimmyPaolini/monorepo/compare/v1.10.0...v1.10.1) (2026-06-13)

### 📝 Documentation

* **documentation:** 📝 add proactive code validation skills and workflow gates ([#66](https://github.com/JimmyPaolini/monorepo/issues/66)) ([db88dfe](https://github.com/JimmyPaolini/monorepo/commit/db88dfe7679cf3ec212db9475613d8e82e2664f0))

### 📦 Build System

* **deps:** ⬆️ bump aiohttp from 3.13.5 to 3.14.0 in /applications/affirmations in the uv group across 1 directory ([#57](https://github.com/JimmyPaolini/monorepo/issues/57)) ([bc8a31e](https://github.com/JimmyPaolini/monorepo/commit/bc8a31e77c3e39bcba086156d9c896dfa7601317))

## [1.10.0](https://github.com/JimmyPaolini/monorepo/compare/v1.9.0...v1.10.0) (2026-06-12)

### ✨ Features

* **lexico-ingestion:** ✨ implement multi-provider literature ingestion system ([#65](https://github.com/JimmyPaolini/monorepo/issues/65)) ([7a83390](https://github.com/JimmyPaolini/monorepo/commit/7a83390732bb0b70bccbab02aa1551da6e79f922))

## [1.9.0](https://github.com/JimmyPaolini/monorepo/compare/v1.8.0...v1.9.0) (2026-06-09)

### ✨ Features

* **conformance:** ✨ add nestjs-graphql-application and supporting generators ([#63](https://github.com/JimmyPaolini/monorepo/issues/63)) ([4b07c18](https://github.com/JimmyPaolini/monorepo/commit/4b07c188b6cf93d87f256e9aa4e9725d0781752a))

## [1.8.0](https://github.com/JimmyPaolini/monorepo/compare/v1.7.0...v1.8.0) (2026-06-08)

### ✨ Features

* **conformance:** ✨ add python conformance validators for json, markdown, notebook, text, and python files ([#58](https://github.com/JimmyPaolini/monorepo/issues/58)) ([940342c](https://github.com/JimmyPaolini/monorepo/commit/940342c67720a386a99ac50f07182a6a3595da0a))

## [1.7.0](https://github.com/JimmyPaolini/monorepo/compare/v1.6.0...v1.7.0) (2026-06-08)

### ✨ Features

* **conformance:** ✨ add nestjs-graphql-module generator ([#59](https://github.com/JimmyPaolini/monorepo/issues/59)) ([3e84ceb](https://github.com/JimmyPaolini/monorepo/commit/3e84ceb2f1c80486a91450e3aa1b03d4aef3f87e))

## [1.6.0](https://github.com/JimmyPaolini/monorepo/compare/v1.5.0...v1.6.0) (2026-06-04)

### ✨ Features

* **conformance:** ✨ add NestJS REPL entry point to nestjs-command-application generator ([#60](https://github.com/JimmyPaolini/monorepo/issues/60)) ([f263bf4](https://github.com/JimmyPaolini/monorepo/commit/f263bf4ea8e950376128eacc33da3cce394e1d0e)), closes [#56](https://github.com/JimmyPaolini/monorepo/issues/56)

## [1.5.0](https://github.com/JimmyPaolini/monorepo/compare/v1.4.0...v1.5.0) (2026-06-03)

### ✨ Features

* **conformance:** ✨ add jupyter-notebook-application Nx generator ([#52](https://github.com/JimmyPaolini/monorepo/issues/52)) ([236c9f1](https://github.com/JimmyPaolini/monorepo/commit/236c9f1cbb1579a8090c3ed12e56177f2fa8ab4e))

## [1.4.0](https://github.com/JimmyPaolini/monorepo/compare/v1.3.2...v1.4.0) (2026-06-03)

### ✨ Features

* **lexico:** ✨ add ingestion CLI app with typeorm entities package ([#53](https://github.com/JimmyPaolini/monorepo/issues/53)) ([7048b03](https://github.com/JimmyPaolini/monorepo/commit/7048b03be32c6477a5acbbc4fe59c66fd930622c))

### ♻️ Code Refactoring

* **conformance:** ♻️ centralize template conformance with auto-discovery ([#54](https://github.com/JimmyPaolini/monorepo/issues/54)) ([c69e136](https://github.com/JimmyPaolini/monorepo/commit/c69e136d6ca24c808b80c63ba841467e195b0e46))

## [1.3.2](https://github.com/JimmyPaolini/monorepo/compare/v1.3.1...v1.3.2) (2026-05-29)

### ♻️ Code Refactoring

* **caelundas:** 🔨 move module-level functions/constants into classes as instance methods ([#51](https://github.com/JimmyPaolini/monorepo/issues/51)) ([e659f0b](https://github.com/JimmyPaolini/monorepo/commit/e659f0b698cb06ef7aada42cf03d4ac3fb314dd3))

## [1.3.1](https://github.com/JimmyPaolini/monorepo/compare/v1.3.0...v1.3.1) (2026-05-29)

### 📦 Build System

* **affirmations:** 📦 upgrade python from 3.11 to 3.14 ([#45](https://github.com/JimmyPaolini/monorepo/issues/45)) ([2778fe4](https://github.com/JimmyPaolini/monorepo/commit/2778fe411082a48096258927d497743c2a4b9a4e))

## [1.3.0](https://github.com/JimmyPaolini/monorepo/compare/v1.2.7...v1.3.0) (2026-05-29)

### ✨ Features

* **conformance:** ✨ add nestjs-command-application generator for NestJS CLI scaffolding ([#44](https://github.com/JimmyPaolini/monorepo/issues/44)) ([bb3fd72](https://github.com/JimmyPaolini/monorepo/commit/bb3fd72ff2541781e674fca955034f8b3bb5d6e5))

### 🐛 Bug Fixes

* **configuration:** 🐛 add bash shebang to pre-commit hook ([#46](https://github.com/JimmyPaolini/monorepo/issues/46)) ([8d37d1b](https://github.com/JimmyPaolini/monorepo/commit/8d37d1b3cae09d52f2cf81099581eb12c5407c73))
* **configuration:** 🐛 make pre-commit hook posix sh-compatible ([#47](https://github.com/JimmyPaolini/monorepo/issues/47)) ([78372d5](https://github.com/JimmyPaolini/monorepo/commit/78372d5f5406fae5cead955c0b4bf75163bda459))

## [1.2.7](https://github.com/JimmyPaolini/monorepo/compare/v1.2.6...v1.2.7) (2026-05-25)

### 📦 Build System

* **deps:** bump the uv group across 1 directory with 14 updates ([#42](https://github.com/JimmyPaolini/monorepo/issues/42)) ([75828bb](https://github.com/JimmyPaolini/monorepo/commit/75828bbf3c1d6eba0cc65644a59dfc6877a81c3c))

## [1.2.6](https://github.com/JimmyPaolini/monorepo/compare/v1.2.5...v1.2.6) (2026-05-25)

### ♻️ Code Refactoring

* **tools:** ♻️ rename code-generator to conformance ([#40](https://github.com/JimmyPaolini/monorepo/issues/40)) ([c6a09a1](https://github.com/JimmyPaolini/monorepo/commit/c6a09a11da46bfe5114978352f3bfec0728ab787))

## [1.2.5](https://github.com/JimmyPaolini/monorepo/compare/v1.2.4...v1.2.5) (2026-05-25)

### ♻️ Code Refactoring

* **code-generator:** ♻️ migrate template rendering from ejs to mustache ([#37](https://github.com/JimmyPaolini/monorepo/issues/37)) ([79008c8](https://github.com/JimmyPaolini/monorepo/commit/79008c8cb92bdec6cfe8791d3ee6a350c9fd3b8b))

## [1.2.4](https://github.com/JimmyPaolini/monorepo/compare/v1.2.3...v1.2.4) (2026-05-25)

### 📝 Documentation

* **documentation:** 📝 expand git workflow with full branch, commit, and pr conventions ([#36](https://github.com/JimmyPaolini/monorepo/issues/36)) ([a14565a](https://github.com/JimmyPaolini/monorepo/commit/a14565acd97e7487c61704464ff66d6560ea37bf))
* **documentation:** 📝 fix outdated documentation across skills and projects ([#35](https://github.com/JimmyPaolini/monorepo/issues/35)) ([28aa035](https://github.com/JimmyPaolini/monorepo/commit/28aa035cbd38035ea607a3dc1e1aa6572ed2ad9e))

### ♻️ Code Refactoring

* **deployments:** ♻️ move devcontainer resource config to docker-compose.yml ([#39](https://github.com/JimmyPaolini/monorepo/issues/39)) ([39a543d](https://github.com/JimmyPaolini/monorepo/commit/39a543d189df41a2304c189242e99ea9adec93ee))

## [1.2.3](https://github.com/JimmyPaolini/monorepo/compare/v1.2.2...v1.2.3) (2026-05-25)

### 🐛 Bug Fixes

* **monorepo:** 🐛 replace removed gitleaks devcontainer feature with direct binary install ([#34](https://github.com/JimmyPaolini/monorepo/issues/34)) ([865c4c2](https://github.com/JimmyPaolini/monorepo/commit/865c4c2e5d7eabec1b91962b5cc8149b34bdafc7))

## [1.2.2](https://github.com/JimmyPaolini/monorepo/compare/v1.2.1...v1.2.2) (2026-05-25)

### 🐛 Bug Fixes

* **infrastructure:** 🐛 resolve devcontainer .env file resolution in ci ([#33](https://github.com/JimmyPaolini/monorepo/issues/33)) ([ad435df](https://github.com/JimmyPaolini/monorepo/commit/ad435df421afa875f5f2d8f0693961bcc86f5dd4)), closes [#26375211448](https://github.com/JimmyPaolini/monorepo/issues/26375211448)

### 📝 Documentation

* **documentation:** 🗑️ remove mcp-github skill and prefer gh cli ([#32](https://github.com/JimmyPaolini/monorepo/issues/32)) ([ce28d31](https://github.com/JimmyPaolini/monorepo/commit/ce28d31b409374a0809b0f45e117679d7ca6a5ca))

## [1.2.1](https://github.com/JimmyPaolini/monorepo/compare/v1.2.0...v1.2.1) (2026-05-24)

### 🐛 Bug Fixes

* **deployments:** 🐛 remove cacheTo from devcontainer and sync configs ([#30](https://github.com/JimmyPaolini/monorepo/issues/30)) ([5496e9e](https://github.com/JimmyPaolini/monorepo/commit/5496e9e28adfa25a283aa98ef56d0d860c1b7169))

## [1.2.0](https://github.com/JimmyPaolini/monorepo/compare/v1.1.1...v1.2.0) (2026-05-23)

### ✨ Features

* **tools:** ✨ add nestjs-service-module generator ([#25](https://github.com/JimmyPaolini/monorepo/issues/25)) ([f1ace47](https://github.com/JimmyPaolini/monorepo/commit/f1ace476ac842e71a5c608c09ea76913c7a9b684))

### ♻️ Code Refactoring

* **caelundas:** ♻️ nest-commander module reorganization and performance optimizations ([#22](https://github.com/JimmyPaolini/monorepo/issues/22)) ([15a8dc0](https://github.com/JimmyPaolini/monorepo/commit/15a8dc03971ca1c9477c71ba66e400df368f3a7c))

## [1.1.1](https://github.com/JimmyPaolini/monorepo/compare/v1.1.0...v1.1.1) (2026-04-22)

### ♻️ Code Refactoring

- **configuration:** ♻️ rename py-test target to pytest and clean up tsconfig baseUrl ([#20](https://github.com/JimmyPaolini/monorepo/issues/20)) ([3e2dd71](https://github.com/JimmyPaolini/monorepo/commit/3e2dd71876f53fdae46bd0a82c0b7cbbbeb392e2))

## [1.1.0](https://github.com/JimmyPaolini/monorepo/compare/v1.0.0...v1.1.0) (2026-04-14)

### ✨ Features

- **affirmations:** 🚀 build affirmation application in python with langchain and ollama ([#19](https://github.com/JimmyPaolini/monorepo/issues/19)) ([595c0af](https://github.com/JimmyPaolini/monorepo/commit/595c0afcc850a2eff0cf9dcc01858f2098ddd01e))

## 1.0.0 (2026-02-27)

### ✨ Features

- ✨ add caelundas ([2189b7d](https://github.com/JimmyPaolini/monorepo/commit/2189b7ddc1728a9511b32f1ac466e4801f8f1014))
- ✨ add gitmodule JimmyPaolini ([ad6eae5](https://github.com/JimmyPaolini/monorepo/commit/ad6eae57e7d83903d63ea06e2ff83938248071df))
- ✨ add top level nx targets ([a107528](https://github.com/JimmyPaolini/monorepo/commit/a1075287ff81fa98b6f486a5e82bcdcda0955009))
- ✨ caelundas kubernetes job running ([fd3896a](https://github.com/JimmyPaolini/monorepo/commit/fd3896a6dee7c5e2cafa3abc3842d37da0bc3140))
- ✨ caelundas running as a node app ([9d6022c](https://github.com/JimmyPaolini/monorepo/commit/9d6022cdd1488f43f4643469e0347704f8880153))
- ✨ duration events ([1179f57](https://github.com/JimmyPaolini/monorepo/commit/1179f57de3e9f7a4ec088ed7366aeae0c7cd33fe))
- ✨ ephemeris service enhancements ([65783ae](https://github.com/JimmyPaolini/monorepo/commit/65783aeb8f6c716bd3b6f7d074413e73317c13c5))
- ✨ insert ephemeris values when fetched ([b4c7540](https://github.com/JimmyPaolini/monorepo/commit/b4c75407643ea0ff3af9a6525c365c12f69bb86c))
- ✨ list and copy scripts ([d233c30](https://github.com/JimmyPaolini/monorepo/commit/d233c3040eaa3795b751dcac335cd0b2c6ca27e4))
- ✨ multibody aspects ([5deb65d](https://github.com/JimmyPaolini/monorepo/commit/5deb65d47a57c19a4f7ca4c908507dfe24149f78))
- ✨ multiple refactors and improvements, removing dead code ([17a9594](https://github.com/JimmyPaolini/monorepo/commit/17a9594de253f59d06c9af670615cf7417d71a6c))
- ✨ retry logic, job running ([8f610b7](https://github.com/JimmyPaolini/monorepo/commit/8f610b79f1b059993333e31e3d412494fabb31bd))
- ✨ return to normal logging ([c78dd53](https://github.com/JimmyPaolini/monorepo/commit/c78dd53366b72b6118b5c23417bbb1dbac874c40))
- ✨ running new version ([2dd1000](https://github.com/JimmyPaolini/monorepo/commit/2dd10009a8968b5482685312781ffda86594f4b9))
- ✨ setup monorepo, import linode lke, import caelundas ([f2a95a1](https://github.com/JimmyPaolini/monorepo/commit/f2a95a11e3bdfab4b10c0ea00e36bc0d4c99f761))
- ✨ simplify compound aspects ([d59a116](https://github.com/JimmyPaolini/monorepo/commit/d59a116f76b00290d1ca4120bfcff149a7898bce))
- 🚧 compound aspects, other refactors ([cb91a0e](https://github.com/JimmyPaolini/monorepo/commit/cb91a0ed49b50dacb358ded6362f36887ad42f00))
- 🚧 wip migrating caelundas to node ([b7a15e8](https://github.com/JimmyPaolini/monorepo/commit/b7a15e84daec117b0691911d9bfae75ba8b8f44a))
- **configuration:** 🔧 add static analysis tools and comprehensive documentation ([#10](https://github.com/JimmyPaolini/monorepo/issues/10)) ([d1d3799](https://github.com/JimmyPaolini/monorepo/commit/d1d3799a9387064d5de251887a46b4c97d0937dd))
- **database:** ✨ initialize database and create ephemeris and events tables ([f211cf7](https://github.com/JimmyPaolini/monorepo/commit/f211cf7ec39b700138813f104e0d46b4e1b717e6))
- **format:** 🎨 add Prettier formatting commands and GitHub Actions workflow ([3f6d006](https://github.com/JimmyPaolini/monorepo/commit/3f6d0064719893cbca4bac7a73cc2fe176f4a32f))
- **infrastructure:** 🏗 implement devcontainer and enhance developer tooling ([#3](https://github.com/JimmyPaolini/monorepo/issues/3)) ([329e746](https://github.com/JimmyPaolini/monorepo/commit/329e746e983bd854771475bff5d9df48f35f377c))
- **lexico-components:** 🎨 add all shadcn components ([84fb0c6](https://github.com/JimmyPaolini/monorepo/commit/84fb0c6639228acb2adcc3d3b1f963adc18877ca))
- **lexico-components:** 🎨 add more components, use more shadcn defaults ([ec5f3da](https://github.com/JimmyPaolini/monorepo/commit/ec5f3dac31cc400480d6a00b14b16a39426bfdb2))
- **lexico:** ✨ add skeleton, tooltip, sheet, and sidebar components ([64e52fa](https://github.com/JimmyPaolini/monorepo/commit/64e52fa3be92ef0d87985e113d313633c3f67560))
- **lexico:** ✨ initialize Supabase configuration and database schema ([9ed3fe3](https://github.com/JimmyPaolini/monorepo/commit/9ed3fe328cc047bd1cb172f5a0d3349f37877fdf))
- **lexico:** ✨ lexico migration 1 ([30cdf00](https://github.com/JimmyPaolini/monorepo/commit/30cdf00af84e7d70b895b264bb33aa8f1ffdd77d))
- **lexico:** ✨ lexico migration 2 ([0ce5eb7](https://github.com/JimmyPaolini/monorepo/commit/0ce5eb77b7c18f8bdcbf076ea021e1c6dd8d1c30))
- **lexico:** ✨ migration 3 ([3114c98](https://github.com/JimmyPaolini/monorepo/commit/3114c98e7eafe46a746be4c9f1da9b4296cf361c))
- **lexico:** ✨ update styles and components for improved accessibility and design ([4dcfdcd](https://github.com/JimmyPaolini/monorepo/commit/4dcfdcd76e98bc7ecf3d6a0faee2a749bfc1eaa4))
- **lexico:** 🏗 scaffold lexico and lexico-components ([b7f08b3](https://github.com/JimmyPaolini/monorepo/commit/b7f08b314d23efe9168d81b6ee60f1f7ce0aa5a8))
- **lexico:** 💄 styling entry card ([8e32d09](https://github.com/JimmyPaolini/monorepo/commit/8e32d0973fbb0235cfbae543efc7a9b14ef718fe))
- **monorepo:** ✨ add comprehensive code analysis tooling ([#2](https://github.com/JimmyPaolini/monorepo/issues/2)) ([60fefb5](https://github.com/JimmyPaolini/monorepo/commit/60fefb5e8bb27e8463a45cbbb3038cc85e12ed6b))
- **monorepo:** ✨ enhance fetch utilities tests with improved timer handling ([827b907](https://github.com/JimmyPaolini/monorepo/commit/827b907a7239a13e18bc967d9e6ea8d27c730639))
- **monorepo:** 👷 implement component generator ([8149c27](https://github.com/JimmyPaolini/monorepo/commit/8149c2755a4f98fa53bb65522c8ae56305f71adf))

### 🐛 Bug Fixes

- 🐛 delete Persistent Volume before uninstall ([05a7e65](https://github.com/JimmyPaolini/monorepo/commit/05a7e650aa459889f4ee1945b7f5369e30474b72))
- 🐛 moon phase bug ([d7ef67b](https://github.com/JimmyPaolini/monorepo/commit/d7ef67b4166a0b44053956a3bdd602fb54d38c40))
- 🐛 output ([b06b2ca](https://github.com/JimmyPaolini/monorepo/commit/b06b2cab4950d9ce5bb5cdee96ae83a740c6f9c3))
- 🐛 parametrize timezone in ephemeris methods ([a65c579](https://github.com/JimmyPaolini/monorepo/commit/a65c57915fdcfa61a26d1ae6ba4a78655227d33c))
- 🔥 remove git submodule ([164cb8d](https://github.com/JimmyPaolini/monorepo/commit/164cb8d0c89e2041fd684b52203b8dfaa104ff7e))
- 🚨 lint fix first pass ([b869fc7](https://github.com/JimmyPaolini/monorepo/commit/b869fc78c2e68052e0d27fc64e9c2c3515f6919a))
- **aspect:** 🐛 ensure absolute difference calculation for aspect comparison ([65b512f](https://github.com/JimmyPaolini/monorepo/commit/65b512f38e94a799bf82a2ec441f0c84318df363))
- **caelundas:** 🏷️ typecheck tests ([06d97c6](https://github.com/JimmyPaolini/monorepo/commit/06d97c65a29c49297f8cdf64aed01886b23e21e7))
- **configuration:** 🔧 enhance devcontainer setup and developer workspace configuration ([#6](https://github.com/JimmyPaolini/monorepo/issues/6)) ([99bb9ef](https://github.com/JimmyPaolini/monorepo/commit/99bb9eff42b5f32f6241263bceb85f738d53db1f))
- **env:** 🔧 update output directory configuration in environment files ([feebea4](https://github.com/JimmyPaolini/monorepo/commit/feebea4e1c1cab5b730c78457b31776fc2cd3694))
- **eslint:** 🔧 update tsconfigRootDir to use \_\_dirname for correct path resolution ([4a8ac29](https://github.com/JimmyPaolini/monorepo/commit/4a8ac29487ea30cc77cf347d71ad71a2b381d4f6))
- **lexico:** ✨ typechecks ([2a7e442](https://github.com/JimmyPaolini/monorepo/commit/2a7e442cf384e1d2d9b65efe29a008f97277f238))
- **lexico:** 🐛 fix entry card styles and behavior WIP ([72ac100](https://github.com/JimmyPaolini/monorepo/commit/72ac100e71a4406c1cd38490a47d35f7b480e22c))
- **monorepo:** 🏷️ typecheck ([1946e10](https://github.com/JimmyPaolini/monorepo/commit/1946e108fd3a781c06b854afbb87a156d84059af))
- **monorepo:** 🚨 fix eslint config errors ([d51fead](https://github.com/JimmyPaolini/monorepo/commit/d51fead936a5ff4b60710a8cd068cf3f25c8d7a0))
- **monorepo:** 🚨 format, lint, typecheck ([44f8978](https://github.com/JimmyPaolini/monorepo/commit/44f89782e488b9d497005d476c203454a5e37d45))
- **persistence:** 🔧 update mountPath for data storage to /app/output ([427f9e6](https://github.com/JimmyPaolini/monorepo/commit/427f9e60d1c5a37c85830257504a2fc988ae09d5))
- **quadruple:** 🐛 update summary regex to correctly handle multiple symbols ([8daabdc](https://github.com/JimmyPaolini/monorepo/commit/8daabdc88e5bea1d772631a0e8e81fe4bf9f0402))
- **tests:** 🐛 ensure output directory exists for integration tests ([93ccbe7](https://github.com/JimmyPaolini/monorepo/commit/93ccbe715898d92a73b3ab598d8800795e8c7a12))
- **tests:** 🐛 update test database paths for integration and unit tests ([3cba380](https://github.com/JimmyPaolini/monorepo/commit/3cba380ebbd65ae7587ae40e0199aab1cb6fb158))

### 📝 Documentation

- 📝 scripts and documentation ([08ac117](https://github.com/JimmyPaolini/monorepo/commit/08ac117dd77cd1d68152b20ea333ebf53875b82d))
- **documentation:** 📝 update planning prompts with improved structure and phase guidance ([#7](https://github.com/JimmyPaolini/monorepo/issues/7)) ([23c9813](https://github.com/JimmyPaolini/monorepo/commit/23c9813082d9847082d10b9b25fa0021eceb8fc0))
- **monorepo:** 📝 Add instruction files and update configuration ([#5](https://github.com/JimmyPaolini/monorepo/issues/5)) ([9ae05b8](https://github.com/JimmyPaolini/monorepo/commit/9ae05b89f78f02770fe1a46808016c4eef299963))
- **nx:** 📝 add general guidelines for working with Nx ([bf21acc](https://github.com/JimmyPaolini/monorepo/commit/bf21acc957e84f3b2f82807255a6a5b281aacde3))

### ♻️ Code Refactoring

- ♻️ ephemeris ([57b46b8](https://github.com/JimmyPaolini/monorepo/commit/57b46b858a3acd4bdd77367094c6bdc8619a7d82))
- ♻️ k8s scripts ([219a5b8](https://github.com/JimmyPaolini/monorepo/commit/219a5b8384768f8031673838d93389099cdd21f2))
- ♻️ refactor output ([9915052](https://github.com/JimmyPaolini/monorepo/commit/99150524e0f5cc8c749433180a18c9b9835fd53e))
- ♻️ refactor script utilities ([63ad71e](https://github.com/JimmyPaolini/monorepo/commit/63ad71e461779ece2ef79ff4f9954c6e92e37225))
- ♻️ remove configurable inputs ([4be923d](https://github.com/JimmyPaolini/monorepo/commit/4be923d422f76cd6fbecb9bf3f1bcbcb550261ae))
- ♻️ script improvements ([ec679cc](https://github.com/JimmyPaolini/monorepo/commit/ec679cc5a8a4dd528de61afa60a9b442c411ac8b))
- ♻️ use tz-lookup for timezones ([16f9132](https://github.com/JimmyPaolini/monorepo/commit/16f9132f379dca29db80d17023cb5a5a6c9eb820))
- 🎨 formatting ([8c7927b](https://github.com/JimmyPaolini/monorepo/commit/8c7927b9dbdf719874fed3618b33b75889a4b725))
- 🚚 move files, bash utilities ([568e96c](https://github.com/JimmyPaolini/monorepo/commit/568e96c7d68e707bb7b831b71b03ab9b39c1c7cb))
- 🚚 rename kubernetes scripts ([dbf8abf](https://github.com/JimmyPaolini/monorepo/commit/dbf8abfad16022e7841a21e59eb3a87b374c4cee))
- **helm:** ♻️ improve persistent volume deletion logic in uninstall script ([7201b75](https://github.com/JimmyPaolini/monorepo/commit/7201b75a7fc30443693b0915d83764b2545d8906))
- **helm:** ♻️ rename helm-deploy to helm-upgrade and update script path ([2b92772](https://github.com/JimmyPaolini/monorepo/commit/2b92772b9e54b745966b3e266f5f1c358cfbcb6a))
- **monorepo:** ♻️ nx targets ([ea6155e](https://github.com/JimmyPaolini/monorepo/commit/ea6155e35fa5e0be628a97d2f3929927def548be))
- **monorepo:** ♻️ update markdown-lint command to use --configuration=write ([24e0e62](https://github.com/JimmyPaolini/monorepo/commit/24e0e627a8b5ac042256914365408c6d76a0fd0a))
- trigger lockfile check for any package.json or workspace config change ([88b50f0](https://github.com/JimmyPaolini/monorepo/commit/88b50f065bafecb307aeaaf85ee1e9e5abe297e4))

### 📦 Build System

- **configuration:** 🔧 switch devcontainer from node to root user for git worktree support ([#8](https://github.com/JimmyPaolini/monorepo/issues/8)) ([b9f8f52](https://github.com/JimmyPaolini/monorepo/commit/b9f8f525bcda2ab3f3e29aa8667c2bdd1b847719))
