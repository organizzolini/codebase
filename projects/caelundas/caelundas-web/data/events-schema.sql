-- The tables `database export --sqlite` writes from the `caelundas` schema:
-- the events, the tag tree as a closure table, and the join between them.
-- Timestamps are ISO 8601 text in UTC, the way the export maps
-- `timestamptz`. Only tests and the development build create them from
-- here; the real file arrives with its tables already in place.

create table calendar_events (
    id text primary key,
    created_at text not null,
    created_by text,
    updated_at text not null,
    updated_by text,
    color text,
    description text not null,
    "end" text not null,
    latitude real not null,
    "location" text,
    longitude real not null,
    "start" text not null,
    "summary" text not null,
    timezone text not null
);

create table tags (
    id text primary key,
    created_at text not null,
    created_by text,
    updated_at text not null,
    updated_by text,
    "name" text not null,
    parent_id text references tags (id)
);

create table tags_closure (
    id_ancestor text not null references tags (id),
    id_descendant text not null references tags (id),
    primary key (id_ancestor, id_descendant)
);

create table calendar_events_tags (
    calendar_event_id text not null references calendar_events (id),
    tag_id text not null references tags (id),
    primary key (calendar_event_id, tag_id)
);
