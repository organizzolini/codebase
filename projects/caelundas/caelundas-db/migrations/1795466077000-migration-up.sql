set lock_timeout = '10s';
set statement_timeout = '5min';

create table constellation_edges (
    constellation_designation text not null,
    from_hip bigint not null,
    to_hip bigint not null,
    constraint "PK_a32e2be764ccbe09e19f10384f1" primary key (constellation_designation, from_hip, to_hip)
);

create index constellation_edges_to_hip on constellation_edges (to_hip);

create index constellation_edges_from_hip on constellation_edges (from_hip);

insert into constellation_edges (constellation_designation, from_hip, to_hip)
select
    constellation_designation,
    from_hip,
    to_hip
from constellation_lines;

alter table constellation_edges add constraint "FK_04d68e2ee86feb8798df9881158" foreign key (
    constellation_designation
) references constellations (designation) on delete cascade on update no action;

alter table constellation_edges add constraint "FK_d952356fc9daa4133c753105b3c" foreign key (
    from_hip
) references stars (hip) on delete cascade on update no action;

alter table constellation_edges add constraint "FK_b82df4a773517d7ddf1b8b8df14" foreign key (
    to_hip
) references stars (hip) on delete cascade on update no action;

drop table constellation_lines;
