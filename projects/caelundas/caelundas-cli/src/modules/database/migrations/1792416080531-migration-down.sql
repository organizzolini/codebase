set lock_timeout = '10s';
set statement_timeout = '5m';

alter table tags_closure drop constraint "FK_8a4bf589d19e5060d7ccbf1fd51";

alter table tags_closure drop constraint "FK_3f3680694135907038de253a57e";

alter table calendar_event_tags drop constraint "FK_6f0520ed07726fe729a882a6928";

alter table calendar_event_tags drop constraint "FK_146237171c57f84a0ff62036294";

alter table tags drop constraint "FK_bd19ddcde86ca1882599dbace11";

drop index caelundas."IDX_8a4bf589d19e5060d7ccbf1fd5";

drop index caelundas."IDX_3f3680694135907038de253a57";

drop table tags_closure;

drop index caelundas.calendar_event_tags_tag_id_calendar_event_id;

drop table calendar_event_tags;

drop index caelundas.tags_sibling_name;

drop index caelundas.tags_root_name;

drop table tags;

drop table calendar_events;
