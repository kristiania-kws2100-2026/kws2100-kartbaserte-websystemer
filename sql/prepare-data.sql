drop table if exists grunnkrets;

create table grunnkrets
as
select grunnkretsnummer, grunnkretsnavn, omrade, st_transform(omrade, 4326) omrade_4326
from grunnkretser_1bf5c617d90e489f99cd7b8052ee5aab.grunnkrets;
