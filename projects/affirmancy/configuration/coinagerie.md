<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with this project's `coinagerie-check:write` Nx target.

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
- **period**: Full stop at the end of a sentence, which the prompts forbid ending an affirmation with.
- **planet**: Astrology subject category in subjects.py for the bodies whose meanings the pipeline turns into affirmations.
- **polarity**: Grammatical axis in grammars.py recording whether a proposition is affirmed or negated, plus a subject category.
- **progressive**: Imperfective-group value in grammars.py for an event in progress at the reference time, such as continuous action.
- **self**: The speaker's own person in grammar descriptions, where affirmations address the self, another, or beyond the self.
- **subheading**: Heading below a section title in generated Markdown, which the prompts ban because model replies must be plain flowing prose.
- **triple**: Number member in grammars.py for exactly three referents, one of the extended values beside paucal, universal, and superplural.
- **weekday**: Subject category of the seven days Monday through Sunday, declared as _WEEKDAY in subjects.py and used for output filenames.
- **world**: Subject category of the four Kabbalistic realms, Atziluth through Assiah, declared as _KABBALAH_WORLD in subjects.py.

<!-- coinagerie:end -->
