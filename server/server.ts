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
    `
      with data
             as (select grunnkretsnummer,
                        grunnkretsnavn,
                        omrade_4326::json
                          as geometry,
                        (select count(*)
                         from vegadresse
                         where st_within(representasjonspunkt_4326, omrade_4326))
                          as antall_adresser,
                        (select count(*)
                         from vegadresse
                                left outer join grunnskole
                                                on st_dwithin(representasjonspunkt_25832, posisjon_25832, 500)
                         where st_within(representasjonspunkt_4326, omrade_4326)
                           and skolenavn is null)
                          as antall_med_skole_over_500m
                 from grunnkrets)
      select data.*, antall_med_skole_over_500m::float / antall_adresser andel_med_skole_over_500m
      from data
      where antall_adresser > 0
    `,
  );
  return c.json(toFeatureCollection(result.rows));
});
app.get("*", serveStatic({ root: "../dist" }));

serve(app);
