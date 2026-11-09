# 🤲 Affirmancy

**Affirmations generated across every grammatical mood a language offers.**

A Python and Jupyter application that generates structured affirmations for
spiritual practices using LangChain, LangGraph, and a locally-hosted
`gemma4:e2b` model via Ollama. A LangGraph ReAct agent researches a subject
through SearxNG metasearch, and the model writes affirmations that are
validated against Pydantic models before being saved.

The interesting part is the grammar. Rather than producing a flat list of "I
am…" sentences, the pipeline enumerates moods, voices, tenses, aspects,
persons, numbers, polarities, and deixis — so a single subject yields
affirmations phrased as imperatives, optatives, subjunctives, and more.

## Requirements

- Python `>=3.11`
- [uv](https://docs.astral.sh/uv/) package manager
- Docker, for Ollama and SearxNG

The devcontainer provides Python 3.14.

## Setup

This application is a member of the uv workspace declared in
`configuration/pyproject.toml`, sharing
`configuration/uv.lock` and the root `.venv`. Sync from the
repository root and point uv at that workspace config.

```bash
uv sync --project configuration
```

## Quickstart

```bash
# 1. Start the local services
nx run affirmancy:ollama --configuration=start
nx run infrastructure:searxng:up
nx run infrastructure:open-webui:up

# 2. Pull the model (one-time download)
nx run affirmancy:ollama --configuration=pull-small   # gemma4:e2b

# 3. Open src/affirmancy.ipynb in VSCode and run the pipeline
#    (the notebooks raise an error naming `nx run infrastructure:searxng:up`
#    if SearxNG is not running)
```

## Project Structure

```text
projects/affirmancy/
├── src/
│   ├── affirmancy.ipynb     # Main generation pipeline
│   ├── semantics.ipynb      # Semantic exploration of subjects
│   ├── prices.ipynb         # Token accounting for a single run
│   ├── grammars.py          # Mood, Voice, Tense, Aspect, Person, Number,
│   │                        #   Polarity, Deixis, Form — and the Grammar model
│   ├── models.py            # Affirmation, GrammarAffirmations,
│   │                        #   SubjectAffirmations, ValidationResult
│   ├── prompts.py           # LangChain prompt templates
│   ├── subjects.py          # Subject and SubjectCategory definitions
│   └── output.py            # JSON and markdown writers
├── testing/                 # pytest suites, one per module
├── output/                  # Generated files (gitignored)
├── pyproject.toml
└── searxng.settings.yml
```

## Subjects

Subjects are declared in `src/subjects.py` as a `Subject` with a
`SubjectCategory`. The categories in place span tarot cards, Lenormand cards,
astrological signs, planets, nodes, asteroids, aspects and houses, modalities
and polarities, chakras, runes, sephiroth, Hebrew letters, kabbalistic worlds,
solfeggio frequencies, weekdays, and elements.

Adding a practice means adding its category and its subjects to that file —
nothing else in the pipeline needs to know about it.

## Grammar

`src/grammars.py` defines each grammatical axis as a `DescribedEnum`, so every
value carries its own description into the prompt. `Grammar` composes them into
one combination the model is asked to write in.

| Axis | Examples |
| ---- | -------- |
| `Mood` | indicative, imperative, optative, subjunctive, jussive |
| `Voice` | active, middle, passive |
| `Tense` | past, present, future |
| `Aspect` | perfective, imperfective, progressive, habitual |
| `Person` | first, second, third |
| `Number` | singular, dual, plural |
| `Polarity` | affirmative, negative |
| `Deixis` | proximal, medial, distal |
| `Form` | finite and non-finite forms |

## Nx Targets

| Target | Does |
| ------ | ---- |
| `ruff-lint` | Ruff linting |
| `ruff-format` | Ruff formatting |
| `pyright` / `ty` | Static type checking |
| `pytest` / `test-coverage` | Tests, with and without coverage |
| `vulture` | Dead code analysis |
| `bandit` | Security linting |
| `nbstripout` | Strip notebook outputs before commit |
| `spell-check`, `markdown-lint`, `yaml-lint` | Prose and configuration checks |
| `lint-codebase` | All of the above; `--configuration=write` to auto-fix |
| `ollama` | `start`, `stop`, `pull-small`, `pull-medium`, `pull-large` |

## Run tests

```bash
cd projects/affirmancy
uv run pytest
```

## Lint / format / typecheck

```bash
cd projects/affirmancy
uv run ruff check .
uv run ruff format .
uv run pyright
uv run ty check
uv run vulture src testing
uv run bandit -r src
```

## Services

| Service | Port | Purpose |
| ------- | ---- | ------- |
| Ollama | `11434` | Local LLM server (`gemma4:e2b`) |
| Open WebUI | `3001` | Browser-based chat interface for Ollama |
| SearxNG | `8889` | Self-hosted metasearch, aggregating 135+ engines |

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL |
| `SEARXNG_HOST` | `http://localhost:8889` | SearxNG server URL |

## Notes

- **CPU-only inference.** `gemma4:e2b` is the small variant deliberately —
  generation stays interactive without a GPU. `pull-medium` and `pull-large`
  fetch `gemma4:e4b` and `gemma4:e26b` when more capacity is worth the wait.
- **Model keepalive.** `OLLAMA_KEEP_ALIVE=10m` avoids reloading the model
  between cells.
- **Context budget.** `gemma4:e2b` has a 128k-token window, and research
  results are truncated to stay well inside it.
- **Notebook outputs are stripped** on commit by `nbstripout`, so a diff shows
  the code rather than the last run's results.

See [AGENTS.md](AGENTS.md) for the architecture, and the
[write-python skill](../../.agents/skills/write-python/SKILL.md) for the
workspace's Python tooling conventions.

## License

MIT — see [LICENSE](../../LICENSE).

## 👔 Conformetry

This project was generated from the [jupyter-notebook-application](../../configuration/conformetry-templates/jupyter-notebook-application) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run affirmancy:coinagerie-check:write`.

- **affirmation**: Pydantic model in src/models.py holding one generated sentence of text, which the output writer numbers into per-grammar lists.
- **aleph**: A Subject in the Hebrew Letter category, first in order, whose metadata carries the character alef.
- **angle**: Metadata key on astrology aspects giving the degree separation between two bodies, such as zero for a conjunction.
- **aspect**: Grammatical axis in grammars.py for how an event unfolds over time, distinct from the astrology aspect category.
- **asteroid**: Subject category in subjects.py for small bodies such as Ceres and Pallas, which a Greek mythology search source covers.
- **callable**: Annotation type in test_services.py for the serve fixture, which yields a callable that takes an int and returns a str.
- **category**: SubjectCategory model in subjects.py grouping subjects, whose slug names the output folder and whose name feeds prompts.
- **element**: Subject category in subjects.py grouping elemental subjects, one of several categories the pipeline iterates over.
- **grammar**: Pydantic model in grammars.py combining one value from each grammatical axis into the combination the model writes in.
- **hebrew**: Subject category in subjects.py grouping Hebrew Letter subjects, with alef as the first in order.
- **large**: Number member in grammars.py for a large, abundant number of subjects, which English expresses only with large-quantity quantifiers.
- **letter**: Lenormand card entry in subjects.py, separate from the Hebrew Letter category of alphabet characters.
- **modality**: Subject category in subjects.py grouping possibility and necessity subjects that the grammars express.
- **negative**: Polarity member in grammars.py for a proposition that is denied, also a subject under the Polarity category.
- **perfect**: Tense subdivision in grammars.py such as future perfect, for an event completed before a reference point in time.
- **planet**: Astrology subject category in subjects.py for the bodies whose meanings the pipeline turns into affirmations.
- **polarity**: Grammatical axis in grammars.py recording whether a proposition is affirmed or negated, plus a subject category.
- **progressive**: Imperfective-group value in grammars.py for an event in progress at the reference time, such as continuous action.
- **self**: The speaker's own person in grammar descriptions, where affirmations address the self, another, or beyond the self.
- **subheading**: Heading below a section title in generated Markdown, which the prompts ban because model replies must be plain flowing prose.
- **triple**: Number member in grammars.py for exactly three referents, one of the extended values beside paucal, universal, and superplural.
- **weekday**: Subject category of the seven days Monday through Sunday, declared as _WEEKDAY in subjects.py and used for output filenames.
- **world**: Subject category of the four Kabbalistic realms, Atziluth through Assiah, declared as _KABBALAH_WORLD in subjects.py.

<!-- coinagerie:end -->
