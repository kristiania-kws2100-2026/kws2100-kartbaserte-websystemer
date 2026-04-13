## Lecture 12: Demonstration of deployment with database locally and on Render

These are the steps for this lecture:

1. [Create a React application](https://github.com/kristiania-kws2100-2026/kws2100-kartbaserte-websystemer/tree/main?tab=readme-ov-file#creating-a-react-application)
2. [Add OpenLayers map to the application](https://github.com/kristiania-kws2100-2026/kws2100-kartbaserte-websystemer/tree/main?tab=readme-ov-file#creating-a-react-application)
3. Declare the layers we want to import. This is the definition of the map object:
   ```tsx
   const map = new Map({
     layers: [
       new TileLayer({ source: new OSM() }),
       new VectorLayer({
         source: new VectorSource({
           url: "/api/grunnskole",
           format: new GeoJSON(),
         }),
       }),
       new VectorTileLayer({
         source: new VectorTileSource({
           url: "/api/adresser/{z}/{x}/{y}",
           format: new MVT(),
         }),
       }),
     ],
     view: new View({ center: [10.7, 59.9], zoom: 12 }),
   });
   ```
4. [Create a Hono server](https://github.com/kristiania-kws2100-2026/kws2100-kartbaserte-websystemer/tree/main?tab=readme-ov-file#creating-a-hono-application)
5. Connect the server to the database: Create a [docker-compose.yaml](https://github.com/kristiania-kws2100-2026/kws2100-kartbaserte-websystemer/tree/main?tab=readme-ov-file#starting-postgis-with-docker-compose)
   file and define the api endpoint in `server/server.ts`:

   ```ts
   const connectionString = "psql://postgres@localhost";
   const db = new pg.Pool({ connectionString });

   app.get("/api/grunnskole", async (c) => {
     const result = await db.query("select * from spatial_ref_sys");
     return c.json(result.rows);
   });
   ```

6. Download [grunnskoler from GeoNorge](https://github.com/kristiania-kws2100-2026/kws2100-kartbaserte-websystemer/tree/main?tab=readme-ov-file#importing-a-dataset-into-a-postgis-server-in-docker)
   - `npm install download-cli`
   - `npm pkg set scripts.db:load:docker="npm run db:grunnskoler:download && npm run db:grunnskoler:load:docker"`
   - `npm pkg set scripts.db:grunnskoler:download="download --extract --out tmp/ https://nedlasting.geonorge.no/geonorge/Befolkning/Grunnskoler/PostGIS/Befolkning_0000_Norge_25833_Grunnskoler_PostGIS.zip"`
   - `npm pkg set scripts.db:grunnskoler:load:docker="npm run db:psql:docker < tmp/Befolkning_0000_Norge_25833_Grunnskoler_PostGIS.sql"`
   - `npm pkg set scripts.db:psql:docker="docker exec -i /postgis /usr/bin/psql --user postgres`
7. Update `/api/grunnskole` to return GeoJSON:
   ```ts
   app.get("/api/grunnskole", async (c) => {
     const result = await db.query(`
       select skolenavn, organisasjonsnummer, antallelever, st_transform(posisjon, 4326)::json geometry
       from grunnskole
     `);
     return c.json({
       type: "FeatureCollection",
       features: result.rows.map(({ geometry, ...properties }) => ({
         type: "Feature",
         properties,
         geometry,
       })),
     });
   });
   ```
8. Make sure the application is ready to deploy:
   - `postinstall`, `build` and `start` scripts
   - serve `"../dist"` as static content: `app.use("*", serveStatic({ root: "../dist" }));`
   - Server uses environment variable for database: `const connectionString = process.env.DATABASE_URL || "psql://postgres@localhost"`
9. Create and connect Web service and Postgres on Render
10. Make sure to create and execute the `db:load:server` [script](https://github.com/kristiania-kws2100-2026/kws2100-kartbaserte-websystemer/tree/main?tab=readme-ov-file#importing-a-dataset-into-a-postgis-server-in-docker)
    - `npm pkg set scripts.db:load:server="npm run db:init:server && npm run db:grunnskoler:download && npm run db:grunnskoler:load:server"`
    - `npm pkg set scripts.db:init:server="echo create extension if not exists postgis | psql $DATABASE_URL"`
    - `npm pkg set scripts.db:grunnskoler:load:server="psql $DATABASE_URL < tmp/Befolkning_0000_Norge_25833_Grunnskoler_PostGIS.sql"`
11. Update render to run `db:load:server` at build (NB: You should probably remove this again after deploying to avoid double-loading the database)

### Exercise: Show addresses on map when the user zooms in

The `reference/12` branch contains code to load addresses from Matrikkelen and to request this data from the client.
Can you update the server to return the corresponding addresses from the database, but only when the user has zoomed in?
Use lecture 9 for inspiration.
