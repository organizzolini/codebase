create table "tag_nodes" (
    "id" varchar primary key not null,
    "name" text not null,
    "depth" integer not null,
    "root_id" varchar not null,
    "path" text not null
);

create table "calendar_event_tag_nodes" (
    "calendar_event_id" varchar not null,
    "tag_id" varchar not null,
    "tag_name" text not null,
    "tag_depth" integer not null,
    "tag_root_id" varchar not null,
    "tag_path" text not null,
    "is_direct" integer not null,
    primary key ("calendar_event_id", "tag_id")
);

create index "calendar_event_tag_nodes_event" on "calendar_event_tag_nodes" (
    "calendar_event_id", "tag_root_id", "tag_depth"
);

create index "calendar_event_tag_nodes_tag" on "calendar_event_tag_nodes" ("tag_id", "calendar_event_id");

create index "calendar_events_start_end" on "calendar_events" ("start", "end");

create view "calendar_events_derived" as
select
    e.id,
    e.created_at,
    e.created_by,
    e.updated_at,
    e.updated_by,
    e.color,
    e.description,
    e."end",
    e.latitude,
    e.location,
    e.longitude,
    e."start",
    e.summary,
    e.timezone,
    cast(strftime('%Y', e."start") as integer) as start_year,
    cast(strftime('%m', e."start") as integer) as start_month,
    cast(strftime('%W', e."start") as integer) as start_week,
    cast(strftime('%w', e."start") as integer) as start_weekday,
    cast(strftime('%H', e."start") as integer) as start_hour,
    (strftime('%s', e."end") - strftime('%s', e."start")) / 60 as duration_minutes,
    case when e."start" = e."end" then 'Instant' else 'Duration' end as temporality,
    (cast(strftime('%m', e."start") as integer) + 2) / 3 as start_quarter,
    date(e."start") as start_day
from "calendar_events" as e;
