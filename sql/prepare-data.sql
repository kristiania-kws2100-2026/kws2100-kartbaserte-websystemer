drop table if exists grunnkrets;

create table grunnkrets
as
select grunnkretsnummer,
       grunnkretsnavn,
       omrade,
       st_transform(omrade, 4326) omrade_4326
from grunnkretser_1bf5c617d90e489f99cd7b8052ee5aab.grunnkrets;
create index omraade_4326 on grunnkrets using gist(omrade_4326);

drop table if exists vegadresse;

create table vegadresse
as
select adresseid,
       adressetekst,
       st_transform(representasjonspunkt, 4326) representasjonspunkt_4326
from matrikkelenadresse_af2184bd5ec443fe9796578813b45a76.vegadresse;
create index representasjonspunkt_4326 on vegadresse using gist(representasjonspunkt_4326);

