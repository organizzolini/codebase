set lock_timeout = '10s';

set statement_timeout = '5min';

drop function window_events(timestamptz, timestamptz);

drop index caelundas.calendar_event_tag_sets_calendar_event_id;

drop index caelundas.calendar_event_tag_sets_tag_ids;

drop index caelundas.calendar_event_tag_sets_ancestor_tag_ids;

delete from caelundas.typeorm_metadata
where "type" = $1 and "name" = $2 and "schema" = $3;

drop materialized view calendar_event_tag_sets;

drop index caelundas.tag_closures_descendant_id;

drop index caelundas.tag_closures_ancestor_id_descendant_id;

delete from caelundas.typeorm_metadata
where "type" = $1 and "name" = $2 and "schema" = $3;

drop materialized view tag_closures;

drop trigger tags_root_guard on tags;

drop function tags_root_guard();

drop trigger tag_edges_guard on tag_edges;

drop function tag_edges_guard();

drop function expand_keys(text[]);

drop function expand_tags(uuid[]);

drop table calendar_event_facts;

alter table group_dimensions drop constraint "FK_9dc7962e1301aad95b372b90ba2";

alter table group_dimensions drop constraint "FK_66b36374e5fb47d7b36595e61de";

alter table dimension_edges drop constraint "FK_fe1fefe391a02371a9fadf7fd71";

alter table dimension_edges drop constraint "FK_2b1885a778ae03ebef163bd6b52";

alter table filters drop constraint "FK_28625f33a212f5719317e3e1c46";

alter table filters drop constraint "FK_d32d15579026cca686fe6855ecb";

alter table filters drop constraint "FK_c2d12bbd0b40be55bb870aa49e4";

drop index caelundas.group_dimensions_group_id_dimension_id;

drop table group_dimensions;

drop index caelundas.dimension_edges_target_node;

drop table dimension_edges;

drop index caelundas.dimensions_slug;

drop table dimensions;

drop index caelundas.filters_key;

drop index caelundas.filters_parent_id;

drop table filters;

drop index caelundas.groups_slug;

drop table "groups";

alter table tag_edges drop constraint "FK_4ebc4574b20762da23f596a8303";

alter table tag_edges drop constraint "FK_57008c88a60a908ca4b8bbf5807";

alter table metric_expressions_closure drop constraint "FK_4c8cc112ad12a06cebe2d12f45e";

alter table metric_expressions_closure drop constraint "FK_4dd9ee9dd9e246b4cbe04f14e7c";

alter table constellation_edges drop constraint "FK_a7954f4db381f98e1b7a734b1c5";

alter table constellation_edges drop constraint "FK_0d6cd1241fe640015005c630a03";

alter table constellation_edges drop constraint "FK_037fc3e87b256f309e5cf499cde";

alter table metric_expressions drop constraint "FK_eebfca0101b6bb9b9f3ec2cc108";

alter table metric_expressions drop constraint "FK_99e1eaba42385dcb9548092b6a8";

alter table metric_expressions drop constraint "FK_d6378a0ab39be61f7ef0066c09a";

alter table metrics drop constraint "FK_8661e41337b8db4934b3a1e62ec";

alter table calendar_event_tags drop constraint "FK_6f0520ed07726fe729a882a6928";

alter table calendar_event_tags drop constraint "FK_146237171c57f84a0ff62036294";

drop index caelundas."IDX_4c8cc112ad12a06cebe2d12f45";

drop index caelundas."IDX_4dd9ee9dd9e246b4cbe04f14e7";

drop table metric_expressions_closure;

drop index caelundas.tag_edges_source_node;

drop index caelundas.tag_edges_target_node;

drop table tag_edges;

drop table stars;

drop table constellations;

drop index caelundas.constellation_edges_source_node;

drop index caelundas.constellation_edges_target_node;

drop table constellation_edges;

drop index caelundas.metric_expressions_parent_position;

drop table metric_expressions;

drop index caelundas.metrics_slug;

drop index caelundas.metrics_expression_id;

drop table metrics;

drop index caelundas.measures_slug;

drop table measures;

drop index caelundas.calendar_event_tags_tag_id_calendar_event_id;

drop table calendar_event_tags;

drop index caelundas.calendar_events_start_end;

drop index caelundas.calendar_events_end;

drop index caelundas.calendar_events_start_local_day;

drop index caelundas.calendar_events_location_start;

drop table calendar_events;

delete from caelundas.typeorm_metadata
where "type" = $1 and "name" = $2 and "database" = current_database() and "schema" = $3 and "table" = $4;

delete from caelundas.typeorm_metadata
where "type" = $1 and "name" = $2 and "database" = current_database() and "schema" = $3 and "table" = $4;

delete from caelundas.typeorm_metadata
where "type" = $1 and "name" = $2 and "database" = current_database() and "schema" = $3 and "table" = $4;

drop index caelundas.tags_slug;

drop table tags;
