import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();
app.get("/", (c) => c.text("Hello world"));
app.get("/api/grunnskoler", (c) =>
  c.json({
    type: "FeatureCollection",
  }),
);

serve(app);
