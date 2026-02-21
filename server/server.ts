import { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";

const postgresql = new pg.Pool({ user: "postgres", password: "password" });

const app = new Hono();

function toFeatureCollection(rows: (object & { geometry: any })[]) {
  return {
    type: "FeatureCollection",
    features: rows.map(
      ({ geometry: { coordinates, type }, ...properties }) => ({
        type: "Feature",
        properties,
        geometry: { coordinates, type },
      }),
    ),
  };
}

app.get("/api/grunnskoler", async (c) => {
  const result = await postgresql.query(
    `select a.navn, skolenavn, eierforhold, antallelever, posisjon::json as geometry
     from grunnskoler_1a0d38b7214c4b4fbd0bc9f3a77f3ad6.grunnskole s
            inner join fylker_ba7aea2735714391a98b1a585644e98a.fylke f on st_contains(f.omrade, s.posisjon)
            inner join fylker_ba7aea2735714391a98b1a585644e98a.administrativenhetnavn a on f.objid = a.fylke_fk
       and a.sprak = 'nor'
     where a.navn = 'Viken'`,
  );
  return c.json(toFeatureCollection(result.rows));
});
serve(app);
