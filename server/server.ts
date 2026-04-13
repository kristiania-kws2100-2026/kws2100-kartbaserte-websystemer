import { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";

const db = new pg.Pool({ connectionString: "psql://postgres@localhost" });

const app = new Hono();
app.get("/api/kommuner", async (c) => {
  const result = await db.query("select * from spatial_ref_sys");
  return c.json(result.rows);
});

serve(app);
