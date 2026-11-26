# coinagerie-languages

Per-language identifier tokenizers and keyword lists for the coinagerie vocabulary toolchain. It depends on nothing else in the toolchain.

## Modules

- `css/` — Reads the identifiers of a CSS stylesheet (`CssService`).
- `hcl/` — Reads the identifiers of an HCL file, such as Terraform configuration (`HclService`).
- `json/` — Reads the keys of a JSON document (`JsonService`).
- `languages/` — Chooses the tokenizer for a file by its extension (`LanguagesService`).
- `python/` — Reads the identifiers of a Python file (`PythonService`).
- `scanner/` — Reads identifiers from a language with no parser here, using only its comment, string, and key syntax (`ScannerService`).
- `shell/` — Reads the identifiers of a shell script (`ShellService`).
- `sql/` — Reads the identifiers of a SQL script (`SqlService`).
- `toml/` — Reads the identifiers of a TOML document (`TomlService`).
- `typescript/` — Reads the identifiers of a TypeScript or JavaScript file from its syntax tree (`TypescriptService`).
- `yaml/` — Reads the keys of a YAML document, one line at a time (`YamlService`).
