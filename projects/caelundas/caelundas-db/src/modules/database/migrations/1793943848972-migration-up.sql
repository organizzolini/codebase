create table "calendar_events" (
    "id" varchar primary key not null,
    "created_at" datetime not null default (datetime('now')),
    "created_by" text,
    "updated_at" datetime not null default (datetime('now')),
    "updated_by" text,
    "color" text,
    "description" text not null,
    "end" text not null,
    "latitude" text not null,
    "location" text,
    "longitude" text not null,
    "start" text not null,
    "summary" text not null,
    "timezone" text not null,
    constraint "calendar_events_natural_key" unique ("summary", "start", "end", "latitude", "longitude")
);

create index "calendar_events_start_end" on "calendar_events" ("start", "end");

create table "tags" (
    "id" varchar primary key not null,
    "created_at" datetime not null default (datetime('now')),
    "created_by" text,
    "updated_at" datetime not null default (datetime('now')),
    "updated_by" text,
    "name" text not null,
    "parent_id" varchar,
    constraint "FK_bd19ddcde86ca1882599dbace11" foreign key ("parent_id") references "tags" (
        "id"
    ) on delete cascade on update no action
);

create unique index "tags_root_name" on "tags" ("name")
where "parent_id" is null;

create unique index "tags_sibling_name" on "tags" ("parent_id", "name")
where "parent_id" is not null;

create table "tags_closure" (
    "ancestor_id" varchar not null,
    "descendant_id" varchar not null,
    constraint "FK_3f3680694135907038de253a57e" foreign key ("ancestor_id") references "tags" (
        "id"
    ) on delete cascade on update no action,
    constraint "FK_8a4bf589d19e5060d7ccbf1fd51" foreign key ("descendant_id") references "tags" (
        "id"
    ) on delete cascade on update no action,
    primary key ("ancestor_id", "descendant_id")
);

create index "IDX_3f3680694135907038de253a57" on "tags_closure" ("ancestor_id");

create index "IDX_8a4bf589d19e5060d7ccbf1fd5" on "tags_closure" ("descendant_id");

create table "calendar_event_tags" (
    "calendar_event_id" varchar not null,
    "tag_id" varchar not null,
    constraint "FK_146237171c57f84a0ff62036294" foreign key ("calendar_event_id") references "calendar_events" (
        "id"
    ) on delete cascade on update no action,
    constraint "FK_6f0520ed07726fe729a882a6928" foreign key ("tag_id") references "tags" (
        "id"
    ) on delete cascade on update no action,
    primary key ("calendar_event_id", "tag_id")
);

create index "calendar_event_tags_tag_id_calendar_event_id" on "calendar_event_tags" ("tag_id", "calendar_event_id");

create table "tag_nodes" (
    "depth" integer not null,
    "id" varchar primary key not null,
    "name" text not null,
    "path" text not null,
    "root_id" varchar not null
);

create table "calendar_event_tag_nodes" (
    "calendar_event_id" varchar not null,
    "is_direct" integer not null,
    "tag_depth" integer not null,
    "tag_id" varchar not null,
    "tag_name" text not null,
    "tag_path" text not null,
    "tag_root_id" varchar not null,
    primary key ("calendar_event_id", "tag_id")
);

create index "calendar_event_tag_nodes_tag" on "calendar_event_tag_nodes" ("tag_id", "calendar_event_id");

create index "calendar_event_tag_nodes_event" on "calendar_event_tag_nodes" (
    "calendar_event_id", "tag_root_id", "tag_depth"
);

create table "constellation" (
    "designation" text primary key not null,
    "name" text not null,
    "zodiac" boolean not null
);

create table "star" (
    "color_index" real not null,
    "declination_degrees" real not null,
    "hip" integer primary key not null,
    "magnitude" real not null,
    "right_ascension_hours" real not null
);

create table "constellation_line" (
    "constellation_designation" text not null,
    "from_hip" integer not null,
    "to_hip" integer not null,
    constraint "FK_44c1d010d6a201c746d8b9bd47e" foreign key ("constellation_designation") references "constellation" (
        "designation"
    ) on delete cascade on update no action,
    constraint "FK_18190fab7e5819ff6b0928ddcec" foreign key ("from_hip") references "star" (
        "hip"
    ) on delete cascade on update no action,
    constraint "FK_5d5ef48040ac098fd0daf18b27e" foreign key ("to_hip") references "star" (
        "hip"
    ) on delete cascade on update no action,
    primary key ("constellation_designation", "from_hip", "to_hip")
);

create index "constellation_line_to_hip" on "constellation_line" ("to_hip");

create index "constellation_line_from_hip" on "constellation_line" ("from_hip");

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

insert into "typeorm_metadata" ("type", "name", "value") values (
    'VIEW',
    'calendar_events_derived',
    'select
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
    cast(strftime(''%Y'', e."start") as integer) as start_year,
    cast(strftime(''%m'', e."start") as integer) as start_month,
    cast(strftime(''%W'', e."start") as integer) as start_week,
    cast(strftime(''%w'', e."start") as integer) as start_weekday,
    cast(strftime(''%H'', e."start") as integer) as start_hour,
    (strftime(''%s'', e."end") - strftime(''%s'', e."start")) / 60 as duration_minutes,
    case when e."start" = e."end" then ''Instant'' else ''Duration'' end as temporality,
    (cast(strftime(''%m'', e."start") as integer) + 2) / 3 as start_quarter,
    date(e."start") as start_day
from "calendar_events" as e'
);
