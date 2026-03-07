import { Hono } from "hono";
import { serve } from "@hono/node-server";

import pg from "pg";
import { serveStatic } from "@hono/node-server/serve-static";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:@localhost/postgres";

const postgres = new pg.Pool({ connectionString });

const app = new Hono();
app.get("*", serveStatic({ root: "../dist" }));
app.get("/api/grunnskoler", async (c) => {
  const result = await postgres.query(`
    select skolenavn,
           antallelever,
           st_transform(posisjon, 4326)::json geometry
    from grunnskoler_26f23a96d4914f1dbde464c9bd921e8c.grunnskole
  `);
  return c.json({
    type: "FeatureCollection",
    features: result.rows.map(({ geometry, ...properties }) => ({
      type: "Feature",
      properties,
      geometry,
    })),
  });
});
app.get("/api/kommuner", async (c) => {
  const result = await postgres.query(`
    select kommunenummer,
           kommunenavn,
           st_transform(st_simplify(omrade, 50), 4326)::json geometry
    from kommuner_627ee106072240e99d2b21ec4717bf01.kommune
  `);
  return c.json({
    type: "FeatureCollection",
    features: result.rows.map(({ geometry, ...properties }) => ({
      type: "Feature",
      properties,
      geometry,
    })),
  });
});

serve(app);
