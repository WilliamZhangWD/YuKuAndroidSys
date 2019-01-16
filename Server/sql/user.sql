drop table if exists user_basic_info;

create table user_basic_info
(
   user_id              varchar(50) not null,
   avatar               varchar(200),
   nickname             varchar(50),
   sex                  varchar(10),
   register_time        timestamp,
   lastest_logon_time   timestamp,
   language_id          varchar(20),
   award_points         bigint,
   sum_points           bigint,
   reported_times       int,
   primary key (user_id)
);
