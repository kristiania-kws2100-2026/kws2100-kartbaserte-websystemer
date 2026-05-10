import pg from "pg";
import {
  downloadZipToPostgresql,
  setupSysadm,
} from "./downloadZipToPostgresql.js";

export function setupDatabase(db: pg.Pool) {
  db.connect()
    .then((conn) => runDatabaseSetup(conn).then(() => conn.release()))
    .then(() => {});
}

async function runDatabaseSetup(conn: pg.PoolClient) {
  await setupSysadm(conn);
  await loadData(conn);
  await postTransform(conn);
  console.log("Load complete");
}

async function loadData(conn: pg.PoolClient) {
  async function download(prefix: string, url: string) {
    return downloadZipToPostgresql(conn, prefix, url);
  }
  async function determineSchema(prefix: string) {
    const { rows } = await conn.query(
      `select schema_name from information_schema.schemata where schema_name like $1`,
      [prefix + "%"],
    );
    if (rows.length !== 1) {
      throw Error(`${rows.length} schemas matching ${prefix}%`);
    }
    return rows[0].schema_name;
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
  async function loadMatrikkelen() {
    const tables = await conn.query(
      `select count(*)
       from information_schema.tables
       where table_schema = 'public'
         and table_name = 'vegadresse'`,
    );
    if (
      (await download(
        "matrikkelenadresse",
        "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_03_Oslo_25832_MatrikkelenAdresse_PostGIS.zip",
      )) ||
      tables.rows[0]?.count < 1
    ) {
      const schema = await determineSchema("matrikkelenadresse");
      const sqlStatements = [
        "drop table if exists staging.vegadresse",
        `
        create table staging.vegadresse
        as
        select adresseid,
               adressetekst,
               adressenavn,
               bokstav,
               nummer,
               representasjonspunkt,
               st_transform(representasjonspunkt, 4326) representasjonspunkt_4326,
               st_transform(representasjonspunkt, 3857) representasjonspunkt_3857
        from ${schema}.vegadresse
        `,
        "create index vegadresse_representasjonspunkt_3857_idx on staging.vegadresse using GIST (representasjonspunkt_3857)",
        "create index vegadresse_representasjonspunkt_4326_idx on staging.vegadresse using GIST (representasjonspunkt_4326)",
        "alter table staging.vegadresse add antall_bruksenhet int",
        `update staging.vegadresse a set antall_bruksenhet = (select count(*) from ${schema}.vegadresse_bruksenhetsnummertekst b where b.vegadresse_fk = a.adresseid)`,
        "alter table staging.vegadresse add bruksenheter_json jsonb",
        `update staging.vegadresse a set bruksenheter_json = (SELECT json_agg(bruksenhetsnummertekst) from ${schema}.vegadresse_bruksenhetsnummertekst b where b.vegadresse_fk = a.adresseid)`,
        "drop table if exists public.vegadresse",
        "alter table staging.vegadresse set schema public",
      ];
      for (const sql of sqlStatements) {
        console.log(new Date() + " Executing " + sql);
        await conn.query(sql);
      }
    }
  }

  return Promise.all([
    loadStemmekretser(),
    loadMatrikkelen(),
    loadGrunnskoler(),
  ]);
}

async function postTransform(conn: pg.PoolClient) {}
