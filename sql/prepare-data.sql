create table kommune
as
select kommunenavn,
       kommunenummer,
       st_transform(omrade, 4326) omrade_4326,
       st_transform(omrade, 3857) omrade_3857
from kommuner_627ee106072240e99d2b21ec4717bf01.kommune;


create table vegadresse
as
select adresseid,
       adressetekst,
       representasjonspunkt,
       st_transform(representasjonspunkt, 3857) representasjonspunkt_3857
from matrikkelenadresse_d5bcd604e92f413aa72644c284cbfcff.vegadresse;
