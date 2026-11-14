set lock_timeout = '10s';
set statement_timeout = '5m';

create table meanderaw.aggregate_markers (
    id smallint not null,
    meander_count bigint not null,
    constraint "PK_aggregate_markers" primary key (id)
);
