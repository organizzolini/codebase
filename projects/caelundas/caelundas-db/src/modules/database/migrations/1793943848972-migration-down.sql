delete from "typeorm_metadata"
where "type" = 'VIEW' and "name" = 'calendar_events_derived';

drop view "calendar_events_derived";

drop table "constellation_line";

drop table "star";

drop table "constellation";

drop table "calendar_event_tag_nodes";

drop table "tag_nodes";

drop table "calendar_event_tags";

drop table "tags_closure";

drop table "tags";

drop table "calendar_events";
