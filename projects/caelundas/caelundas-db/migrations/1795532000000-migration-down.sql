set lock_timeout = '10s';

set statement_timeout = '5min';

alter table tags drop column rank;

alter table tags drop column note;

alter table tags drop column icon;
