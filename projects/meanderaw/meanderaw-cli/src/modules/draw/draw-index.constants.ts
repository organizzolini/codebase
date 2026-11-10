// `nav` is the HTML sectioning element the jump list is wrapped in, not an
// abbreviation of "navigation" this file chose to write.
// cspell:ignore nav

// ♟️ Constants

/**
 * How many times each row's tile repeats along its band. Six is enough for the eye to read the period.
 */
export const BAND_REPEAT_COUNT = 6;

/**
 * Prefixed onto a row's own primary key to name the `<defs>` entry its band
 * references once per repeat.
 *
 * Every band on the page shares one document, so the identifier has to be
 * unique across the whole corpus rather than within one figure — a row's
 * primary key already is, and the prefix keeps it from colliding with any
 * other kind of identifier the page might grow.
 */

/**
 * The page's stylesheet. `.art > svg` is the band alone, so nested repeats keep their placed size.
 */
export const PAGE_STYLES = `
:root { color-scheme: light dark; }
body { font: 13px/1.4 system-ui, sans-serif; margin: 24px; }
h1 { font-size: 18px; margin: 0 0 4px; }
h2 { font-family: ui-monospace, monospace; font-size: 14px; margin: 0 0 2px; }
p.count { color: color-mix(in srgb, currentColor 60%, transparent); margin: 0 0 16px; }
nav ul { columns: 4 280px; list-style: none; margin: 0 0 32px; padding: 0; }
nav li { break-inside: avoid; font-family: ui-monospace, monospace; }
nav span { color: color-mix(in srgb, currentColor 55%, transparent); }
section { margin: 0 0 40px; }
.grid { display: grid; gap: 20px 16px; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
figure { margin: 0; }
.art { background: #fff; border: 1px solid color-mix(in srgb, currentColor 20%, transparent); display: block; overflow: hidden; padding: 8px; }
.art > svg { display: block; height: auto; max-width: 100%; }
figcaption { font-family: ui-monospace, monospace; font-size: 11px; margin-top: 6px; word-break: break-all; }
`;

// 🚨 Errors

/**
 * Thrown instead of interpolating a row's `svg` field into the page when it
 * does not look like a complete inline SVG document.
 *
 * `DrawIndexService` embeds that field verbatim rather than escaping it — it
 * has to render as markup, not as literal text — so an unescaped field is
 * exactly where a malformed or crafted string could break the surrounding
 * page structure. Every real row's `svg` comes from
 * `DrawingService`, which always emits a well-formed
 * `<svg>...</svg>` document, so this is a fail-loud guard against a corrupt
 * row rather than a sanitizer: refusing the whole build is safer than
 * emitting a page whose markup a bad row could have torn open.
 */
