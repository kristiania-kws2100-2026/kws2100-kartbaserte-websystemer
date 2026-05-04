import { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

const connectionString =
  process.env.DATABASE_URL || "psql://postgres@localhost";
const db = new pg.Pool({ connectionString });

type FeatureRow = object & { geometry: { type: string; coordinates: object } };

function toFeatureCollection(rows: FeatureRow[]) {
  return {
    type: "FeatureCollection",
    features: rows.map(
      ({ geometry: { type, coordinates }, ...properties }) => ({
        type: "Feature",
        properties,
        geometry: { type, coordinates },
      }),
    ),
  };
}

app.get("/api/grunnskole", async (c) => {
  const result = await db.query(`
    select skolenavn, organisasjonsnummer, antallelever, posisjon_4326::json geometry
    from grunnskole
  `);
  return c.json(toFeatureCollection(result.rows));
});

const MVT_CONTENT_TYPE = {
  "Content-Type": "application/vnd.mapbox-vector-tile",
};

app.post("/api/adresser", async (c) => {
  const geometry = await c.req.json();
  console.log(JSON.stringify(geometry));
  const result = await db.query(
    `
    select *
    from vegadresse
    where st_within(
            representasjonspunkt_4326,
            ST_geomfromgeojson($1)
          )
    limit 1001
  `,
    [geometry],
  );
  if (result.rowCount && result.rowCount > 1000) {
    return c.json({ error: "too many rows" });
  }
  return c.json({ adresser: result.rows });
});

app.get("/api/adresser/:z/:x/:y", async (c) => {
  const { x, y, z } = c.req.param();
  const zoom = parseInt(z);
  if (zoom < 15) {
    const result = await db.query(
      `SELECT ST_AsMVT(tile, 'layer_name', 4096, 'geom') FROM (SELECT NULL::geometry AS geom WHERE FALSE) AS tile`,
    );
    return c.body(result.rows[0].st_asmvt, 200, MVT_CONTENT_TYPE);
  } else {
    console.log("/api/adresser", { x, y, z });
    const sql = `
        WITH mvtgeom AS
                 (select adressetekst,
                         adresseid,
                         adressenavn,
                         bokstav,
                         nummer,
                         bruksenheter_json,
                         antall_bruksenhet,
                         st_asmvtgeom(
                                 representasjonspunkt_3857, st_tileenvelope($1, $2, $3)
                         ) as geometry
                  from vegadresse
                  where representasjonspunkt_3857 && st_tileenvelope($1, $2, $3))
        select st_asmvt(mvtgeom.*)
        from mvtgeom
    `;
    const result = await db.query(sql, [z, x, y]);
    return c.body(result.rows[0].st_asmvt, 200, MVT_CONTENT_TYPE);
  }
});

app.use("*", serveStatic({ root: "../dist" }));

serve(app);
