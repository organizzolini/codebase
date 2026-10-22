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
    latitude numeric(8, 6) not null,
    "location" text,
    longitude numeric(9, 6) not null,
    "start" timestamp with time zone not null,
    "summary" text not null,
    timezone text not null,
    constraint calendar_events_natural_key unique ("summary", "start", latitude, longitude),
    constraint "PK_faf5391d232322a87cdd1c6f30c" primary key (id)
);
comment on column calendar_events.id is 'Primary key, a uuidv7 the database assigns on insert';
comment on column calendar_events.created_at is 'Timestamp when the record was created';
comment on column calendar_events.created_by is 'Identifier of the user or process that created the record';
comment on column calendar_events.updated_at is 'Timestamp when the record was last updated';
comment on column calendar_events.updated_by is 'Identifier of the user or process that last updated the record';
comment on column calendar_events.color is 'Color hint for calendar display';
comment on column calendar_events.description is 'Detailed description with additional context';
comment on column calendar_events."end" is 'When the event ends';
comment on column calendar_events.latitude is 'Observer latitude in degrees the event was computed for';
comment on column calendar_events."location" is 'Human-readable location of the event';
comment on column calendar_events.longitude is 'Observer longitude in degrees the event was computed for';
comment on column calendar_events."start" is 'When the event starts';
comment on column calendar_events."summary" is 'Brief event title shown in calendar views';
comment on column calendar_events.timezone is 'IANA timezone of the observer location, such as America/New_York';

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
comment on column tags."name" is 'The tag''s own label, unique among its siblings';
comment on column tags.parent_id is 'The tag this one refines, or null for the root of a dimension';

create unique index tags_root_name on tags ("name") where parent_id is NULL;

create unique index tags_sibling_name on tags (parent_id, "name") where parent_id is not NULL;

create table calendar_event_tags (
    calendar_event_id uuid not null,
    tag_id uuid not null,
    constraint "PK_e9cd6a8835a055d90f7d2df0ed7" primary key (calendar_event_id, tag_id)
);
comment on column calendar_event_tags.calendar_event_id is 'The event that carries the tag';
comment on column calendar_event_tags.tag_id is 'The tag the event carries';

create index calendar_event_tags_tag_id_calendar_event_id on calendar_event_tags (tag_id, calendar_event_id);

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

alter table tags_closure add constraint "FK_3f3680694135907038de253a57e" foreign key (
    ancestor_id
) references tags (id) on delete cascade on update no action;

alter table tags_closure add constraint "FK_8a4bf589d19e5060d7ccbf1fd51" foreign key (
    descendant_id
) references tags (id) on delete cascade on update no action;
