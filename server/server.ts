import { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";

const app = new Hono();

const connectionString = "psql://postgres@localhost";
const db = new pg.Pool({ connectionString });

app.get("/api/grunnskole", async (c) => {
  const result = await db.query("select * from spatial_ref_sys");
  return c.json(result.rows);
});

serve(app);
