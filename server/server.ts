import { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";

const db = new pg.Pool({ connectionString: "psql://postgres@localhost" });

const app = new Hono();
app.get("/api/grunnskole", async (c) => {
  const result = await db.query(`
    select skolenavn, organisasjonsnummer, antallelever, st_transform(posisjon, 4326)::json geometry
    from grunnskoler_ab90da242c084b34aaa0acfbbd6fada6.grunnskole
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
