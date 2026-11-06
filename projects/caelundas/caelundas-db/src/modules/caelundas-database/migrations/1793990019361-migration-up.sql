set lock_timeout = '10s';
set statement_timeout = '5m';

create table calendar_events (
    id uuid not null default uuidv7(),
    created_at timestamp with time zone not null default now(),
    created_by uuid,
    updated_at timestamp with time zone not null default now(),
    updated_by uuid,
    color text,
    description text not null,
    "end" timestamp with time zone not null,
    latitude numeric(9, 6) not null,
    "location" text,
    longitude numeric(9, 6) not null,
    "start" timestamp with time zone not null,
    "summary" text not null,
    timezone text not null,
    constraint calendar_events_natural_key unique ("summary", "start", "end", latitude, longitude),
    constraint "PK_faf5391d232322a87cdd1c6f30c" primary key (id)
);
comment on column calendar_events.id is 'Primary key, a uuidv7 the database assigns on insert';
comment on column calendar_events.created_at is 'Timestamp when the record was created';
comment on column calendar_events.created_by is 'Identifier of the user or process that created the record';
comment on column calendar_events.updated_at is 'Timestamp when the record was last updated';
comment on column calendar_events.updated_by is 'Identifier of the user or process that last updated the record';

create index calendar_events_start_end on calendar_events ("start", "end");

create table tags (
    id uuid not null default uuidv7(),
    created_at timestamp with time zone not null default now(),
    created_by uuid,
    updated_at timestamp with time zone not null default now(),
    updated_by uuid,
    "name" text not null,
    parent_id uuid,
    constraint "PK_e7dc17249a1148a1970748eda99" primary key (id)
);
comment on column tags.id is 'Primary key, a uuidv7 the database assigns on insert';
comment on column tags.created_at is 'Timestamp when the record was created';
comment on column tags.created_by is 'Identifier of the user or process that created the record';
comment on column tags.updated_at is 'Timestamp when the record was last updated';
comment on column tags.updated_by is 'Identifier of the user or process that last updated the record';

create unique index tags_root_name on tags ("name") where parent_id is NULL;

create unique index tags_sibling_name on tags (parent_id, "name") where parent_id is not NULL;

create table calendar_event_tags (
    calendar_event_id uuid not null,
    tag_id uuid not null,
    constraint "PK_e9cd6a8835a055d90f7d2df0ed7" primary key (calendar_event_id, tag_id)
);

create index calendar_event_tags_tag_id_calendar_event_id on calendar_event_tags (tag_id, calendar_event_id);

create table constellations (
    designation text not null,
    "name" text not null,
    zodiac boolean not null,
    constraint "PK_a2e3889182b012a788561333c5d" primary key (designation)
);

create table stars (
    color_index real not null,
    declination_degrees real not null,
    hip bigint not null,
    magnitude real not null,
    right_ascension_hours real not null,
    constraint "PK_9a548d1a5b2d84a2f12c46427d3" primary key (hip)
);

create table constellation_lines (
    constellation_designation text not null,
    from_hip bigint not null,
    to_hip bigint not null,
    constraint "PK_8b17475143b26888ce18b2ebc51" primary key (constellation_designation, from_hip, to_hip)
);

create index constellation_lines_to_hip on constellation_lines (to_hip);

create index constellation_lines_from_hip on constellation_lines (from_hip);

create table tags_closure (
    ancestor_id uuid not null,
    descendant_id uuid not null,
    constraint "PK_74a541ab48f1e2c9f148e9011fc" primary key (ancestor_id, descendant_id)
);

create index "IDX_3f3680694135907038de253a57" on tags_closure (ancestor_id);

create index "IDX_8a4bf589d19e5060d7ccbf1fd5" on tags_closure (descendant_id);

alter table tags add constraint "FK_bd19ddcde86ca1882599dbace11" foreign key (parent_id) references tags (
    id
) on delete cascade on update no action;

alter table calendar_event_tags add constraint "FK_146237171c57f84a0ff62036294" foreign key (
    calendar_event_id
) references calendar_events (id) on delete cascade on update no action;

alter table calendar_event_tags add constraint "FK_6f0520ed07726fe729a882a6928" foreign key (
    tag_id
) references tags (id) on delete cascade on update no action;

alter table constellation_lines add constraint "FK_cd94ca681020ea973ded017c089" foreign key (
    constellation_designation
) references constellations (designation) on delete cascade on update no action;

alter table constellation_lines add constraint "FK_cf2a9cc8a473723f68be0b40b41" foreign key (
    from_hip
) references stars (hip) on delete cascade on update no action;

alter table constellation_lines add constraint "FK_bd51ce53daefdc59902c12e31ae" foreign key (
    to_hip
) references stars (hip) on delete cascade on update no action;

alter table tags_closure add constraint "FK_3f3680694135907038de253a57e" foreign key (
    ancestor_id
) references tags (id) on delete cascade on update no action;

alter table tags_closure add constraint "FK_8a4bf589d19e5060d7ccbf1fd51" foreign key (
    descendant_id
) references tags (id) on delete cascade on update no action;
