import { Hono } from "hono";
import { serve } from "@hono/node-server";

import pg from "pg";

const postgres = new pg.Pool({
  connectionString: "postgresql://postgres@localhost",
});

const app = new Hono();

type FeatureRow = object & { geometry: { coordinates: any } & object };

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
