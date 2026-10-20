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
    ancestor_id text not null references tags (id),
    descendant_id text not null references tags (id),
    primary key (ancestor_id, descendant_id)
);

create table calendar_event_tags (
    calendar_event_id text not null references calendar_events (id),
    tag_id text not null references tags (id),
    primary key (calendar_event_id, tag_id)
);
