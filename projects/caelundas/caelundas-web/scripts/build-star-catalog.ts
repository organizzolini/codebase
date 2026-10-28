import { readFileSync, writeFileSync } from "node:fs";

// Trims the HYG star database (v4.1) to the catalog the night sky reads, a
// JSON array of [raHours, decDegrees, magnitude, colorIndex] rows, brightest
// first, J2000. HYG is CC BY-SA 4.0 (https://github.com/astronexus/HYG-Database),
// so the trimmed file is a derived work under the same license.
//
// Usage: node scripts/build-star-catalog.ts <hyg.csv> <catalog.json>
//        [maximumMagnitude] [minimumDeclination]
//
// The view faces north, so the far southern sky never appears and is dropped.
// A newer HYG release needs its column names checked first.

const COLUMNS = ["id", "ra", "dec", "mag", "ci"] as const;
const MISSING_COLOR_INDEX = 0.6;

const [source, destination, maximumArgument, minimumArgument] =
  process.argv.slice(2);

if (source === undefined || destination === undefined) {
  throw new Error("Usage: build-star-catalog.ts <source.csv> <output.json>");
}

const maximumMagnitude = Number(maximumArgument ?? 6.5);
const minimumDeclination = Number(minimumArgument ?? -30);

/**
 * Rounds to a number of decimal places.
 */
function round(value: number, places: number): number {
  return Number(value.toFixed(places));
}

/**
 * Splits one CSV line into fields, honouring double-quoted fields.
 */
function splitLine(line: string): string[] {
  const fields: string[] = [];
  let field = "";
  let quoted = false;

  for (const character of line) {
    if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += character;
    }
  }

  return [...fields, field];
}

const [header, ...lines] = readFileSync(source, "utf8").split(/\r?\n/);
const names = splitLine(header ?? "");
const positions = COLUMNS.map((column) => names.indexOf(column));

if (positions.includes(-1)) {
  throw new Error(`${source} lacks one of the columns ${COLUMNS.join(", ")}`);
}

const rows: [number, number, number, number][] = [];

for (const line of lines.filter(Boolean)) {
  const fields = splitLine(line);
  const [id, ra, dec, mag, ci] = positions.map((index) => fields[index] ?? "");
  const rightAscension = Number.parseFloat(ra ?? "");
  const declination = Number.parseFloat(dec ?? "");
  const magnitude = Number.parseFloat(mag ?? "");
  const colorIndex =
    ci === "" ? MISSING_COLOR_INDEX : Number.parseFloat(ci ?? "");

  // Row 0 is the Sun.
  if (
    id === "0" ||
    [rightAscension, declination, magnitude].some((value) =>
      Number.isNaN(value),
    )
  ) {
    continue;
  }
  if (magnitude > maximumMagnitude || declination < minimumDeclination) {
    continue;
  }

  rows.push([
    round(rightAscension, 4),
    round(declination, 3),
    round(magnitude, 1),
    round(Number.isNaN(colorIndex) ? MISSING_COLOR_INDEX : colorIndex, 2),
  ]);
}

rows.sort((first, second) => first[2] - second[2]);
writeFileSync(
  destination,
  `[\n${rows.map((row) => `  [${row.join(", ")}]`).join(",\n")}\n]\n`,
);
console.log(`${rows.length} stars written to ${destination}`);
