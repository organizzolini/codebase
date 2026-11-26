set lock_timeout = '10s';

set statement_timeout = '5min';

alter role caelundas_username reset search_path;

delete from caelundas.typeorm_metadata
where "type" = $1 and "name" = $2 and "schema" = $3;

drop view calendar_event_derived_times;

drop table caelundas.typeorm_metadata;

alter table tags_closure drop constraint "FK_8a4bf589d19e5060d7ccbf1fd51";

alter table tags_closure drop constraint "FK_3f3680694135907038de253a57e";

alter table constellation_edges drop constraint "FK_b82df4a773517d7ddf1b8b8df14";

alter table constellation_edges drop constraint "FK_d952356fc9daa4133c753105b3c";

alter table constellation_edges drop constraint "FK_04d68e2ee86feb8798df9881158";

alter table calendar_event_tags drop constraint "FK_6f0520ed07726fe729a882a6928";

alter table calendar_event_tags drop constraint "FK_146237171c57f84a0ff62036294";

alter table tags drop constraint "FK_bd19ddcde86ca1882599dbace11";

drop index caelundas."IDX_8a4bf589d19e5060d7ccbf1fd5";

drop index caelundas."IDX_3f3680694135907038de253a57";

drop table tags_closure;

drop table tag_nodes;

drop index caelundas.constellation_edges_from_hip;

drop index caelundas.constellation_edges_to_hip;

drop table constellation_edges;

drop table stars;

drop table constellations;

drop index caelundas.calendar_event_tags_tag_id_calendar_event_id;

drop table calendar_event_tags;

drop index caelundas.tags_sibling_name;

drop index caelundas.tags_root_name;

drop table tags;

drop index caelundas.calendar_events_start_end;

drop table calendar_events;

drop index caelundas.calendar_event_tag_nodes_event;

drop index caelundas.calendar_event_tag_nodes_tag;

drop table calendar_event_tag_nodes;
