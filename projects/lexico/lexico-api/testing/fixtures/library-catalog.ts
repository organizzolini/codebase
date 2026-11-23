/* cspell:words Fasti Sententiae Hagendorn Maro Pompeii Syrus Mynors Tarraco Tarraconensis Narbonensis carmina Carmina heroides Heroides tarraconensis */

import { Author, Text, textCollection } from "@codebase/lexico-db";

import type { DatabaseTestingModule } from "@codebase/persistence/testing";

/** Inscriptions the EDCS author's province holds; more than one card carries. */
export const LIBRARY_INSCRIPTION_COUNT = 52;

/** How many numbered books the seeded Fasti holds. */
export const LIBRARY_FASTI_BOOK_COUNT = 12;

/** Seeds a library whose attributes the library query searches, filters, and pages. */
export async function seedLibraryCatalog(
  database: DatabaseTestingModule,
): Promise<void> {
  const authors = database.repository(Author);
  const texts = database.repository(Text);

  const vergil = await authors.save(
    authors.create({
      endYear: -19,
      era: "Classical",
      fullName: "Publius Vergilius Maro",
      name: "Vergil",
      slug: "vergil",
      startYear: -70,
    }),
  );
  const caesar = await authors.save(
    authors.create({
      endYear: -44,
      era: "Classical",
      fullName: "Gaius Julius Caesar",
      name: "Caesar",
      slug: "caesar",
      startYear: -100,
    }),
  );
  const catullus = await authors.save(
    authors.create({
      endYear: -54,
      era: "Classical",
      fullName: "Gaius Valerius Catullus",
      name: "Catullus",
      slug: "catullus",
      startYear: -84,
    }),
  );
  const ovid = await authors.save(
    authors.create({
      endYear: 17,
      era: "Imperial",
      fullName: "Publius Ovidius Naso",
      name: "Ovid",
      slug: "ovid",
      startYear: -43,
    }),
  );
  const edcs = await authors.save(
    authors.create({ name: "Roman Inscriptions", slug: "roman-inscriptions" }),
  );

  const aeneid = await texts.save(
    texts.create({
      author: vergil,
      collection: textCollection.perseus,
      edition: "Oxford Classical Texts",
      editors: "R. A. B. Mynors",
      lineCount: 3,
      printYear: 1969,
      publisher: "Oxford University Press",
      slug: "vergil/aeneid",
      title: "Aeneid",
      type: "corpus",
      wordCount: 22,
      workIdentifier: "urn:cts:latinLit:phi0690.phi003",
    }),
  );
  await texts.save(
    texts.create({
      author: vergil,
      collection: textCollection.perseus,
      parentText: aeneid,
      slug: "vergil/aeneid/1",
      title: "Book I",
      type: "book",
    }),
  );
  await texts.save(
    texts.create({
      author: vergil,
      collection: textCollection.perseus,
      slug: "vergil/eclogues",
      title: "Eclogues",
      type: "text",
    }),
  );
  await texts.save(
    texts.create({
      author: vergil,
      collection: textCollection.csel,
      edition: "CSEL 12",
      editors: "Ed. Hagendorn",
      slug: "vergil/eclogues-csel",
      title: "Eclogues",
      type: "text",
    }),
  );
  await texts.save(
    texts.create({
      author: catullus,
      collection: textCollection.theLatinLibrary,
      slug: "catullus/carmina",
      title: "Carmina",
      type: "text",
    }),
  );
  const lost = await texts.save(
    texts.create({
      author: catullus,
      collection: textCollection.perseus,
      slug: "catullus/lost",
      title: "Lost Carmen",
      type: "text",
    }),
  );
  await texts.softDelete(lost.id);
  await texts.save(
    texts.create({
      author: caesar,
      collection: textCollection.theLatinLibrary,
      slug: "caesar/de-bello-gallico",
      title: "De Bello Gallico",
      type: "text",
    }),
  );
  await texts.save(
    texts.create({
      author: caesar,
      collection: textCollection.theLatinLibrary,
      slug: "caesar/publius-syrus",
      title: "Publius Syrus Sententiae",
      type: "text",
    }),
  );
  const fasti = await texts.save(
    texts.create({
      author: ovid,
      collection: textCollection.theLatinLibrary,
      findSpot: "Pompeii",
      slug: "ovid/fasti",
      title: "Fasti",
      type: "text",
    }),
  );
  await texts.save(
    Array.from({ length: LIBRARY_FASTI_BOOK_COUNT }, (_, index) =>
      texts.create({
        author: ovid,
        collection: textCollection.theLatinLibrary,
        parentText: fasti,
        slug: `ovid/fasti/book-${String(index + 1)}`,
        title: `Book ${String(index + 1)}`,
        type: "text",
      }),
    ),
  );
  await texts.save(
    texts.create({
      author: ovid,
      collection: textCollection.theLatinLibrary,
      slug: "ovid/heroides",
      title: "Heroides",
      type: "text",
    }),
  );

  const province = await texts.save(
    texts.create({
      author: edcs,
      collection: textCollection.edcs,
      slug: "roman-inscriptions/tarraconensis",
      title: "Tarraconensis",
      type: "book",
    }),
  );
  const inscriptions = Array.from(
    { length: LIBRARY_INSCRIPTION_COUNT },
    (_, index) => {
      const id = `HD${String(index + 1).padStart(6, "0")}`;
      return texts.create({
        author: edcs,
        collection: textCollection.edcs,
        endYear: 200,
        findSpot: "Tarraco",
        inscriptionType: "tombstone",
        material: "marble",
        parentText: province,
        province: "Hispania Tarraconensis",
        slug: `roman-inscriptions/tarraconensis/${id.toLowerCase()}`,
        startYear: 100,
        title: id,
        type: "text",
      });
    },
  );
  await texts.save(inscriptions);

  // Two inscriptions of other provinces, types, and materials, dated outside
  // the main set's range, so the facets list more than one value of each.
  await texts.save(
    ["milestone", "altar"].map((inscriptionType, index) =>
      texts.create({
        author: edcs,
        collection: textCollection.edcs,
        endYear: 310,
        inscriptionType,
        material: "limestone",
        parentText: province,
        province: "Gallia Narbonensis",
        slug: `roman-inscriptions/tarraconensis/hd90000${index + 1}`,
        startYear: 300,
        title: `HD90000${index + 1}`,
        type: "text",
      }),
    ),
  );
}
