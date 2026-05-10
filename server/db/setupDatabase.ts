import pg from "pg";
import {
  downloadZipToPostgresql,
  getSchemaName,
  setupSysadm,
} from "./downloadZipToPostgresql.js";
import { loadMatrikkelen } from "./loadMatrikkelen.js";

export function setupDatabase(db: pg.Pool) {
  db.connect()
    .then((conn) =>
      runDatabaseSetup(conn, db.options.connectionString!).then(() =>
        conn.release(),
      ),
    )
    .then(() => {});
}

async function runDatabaseSetup(conn: pg.PoolClient, connectionString: string) {
  await setupSysadm(conn);
  await loadData(conn, connectionString);
  console.log("Load complete");
}

async function loadData(conn: pg.PoolClient, connectionString: string) {
  async function download(prefix: string, url: string) {
    return downloadZipToPostgresql(conn, prefix, url, connectionString);
  }
  async function determineSchema(prefix: string) {
    return getSchemaName(conn, prefix);
  }

  async function loadStemmekretser() {
    const prefix = "stemmekretsermed2024inndeling";
    if (
      await download(
        prefix,
        "https://nedlasting.geonorge.no/geonorge/Basisdata/StemmekretserMed2024Inndeling/PostGIS/Basisdata_0000_Norge_25835_StemmekretserMed2024Inndeling_PostGIS.zip",
      )
    ) {
      const schema = await determineSchema(prefix);
      await conn.query(
        `
          drop table if exists staging.stemmekrets;
          create table staging.stemmekrets
          as
          select *
          from ${schema}.stemmekrets;

          drop table if exists stemmekrets;
          alter table staging.stemmekrets set schema public;
        `,
      );
    }
  }
  async function loadGrunnskoler() {
    if (
      await download(
        "grunnskoler",
        "https://nedlasting.geonorge.no/geonorge/Befolkning/Grunnskoler/PostGIS/Befolkning_0000_Norge_25833_Grunnskoler_PostGIS.zip",
      )
    ) {
      const schema = await determineSchema("grunnskoler");
      await conn.query(
        `
          drop table if exists staging.grunnskole;
          create table staging.grunnskole
          as
          select skolenavn,
                 organisasjonsnummer,
                 antallelever,
                 posisjon as                  posisjon_25833,
                 st_transform(posisjon, 4326) posisjon_4326
          from ${schema}.grunnskole;

          drop table if exists grunnskole;
          alter table staging.grunnskole set schema public;
        `,
      );
    }
  }

  return Promise.all([
    loadStemmekretser(),
    loadMatrikkelen(conn, connectionString),
    loadGrunnskoler(),
  ]);
}
