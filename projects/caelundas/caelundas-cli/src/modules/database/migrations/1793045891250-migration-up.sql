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
where "parent_id" is NULL;

create unique index "tags_sibling_name" on "tags" ("parent_id", "name")
where "parent_id" is not NULL;

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
