drop table if exists session;

create table session
(
   user_id              varchar(50) not null,
   skey                 varchar(50),
   session_key          varchar(30),
   create_time          timestamp,
   last_login_time      timestamp,
   primary key (user_id)
);
