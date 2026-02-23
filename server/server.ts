import { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";

const postgres = new pg.Pool({ user: "postgres" });

const app = new Hono();

app.get("/api/grunnskoler", async (c) => {
  const result = await postgres.query(
    `select  skolenavn, eierforhold, antallelever, st_transform(posisjon, 4326)::json as geometry
     from
       grunnskoler_1a0d38b7214c4b4fbd0bc9f3a77f3ad6.grunnskole s
         inner join fylker_ba7aea2735714391a98b1a585644e98a.fylke f on st_contains(f.omrade, s.posisjon)
         join fylker_ba7aea2735714391a98b1a585644e98a.administrativenhetnavn a on f.objid = a.fylke_fk
         and a.sprak = 'nor'
     where a.navn = 'Viken'
`,
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
