import { Hono } from "hono";
import { serve } from "@hono/node-server";

import pg from "pg";

type FeatureRow = object & { geometry: { coordinates: any } & object };

const postgres = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://postgres@localhost",
});

const app = new Hono();

function toFeature({ geometry: { coordinates }, ...properties }: FeatureRow) {
  return { type: "Feature", geometry: { coordinates }, properties };
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

serve(app);
