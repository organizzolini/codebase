set lock_timeout = '10s';

set statement_timeout = '5min';

drop index caelundas.calendar_event_facts_calendar_event_id;

drop index caelundas.calendar_event_facts_local_day;

drop index caelundas.calendar_event_facts_local_day_hour;

drop index caelundas.calendar_event_facts_local_weekday;

drop index caelundas.calendar_event_facts_start;

drop index caelundas.calendar_event_facts_name_day;

drop index caelundas.calendar_event_facts_extent;

drop index caelundas.calendar_event_facts_tag_ids;

drop index caelundas.calendar_event_facts_direct_tag_ids;

drop index caelundas.calendar_event_day_tag_rollups_day_tag;

drop index caelundas.calendar_event_day_tag_rollups_tag_day;

drop index caelundas.calendar_event_day_tag_rollups_root_day;

drop index caelundas.calendar_event_day_tag_rollups_depth_day;

drop index caelundas.calendar_event_day_tag_rollups_month_tag;

drop index caelundas.calendar_event_day_tag_rollups_week_tag;

drop index caelundas.calendar_event_day_tag_rollups_quarter_tag;

drop index caelundas.calendar_event_day_tag_rollups_year_tag;

drop index caelundas.calendar_event_day_tag_name_rollups_day_tag_name;

drop index caelundas.calendar_event_day_tag_name_rollups_tag_day_name;

drop index caelundas.calendar_event_day_tag_name_rollups_root_day_name;

drop index caelundas.calendar_event_day_tag_name_rollups_name_day;

drop index caelundas.calendar_event_day_rollups_day;

drop index caelundas.calendar_event_day_rollups_month;

drop index caelundas.calendar_event_day_rollups_week;

drop index caelundas.calendar_event_day_rollups_quarter;

drop index caelundas.calendar_event_day_rollups_year;

delete from caelundas.typeorm_metadata
where "type" = $1 and "name" = $2 and "schema" = $3;

drop materialized view calendar_event_day_rollups;

delete from caelundas.typeorm_metadata
where "type" = $1 and "name" = $2 and "schema" = $3;

drop materialized view calendar_event_day_tag_name_rollups;

delete from caelundas.typeorm_metadata
where "type" = $1 and "name" = $2 and "schema" = $3;

drop materialized view calendar_event_day_tag_rollups;

delete from caelundas.typeorm_metadata
where "type" = $1 and "name" = $2 and "schema" = $3;

drop materialized view calendar_event_facts;

drop index caelundas.tag_nodes_root_depth;

drop index caelundas.tag_nodes_path;

drop index caelundas.calendar_events_end;

drop index caelundas.calendar_events_location_start;

drop index caelundas.calendar_event_tag_nodes_path_event;

drop index caelundas.calendar_event_tag_nodes_root_tag;

drop index caelundas.calendar_event_tag_nodes_direct_tag;
