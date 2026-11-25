set lock_timeout = '10s';

set statement_timeout = '5min';

alter table tags add icon text;

alter table tags add note text;

alter table tags add rank smallint not null default '0';
