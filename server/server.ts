import { Hono } from "hono";
import { serve } from "@hono/node-server";

import pg from "pg";
import { serveStatic } from "@hono/node-server/serve-static";

const postgres = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://postgres@localhost",
});

const app = new Hono();
app.get("/api/grunnkrets/:z/:x/:y", async (c) => {
  const { x, y, z } = c.req.param();
  const result = await postgres.query(
    `
      with mvt
             as (select st_asmvtgeom(omrade_3857, st_tileenvelope($1, $2, $3)),
                        antall_adresser,
                        andel_med_skole_over_500m,
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
