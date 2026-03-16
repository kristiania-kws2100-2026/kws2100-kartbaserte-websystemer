drop table if exists kommune;
create table kommune
as
select kommunenavn,
       kommunenummer,
       st_transform(omrade, 4326) omrade_4326,
       st_transform(omrade, 3857) omrade_3857
from kommuner_627ee106072240e99d2b21ec4717bf01.kommune;


drop table if exists vegadresse;
create table vegadresse
as
select adresseid,
       adressetekst,
       representasjonspunkt,
       st_transform(representasjonspunkt, 3857) representasjonspunkt_3857
from matrikkelenadresse_f9082daf35784fad9a537c51fc86f0b1.vegadresse;
create index adresse_representasjonspunkt on vegadresse using gist(representasjonspunkt);


create index grunnkrets_omrade on grunnkretser_1bf5c617d90e489f99cd7b8052ee5aab.grunnkrets using gist(omrade);

