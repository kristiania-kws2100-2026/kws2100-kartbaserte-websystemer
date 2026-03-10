import { Hono } from "hono";
import { serve } from "@hono/node-server";

import pg from "pg";
import { serveStatic } from "@hono/node-server/serve-static";

type FeatureRow = object & {
  geometry: { coordinates: any; type: string } & object;
};

const postgres = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://postgres@localhost",
});

const app = new Hono();

function toFeature({
  geometry: { type, coordinates },
  ...properties
}: FeatureRow) {
  return { type: "Feature", geometry: { type, coordinates }, properties };
}
function toFeatureCollection({ rows }: { rows: FeatureRow[] }) {
  return { type: "FeatureCollection", features: rows.map(toFeature) };
}

app.get("/api/grunnskole", async (c) =>
  c.json(
    toFeatureCollection(
      await postgres.query(
        "select skolenavn, posisjon_4326::json as geometry from grunnskole",
      ),
    ),
  ),
);

app.get("/api/grunnkrets/:z/:x/:y", async (c) => {
  const { x, y, z } = c.req.param();
  const result = await postgres.query(
    `
      with mvt
             as (select st_asmvtgeom(omrade_3857, st_tileenvelope($1, $2, $3)),
                        antall_adresser,
                        andel_med_skole_over_750m,
                        grunnkretsnavn,
                        grunnkretsnummer
                 from skolerapport
                 where omrade_3857 && st_tileenvelope($1, $2, $3))
      select st_asmvt(mvt.*)
      from mvt
    `,
    [z, x, y],
  );
  return c.body(result.rows[0].st_asmvt, 200, {
    "Content-Type": "application/vnd.mapbox-vector-tile",
  });
});
app.get("*", serveStatic({ root: "../dist" }));

serve(app);
