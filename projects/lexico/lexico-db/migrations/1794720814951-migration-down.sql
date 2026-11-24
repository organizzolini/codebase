SET lock_timeout = '10s';

SET statement_timeout = '5min';

DROP INDEX "lexico"."texts_material_trigram_index";

DROP INDEX "lexico"."texts_inscription_type_trigram_index";

DROP INDEX "lexico"."texts_find_spot_trigram_index";

DROP INDEX "lexico"."texts_province_trigram_index";

DROP INDEX "lexico"."texts_editors_trigram_index";

DROP INDEX "lexico"."texts_edition_trigram_index";

DROP INDEX "lexico"."texts_title_trigram_index";

DROP INDEX "lexico"."authors_full_name_trigram_index";

DROP INDEX "lexico"."authors_name_trigram_index";

DROP INDEX "lexico"."IDX_4988c2efe1fb00bbb29bf6f8e7";

DROP INDEX "lexico"."IDX_2a0c27529d76d715b395786a7a";

DROP INDEX "lexico"."IDX_e7b3b7c7b6ff09bb28cb7df2a1";

DROP INDEX "lexico"."IDX_9039f9c2ff6a85fd10615a152e";

DROP INDEX "lexico"."IDX_f0631396c58b440823c119cb98";

DROP INDEX "lexico"."IDX_c9e6b3e10ab5b5ffedb7c9952d";

DROP INDEX "lexico"."IDX_9f0177268a4ea307a6c10b49e7";

DROP INDEX "lexico"."IDX_1d44ec83bfa5295cf65e838ed4";

DROP INDEX "lexico"."IDX_fa96ab69770596a5b785418114";

DROP INDEX "lexico"."IDX_b113252bc909a617be507428f4";

DROP INDEX "lexico"."IDX_6c64b3df09e6774438aeca7e0b";

DROP INDEX "lexico"."IDX_0c3216bb9e5fc49eeac82eadba";

DROP INDEX "lexico"."IDX_9c72846ba6465ecf5c64889b7d";

DROP INDEX "lexico"."IDX_c9bb82bf46817f61196947a664";

COMMENT ON COLUMN "texts"."word_count" IS 'The number of word Tokens in the text';

ALTER TABLE "texts" DROP COLUMN "word_count";

COMMENT ON COLUMN "texts"."work_identifier" IS 'The standard work identifier, such as the CTS URN';

ALTER TABLE "texts" DROP COLUMN "work_identifier";

COMMENT ON COLUMN "texts"."start_year" IS 'The year an inscription is dated to, negative for BCE, null otherwise';

ALTER TABLE "texts" DROP COLUMN "start_year";

COMMENT ON COLUMN "texts"."recognised_word_count" IS 'The number of Tokens linked to a dictionary Word';

ALTER TABLE "texts" DROP COLUMN "recognised_word_count";

COMMENT ON COLUMN "texts"."publisher" IS 'The publisher of the source edition';

ALTER TABLE "texts" DROP COLUMN "publisher";

COMMENT ON COLUMN "texts"."province" IS 'The province an inscription was found in, null otherwise';

ALTER TABLE "texts" DROP COLUMN "province";

COMMENT ON COLUMN "texts"."print_year" IS 'The year the edition was printed';

ALTER TABLE "texts" DROP COLUMN "print_year";

COMMENT ON COLUMN "texts"."material" IS 'The material of an inscription, null otherwise';

ALTER TABLE "texts" DROP COLUMN "material";

COMMENT ON COLUMN "texts"."line_count" IS 'The number of lines in the text';

ALTER TABLE "texts" DROP COLUMN "line_count";

COMMENT ON COLUMN "texts"."inscription_type" IS 'The EDCS type of an inscription, null otherwise';

ALTER TABLE "texts" DROP COLUMN "inscription_type";

COMMENT ON COLUMN "texts"."find_spot" IS 'The find-spot of an inscription, null otherwise';

ALTER TABLE "texts" DROP COLUMN "find_spot";

COMMENT ON COLUMN "texts"."end_year" IS 'The year an inscription is dated from, negative for BCE, null otherwise';

ALTER TABLE "texts" DROP COLUMN "end_year";

COMMENT ON COLUMN "texts"."editors" IS 'The editors named by the source edition';

ALTER TABLE "texts" DROP COLUMN "editors";

COMMENT ON COLUMN "texts"."edition" IS 'The edition''s name or series, where the source gives one';

ALTER TABLE "texts" DROP COLUMN "edition";

COMMENT ON COLUMN "texts"."collection" IS 'The source the text was ingested from';

ALTER TABLE "texts" DROP COLUMN "collection";

DROP TYPE "lexico"."texts_collection_enum";

COMMENT ON COLUMN "authors"."end_year" IS 'The year the author died, or their floruit end, negative for BCE';

ALTER TABLE "authors" DROP COLUMN "end_year";

COMMENT ON COLUMN "authors"."start_year" IS 'The year the author was born, or their floruit, negative for BCE';

ALTER TABLE "authors" DROP COLUMN "start_year";

COMMENT ON COLUMN "authors"."full_name" IS 'The author''s full name, where the source gives one';

ALTER TABLE "authors" DROP COLUMN "full_name";

COMMENT ON COLUMN "authors"."era" IS 'The period the author belongs to, derived from startYear and endYear';

ALTER TABLE "authors" DROP COLUMN "era";

DROP TYPE "lexico"."authors_era_enum";
