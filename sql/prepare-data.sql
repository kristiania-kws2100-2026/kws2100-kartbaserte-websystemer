create table kommune
as select kommunenavn,
       kommunenummer,
       st_transform(omrade, 4326) omrade_4326,
       st_transform(omrade, 3857) omrade_3857
from kommuner_627ee106072240e99d2b21ec4717bf01.kommune;
