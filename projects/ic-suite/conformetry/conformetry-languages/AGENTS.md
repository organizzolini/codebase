# conformetry-languages

Multi-language file comparison and syntax validators for Conformetry. It depends on `@conformetry/configuration`, `@conformetry/core`.

## Modules

- `differences/` — Builds and narrows structured conformance differences (`DifferencesService`).
- `files/` — Provides file and directory existence checking (`FilesModule`).
- `json/` — Provides the JSON language validator (`JsonModule`).
- `jupyter/` — Reads the `.ipynb` format into something comparable (`JupyterNotebookService`).
- `languages/` — Answers which Languages a run needs, and applies the Fallback (`LanguagesService`).
- `markdown/` — Decides whether two markdown nodes are the same node (`MarkdownNodesService`).
- `python/` — Provides the Python language validator (`PythonModule`).
- `scoring/` — Turns weights into conformance scores (`ScoringService`).
- `text/` — Checks that a text file contains every line its template requires (`TextService`).
- `typescript/` — Checks that a file carries the comments its template requires, in order (`TypescriptCommentsService`).
