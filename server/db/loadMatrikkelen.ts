import pg from "pg";
import {
  downloadZipToPostgresql,
  getSchemaName,
} from "./downloadZipToPostgresql.js";

const adresserPerFylke = {
  "03": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_03_Oslo_25833_MatrikkelenAdresse_PostGIS.zip",
  "11": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_11_Rogaland_25833_MatrikkelenAdresse_PostGIS.zip",
  "15": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_15_MoreogRomsdal_25832_MatrikkelenAdresse_PostGIS.zip",
  "18": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_18_Nordland_25833_MatrikkelenAdresse_PostGIS.zip",
  "21": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_21_Svalbard_25833_MatrikkelenAdresse_PostGIS.zip",
  "31": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_31_Ostfold_25833_MatrikkelenAdresse_PostGIS.zip",
  "32": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_32_Akershus_25833_MatrikkelenAdresse_PostGIS.zip",
  "33": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_33_Buskerud_25833_MatrikkelenAdresse_PostGIS.zip",
  "34": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_34_Innlandet_25833_MatrikkelenAdresse_PostGIS.zip",
  "39": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_39_Vestfold_25833_MatrikkelenAdresse_PostGIS.zip",
  "40": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_40_Telemark_25833_MatrikkelenAdresse_PostGIS.zip",
  "42": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_42_Agder_25833_MatrikkelenAdresse_PostGIS.zip",
  "46": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_46_Vestland_25833_MatrikkelenAdresse_PostGIS.zip",
  "50": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_50_Trondelag_25833_MatrikkelenAdresse_PostGIS.zip",
  "55": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_55_Troms_25833_MatrikkelenAdresse_PostGIS.zip",
  "56": "https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/PostGIS/Basisdata_56_Finnmark_25835_MatrikkelenAdresse_PostGIS.zip",
};

export async function loadMatrikkelen(
  conn: pg.PoolClient,
  connectionString: string,
) {
  async function loadFylke(key: string, url: string) {
    const tables = await conn.query(
      `select count(*)
       from information_schema.tables
       where table_schema = 'public'
         and table_name = 'vegadresse'`,
    );
    if (
      (await downloadZipToPostgresql(
        conn,
        "matrikkelenadresse",
        url,
        connectionString,
        "matrikkelenadresse" + "_" + key,
      )) ||
      tables.rows[0]?.count < 1
    ) {
      const schema = await getSchemaName(conn, "matrikkelenadresse");
      const sqlStatements = [
        `create table if not exists public.vegadresse
         (
           adresseid                 bigint,
           adressetekst              text,
           adressenavn               text,
           bokstav                   varchar,
           nummer                    integer,
           representasjonspunkt      geometry,
           fylke                     varchar,
           representasjonspunkt_4326 geometry,
           representasjonspunkt_3857 geometry,
           antall_bruksenhet         integer,
           bruksenheter_json         jsonb
         )`,
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
                 ${key} as fylke,
                 st_transform(representasjonspunkt, 4326) representasjonspunkt_4326,
                 st_transform(representasjonspunkt, 3857) representasjonspunkt_3857
          from ${schema}.vegadresse
        `,
        `create index if not exists bruksenhet on ${schema}.vegadresse_bruksenhetsnummertekst (vegadresse_fk)`,
        `create index if not exists vegadress on ${schema}.vegadresse (adresseid)`,
        "create index vegadresse_representasjonspunkt_3857_idx on staging.vegadresse using GIST (representasjonspunkt_3857)",
        "create index vegadresse_representasjonspunkt_4326_idx on staging.vegadresse using GIST (representasjonspunkt_4326)",
        "alter table staging.vegadresse add antall_bruksenhet int",
        `update staging.vegadresse a
         set antall_bruksenhet = (select count(*)
                                  from ${schema}.vegadresse_bruksenhetsnummertekst b
                                  where b.vegadresse_fk = a.adresseid)`,
        "alter table staging.vegadresse add bruksenheter_json jsonb",
        `update staging.vegadresse a
         set bruksenheter_json = (SELECT json_agg(bruksenhetsnummertekst)
                                  from ${schema}.vegadresse_bruksenhetsnummertekst b
                                  where b.vegadresse_fk = a.adresseid)`,
        `delete from public.vegadresse where fylke = '${key}'`,
        "insert into public.vegadresse select * from staging.vegadresse",
        `update sysadm.downloads set lasttransform = now() where key = '${"matrikkelenadresse" + "_" + key}'`,
        `drop schema ${schema} cascade`,
      ];
      for (const sql of sqlStatements) {
        console.log(new Date() + " Executing " + sql);
        await conn.query(sql);
      }
    }
  }

  for (const [key, url] of Object.entries(adresserPerFylke)) {
    await loadFylke(key, url);
  }
}
