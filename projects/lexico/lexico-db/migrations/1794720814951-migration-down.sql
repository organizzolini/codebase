set lock_timeout = '10s';

set statement_timeout = '5min';

drop index lexico.texts_material_trigram_index;

drop index lexico.texts_inscription_type_trigram_index;

drop index lexico.texts_find_spot_trigram_index;

drop index lexico.texts_province_trigram_index;

drop index lexico.texts_editors_trigram_index;

drop index lexico.texts_edition_trigram_index;

drop index lexico.texts_title_trigram_index;

drop index lexico.authors_full_name_trigram_index;

drop index lexico.authors_name_trigram_index;

drop index lexico."IDX_4988c2efe1fb00bbb29bf6f8e7";

drop index lexico."IDX_2a0c27529d76d715b395786a7a";

drop index lexico."IDX_e7b3b7c7b6ff09bb28cb7df2a1";

drop index lexico."IDX_9039f9c2ff6a85fd10615a152e";

drop index lexico."IDX_f0631396c58b440823c119cb98";

drop index lexico."IDX_c9e6b3e10ab5b5ffedb7c9952d";

drop index lexico."IDX_9f0177268a4ea307a6c10b49e7";

drop index lexico."IDX_1d44ec83bfa5295cf65e838ed4";

drop index lexico."IDX_fa96ab69770596a5b785418114";

drop index lexico."IDX_b113252bc909a617be507428f4";

drop index lexico."IDX_6c64b3df09e6774438aeca7e0b";

drop index lexico."IDX_0c3216bb9e5fc49eeac82eadba";

drop index lexico."IDX_9c72846ba6465ecf5c64889b7d";

drop index lexico."IDX_c9bb82bf46817f61196947a664";

comment on column texts.word_count is 'The number of word Tokens in the text';

alter table texts drop column word_count;

comment on column texts.work_identifier is 'The standard work identifier, such as the CTS URN';

alter table texts drop column work_identifier;

comment on column texts.start_year is 'The year an inscription is dated to, negative for BCE, null otherwise';

alter table texts drop column start_year;

comment on column texts.recognised_word_count is 'The number of Tokens linked to a dictionary Word';

alter table texts drop column recognised_word_count;

comment on column texts.publisher is 'The publisher of the source edition';

alter table texts drop column publisher;

comment on column texts.province is 'The province an inscription was found in, null otherwise';

alter table texts drop column province;

comment on column texts.print_year is 'The year the edition was printed';

alter table texts drop column print_year;

comment on column texts.material is 'The material of an inscription, null otherwise';

alter table texts drop column material;

comment on column texts.line_count is 'The number of lines in the text';

alter table texts drop column line_count;

comment on column texts.inscription_type is 'The EDCS type of an inscription, null otherwise';

alter table texts drop column inscription_type;

comment on column texts.find_spot is 'The find-spot of an inscription, null otherwise';

alter table texts drop column find_spot;

comment on column texts.end_year is 'The year an inscription is dated from, negative for BCE, null otherwise';

alter table texts drop column end_year;

comment on column texts.editors is 'The editors named by the source edition';

alter table texts drop column editors;

comment on column texts.edition is 'The edition''s name or series, where the source gives one';

alter table texts drop column edition;

comment on column texts.collection is 'The source the text was ingested from';

alter table texts drop column collection;

drop type lexico.texts_collection_enum;

comment on column authors.end_year is 'The year the author died, or their floruit end, negative for BCE';

alter table authors drop column end_year;

comment on column authors.start_year is 'The year the author was born, or their floruit, negative for BCE';

alter table authors drop column start_year;

comment on column authors.full_name is 'The author''s full name, where the source gives one';

alter table authors drop column full_name;

comment on column authors.era is 'The period the author belongs to, derived from startYear and endYear';

alter table authors drop column era;

drop type lexico.authors_era_enum;
