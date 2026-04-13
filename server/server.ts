import { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

const connectionString =
  process.env.DATABASE_URL || "psql://postgres@localhost";
const db = new pg.Pool({ connectionString });

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
app.get("/api/adresser/:z/:x/:y", (c) => {
  const { z, x, y } = c.req.param();
  console.log("/api/addresser", { x, y, z });
  return c.newResponse("Not implemented", 500);
});

app.use("*", serveStatic({ root: "../dist" }));

serve(app);
