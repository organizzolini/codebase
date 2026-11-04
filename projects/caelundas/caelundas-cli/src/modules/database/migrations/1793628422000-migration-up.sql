create table "star" (
    "hip" integer primary key not null,
    "right_ascension_hours" real not null,
    "declination_degrees" real not null,
    "magnitude" real not null,
    "color_index" real not null
);

create table "constellation" (
    "designation" text primary key not null,
    "name" text not null,
    "zodiac" boolean not null
);

create table "constellation_line" (
    "constellation_designation" text not null,
    "from_hip" integer not null,
    "to_hip" integer not null,
    constraint "FK_constellation_line_constellation" foreign key (
        "constellation_designation"
    ) references "constellation" (
        "designation"
    ) on delete cascade on update no action,
    constraint "FK_constellation_line_from_star" foreign key ("from_hip") references "star" (
        "hip"
    ) on delete cascade on update no action,
    constraint "FK_constellation_line_to_star" foreign key ("to_hip") references "star" (
        "hip"
    ) on delete cascade on update no action,
    primary key ("constellation_designation", "from_hip", "to_hip")
);

create index "constellation_line_from_hip" on "constellation_line" ("from_hip");

create index "constellation_line_to_hip" on "constellation_line" ("to_hip");
