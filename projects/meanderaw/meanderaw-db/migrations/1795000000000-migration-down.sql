set lock_timeout = '10s';

set statement_timeout = '5min';

delete from aggregate_markers;

drop table characteristic_shape_counts;

drop table shape_counts;

create table characteristic_shape_counts (
    characteristic_id smallint not null,
    "columns" bigint not null,
    lattice text not null,
    meander_count bigint not null,
    "rows" bigint not null,
    "value" double precision not null,
    constraint "PK_characteristic_shape_counts" primary key (characteristic_id, "columns", lattice, "rows", "value")
);

create table shape_counts (
    "columns" bigint not null,
    lattice text not null,
    meander_count bigint not null,
    "rows" bigint not null,
    constraint "PK_shape_counts" primary key ("columns", lattice, "rows")
);
