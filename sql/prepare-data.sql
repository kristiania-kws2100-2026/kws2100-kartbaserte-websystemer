drop table if exists grunnskole;
create table grunnskole as select * from grunnskoler_26f23a96d4914f1dbde464c9bd921e8c.grunnskole;

drop table if exists kommune;
create table kommune as
    select *, st_transform(omrade, 4326) omrade_4326, st_transform(omrade, 3857) omrade_3857
    from kommuner_627ee106072240e99d2b21ec4717bf01.kommune;

drop table if exists vegadresse;
create table vegadresse
as
select adresseid,
       adressetekst,
       adressenavn,
       bokstav,
       nummer,
       representasjonspunkt,
       st_transform(representasjonspunkt, 4326) representasjonspunkt_4326,
       st_transform(representasjonspunkt, 3857) representasjonspunkt_3857
from matrikkelenadresse_af2184bd5ec443fe9796578813b45a76.vegadresse;

create index vegadresse_representasjonspunkt_3857_idx
    on vegadresse using GIST (representasjonspunkt_3857);
