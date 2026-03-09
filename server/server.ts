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
function toFeatureCollection(rows: FeatureRow[]) {
  return { type: "FeatureCollection", features: rows.map(toFeature) };
}

app.get("/api/grunnkrets", async (c) => {
  const result = await postgres.query(
    "select omrade_4326::json geometry, grunnkretsnummer, grunnkretsnavn from grunnkrets",
  );
  return c.json(toFeatureCollection(result.rows));
});
app.get("*", serveStatic({ root: "../dist" }));

serve(app);
