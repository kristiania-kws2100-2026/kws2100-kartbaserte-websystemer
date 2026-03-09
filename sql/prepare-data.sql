drop table if exists grunnkrets;

create table grunnkrets
as
select grunnkretsnummer,
       grunnkretsnavn,
       omrade,
       st_transform(omrade, 3857) omrade_3857,
       st_transform(omrade, 25832) omrade_25832,
       st_transform(omrade, 4326) omrade_4326
from grunnkretser_1bf5c617d90e489f99cd7b8052ee5aab.grunnkrets;
create index omrade_3857 on grunnkrets using gist(omrade_3857);
create index omrade_25832 on grunnkrets using gist(omrade_25832);
create index omraade_4326 on grunnkrets using gist(omrade_4326);

drop table if exists vegadresse;

create table vegadresse
as
select adresseid,
       adressetekst,
       st_transform(representasjonspunkt, 25832) representasjonspunkt_25832,
       st_transform(representasjonspunkt, 4326) representasjonspunkt_4326
from matrikkelenadresse_af2184bd5ec443fe9796578813b45a76.vegadresse;
create index representasjonspunkt_25832 on vegadresse using gist(representasjonspunkt_25832);
create index representasjonspunkt_4326 on vegadresse using gist(representasjonspunkt_4326);

drop table if exists grunnskole;

create table grunnskole
as
    select skolenavn,
           antallelever,
           st_transform(posisjon, 25832) posisjon_25832,
           st_transform(posisjon, 4326) posisjon_4326
from grunnskoler_975aa91a5d8e4069a0eaebe131408ff8.grunnskole;
create index posisjon_25832 on grunnskole using gist(posisjon_25832);
create index posisjon_4326 on grunnskole using gist(posisjon_4326);

drop table if exists skolerapport;

create table skolerapport
as
with data
         as (select grunnkretsnummer,
                    grunnkretsnavn,
                    omrade_3857,
                    (select count(*)
                     from vegadresse
                     where st_within(representasjonspunkt_4326, omrade_4326))
                        as antall_adresser,
                    (select count(*)
                     from vegadresse
                              left outer join grunnskole
                                              on st_dwithin(representasjonspunkt_25832, posisjon_25832, 500)
                     where st_within(representasjonspunkt_4326, omrade_4326)
                       and skolenavn is null)
                        as antall_med_skole_over_500m
             from grunnkrets)
select data.*, antall_med_skole_over_500m::float / antall_adresser andel_med_skole_over_500m
from data where antall_adresser > 0;
