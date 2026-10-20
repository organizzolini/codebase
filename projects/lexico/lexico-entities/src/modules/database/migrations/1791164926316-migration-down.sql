set lock_timeout = '10s';
set statement_timeout = '5m';

alter table lexico.texts drop constraint "FK_c3172aa0d3cd4c678d44dae85cd";

alter table lexico.texts drop constraint "FK_275807c423ad9d0b569c2b9ca81";

alter table lexico."lines" drop constraint "FK_8ba479aa45ba1795a3f7e5c8d22";

alter table lexico."lines" drop constraint "FK_90ccb87cbd0fd6952e1aee42482";

alter table lexico.tokens drop constraint "FK_75ceaf795d390a0a045c4eccee1";

alter table lexico.tokens drop constraint "FK_4a94e9093c0191e7f01e0a2d02e";

alter table lexico.tokens drop constraint "FK_7b903b4a513daa0b4d4839d4cc3";

alter table lexico.tokens drop constraint "FK_784a19cd725470a3068fc62db39";

alter table lexico.word_lexemes drop constraint "FK_579999929ed6b899e769cd234ba";

alter table lexico.word_lexemes drop constraint "FK_643892e2709e1d49641fb965b82";

alter table lexico.word_forms drop constraint "FK_54256ad366638dd2243dcd88b25";

alter table lexico.word_forms drop constraint "FK_f19edc2c148cc8536b7bba7afa9";

alter table lexico.translations drop constraint "FK_03033925e968b7c9430896d55f8";

alter table lexico.pronunciations drop constraint "FK_ccf78e53911b7c121a65192c89d";

alter table lexico.principal_parts drop constraint "FK_95d23e3a9561dea102f7bf9325e";

alter table lexico.inflections drop constraint "FK_ebe1d473505c1ffc72c57d57731";

alter table lexico.forms drop constraint "FK_52ebb86789cf513c7fb44ab9a95";

comment on table lexico.authors is null;

drop table lexico.authors;

comment on table lexico.texts is null;

drop index lexico."IDX_c3172aa0d3cd4c678d44dae85c";

drop index lexico."IDX_275807c423ad9d0b569c2b9ca8";

drop table lexico.texts;

comment on table lexico."lines" is null;

drop index lexico."IDX_b2c6fef6d09c7cd7b3c92a5664";

drop index lexico."IDX_90ccb87cbd0fd6952e1aee4248";

drop table lexico."lines";

comment on table lexico.tokens is null;

drop index lexico."IDX_3e996c69e86e8b258ca8703166";

drop index lexico."IDX_49d4478795971e788f76d88330";

drop index lexico."IDX_75ceaf795d390a0a045c4eccee";

drop index lexico."IDX_b7c16a9e93dbe1c7e06542fd67";

drop index lexico."IDX_784a19cd725470a3068fc62db3";

drop table lexico.tokens;

comment on table lexico.words is null;

drop table lexico.words;

comment on table lexico.word_lexemes is null;

drop index lexico."IDX_3bfcf800c79bf43fa516db099d";

drop index lexico."IDX_579999929ed6b899e769cd234b";

drop index lexico."IDX_643892e2709e1d49641fb965b8";

drop table lexico.word_lexemes;

comment on table lexico.word_forms is null;

drop index lexico."IDX_a3450e22c3c4ab78e8f3f817c8";

drop index lexico."IDX_54256ad366638dd2243dcd88b2";

drop index lexico."IDX_f19edc2c148cc8536b7bba7afa";

drop table lexico.word_forms;

comment on table lexico.lexemes is null;

drop index lexico."IDX_f6fa0a0a5e197c157882f29c22";

drop index lexico."IDX_9204890678d644ba216ae116e3";

drop table lexico.lexemes;

drop type lexico.lexemes_part_of_speech_enum;

comment on table lexico.translations is null;

drop index lexico."IDX_9bc0b8d1aa44faf6ebfde865a2";

drop index lexico."IDX_03033925e968b7c9430896d55f";

drop index lexico."IDX_39313ab7fdf2f551cde7ef9611";

drop table lexico.translations;

delete from lexico.typeorm_metadata
where "type" = $1 and "name" = $2 and "database" = current_database() and "schema" = $3 and "table" = $4;

drop table lexico.typeorm_metadata;

comment on table lexico.pronunciations is null;

drop index lexico."IDX_81c176364b794cdcdf309a7a60";

drop index lexico."IDX_8fc53b1cbb6c5683b37f65a328";

drop index lexico."IDX_8de57efb4c40b209b2883c3d8c";

drop index lexico."IDX_ccf78e53911b7c121a65192c89";

drop table lexico.pronunciations;

drop type lexico.pronunciations_variant_enum;

comment on table lexico.principal_parts is null;

drop index lexico."IDX_95d23e3a9561dea102f7bf9325";

drop table lexico.principal_parts;

comment on table lexico.inflections is null;

drop index lexico."IDX_2f191c1029749f9f01b877e7f8";

drop table lexico.inflections;

drop type lexico.inflections_conjugation_enum;

drop type lexico.inflections_case_enum;

drop type lexico.inflections_gender_enum;

drop type lexico.inflections_adverb_type_enum;

drop type lexico.inflections_degree_enum;

drop type lexico.inflections_declension_enum;

comment on table lexico.forms is null;

drop index lexico."IDX_2bc463838022e5cc652df63c4a";

drop index lexico."IDX_52ebb86789cf513c7fb44ab9a9";

drop table lexico.forms;

drop type lexico.forms_voice_enum;

drop type lexico.forms_tense_enum;

drop type lexico.forms_person_enum;

drop type lexico.forms_mood_enum;

drop type lexico.forms_degree_enum;

drop type lexico.forms_number_enum;

drop type lexico.forms_gender_enum;

drop type lexico.forms_form_case_enum;
