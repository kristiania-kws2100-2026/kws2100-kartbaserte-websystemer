import { Hono } from "hono";
import { serve } from "@hono/node-server";

import pg from "pg";
import { serveStatic } from "@hono/node-server/serve-static";

const MVT_CONTENT_TYPE = {
  "Content-Type": "application/vnd.mapbox-vector-tile",
};

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:@localhost/postgres";

const postgres = new pg.Pool({ connectionString });

const app = new Hono();
app.get("*", serveStatic({ root: "../dist" }));

function toFeature({ geometry, ...properties }: object & { geometry: object }) {
  return { type: "Feature", geometry, properties };
}

function toFeatureCollection(features: (object & { geometry: object })[]) {
  return { type: "FeatureCollection", features: features.map(toFeature) };
}

app.get("/api/grunnskoler", async (c) => {
  const result = await postgres.query(`
    select skolenavn, antallelever, posisjon::json geometry
    from grunnskole
  `);
  return c.json(toFeatureCollection(result.rows));
});
app.get("/api/kommuner", async (c) => {
  const result = await postgres.query(`
    select kommunenummer,
           kommunenavn,
           st_transform(st_simplify(omrade, 50), 4326)::json geometry
    from kommune
  `);
  return c.json(toFeatureCollection(result.rows));
});
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
  return c.body(result.rows[0].st_asmvt, 200, MVT_CONTENT_TYPE);
});

app.get("/api/vegadresse/:z/:x/:y", async (c) => {
  const { x, y, z } = c.req.param();
  const zoom = parseInt(z);
  if (zoom < 15) {
    const result = await postgres.query(
      `SELECT ST_AsMVT(tile, 'layer_name', 4096, 'geom') FROM (SELECT NULL::geometry AS geom WHERE FALSE) AS tile`,
    );
    return c.body(result.rows[0].st_asmvt, 200, MVT_CONTENT_TYPE);
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
    const result = await postgres.query(sql, [z, x, y]);
    return c.body(result.rows[0].st_asmvt, 200, MVT_CONTENT_TYPE);
  }
});

serve(app);
