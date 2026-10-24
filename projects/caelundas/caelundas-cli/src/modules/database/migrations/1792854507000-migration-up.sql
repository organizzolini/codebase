set local lock_timeout = '10s';

set local statement_timeout = '5min';

create unique index calendar_events_key_next on calendar_events (
    "summary", "start", "end", latitude, longitude
);

alter table calendar_events drop constraint "calendar_events_natural_key";

alter table calendar_events add constraint calendar_events_natural_key unique using index calendar_events_key_next;
