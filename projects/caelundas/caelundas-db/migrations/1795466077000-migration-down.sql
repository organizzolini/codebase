set lock_timeout = '10s';
set statement_timeout = '5min';

create table constellation_lines (
    constellation_designation text not null,
    from_hip bigint not null,
    to_hip bigint not null,
    constraint "PK_8b17475143b26888ce18b2ebc51" primary key (constellation_designation, from_hip, to_hip)
);

create index constellation_lines_to_hip on constellation_lines (to_hip);

create index constellation_lines_from_hip on constellation_lines (from_hip);

insert into constellation_lines (constellation_designation, from_hip, to_hip)
select
    constellation_designation,
    from_hip,
    to_hip
from constellation_edges;

alter table constellation_lines add constraint "FK_cd94ca681020ea973ded017c089" foreign key (
    constellation_designation
) references constellations (designation) on delete cascade on update no action;

alter table constellation_lines add constraint "FK_cf2a9cc8a473723f68be0b40b41" foreign key (
    from_hip
) references stars (hip) on delete cascade on update no action;

alter table constellation_lines add constraint "FK_bd51ce53daefdc59902c12e31ae" foreign key (
    to_hip
) references stars (hip) on delete cascade on update no action;

drop table constellation_edges;
