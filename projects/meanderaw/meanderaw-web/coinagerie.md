<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with this project's `coinagerie-check:write` Nx target.

- **alt**: The text alternative of a meander's drawing, set on the card's `img` in `meander-card.tsx` as `Drawing of meander <Code>`, so assistive technology and tests can name it.
- **border**: A Tailwind utility class, and the `--line` color token it takes in the card markup, that outlines a card or control; not a unit's grid border, which the CLI measures.
- **breadth**: Callidescope's count of the direct calls a web callable makes, recorded in the project's Breadth table for its gate.
- **category**: Where a characteristic is measured (submatrix, path or compound), or `shape` for the shape fields; the filter picker groups and describes fields by it.
- **characteristic**: A measured property of a meander, listed in the catalog the API's `characteristics` query returns; a card shows the pattern ones it holds and expands to every non-zero value, and the sort control offers each key.
- **contract**:
- **element**: A DOM node the page measures or observes, such as the gallery's root that `useElementBox` in `use-element-box.ts` reads the width of.
- **estimate**: The guessed height of a row of cards before it is measured, `ROW_ESTIMATES` in `meander-gallery.constants.ts`, which the virtualizer corrects once the row mounts.
- **fire**: Test helper verb for dispatching a DOM event, as in `fireEvent.click` from testing-library, used to press buttons and change the sort in route tests.
- **flight**: A page read still in progress, as in `inFlight` in `use-meanders.ts`, which belongs to the first page it began under.
- **gallery**: The landing page's virtualized collection of meander cards, rendered by `MeanderGallery` in `meander-gallery.tsx`, in a grid or a list.
- **gap**: The space between cards, 16 pixels as `GAP_PIXELS` in `meander-gallery.constants.ts`, which the column count allows for.
- **ink**: Design token for text color on the dark surface, such as `--ink` and `--ink-muted` in the theme.
- **innermost**: The deepest nested filter group in a test, where the builder disables Add group at the maximum depth.
- **lattice**: Which lattice a meander sits on, a text shape field the card shows and the sort and filter fields name.
- **leaf**: A last-level group, the only kind whose cards the grouped gallery reads, selected by the page filter and one key per level.
- **meanderaw**: The Greek meander project: its CLI draws and measures meanders, its API serves them, and this web app browses them.
- **ne**: The not-equal filter operator, shown as ≠ and sent to the API as `NE`.
- **observer**: A resize observer, the browser object that tells `useElementBox` when the gallery's width changes; jsdom has none, so `testing/viewport.ts` supplies one.
- **optgroup**: The HTML element that groups the sort control's options under Shape and Characteristics, in `gallery-sort.tsx`.
- **prop**: Short for a component's property, as in the props a test passes; the codebase prefers the full word `properties` in code.
- **radius**: Design token for the corner rounding of a card, `--radius-card` in the theme.
- **role**: Accessibility role argument in testing-library queries such as findByRole, which the index integration test uses to find the heading.
- **selector**: A CSS selector, such as `FOCUSABLE_SELECTOR` in `gallery-filters.constants.ts`, that finds what can take focus inside the filter surface.
- **sound**: Said of a rule's numbers when they are finite, and whole where the field takes whole numbers only, as `hasSoundNumbers` checks.
- **splice**:
- **unmount**: To remove a rendered component from the page, as a test does to start a fresh render within one test.
- **usable**: Said of a rule or group the catalog can answer, which `sanitizeFilter` keeps: a known field with an operator and value it takes.
- **visible**: The virtual rows the grouped gallery has mounted, whose pending rows start a group's cards loading.
- **window**: The browser window, whose scroll position the gallery's virtualizer follows so the page scrolls as one, rather than an inner scroll area.

<!-- coinagerie:end -->
