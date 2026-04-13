import { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";

const db = new pg.Pool({ connectionString: "psql://postgres@localhost" });

const app = new Hono();
app.get("/api/grunnskole", async (c) => {
  const result = await db.query(`
    select *
    from grunnskoler_ab90da242c084b34aaa0acfbbd6fada6.grunnskole
  `);
  return c.json(result.rows);
});

serve(app);
