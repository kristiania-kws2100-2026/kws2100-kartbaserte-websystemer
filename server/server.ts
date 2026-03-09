import { Hono } from "hono";
import { serve } from "@hono/node-server";

import pg from "pg";
import { serveStatic } from "@hono/node-server/serve-static";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:@localhost/postgres";

const postgres = new pg.Pool({ connectionString });

const app = new Hono();
app.get("*", serveStatic({ root: "../dist" }));

function toGeoJSON(rows: (object & { geometry: object })[]) {
  return {
    type: "FeatureCollection",
    features: rows.map(({ geometry, ...properties }) => ({
      type: "Feature",
      properties,
      geometry,
    })),
  };
}

app.get("/api/grunnskoler", async (c) => {
  const result = await postgres.query(`
    select skolenavn,
           antallelever,
           st_transform(posisjon, 4326)::json geometry
    from grunnskoler_26f23a96d4914f1dbde464c9bd921e8c.grunnskole
  `);
  return c.json(toGeoJSON(result.rows));
});
app.get("/api/kommuner/:z/:x/:y", async (c) => {
  const { x, y, z } = c.req.param();
  const result = await postgres.query(
    `
    with mvt as (select kommunenavn,
                        kommunenummer,
                        st_asmvtgeom(omrade_3857, st_tileenvelope($1, $2, $3))
                 from kommune
                 where omrade_3857 && st_tileenvelope($1, $2, $3))
    select st_asmvt(mvt.*) from mvt
  `,
    [z, x, y],
  );
  return c.body(result.rows[0].st_asmvt, 200, {
    "Content-Type": "application/vnd.mapbox-vector-tile",
  });
});
app.get("/api/vegadresse/:z/:x/:y", async (c) => {
  const { x, y, z } = c.req.param();

  if (parseInt(z) < 15) {
    // return an empty mapbox vector tile response
    const result = await postgres.query(
      `SELECT ST_AsMVT(tile, 'layer_name', 4096, 'geom') FROM (SELECT NULL::geometry AS geom WHERE FALSE) AS tile`,
    );
    return c.body(result.rows[0].st_asmvt, 200, {
      "Content-Type": "application/vnd.mapbox-vector-tile",
    });
  }

  const result = await postgres.query(
    `
    with mvt as (select adresseid,
                        adressetekst,
                        st_asmvtgeom(representasjonspunkt_3857, st_tileenvelope($1, $2, $3))
                 from vegadresse
                 where representasjonspunkt_3857 && st_tileenvelope($1, $2, $3))
    select st_asmvt(mvt.*) from mvt
  `,
    [z, x, y],
  );
  return c.body(result.rows[0].st_asmvt, 200, {
    "Content-Type": "application/vnd.mapbox-vector-tile",
  });
});

serve(app);
