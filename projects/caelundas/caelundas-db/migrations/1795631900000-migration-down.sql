set lock_timeout = '10s';

set statement_timeout = '5min';

create table tag_nodes (
    "depth" bigint not null,
    id uuid not null,
    "name" text not null,
    "path" text not null,
    root_id uuid not null,
    constraint "PK_334a646214f797b13a1b9f5ab57" primary key (id)
);

create table calendar_event_tag_nodes (
    calendar_event_id uuid not null,
    is_direct boolean not null,
    tag_depth bigint not null,
    tag_id uuid not null,
    tag_name text not null,
    tag_path text not null,
    tag_root_id uuid not null,
    constraint "PK_641ddfc9822887330f05ea3f224" primary key (calendar_event_id, tag_id)
);

create index calendar_event_tag_nodes_tag on calendar_event_tag_nodes (tag_id, calendar_event_id);

create index calendar_event_tag_nodes_event on calendar_event_tag_nodes (
    calendar_event_id, tag_root_id, tag_depth
);
