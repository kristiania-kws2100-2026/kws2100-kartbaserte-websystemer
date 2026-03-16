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
       st_transform(representasjonspunkt, 25832) representasjonspunkt_25832,
       st_transform(representasjonspunkt, 3857) representasjonspunkt_3857
from matrikkelenadresse_f9082daf35784fad9a537c51fc86f0b1.vegadresse;
create index adresse_representasjonspunkt on vegadresse using gist(representasjonspunkt);
create index adresse_representasjonspunkt_25832 on vegadresse using gist(representasjonspunkt_25832);

drop table if exists grunnskole;
create table grunnskole
as
select organisasjonsnummer,
       skolenavn,
       st_transform(posisjon, 4326) posisjon_4326,
       st_transform(posisjon, 25832) posisjon_25832
from grunnskoler_e39212a4d48d4cf284c6f63f254a3d42.grunnskole;
create index grunnskole_posisisjon_4326 on grunnskole using gist(posisjon_4326);
create index grunnskole_posisisjon_25832 on grunnskole using gist(posisjon_25832);


create index grunnkrets_omrade on grunnkretser_1bf5c617d90e489f99cd7b8052ee5aab.grunnkrets using gist(omrade);

