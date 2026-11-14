set lock_timeout = '10s';
set statement_timeout = '5m';

create table meanderaw.characteristic_value_counts (
    characteristic_id smallint not null,
    meander_count bigint not null,
    value double precision not null,
    constraint "PK_characteristic_value_counts" primary key (characteristic_id, value)
);

create table meanderaw.characteristic_pair_counts (
    characteristic_id smallint not null,
    meander_count bigint not null,
    other_characteristic_id smallint not null,
    other_value double precision not null,
    value double precision not null,
    constraint "PK_characteristic_pair_counts" primary key (characteristic_id, other_characteristic_id, other_value, value)
);

create table meanderaw.characteristic_shape_counts (
    characteristic_id smallint not null,
    columns bigint not null,
    lattice text not null,
    meander_count bigint not null,
    rows bigint not null,
    value double precision not null,
    constraint "PK_characteristic_shape_counts" primary key (characteristic_id, columns, lattice, rows, value)
);

create table meanderaw.shape_counts (
    columns bigint not null,
    lattice text not null,
    meander_count bigint not null,
    rows bigint not null,
    constraint "PK_shape_counts" primary key (columns, lattice, rows)
);
