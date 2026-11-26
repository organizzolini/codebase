set lock_timeout = '10s';

set statement_timeout = '5min';

drop index caelundas.calendar_event_facts_row_key;

drop index caelundas.calendar_event_facts_day;

drop index caelundas.calendar_event_facts_tag_day;

drop index caelundas.calendar_event_facts_root_day;

drop index caelundas.calendar_event_facts_depth_day;

drop index caelundas.calendar_event_facts_week_tag;

drop index caelundas.calendar_event_facts_month_tag;

drop index caelundas.calendar_event_facts_quarter_tag;

drop index caelundas.calendar_event_facts_year_tag;

drop index caelundas.calendar_event_facts_name_day;

drop index caelundas.calendar_event_facts_weekday_day;

drop index caelundas.calendar_event_facts_start;

drop index caelundas.calendar_event_facts_extent;

drop index caelundas.calendar_event_facts_tag_ids;

drop index caelundas.calendar_event_facts_direct_tag_ids;

delete from caelundas.typeorm_metadata
where "type" = $1 and "name" = $2 and "schema" = $3;

drop materialized view calendar_event_facts;

drop index caelundas.calendar_events_end;

drop index caelundas.calendar_events_location_start;
