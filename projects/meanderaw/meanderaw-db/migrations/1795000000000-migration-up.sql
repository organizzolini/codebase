set lock_timeout = '10s';
set statement_timeout = '5m';

delete from meanderaw.aggregate_markers;

drop table meanderaw.characteristic_shape_counts;

drop table meanderaw.shape_counts;

create table meanderaw.characteristic_shape_counts (
    characteristic_id smallint not null,
    "columns" bigint not null,
    meander_count bigint not null,
    "rows" bigint not null,
    "value" double precision not null,
    constraint "PK_characteristic_shape_counts" primary key (characteristic_id, "columns", "rows", "value")
);

create table meanderaw.shape_counts (
    "columns" bigint not null,
    meander_count bigint not null,
    "rows" bigint not null,
    constraint "PK_shape_counts" primary key ("columns", "rows")
);
