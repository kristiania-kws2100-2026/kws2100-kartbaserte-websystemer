import { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";

const postgresql = new pg.Pool({ user: "postgres", password: "password" });

const app = new Hono();
app.get("/api/grunnskoler", async (c) => {
  const result = await postgresql.query(
    "select skolenavn, eierforhold, posisjon::json as geometry from grunnskoler_1a0d38b7214c4b4fbd0bc9f3a77f3ad6.grunnskole where eierforhold = 'Privat'",
  );
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
