import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();
app.get("/api/kommuner", (c) => c.json({ hello: "world" }));

serve(app);
