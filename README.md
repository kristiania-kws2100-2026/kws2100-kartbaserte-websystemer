# Vector Tile Layers

The goal of this lecture is to optimize how much details are sent to the client by using tiles for a vector layer in the database.

The lecture builds on the code from lecture 8.

## Setup

To follow the lecture, you need the following:

1. Create a React application using Vite and Typescript
2. Create an OpenLayers map with an OpenStreetMap background map
3. Create a PostgreSQL database on Docker and import grunnskoler from Geonorge (see lecture 7)
4. Create a backend service with Hono that returns the schools from the database (see lecture 7)
5. (Optionally) Deploy the server and database to render.com to deploy the service to the internet (see lecture 8)

## Client

To create a vector tile layer for kommuner:

```tsx
const kommuneLayer = new VectorTileLayer({
  source: new VectorTileSource({
    url: "/api/kommuner/{z}/{x}/{y}",
    format: new MVT(),
  }),
});
```

`format: new MVT()` indicates Mapbox Vector Tiles - a binary format used for effective transmission of vector data.

This can be used the same way as other OpenLayers layers:

```tsx
const map = new Map({
  view: new View({ center: [11.07, 59.94], zoom: 13 }),
  layers: [new TileLayer({ source: new OSM() }), kommuneLayer, grunnskoleLayer],
});
```

When the user displays the map, OpenLayers will make requests like these as the user pans around on the map:

```plain
/api/kommuner/12/2173/1190
/api/kommuner/12/2174/1190
/api/kommuner/12/2173/1191
/api/kommuner/12/2174/1191
/api/kommuner/12/2172/1190
/api/kommuner/12/2175/1190
/api/kommuner/12/2172/1191
/api/kommuner/12/2175/1191
/api/kommuner/11/1086/595
/api/kommuner/11/1087/595
/api/kommuner/11/1085/595
/api/kommuner/11/1088/595
/api/kommuner/10/543/297
/api/kommuner/10/542/297
/api/kommuner/10/543/298
/api/kommuner/10/544/297
/api/kommuner/10/542/298
/api/kommuner/10/544/298
/api/kommuner/10/541/297
/api/kommuner/10/541/298
/api/kommuner/10/540/297
/api/kommuner/10/540/298
```

The values after `/api/kommuner/` indicates the zoom level, x-coordinate and y-coordinate for the tile that OpenLayers requests.
By default, OpenLayers expects the tiles to be displayed in the web Mercator projection, also known as EPSG:3857

## Server

The /api/kommuner/ api endpoint can be implemented like this:

```ts
// Matches all requests starting with /api/kommuner with three values separated by slash
// for example /api/kommuner/10/541/297
app.get("/api/kommuner/:z/:x/:y", async (c) => {
  // extracts the values from the request URL.
  // For example, for the request /api/kommuner/10/541/297, z = 10, x = 541, y = 297
  const { x, y, z } = c.req.param();
  const result = await postgres.query(
    // `with` queries create a temporary table with the select, in this case named `mvtgeom`
    // this table is created by querying kommuner
    // the term `geometry & st_tileenvelope($1, $2, $3)` matches all objects intersection with the requested tile
    // since the tiles are in web mercator (3857) projection, we have to transform kommune omrade to this projection
    // `st_asmvtgeom` transforms the geometry to MVT format
    // the outer query `st_asmvt` packs the result in a binary package
    `with mvtgeom as (select kommunenummer,
                             kommunenavn,
                             st_asmvtgeom(st_transform(omrade, 3857), st_tileenvelope($1, $2, $3))
                      from kommuner_627ee106072240e99d2b21ec4717bf01.kommune
                      where st_transform(omrade, 3857) && st_tileenvelope($1, $2, $3))
    select st_asmvt(mvtgeom.*) from mvtgeom
    `,
    [z, x, y],
  );
  return c.body(result.rows[0].st_asmvt, 200, {
    "Content-Type": "application/vnd.mapbox-vector-tile",
  });
});
```

## Prepare data

We can pre-transform data for the kommuner to simplify the SQL code and improve performance.

`sql/prepare-data.sql`

```sql
drop table if exists kommune;
create table kommune as
    select *, st_transform(omrade, 4326) omrade_4326, st_transform(omrade, 3857) omrade_3857
    from kommuner_627ee106072240e99d2b21ec4717bf01.kommune;
```

