set lock_timeout = '10s';

set statement_timeout = '5min';

create type lexico.authors_era_enum as enum ('Archaic', 'Classical', 'Imperial', 'Late', 'Medieval', 'Neo-Latin');

alter table authors add era lexico.authors_era_enum;

comment on column authors.era is 'The period the author belongs to, derived from startYear and endYear';

alter table authors add full_name character varying(128);

comment on column authors.full_name is 'The author''s full name, where the source gives one';

alter table authors add start_year bigint;

comment on column authors.start_year is 'The year the author was born, or their floruit, negative for BCE';

alter table authors add end_year bigint;

comment on column authors.end_year is 'The year the author died, or their floruit end, negative for BCE';

create type lexico.texts_collection_enum as enum ('CSEL', 'EDCS', 'Perseus', 'The Latin Library');

alter table texts add collection lexico.texts_collection_enum;

comment on column texts.collection is 'The source the text was ingested from';

alter table texts add edition character varying;

comment on column texts.edition is 'The edition''s name or series, where the source gives one';

alter table texts add editors character varying;

comment on column texts.editors is 'The editors named by the source edition';

alter table texts add end_year bigint;

comment on column texts.end_year is 'The year an inscription is dated from, negative for BCE, null otherwise';

alter table texts add find_spot character varying;

comment on column texts.find_spot is 'The find-spot of an inscription, null otherwise';

alter table texts add inscription_type character varying;

comment on column texts.inscription_type is 'The EDCS type of an inscription, null otherwise';

alter table texts add line_count bigint;

comment on column texts.line_count is 'The number of lines in the text';

alter table texts add material character varying;

comment on column texts.material is 'The material of an inscription, null otherwise';

alter table texts add print_year bigint;

comment on column texts.print_year is 'The year the edition was printed';

alter table texts add province character varying;

comment on column texts.province is 'The province an inscription was found in, null otherwise';

alter table texts add publisher character varying;

comment on column texts.publisher is 'The publisher of the source edition';

alter table texts add recognised_word_count bigint;

comment on column texts.recognised_word_count is 'The number of Tokens linked to a dictionary Word';

alter table texts add start_year bigint;

comment on column texts.start_year is 'The year an inscription is dated to, negative for BCE, null otherwise';

alter table texts add work_identifier character varying;

comment on column texts.work_identifier is 'The standard work identifier, such as the CTS URN';

alter table texts add word_count bigint;

comment on column texts.word_count is 'The number of word Tokens in the text';

create index "IDX_c9bb82bf46817f61196947a664" on authors (era);

create index "IDX_9c72846ba6465ecf5c64889b7d" on authors (start_year);

create index "IDX_0c3216bb9e5fc49eeac82eadba" on authors (end_year);

create index "IDX_6c64b3df09e6774438aeca7e0b" on authors ("name");

create index "IDX_b113252bc909a617be507428f4" on texts (collection);

create index "IDX_fa96ab69770596a5b785418114" on texts (end_year);

create index "IDX_1d44ec83bfa5295cf65e838ed4" on texts (inscription_type);

create index "IDX_9f0177268a4ea307a6c10b49e7" on texts (line_count);

create index "IDX_c9e6b3e10ab5b5ffedb7c9952d" on texts (material);

create index "IDX_f0631396c58b440823c119cb98" on texts (print_year);

create index "IDX_9039f9c2ff6a85fd10615a152e" on texts (province);

create index "IDX_e7b3b7c7b6ff09bb28cb7df2a1" on texts (recognised_word_count);

create index "IDX_2a0c27529d76d715b395786a7a" on texts (start_year);

create index "IDX_4988c2efe1fb00bbb29bf6f8e7" on texts (word_count);

create index authors_name_trigram_index on lexico.authors using gin (LOWER("name") gin_trgm_ops);

create index authors_full_name_trigram_index on lexico.authors using gin (LOWER(full_name) gin_trgm_ops);

create index texts_title_trigram_index on lexico.texts using gin (LOWER(title) gin_trgm_ops);

create index texts_edition_trigram_index on lexico.texts using gin (LOWER(edition) gin_trgm_ops);

create index texts_editors_trigram_index on lexico.texts using gin (LOWER(editors) gin_trgm_ops);

create index texts_province_trigram_index on lexico.texts using gin (LOWER(province) gin_trgm_ops);

create index texts_find_spot_trigram_index on lexico.texts using gin (LOWER(find_spot) gin_trgm_ops);

create index texts_inscription_type_trigram_index on lexico.texts using gin (
    LOWER(inscription_type) gin_trgm_ops
);

create index texts_material_trigram_index on lexico.texts using gin (LOWER(material) gin_trgm_ops);
