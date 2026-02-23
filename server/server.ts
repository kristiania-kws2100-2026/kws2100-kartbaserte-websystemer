import { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";

const postgres = new pg.Pool({ user: "postgres" });

const app = new Hono();

app.get("/api/grunnskoler", async (c) => {
  const result = await postgres.query(
    `select skolenavn,
            antallelever,
            organisasjonsnummer,
            posisjon::json geometry
     from grunnskoler_1a0d38b7214c4b4fbd0bc9f3a77f3ad6.grunnskole`,
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
