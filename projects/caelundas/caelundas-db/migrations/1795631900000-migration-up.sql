set lock_timeout = '10s';

set statement_timeout = '5min';

drop index caelundas.calendar_event_tag_nodes_event;

drop index caelundas.calendar_event_tag_nodes_tag;

drop table calendar_event_tag_nodes;

drop table tag_nodes;
