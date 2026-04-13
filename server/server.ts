import { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";

const app = new Hono();

const connectionString = "psql://postgres@localhost";
const db = new pg.Pool({ connectionString });

app.get("/api/grunnskole", async (c) => {
  const result = await db.query(
    `
      select skolenavn, organisasjonsnummer, antallelever, st_transform(posisjon, 4326)::json geometry
      from grunnskoler_ab90da242c084b34aaa0acfbbd6fada6.grunnskole
    `,
  );
  const features = result.rows.map(({ geometry, ...properties }) => ({
    type: "Feature",
    geometry,
    properties,
  }));
  return c.json({ type: "FeatureCollection", features });
});

serve(app);
