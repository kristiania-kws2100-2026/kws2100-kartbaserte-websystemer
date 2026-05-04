drop table if exists grunnskole;
create table grunnskole
as
select skolenavn,
       organisasjonsnummer,
       antallelever,
       posisjon as                  posisjon_25833,
       st_transform(posisjon, 4326) posisjon_4326
from grunnskoler_de5e26144c034cb3991be0aa693f3d01.grunnskole;


create index if not exists vegadresse_bruksnummer_fk on matrikkelenadresse_7747f3cba3fe4f07ba70800c1b75240a.vegadresse_bruksenhetsnummertekst (vegadresse_fk);

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
       st_transform(representasjonspunkt, 3857) representasjonspunkt_3857,
       (SELECT json_agg(bruksenhetsnummertekst)
        from matrikkelenadresse_7747f3cba3fe4f07ba70800c1b75240a.vegadresse_bruksenhetsnummertekst b
        where b.vegadresse_fk = a.adresseid)    bruksenheter_json,
       (select count(*)
        from matrikkelenadresse_7747f3cba3fe4f07ba70800c1b75240a.vegadresse_bruksenhetsnummertekst b
        where b.vegadresse_fk = a.adresseid) as antall_bruksenhet
from matrikkelenadresse_7747f3cba3fe4f07ba70800c1b75240a.vegadresse a;

create index vegadresse_representasjonspunkt_3857_idx
    on vegadresse using GIST (representasjonspunkt_3857);