Using this, we can replace the SQL code in `server.ts`:

```ts
app.get("/api/kommuner/:z/:x/:y", async (c) => {
  const { x, y, z } = c.req.param();
  const result = await postgres.query(
    `with mvtgeom
            as (select kommunenummer, kommunenavn, st_asmvtgeom(omrade_3857, st_tileenvelope($1, $2, $3))
                from kommune
                where omrade_3857 && st_tileenvelope($1, $2, $3))
     select st_asmvt(mvtgeom.*)
     from mvtgeom
    `,
    [z, x, y],
  );
  return c.body(result.rows[0].st_asmvt, 200, {
    "Content-Type": "application/vnd.mapbox-vector-tile",
  });
});
```

## Data loading

Here is a partial version of the scripts in `package.json`

```json
{
  "db:load:server": "npm run db:postgis:install && npm run db:load:data:server && psql $DATABASE_URL < sql/prepare-data.sql",
  "db:postgis:install": "echo create extension if not exists postgis | psql $DATABASE_URL",
  "db:load:data:server": "npm run db:grunnskoler:download && npm run db:grunnskoler:load:server && npm run db:kommuner:download && npm run db:kommuner:load:server",
  "db:grunnskoler:load:server": "psql $DATABASE_URL < tmp/Befolkning_0000_Norge_25833_Grunnskoler_PostGIS.sql",
  "db:kommuner:load:server": "psql $DATABASE_URL < tmp/Basisdata_0000_Norge_25833_Kommuner_PostGIS.sql",
  "db:load": "npm run db:grunnskoler:download && npm run db:grunnskoler:load && npm run db:kommuner:download && npm run db:kommuner:load && npm run db:prepare:data",
  "db:grunnskoler:download": "download --out tmp --extract https://nedlasting.geonorge.no/geonorge/Befolkning/Grunnskoler/PostGIS/Befolkning_0000_Norge_25833_Grunnskoler_PostGIS.zip",
  "db:grunnskoler:load": "npm run psql:docker < tmp/Befolkning_0000_Norge_25833_Grunnskoler_PostGIS.sql",
  "db:kommuner:download": "download --out tmp --extract https://nedlasting.geonorge.no/geonorge/Basisdata/Kommuner/PostGIS/Basisdata_0000_Norge_25833_Kommuner_PostGIS.zip",
  "db:kommuner:load": "npm run psql:docker < tmp/Basisdata_0000_Norge_25833_Kommuner_PostGIS.sql",
  "db:prepare:data": "npm run psql:docker < sql/prepare-data.sql",
  "psql:docker": "docker exec -i kws2100_database psql --user postgres"
}
```

## Only loading data when zooming in

When loading something like [residential buildings](https://kartkatalog.geonorge.no/metadata/matrikkelen-adresse/f7df7a18-b30f-4745-bd64-d0863812350c)
it's not enough to simplify the data as we zoom out. We should instead only load data when the user
zooms to a level where the data won't overload the client and network

```ts
app.get("/api/vegadresse/:z/:x/:y", async (c) => {
  const { x, y, z } = c.req.param();
  const zoom = parseInt(z);
  // when the zoom level isn't high enough...
  if (zoom < 16) {
    // return an empty mapbox vector tile response
    const result = await postgresql.query(
      `SELECT ST_AsMVT(tile, 'layer_name', 4096, 'geom') FROM (SELECT NULL::geometry AS geom WHERE FALSE) AS tile`,
    );
    return c.body(result.rows[0].st_asmvt, 200, {
      "Content-Type": "application/vnd.mapbox-vector-tile",
    });
  } else {
    const sql = `
        WITH mvtgeom AS
                 (select adressetekst,
                         st_asmvtgeom(
                                 representasjonspunkt_3857, st_tileenvelope($1, $2, $3)
                         ) as geometry
                  from vegadresse
                  where representasjonspunkt_3857 && st_tileenvelope($1, $2, $3))
        select st_asmvt(mvtgeom.*)
        from mvtgeom
    `;
    const result = await postgresql.query(sql, [z, x, y]);
    return c.body(result.rows[0].st_asmvt, 200, {
      "Content-Type": "application/vnd.mapbox-vector-tile",
    });
  }
});
```
