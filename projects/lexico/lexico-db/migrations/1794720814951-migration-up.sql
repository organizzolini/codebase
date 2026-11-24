SET lock_timeout = '10s';

SET statement_timeout = '5min';

CREATE TYPE "lexico"."authors_era_enum" AS ENUM('Archaic', 'Classical', 'Imperial', 'Late', 'Medieval', 'Neo-Latin');

ALTER TABLE "authors" ADD "era" "lexico"."authors_era_enum";

COMMENT ON COLUMN "authors"."era" IS 'The period the author belongs to, derived from startYear and endYear';

ALTER TABLE "authors" ADD "full_name" character varying(128);

COMMENT ON COLUMN "authors"."full_name" IS 'The author''s full name, where the source gives one';

ALTER TABLE "authors" ADD "start_year" bigint;

COMMENT ON COLUMN "authors"."start_year" IS 'The year the author was born, or their floruit, negative for BCE';

ALTER TABLE "authors" ADD "end_year" bigint;

COMMENT ON COLUMN "authors"."end_year" IS 'The year the author died, or their floruit end, negative for BCE';

CREATE TYPE "lexico"."texts_collection_enum" AS ENUM('CSEL', 'EDCS', 'Perseus', 'The Latin Library');

ALTER TABLE "texts" ADD "collection" "lexico"."texts_collection_enum";

COMMENT ON COLUMN "texts"."collection" IS 'The source the text was ingested from';

ALTER TABLE "texts" ADD "edition" character varying;

COMMENT ON COLUMN "texts"."edition" IS 'The edition''s name or series, where the source gives one';

ALTER TABLE "texts" ADD "editors" character varying;

COMMENT ON COLUMN "texts"."editors" IS 'The editors named by the source edition';

ALTER TABLE "texts" ADD "end_year" bigint;

COMMENT ON COLUMN "texts"."end_year" IS 'The year an inscription is dated from, negative for BCE, null otherwise';

ALTER TABLE "texts" ADD "find_spot" character varying;

COMMENT ON COLUMN "texts"."find_spot" IS 'The find-spot of an inscription, null otherwise';

ALTER TABLE "texts" ADD "inscription_type" character varying;

COMMENT ON COLUMN "texts"."inscription_type" IS 'The EDCS type of an inscription, null otherwise';

ALTER TABLE "texts" ADD "line_count" bigint;

COMMENT ON COLUMN "texts"."line_count" IS 'The number of lines in the text';

ALTER TABLE "texts" ADD "material" character varying;

COMMENT ON COLUMN "texts"."material" IS 'The material of an inscription, null otherwise';

ALTER TABLE "texts" ADD "print_year" bigint;

COMMENT ON COLUMN "texts"."print_year" IS 'The year the edition was printed';

ALTER TABLE "texts" ADD "province" character varying;

COMMENT ON COLUMN "texts"."province" IS 'The province an inscription was found in, null otherwise';

ALTER TABLE "texts" ADD "publisher" character varying;

COMMENT ON COLUMN "texts"."publisher" IS 'The publisher of the source edition';

ALTER TABLE "texts" ADD "recognised_word_count" bigint;

COMMENT ON COLUMN "texts"."recognised_word_count" IS 'The number of Tokens linked to a dictionary Word';

ALTER TABLE "texts" ADD "start_year" bigint;

COMMENT ON COLUMN "texts"."start_year" IS 'The year an inscription is dated to, negative for BCE, null otherwise';

ALTER TABLE "texts" ADD "work_identifier" character varying;

COMMENT ON COLUMN "texts"."work_identifier" IS 'The standard work identifier, such as the CTS URN';

ALTER TABLE "texts" ADD "word_count" bigint;

COMMENT ON COLUMN "texts"."word_count" IS 'The number of word Tokens in the text';

CREATE INDEX "IDX_c9bb82bf46817f61196947a664" ON "authors"  ("era");

CREATE INDEX "IDX_9c72846ba6465ecf5c64889b7d" ON "authors"  ("start_year");

CREATE INDEX "IDX_0c3216bb9e5fc49eeac82eadba" ON "authors"  ("end_year");

CREATE INDEX "IDX_6c64b3df09e6774438aeca7e0b" ON "authors"  ("name");

CREATE INDEX "IDX_b113252bc909a617be507428f4" ON "texts"  ("collection");

CREATE INDEX "IDX_fa96ab69770596a5b785418114" ON "texts"  ("end_year");

CREATE INDEX "IDX_1d44ec83bfa5295cf65e838ed4" ON "texts"  ("inscription_type");

CREATE INDEX "IDX_9f0177268a4ea307a6c10b49e7" ON "texts"  ("line_count");

CREATE INDEX "IDX_c9e6b3e10ab5b5ffedb7c9952d" ON "texts"  ("material");

CREATE INDEX "IDX_f0631396c58b440823c119cb98" ON "texts"  ("print_year");

CREATE INDEX "IDX_9039f9c2ff6a85fd10615a152e" ON "texts"  ("province");

CREATE INDEX "IDX_e7b3b7c7b6ff09bb28cb7df2a1" ON "texts"  ("recognised_word_count");

CREATE INDEX "IDX_2a0c27529d76d715b395786a7a" ON "texts"  ("start_year");

CREATE INDEX "IDX_4988c2efe1fb00bbb29bf6f8e7" ON "texts"  ("word_count");

CREATE INDEX "authors_name_trigram_index" ON "lexico"."authors" USING gin (LOWER("name") gin_trgm_ops);

CREATE INDEX "authors_full_name_trigram_index" ON "lexico"."authors" USING gin (LOWER("full_name") gin_trgm_ops);

CREATE INDEX "texts_title_trigram_index" ON "lexico"."texts" USING gin (LOWER("title") gin_trgm_ops);

CREATE INDEX "texts_edition_trigram_index" ON "lexico"."texts" USING gin (LOWER("edition") gin_trgm_ops);

CREATE INDEX "texts_editors_trigram_index" ON "lexico"."texts" USING gin (LOWER("editors") gin_trgm_ops);

CREATE INDEX "texts_province_trigram_index" ON "lexico"."texts" USING gin (LOWER("province") gin_trgm_ops);

CREATE INDEX "texts_find_spot_trigram_index" ON "lexico"."texts" USING gin (LOWER("find_spot") gin_trgm_ops);

CREATE INDEX "texts_inscription_type_trigram_index" ON "lexico"."texts" USING gin (LOWER("inscription_type") gin_trgm_ops);

CREATE INDEX "texts_material_trigram_index" ON "lexico"."texts" USING gin (LOWER("material") gin_trgm_ops);
